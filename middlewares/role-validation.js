const { response } = require('express')


const isAdmin = ( req, res = response, next ) => {
    if ( !req.usuario ) {
        return res.status(500).json({
            msg: 'Only admins can get the users'
        });
    }

    const { rol, nombre } = req.usuario;
    
    if ( rol !== 'ADMIN_ROLE' ) {
        return res.status(401).json({
            msg: `${ nombre } is not an admin`
        });
    }

    next();
}

const hasRole = ( ...roles  ) => {
    return (req, res = response, next) => {
        
        if ( !req.usuario ) {
            return res.status(500).json({
                msg: 'Invalid role'
            });
        }

        if ( !roles.includes( req.usuario.rol ) ) {
            return res.status(401).json({
                msg: `The service requires one of these ${ roles } roles`
            });
        }

        next();
    }
}

module.exports = {
    isAdmin,
    hasRole
}