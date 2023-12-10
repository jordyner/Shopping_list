const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 8088;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }, { limit: '50mb' }));

const { check,validationResult } = require('express-validator')
const actorFilePath = path.join(__dirname, 'data/actors.json');
const shoppingListsFilePath = path.join(__dirname, 'data/shoppingLists.json');
const usersFilePath = path.join(__dirname, 'data/users.json');

app.listen(
    PORT,
    () => console.log('it alive on http://localhost:' + PORT)
)

// product/create
// product/get/{productId}
// product/update/{productId}
// product/remove/{productId}
// shoppingList/create
// shoppingList/get/{shoppingListId}
// shoppingList/remove/{shoppingListId}
// shoppingList/user/addMember/{memberId}
// shoppingList/user/removeMember/{memberId}
// user/create

function readFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeFile(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    fs.readFile(actorFilePath, 'utf8', (err, data) => {
    if (err) {
        return res.status(500).send('Server error during reading actors file.');
    }

    const actors = JSON.parse(data).actors;
    const actor = actors.find(a => a.token === token);

    if (actor) {
        req.user = { id: actor.id, role: actor.role };
        next();
    } else {
        res.status(401).send('Unauthorized: Invalid token');
    }
    });
}

function requiredRoleCheck(requiredRole) {
    return function(req, res, next) {
        if (req.user && requiredRole.includes(req.user.role)) {
            console.log(req.user)
            console.log(req.user.role)
            next();
        } else {
            res.status(400).json({
                code: "noPermission",
                message: "You do not have required permission to perform this action",
                requiredRole: requiredRole
            });
        }
    }
}

function generateFirstAvailableId(dataObjects){
    const existingIds = Object.keys(dataObjects).map((id) => parseInt(id));
    existingIds.sort((a, b) => a - b);

    let firstFreeId = 1;
    for (const id of existingIds) {
        if (id === firstFreeId) {
            firstFreeId++;
        } else {
            break;
        }
    }

    return firstFreeId
}

function valueExistenceInList(list, value){
    console.log(list)
    for (let i = 0; i < list.length; i++) {
        if (list[i] === value) {
            return true;
        }
    }
    return false;
}

app.use(verifyToken);

app.post("/shoppingList/create", requiredRoleCheck(['admin', 'user', 'member']), [
        check('name').notEmpty().isString(),
    ], (req, res) => {
    const incoming = req.body; 
    const shoppingLists = readFile(shoppingListsFilePath);
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            code: "missingBodyElement",
            message: "Some required element is missing",
            errors: { errors: errors.array(), incoming}
        });
    }

    const newShoppingList = {
        id: generateFirstAvailableId(shoppingLists), 
        name: incoming.name,
        created: new Date(),
        state: 'active',
        owner: req.user.id,
        members: [req.user.id],
        products: {}
    };

    shoppingLists[newShoppingList.id] = newShoppingList;
    writeFile(shoppingLists, shoppingListsFilePath);

    res.status(200).send({
        success: true,
        message: "Shopping list created successfully.",
        data: newShoppingList
    });
});

app.get("/shoppingList/get/:id", requiredRoleCheck(['admin', 'user', 'member']), (req, res) => {
    const shoppingListsId = req.params.id;
    const shoppingLists = readFile(shoppingListsFilePath);
    
    if(!shoppingLists.hasOwnProperty(shoppingListsId)){
        return res.status(400).json({
            code: "missingShoppingListId",
            message: "This shoppingList does not exist",
            shoppingListsId: shoppingListsId
        });
    }

    res.status(200).send({
        success: true,
        message: `Shopping list with ID ${shoppingListsId} retrieved successfully.`,
        data: shoppingLists[shoppingListsId]
    });
});

app.delete("/shoppingList/remove/:id", requiredRoleCheck(['admin', 'user']), (req, res) => {
    const incoming = req.params;
    const shoppingLists = readFile(shoppingListsFilePath);

    if(!shoppingLists.hasOwnProperty(incoming.id)){
        return res.status(400).json({
            code: "missingShoppingListId",
            message: "This shoppingList does not exist",
            shoppingListsId: shoppingListsId
        });
    }

    delete shoppingLists[incoming.id]
    writeFile(shoppingLists, shoppingListsFilePath);

    res.status(200).send({
        success: true,
        message: `Successfully removed shopping list.`,
        data: shoppingLists[incoming.id]

    });
});

