const express = require('express');
const ctrl = require('../controllers/users');
const {authenticate, upload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

// -------------------------------------------------------------------------------------------------------------

router.get('/current', authenticate, ctrl.getCurrent);
router.patch('/update', authenticate, validateBody(schemas.updateSchema) , ctrl.updateUser); //upload.single("avatar"),
router.post('/subscribe',authenticate, ctrl.subscribe);

// -------------------------------------------------------------------------------------------------------------
    
module.exports = router;
