import React, { useState } from 'react';

function Item({ id, name, onSolve, onDelete, onEdit,
    onChangeName, isSolved, isEditing }) {
    const [editingName, setEditingName] = useState(name);

    return (
        <div className={`${isSolved ? 'itemSolved' : ''} itemContainer`}>
            {isEditing ? (
                <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => onChangeName(editingName)}
                    autoFocus
                />
            ) : (
                <span onClick={() => onEdit(id)}>{name}</span>
            )}
            <div>
                {!isSolved && <button className='itemButton' onClick={onSolve}>Vyřešit</button>}
                <button className='itemButton' onClick={onDelete}>Smazat</button>
            </div>
        </div>
    );
}

export default Item;