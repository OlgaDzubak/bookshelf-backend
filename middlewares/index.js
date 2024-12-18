const validateBody = require('./validateBody');
const validateId =  require('./validateId');
const validateFavorite =  require('./validateFavorite');
const validateQuery = require('./validateQuery');
const authenticate =  require('./authenticate');
const upload = require('./multerUpload');



module.exports = { 
    validateBody, 
    validateId, 
    validateFavorite, 
    validateQuery,
    authenticate, 
    upload,
};
