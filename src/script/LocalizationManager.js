export default class LocalizationManager {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.locales = {};
        this.init();
    }

    async init() {
        // Загружаем обе локализации
        await this.loadLocale('en');
        await this.loadLocale('ru');
        
        // Устанавливаем обработчики для переключения языка
        this.setupLanguageSwitcher();
        
        // Устанавливаем начальное состояние переключателя
        this.updateLanguageSwitcher();
    }

    async loadLocale(lang) {
        try {
            const response = await fetch(`./locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.locales[lang] = data;
            console.log(`Locale ${lang} loaded successfully`);
        } catch (error) {
            console.error(`Failed to load locale ${lang}:`, error);
            // Fallback to main structure.json for English
            if (lang === 'en') {
                try {
                    const response = await fetch('./structure.json');
                    const data = await response.json();
                    this.locales[lang] = data;
                    console.log('Fallback to structure.json for English locale');
                } catch (fallbackError) {
                    console.error('Failed to load fallback structure.json:', fallbackError);
                }
            }
        }
    }

    setupLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-button');
        
        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedLang = e.target.getAttribute('data-lang');
                this.switchLanguage(selectedLang);
            });
        });
    }

    async switchLanguage(lang) {
        if (this.currentLanguage === lang) return;
        
        this.currentLanguage = lang;
        this.storeLanguage(lang);
        this.updateLanguageSwitcher();
        
        // Проверяем, что локаль загружена
        if (!this.locales[lang]) {
            await this.loadLocale(lang);
        }
        
        // Обновляем структуру в pageBuilder
        this.pageBuilder.structure = this.locales[lang];
        
        // Перестраиваем страницу
        this.pageBuilder.build();
        
        // Обновляем мета-теги
        this.updateMetaTags();
    }

    updateLanguageSwitcher() {
        const langButtons = document.querySelectorAll('.lang-button');
        
        langButtons.forEach(button => {
            const buttonLang = button.getAttribute('data-lang');
            if (buttonLang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    updateMetaTags() {
        const currentPageData = this.getCurrentPageData();
        if (currentPageData) {
            document.title = currentPageData.title || 'Viachas Kul: Product Designer & Developer.';
            
            // Обновляем meta description
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && currentPageData.description) {
                metaDescription.setAttribute('content', currentPageData.description);
            }
        }
    }

    getCurrentPageData() {
        const currentPage = this.pageBuilder.currentPage;
        return this.locales[this.currentLanguage]?.pages?.[currentPage];
    }

    getStoredLanguage() {
        return localStorage.getItem('portfolio-language');
    }

    storeLanguage(lang) {
        localStorage.setItem('portfolio-language', lang);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getLocaleData() {
        return this.locales[this.currentLanguage];
    }

    // Метод для получения переведенного текста по ключу
    t(key, defaultValue = '') {
        const data = this.locales[this.currentLanguage];
        const keys = key.split('.');
        let value = data;
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || defaultValue;
    }
}
