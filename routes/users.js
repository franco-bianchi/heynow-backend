const { Router } = require('express');
const { check } = require('express-validator');

const {
    fieldsValidation,
    jwtValidation,
    isAdmin,
    hasRole
} = require('../middlewares');

const { isRoleValid, emailExists, userExists } = require('../helpers/db-validators');

const {
    usersGet,
    usersPut,
    usersPost,
    usersDelete
} = require('../controllers/users');

const router = Router();

router.get('/', [isAdmin],usersGet);

router.put('/:id', [
    jwtValidation,
    check('id', 'Invalid id').isMongoId(),
    check('id').custom(userExists),
    check('role').custom(isRoleValid),
    fieldsValidation
], usersPut);

router.post('/', [
    check('name', 'The name is mandatory').not().isEmpty(),
    check('password', 'Password must have 6 or more characters').isLength({ min: 6 }),
    check('email', 'Email is invalid').isEmail(),
    check('email').custom(emailExists),
    fieldsValidation
], usersPost);

router.delete('/:id', [
    jwtValidation,
    hasRole('ADMIN_ROLE'),
    check('id', 'Invalid id').isMongoId(),
    check('id').custom(userExists),
    fieldsValidation
], usersDelete);

module.exports = router;