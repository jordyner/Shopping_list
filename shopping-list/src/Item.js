import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Item({ id, name, onSolve, onDelete, onEdit,
    onChangeName, isSolved, isEditing, t }) {
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
                {!isSolved && <button className='itemButton' onClick={onSolve}>{t("Item.solve")}</button>}
                <button className='itemButton' onClick={onDelete}>{t("Item.delete")}</button>
            </div>
        </div>
    );
}

export default Item;