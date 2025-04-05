// Script para a página de Login/Registro do Renovame SaaS

// Elementos do DOM
let themeSwitch;
let tabButtons;
let tabPanes;
let loginForm;
let registerForm;
let togglePasswordButtons;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos do DOM
    initializeElements();
    
    // Configurar eventos
    setupEventListeners();
    
    // Verificar parâmetros da URL
    checkUrlParams();
});

// Inicializar elementos do DOM
function initializeElements() {
    themeSwitch = document.getElementById('theme-switch');
    tabButtons = document.querySelectorAll('.tab-btn');
    tabPanes = document.querySelectorAll('.tab-pane');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    // Carregar preferência de tema
    loadThemePreference();
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle do tema
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
    
    // Tabs de login/registro
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Toggle de visibilidade da senha
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });
    
    // Formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulário de registro
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Carregar preferência de tema
function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (themeSwitch) {
        themeSwitch.checked = darkMode;
    }
    
    if (!darkMode) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

// Toggle do tema
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

// Alternar entre tabs
function switchTab(tabName) {
    // Atualizar botões
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Atualizar conteúdo
    if (tabName === 'login') {
        document.getElementById('login-tab').classList.add('active');
        document.getElementById('register-tab').classList.remove('active');
    } else {
        document.getElementById('login-tab').classList.remove('active');
        document.getElementById('register-tab').classList.add('active');
    }
}

// Toggle de visibilidade da senha
function togglePasswordVisibility() {
    const passwordInput = this.previousElementSibling;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
}

// Verificar parâmetros da URL
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verificar se deve mostrar a tab de registro
    if (urlParams.get('tab') === 'register') {
        switchTab('register');
    }
    
    // Verificar se há um plano selecionado
    const selectedPlan = urlParams.get('plan');
    if (selectedPlan) {
        // Armazenar o plano selecionado para uso após o registro
        sessionStorage.setItem('selected_plan', selectedPlan);
    }
}

// Lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Mostrar indicador de carregamento
        showLoading(true);
        
        // Chamar a função de login do módulo de autenticação
        if (window.Auth) {
            const result = await window.Auth.login(email, password);
            
            if (result.success) {
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
            }
        } else {
            // Fallback se o módulo de autenticação não estiver disponível
            simulateLogin(email, password);
        }
    } catch (error) {
        showError('Ocorreu um erro ao processar o login. Tente novamente.');
        console.error('Erro de login:', error);
    } finally {
        showLoading(false);
    }
}

// Lidar com o registro
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validar formulário
    if (!name || !email || !password || !confirmPassword) {
        showError('Todos os campos são obrigatórios.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('As senhas não coincidem.');
        return;
    }
    
    if (!termsAccepted) {
        showError('Você precisa aceitar os termos de serviço.');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        showLoading(true);
        
        // Chamar a função de registro do módulo de autenticação
        if (window.Auth) {
            const result = await window.Auth.register(name, email, password);
            
            if (result.success) {
                // Verificar se há um plano selecionado
                const selectedPlan = sessionStorage.getItem('selected_plan');
                if (selectedPlan) {
                    // Atualizar plano do usuário
                    await window.Auth.updateSubscription(selectedPlan);
                    sessionStorage.removeItem('selected_plan');
                }
                
                // Redirecionar para o dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError(result.error || 'Erro ao criar conta. Tente novamente.');
            }
        } else {
            // Fallback se o módulo de autenticação não estiver disponível
            simulateRegister(name, email, password);
        }
    } catch (error) {
        showError('Ocorreu um erro ao processar o registro. Tente novamente.');
        console.error('Erro de registro:', error);
    } finally {
        showLoading(false);
    }
}

// Simulação de login (para desenvolvimento)
function simulateLogin(email, password) {
    console.log('Simulando login com:', email, password);
    
    // Simular atraso de rede
    setTimeout(() => {
        // Criar dados de usuário simulados
        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            subscription: {
                plan: 'FREE',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            lastLogin: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem('renovame_auth_token', 'token_' + Math.random().toString(36).substr(2, 16));
        localStorage.setItem('renovame_user_data', JSON.stringify(user));
        
        // Redirecionar para o dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Simulação de registro (para desenvolvimento)
function simulateRegister(name, email, password) {
    console.log('Simulando registro com:', name, email, password);
    
    // Simular atraso de rede
    setTimeout(() => {
        // Criar dados de usuário simulados
        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            subscription: {
                plan: 'FREE',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            lastLogin: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem('renovame_auth_token', 'token_' + Math.random().toString(36).substr(2, 16));
        localStorage.setItem('renovame_user_data', JSON.stringify(user));
        
        // Redirecionar para o dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

// Mostrar/esconder indicador de carregamento
function showLoading(show) {
    // Implementar indicador de carregamento
    // Por exemplo, desabilitar botões de submit e mostrar spinner
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    
    submitButtons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aguarde...';
        } else {
            button.disabled = false;
            button.innerHTML = button.closest('#login-form') ? 'Entrar' : 'Criar Conta';
        }
    });
}

// Mostrar mensagem de erro
function showError(message) {
    // Verificar se já existe um elemento de erro
    let errorElement = document.querySelector('.error-message');
    
    if (!errorElement) {
        // Criar elemento de erro
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        
        // Adicionar estilos inline
        errorElement.style.backgroundColor = 'rgba(211, 47, 47, 0.1)';
        errorElement.style.color = '#d32f2f';
        errorElement.style.padding = '10px 15px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.marginBottom = '20px';
        errorElement.style.fontSize = '0.9rem';
        errorElement.style.display = 'flex';
        errorElement.style.alignItems = 'center';
        errorElement.style.gap = '10px';
        
        // Adicionar ao formulário ativo
        const activeTab = document.querySelector('.tab-pane.active');
        if (activeTab) {
            const form = activeTab.querySelector('form');
            if (form) {
                form.insertBefore(errorElement, form.firstChild);
            }
        }
    }
    
    // Atualizar mensagem
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Remover após alguns segundos
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement);
        }
    }, 5000);
}