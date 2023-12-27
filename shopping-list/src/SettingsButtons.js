import React from 'react';

const SettingsButtons = ({ darkMode, setDarkMode, i18n, t }) => {
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    const changeLanguage = () => {
        const newLang = i18n.language === 'en' ? 'cs' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div>
            <button className="buttonSpacingSettings" onClick={toggleDarkMode}>
                {darkMode ? t("SettingsButtons.darkMode") : t("SettingsButtons.lightMode")}
            </button>
            <button onClick={changeLanguage}>
                {i18n.language === 'en' ? t("SettingsButtons.enLang") : t("SettingsButtons.csLang")}
            </button>
        </div>
    );
};

export default SettingsButtons;
