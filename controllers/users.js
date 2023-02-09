const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const User = require('../models/user');

const usersGet = async(req = request, res = response) => {
    const { limit = 5, from = 0 } = req.query;
    const query = { state: true };

    const [ total, users ] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .skip( Number( from ) )
            .limit(Number( limit ))
    ]);

    res.json({
        total,
        users
    });
}

const usersPost = async(req, res = response) => {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password, role: "USER_ROLE" });

    const salt = bcryptjs.genSaltSync();
    user.password = bcryptjs.hashSync( password, salt );

    await user.save();

    res.json({
        user
    });
}

const usersPut = async(req, res = response) => {
    const { id } = req.params;
    const { _id, password, google, email, ...rest } = req.body;

    if ( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        rest.password = bcryptjs.hashSync( password, salt );
    }

    const user = await User.findByIdAndUpdate( id, rest );

    res.json(user);
}

const usersDelete = async(req, res = response) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate( id, { estado: false } );
    
    res.json(user);
}

module.exports = {
    usersGet,
    usersPut,
    usersPost,
    usersDelete
}