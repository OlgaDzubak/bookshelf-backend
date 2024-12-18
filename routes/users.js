const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload, multerUpload}  = require("../middlewares");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.post('/subscribe', authenticate, ctrl.subscribe);
router.patch('/update', authenticate, multerUpload, ctrl.updateUser);


// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
