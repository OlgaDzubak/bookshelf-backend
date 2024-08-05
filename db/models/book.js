const { Schema, model } = require("mongoose");
const joi = require("joi");


// ----- СХЕМИ МОДЕЛІ ДАНИХ КОЛЕКЦІЇ "BOOKS" -------------------------------------------------------------------
const buyLinkSchema = new Schema(
    { 
        name:{
                type:String,
             },
        url: {
                type:String,
             },
    }
);

    const bookSchema = new Schema(
        {
            list_name:{
                type: String,
                required: [true, 'Set category of the book (a string between 3 and 100 characters long)'],
                minlength: 3,
                maxlenght: 100,
            },
            date:{
                type: Date,
            },
            age_group:{
                type: String,
                minlength: 1,
                maxlenght: 2,
                match: /[1-9]{1,2}/,
                default: "",
            },
            amazon_product_url:{
                type: String,
                default: "https://www.amazon.com/",
            },
            article_chapter_link:{
                type: String,
                defailt: "",
            },
            author:{
                type: String,
                required: [true, 'Set author of the book (a string between 3 and 100 characters long)'],
                minlength: 3,
                maxlenght: 100,
            },
            book_image:{
                type: String,
                require:[true, 'Book image url is required'],
                default: "../../public/avatars/book_tamplate.png",
            },
            book_image_width:{
                type: String,
                default: '203',
                match: /[0-9]{1,2,3}/,
            },
            book_image_height:{
                type: String,
                default: '274',
                match: /[0-9]{1,2,3}/,
            },
            book_review_link:{
                type: String,
                defailt: 'Sorry, not specified',
            },
            book_uri:{
                type: String,
            },            
            contributor:{
                type: String,
            },
            contributor_note:{
                type: String,
            },
            description:{
                type: String,
                maxlenght: 600,
            }, 
            first_chapter_link:{
                type: String,
            },
            price:{
                type: String,
                match: /^\d+(,\d{1,2})?$/,
            },
            primary_isbn10:{
                type: String,
                match: /[0-9]{10}/,       
            },
            primary_isbn13:{
                type: String,
                match: /[0-9]{13}/,
            },           
            publisher:{
                type:String,
            },
            rank:{
                type:String,
                match: /[0-9]{1,2,3}/,
            },
            rank_last_week:{
                type:String,
                match: /[0-9]{1,2,3}/,        
            },
            sunday_review_link:{
                type:String,        
            },
            title: {
                type:String,
                minlength: 2,
                maxlenght: 100,
                required: [true, 'Set title of the book (a string between 3 and 100 characters long)'],
            },
            weeks_on_list:{
                type:String,
                match: / [0-9]{1,2,3}/,
            },
            buy_links:{
                type: [buyLinkSchema],
            },
        },
        {  
            versionKey: false,
            timestamps: {
                createdAt: 'created_date',
                updatedAt: 'updated_date',
                
            },
        }
    );

   
    // створюємо модель Book
    const Book = model('Book', bookSchema);




// ----- СХЕМИ ВАЛІДАЦІЇ ДАНИХ В ТІЛІ HTTP-запиту КОЛЕКЦІЇ "BOOKS"-----------------------------------------------------------

    const addSchema = joi.object({
        //назва книги
        title : joi.string().required().min(3).max(100).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required title field";
                                        break;
                        case "string.empty":
                                        err.message = "title field should not be empty!";
                                        break;
                        case "string.min":
                                        err.message = `title field should have at least ${err.local.limit} characters!`;
                                        break;
                        case "string.max":
                                        err.message = `title field should have ${err.local.limit} characters maximum!`;
                                        break;
                        default:
                                        break;
                    }
            });
            return errors;
            }),
        //категорія книги
        list_name : joi.string().required().error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required book category field";
                                        break;
                        case "string.empty":
                                        err.message = "book category field should not be empty!";
                                        break;
                        default:
                                        break;
                    }
            });
            return errors;
            }),    
        //автор книги
        author : joi.string().required().min(3).max(100).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required author field";
                                        break;
                        case "string.empty":
                                        err.message = "author field should not be empty!";
                                        break;
                        case "string.min":
                                        err.message = `author field should have at least ${err.local.limit} characters!`;
                                        break;
                        case "string.max":
                                        err.message = `author field should have ${err.local.limit} characters maximum!`;
                                        break;
                        default:
                                        break;
                    }
            });
            return errors;
            }),
        //опис книги
        description : joi.string().max(600).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "string.max":
                                        err.message = `description field should have ${err.local.limit} characters maximum!`;
                                        break;
                        default:
                                        break;
                    }
            });
            return errors;
            }),
        //обмеження віку
        age_group : joi.array().min(1).max(2).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "array.min":
                            err.message = `age_group field should have at least ${err.local.limit} characters!`;
                            break;
                        case "array.max":
                            err.message = `age_group field should have ${err.local.limit} characters maximum!`;
                            break;
                    }
            });
            return errors;
            }),


    });

    const schemas = {
        addSchema
    }

    module.exports = { Book, schemas, };
