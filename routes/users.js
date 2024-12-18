const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload}  = require("../middlewares");
const {validateAvatarFile}  = require("../helpers");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.patch('/update', authenticate, validateAvatarFile , upload.single("avatar"), ctrl.updateUser); 
router.post('/subscribe',authenticate, ctrl.subscribe);

// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
