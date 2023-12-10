import React, { useState } from 'react'
import { updateShoppingList } from './ApiService';
import MessageOverlay from './MessageOverlay';

export default function ShoppingList({ owner, currentUser, name, currentListId }) {
    const [title, setTitle] = useState(name);
    const [isEditing, setIsEditing] = useState(false);
    const [overlayMessage, setOverlayMessage] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);

    const showMessage = (message) => {
        setOverlayMessage(message);
        setIsOverlayVisible(true);
    };

    const closeMessage = () => {
        setIsOverlayVisible(false);
    };
    
    const handleRenameClick = () => {
        if (currentUser === owner) {
            setIsEditing(true)
        } else {
            showMessage("Pouze owner může měnit název.");
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        updateShoppingList(currentListId, {"name": e.target.value})
    };

    const handleBlur = () => {
        setIsEditing(false);
    };

    return (
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    onBlur={handleBlur}
                    autoFocus
                    style={{
                        fontSize: '2em',
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center', 
                        width: '100%' 
                    }}
                />
            ) : (
                <h1 style={{ cursor: 'pointer', margin: '0' }}>{title}</h1>
            )}
            <button onClick={handleRenameClick} style={{ cursor: 'pointer', margin: '0' }} className='renameButton'>Přejmenovat</button>
            <MessageOverlay 
                message={overlayMessage} 
                visible={isOverlayVisible} 
                onClose={closeMessage} 
            />
        </div>
    )
}