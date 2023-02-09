const { response } = require('express');
const bcryptjs = require('bcryptjs')

const User = require('../models/user');

const { generateJWT } = require('../helpers/generateJWT');

const login = async(req, res = response) => {
    const { email, password } = req.body;

    try {
      
        const user = await User.findOne({ email });
        if ( !user ) {
            return res.status(400).json({
                msg: 'email or password not valid - email'
            });
        }

        if ( !user.state ) {
            return res.status(400).json({
                msg: 'email or password not valid - estado: false'
            });
        }

        const validPassword = bcryptjs.compareSync( password, user.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'email or password not valid'
            });
        }

        const token = await generateJWT( user.id );

        res.json({
            user,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Please contact the administrator'
        });
    }   

}

module.exports = {
    login
}
