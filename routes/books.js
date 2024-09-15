const express = require('express');
const ctrl = require('../controllers/books');
const {validateId, authenticate}  = require("../middlewares");
const {schemas} = require("../db/models/book");
const router = express.Router();


//------------------------------------------------------------------------------------------------

router.get('/top-books', ctrl.getTopBooks);
router.get('/categories',ctrl.getBookCategoryList);
router.get('/category', ctrl.getBooksOfCategory);
router.get('/shoppinglist', authenticate, ctrl.getShoppingListBooks);
router.get('/:id', validateId, ctrl.getBookById);

router.post('/shoppinglist/add/:id', authenticate, ctrl.addBookToShoppingList);

router.delete('/shoppinglist/remove/:id', authenticate, ctrl.removeBookFromShoppingList);

//------------------------------------------------------------------------------------------------


module.exports = router;
