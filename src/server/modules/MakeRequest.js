const Request = require('clever-component-library/build/node/AxiosRequest/Request');

/**
* @author Felipe Tun <ftun@palaceresorts.com>
* Funcionalidad para realizar peticiones via axios con el componente Request
* @param array express request
* @param array express response
* @param string endpoint API
* @param string response type (default:json) node: 'arraybuffer', 'document', 'json', 'text', 'stream'; browser only: 'blob'
*/
const MakeRequest = (req, res, url, responseType) => {
    return Request.axiosRequest({
       method: req.method.toLowerCase(),
       url: url,
       auth: req.headers.authorization,
       responseType : responseType || 'json',
       data : (req.body || null)
    })
    .then(response => {
        res.send(response);
    });
};

module.exports = MakeRequest;
