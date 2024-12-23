const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload}  = require("../middlewares");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.post('/subscribe', authenticate, ctrl.subscribe);
router.patch('/update', authenticate, upload.single('avatar'), ctrl.updateUser);


// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
