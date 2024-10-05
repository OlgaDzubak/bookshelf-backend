const {User} = require("../db/models/user");
const { httpError, ctrlWrapper, sendEmail, generateAccessAndRefreshToken} = require('../helpers');
const bcrypt = require("bcrypt");
require('dotenv').config();

//const jwt = require('jsonwebtoken');
//const {v4} = require('uuid');
//const path = require("path");
//const { Console } = require("console");
//const fs = require("fs").promises;


const {SECRET_KEY, BASE_URL} = process.env; 

//------ КОНТРОЛЛЕРИ ДЛЯ РОБОТИ ІЗ КОЛЛЕКЦІЄЮ USERS (для реєстрації, авторизації, розаавторизації) ----------------------------

// + реєстрація нового користувача
  const signup = async (req, res) => {

    const {name, email, password} = req.body;                                 // забираємо з запиту дані юзера
    
    const user = await User.findOne({email});                                 // перевіряємо чи немає в базі юзера з таким email
    if (user) {                                                               // якщо є, то видаємо помилку
      throw httpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);                     // хешуємо пароль
    
    const newUser = await User.create({name, email, password: hashPassword}); // створюємо в базі нового юзера  

    const tokens = generateAccessAndRefreshToken(newUser._id, 1 , 2); //24 * 60 , 5 * 24 * 60);       // генеруємо access та refresh токени на добу та 5 діб відповідно
      
    await User.findByIdAndUpdate(newUser._id, { "accessToken":tokens.accessToken, "refreshToken":tokens.refreshToken }, {new: true});
    
    // ----------------------------------------------------------
    // блок з верифікацією email після реєстрації закоментила, що  залогінитися автоматом одазу після реєстрації
    // const verificationToken = v4();                                                                 // створюэмо токен для верифікації emai
    // const newUser = await User.create({...req.body, password: hashPassword, verificationToken,});   // створюємо нового юзера

    // відправляємо на email юзера лист для верифікації пошти 
    // const verifyEmail = {
    //   to: email,
    //   subject: "Verify email",
    //   html: `<a target="_blank" href="${BASE_URL}/auth/verify/${verificationToken}">Click verify email</a>`
    // };
    // await sendEmail(verifyEmail);

    // ----------------------------------------------------------
    res.cookie('refreshToken', tokens.refreshToken, {       
      expires: new Date(Date.now() + (3 * 60 * 1000)),       //(5 * 24 * 60 * 60 * 1000)),         // термін зберігання refresh-токена в cookie
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true
    });


    res.status(201)
       .json({                                                                   // повертаємо в response об'єкт з access-токеном та юзером
              "accessToken": tokens.accessToken, 
              "user": {
                "name": newUser.name,
                "email": newUser.email,
                "avatarURL": newUser.avatarURL
              }
            });

  }

// + верифікація електронної пошти юзера  
  const verifyEmail = async(req, res) => {
  const {verificationToken} = req.params;

  const user = await User.findOne({verificationToken});
  if (!user) { throw httpError(404, "User not found"); }

  await User.findByIdAndUpdate(user._id, {verify: true, verificationToken: ""});

  res.json({message: "Verification successful"})
  }

// + повторная верифікація електроної пошти користувача
  const resendVerifyEmail = async(req, res) => {
    const {email} = req.body;

    const user = await User.findOne({email});
    if (!user) {throw httpError(401, 'User not found')}
    if (user.verify){ throw httpError(400, 'Verification has already been passed') }

    //відправляємо на email юзера лист для верифікації пошти 
    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/auth/verify/${user.verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);

    res.json({ message: "Verification email sent" })
  }

// + авторизація користувача
  const signin = async (req, res) => {
    
    const {email, password} = req.body;                                           // отримуэмо з запиту email та пароль користувача
    const user = await User.findOne({email});                                     // перевіряємо наявність користувача, шукаємо за email
    
    if (!user) { throw httpError(401, "Email or Password is wrong"); }            // якщо юзера з email в базі немає, то видаємо помилку
    
    const comparePassword = await bcrypt.compare(password, user.password);        // перевіряємо пароль юзера
    if (!comparePassword){ throw httpError(401, "Email or Password is wrong"); }  // якщо пароль не вірний, то видаємо помилку

    const tokens = generateAccessAndRefreshToken(user._id, 24 * 60 , 5 * 24 * 60);// по id користувача генеруємо два токени accessToken та refreshToken
    
    //if (!user.verify) { throw httpError(401,"Email or password is wrong");}     // перевіряємо чи пройшов email юзера верифікацію

    await User.findByIdAndUpdate(user._id, tokens);                               // записуємо токени в базу користувачів

    const refreshTokenOptions = {
      expires: new Date(Date.now() +  (5 * 24 * 60 * 60 * 1000)),                 // термін зберігання refresh-токена в cookie
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      partitioned: true
    }

    res.status(200)
       .cookie('refreshToken', tokens.refreshToken, refreshTokenOptions)
       .json({  
              "accessToken": tokens.accessToken,                                                                  // повертаємо в response об'єкт з access-токеном, юзером та refresh-токено в кукі
              "user": {
                  "name": user.name,
                  "email": user.email,
                  "avatarURL": user.avatarURL,
                  "shopping_list": user.shopping_list,
              }
             });
  }
  
// + оновлення access токена за допомогою refresh токена
  // const refreshToken = async(req, res) => {
    
  //   const {SECRET_KEY} = process.env;
    
  //   console.log(req.cookie);
    
  //   const refreshToken = req.cookie.refreshToken;

  //   const {id} = jwt.verify(accessToken, SECRET_KEY);
  //   const user = await User.findById(id);  

  //   if ((!user) || (user.refreshToken != refreshToken) || (refreshToken.exp < (Math.floor(Date.now() / 1000)))){
  //     next(httpError(401, "Not authorized"));
  //   }

  //   const tokens = generateAccessAndRefreshToken(user._id, 15, 120);

  //   await User.findByIdAndUpdate(user._id, tokens);                              // записуємо токени в базу користувачів

  //   res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true});          // зберігаємо refresh-токен в httpOnly-cookie

  //   res
  //   .status(200)
  //   .json({                                                                    // повертаємо в response об'єкт з access-токеном та юзером
  //           "accessToken":  tokens.accessToken,
  //           "user": {
  //               "name": user.name,
  //               "email": user.email,
  //               "avatarURL": user.avatarURL,
  //               "birthdate": user.birthdate,
  //               "shopping_list": user.shopping_list,
  //             }
  //         })
  // }

// + розавторизація користувача
  const signout = async (req, res) => {
    const {_id} = req.user;
    const user = await User.findByIdAndUpdate(_id, {accessToken: "", refreshToken: ""});
    if (!user) { throw httpError(401, "Not authorized"); }
    res.status(204).json({});
  }

//---------------------------------------------------------------------------------------------------------

module.exports = {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};

