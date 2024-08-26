const { httpError, generateAccessAndRefreshToken } = require('../helpers');
const jwt = require("jsonwebtoken");
const {User} = require("../db/models/user");
require('dotenv').config();


const {SECRET_KEY} = process.env;

// middleware <authenticate> для перевірки токена
const authenticate = async (req, res, next) => {
    
    let user={};
    const {authorization = ""} = req.headers;
    const [bearer, accessToken] = authorization.split(" ");  // забираємо з заголовків запиту accessToken    
    
    console.log(accessToken);

    if (bearer !== "Bearer") {
        next(httpError(401, "Not authorized"));
    }
    
    try {

        try{
            const {id} = jwt.verify(accessToken, SECRET_KEY);                       // якщо accessToken валідний то забираємо з accessToken id юзера, якщо він не валідний то викинути помилку в catch
            user = await User.findById(id);                                         // шукаємо в базі юзера за йього id

            if (!user || !user.accessToken || (user.accessToken != accessToken)) {  // Видаємо помилку "Not authorized" якщо юзер не знайдений, або якщо юзер немає accessToken або якщо accessToken отриманий із запиту не відповідає accessToken юзера
                next(httpError(401, "Not authorized"));
            }
            req.user = user;

        }catch(error){
            if (error="TokenExpiredError"){                                                    // якщо збіг термін дії accesToken то пробуємо оновити його за допомогою RefreshToken
                
                const refreshToken = req.cookies.refreshToken;                                 // забираємо refreshToken з кукі запиту
                
                const {id} = jwt.verify(refreshToken, SECRET_KEY);                             // перевіряємо refreshToken (якщо токен не валідний, то catch перехватить помилку и видасть 'Not authorized')

                user = await User.findById(id);                                                // шукаємо в базі юзера за йього id

                if (!user || (!user.refreshToken) || (user.refreshToken != refreshToken)) {    // якщо юзер не знайдений або refreshToken відсутній або не відповідає refreshToken юзера то видаємо помилку 
                    next(httpError(401, "Not authorized"));
                }

                const tokens = generateAccessAndRefreshToken(id, 15, 420);                    // генеруємо нову пару accessToken та refreshToken на 15 та 420 хвилин терміну дії відповідно

                await User.findByIdAndUpdate(user._id, tokens);                               // оновлюємо токени в базі користувачів
                
                res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true});           // зберігаємо новий refresh-токен в httpOnly-cookie
                
                user = await User.findById(id);                                             // повторно шукаємо в базі юзера за йього id
                console.log(user);
                req.user = user;
                //req.user = {...user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken};
            }
        }
        next();
        
    }catch(error){
        console.log(error);
        next(httpError(401, "Not authorized"));
    }
        
}

module.exports = authenticate;
