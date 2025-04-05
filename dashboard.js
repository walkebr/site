// Dashboard do Renovame SaaS

// Importar configurações
const DASHBOARD_CONFIG = window.CONFIG || {};

// Elementos do DOM
let sidebarToggle;
let themeSwitch;
let userDropdownBtn;
let logoutBtn;
let headerLogoutBtn;

// Dados simulados para o dashboard
const mockData = {
    users: [
        {
            id: 'user_1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
            plan: 'BASIC',
            status: 'active',
            registrationDate: '2023-05-15T10:30:00Z'
        },
        {
            id: 'user_2',
            name: 'Maria Oliveira',
            email: 'maria@exemplo.com',
            plan: 'PRO',
            status: 'active',
            registrationDate: '2023-06-20T14:45:00Z'
        },
        {
            id: 'user_3',
            name: 'Carlos Santos',
            email: 'carlos@exemplo.com',
            plan: 'FREE',
            status: 'inactive',
            registrationDate: '2023-04-10T09:15:00Z'
        },
        {
            id: 'user_4',
            name: 'Ana Pereira',
            email: 'ana@exemplo.com',
            plan: 'ENTERPRISE',
            status: 'active',
            registrationDate: '2023-07-05T16:20:00Z'
        },
        {
            id: 'user_5',
            name: 'Paulo Mendes',
            email: 'paulo@exemplo.com',
            plan: 'BASIC',
            status: 'active',
            registrationDate: '2023-06-30T11:10:00Z'
        }
    ],
    stats: {
        totalStudents: 156,
        activeUsers: 42,
        premiumUsers: 28,
        monthlyRevenue: 2890.50
    },
    growth: [
        { month: 'Jan', users: 10 },
        { month: 'Fev', users: 15 },
        { month: 'Mar', users: 20 },
        { month: 'Abr', users: 25 },
        { month: 'Mai', users: 35 },
        { month: 'Jun', users: 42 },
        { month: 'Jul', users: 50 }
    ],
    planDistribution: [
        { plan: 'Gratuito', count: 14 },
        { plan: 'Básico', count: 18 },
        { plan: 'Profissional', count: 8 },
        { plan: 'Empresarial', count: 2 }
    ]
};

// Inicializar dashboard
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
    
    // Carregar dados do dashboard
    loadDashboardData();
});

