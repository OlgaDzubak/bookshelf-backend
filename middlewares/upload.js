const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const {httpError} = require('../helpers');
const multer = require('multer');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({

  cloudinary: cloudinary,
  
  params: async (req, file) => {

            let folder;
      
            if (file.fieldname === 'avatar') {
              folder = 'avatars';
            }
            
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

const upload = multer({ storage,
                        fileFilter: (req, file, cb)=>{
                          console.log("я в fileFilter");
                            const formatsArray = ['image/png', 'image/jpeg', 'image/jpg'];

                            if (formatsArray.indexOf(file.mimetype) === -1) {
                              console.log("я в fileFilter === -1");
                              return cb(httpError(500,"Wrong file format!"));
                            }

                            console.log("я в fileFilter cb(null, true);");
                             cb(null, true);
                        }
                     });
  

//----------------------------------------------------------------------------------------------

module.exports = upload;
