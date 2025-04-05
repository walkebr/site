// Script para a página de Perfil de Usuário do Renovame SaaS

// Elementos do DOM
let themeSwitch;
let sidebarToggle;
let userDropdownBtn;
let logoutBtn;
let headerLogoutBtn;
let profileForm;
let changePasswordForm;
let changeAvatarBtn;
let avatarModal;
let avatarUploadInput;
let avatarPreview;
let saveAvatarBtn;
let cancelAvatarBtn;
let togglePasswordButtons;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (window.Auth && !window.Auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Inicializar elementos do DOM
    initializeElements();
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar dados do perfil
    loadProfileData();
});

// Inicializar elementos do DOM
function initializeElements() {
    themeSwitch = document.getElementById('theme-switch');
    sidebarToggle = document.getElementById('toggle-sidebar');
    userDropdownBtn = document.querySelector('.user-dropdown-btn');
    logoutBtn = document.getElementById('logout-btn');
    headerLogoutBtn = document.getElementById('header-logout-btn');
    profileForm = document.getElementById('profile-form');
    changePasswordForm = document.getElementById('change-password-form');
    changeAvatarBtn = document.getElementById('change-avatar-btn');
    avatarModal = document.getElementById('avatar-modal');
    avatarUploadInput = document.getElementById('avatar-upload-input');
    avatarPreview = document.getElementById('avatar-preview');
    saveAvatarBtn = document.getElementById('save-avatar');
    cancelAvatarBtn = document.getElementById('cancel-avatar');
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
    
    // Toggle da sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('collapsed');
        });
    }
    
    // Dropdown do usuário no cabeçalho
    if (userDropdownBtn) {
        userDropdownBtn.addEventListener('click', () => {
            document.querySelector('.user-dropdown-content').classList.toggle('show');
        });
    }
    
    // Botões de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (window.Auth) window.Auth.logout();
        });
    }
    
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.Auth) window.Auth.logout();
        });
    }
    
    // Formulário de perfil
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Formulário de alteração de senha
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }
    
    // Botão de alterar avatar
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarModal.style.display = 'block';
        });
    }
    
    // Fechar modal de avatar
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            avatarModal.style.display = 'none';
        });
    });
    
    // Cancelar alteração de avatar
    if (cancelAvatarBtn) {
        cancelAvatarBtn.addEventListener('click', () => {
            avatarModal.style.display = 'none';
        });
    }
    
    // Preview de avatar
    if (avatarPreview) {
        avatarPreview.addEventListener('click', () => {
            avatarUploadInput.click();
        });
    }
    
    // Upload de avatar
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', handleAvatarPreview);
    }
    
    // Salvar avatar
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', handleAvatarSave);
    }
    
    // Toggle de visibilidade da senha
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });
    
    // Fechar dropdowns ao clicar fora
    window.addEventListener('click', (e) => {
        if (!e.target.matches('.user-dropdown-btn') && !e.target.matches('.user-dropdown-btn *')) {
            const dropdown = document.querySelector('.user-dropdown-content');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === avatarModal) {
            avatarModal.style.display = 'none';
        }
    });
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

// Carregar dados do perfil
function loadProfileData() {
    // Obter dados do usuário atual
    const userData = window.Auth ? window.Auth.getCurrentUser() : null;
    
    if (!userData) {
        console.error('Nenhum usuário autenticado');
        return;
    }
    
    // Preencher informações do perfil
    document.getElementById('profile-name').textContent = userData.name || 'Usuário';
    document.getElementById('profile-email').textContent = userData.email || 'email@exemplo.com';
    
    // Preencher formulário
    document.getElementById('profile-input-name').value = userData.name || '';
    document.getElementById('profile-input-email').value = userData.email || '';
    document.getElementById('profile-input-phone').value = userData.phone || '';
    document.getElementById('profile-input-church').value = userData.church || '';
    document.getElementById('profile-input-position').value = userData.position || '';
    
    // Atualizar badge de plano
    const planBadge = document.getElementById('profile-plan-badge');
    if (planBadge && userData.subscription) {
        const planKey = userData.subscription.plan;
        const planName = window.CONFIG.SUBSCRIPTION_PLANS[planKey]?.name || 'Gratuito';
        planBadge.textContent = `Plano ${planName}`;
    }
    
    // Atualizar detalhes do plano
    updatePlanDetails(userData.subscription?.plan || 'FREE');
    
    // Atualizar avatar se existir
    if (userData.avatar) {
        const profileAvatarImage = document.getElementById('profile-avatar-image');
        profileAvatarImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = userData.avatar;
        img.alt = 'Avatar do usuário';
        profileAvatarImage.appendChild(img);
    }
}

// Atualizar detalhes do plano
function updatePlanDetails(planKey) {
    const plans = window.CONFIG.SUBSCRIPTION_PLANS;
    const plan = plans[planKey] || plans.FREE;
    
    // Atualizar nome e preço do plano
    document.getElementById('plan-name').textContent = `Plano ${plan.name}`;
    
    const priceText = plan.price > 0 ? `R$ ${plan.price.toFixed(2)}/mês` : 'Gratuito';
    document.getElementById('plan-price').textContent = priceText;
    
    // Atualizar lista de recursos
    const featuresList = document.getElementById('plan-features-list');
    featuresList.innerHTML = '';
    
    plan.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Atualizar botão de upgrade
    const upgradeBtn = document.getElementById('upgrade-plan-btn');
    if (planKey === 'ENTERPRISE') {
        upgradeBtn.textContent = 'Você já possui o melhor plano';
        upgradeBtn.disabled = true;
    } else {
        upgradeBtn.textContent = 'Fazer Upgrade';
        upgradeBtn.disabled = false;
    }
}

