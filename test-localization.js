// Простой скрипт для тестирования локализации
// Запускается в браузере для проверки переключения языков

// Проверяем, что переключатель языков работает
const langButtons = document.querySelectorAll('.lang-button');
console.log('Language buttons found:', langButtons.length);

// Проверяем, что LocalizationManager загружен
if (window.pageBuilder && window.pageBuilder.localizationManager) {
    console.log('LocalizationManager loaded successfully');
    console.log('Current language:', window.pageBuilder.localizationManager.getCurrentLanguage());
} else {
    console.log('LocalizationManager not found');
}

// Функция для переключения языка
function switchToRussian() {
    if (window.pageBuilder && window.pageBuilder.localizationManager) {
        window.pageBuilder.localizationManager.switchLanguage('ru');
    }
}

function switchToEnglish() {
    if (window.pageBuilder && window.pageBuilder.localizationManager) {
        window.pageBuilder.localizationManager.switchLanguage('en');
    }
}

// Экспортируем функции в глобальную область
window.switchToRussian = switchToRussian;
window.switchToEnglish = switchToEnglish;

console.log('Test functions available: switchToRussian(), switchToEnglish()');
