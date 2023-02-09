const fieldsValidation = require('./fields-validation');
const jwtValidation = require('./jwt-validation');
const rolesValidation = require('./role-validation');

module.exports = {
    ...fieldsValidation,
    ...jwtValidation,
    ...rolesValidation,
}