// Configurações do Micro-SaaS
const CONFIG = {
    // Informações do aplicativo
    APP_NAME: 'Renovame SaaS',
    APP_VERSION: '1.0.0',
    
    // Configurações de armazenamento
    STORAGE: {
        LOCAL_STORAGE_KEY: 'renovame_students_data',
        STORAGE_VERSION: '1.0',
        LAST_BACKUP_KEY: 'renovame_last_backup',
        CLOUD_ENABLED: false, // Será ativado quando o usuário fizer login
    },
    
    // Configurações de autenticação
    AUTH: {
        API_URL: 'https://api.renovamesaas.com', // URL fictícia para a API
        TOKEN_KEY: 'renovame_auth_token',
        USER_KEY: 'renovame_user_data',
    },
    
    // Planos de assinatura
    SUBSCRIPTION_PLANS: {
        FREE: {
            name: 'Gratuito',
            price: 0,
            maxStudents: 10,
            features: [
                'Gerenciamento básico de alunos',
                'Exportação de dados em JSON',
                'Armazenamento local',
            ],
        },
        BASIC: {
            name: 'Básico',
            price: 29.90,
            maxStudents: 50,
            features: [
                'Gerenciamento completo de alunos',
                'Exportação de dados em JSON e CSV',
                'Armazenamento em nuvem',
                'Backup automático',
                'Suporte por email',
            ],
        },
        PRO: {
            name: 'Profissional',
            price: 59.90,
            maxStudents: 200,
            features: [
                'Gerenciamento completo de alunos',
                'Exportação de dados em múltiplos formatos',
                'Armazenamento em nuvem ilimitado',
                'Backup automático diário',
                'Relatórios avançados',
                'Notificações automáticas',
                'Suporte prioritário',
            ],
        },
        ENTERPRISE: {
            name: 'Empresarial',
            price: 99.90,
            maxStudents: 'Ilimitado',
            features: [
                'Todas as funcionalidades do plano Profissional',
                'API para integração com outros sistemas',
                'Múltiplos usuários administradores',
                'Personalização da interface',
                'Suporte 24/7',
            ],
        },
    },
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}