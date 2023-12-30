import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addUserToShoppingListByName, removeUserFromShoppingListByName } from './ApiService';
import MessageOverlay from './MessageOverlay';
import './css/styles.css';

export default function MembersList({ isVisible, setIsVisible, owner, currentUser, setIsAppVisible, memberInput, currentListId, t }) {
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
            showMessage(t("MemberList.addMemberError"));
            return;
        }
    
        if (!newMemberName) {
            showMessage(t("MemberList.memberNameEmpty"));
            return;
        }
    
        try {
            const result = await addUserToShoppingListByName(currentListId, newMemberName, showMessage);
            console.log(result)
            if (result.success) {
                setMembers(prevMembers => [...prevMembers, newMemberName]);
                setNewMemberName('');
            } else {
                showMessage(t("MemberList.missingMember"));
            }
        } catch {
            showMessage(t("MemberList.addMemberFail"));
        }
    };

    const deleteMember = async (member) => {
        if (currentUser !== owner) {
            showMessage(t("MemberList.removeMemberError"));
            return;
        }
    
        try {
            await removeUserFromShoppingListByName(currentListId, member, showMessage);
            setMembers(prevMembers => prevMembers.filter(m => m !== member));
        } catch {
            showMessage(t("MemberList.removeMemberFail"));
        }
    };

    const handleLeave = async () => {
        if (currentUser === owner) {
            showMessage(t("MemberList.errorLeaving"));
            return;
        }

        try {
            await removeUserFromShoppingListByName(currentListId, currentUser);
            navigate('/');
        } catch (error) {
            showMessage(t("MemberList.errorLeaving"), error);
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
                <h3 className="memberTitle">{t("MemberList.shoppingListMembers")}</h3>
                <div className="memberInputContainer">
                    <input 
                        type="text" 
                        value={newMemberName} 
                        onChange={(e) => setNewMemberName(e.target.value)} 
                        placeholder={t("MemberList.newMemberName")}
                    />
                    <button onClick={addMember}>{t("MemberList.addMemberButton")}</button>
                </div>
                {members.map(member => (
                    <div key={member} className="memberItem">
                        {member}
                        {currentUser === member ? (
                            <button className='leaveButton' onClick={handleLeave}>{t("MemberList.leaveButton")}</button>
                        ) : (
                            <button className='deleteMember' onClick={() => deleteMember(member)}>{t("MemberList.deleteButton")}</button>
                        )}
                    </div>
                ))}
                <MessageOverlay 
                    message={overlayMessage} 
                    visible={isOverlayVisible} 
                    onClose={closeMessage}
                    t={t}
                />
            </div>
        </div>
    );
}
