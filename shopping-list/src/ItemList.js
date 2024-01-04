import React, { useState, useEffect } from 'react';
import { addItemToShoppingList, updateProductNameInShoppingList, removeProductFromShoppingList, updateProductStatusInShoppingList, fetchItemsFromShoppingList } from './ApiService';
import Item from './Item';
import MessageOverlay from './MessageOverlay';
import PieChartVisual from './charts/PieChartVisual';

export default function ItemList({ itemsInput, currentListId, t }) {
    const [items, setItems] = useState(itemsInput)
    const [showSolved, setShowSolved] = useState(false);
    const [filter, setFilter] = useState('all');
    const [overlayMessage, setOverlayMessage] = useState('');
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [solvedCount, setSolvedCount] = useState(0);
    const [openCount, setOpenCount] = useState(0);
    const [showChart, setShowChart] = useState(false);

    const pieChartData = [
        { name: t("ItemList.closedFilter"), value: solvedCount },
        { name: t("ItemList.openFilter"), value: openCount },
    ];

    const toggleChart = () => {
        setShowChart(!showChart);
    };

    const showMessage = (message) => {
        setOverlayMessage(message);
        setIsOverlayVisible(true);
        setTimeout(() => setIsOverlayVisible(false), 3000); 
    };

    const closeMessage = () => {
        setIsOverlayVisible(false);
    }; 
    

    const fetchItems = async () => {
        try {
            const fetchedData = await fetchItemsFromShoppingList(currentListId);
            const fetchedItems = fetchedData && fetchedData.data ? Object.values(fetchedData.data) : [];

            let newSolvedCount = 0;
            let newOpenCount = 0;

            fetchedItems.forEach(item => {
                if(item.state === 'solved') {
                    newSolvedCount += 1;
                } else {
                    newOpenCount += 1;
                }
            });

            setSolvedCount(newSolvedCount);
            setOpenCount(newOpenCount);

            setItems(fetchedItems.map(item => ({
                ...item,
                isSolved: item.state === 'solved'
            })));
        } catch (error) {
            showMessage('Chyba při načítání položek:', error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [currentListId]);

    const handleSetFilter = (newFilter) => {
        setFilter(newFilter);
    };

    const handleSolve = async (id) => {
        try {
            await updateProductStatusInShoppingList(currentListId, id, 'solved');
            setItems(items.map(item =>
                item.id === id ? { ...item, isSolved: true } : item
            ));
            fetchItems()
        } catch (error) {
            showMessage('Chyba při aktualizaci stavu produktu:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await removeProductFromShoppingList(currentListId, id);
            setItems(items.filter(item => item.id !== id));
            fetchItems()
        } catch (error) {
            showMessage('Chyba při odstraňování produktu:', error);
        }
    };

    const handleEdit = (productId) => {
        setItems(items.map(item =>
            item.productId === productId ? { ...item, isEditing: true } : { ...item, isEditing: false }
        ));
    };

    const handleChangeName = async (productId, newName) => {
        console.log(productId)
        console.log(newName)
        try {
            await updateProductNameInShoppingList(currentListId, productId, newName);
    
            setItems(items.map(item =>
                item.productId === productId ? { ...item, name: newName, isEditing: false } : item
            ));
        } catch (error) {
            showMessage(t("ItemList.updateItemError"), error);
        }
    };

    const handleAddItem = async () => {
        const itemName = t("ItemList.newItem"); 
    
        try {
            const response = await addItemToShoppingList(currentListId, itemName);
            
            const newItem = {
                id: response.shoppingList.productId,
                name: response.shoppingList.name,
                description: response.shoppingList.description,
                isSolved: false,
                isEditing: false,
                state: response.shoppingList.state,
                addedBy: response.shoppingList.addedBy,
                shoppingListId: response.shoppingList.shoppingListId
            };
    
            setItems(prevItems => [...prevItems, newItem]);
    
            setFilter('open');
            fetchItems();
        } catch (error) {
            showMessage(t("ItemList.addItemError"), error);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') { return true; }
        if (filter === 'open') { return !item.isSolved; }
        if (filter === 'solved') { return item.isSolved; }
        return true;
    });

    console.log("Items před mapováním v ItemList", items);
    return (
        <div className="itemListContainer">
            <div className="itemListHeader">
                <div>
                    <button className="filterButton" onClick={() => handleSetFilter('all')}>{t("ItemList.allFilter")}</button>
                    <button className="filterButton" onClick={() => handleSetFilter('open')}>{t("ItemList.openFilter")}</button>
                    <button className="filterButton" onClick={() => handleSetFilter('solved')}>{t("ItemList.closedFilter")}</button>
                    <button onClick={toggleChart} className="itemListButton">
                        {showChart ? t("ItemList.showItems") : t("ItemList.showChart")}
                    </button>
                </div>
                <button onClick={handleAddItem} className="itemListButton">{t("ItemList.addNewItem")}</button>
            </div>
            {showChart ? (
                <PieChartVisual data={pieChartData} />
            ) : (
                filteredItems.map(item => (
                    <Item
                        key={item.productId}
                        productId={item.productId}
                        name={item.name}
                        isSolved={item.isSolved}
                        isEditing={item.isEditing}
                        onSolve={() => handleSolve(item.productId)}
                        onDelete={() => handleDelete(item.productId)}
                        onEdit={() => handleEdit(item.productId)}
                        onChangeName={(newName) => handleChangeName(item.productId, newName)}
                        t={t}
                    />
                ))
            )}
            <MessageOverlay 
                message={overlayMessage} 
                visible={isOverlayVisible} 
                onClose={closeMessage}
                t={t}
            />
        </div>
    );
}