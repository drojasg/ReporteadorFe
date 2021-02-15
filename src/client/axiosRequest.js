import axios from 'axios';
import { MComponentes, CleverConfig } from 'clever-component-library';

/**
 * @author Andry Matos <amatos@palaceresorts.com>
 * Función para realizar una peticion http utilizando axios
 */
class axiosRequest {
  constructor() {
    let service = axios.create({
        headers : {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + localStorage.jwttoken
            }
    });
    service.interceptors.request.use(this.handleRequest, this.handleFails);
    service.interceptors.response.use(this.handleSuccess, this.handleError);
    this.service = service;
  }

  handleRequest(config){
    let pathname = window.location.pathname,
    site = pathname.indexOf("login"),
    username = localStorage.username,
    data = {"username": username};

    if(!localStorage.jwttoken){

      return window.setTimeout(function () {
    		window.location = CleverConfig.getFeUrl('core') + '/login';
      }, 1000);

    }
  
      return config;
  }


  handleSuccess(response) {
    return response;
  }

  handleError(error, config){

    // if has response show the error
    console.warn(error, config);
    if (error.response) {
      switch (error.response.status) {
        case 400:
          MComponentes.toast("An error ocurred");
          break;
        case 401:
          console.warn("401");
          break;
        case 403:
            //<div class="valign-wrapper red-text darken-3"><h6><b>Danger!</b><b> ' + msnText + ' </b></h6></div>
          MComponentes.toast('<div class="valign-wrapper red-text darken-3"><h6><b>Danger!</b><b>'+ error.response.data.message + '</b></h6></div>');
          break;
        case 404:
          //MComponentes.toast(error.response.data.message);
          MComponentes.toast("No result was found");
          break;
        case 409:
          MComponentes.toast(error.response.data.message);
          break;
        case 504:
            MComponentes.toast(error.response.statusText);
            break;
        default:
          MComponentes.toast("Internal Server Error");
          console.warn(error.response);
          break;
      }
    }
    
    return {
        data: {
          error: true,
        }

    }

  }
  
  async get(path, callback) {
    const response = await this.service.get(path)
      return callback(response.data);
  }

  async put(path, dataSend, callback) {
    const response = await this.service.request({
          method: 'PUT',
          url: path,
          responseType: 'json',
          data: dataSend,
      });
      return callback(response.data, response.data.error);
  }

  async post(path, dataSend, callback) {
    const response = await this.service.request({
          method: 'POST',
          url: path,
          responseType: 'json',
          data: dataSend,
      });
      return callback(response.data, response.data.error);
  }

}

export default new axiosRequest;