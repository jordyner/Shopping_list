import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useParams, useLocation } from 'react-router-dom';
import ShoppingList from './ShoppingList';
import ItemList from './ItemList';
import MemberList from './MemberList';
import HomePage from './HomePage';
import './css/styles.css';

function App() {
    /*
        Make owner and currentUser the same string to try out different permissions when
        viewing shopping list as owner
    */

    const params = useParams();
    const listId = parseInt(params.listId, 10); 
    const location = useLocation();
    console.log(location.state.shoppingLists)

    const currentList = location.state.shoppingLists
    
    console.log("Přijaté listId:", listId);
    const [isMembersVisible, setIsMembersVisible] = useState(false);
    const [isAppVisible, setIsAppVisible] = useState(true);

    if (!isAppVisible) {
        return null; 
    }

    return (
            <div className="appContainer">
                <div className="userHeader">Aktuální uživatel: {currentList.currentUser}</div>
                <div className="userHeader">Vlastník: {currentList.owner}</div>
                <ShoppingList owner={currentList.owner} currentUser={currentList.currentUser} name={currentList.name}/>
    
                <div className="buttonContainerMembers">
                    <button onClick={() => setIsMembersVisible(!isMembersVisible)}>
                        {isMembersVisible ? 'Skrýt členy' : 'Zobrazit členy'}
                    </button>
                </div>
    
                    <MemberList 
                        isVisible={isMembersVisible} 
                        setIsVisible={setIsMembersVisible} 
                        owner={currentList.owner} 
                        currentUser={currentList.currentUser}
                        setIsAppVisible={setIsAppVisible}
                        memberInput={currentList.members}
                    />
    
                <ItemList itemsInput={currentList.items} />
            </div>
    )

}

export default App;