const { httpError, generateAccesAndRefreshToken } = require('../helpers');
const jwt = require("jsonwebtoken");
const {User} = require("../db/models/user");
require('dotenv').config();

const {SECRET_KEY} = process.env;

// middleware <authenticate> для перевірки токена
const authenticate = async (req, res, next) => {
    
    const {authorization = ""} = req.headers;
    const [bearer, accessToken] = authorization.split(" ");
    
    

    if (bearer !== "Bearer") {
        next(httpError(401, "Not authorized"));
    }

    try 
        {
            const {id} = jwt.verify(accessToken, SECRET_KEY);
            const user = await User.findById(id);

            if (!user || !user.accessToken || !user.refreshToken  || (user.accessToken != accessToken) || (user.refreshToken.exp < (Math.floor(Date.now() / 1000)))){
                next(httpError(401, "Not authorized"));
            }else if (user.accessToken.exp < (Math.floor(Date.now() / 1000))){

            }

            req.user = user;

            const {_id, email, name, avatarURL, birthdate, shopping_list} = req.user;
            console.log("Аuthentication is succesfull. Current user=", {_id:id, email, name, avatarURL, birthdate, shopping_list});

            next();
        }
    catch(error)
        {
            next(httpError(401, "Not authorized"));
        }
        
}

module.exports = authenticate;
