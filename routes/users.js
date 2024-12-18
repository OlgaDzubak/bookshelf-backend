const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, multerUpload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.patch('/update', authenticate, multerUpload, ctrl.updateUser); //upload.single("avatar")
router.post('/subscribe',authenticate, ctrl.subscribe);

// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
