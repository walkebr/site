// Script para a Landing Page do Renovame SaaS

// Elementos do DOM
let themeSwitch;
let navLinks;
let faqItems;
let pricingToggle;
let navbarToggle;
let mobileMenu;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos do DOM
    initializeElements();
    
    // Configurar eventos
    setupEventListeners();
    
    // Animar elementos na rolagem
    setupScrollAnimations();
});

// Inicializar elementos do DOM
function initializeElements() {
    themeSwitch = document.getElementById('theme-switch');
    navLinks = document.querySelectorAll('.nav-link');
    faqItems = document.querySelectorAll('.faq-item');
    pricingToggle = document.getElementById('pricing-toggle');
    navbarToggle = document.querySelector('.navbar-toggle');
    mobileMenu = document.querySelector('.navbar-menu');
    
    // Carregar preferência de tema
    loadThemePreference();
}

// Configurar event listeners
function setupEventListeners() {
    // Toggle do tema
    if (themeSwitch) {
        themeSwitch.addEventListener('change', toggleTheme);
    }
    
    // Navegação suave
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });
    
    // FAQ accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => toggleFaqItem(item));
    });
    
    // Toggle de preços (mensal/anual)
    if (pricingToggle) {
        pricingToggle.addEventListener('change', togglePricingPeriod);
    }
    
    // Toggle do menu mobile
    if (navbarToggle) {
        navbarToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Fechar menu mobile ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Navbar fixa no scroll
    window.addEventListener('scroll', handleNavbarScroll);
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

// Navegação suave
function smoothScroll(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId.startsWith('#') && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Toggle de item do FAQ
function toggleFaqItem(item) {
    const isActive = item.classList.contains('active');
    
    // Fechar todos os itens
    faqItems.forEach(faqItem => {
        faqItem.classList.remove('active');
    });
    
    // Abrir o item clicado (se não estava ativo)
    if (!isActive) {
        item.classList.add('active');
    }
}

// Toggle de período de preços (mensal/anual)
function togglePricingPeriod() {
    const isAnnual = pricingToggle.checked;
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        const priceElement = card.querySelector('.price');
        const currentPrice = parseFloat(priceElement.textContent.replace('R$ ', '').replace(',', '.'));
        
        if (isAnnual) {
            // Aplicar desconto anual (20%)
            const annualPrice = (currentPrice * 12 * 0.8).toFixed(2).replace('.', ',');
            priceElement.textContent = `R$ ${annualPrice}`;
            card.querySelector('.period').textContent = '/ano';
        } else {
            // Reverter para preço mensal
            const monthlyPrice = (currentPrice / (12 * 0.8)).toFixed(2).replace('.', ',');
            priceElement.textContent = `R$ ${monthlyPrice}`;
            card.querySelector('.period').textContent = '/mês';
        }
    });
}

// Toggle do menu mobile
function toggleMobileMenu() {
    mobileMenu.classList.toggle('mobile-visible');
    document.body.classList.toggle('menu-open');
}

// Fechar menu mobile
function closeMobileMenu() {
    mobileMenu.classList.remove('mobile-visible');
    document.body.classList.remove('menu-open');
}

// Lidar com navbar no scroll
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
}

// Configurar animações de scroll
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card, .faq-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Adicionar estilos CSS para animações
function addAnimationStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .feature-card, .pricing-card, .testimonial-card, .faq-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .feature-card.animated, .pricing-card.animated, .testimonial-card.animated, .faq-item.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .navbar-scrolled {
            padding: 10px 0;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-visible {
            display: block !important;
        }
        
        @media (max-width: 768px) {
            .navbar-menu {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background-color: var(--dark-card);
                padding: 20px;
                display: none;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            body.light-mode .navbar-menu {
                background-color: var(--light-card);
            }
            
            .navbar-nav {
                flex-direction: column;
                gap: 15px;
            }
            
            body.menu-open {
                overflow: hidden;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Adicionar estilos para animações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', addAnimationStyles);