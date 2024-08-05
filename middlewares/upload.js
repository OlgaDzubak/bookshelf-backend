const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine the folder based on file properties or request data
    let folder;
    if (file.fieldname === 'avatar') {
      folder = 'avatars';
    } else if (file.fieldname === "drinkThumb") {
      folder = "drinks";
    } else {
      folder = "others";
    }
    return {
      folder: folder,
      allowed_formats: ["jpg", "png"], // Adjust the allowed formats as needed
      public_id: file.originalname,    // Use original filename as the public ID
      transformation: [
        { height: 350, crop: "scale" },
        { height: 700, crop: "scale" },
      ],
    };
  },
});

const upload = multer({ storage });


//----------------------------------------------------------------------------------------------

module.exports = upload;
