const { Book } = require('../db/models/book');
const { User } = require('../db/models/user');
const { httpError, ctrlWrapper} = require('../helpers');
const { mongoose } = require("mongoose");


//------ КОНТРОЛЛЕРИ ДЛЯ РОБОТИ ІЗ КОЛЛЕКЦІЄЮ BOOKS ( для маршрута /books) ----------------------------


    const getTopBooks = async (req, res) => {

      const { per_page } = req.query;
      const topBooks = [];

      const categories = await Book.distinct("list_name");

      if (!categories){
        throw httpError(404, "Not found");
      }

      for (const category of categories){
        const item = {
              category,
              books : await Book.find({list_name : category})
                                .sort({rank_last_week : -1})
                                .limit(per_page)
                                .select({ _id: 1, title: 1, author : 1, description : 1, book_image: 1, rank:1, buy_links : 1}),
        };
        topBooks.push(item);
      }

      res.json(topBooks);
    };

    const getBookCategoryList = async (req, res) => {
      const categories = await Book.distinct("list_name");
      res.json(categories);
    }

    const getBooksOfCategory = async (req, res) =>{
      const {q} = req.query; //per_page
      const books = await Book.find({list_name : q}, { _id: 1, title: 1, author : 1, description : 1, book_image: 1, buy_links : 1});
                              //.limit(per_page);
      if (!books) {
        throw httpError(404, "Not found");
      }

      res.json(books);
    }

    const getBookById = async (req, res) => {
      const {id} = req.params;
      const book = await Book.findById(id, {title:1, author:1, list_name:1, book_image:1, description:1, buy_links:1});
      if (!book) { 
        throw httpError(404, "Not found");
      }
      res.json(book);
    }

    // функції для роботи з shopping list
    const getShoppingListBooks = async (req, res) => {

      const { shopping_list } = req.user;
      const books = [];
      
      await shopping_list.forEach(id => {
        console.log("id=",id);
        const book = Book.findById(id, {"_id": 1, title:1, author:1, list_name:1, book_image:1, description:1, buy_links:1});
        console.log("book=",book);
        if (!book) { throw httpError(404, `Not found ${id}`); }
        books.push(book);
      });

    //  const books = await Book.find({"id": { $in : shopping_list }}, {_id: 1, title:1, author:1, list_name:1, book_image:1, description:1, buy_links:1});
    //  if (!books) { throw httpError(404, "Not found"); }
      res.json({
          accessToken: req.accessToken,
          books});
    }

    const addBookToShoppingList = async (req, res) => {

      const { id: bookId } = req.params;

      const book = await Book.findById(bookId);

      if (!book) {
        throw httpError(404, "Not Found");
      }

      const { id: userId, shopping_list } = req.user;

      if (shopping_list.indexOf(bookId) >= 0){ 
        throw httpError(409, `Book ${bookId} is already in shopping list.`);
      }

      const result = await User.findByIdAndUpdate( userId, { $push: { shopping_list : bookId } }, { new: true } );
      
      const {accessToken, shopping_list: newShopping_list} = result;
      res.status(201).json({
        "accessToken": accessToken,
        "shopping_list": newShopping_list,
      });

    }

    const removeBookFromShoppingList = async (req, res) => {
        
      const {  id: bookId } = req.params;
      const { id: userId, shopping_list} = req.user;

      if (shopping_list.indexOf(bookId) === -1) {
        throw httpError(403, `Book ${bookId} is not in shopping list.`);
      }

      const result = await User.findByIdAndUpdate( userId, { $pull: { shopping_list :  bookId } }, { new: true } );
      
      const {accessToken, shopping_list: newShopping_list} = result;

      res.status(201).json({
        "accessToken": accessToken,
        "shopping_list": newShopping_list,
      });
    }

//--------------------------------------------------------------------------------------------------------

module.exports = {
  getTopBooks : ctrlWrapper(getTopBooks),
  getBookCategoryList : ctrlWrapper(getBookCategoryList),
  getBookById : ctrlWrapper(getBookById),
  getBooksOfCategory : ctrlWrapper(getBooksOfCategory), 
  getShoppingListBooks : ctrlWrapper(getShoppingListBooks),
  addBookToShoppingList : ctrlWrapper(addBookToShoppingList),
  removeBookFromShoppingList : ctrlWrapper(removeBookFromShoppingList)
}
