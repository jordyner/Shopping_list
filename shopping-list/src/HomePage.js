import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchShoppingLists, createShoppingList, updateShoppingList, idToName, deleteShoppingList } from './ApiService';
import Spinner from './Spinner'
import MessageOverlay from './MessageOverlay';
import SettingsButtons from './SettingsButtons';
import BarChartVisual from './charts/BarChartVisual';
import './css/styles.css';
import { useTranslation } from 'react-i18next';

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
    const [darkMode, setDarkMode] = useState(false);
    const [t, i18n] = useTranslation("global")
    const [barChartData, setBarChartData] = useState([]);

    const showMessage = (message) => {
        setOverlayMessage(message);
        setIsOverlayVisible(true);
        setTimeout(() => setIsOverlayVisible(false), 3000); 
    };

    const closeMessage = () => {
        setIsOverlayVisible(false);
    };

    const updateBarChartData = async (shoppingLists) =>  {
        const newData = shoppingLists.map(list => ({
            name: list.name,
            itemCount: list.items.length
        }));
        console.log(newData)
        setBarChartData(newData);
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
        // await new Promise(r => setTimeout(r, 2000)); // - odkomentovat v pripade ze chceme aby se nakupni seznamy dele nacitaly, aby bylo lepe videt, ze to funguje
        try {
            const data = await fetchShoppingLists();
            const transformedData = await transformApiData(data.data); 
            setShoppingLists(transformedData);
            setOperationStatus('success'); 
        } catch (error) {
            showMessage(t("HomePage.fetchDataError"), error);
            setOperationStatus('fail'); 
        }
        setTimeout(() => setOperationStatus(''), 1000);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAndTransformShoppingLists();
    }, []);

    useEffect(() => {
        updateBarChartData(shoppingLists);
    }, [shoppingLists]);

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
                showMessage(t("HomePage.deleteShoppingListError"), error);
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
        <div class="${darkMode ? 'dark-mode' : ''}">
            <SettingsButtons darkMode={darkMode} setDarkMode={setDarkMode} i18n={i18n} t={t}/>
            {isLoading && (
                <div className="spinnerOverlay">
                    <Spinner />
                </div>
            )}
            {!isLoading && operationStatus === 'success' && (
                <div className="operationStatus success">{t("HomePage.communicationSuccess")}</div>
            )}
            {!isLoading && operationStatus === 'fail' && (
                <div className="operationStatus fail">{t("HomePage.communicationFail")}</div>
            )}
            <MessageOverlay 
                message={overlayMessage} 
                visible={isOverlayVisible} 
                onClose={closeMessage}
                t={t}
            />
            <div>
                <div className="userHeader">{t("HomePage.user")}: Jirka</div>
            </div>
            <div className="homePageHeadlineContainer">
                <h1 className='homePageHeadline'>{t("HomePage.shoppingLists")}</h1>
            </div>
            <div className="barChartContainer">
                <BarChartVisual data={barChartData} t={t}/>
            </div>
            <div className="buttonContainer">
                <div className="filterButtons">
                    <button
                        className={currentFilter === 'active' ? 'activeFilter' : ''}
                        onClick={() => setCurrentFilter('active')}>
                        {t("HomePage.activeFilter")}
                    </button>
                    <button
                        className={currentFilter === 'all' ? 'activeFilter' : ''}
                        onClick={() => setCurrentFilter('all')}>
                        {t("HomePage.allFilter")}
                    </button>
                </div>
                <button onClick={handleNewListButton}>{t("HomePage.createShoppingList")}</button>
            </div>

            <div className="gridContainer">
                {filteredShoppingLists.map(list => (
                    <div key={list.id} className={`gridItem ${list.state === 'archived' ? 'archivedItem' : ''}`} onClick={() => handleButtonClick(list.id)}>
                        {list.state !== 'archived' && (
                            <button className="archiveButton" onClick={(e) => { e.stopPropagation(); handleArchiveList(list.id); }}>
                                {t("HomePage.archiveButton")}
                            </button>
                        )}
                        <button className="deleteButton" onClick={(e) => { e.stopPropagation(); openDeleteDialog(list.id); }}>
                            {t("HomePage.deleteButton")}
                        </button>
                        <h2 className="listName">{list.name}</h2>
                        <p className="listOwner">{t("HomePage.owner")}: {list.owner}</p>
                        <div className="listDetails">
                            <div className="listMembers">
                                <span>{t("HomePage.members")}:</span>
                                <span className="listCount">{list.members.length}</span>
                            </div>
                            <div className="listItems">
                                <span>{t("HomePage.items")}:</span>
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
                            placeholder={t("HomePage.shoppingListName")}
                        />
                        <div className="newShoppingListDialog">
                            <button onClick={handleConfirmNewList}>{t("HomePage.confirm")}</button>
                            <button onClick={handleCancelNewList}>{t("HomePage.storno")}</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteDialogOpen && (
                <div className="overlay">
                    <div className="deleteDialog">
                        <p>{t("HomePage.deleteMessage")}</p>
                        <button onClick={deleteList}>{t("HomePage.yes")}</button>
                        <button onClick={cancelDelete}>{t("HomePage.no")}</button>
                    </div>
                </div>
            )}

            {isOwnerWarningVisible && (
                <div className="overlay">
                    <div className="deleteDialog">
                        <p>{t("HomePage.deleteError")}</p>
                        <button onClick={() => setIsOwnerWarningVisible(false)}>OK</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;