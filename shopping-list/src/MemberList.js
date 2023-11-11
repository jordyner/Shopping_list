import React, { useState, useEffect } from 'react';
import './css/styles.css';

export default function MembersList({ isVisible, setIsVisible, owner, currentUser, setIsAppVisible }) {
    const [members, setMembers] = useState(['Jirka', 'Kryštof', 'Marek', 'Matěj']);
    const [newMemberName, setNewMemberName] = useState('');

    const addMember = () => {
        if (currentUser === owner) {
            if (newMemberName) {
                setMembers([...members, newMemberName]);
                setNewMemberName('');
            } 
        } else {
            console.log("Pouze vlastník může přidávat členy.");
        }  
    };

    const deleteMember = (member) => {
        if (currentUser === owner) {
            setMembers(members.filter(m => m !== member));
        } else {
            console.log("Pouze vlastník může odstraňovat členy.");
        }
    };

    const handleLeave = () => {
        setIsAppVisible(false); 
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
                        <button className='deleteButton' onClick={() => deleteMember(member)}>Smazat</button>
                    )}
                </div>
            ))}
        </div>
    );
}
