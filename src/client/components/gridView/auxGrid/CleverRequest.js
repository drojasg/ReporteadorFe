/**
* @author Felipe Tun <ftun@palaceresorts.com> 05 octubre 2018
* Funciones para peticiones HTTPRequest.
* Implementacion:
*       import { CleverRequest } from 'clever-component-library';
*/

/**
* @property. Configuraciones del endpoints
*/
const CleverConfig = require('./../../../../../config/CleverConfig');
const MComponentes = require('./MComponentes');
const Util = require('./Util');
const Request = require('./AxiosRequest/Request').axiosRequest;

/**
* @property. Modulo como objeto para exportar
*/
const CleverRequest = {};

/**
* Funcion para realizar una peticion por el metodo GET HTTP
* @param string. Url de la peticion
* @param function. {response, error}
* @param boolean. Async (default: true)
* @return mixed.
* Ejemplo:
*       CleverRequest.get(CleverConfig.getApiUrl('contract') + '/idioma/translate/12/1', (response, error) => {
*           if (error) {
*               console.error(response);
*           }
*           console.log(response);
*       });
*/
CleverRequest.get = (url, functionResponse, ResponseAsync) => {
    return CleverRequest.CoreRequest({
        method : 'GET',
        url : url,
        success : functionResponse,
        async : ResponseAsync
    });
};

/**
* Funcion para realizar una peticion por el metodo POST HTTP
* @param string.
* @param object.
* @param function.
* @param boolean.
* Ejemplo:
*   let data = {"idcontr_categoria_contrato":"0","comentario":"TEST EXAMPLE","idcontr_tipo_template":"6","idclv_idioma":"1","publicado":0,"addendum":0,"idcontr_template_parent":"9","estado":1,"usuario_creacion":"ftun"};
*   CleverRequest.post(CleverConfig.getApiUrl('contract') + '/template/post', data, (response, error) => {
*       if (error) {
*              console.error(response);
*          }
*       console.log(response);
*   });
*/
CleverRequest.post = (url, dataSend, functionResponse, ResponseAsync) => {
    return CleverRequest.write('POST', url, dataSend, functionResponse, ResponseAsync);
};

/**
* Funcion para realizar una peticion por el metodo POST HTTP configurando la cabezera Content-type = 'json'
* @param string.
* @param object.
* @param function.
* @param boolean.
*/
CleverRequest.postJSON = (url, dataSend, functionResponse, ResponseAsync) => {
    return CleverRequest.write('POST', url, dataSend, functionResponse, ResponseAsync, 'application/json');
};

/**
* Funcion para realizar una peticion por el metodo PUT HTTP
* @param string.
* @param object.
* @param function.
* @param boolean.
* Ejemplo:
*   let data = {"idcontr_categoria_contrato":"0","comentario":"TEST EXAMPLE","idcontr_tipo_template":"6","idclv_idioma":"1","publicado":0,"addendum":0,"idcontr_template_parent":"9","estado":1,"usuario_creacion":"ftun"};
*   CleverRequest.put(CleverConfig.getApiUrl('contract') + '/template/put/96', data, (response, error) => {
*       if (error) {
*              console.error(response);
*          }
*       console.log(response);
*   });
*/
CleverRequest.put = (url, dataSend, functionResponse, ResponseAsync) => {
    return CleverRequest.write('PUT', url, dataSend, functionResponse, ResponseAsync);
};

/**
* Funcion para realizar una peticion por el metodo PUT HTTP configurando la cabezera Content-type = 'json'
* @param string.
* @param object.
* @param function.
* @param boolean.
*/
CleverRequest.putJSON = (url, dataSend, functionResponse, ResponseAsync) => {
    return CleverRequest.write('PUT', url, dataSend, functionResponse, ResponseAsync, 'application/json');
};

/**
* Funcion para ejecutar metodos de escritura
* @param string.
* @param string.
* @param object.
* @param function.
* @param boolean.
* @param string.
* @return mixed.
*/
CleverRequest.write = (method, url, dataSend, functionResponse, ResponseAsync, requestType) => {
    return CleverRequest.CoreRequest({
        method : method,
        url : url,
        dataSend : JSON.stringify(dataSend),
        success : functionResponse,
        async : ResponseAsync,
        requestType : requestType || null
    });
};

