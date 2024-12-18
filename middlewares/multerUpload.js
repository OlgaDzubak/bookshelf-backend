const {upload}  = require("../middlewares");

const multerUpload = async (req, res, next) =>{
    try{
        await upload.single("avatar");
    }catch(error){
        console.log("error",error);
    }

}

module.export = multerUpload;