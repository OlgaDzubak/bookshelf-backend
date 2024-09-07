const jwt = require('jsonwebtoken');
const { httpError } = require('../helpers');
require('dotenv').config();

const {SECRET_KEY} = process.env; 
// + генерація двох токенов accessToken та refreshToken
function generateAccessAndRefreshToken(userId, accessMinutes, refreshMinutes){
    
  // try{

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
      
     const tokens = {accessToken, refreshToken};

     return tokens;

    // }catch(error){
    //   throw httpError(500, "Something went wrong while generating access and refresh token"); 
    // }
  }

  module.exports = generateAccessAndRefreshToken;