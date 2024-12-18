const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, validateBody, upload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.post('/subscribe', authenticate, ctrl.subscribe);
router.patch('/update', authenticate, validateBody(schemas.updateSchema), upload.single('avatar'), ctrl.updateUser); //validateBody(schemas.updateSchema), upload.single('avatar'), 


// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
