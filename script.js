// DOM Elements
const themeSwitch = document.getElementById('theme-switch');
const addStudentBtn = document.getElementById('add-student-btn');
const addStudentModal = document.getElementById('add-student-modal');
const studentDetailModal = document.getElementById('student-detail-modal');
const addStudentForm = document.getElementById('add-student-form');
const cancelAddBtn = document.getElementById('cancel-add');
const studentsList = document.getElementById('students-list');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterAge = document.getElementById('filter-age');
const photoInput = document.getElementById('student-photo');
const photoPreview = document.getElementById('photo-preview');
const updateStatusForm = document.getElementById('update-status-form');
const whatsappBtn = document.getElementById('whatsapp-btn');
const callBtn = document.getElementById('call-btn');
const deleteStudentBtn = document.getElementById('delete-student-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const cancelConfirmationBtn = document.getElementById('cancel-confirmation');
const confirmActionBtn = document.getElementById('confirm-action');
const absentStudentsEl = document.getElementById('absent-students');

// Stats Elements
const totalStudentsEl = document.getElementById('total-students');
const regularAttendanceEl = document.getElementById('regular-attendance');

// App State
let students = [];
let currentStudentId = null;
let actionType = null;

// Local Storage Configuration
const STORAGE_KEY = 'renovame_students_data';
const STORAGE_VERSION = '1.0';
const LAST_BACKUP_KEY = 'renovame_last_backup';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    setupEventListeners();
    loadStudents();
    showWelcomeMessage();
});

// Show welcome message with localStorage info
function showWelcomeMessage() {
    const lastBackup = localStorage.getItem(LAST_BACKUP_KEY);
    const formattedDate = lastBackup ? new Date(lastBackup).toLocaleString('pt-BR') : 'Nunca';
    
    // Verificar se é a primeira vez que o usuário acessa o sistema
    if (!localStorage.getItem(STORAGE_KEY)) {
        const message = `Bem-vindo ao Sistema de Gestão de Alunos Renovame!\n\nSeus dados serão armazenados localmente no seu navegador.\nRecomendamos fazer backups regularmente.`;
        setTimeout(() => alert(message), 1000);
    } else {
        const studentsCount = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').length;
        const message = `Dados carregados com sucesso!\n\nÚltimo backup: ${formattedDate}\nTotal de alunos: ${studentsCount}`;
        
        // Mostrar toast em vez de alert para não interromper o fluxo
        showToast(message, 'success');
    }
}

// Theme Toggle
function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (!darkMode) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeSwitch.checked = false;
    }
}

function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    themeSwitch.addEventListener('change', toggleTheme);

    // Add student button
    addStudentBtn.addEventListener('click', () => {
        addStudentModal.style.display = 'block';
        resetAddStudentForm();
    });
    
    // Export data button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Import data input
    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importData(e.target.files[0]);
                // Reset input value so the same file can be selected again
                e.target.value = '';
            }
        });
    }

    // Close modals when clicking on X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            addStudentModal.style.display = 'none';
            studentDetailModal.style.display = 'none';
            confirmationModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addStudentModal) {
            addStudentModal.style.display = 'none';
        }
        if (e.target === studentDetailModal) {
            studentDetailModal.style.display = 'none';
        }
        if (e.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });

    // Cancel add student
    cancelAddBtn.addEventListener('click', () => {
        addStudentModal.style.display = 'none';
    });

    // Add student form submission
    addStudentForm.addEventListener('submit', handleAddStudent);

    // Photo input change
    photoInput.addEventListener('change', handlePhotoChange);

    // Search and filter
    searchInput.addEventListener('input', renderStudents);
    filterStatus.addEventListener('change', renderStudents);
    filterAge.addEventListener('change', renderStudents);

    // Update status form submission
    updateStatusForm.addEventListener('submit', handleUpdateStatus);

    // WhatsApp button
    whatsappBtn.addEventListener('click', openWhatsApp);

    // Call button
    callBtn.addEventListener('click', makePhoneCall);

    // Delete student button
    deleteStudentBtn.addEventListener('click', confirmDeleteStudent);

    // Confirmation modal buttons
    cancelConfirmationBtn.addEventListener('click', () => {
        confirmationModal.style.display = 'none';
    });

    confirmActionBtn.addEventListener('click', executeConfirmedAction);
}

