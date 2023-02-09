const Role = require('../models/role');
const Usuario = require('../models/user');

const isRoleValid = async(role = '') => {
    const roleExists = await Role.findOne({ role });
    const roles = await Role.find();
    if ( !roleExists ) {
        throw new Error(`The role ${ role } is not registered in the DB`);
    }
}

const emailExists = async( email = '' ) => {
    const isEmailRegistered = await Usuario.findOne({ email });
    if ( isEmailRegistered ) {
        throw new Error(`The email: ${ email }, has already been registered`);
    }
}

const userExists = async( id ) => {
    const userRegistered = await Usuario.findById(id);
    if ( !userRegistered ) {
        throw new Error(`The id ${ id } does not exists in the DB`);
    }
}

module.exports = {
    isRoleValid, 
    emailExists, 
    userExists 
}

