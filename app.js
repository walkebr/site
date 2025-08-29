(function(){
  'use strict';

  const VERSION = 1;
  const STORAGE_KEY = 'gatilhoState';
  const pillars = ['Backlog','Despertar','Santidade','Influência','Obediência','Paixão','Coragem','Urgência','Concluído'];
  const defaultState = {
    version: VERSION,
    cards: [],
    diaries: [],
    ritual: {
      items: [
        {text:'Acordar', done:false},
        {text:'Orar', done:false},
        {text:'Planejar', done:false},
        {text:'Aprender', done:false}
      ],
      lastReset: new Date().toISOString().slice(0,10)
    },
    seedDone: false
  };

  let state = loadState();

  const board = document.getElementById('board');
  const searchInput = document.getElementById('search');
  const ritualList = document.getElementById('ritualList');
  const agendaList = document.getElementById('agendaList');
  const toastContainer = document.getElementById('toastContainer');
  const importFile = document.getElementById('importFile');

  pillars.forEach(p=>{
    const col = document.createElement('section');
    col.className = 'column';
    col.innerHTML = `<h3>${p}</h3><div class="column-cards" data-pilar="${p}"></div>`;
    board.appendChild(col);
  });

  function render(filter=''){
    renderCards(filter);
    renderRitual();
    renderAgenda();
  }

  function renderCards(filter){
    pillars.forEach(p=>{
      const container = board.querySelector(`.column-cards[data-pilar="${p}"]`);
      container.innerHTML = '';
      state.cards.filter(c => c.pilar === p && matchFilter(c, filter))
        .forEach(card=>{
          const div = document.createElement('div');
          div.className = 'card';
          div.draggable = true;
          div.dataset.id = card.id;
          div.innerHTML = `<strong>${card.title}</strong>`;
          div.addEventListener('dragstart', dragStart);
          div.addEventListener('click', ()=>openCardModal(card.id));
          container.appendChild(div);
        });
      container.addEventListener('dragover', dragOver);
      container.addEventListener('drop', dropCard);
    });
  }

  function matchFilter(card, term){
    if(!term) return true;
    term = term.toLowerCase();
    return card.title.toLowerCase().includes(term) ||
           (card.tags||[]).some(t=>t.toLowerCase().includes(term)) ||
           card.pilar.toLowerCase().includes(term);
  }

  function renderRitual(){
    ritualList.innerHTML = '';
    state.ritual.items.forEach((item,i)=>{
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox" data-index="${i}" ${item.done?'checked':''}> ${item.text}</label>`;
      ritualList.appendChild(li);
    });
  }

  function renderAgenda(){
    agendaList.innerHTML = '';
    const today = new Date();
    const seven = new Date();
    seven.setDate(today.getDate()+7);
    const upcoming = state.cards.filter(c=>c.datetime && new Date(c.datetime) >= today && new Date(c.datetime) <= seven)
      .sort((a,b)=>new Date(a.datetime) - new Date(b.datetime));
    upcoming.forEach(c=>{
      const li = document.createElement('li');
      li.textContent = `${new Date(c.datetime).toLocaleString()} - ${c.title}`;
      agendaList.appendChild(li);
    });
  }

  function checkDailyReset(){
    const todayStr = new Date().toISOString().slice(0,10);
    if(state.ritual.lastReset !== todayStr){
      state.ritual.items.forEach(i=>i.done=false);
      state.ritual.lastReset = todayStr;
      save();
    }
  }

  document.getElementById('newCardBtn').addEventListener('click', ()=>openCardModal());

  function openCardModal(id){
    const modal = document.getElementById('cardModal');
    modal.classList.add('open');
    const form = document.getElementById('cardForm');
    form.reset();
    form.dataset.id = id || '';
    const card = state.cards.find(c=>c.id === id);
    if(card){
      form.cardTitle.value = card.title;
      form.cardDesc.value = card.desc || '';
      form.cardPilar.value = card.pilar;
      form.cardPriority.value = card.priority || 'Média';
      form.cardDate.value = card.datetime ? card.datetime.slice(0,16) : '';
      form.cardTags.value = (card.tags||[]).join(',');
      renderSubtasks(card.subtasks || []);
    } else {
      renderSubtasks([]);
    }
    form.cardTitle.focus();
  }

  function renderSubtasks(subtasks){
    const list = document.getElementById('subtaskList');
    list.innerHTML = '';
    subtasks.forEach((s,i)=>{
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" ${s.done?'checked':''} data-index="${i}"><input type="text" value="${s.text}" data-index="${i}"><button type="button" data-remove="${i}">x</button>`;
      list.appendChild(li);
    });
  }

  document.getElementById('addSubtask').addEventListener('click', ()=>{
    const list = document.getElementById('subtaskList');
    const i = list.children.length;
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox" data-index="${i}"><input type="text" data-index="${i}"><button type="button" data-remove="${i}">x</button>`;
    list.appendChild(li);
  });

  document.getElementById('subtaskList').addEventListener('click', e=>{
    if(e.target.dataset.remove!=null){
      e.target.parentElement.remove();
    }
  });

  document.getElementById('cardCancel').addEventListener('click', ()=>closeModal('cardModal'));

  document.getElementById('cardForm').addEventListener('submit', e=>{
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id || uid();
    const subtasks = [...document.querySelectorAll('#subtaskList li')].map(li=>({
      text: li.querySelector('input[type=text]').value,
      done: li.querySelector('input[type=checkbox]').checked
    }));
    const card = {
      id,
      title: form.cardTitle.value,
      desc: form.cardDesc.value,
      pilar: form.cardPilar.value,
      priority: form.cardPriority.value,
      datetime: form.cardDate.value ? new Date(form.cardDate.value).toISOString() : null,
      tags: form.cardTags.value ? form.cardTags.value.split(',').map(t=>t.trim()).filter(Boolean) : [],
      subtasks
    };
    const idx = state.cards.findIndex(c=>c.id===id);
    if(idx>=0) state.cards[idx] = card; else state.cards.push(card);
    save();
    closeModal('cardModal');
    render(searchInput.value);
    toast('Card salvo');
  });

  function dragStart(e){
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
  }
  function dragOver(e){ e.preventDefault(); }
  function dropCard(e){
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const card = state.cards.find(c=>c.id === id);
    const pilar = e.currentTarget.dataset.pilar;
    card.pilar = pilar;
    if(pilar === 'Concluído') card.completedDate = new Date().toISOString();
    save();
    render(searchInput.value);
    toast('Card movido');
  }
  board.addEventListener('dragend', e=>{
    if(e.target.classList) e.target.classList.remove('dragging');
  });

  ritualList.addEventListener('change', e=>{
    const idx = e.target.dataset.index;
    state.ritual.items[idx].done = e.target.checked;
    if(state.ritual.items.every(i=>i.done)){
      localStorage.setItem('ritual_'+state.ritual.lastReset, 'true');
    } else {
      localStorage.removeItem('ritual_'+state.ritual.lastReset);
    }
    save();
  });

  document.getElementById('quickDiaryForm').addEventListener('submit', e=>{
    e.preventDefault();
    const title = document.getElementById('quickDiaryTitle').value;
    const text = document.getElementById('quickDiaryText').value;
    if(!text.trim()) return;
    state.diaries.push({id: uid(), date: new Date().toISOString(), title, text, tags: []});
    e.target.reset();
    save();
    toast('Diário salvo');
  });

  document.getElementById('newDiaryBtn').addEventListener('click', ()=>openDiaryModal());

  function openDiaryModal(){
    const modal = document.getElementById('diaryModal');
    modal.classList.add('open');
    const form = document.getElementById('diaryForm');
    form.reset();
    const select = form.diaryCard;
    select.innerHTML = '<option value="">Nenhum</option>' + state.cards.map(c=>`<option value="${c.id}">${c.title}</option>`).join('');
  }

  document.getElementById('diaryCancel').addEventListener('click', ()=>closeModal('diaryModal'));

  document.getElementById('diaryForm').addEventListener('submit', e=>{
    e.preventDefault();
    const form = e.target;
    const tags = [...form.querySelectorAll('input[type=checkbox]:checked')].map(c=>c.value);
    state.diaries.push({
      id: uid(),
      date: new Date().toISOString(),
      title: form.diaryTitle.value,
      text: form.diaryText.value,
      tags,
      cardId: form.diaryCard.value || null
    });
    save();
    closeModal('diaryModal');
    toast('Diário salvo');
  });

  document.getElementById('statsBtn').addEventListener('click', ()=>{
    const modal = document.getElementById('statsModal');
    modal.classList.add('open');
    const content = document.getElementById('statsContent');
    const counts = pillars.reduce((acc,p)=>{acc[p]=state.cards.filter(c=>c.pilar===p).length; return acc;},{});
    const completedWeek = state.cards.filter(c=>c.pilar==='Concluído').filter(c=>withinWeek(c.completedDate)).length;
    const streak = calcStreak();
    content.innerHTML = `<p>Cards por pilar:</p><ul>${Object.entries(counts).map(([p,v])=>`<li>${p}: ${v}</li>`).join('')}</ul><p>Concluídos nesta semana: ${completedWeek}</p><p>Streak Ritual: ${streak}</p>`;
  });

  function withinWeek(dateStr){
    if(!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate()-7);
    return d >= weekAgo && d <= now;
  }

  function calcStreak(){
    let streak = 0;
    let date = new Date();
    while(true){
      const ds = date.toISOString().slice(0,10);
      if(localStorage.getItem('ritual_'+ds) === 'true'){
        streak++;
        date.setDate(date.getDate()-1);
      } else {
        break;
      }
    }
    return streak;
  }

  document.getElementById('statsClose').addEventListener('click', ()=>closeModal('statsModal'));

  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(state)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gatilho.json';
    a.click();
    toast('Exportado');
  });

  document.getElementById('importBtn').addEventListener('click', ()=>importFile.click());
  importFile.addEventListener('change', e=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = evt=>{
      try{
        const data = JSON.parse(evt.target.result);
        if(data.version !== VERSION) data.version = VERSION;
        state.cards = state.cards.concat(data.cards || []);
        state.diaries = state.diaries.concat(data.diaries || []);
        save();
        render(searchInput.value);
        toast('Importado');
      }catch(err){
        toast('Erro na importação');
      }
    };
    reader.readAsText(file);
  });

  const body = document.body;
  const storedTheme = localStorage.getItem('theme');
  if(storedTheme === 'light') body.classList.add('light');
  document.getElementById('themeBtn').addEventListener('click', ()=>{
    body.classList.toggle('light');
    localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
  });

  searchInput.addEventListener('input', ()=>render(searchInput.value));

  document.addEventListener('keydown', e=>{
    if(e.target.matches('input,textarea')) return;
    if(e.key==='n' || e.key==='N') openCardModal();
    if(e.key==='j' || e.key==='J') openDiaryModal();
    if(e.key==='/'){ e.preventDefault(); searchInput.focus(); }
    if(e.key==='e' || e.key==='E') document.getElementById('exportBtn').click();
  });

  function toast(msg){
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = msg;
    toastContainer.appendChild(div);
    setTimeout(()=>div.remove(),4000);
  }

  function closeModal(id){
    document.getElementById(id).classList.remove('open');
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      try{
        const obj = JSON.parse(raw);
        if(obj.version !== VERSION) obj.version = VERSION;
        return obj;
      }catch(err){
        return JSON.parse(JSON.stringify(defaultState));
      }
    }else{
      const s = JSON.parse(JSON.stringify(defaultState));
      if(!s.seedDone) seed(s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
  }

  function seed(s){
    s.cards.push({id:uid(), title:'Bem-vindo', desc:'Exemplo de card', pilar:'Backlog', priority:'Média', datetime:null, tags:['exemplo'], subtasks:[]});
    s.diaries.push({id:uid(), date:new Date().toISOString(), title:'Primeira entrada', text:'Este é um exemplo.', tags:['Gratidão']});
    s.seedDone = true;
  }

  function uid(){
    return Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  }

  checkDailyReset();
  render();
  setInterval(checkDailyReset, 60000);
})();