// Inicializar elementos do DOM
function initializeElements() {
    sidebarToggle = document.getElementById('toggle-sidebar');
    themeSwitch = document.getElementById('theme-switch');
    userDropdownBtn = document.querySelector('.user-dropdown-btn');
    logoutBtn = document.getElementById('logout-btn');
    headerLogoutBtn = document.getElementById('header-logout-btn');
    
    // Carregar preferência de tema
    loadThemePreference();
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle da sidebar
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Toggle do tema
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
    
    // Botões de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', handleLogout);
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

// Toggle da sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

// Lidar com logout
function handleLogout(e) {
    e.preventDefault();
    
    if (window.Auth) {
        window.Auth.logout();
    } else {
        // Fallback se o módulo de autenticação não estiver disponível
        localStorage.removeItem('renovame_auth_token');
        localStorage.removeItem('renovame_user_data');
        window.location.href = 'login.html';
    }
}

// Carregar dados do dashboard
function loadDashboardData() {
    // Em um ambiente real, isso faria chamadas à API
    // Simulação com dados mockados
    
    // Atualizar estatísticas
    updateStats(mockData.stats);
    
    // Atualizar tabela de usuários recentes
    updateRecentUsers(mockData.users);
    
    // Inicializar gráficos
    initCharts(mockData);
}

// Atualizar estatísticas
function updateStats(stats) {
    // Total de alunos
    const totalStudentsElement = document.getElementById('total-students-count');
    if (totalStudentsElement) {
        totalStudentsElement.textContent = stats.totalStudents;
    }
    
    // Usuários ativos
    const activeUsersElement = document.getElementById('active-users-count');
    if (activeUsersElement) {
        activeUsersElement.textContent = stats.activeUsers;
    }
    
    // Usuários premium
    const premiumUsersElement = document.getElementById('premium-users-count');
    if (premiumUsersElement) {
        premiumUsersElement.textContent = stats.premiumUsers;
    }
    
    // Receita mensal
    const revenueElement = document.getElementById('monthly-revenue');
    if (revenueElement) {
        revenueElement.textContent = `R$ ${stats.monthlyRevenue.toFixed(2).replace('.', ',')}`;
    }
}

// Atualizar tabela de usuários recentes
function updateRecentUsers(users) {
    const tableBody = document.getElementById('recent-users-table');
    if (!tableBody) return;
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Adicionar usuários à tabela
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Formatar data
        const registrationDate = new Date(user.registrationDate);
        const formattedDate = registrationDate.toLocaleDateString('pt-BR');
        
        // Determinar classe de status
        const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
        
        // Determinar nome do plano
        let planName = 'Gratuito';
        switch(user.plan) {
            case 'BASIC': planName = 'Básico'; break;
            case 'PRO': planName = 'Profissional'; break;
            case 'ENTERPRISE': planName = 'Empresarial'; break;
        }
        
        // Criar conteúdo da linha
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${planName}</td>
            <td><span class="status-badge ${statusClass}">${user.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
            <td>${formattedDate}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" title="Editar usuário" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" title="Excluir usuário" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Inicializar gráficos
function initCharts(data) {
    // Em um ambiente real, isso usaria uma biblioteca de gráficos como Chart.js
    // Simulação simples para demonstração
    
    // Gráfico de crescimento de usuários
    const usersGrowthChart = document.getElementById('users-growth-chart');
    if (usersGrowthChart) {
        let chartHtml = '<div class="simple-chart">';
        
        // Encontrar o valor máximo para escala
        const maxUsers = Math.max(...data.growth.map(item => item.users));
        
        // Criar barras para cada mês
        data.growth.forEach(item => {
            const percentage = (item.users / maxUsers) * 100;
            chartHtml += `
                <div class="chart-item">
                    <div class="chart-bar" style="height: ${percentage}%">
                        <span class="chart-value">${item.users}</span>
                    </div>
                    <div class="chart-label">${item.month}</div>
                </div>
            `;
        });
        
        chartHtml += '</div>';
        usersGrowthChart.innerHTML = chartHtml;
    }
    
    // Gráfico de distribuição de planos
    const plansDistributionChart = document.getElementById('plans-distribution-chart');
    if (plansDistributionChart) {
        let chartHtml = '<div class="donut-chart">';
        
        // Calcular total para percentagens
        const total = data.planDistribution.reduce((sum, item) => sum + item.count, 0);
        
        // Cores para cada plano
        const colors = {
            'Gratuito': '#6c757d',
            'Básico': '#007bff',
            'Profissional': '#28a745',
            'Empresarial': '#ff4a4a'
        };
        
        // Criar legenda
        chartHtml += '<div class="chart-legend">';
        data.planDistribution.forEach(item => {
            const percentage = ((item.count / total) * 100).toFixed(1);
            chartHtml += `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${colors[item.plan]}"></span>
                    <span class="legend-label">${item.plan}: ${percentage}% (${item.count})</span>
                </div>
            `;
        });
        chartHtml += '</div>';
        
        // Criar gráfico de rosca simples
        chartHtml += '<div class="donut-container">';
        let cumulativePercentage = 0;
        
        data.planDistribution.forEach(item => {
            const percentage = (item.count / total) * 100;
            const startAngle = cumulativePercentage * 3.6; // 3.6 graus por percentual (360/100)
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            
            chartHtml += `
                <div class="donut-segment" style="
                    background-color: ${colors[item.plan]};
                    transform: rotate(${startAngle}deg);
                    clip-path: polygon(50% 50%, 50% 0%, ${endAngle - startAngle <= 180 ? '100% 0%' : '100% 100%'}, 50% 50%);
                "></div>
            `;
            
            cumulativePercentage += percentage;
        });
        
        chartHtml += '</div></div>';
        plansDistributionChart.innerHTML = chartHtml;
    }
}

// Funções para ações da tabela de usuários
function editUser(userId) {
    // Em um ambiente real, isso abriria um modal para edição
    console.log(`Editar usuário: ${userId}`);
    alert(`Funcionalidade de edição de usuário será implementada em breve.`);
}

function deleteUser(userId) {
    // Em um ambiente real, isso pediria confirmação e faria uma chamada à API
    console.log(`Excluir usuário: ${userId}`);
    if (confirm(`Tem certeza que deseja excluir este usuário?`)) {
        alert(`Funcionalidade de exclusão de usuário será implementada em breve.`);
    }
}

// Adicionar estilos CSS para os gráficos simples
function addChartStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .simple-chart {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            height: 250px;
            padding: 20px 0;
        }
        
        .chart-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 40px;
        }
        
        .chart-bar {
            width: 30px;
            background-color: var(--primary-color);
            border-radius: 4px 4px 0 0;
            position: relative;
            min-height: 20px;
        }
        
        .chart-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 12px;
        }
        
        .chart-label {
            margin-top: 10px;
            font-size: 12px;
        }
        
        .donut-chart {
            display: flex;
            flex-direction: column;
            height: 250px;
            padding: 20px 0;
        }
        
        .chart-legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .legend-color {
            width: 15px;
            height: 15px;
            border-radius: 3px;
        }
        
        .donut-container {
            position: relative;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background-color: #333;
            margin: 0 auto;
            overflow: hidden;
        }
        
        .donut-segment {
            position: absolute;
            width: 100%;
            height: 100%;
            transform-origin: 50% 50%;
        }
        
        .status-badge {
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-active {
            background-color: rgba(40, 167, 69, 0.2);
            color: #28a745;
        }
        
        .status-inactive {
            background-color: rgba(108, 117, 125, 0.2);
            color: #6c757d;
        }
        
        .table-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-icon {
            background: none;
            border: none;
            color: var(--dark-text);
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        body.light-mode .btn-icon {
            color: var(--light-text);
        }
        
        .btn-icon:hover {
            color: var(--primary-color);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Adicionar estilos para os gráficos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', addChartStyles);