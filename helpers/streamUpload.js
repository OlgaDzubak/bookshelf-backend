const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const streamUpload = (filepath) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream((error, result)=>{
            if (result){
                resolve(result);
            }else{
                reject(error);
            }
        });

        fs.createReadStream(filepath).pipe(stream);

    });
}

module.exports = streamUpload;
