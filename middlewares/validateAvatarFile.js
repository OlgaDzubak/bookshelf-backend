const { httpError } = require('../helpers');

  
     const validateAvatarFile = () =>{
        const func = (req, res, next) => {

          //  console.log("req.body=", req);
            console.log("validateAvatarFile");
            if (!Object.keys(req.body).length){            
                next(httpError(400, "missing fields"));
            }else{
                if (!req.file) { 
                    next(httpError(400, error.message)); 
                };
            }
            next();
        }
        return func;
     }

module.exports = validateAvatarFile;