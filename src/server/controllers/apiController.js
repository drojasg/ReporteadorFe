const CleverConfig = require('clever-component-library/build/node/CleverConfig');
const MakeRequest = require('../modules/MakeRequest');

/**
* @author Felipe Tun <ftun@palaceresorts.com>
* Consumo de APIs genericas para el sistema de clever contracts
*/

/**
* GET
*/
exports.index = (req, res) => {
    res.send({msn : 'Welcome to Clever Contracts'})
};

/**
* GET: Se obtiene la session del usuario en base al hash
*/
exports.getUserHash = (req, res) => {
    return MakeRequest(req, res, `${CleverConfig.getApiUrl('auth')}/usuario/hash/${req.params.hash}`);
};

/**
* POST: Se finaliza la session del usuario
*/
exports.postLogout = (req, res) => {
    return MakeRequest(req, res, `${CleverConfig.getApiUrl('auth')}/logout`);
};

/**
* GET: Se obtiene el menu para el usuario en session dependiendo sus permisos
*/
exports.getMenu = (req, res) => {
    return MakeRequest(req, res, `${CleverConfig.getApiUrl('frm')}/menu/getmenu/contract`);
};
