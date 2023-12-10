const API_BASE_URL = 'http://localhost:8088';
const AUTH_TOKEN = 'Bearer bzCRIH4Lo3C79SC'; // Member: U4Wc3vRtEl0qIiI, User/Owner: bzCRIH4Lo3C79SC

const callAPI = async (url, method, body = null) => {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': AUTH_TOKEN
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`API CALL was not successfull: ${response.status}, detail: ${errorDetail}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error calling API: ${error}`);
        throw error; 
    }
};

export const fetchShoppingLists = async () => {
    return callAPI(`${API_BASE_URL}/shoppingList/list`, 'GET');
};

export const createShoppingList = async (listData) => {
    return callAPI(`${API_BASE_URL}/shoppingList/create`, 'POST', listData);
};

export const updateShoppingList = async (listId, updateData) => {
    return callAPI(`${API_BASE_URL}/shoppingList/update/${listId}`, 'PUT', updateData);
};

export const deleteShoppingList = async (shoppingListId) => {
    return callAPI(`${API_BASE_URL}/shoppingList/remove/${shoppingListId}`, 'DELETE');
};

export async function idToName(id) {
    try {
        const data = await callAPI(`${API_BASE_URL}/user/get/${id}`, 'GET');
        return data.data.username;
    } catch (error) {
        console.error('Could not fetch user data for ID:', id, error);
        return ''; 
    }
}

export const fetchUsers = async () => {
    const result = await callAPI(`${API_BASE_URL}/user/list`, 'GET');
    return Object.values(result.data); 
};

export const addUserToShoppingListByName = async (shoppingListId, username, showMessage) => {
    try {
        const users = await fetchUsers();
        const user = users.find(u => u.username === username);

        if (user) {
            const userId = user.userId;
            await addMemberToShoppingList(shoppingListId, userId);
        } else {
            showMessage('Uživatel s tímto jménem nebyl nalezen.');
        }
    } catch (error) {
        showMessage('Chyba při přidávání uživatele do seznamu.');
    }
};

const addMemberToShoppingList = async (shoppingListId, userId) => {
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/user/addMember/${userId}`, 'PUT');
};

export const removeUserFromShoppingListByName = async (shoppingListId, username) => {
    try {
        const users = await fetchUsers();
        const user = users.find(u => u.username === username);

        if (user) {
            const userId = user.userId; 
            await removeMemberFromShoppingList(shoppingListId, userId);
        } else {
            console.log('Uživatel s tímto jménem nebyl nalezen.');
        }
    } catch (error) {
        console.error('Chyba při odstraňování uživatele ze seznamu:', error);
    }
};

const removeMemberFromShoppingList = async (shoppingListId, userId) => {
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/user/removeMember/${userId}`, 'DELETE');
};

export const addItemToShoppingList = async (shoppingListId, itemName) => {
    const newItem = {
        name: itemName,
        state: "open", 
        description: "x"
    };
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/products/addProduct`, 'POST', newItem);
};

export const updateProductNameInShoppingList = async (shoppingListId, productId, newName) => {
    const updateData = { name: newName };
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/products/updateProduct/${productId}`, 'PUT', updateData);
};

export const updateProductStatusInShoppingList = async (shoppingListId, productId, newStatus) => {
    const updateData = { state: newStatus };
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/products/updateProduct/${productId}`, 'PUT', updateData);
};

export const removeProductFromShoppingList = async (shoppingListId, productId) => {
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/products/removeProduct/${productId}`, 'DELETE');
};

export const fetchItemsFromShoppingList = async (shoppingListId) => {
    return callAPI(`${API_BASE_URL}/shoppingList/${shoppingListId}/products/get`, 'GET');
};