app.get("/shoppingList/list", requiredRoleCheck(['admin', 'user', 'member']), (req, res) => {
    const shoppingLists = readFile(shoppingListsFilePath);
    console.log(shoppingLists)
    if (Object.keys(shoppingLists).length === 0) {
        res.status(200).send({
            success: true,
            message: "No shopping lists found.",
            code: "emptyShoppingLists",
            data: shoppingLists
        });
    } else {
        res.status(200).send({
            success: true,
            message: "Shopping lists retrieved successfully.",
            data: shoppingLists
        });
    }
});

app.put("/shoppingList/:id/user/addMember/:memberId", requiredRoleCheck(['admin', 'user']), (req, res) => {
    const userId = req.params.memberId;
    const shoppingLists = readFile(shoppingListsFilePath);
    const users = readFile(usersFilePath);
    const shoppingListId = req.params.id;

    if(!users.hasOwnProperty(userId)){
        return res.status(400).json({
            code: "nonExistentUserId",
            message: "This user does not exist",
            userId: userId 
        });
    }
    else if(!shoppingLists.hasOwnProperty(parseInt(shoppingListId))){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId 
        });
    }
    else if(valueExistenceInList(shoppingLists[shoppingListId]["members"], parseInt(userId))){
        return res.status(400).json({
            code: "duplicateUserId",
            message: "This user was already added",
            userId: userId 
        });
    }
    console.log(shoppingListId)
    shoppingLists[shoppingListId]["members"].push(parseInt(userId))
    writeFile(shoppingLists, shoppingListsFilePath)

    res.status(200).send({
        success: true,
        message: `Member with ID ${userId} added successfully to the shopping list.`,
        shoppingList: shoppingLists[shoppingListId]
    });
});

app.delete("/shoppingList/:id/user/removeMember/:memberId", requiredRoleCheck(['admin', 'user']), (req, res) => {
    const userId = req.params.memberId;
    const shoppingLists = readFile(shoppingListsFilePath);
    const users = readFile(usersFilePath);
    const shoppingListId = req.params.id;

    if(!users.hasOwnProperty(userId)){
        return res.status(400).json({
            code: "nonExistentUserId",
            message: "This user does not exist",
            userId: userId 
        });
    }
    else if(!shoppingLists.hasOwnProperty(shoppingListId)){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId 
        });
    }
    else if(!valueExistenceInList(shoppingLists[shoppingListId]["members"], parseInt(userId))){
        return res.status(400).json({
            code: "duplicateUserId",
            message: "This user was already added",
            userId: userId 
        });
    }

    const index = shoppingLists[shoppingListId]["members"].indexOf(parseInt(userId))
    shoppingLists[shoppingListId]["members"].splice(index, 1)
    writeFile(shoppingLists, shoppingListsFilePath)

    res.status(200).send({
        success: true,
        message: `Member with ID ${userId} removed successfully to the shopping list.`,
        shoppingList: shoppingLists[shoppingListId]
    });
});

app.post("/shoppingList/:id/products/addProduct", requiredRoleCheck(['admin', 'user', 'member']), [
    check('name').notEmpty().isString(),
    check('description').notEmpty().isString(),
    check('state').notEmpty().isString(),
], (req, res) => {
    const shoppingListId = req.params.id
    const incoming = req.body;
    const shoppingLists = readFile(shoppingListsFilePath);
    const errors = validationResult(req);
    
    if(!shoppingLists.hasOwnProperty(shoppingListId)){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId 
        });
    }
    else if(!errors.isEmpty()){
        return res.status(400).json({
            code: "missingElementInBody",
            message: "You have to specift required elements",
            body: req.body 
        });
    }

    incoming['addedBy'] = req.user.id 
    incoming['productId'] = generateFirstAvailableId(shoppingLists[shoppingListId]["products"])
    incoming['shoppingListId'] = parseInt(shoppingListId)

    shoppingLists[shoppingListId]["products"][incoming.productId] = incoming
    writeFile(shoppingLists, shoppingListsFilePath)

    res.status(200).send({
        success: true,
        message: `Product with ID ${incoming.productId} added successfully to the shopping list.`,
        shoppingList: shoppingLists[shoppingListId]["products"][incoming.productId]
    });
});

app.delete("/shoppingList/:id/products/removeProduct/:productId", requiredRoleCheck(['admin', 'user']), (req, res) => {

    const shoppingListId = req.params.id
    const productId = req.params.productId
    const shoppingLists = readFile(shoppingListsFilePath);

    if(!shoppingLists.hasOwnProperty(shoppingListId)){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId 
        });
    }
    else if(!valueExistenceInList(Object.keys(shoppingLists[shoppingListId]["products"]), (productId))){
        return res.status(400).json({
            code: "missingProduct",
            message: "This product is not part of the shopping List",
            productId: productId 
        });
    }

    delete shoppingLists[shoppingListId]["products"][productId]
    writeFile(shoppingLists, shoppingListsFilePath)

    res.status(200).send({
        success: true,
        message: `Product with ID ${productId} removed successfully from the shopping list.`,
        shoppingList: shoppingLists[shoppingListId]
    });
})

