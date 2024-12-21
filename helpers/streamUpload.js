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
        fs.createReadStream(req.file.buffer).pipe(stream);

    });
}

module.exports = streamUpload;
