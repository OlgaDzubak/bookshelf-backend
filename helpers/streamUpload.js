const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const streamUpload = (req) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream((error, result)=>{
            if (result){
                resolve(result);
            }else{
                reject(error);
            }
        });

        console.log("req.file = ", req.file);
        fs.createReadStream(req.file.path).pipe(stream);

    });
}

module.exports = streamUpload;
