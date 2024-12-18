const {upload}  = require("../middlewares");
const { httpError } = require('../helpers');

const multerUpload = async (req, res, next) =>{
    try{
        await upload.single("avatar");
        next();
    }catch(error){
        console.log("error",error);
        next(httpError(500,"Uploading error"));
    }
    

}

module.export = multerUpload;