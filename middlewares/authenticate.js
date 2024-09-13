const { httpError, generateAccessAndRefreshToken } = require('../helpers');
const jwt = require("jsonwebtoken");
const {User} = require("../db/models/user");
require('dotenv').config();
//const cookieParser = require('cookie-parser');


const {SECRET_KEY} = process.env;

// middleware <authenticate> для перевірки токена
const authenticate = async (req, res, next) => {
    
    let user={};
    const {authorization = ""} = req.headers;
    const [bearer, accessToken] = authorization.split(" ");  // забираємо з заголовків запиту accessToken    
    
    console.log("Authenticate.req.cookies = ", req.cookies);

    if (bearer !== "Bearer") {
        next(httpError(401, "Not authorized"));
    }
    
    try {

        try{
            const {id} = jwt.verify(accessToken, SECRET_KEY);                                   // якщо accessToken валідний то забираємо з accessToken id юзера, якщо він не валідний то викидаємо помилку в catch
            console.log("good accessToken");
            
            user = await User.findById(id);                                                     // шукаємо в базі юзера за йього id

            if (!user || !user.accessToken || (user.accessToken != accessToken)) {              // Видаємо помилку "Not authorized" якщо юзер не знайдений, або якщо юзер немає accessToken або якщо accessToken отриманий із запиту не відповідає accessToken юзера
                next(httpError(401, "Not authorized"));
            }

            req.accessToken = user.accessToken;
            req.user = {
                "name": user.name,
                "email": user.email,
                "avatarURL": user.avatarURL,
                "shopping_list": user.shopping_list,
            }

            next();

        }catch(error){

            if (error="TokenExpiredError"){                                                    // якщо збіг термін дії accesToken то пробуємо оновити його за допомогою RefreshToken
                
                console.log("accessTokenExpiredError");

                const {refreshToken} = req.cookies;

                try{
                    const {id} = jwt.verify(refreshToken, SECRET_KEY);                             // перевіряємо refreshToken (якщо токен не валідний, то catch перехватить помилку и видасть 'Not authorized')

                    console.log("good refreshToken");

                    user = await User.findById(id);                                               // шукаємо в базі юзера за йього id

                    if (!user || (!user.refreshToken) || (user.refreshToken != refreshToken)) {    // якщо юзер не знайдений або refreshToken відсутній або не відповідає refreshToken юзера то видаємо помилку 
                        next(httpError(401, "Not authorized"));
                    }
                    
                    const tokens = generateAccessAndRefreshToken(id, 1, 2) //;15, 420);                    // генеруємо нову пару accessToken та refreshToken на 15 та 420 хвилин терміну дії відповідно
                    console.log("generateAccessAndRefreshToken");
                    console.log("tokens = ",tokens);
                    
                    await User.findByIdAndUpdate(user._id, tokens);                               // оновлюємо токени в базі користувачів

                    user = await User.findById(id);

                    
                    const refreshTokenOptions = {
                        expires: new Date(Date.now() + (3 * 60 * 1000)),
                        httpOnly: true,
                        secure: true
                    }

                    req.accessToken = user.accessToken;
                    req.user = {
                        "name": user.name,
                        "email": user.email,
                        "avatarURL": user.avatarURL,
                        "shopping_list": user.shopping_list,
                    }
                    res.cookie('refreshToken', user.refreshToken, refreshTokenOptions);           // зберігаємо новий refresh-токен в httpOnly-cookie
                    
                    next();                    

                }catch(error){
                    console.log("refreshTokenExpiredError");
                    next(httpError(401, "Not authorized"));
                }
            }
        }
        
    }catch(error){

        console.log(error);
        next(httpError(401, "Not authorized"));
        
    }
        
}

module.exports = authenticate;
