const {upload}  = require("../middlewares");
const { httpError } = require('../helpers');

const multerUpload = (req, res, next) =>{
    try{
        upload.single("avatar");
        next();
    }catch(error){
        console.log("error",error);
        next(httpError(500,"Uploading error"));
    }
    

}

module.exports = multerUpload;