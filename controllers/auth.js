const {User} = require("../db/models/user");
const { httpError, ctrlWrapper, sendEmail} = require('../helpers');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const {v4} = require('uuid');
const path = require("path");
const { Console } = require("console");
const fs = require("fs").promises;
require('dotenv').config();

const {SECRET_KEY, BASE_URL} = process.env; 

//------ КОНТРОЛЛЕРИ ДЛЯ РОБОТИ ІЗ КОЛЛЕКЦІЄЮ USERS (для реєстрації, авторизації, розаавторизації) ----------------------------

// + реєстрація нового користувача
  const signup = async (req, res) => {

    const {name, email, password} = req.body;                                 // забираємо з запиту дані юзера
    
    const user = await User.findOne({email});                                 // перевіряємо чи немає в базі юзера з таким email
    if (user) {                                                               // якщо є, то видаємо помилку
      throw httpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);                     // хушуємо пароль
    
    const newUser = await User.create({name, email, password: hashPassword}); // створюємо в базі нового юзера  

    const tokens = generateAccessAndRefreshToken(newUser._id, 15, 120);       // генеруємо access та refresh токени
      
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

    
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });          // зберігаємо токени в httpOnly-cookie
    res.cookie('accessToken',  tokens.accessToken,  { httpOnly: true, secure: true, sameSite: 'strict' });          // зберігаємо токени в httpOnly-cookie

    res.status(201).json({
      //"accessToken": tokens.accessToken, 
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

    const tokens = generateAccessAndRefreshToken(user._id, 15, 120);              // по id користувача генеруємо два токени accessToken та refreshToken
    
    //if (!user.verify) { throw httpError(401,"Email or password is wrong");}     // перевіряємо чи пройшов email юзера верифікацію

    await User.findByIdAndUpdate(user._id, tokens);                               // записуємо токени в базу користувачів

    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });          // зберігаємо токени в httpOnly-cookie
    res.cookie('accessToken',  tokens.accessToken,  { httpOnly: true, secure: true, sameSite: 'strict' });          // зберігаємо токени в httpOnly-cookie

    res.status(200).json( {                                                       // повертаємо в response об'єкт з токенами та юзером
     // "accessToken":  tokens.accessToken,
      "user": {
        "name": user.name,
        "email": user.email,
        "avatarURL": user.avatarURL,
        "birthdate": user.birthdate,
        "shopping_list": user.shopping_list,
      }
    });
  }
  
// + розавторизація користувача
  const signout = async (req, res) => {
    const {_id} = req.user;
    const user = await User.findByIdAndUpdate(_id, {accessToken: "", refreshToken: ""});
    if (!user) { throw httpError(401, "Not authorized"); }
    res.status(204).json({});
  }

  function generateAccessAndRefreshToken(userId, accessMinutes, refreshMinutes){
    
    try{

      const payload1 = { id: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (accessMinutes * 60)
       }; 
      const accessToken = jwt.sign(payload1, SECRET_KEY);

      const payload2 = { id: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (refreshMinutes * 60)
       }; 
      const refreshToken = jwt.sign(payload2, SECRET_KEY);
      
      return {accessToken, refreshToken};

    }catch(error){
      throw httpError(500, "Something went wrong while generating access and refresh token"); 
    }
  }

//---------------------------------------------------------------------------------------------------------

module.exports = {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};

