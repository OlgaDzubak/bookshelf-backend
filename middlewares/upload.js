const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

console.log("я в upload");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    
    console.log("я в new CloudinaryStorage");
    
    let folder;

    if (file.fieldname === 'avatar') {
      console.log("file.fieldname === 'avatar'");
      folder = 'avatars';
    }
    
    console.log("я перед return");
    return {
      folder: folder,
      allowed_formats: ["jpg", "png"],
      public_id: file.originalname, 
      transformation: [
        { height: 250, crop: "scale" },
        { height: 250, crop: "scale" },
      ],
    };
  },
});

const upload = multer({ storage });


//----------------------------------------------------------------------------------------------

module.exports = upload;
