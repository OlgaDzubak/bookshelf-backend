const {User} = require("../db/models/user");
const { ctrlWrapper, sendEmail } = require('../helpers');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

//const {Book} = require("../db/models/book");
//const bcrypt = require("bcrypt");
//const jwt = require('jsonwebtoken');
//const {v4} = require('uuid');
//const path = require("path");



const {SECRET_KEY, BASE_URL} = process.env;


//------ КОНТРОЛЛЕРИ ДЛЯ РОБОТИ ІЗ КОЛЛЕКЦІЄЮ USERS (для залогіненого юзера) -----------------------------

// поверення поточного користувача
  const getCurrent = async(req, res) => {

    const {accessToken} = req;
    const {name, email, avatarURL, shopping_list} = req.user;
    
    res.status(200).json({
                          "accessToken": accessToken,
                          "user": {
                            "name": name,
                            "email": email,
                            "avatarURL": avatarURL,
                            "shopping_list": shopping_list,
                          }});
  }

// оновлення даних про поточного користувача (можемо оновити або аватар, або ім'я юзера - user profile window)
  const updateUser  = async(req, res) => {

    let newUserName, newAvatarURL;
    
    const {id, name: currentUserName} = req.user;                                                  //забираємо поточне ім'я юзера
    const {name} = req.body;                                                                        //забираємо нове ім'я юзера
    
    if (!name) { 
      newUserName = currentUserName
    }
    else { 
      newUserName = name
    };
    
    console.log("req.file", req.file);
    if (!req.file)                                                                             // якщо нового файлу аватара немає, то змінемо лише ім'я юзера
      {      
        const usr = await User.findByIdAndUpdate(id, {name: newUserName}, {new: true});            // оновлюємо ім'я поточного юзера   
        
        res.status(200).json({
          "accessToken": usr.accessToken,
          "user": {
            "name": usr.name,
            "email": usr.email,
            "avatarURL": usr.avatarURL,
            "shopping_list": usr.shopping_list,
          }});
      }
    else                                                                                            // якщо є новий файл аватара, то закидуємо йього на claudinary, та оновлюємо name і avatatURL юзера
      {        
        newAvatarURL = req.file.path;
        
        console.log(newAvatarURL);

        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {   
              console.error(error);
              return res.status(500).json({ message: 'Помилка при завантаженні на Cloudinary' });
          }
          const { secure_url: newAvatarURL} = result;                                                 // отрисуємо з claudinary новий URL аватара 
        
        }).end(req.file.buffer);

        const usr = await User.findByIdAndUpdate(id, {name: newUserName, avatarURL: newAvatarURL}, {new: true}); // оновлюємо поля name та avatarURL для поточного юзера в базі
          
        res.json({name: usr.name , avatarURL: usr.avatarURL });
      }                
  }

// надсилання листа з повідомленням про підписку на розсилку
  const subscribe = async(req, res) => {
      const {email, name} = req.user;
       
      // створюємо поштове повідомлення
       const EmailAboutSubscription = {
        to: email,
        subject: `Subscription message from ${BASE_URL}`,
        html: ` <h1 style="font-size: 20px"> Hello, ${name}!</h1>
                <p  style="font-size: 16px"> You are subscribed to our newsletters. </p>
                <p  style="font-size: 16px"> You will recieve letters about new book arrivals. </p>
                <p  style="font-size: 16px"> Thank you! </p>

                <p  style="font-size: 14px"> Visit our site! 
                  <a target="_blank" href="https://olgadzubak.github.io/bookshelf/" style="font-size: 20px; font-wight:bolt">Drink Master web-site</a>
                </p>`
      };
      
      // відправляємо на email юзера лист з повіломленням про підписку
      await sendEmail(EmailAboutSubscription);

      res.json( { message: `Subscribtion successful. Letters about subscribtion was sent to your email ${email}` } );

  }
  

//---------------------------------------------------------------------------------------------------------

module.exports = {
  getCurrent                 : ctrlWrapper(getCurrent),
  updateUser                 : ctrlWrapper(updateUser),
  subscribe                  : ctrlWrapper(subscribe),
 // updateAvatar: ctrlWrapper(updateAvatar),
};
