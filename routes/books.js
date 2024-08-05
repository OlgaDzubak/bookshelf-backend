const express = require('express');
const ctrl = require('../controllers/books');
const {validateId, authenticate}  = require("../middlewares");
const {schemas} = require("../db/models/book");
const router = express.Router();


//------------------------------------------------------------------------------------------------

router.get('/top-books', ctrl.getTopBooks);
router.get('/categories',ctrl.getBookCategoryList);
router.get('/category', authenticate, ctrl.getBooksOfCategory);
router.get('/:id', authenticate, validateId, ctrl.getBookById);

//------------------------------------------------------------------------------------------------


module.exports = router;
