import React, { useState } from 'react';
import Item from './Item';

export default function ItemList() {
    const [items, setItems] = useState([
        { id: 1, name: 'Mléko', isSolved: false, isEditing: false },
        { id: 2, name: 'Chléb', isSolved: false, isEditing: false },
        { id: 3, name: 'Jogurt', isSolved: false, isEditing: false },
        { id: 4, name: 'Sýr', isSolved: false, isEditing: false },
    ]);
    const [showSolved, setShowSolved] = useState(false);
    const [filter, setFilter] = useState('all'); 

    const handleSetFilter = (newFilter) => {
        setFilter(newFilter);
    };

    const handleSolve = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isSolved: !item.isSolved } : item
        ));
    };

    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleEdit = (id) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, isEditing: true } : { ...item, isEditing: false }
        ));
    };

    const handleChangeName = (id, newName) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, name: newName, isEditing: false } : item
        ));
    };

    const handleAddItem = () => {
        setItems([...items, { id: items.length + 1, name: 'Nová položka', isSolved: false, isEditing: true }]);
        setFilter('open'); 
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') { return true; }
        if (filter === 'open') { return !item.isSolved; }
        if (filter === 'solved') { return item.isSolved; }
        return true;
    });

    return (
        <div className="itemListContainer">
            <div className="itemListHeader">
                <div>
                    <button className="filterButton" onClick={() => handleSetFilter('all')}>Všechny</button>
                    <button className="filterButton" onClick={() => handleSetFilter('open')}>Otevřené</button>
                    <button className="filterButton" onClick={() => handleSetFilter('solved')}>Uzavřené</button>
                </div>
                <button onClick={handleAddItem} className="itemListButton">Přidat novou položku</button>
            </div>
            {filteredItems.map(item => (
                <Item
                    key={item.id}
                    name={item.name}
                    isSolved={item.isSolved}
                    isEditing={item.isEditing}
                    onSolve={() => handleSolve(item.id)}
                    onDelete={() => handleDelete(item.id)}
                    onEdit={() => handleEdit(item.id)}
                    onChangeName={(newName) => handleChangeName(item.id, newName)}
                />
            ))}
        </div>
    );
}