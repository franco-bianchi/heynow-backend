const { Router } = require('express');
const { check } = require('express-validator');


const { fieldsValidation } = require('../middlewares/fields-validation');

const { login } = require('../controllers/auth');

const router = Router();

router.post('/login',[
    check('email', 'Email is mandatory').isEmail(),
    check('password', 'Password is mandatory').not().isEmpty(),
    fieldsValidation
],login );

module.exports = router;