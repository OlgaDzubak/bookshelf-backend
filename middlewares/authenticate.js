const { httpError, generateAccesAndRefreshToken } = require('../helpers');
const jwt = require("jsonwebtoken");
const {User} = require("../db/models/user");
require('dotenv').config();

const {SECRET_KEY} = process.env;

// middleware <authenticate> для перевірки токена
const authenticate = async (req, res, next) => {
    
    const {authorization = ""} = req.headers;
    const [bearer, accessToken] = authorization.split(" ");  // забираємо з заголовків запиту accessToken    

    if (bearer !== "Bearer") {
        next(httpError(401, "Not authorized"));
    }

    try {
        const {id} = jwt.verify(accessToken, SECRET_KEY);     // забираємо з токена id юзера
        const user = await User.findById(id);                 // шукаємо в базі юзера за йього id

        //Видаємо помилку "Not authorized" якщо юзер не знайдений, або 
        if (!user || !user.accessToken || (user.accessToken != accessToken) || (user.accessToken.exp < (Math.floor(Date.now() / 1000)))) {  // 
            next(httpError(401, "Not authorized"));
        }

        req.user = user;

        const {_id, email, name, avatarURL, birthdate, shopping_list} = req.user;
        console.log("Аuthentication is succesfull. Current user=", {_id:id, email, name, avatarURL, birthdate, shopping_list});

        next();
    }catch(error)
        {
            next(httpError(401, "Not authorized"));
    }
        
}

module.exports = authenticate;
