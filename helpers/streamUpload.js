const cloudinary = require('cloudinary').v2;

const streamUpload = (buffer) => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream((error, result)=>{
            if (result){
                resolve(result);
            }else{
                reject(error);
            }
        }).end(buffer);

    });
}

module.exports = streamUpload;
