const validateBody = require('./validateBody');
const validateId =  require('./validateId');
const validateFavorite =  require('./validateFavorite');
const validateQuery = require('./validateQuery');
const authenticate =  require('./authenticate');
const validateAvatarFile = require('./validateAvatarFile');
const upload = require('./upload');


module.exports = { 
    validateBody, 
    validateId, 
    validateFavorite, 
    validateQuery,
    authenticate, 
    validateAvatarFile,
    upload,
};