/**
* Funcion para ejecutar una peticion, en base a una instancia del objeto XMLHttpRequest
* Si la propiedad 'async' es configurada como false, se omite la configuracion de la opcion 'responseType' en el objeto XMLHttpRequest
* Sin embargo se toma en cuenta para codificar o no la respuesta en json
*   referencia: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
* @param object {
*       responseType: (string) Permite cambiar el tipo de respuesta ('arraybuffer', 'blob', 'document', 'json', 'text', ''), default 'json'
*       method: (string) Tipo de peticion GET/POST/HEAD/PUT/DELETE/CONNECT/OPTIONS/TRACE
*       url: (string) Url de la peticion
*       async: (boolean) Para definir si la peticion es asincrona o no, default (true)
*       authType: (string) Tipo de autenticacion de logeo (Bearer, Basic. etc.), default (Bearer)
*       success: (function) Callback para tratar el response de la peticion
*       dataSend: (string) json e formato text para envio de parametros, default null
*       requestType: (string) Permite definir el tipo de datos en el requesy
*   }
* @return mixed.
*/
CleverRequest.CoreRequest = (config) => {
    try {
        const xmlhttp = new XMLHttpRequest();
        config.async = config.async == undefined ? true : config.async;
        config.responseType = config.responseType == undefined ? 'json' : config.responseType;
        if (config.async) {
            xmlhttp.responseType = config.responseType;
        }
        xmlhttp.open(config.method, config.url, config.async);
        if (config.requestType) {
            xmlhttp.setRequestHeader("Content-type", config.requestType);
        }
        xmlhttp.setRequestHeader('Authorization', (config.authType || 'Bearer ' + localStorage.jwttoken));
        xmlhttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                var responseCurrent = config.responseType == 'json' && typeof this.response == 'string' ? JSON.parse(this.response) : this.response;

                if (responseCurrent) {
                    if (responseCurrent.hasOwnProperty('message') && responseCurrent.message == "Expired token") {
                        return CleverRequest.sessionExpired();
                    }

                    if ((responseCurrent.hasOwnProperty('status') && responseCurrent.status == "Forbidden" && responseCurrent.code == 403) || (responseCurrent.error && responseCurrent.code == 403)) {
                        MComponentes.toast(`<div class="valign-wrapper red-text darken-3"><h6><b>Danger!</b><b>${responseCurrent.message}</b></h6></div>`);
                    }
                }

                return config.success(responseCurrent, !CleverRequest.getCodesSuccessOK(this.status), this.status);
            }
        };
        xmlhttp.send(config.dataSend || null);
    } catch (e) {
        MComponentes.toast('CleverRequest => ', e.message);
    }
};

/**
* Funcion para validar si el token de la peticion a expirado, para realizar el logout el sistema, limpiando los localStorage
* @return mixed
*/
CleverRequest.sessionExpired = () => {
    MComponentes.toast('Expired token');
    return CleverRequest.post(CleverConfig.getApiUrl('auth') + '/logout', { username : localStorage.username}, (response, error) => {
        var msn = response.hasOwnProperty('message') ? response.message : response;
        MComponentes.toast(msn);
        localStorage.clear();
        return window.setTimeout(function () {
    		window.location = CleverConfig.getFeUrl('core') + '?session=false';
        }, 1000);
    });
};

/**
 * @author Carlos Acebedo <cacebedo@palaceresorts.com>
 * @function cleverLog
 * @description Funcion para crear un log
 * @param type Tipo de mensaje que se se guradara [info, warning, danger] (string)
 * @param system Sistema que de donde se esta guardando [contract, core, etc..] (string)
 * @param message Información que se quiere almacenar (json)
 * @example
 * import CleverRequest from 'clever-component-library';
 * 
 * CleverRequest.cleverLog('info', 'contract', {
 *   code: 404,
 *   error: true,
 *   message: 'No se encontraron datos de...'
 * });
**/
CleverRequest.cleverLog = (type, system, message) => {
    const types = ['info', 'warning', 'danger'];
    if(!types.includes(type)) return Util.getMsnDialog('warning', 'The log was not created. Type not valid. Choose one of these [info, warning, danger]');

    const data = {
        tipo: type,
        modulo: system.toLowerCase(),
        mensaje: message,
        usuario_creacion: localStorage.username
    };
    Request({url: '/api/createLog', method: 'post', data}).then(() => {});
};

/**
* Funcion para validar los codigos de estado http de una solicitud con un respuesta valida
* @param integer
* @return boolean
*/
CleverRequest.getCodesSuccessOK = (code) => {
    return [200, 201, 202, 203, 204, 205, 206, 207, 208].indexOf(code) >= 0;
};

module.exports = CleverRequest;

