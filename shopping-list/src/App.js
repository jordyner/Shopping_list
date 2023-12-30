import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import ShoppingList from './ShoppingList';
import ItemList from './ItemList';
import MemberList from './MemberList';
import HomePage from './HomePage';
import SettingsButtons from './SettingsButtons';
import './css/styles.css';
import { useTranslation } from 'react-i18next';

function App() {
    const params = useParams();
    const listId = parseInt(params.listId, 10);
    const location = useLocation();
    console.log(location.state.shoppingLists)

    const currentList = location.state.shoppingLists

    console.log("Přijaté listId:", listId);
    const [isMembersVisible, setIsMembersVisible] = useState(false);
    const [isAppVisible, setIsAppVisible] = useState(true);
    const [modalMessage, setModalMessage] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [t, i18n] = useTranslation("global");

    if (!isAppVisible) {
        return null;
    }

    return (
        <div className={`appContainer ${darkMode ? 'dark-mode' : ''}`}>
            <SettingsButtons darkMode={darkMode} setDarkMode={setDarkMode} i18n={i18n} t={t}/>
            <div className="userHeader">{t("App.currentUser")}: {currentList.currentUser}</div>
            <div className="userHeader">{t("App.owner")}: {currentList.owner}</div>
            <ShoppingList owner={currentList.owner} currentUser={currentList.currentUser} name={currentList.name} currentListId={listId} t={t} />

            <div className="buttonContainerMembers">
                <button onClick={() => setIsMembersVisible(!isMembersVisible)}>
                    {isMembersVisible ? t("App.hideMembers") : t("App.showMembers")}
                </button>
            </div>

            <MemberList
                isVisible={isMembersVisible}
                setIsVisible={setIsMembersVisible}
                owner={currentList.owner}
                currentUser={currentList.currentUser}
                setIsAppVisible={setIsAppVisible}
                memberInput={currentList.members}
                currentListId={listId}
                t={t}
            />

            <ItemList itemsInput={currentList.items} currentListId={listId} t={t}/>
        </div>
    )

}

export default App;