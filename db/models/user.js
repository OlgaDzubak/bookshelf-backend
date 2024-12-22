const { Schema, model } = require("mongoose"); 
const joi = require("joi");

// регулярні вирази для email та раполя користувача
const nameRegExp = /^(?![\d+_@.-]+$)[a-zA-Z0-9+_@.-]*$/;
const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passRegExp = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

const now = new Date();

// ----- СХЕМА МОДЕЛІ ДАНИХ КОЛЕКЦІЇ "USERS" ---------------------------------------------------------------------------------
    const userSchema = new Schema(
        {
            //дані з форми регістрації
            name: {
                type: String,
                required: [true, 'Set name for user'],
                match: nameRegExp,
                minlength: 2,
                maxlength: 30,
            },
            email: {
                type: String,
                required: [true, 'Email is required: example@mail.com'],
                match: emailRegExp,
                unique: true,
            },
            password: {
                type: String,
                required: [true, 'Set password for user'],
                // minlength: 8,
                // maxlength: 35,
                match: passRegExp,
            },
            sibscribeStatus: {
                type: Boolean,
                default: false,
            },
            avatarURL:{
                type: String,
                required: [true, 'Avatar url is required'],
                default: "../../public/avatars/userAvatar.png",
            }, 
            shopping_list: {
                type: Array,
                ref: 'Book',
                default:[],
            },
            accessToken: {
                type : String,
                default: "",
            },
            refreshToken: {
                type : String,
                default: "",
            },
            // verify: {
            //     type: Boolean,
            //     default: false,
            // },
            // verificationToken: {
            //     type: String,
            //     required: [true, 'Verify token is required'],
            // },

        },
        {  
            versionKey: false,
            timestamps: true,
        } 
    );

    // створюємо модель User
    const User = model('User', userSchema);



// ----- СХЕМИ ВАЛІДАЦІЇ ДАНИХ В ТІЛІ HTTP-запиту ДО КОЛЕКЦІЇ USERS (кастомні повідомлення про помилки)----------------------
    
    const signUpSchema = joi.object({
        name : joi.string().required().min(2).max(30).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required name field";
                                        break;
                        case "string.empty":
                                        err.message = "name field should not be empty!";
                                        break;
                        case "string.min":
                                        err.message = `name field should have at least ${err.local.limit} characters!`;
                                        break;
                        case "string.max":
                                        err.message = `name field should have ${err.local.limit} characters maximum!`;
                                        break;
                        case "string.pattern.base" :
                                        err.message = 'wrong name, only letters, digits and symbols "+ _ @ . -" are allowed!';
                                        break;
                        default:        break;
                    }
            });
            return errors;
            }),
        password: joi.string().required().error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required password field";
                                        break;
                        case "string.empty":
                                        err.message = "password field should not be empty!";
                                        break;
                        // case "string.min":
                        //                 err.message = `password field should have at least ${err.local.limit} characters!`;
                        //                 break;
                        // case "string.max":
                        //                 err.message = `password field should have ${err.local.limit} characters maximum!`;
                        //                 break;
                        default:
                                        break;
                        }
                });
                return errors;
            }),
        email: joi.string().pattern(emailRegExp).required().error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required email field";
                                        break;
                        case "string.empty":
                                        err.message = "email field should not be empty!";
                                        break;
                        case "string.pattern.base" :
                                        err.message = "email field must be a valid email in format example@mail.com";
                                        break;
                        default:
                                        break;
                        }
                });
                return errors;
            }),

    });

    const signInSchema = joi.object({
        email: joi.string().pattern(emailRegExp).required().error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                    case "any.required": 
                                    err.message = "missing required email field";
                                    break;
                    case "string.empty":
                                    err.message = "email field should not be empty!";
                                    break;
                    case "string.pattern.base" :
                                    err.message = "email field must be a valid email!";
                                    break;
                    default:
                                    break;
                    }
            });
            return errors;
            }),
        password: joi.string().pattern(passRegExp).required().min(8).max(35).error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required password field";
                                        break;
                        case "string.empty":
                                        err.message = "password field should not be empty!";
                                        break;
                        case "string.min":
                                        err.message = `password field should have at least ${err.local.limit} characters!`;
                                        break;
                        case "string.max":
                                        err.message = `password field should have ${err.local.limit} characters maximum!`;
                                        break;
                        case "string.pattern.base":
                                        err.message = `password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters`;
                        default:
                                        break;
                        }
                });
                return errors;
            }),
    });

    const updateSchema = joi.object({
        name : joi.string().min(2).max(30).error(errors => {
            errors.forEach(err => {
                switch (err.code) {
                        case "string.empty":
                                        err.message = "name field should not be empty!";
                                        break;
                        case "string.min":
                                        err.message = `name field should have at least ${err.local.limit} characters!`;
                                        break;
                        case "string.max":
                                        err.message = `name field should have ${err.local.limit} characters maximum!`;
                                        break;
                        case "string.pattern.base" :
                                        err.message = 'wrong name, only letters, digits and symbols "+ _ @ . -" are allowed!';
                                        break;
                        default:
                                        break;
                    }
            });
            return errors;
        }),

    })

    const emailSchema = joi.object({
        email: joi.string().pattern(emailRegExp).required().error(errors => {
                errors.forEach(err => {
                    switch (err.code) {
                        case "any.required": 
                                        err.message = "missing required field email";
                                        break;
                        case "string.empty":
                                        err.message = "email field should not be empty!";
                                        break;
                        case "string.pattern.base" :
                                        err.message = "email field must be a valid email!";
                                        break;
                        default:
                                            break;
                        }
                });
                return errors;
            }),
    });

    const schemas = {
        signUpSchema,
        signInSchema,
        updateSchema,
        emailSchema,
    }


    module.exports = { User, schemas, };