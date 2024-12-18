const { httpError } = require('../helpers');

  
const validateAvatarFile = () => {
    const func = (req, res, next) => {
        console.log(req.file);
        // if ()
        // {            
        //     next(httpError(500, "Wrong avatar file format. Only image files (jpg ,png) are allowed!"));
        // }
        // else
        // {
        //     const { error } = schema.validate(req.body);
        //     if (error) { 
        //         next(httpError(400, error.message)); 
        //     };
        // }
        next();
    }
    return func;
}

module.exports = validateAvatarFile;