// Lidar com atualização de perfil
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('profile-input-name').value;
    const phone = document.getElementById('profile-input-phone').value;
    const church = document.getElementById('profile-input-church').value;
    const position = document.getElementById('profile-input-position').value;
    
    try {
        // Mostrar indicador de carregamento
        showLoading(true);
        
        // Atualizar dados do usuário
        if (window.Auth) {
            const result = await window.Auth.updateProfile({
                name,
                phone,
                church,
                position
            });
            
            if (result.success) {
                showSuccess('Perfil atualizado com sucesso!');
                loadProfileData(); // Recarregar dados
            } else {
                showError(result.error || 'Erro ao atualizar perfil.');
            }
        } else {
            // Simulação para desenvolvimento
            simulateProfileUpdate({
                name,
                phone,
                church,
                position
            });
        }
    } catch (error) {
        showError('Ocorreu um erro ao atualizar o perfil.');
        console.error('Erro ao atualizar perfil:', error);
    } finally {
        showLoading(false);
    }
}

// Lidar com alteração de senha
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validar senhas
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('Todos os campos são obrigatórios.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('As novas senhas não coincidem.');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        showLoading(true);
        
        // Atualizar senha
        if (window.Auth) {
            const result = await window.Auth.changePassword(currentPassword, newPassword);
            
            if (result.success) {
                showSuccess('Senha alterada com sucesso!');
                changePasswordForm.reset();
            } else {
                showError(result.error || 'Erro ao alterar senha.');
            }
        } else {
            // Simulação para desenvolvimento
            simulatePasswordChange();
        }
    } catch (error) {
        showError('Ocorreu um erro ao alterar a senha.');
        console.error('Erro ao alterar senha:', error);
    } finally {
        showLoading(false);
    }
}

// Lidar com preview de avatar
function handleAvatarPreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
        showError('Por favor, selecione uma imagem válida.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        avatarPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = event.target.result;
        img.alt = 'Preview do avatar';
        avatarPreview.appendChild(img);
    };
    reader.readAsDataURL(file);
}

// Lidar com salvamento de avatar
async function handleAvatarSave() {
    const file = avatarUploadInput.files[0];
    if (!file) {
        showError('Por favor, selecione uma imagem.');
        return;
    }
    
    try {
        // Mostrar indicador de carregamento
        showLoading(true);
        
        // Converter imagem para base64 (simulação)
        const reader = new FileReader();
        reader.onload = async function(event) {
            const base64Image = event.target.result;
            
            // Atualizar avatar
            if (window.Auth) {
                const result = await window.Auth.updateAvatar(base64Image);
                
                if (result.success) {
                    showSuccess('Avatar atualizado com sucesso!');
                    avatarModal.style.display = 'none';
                    
                    // Atualizar avatar na página
                    const profileAvatarImage = document.getElementById('profile-avatar-image');
                    profileAvatarImage.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = base64Image;
                    img.alt = 'Avatar do usuário';
                    profileAvatarImage.appendChild(img);
                } else {
                    showError(result.error || 'Erro ao atualizar avatar.');
                }
            } else {
                // Simulação para desenvolvimento
                simulateAvatarUpdate(base64Image);
            }
            
            showLoading(false);
        };
        reader.readAsDataURL(file);
    } catch (error) {
        showError('Ocorreu um erro ao atualizar o avatar.');
        console.error('Erro ao atualizar avatar:', error);
        showLoading(false);
    }
}

// Simulação de atualização de perfil (para desenvolvimento)
function simulateProfileUpdate(profileData) {
    setTimeout(() => {
        // Obter dados atuais
        const userData = JSON.parse(localStorage.getItem(window.CONFIG.AUTH.USER_KEY) || '{}');
        
        // Atualizar dados
        const updatedUser = {
            ...userData,
            ...profileData
        };
        
        // Salvar dados atualizados
        localStorage.setItem(window.CONFIG.AUTH.USER_KEY, JSON.stringify(updatedUser));
        
        // Atualizar interface
        document.getElementById('profile-name').textContent = profileData.name;
        document.getElementById('user-name').textContent = profileData.name;
        document.getElementById('header-user-name').textContent = profileData.name;
        
        showSuccess('Perfil atualizado com sucesso!');
    }, 1000);
}

// Simulação de alteração de senha (para desenvolvimento)
function simulatePasswordChange() {
    setTimeout(() => {
        showSuccess('Senha alterada com sucesso!');
        changePasswordForm.reset();
    }, 1000);
}

// Simulação de atualização de avatar (para desenvolvimento)
function simulateAvatarUpdate(base64Image) {
    setTimeout(() => {
        // Obter dados atuais
        const userData = JSON.parse(localStorage.getItem(window.CONFIG.AUTH.USER_KEY) || '{}');
        
        // Atualizar avatar
        userData.avatar = base64Image;
        
        // Salvar dados atualizados
        localStorage.setItem(window.CONFIG.AUTH.USER_KEY, JSON.stringify(userData));
        
        // Atualizar interface
        const profileAvatarImage = document.getElementById('profile-avatar-image');
        profileAvatarImage.innerHTML = '';
        const img = document.createElement('img');
        img.src = base64Image;
        img.alt = 'Avatar do usuário';
        profileAvatarImage.appendChild(img);
        
        avatarModal.style.display = 'none';
        showSuccess('Avatar atualizado com sucesso!');
    }, 1000);
}

// Funções de UI
function showLoading(show) {
    // Implementar indicador de carregamento
    // Por exemplo, desabilitar botões de formulário
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.disabled = show;
        if (show) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        } else {
            button.textContent = button.dataset.originalText || 'Salvar';
        }
    });
}

function showSuccess(message) {
    // Implementar toast de sucesso
    alert(message); // Temporário
}

function showError(message) {
    // Implementar toast de erro
    alert(message); // Temporário
}