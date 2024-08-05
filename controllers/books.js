const { Book } = require('../db/models/book');
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
      const {q} = req.query;
      const books = await Book.find({list_name : q}, { _id: 1, title: 1, author : 1, description : 1, book_image: 1, buy_links : 1});
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

//--------------------------------------------------------------------------------------------------------

module.exports = {
  getTopBooks : ctrlWrapper(getTopBooks),
  getBookCategoryList : ctrlWrapper(getBookCategoryList),
  getBookById : ctrlWrapper(getBookById),
  getBooksOfCategory : ctrlWrapper(getBooksOfCategory),  
}