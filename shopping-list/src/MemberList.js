import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUserToShoppingListByName, removeUserFromShoppingListByName } from './ApiService';
import MessageOverlay from './MessageOverlay';
import './css/styles.css';

export default function MembersList({ isVisible, setIsVisible, owner, currentUser, setIsAppVisible, memberInput, currentListId }) {
    const navigate = useNavigate();
    const [members, setMembers] = useState(memberInput);
    const [newMemberName, setNewMemberName] = useState('');
    const [overlayMessage, setOverlayMessage] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const showMessage = (message) => {
        setOverlayMessage(message);
        setIsOverlayVisible(true);
        setTimeout(() => setIsOverlayVisible(false), 3000); 
    };

    const closeMessage = () => {
        setIsOverlayVisible(false);
    };

    const addMember = async () => {
        if (currentUser !== owner) {
            showMessage("Pouze vlastník může přidávat členy.");
            return;
        }
    
        if (!newMemberName) {
            showMessage("Jméno člena nesmí být prázdné.");
            return;
        }
    
        try {
            const result = await addUserToShoppingListByName(currentListId, newMemberName, showMessage);
            console.log(result)
            if (result.success) {
                setMembers(prevMembers => [...prevMembers, newMemberName]);
                setNewMemberName('');
            } else {
                showMessage("Uživatel s tímto jménem nebyl nalezen.");
            }
        } catch {
            showMessage('Chyba při přidávání člena:');
        }
    };

    const deleteMember = async (member) => {
        if (currentUser !== owner) {
            showMessage("Pouze vlastník může odstraňovat členy.");
            return;
        }
    
        try {
            await removeUserFromShoppingListByName(currentListId, member, showMessage);
            setMembers(prevMembers => prevMembers.filter(m => m !== member));
        } catch {
            showMessage('Chyba při odstraňování člena:');
        }
    };

    const handleLeave = async () => {
        if (currentUser === owner) {
            showMessage("Vlastník nemůže opustit seznam."); 
            return;
        }

        try {
            await removeUserFromShoppingListByName(currentListId, currentUser);
            navigate('/');
        } catch (error) {
            showMessage('Chyba při odchodu ze seznamu:', error);
        }
    };

    const handleClickOutside = (event) => {
        if (event.target.className === 'overlay') {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className={isVisible ? 'overlay' : 'hidden'} onClick={handleClickOutside}>
            <div className={isVisible ? 'memberListContainer' : 'hidden'}>
                <h3 className="memberTitle">Členové seznamu</h3>
                <div className="memberInputContainer">
                    <input 
                        type="text" 
                        value={newMemberName} 
                        onChange={(e) => setNewMemberName(e.target.value)} 
                        placeholder="Jméno nového člena"
                    />
                    <button onClick={addMember}>Přidat člena</button>
                </div>
                {members.map(member => (
                    <div key={member} className="memberItem">
                        {member}
                        {currentUser === member ? (
                            <button className='leaveButton' onClick={handleLeave}>Odejít</button>
                        ) : (
                            <button className='deleteMember' onClick={() => deleteMember(member)}>Smazat</button>
                        )}
                    </div>
                ))}
                <MessageOverlay 
                    message={overlayMessage} 
                    visible={isOverlayVisible} 
                    onClose={closeMessage} 
                />
            </div>
        </div>
    );
}
