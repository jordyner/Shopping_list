import React, { useState } from 'react'

export default function ShoppingList({ owner, currentUser, name }) {
    const [title, setTitle] = useState(name);
    const [isEditing, setIsEditing] = useState(false);

    const handleRenameClick = () => {
        if (currentUser === owner) {
            setIsEditing(true)
        } else {
            console.log("Pouze owner může měnit název.");
        }
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
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
        </div>
    )
}