const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload, validateBody}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.post('/subscribe', authenticate, ctrl.subscribe);
router.patch('/update', authenticate, ctrl.updateUser); //validateBody(schemas.updateSchema), upload.single('avatar'), 


// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
