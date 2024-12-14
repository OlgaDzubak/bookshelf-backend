const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.patch('/update', authenticate, upload,single("avatar"), ctrl.updateUser);
router.post('/subscribe',authenticate, ctrl.subscribe);

// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
