const {User} = require("../db/models/user");
const {httpError, ctrlWrapper, streamUpload, sendEmail} = require('../helpers');
require('dotenv').config();
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

// оновлення даних про поточного користувача (можемо оновити або аватар та/або ім'я юзера)
  const updateUser = async (req, res) => {
    
    if (req.fileValidationError){
      throw httpError(500, "Wrong file format.");
    }
    
    let newUserName, newAvatarURL, usr;
    
    const {id, name: currentUserName} = req.user;
    const {name} = req.body;
    
    if (!name) { 
      newUserName = currentUserName;
    }else { 
      newUserName = name;
    }
     
    if (!req.file) {   
      usr = await User.findByIdAndUpdate(id, {name: newUserName}, {new: true});
      res.status(200).json({
                              "accessToken": usr.accessToken,
                              "user": {
                                "name": usr.name,
                                "email": usr.email,
                                "avatarURL": usr.avatarURL,
                                "shopping_list": usr.shopping_list,
                              }
                           });   
    }else {   
        
        newAvatarURL = req.file.path;
        
        const result = await streamUpload(req.file.buffer);
        console.log(result);

        usr = await User.findByIdAndUpdate(id, {name: newUserName, avatarURL: newAvatarURL}, {new: true});
    
        res.status(200).json({
                              "accessToken": usr.accessToken,
                              "user": {
                                "name": usr.name,
                                "email": usr.email,
                                "avatarURL": usr.avatarURL,
                                "shopping_list": usr.shopping_list,
                              }
                            });    
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
};