app.put("/shoppingList/:id/products/updateProduct/:productId", requiredRoleCheck(['admin', 'user','member']), [
    check().custom((value, { req }) => {
        if (!req.body.name && !req.body.description && !req.body.state) {
            throw new Error('At least one of the fields must be provided');
        }
        return true;
    })
], (req, res) => {
    const shoppingListId = req.params.id
    const productId = req.params.productId
    const incoming = req.body
    const shoppingLists = readFile(shoppingListsFilePath);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            code: "missingBodyElement",
            message: "Some required element is missing",
            errors: { errors: errors.array(), incoming}
        });
    }

    if(!shoppingLists.hasOwnProperty(shoppingListId)){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId
        });
    } else if(!shoppingLists[shoppingListId]["products"].hasOwnProperty(productId)){
        return res.status(400).json({
            code: "nonExistentProduct",
            message: "This product does not exist",
            productId: productId
        });
    }
    

    for (const key in incoming) {
        if (shoppingLists[shoppingListId]["products"][productId].hasOwnProperty(key)) {
            shoppingLists[shoppingListId]["products"][productId][key] = incoming[key];
        }
    }

    writeFile(shoppingLists, shoppingListsFilePath);

    res.status(200).send({
        success: true,
        message: "Product updated successfully",
        productId: productId,
        updatedFields: incoming
    });
});

app.get("/shoppingList/:id/products/get", requiredRoleCheck(['admin', 'user', 'member']), (req, res) => {
    const shoppingListsId = req.params.id;
    const shoppingLists = readFile(shoppingListsFilePath);

    if(!shoppingLists.hasOwnProperty(shoppingListsId)){
        return res.status(400).json({
            code: "nonExistentShoppingList",
            message: "This shoppingList does not exist",
            shoppingListId: shoppingListId 
        });
    }

    res.status(200).send({
        success: true,
        message: `Shopping list with ID ${shoppingListsId} retrieved successfully.`,
        data: shoppingLists[shoppingListsId]["products"]
    });
});

app.post("/user/create", requiredRoleCheck(['admin']), [
        check('username').notEmpty().isString(),
        check('firstname').notEmpty().isString(),
        check('surname').notEmpty().isString(),
        check('role').notEmpty().isArray(),
        check('address').custom((value) => {
            if (!Array.isArray(value) || value.length !== 3) {
                throw new Error('Address must be an array with 3 elements');
            }
            return true;
        }).isArray()
    ], (req, res) => {

    const incoming = req.body;
    const users = readFile(usersFilePath);
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            code: "missingBodyElement",
            message: "Some required element is missing",
            errors: { errors: errors.array(), incoming}
        });
    }

    incoming["userId"] = generateFirstAvailableId(users)

    users[incoming.userId] = incoming;
    writeFile(users, usersFilePath);

    res.status(201).send({
        success: true,
        message: "User created successfully.",
        user: incoming 
    });
});

app.get("/user/get/:id", requiredRoleCheck(['admin', 'user', 'member']), (req, res) => {
    const userId = req.params.id;
    const users = readFile(usersFilePath);

    res.status(200).send({
        success: true,
        message: `Shopping list with ID ${userId} retrieved successfully.`,
        data: users[userId]
    });
});

app.get("/user/list", requiredRoleCheck(['admin', 'user', 'member']), (req, res) => {
    const users = readFile(usersFilePath);

    res.status(200).send({
        success: true,
        message: `Users retrieved successfully.`,
        data: users
    });
});

app.put("/shoppingList/update/:id", requiredRoleCheck(['admin', 'user','member']), (req, res) => {
    const shoppingListId = req.params.id
    const incoming = req.body
    const shoppingLists = readFile(shoppingListsFilePath);

    for (const key in incoming) {
        if (shoppingLists[shoppingListId].hasOwnProperty(key)) {
            console.log(shoppingLists[shoppingListId][key])
            shoppingLists[shoppingListId][key] = incoming[key];
        }
    }

    writeFile(shoppingLists, shoppingListsFilePath);

    res.status(200).send({
        success: true,
        message: "Product updated successfully",
        productId: shoppingListId,
        updatedFields: incoming
    });
});