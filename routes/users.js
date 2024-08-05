const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.get('/current/shopping_list', authenticate, ctrl.getShoppingListBooks);

router.patch('/update', authenticate, upload.single("avatar"), ctrl.updateUser);

router.post('/subscribe',authenticate, ctrl.subscribe);
router.post('/current/shopping_list/add/:id', authenticate, ctrl.addBookToShoppingList);

router.delete('/current/shopping_list/remove/:id', authenticate, ctrl.removeBookFromShoppingList);

// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
