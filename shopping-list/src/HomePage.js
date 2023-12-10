import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchShoppingLists, createShoppingList, updateShoppingList, idToName, deleteShoppingList } from './ApiService';
import Spinner from './Spinner'
import MessageOverlay from './MessageOverlay';
import './css/styles.css';

function HomePage() {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [isOwnerWarningVisible, setIsOwnerWarningVisible] = useState(false);
    const [overlayMessage, setOverlayMessage] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [operationStatus, setOperationStatus] = useState('');

    const showMessage = (message) => {
        setOverlayMessage(message);
        setIsOverlayVisible(true);
        setTimeout(() => setIsOverlayVisible(false), 3000); 
    };

    const closeMessage = () => {
        setIsOverlayVisible(false);
    };


    async function transformApiData(apiData) {
        const ownerIds = Object.keys(apiData).map(key => apiData[key].owner);
        const ownerNames = await Promise.all(ownerIds.map(id => idToName(id)));
        const memberNamesList = await Promise.all(Object.keys(apiData).map(key =>
            Promise.all(apiData[key].members.map(id => idToName(id)))
        ));

        const currentUser = 'Jirka'; 

        return Object.keys(apiData).map((key, index) => {
            const list = apiData[key];

            if (memberNamesList[index].includes(currentUser)) {
                return {
                    id: list.id || 0,
                    name: list.name || '',
                    owner: ownerNames[index],
                    currentUser: currentUser,
                    state: list.state,
                    items: Object.values(list.products).map(product => ({
                        id: product.productId || 0,
                        name: product.name || '',
                        isSolved: false,
                        isEditing: false
                    })),
                    members: memberNamesList[index],
                };
            }

            return null;
        }).filter(list => list !== null);
    }

    const fetchAndTransformShoppingLists = async () => {
        setIsLoading(true);
        setOperationStatus(''); 
        //await new Promise(r => setTimeout(r, 2000)); - odkomentovat v pripade ze chceme aby se nakupni seznamy dele nacitaly, aby bylo lepe videt, ze to funguje
        try {
            const data = await fetchShoppingLists();
            const transformedData = await transformApiData(data.data); 
            setShoppingLists(transformedData);
            setOperationStatus('success'); 
        } catch (error) {
            showMessage('There has been a problem with your fetch operation:', error);
            setOperationStatus('fail'); 
        }
        setTimeout(() => setOperationStatus(''), 1000);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAndTransformShoppingLists();
    }, []);

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

    const deleteList = async () => {
        if (listToDelete) {
            try {
                await deleteShoppingList(listToDelete);
                await fetchAndTransformShoppingLists();  
            } catch (error) {
                showMessage('Chyba při mazání seznamu:', error);
            }
        }
        setIsDeleteDialogOpen(false);
        setListToDelete(null);
    };

    const cancelDelete = () => {
        setIsDeleteDialogOpen(false);
        setListToDelete(null);
    };

    const handleButtonClick = (listId) => {
        const listToNavigate = shoppingLists.find(list => list.id === listId);

        if (listToNavigate.state != 'archived') {
            navigate(`/app/${listId}`, { replace: false, state: { shoppingLists: listToNavigate } });
        }
    };

    const handleNewListButton = () => {
        setIsDialogOpen(true);
    };


    const handleArchiveList = (id) => {
        const listToArchive = shoppingLists.find(list => list.id === id);
        if (listToArchive && listToArchive.state !== 'archived') {
            setShoppingLists(currentLists =>
                currentLists.map(list =>
                    list.id === id ? { ...list, state: 'archived' } : list
                )
            );

            updateShoppingList(id, { state: 'archived' });
        }
    };

    const handleConfirmNewList = async () => {
        const newShoppingListData = {
            name: newListName,
            owner: 'Jirka',
            state: 'active',
            items: [],
            members: ['Jirka'],
        };

        try {
            await createShoppingList(newShoppingListData);
            await fetchAndTransformShoppingLists();
            setIsDialogOpen(false);
            setNewListName('');
        } catch (error) {
        }
    };

    const handleCancelNewList = () => {
        setIsDialogOpen(false);
        setNewListName('');
    };

    return (
        <div>
            {isLoading && (
                <div className="spinnerOverlay">
                    <Spinner />
                </div>
            )}
            {!isLoading && operationStatus === 'success' && (
                <div className="operationStatus success">Komunikace se serverem úspěšná</div>
            )}
            {!isLoading && operationStatus === 'fail' && (
                <div className="operationStatus fail">Komunikace se serverem se nezdařila</div>
            )}
            <MessageOverlay 
                message={overlayMessage} 
                visible={isOverlayVisible} 
                onClose={closeMessage}
            />
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
                        {list.state !== 'archived' && (
                            <button className="archiveButton" onClick={(e) => { e.stopPropagation(); handleArchiveList(list.id); }}>
                                Archivovat
                            </button>
                        )}
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