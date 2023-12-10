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
            await addUserToShoppingListByName(currentListId, newMemberName, showMessage);
            setMembers(prevMembers => [...prevMembers, newMemberName]);
            setNewMemberName('');
        } catch (error) {
            showMessage('Chyba při přidávání člena:', error);
        }
    };

    const deleteMember = async (member) => {
        if (currentUser !== owner) {
            showMessage("Pouze vlastník může odstraňovat členy.");
            return;
        }
    
        try {
            await removeUserFromShoppingListByName(currentListId, member);
            setMembers(prevMembers => prevMembers.filter(m => m !== member));
        } catch (error) {
            showMessage('Chyba při odstraňování člena:', error);
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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 27) { 
                setIsVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [setIsVisible]); 

    return (
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
    );
}
