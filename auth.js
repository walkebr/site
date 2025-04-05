// Sistema de Autenticação para o Renovame SaaS

// Importar configurações
const AUTH_CONFIG = window.CONFIG ? window.CONFIG.AUTH : {};
const STORAGE_CONFIG = window.CONFIG ? window.CONFIG.STORAGE : {};
const SUBSCRIPTION_PLANS = window.CONFIG ? window.CONFIG.SUBSCRIPTION_PLANS : {};

// Estado da autenticação
let currentUser = null;
let authToken = null;

// Inicializar autenticação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há um token salvo
    checkAuthStatus();
});

// Verificar status de autenticação
function checkAuthStatus() {
    const savedToken = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const savedUser = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    
    if (savedToken && savedUser) {
        try {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            
            // Atualizar UI com informações do usuário
            updateUserInterface();
            
            // Verificar se o token ainda é válido (simulado)
            validateToken();
            
            return true;
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            logout();
            return false;
        }
    }
    
    // Se não estiver na página de login, redirecionar
    if (!window.location.href.includes('login.html') && 
        !window.location.href.includes('register.html') && 
        !window.location.href.includes('landing.html')) {
        window.location.href = 'login.html';
    }
    
    return false;
}

// Validar token (simulado)
function validateToken() {
    // Em um ambiente real, isso faria uma chamada à API
    // para verificar se o token ainda é válido
    
    // Simulação: tokens expiram após 24 horas
    const userData = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY));
    if (userData && userData.lastLogin) {
        const lastLogin = new Date(userData.lastLogin);
        const now = new Date();
        const hoursSinceLogin = (now - lastLogin) / (1000 * 60 * 60);
        
        if (hoursSinceLogin > 24) {
            console.log('Token expirado');
            logout();
            return false;
        }
    }
    
    return true;
}

// Atualizar interface com dados do usuário
function updateUserInterface() {
    // Atualizar nome do usuário na sidebar
    const userNameElements = document.querySelectorAll('#user-name, #header-user-name');
    userNameElements.forEach(element => {
        if (element) element.textContent = currentUser.name;
    });
    
    // Atualizar plano do usuário
    const userPlanElement = document.getElementById('user-plan');
    if (userPlanElement && currentUser.subscription) {
        const planKey = currentUser.subscription.plan;
        const planName = SUBSCRIPTION_PLANS[planKey]?.name || 'Gratuito';
        userPlanElement.textContent = `Plano ${planName}`;
    }
    
    // Mostrar/esconder recursos premium baseado no plano do usuário
    togglePremiumFeatures();
}

// Mostrar/esconder recursos premium
function togglePremiumFeatures() {
    if (!currentUser || !currentUser.subscription) return;
    
    const userPlan = currentUser.subscription.plan;
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    
    premiumFeatures.forEach(feature => {
        const requiredPlan = feature.dataset.requiredPlan;
        
        // Verificar se o plano do usuário permite acesso a este recurso
        let hasAccess = false;
        
        switch(userPlan) {
            case 'ENTERPRISE':
                hasAccess = true;
                break;
            case 'PRO':
                hasAccess = requiredPlan !== 'ENTERPRISE';
                break;
            case 'BASIC':
                hasAccess = requiredPlan !== 'ENTERPRISE' && requiredPlan !== 'PRO';
                break;
            default: // FREE
                hasAccess = false;
        }
        
        // Aplicar classe para mostrar/esconder
        if (hasAccess) {
            feature.classList.remove('feature-locked');
        } else {
            feature.classList.add('feature-locked');
        }
    });
}

// Login de usuário
async function login(email, password) {
    try {
        // Em um ambiente real, isso faria uma chamada à API
        // Simulação de login
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }
        
        // Simulação de resposta da API
        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            phone: '',
            church: '',
            position: '',
            subscription: {
                plan: 'FREE',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
            },
            lastLogin: new Date().toISOString()
        };
        
        // Salvar dados do usuário
        authToken = 'token_' + Math.random().toString(36).substr(2, 16);
        currentUser = user;
        
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
        
        // Atualizar interface
        updateUserInterface();
        
        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Registro de novo usuário
async function register(name, email, password) {
    try {
        // Em um ambiente real, isso faria uma chamada à API
        // Simulação de registro
        if (!name || !email || !password) {
            throw new Error('Nome, email e senha são obrigatórios');
        }
        
        // Simulação de resposta da API
        const user = {
            id: 'user_' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            subscription: {
                plan: 'FREE',
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias de teste
            },
            lastLogin: new Date().toISOString()
        };
        
        // Salvar dados do usuário
        authToken = 'token_' + Math.random().toString(36).substr(2, 16);
        currentUser = user;
        
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, authToken);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
        
        // Atualizar interface
        updateUserInterface();
        
        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Logout
function logout() {
    // Limpar dados de autenticação
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    
    currentUser = null;
    authToken = null;
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
}

// Atualizar plano de assinatura
async function updateSubscription(plan) {
    try {
        if (!currentUser) {
            throw new Error('Usuário não autenticado');
        }
        
        // Em um ambiente real, isso faria uma chamada à API
        // Simulação de atualização de plano
        const user = {...currentUser};
        user.subscription = {
            plan: plan,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
        };
        
        // Atualizar dados do usuário
        currentUser = user;
        localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
        
        // Atualizar interface
        updateUserInterface();
        
        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error('Erro ao atualizar assinatura:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Verificar se o usuário tem acesso a um recurso específico
function hasAccess(requiredPlan) {
    if (!currentUser || !currentUser.subscription) return false;
    
    const userPlan = currentUser.subscription.plan;
    
    switch(userPlan) {
        case 'ENTERPRISE':
            return true;
        case 'PRO':
            return requiredPlan !== 'ENTERPRISE';
        case 'BASIC':
            return requiredPlan !== 'ENTERPRISE' && requiredPlan !== 'PRO';
        default: // FREE
            return requiredPlan === 'FREE';
    }
}

// Verificar limite de alunos baseado no plano
function checkStudentLimit(currentCount) {
    if (!currentUser || !currentUser.subscription) return false;
    
    const userPlan = currentUser.subscription.plan;
    const maxStudents = SUBSCRIPTION_PLANS[userPlan]?.maxStudents || 10;
    
    // Se o plano tem limite ilimitado
    if (maxStudents === 'Ilimitado') return true;
    
    return currentCount < maxStudents;
}

// Exportar funções
window.Auth = {
    login,
    register,
    logout,
    updateSubscription,
    hasAccess,
    checkStudentLimit,
    getCurrentUser: () => currentUser,
    isAuthenticated: () => !!currentUser
};