// Handle Photo Change
function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            photoPreview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Reset Add Student Form
function resetAddStudentForm() {
    addStudentForm.reset();
    photoPreview.innerHTML = `
        <i class="fas fa-camera"></i>
        <p>Clique para adicionar uma foto</p>
    `;
}

// Handle Add Student
function handleAddStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('student-name').value;
    const age = document.getElementById('student-age').value;
    const parentName = document.getElementById('parent-name').value;
    const contactNumber = document.getElementById('contact-number').value;
    const address = document.getElementById('address').value;
    const attendanceStatus = document.getElementById('attendance-status').value;
    const absenceReason = document.getElementById('absence-reason').value;
    const photoFile = document.getElementById('student-photo').files[0];
    
    // Create new student with basic info
    const newStudent = {
        id: Date.now().toString(),
        name,
        age,
        parentName,
        contactNumber,
        address,
        attendanceStatus,
        absenceReason,
        photo: null,
        attendanceHistory: [],
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // If photo exists, process it
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            newStudent.photo = event.target.result;
            
            // Add to students array
            students.push(newStudent);
            
            // Save to storage
            saveStudents();
            
            // Update UI
            updateStats();
            renderStudents();
            
            // Close modal
            addStudentModal.style.display = 'none';
        };
        reader.readAsDataURL(photoFile);
    } else {
        // Add to students array without photo
        students.push(newStudent);
        
        // Save to storage
        saveStudents();
        
        // Update UI
        updateStats();
        renderStudents();
        
        // Close modal
        addStudentModal.style.display = 'none';
    }
}

// Load Students from localStorage
function loadStudents() {
    const savedStudents = localStorage.getItem(STORAGE_KEY);
    if (savedStudents) {
        try {
            students = JSON.parse(savedStudents);
            updateStats();
            renderStudents();
        } catch (error) {
            console.error('Erro ao carregar dados do localStorage:', error);
            students = [];
            updateStats();
            renderStudents();
            showToast('Erro ao carregar dados. Iniciando com banco de dados vazio.', 'error');
        }
    } else {
        // Inicializa com array vazio se não houver dados
        students = [];
        updateStats();
        renderStudents();
    }
}

// Save Students to localStorage
function saveStudents() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
        localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
        showToast('Erro ao salvar dados. Verifique o espaço disponível no seu navegador.', 'error');
        return false;
    }
}

