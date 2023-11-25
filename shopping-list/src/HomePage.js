import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/styles.css';

function HomePage(){
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [isOwnerWarningVisible, setIsOwnerWarningVisible] = useState(false);

    // Initial shopping lists
    const [shoppingLists, setShoppingLists] = useState([
        {
            id: 0,
            name: 'Jídlo',
            owner: 'Jirka',
            currentUser: 'Jirka',
            state: 'active',
            items: [
                { id: 1, name: 'Mléko', isSolved: false, isEditing: false },
                { id: 2, name: 'Chléb', isSolved: false, isEditing: false },
            ],
            members: ['Jirka', 'Kryštof', 'Marek', 'Matěj'],
        },
        {
            id: 1,
            name: 'Pití',
            owner: 'Martin',
            currentUser: 'Jirka',
            state: 'active',
            items: [
                { id: 1, name: 'Coca-cola', isSolved: false, isEditing: false },
                { id: 2, name: 'Fanta', isSolved: false, isEditing: false },
            ],
            members: ['Martina', 'Pavel', 'Lucie', 'Jirka'],
        },
    ]);

    const openDeleteDialog = (id) => {
        const list = shoppingLists.find(list => list.id === id);
        if (list && list.owner === list.currentUser) {
            setListToDelete(id);
            setIsDeleteDialogOpen(true);
        } else {
            setIsOwnerWarningVisible(true); 
        }
    };

    const [currentFilter, setCurrentFilter] = useState('active');

    const filteredShoppingLists = shoppingLists
        .filter(list => currentFilter === 'all' || list.state === 'active')
        .sort((a, b) => {
            if (a.state === 'active' && b.state === 'archived') {
                return -1;
            } else {
                return 1; 
            }
    });

    const deleteList = () => {
        setShoppingLists(shoppingLists.filter(list => list.id !== listToDelete));
        setIsDeleteDialogOpen(false);
    };

    const cancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setListToDelete(null);
    };

    const handleButtonClick = (listId) => {
        const listToNavigate = shoppingLists.find(list => list.id === listId);

        if(listToNavigate.state != 'archived') {
            navigate(`/app/${listId}`, {replace: false, state:{shoppingLists:listToNavigate}});
        }
    };

    const handleNewListButton = () => {
        setIsDialogOpen(true);
    };

    const handleArchiveList = (id) => {
        setShoppingLists(currentLists =>
            currentLists.map(list =>
                list.id === id ? { ...list, state: 'archived' } : list
            )
        );
    };

    const handleConfirmNewList = () => {
        const newShoppingList = {
            id: shoppingLists.reduce((maxId, list) => Math.max(list.id, maxId), 0) + 1, // guarantees that id is unique
            name: newListName,
            owner: 'Jirka',
            currentUser: 'Jirka',
            state: 'active',
            items: [], 
            members: ['Jirka'], 
        };
        
        setShoppingLists((prevShoppingLists) => [...prevShoppingLists, newShoppingList]);

        setIsDialogOpen(false);
        setNewListName('');
    };

    const handleCancelNewList = () => {
        setIsDialogOpen(false);
        setNewListName('');
    };

    return (
        <div>
            <div>
                <div className="userHeader">Uživatel: Jirka</div>
            </div>
            <div className="homePageHeadlineContainer">
                <h1 className='homePageHeadline'>Nákupní seznamy</h1>
            </div>
            <div className="buttonContainer">
                <div className="filterButtons">
                    <button 
                        className={currentFilter === 'active' ? 'activeFilter' : ''} 
                        onClick={() => setCurrentFilter('active')}>
                        Aktivní
                    </button>
                    <button 
                        className={currentFilter === 'all' ? 'activeFilter' : ''} 
                        onClick={() => setCurrentFilter('all')}>
                        Všechny
                    </button>
                </div>
                <button onClick={handleNewListButton}>Nový nákupní seznam</button>
            </div>

            <div className="gridContainer">
                {filteredShoppingLists.map(list => (
                    <div key={list.id} className={`gridItem ${list.state === 'archived' ? 'archivedItem' : ''}`} onClick={() => handleButtonClick(list.id)}>
                        <button className="archiveButton" onClick={(e) => { e.stopPropagation(); handleArchiveList(list.id); }}>
                            Archivovat
                        </button>
                        <button className="deleteButton" onClick={(e) => { e.stopPropagation(); openDeleteDialog(list.id); }}>
                            Smazat
                        </button>
                        <h2 className="listName">{list.name}</h2>
                        <p className="listOwner">Vlastník: {list.owner}</p>
                        <div className="listDetails">
                            <div className="listMembers">
                                <span>Členové:</span>
                                <span className="listCount">{list.members.length}</span>
                            </div>
                            <div className="listItems">
                                <span>Položky</span>
                                <span className="listCount">{list.items.length}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

                        
            {isDialogOpen && (
                <div className="overlay">
                    <div className="dialog">
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="Název seznamu"
                        />
                        <button className='buttonContainer' onClick={handleConfirmNewList}>Potvrdit</button>
                        <button className='buttonContainer' onClick={handleCancelNewList}>Storno</button>
                    </div>
                </div>
            )}

            {isDeleteDialogOpen && (
                <div className="overlay">
                    <div className="deleteDialog">
                        <p>Jste si jisti, že chcete nenávratně smazat tento nákupní seznam?</p>
                        <button onClick={deleteList}>Ano</button>
                        <button onClick={cancelDelete}>Ne</button>
                    </div>
                </div>
            )}

            {isOwnerWarningVisible && (
                <div className="overlay">
                    <div className="deleteDialog">
                        <p>Tento seznam může smazat pouze jeho vlastník.</p>
                        <button onClick={() => setIsOwnerWarningVisible(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;