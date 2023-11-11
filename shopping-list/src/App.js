import React, { useState } from 'react';
import ShoppingList from './ShoppingList';
import ItemList from './ItemList';
import MemberList from './MemberList';
import './css/styles.css';

function App() {
    /*
        Make owner and currentUser the same string to try out different permissions when
        viewing shopping list as owner
    */
    const owner = 'Jirka'; 
    const currentUser = 'Kryštof'; 
    const [isMembersVisible, setIsMembersVisible] = useState(false);
    const [isAppVisible, setIsAppVisible] = useState(true);

    if (!isAppVisible) {
        return null; 
    }

    return (
        <div className="appContainer">
            <div className="userHeader">Aktuální uživatel: {currentUser}</div>
            <div className="userHeader">Vlastník: {owner}</div>
            <ShoppingList owner={owner} currentUser={currentUser} />

            <div className="buttonContainer">
                <button onClick={() => setIsMembersVisible(!isMembersVisible)}>
                    {isMembersVisible ? 'Skrýt členy' : 'Zobrazit členy'}
                </button>
            </div>

            <MemberList 
                isVisible={isMembersVisible} 
                setIsVisible={setIsMembersVisible} 
                owner={owner} 
                currentUser={currentUser}
                setIsAppVisible={setIsAppVisible}
            />

            <ItemList />
        </div>
    );
}

export default App;