// Export data as JSON file
function exportData() {
    try {
        const dataStr = JSON.stringify({
            version: STORAGE_VERSION,
            timestamp: new Date().toISOString(),
            students: students
        });
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `renovame_alunos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Dados exportados com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar dados:', error);
        showToast('Erro ao exportar dados.', 'error');
    }
}

// Import data from JSON file
function importData(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validar versão e formato
            if (!importedData.version || !importedData.students) {
                throw new Error('Formato de arquivo inválido');
            }
            
            // Confirmar importação
            if (confirm(`Importar ${importedData.students.length} alunos? Isso substituirá todos os dados atuais.`)) {
                students = importedData.students;
                saveStudents();
                updateStats();
                renderStudents();
                showToast('Dados importados com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            showToast('Erro ao importar dados. Verifique se o arquivo está no formato correto.', 'error');
        }
    };
    
    reader.readAsText(file);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Update Stats
function updateStats() {
    const totalStudents = students.length;
    const regularStudents = students.filter(student => student.attendanceStatus === 'regular').length;
    const absentStudents = students.filter(student => student.attendanceStatus === 'absent').length;
    
    totalStudentsEl.textContent = totalStudents;
    regularAttendanceEl.textContent = regularStudents;
    absentStudentsEl.textContent = absentStudents;
}

// Render Students
function renderStudents() {
    // Clear current list
    studentsList.innerHTML = '';
    
    // Get filter values
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const ageFilter = filterAge.value;
    
    // Filter students
    let filteredStudents = students.filter(student => {
        // Search filter
        const matchesSearch = 
            student.name.toLowerCase().includes(searchTerm) ||
            student.parentName.toLowerCase().includes(searchTerm) ||
            student.contactNumber.includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || student.attendanceStatus === statusFilter;
        
        // Age filter
        let matchesAge = true;
        if (ageFilter !== 'all') {
            const age = parseInt(student.age);
            switch(ageFilter) {
                case '0-5':
                    matchesAge = age >= 0 && age <= 5;
                    break;
                case '6-10':
                    matchesAge = age >= 6 && age <= 10;
                    break;
                case '11-15':
                    matchesAge = age >= 11 && age <= 15;
                    break;
                case '16+':
                    matchesAge = age >= 16;
                    break;
            }
        }
        
        return matchesSearch && matchesStatus && matchesAge;
    });
    
    // Render each student
    if (filteredStudents.length === 0) {
        studentsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhum aluno encontrado</p>
            </div>
        `;
    } else {
        filteredStudents.forEach(student => {
            const studentCard = document.createElement('div');
            studentCard.className = 'student-card';
            studentCard.dataset.id = student.id;
            
            let photoHtml = '';
            if (student.photo) {
                photoHtml = `<img src="${student.photo}" alt="${student.name}">`;
            } else {
                photoHtml = `
                    <div class="no-photo">
                        <i class="fas fa-user"></i>
                    </div>
                `;
            }
            
            let statusClass = '';
            let statusText = '';
            
            switch(student.attendanceStatus) {
                case 'regular':
                    statusClass = 'regular';
                    statusText = 'Frequência Regular';
                    break;
                case 'irregular':
                    statusClass = 'irregular';
                    statusText = 'Frequência Irregular';
                    break;
                case 'absent':
                    statusClass = 'absent';
                    statusText = 'Ausente';
                    break;
            }
            
            studentCard.innerHTML = `
                <div class="student-photo">
                    ${photoHtml}
                </div>
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <p>${student.age} anos</p>
                    <p>Pai/Mãe: ${student.parentName}</p>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            `;
            
            studentCard.addEventListener('click', () => showStudentDetails(student.id));
            
            studentsList.appendChild(studentCard);
        });
    }
}

// Show Student Details
function showStudentDetails(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentStudentId = studentId;
    
    // Set student details
    document.getElementById('detail-student-name').textContent = student.name;
    document.getElementById('detail-student-age').textContent = student.age;
    document.getElementById('detail-parent-name').textContent = student.parentName || 'Não informado';
    document.getElementById('detail-contact-number').textContent = student.contactNumber || 'Não informado';
    document.getElementById('detail-address').textContent = student.address || 'Não informado';
    
    // Set student photo
    const detailStudentPhoto = document.getElementById('detail-student-photo');
    if (student.photo) {
        detailStudentPhoto.innerHTML = `<img src="${student.photo}" alt="${student.name}">`;
    } else {
        detailStudentPhoto.innerHTML = `
            <div class="no-photo">
                <i class="fas fa-user"></i>
            </div>
        `;
    }
    
    // Set status badge
    const statusBadge = document.getElementById('detail-student-status');
    let statusClass = '';
    let statusText = '';
    
    switch(student.attendanceStatus) {
        case 'regular':
            statusClass = 'regular';
            statusText = 'Frequência Regular';
            break;
        case 'irregular':
            statusClass = 'irregular';
            statusText = 'Frequência Irregular';
            break;
        case 'absent':
            statusClass = 'absent';
            statusText = 'Ausente';
            break;
    }
    
    statusBadge.innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
    
    // Set current status in update form
    document.getElementById('update-attendance-status').value = student.attendanceStatus;
    document.getElementById('update-absence-reason').value = student.absenceReason || '';
    document.getElementById('update-notes').value = student.notes || '';
    
    // Render attendance history
    renderAttendanceHistory(student);
    
    // Show modal
    studentDetailModal.style.display = 'block';
}

