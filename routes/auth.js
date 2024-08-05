const express = require('express');
const ctrl = require('../controllers/auth');
const {validateBody, authenticate, upload}  = require("../middlewares");
const {schemas} = require("../db/models/user");

const router = express.Router();

//--------------------------------------------------------------------------------------------------------------------------------------

// SIGN UP
router.post('/signup', validateBody(schemas.signUpSchema), ctrl.signup);
router.get('/verify/:verificationToken', ctrl.verifyEmail);
router.post('/verify', validateBody(schemas.emailSchema), ctrl.resendVerifyEmail);

// SIGN IN
router.post('/signin', validateBody(schemas.signInSchema), ctrl.signin);
router.post('/signout',authenticate, ctrl.signout);

//--------------------------------------------------------------------------------------------------------------------------------------
    
module.exports = router;