// Render Attendance History
function renderAttendanceHistory(student) {
    const historyContainer = document.getElementById('attendance-history');
    historyContainer.innerHTML = '';
    
    if (!student.attendanceHistory || student.attendanceHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">Nenhum histórico de frequência registrado.</p>';
        return;
    }
    
    // Sort history by date (newest first)
    const sortedHistory = [...student.attendanceHistory].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedHistory.forEach(entry => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let statusText = '';
        switch(entry.status) {
            case 'regular':
                statusText = 'Frequência Regular';
                break;
            case 'irregular':
                statusText = 'Frequência Irregular';
                break;
            case 'absent':
                statusText = 'Ausente';
                break;
        }
        
        historyItem.innerHTML = `
            <p class="date">${formattedDate}</p>
            <p class="status-change">Status: <strong>${statusText}</strong></p>
            ${entry.reason ? `<p class="reason">Motivo: ${entry.reason}</p>` : ''}
            ${entry.notes ? `<p class="notes">${entry.notes}</p>` : ''}
        `;
        
        historyContainer.appendChild(historyItem);
    });
}

// Handle Update Status
function handleUpdateStatus(e) {
    e.preventDefault();
    
    if (!currentStudentId) return;
    
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;
    
    const newStatus = document.getElementById('update-attendance-status').value;
    const absenceReason = document.getElementById('update-absence-reason').value;
    const notes = document.getElementById('update-notes').value;
    
    // Add to history only if status changed
    if (student.attendanceStatus !== newStatus || absenceReason || notes) {
        const historyEntry = {
            date: new Date().toISOString(),
            status: newStatus,
            reason: absenceReason,
            notes: notes
        };
        
        if (!student.attendanceHistory) {
            student.attendanceHistory = [];
        }
        
        student.attendanceHistory.push(historyEntry);
    }
    
    // Update student
    student.attendanceStatus = newStatus;
    student.absenceReason = absenceReason;
    student.notes = notes;
    student.updatedAt = new Date().toISOString();
    
    // Save changes
    saveStudents();
    
    // Update UI
    updateStats();
    renderStudents();
    
    // Update details view
    showStudentDetails(currentStudentId);
    
    // Show success message
    alert('Status atualizado com sucesso!');
}

// Open WhatsApp
function openWhatsApp() {
    if (!currentStudentId) return;
    
    const student = students.find(s => s.id === currentStudentId);
    if (!student || !student.contactNumber) return;
    
    // Format phone number (remove non-digits)
    let phoneNumber = student.contactNumber.replace(/\D/g, '');
    
    // Ensure it has country code
    if (!phoneNumber.startsWith('55')) {
        phoneNumber = '55' + phoneNumber;
    }
    
    // Create WhatsApp link
    const message = `Olá! Estamos entrando em contato sobre ${student.name} da igreja Renovame.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
}

// Make Phone Call
function makePhoneCall() {
    if (!currentStudentId) return;
    
    const student = students.find(s => s.id === currentStudentId);
    if (!student || !student.contactNumber) return;
    
    // Format phone number (remove non-digits)
    let phoneNumber = student.contactNumber.replace(/\D/g, '');
    
    // Create tel link
    const telUrl = `tel:${phoneNumber}`;
    
    // Open tel link
    window.location.href = telUrl;
}

// Confirm Delete Student
function confirmDeleteStudent() {
    if (!currentStudentId) return;
    
    const student = students.find(s => s.id === currentStudentId);
    if (!student) return;
    
    // Set confirmation message
    document.getElementById('confirmation-message').textContent = 
        `Tem certeza que deseja excluir o aluno ${student.name}? Esta ação não pode ser desfeita.`;
    
    // Set action type
    actionType = 'delete';
    
    // Show confirmation modal
    confirmationModal.style.display = 'block';
}

// Execute Confirmed Action
function executeConfirmedAction() {
    if (actionType === 'delete' && currentStudentId) {
        deleteStudent(currentStudentId);
    }
    
    // Hide confirmation modal
    confirmationModal.style.display = 'none';
    
    // Reset action type
    actionType = null;
}

// Delete Student
function deleteStudent(studentId) {
    // Remove student from array
    students = students.filter(student => student.id !== studentId);
    
    // Save changes
    saveStudents();
    
    // Update UI
    updateStats();
    renderStudents();
    
    // Close detail modal
    studentDetailModal.style.display = 'none';
    
    // Show success message
    alert('Aluno excluído com sucesso!');
}