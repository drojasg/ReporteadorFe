
const CleverConfig = require('./../../../../../config/CleverConfig');
const MComponentes = require('./MComponentes');

/**
* @author Felipe Tun Cauich <ftun@palaceresorts.com>
* Clases que contienen funcionalidades genericas de la aplicacion
*/
class Util {
	/**
	* constructor de la clase
	*/
	constructor() {
		this.XMLHttpObject = Util.createXMLHttpObject();
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener la instancia del objeto HTTPRequest
	* @return Object
	*/
	static createXMLHttpObject() {
		return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para validar los codigos de estado http de una solicitud con un respuesta valida
	* @param integer
	* @return boolean
	*/
	static getCodesSuccessOK(code) {
		var codesOk = [200, 201, 202, 203, 204, 205, 206, 207, 208];
		return codesOk.indexOf(code) >= 0;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para realizar una peticion ajax http
	* @param Object paramsRequest. Contienen los parametros para configuracion de un peticion via AJAX
	* {
	*       typeRequest         : (String) Tipo de peticion GET/POST/HEAD/PUT/DELETE/CONNECT/OPTIONS/TRACE
	*       urlResquest         : (String) Url hacia la peticion
	*       parseResponse       : (String | Boolean) Para parsear la respuesta en el formato deseado, default false
	*       sync                : (Boolean) Para definir si la peticion es asincrona o no, default(true)
	*       dataSend            : (Mixed) Parametro para e envio de datos. Por ejemplo en peticiones POST. default(null)
	*       addRequestSettings  : (function anonima) Funcion para agregar configuraciones a la peticion
	*       responseSuccess     : (function anonima) Funcion para tratar el response de la peticion
	*       responseError       : (function anonima) Funcion para tratar el response de la peticion en caso de error
	*       responseType        : (String) Permite cambiar el tipo de respuesta ('arraybuffer', 'blob', 'document', 'json', 'text', ''), default '' (cadena vacia)
	*                                       Al activar esta propiedad la funcion retorna el objeto del response para mejor tratamiento
	*		authType			: (strin) Tipo de autenticacion de logeo (Bearer, Basic. etc.)
	* }
	* @return Mixed | Error {4XX: Errores del lado del cliente, 5XX: Errores del lado del servidor}
	*/
	static ajaxRequest(paramsRequest) {
		try {
			var xmlhttp = Util.createXMLHttpObject();
			paramsRequest.authType = paramsRequest.authType || 'Bearer ' + localStorage.getItem("jwttoken");
			xmlhttp.responseType = paramsRequest.responseType !== undefined ? paramsRequest.responseType : '';
			xmlhttp.open(paramsRequest.typeRequest, paramsRequest.urlResquest, paramsRequest.sync !== undefined ? paramsRequest.sync : true);
			xmlhttp = paramsRequest.addRequestSettings !== undefined ? paramsRequest.addRequestSettings(xmlhttp) : xmlhttp;
			xmlhttp.setRequestHeader('Authorization', paramsRequest.authType);
			xmlhttp.onreadystatechange = function () {
				if (this.readyState === 4) {
					if (Util.getCodesSuccessOK(this.status)) {
						return paramsRequest.responseSuccess(paramsRequest.responseType !== undefined ? this : paramsRequest.parseResponse !== false && paramsRequest.parseResponse === 'json' && this.responseText !== '' ? JSON.parse(this.responseText) : paramsRequest.parseResponse !== false && paramsRequest.parseResponse === 'string' ? JSON.stringify(this.responseText) : this.responseText);
					}
					var xhr = JSON.parse(this.response);
					if (xhr.message == "Expired token") {
						Util.xhrError();
					}
			  	    return (paramsRequest.responseError !== undefined) ? paramsRequest.responseError(this) : null;
				}
			};
			xmlhttp.send(paramsRequest.dataSend !== undefined ? paramsRequest.dataSend : null);
		} catch (e) {
			Util.getMsnDialog('warning', e.message);
		}

		return;
	}



	/**
	* xhrError Funtion
	* @author Manuel Vicente Almeida <mvicente@palaceresorts.com>
	* Funcion para revisar sivisar los errores de codigo y revisar si el token es valido
	* @param    call_xhr         : contiene el contenido de la funcion cargada desde el metodo invocado
	* @param    xhr         : Contiene la peticion original del AJAX
	* @return Mixed | Error {4XX: Errores del lado del cliente, 5XX: Errores del lado del servidor}
	*/
	static xhrError() {
		let pathname = window.location.pathname,
		    site = pathname.indexOf("login"),
		    username = localStorage.username,
			data = {"username": username}
		;
    	Util.ajaxRequest({
    		typeRequest : 'POST',
    		urlResquest : CleverConfig.getApiUrl('auth') + '/logout',
    		dataSend : JSON.stringify(data),
    		parseResponse : 'json',
    		sync : false,
			responseSuccess : function (response) {
				if(site === -1 ){
					localStorage.clear();
					return window.location = CleverConfig.getFeUrl('core') + '?session=false';
				}else{
					return Util.sessionStart();
				}
			},
			responseError : function (xhr) {
				localStorage.clear();
				var error = JSON.parse(xhr.response);
				return Util.getMsnDialog('danger', error.message);
			}
		});
	}

	static sessionStart() {
		var auth_comon = localStorage._hasToken,
		username = localStorage.username;
		localStorage.clear();
		Util.ajaxRequest({
			typeRequest: 'POST',
			authType: auth_comon,
			urlResquest: CleverConfig.getApiUrl('auth') + '/authenticate',
			parseResponse: 'json',
			responseSuccess: function (response) {
				localStorage.removeItem("password");
				if (!response.error) {
					if (typeof Storage !== "undefined") {
						let token = response.data;
						if (!localStorage.jwttoken) {
							localStorage.setItem("jwttoken", token);
							localStorage.setItem("uniqueID", Util.uniqueID());
							localStorage.setItem("session", true);
							Util.setUserToken(username);
							window.location = window.location.origin;
						}
					} else {
						Util.getMsnDialog('danger', '<b> Sorry, your browser does not support web storage, please contact the system administrator </b>');
					}
				} else {
					alert('[ error ]');
				}
			}, responseError: function (xhr) {
				var re = JSON.parse(xhr.response);
				Util.getMsnDialog('danger', '<b>' + re.message + '</b>');
			}
		});
	}
	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para validar un input con las clases de boostrap en un formulario, si es requerido en base al atributo 'required'
	* Es importante que el atributo contenga el atributo 'name' definido en el mismo para la funcionalidad del script
	* @param Object obj. Elemento input a validar
	* @return Mixec
	*/
	static validateInput(obj) {
		var padre = obj.parentNode;
		var idNodoMsn = 'identificador-' + obj.name;

		padre.classList.remove('red-text');
		padre.classList.remove('green-text');
		if (obj.required)  {
			if (obj.value !== '') {
				padre.classList.add('green-text');
				var child = document.getElementById(idNodoMsn);
				if (child) {
					padre.removeChild(child);
				}
			} else {
				padre.classList.add('red-text');
				var nodo = document.getElementById(idNodoMsn);
				if (!nodo) {
					var newTag = document.createElement('span');
					var newContent = document.createTextNode('Required Information');
					newTag.setAttribute('id', idNodoMsn);
					newTag.appendChild(newContent);
					newTag.classList.add('helper-text', 'red-text');
					padre.appendChild(newTag)
				}
			}
		} else {
			padre.classList.add('green-text');
		}

		return;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener dinamicamente la url de la locacion en la aplicacion para cargar la imagen del gif de loading
	*  @return String
	*/
	static getUrlGif() {
		var imagen = 'img/loading.gif';
		var url = window.location.href;
		var locacion = url.substring(url.indexOf('index.php')).split('/').length-1;
		for (var i = 0; i < locacion; i++) {
			imagen = '../' + imagen;
		}
		return imagen;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener la fecha actual o convertir una fecha a formato ISO
	* @param string
	* @param bool
	* @return String.
	*/
	static getCurrentDate(current, useTime=false) {
		var hoy = current !== undefined ? new Date(current) : new Date();
		var dd = hoy.getDate();
		var mm = hoy.getMonth() + 1; //hoy es 0!
		var yyyy = hoy.getFullYear();

		dd = (dd < 10 ? ('0' + dd) : dd);
		mm = (mm < 10 ? ('0' + mm) : mm);

		let date =  yyyy + '-' + mm + '-' + dd;

		if(useTime) {
			let hour = hoy.getHours();
			let minute = hoy.getMinutes();
			let second = hoy.getSeconds();
			hour = (hour.length == 1 ? ('0' + hour) : hour);
			minute = (minute.length == 1 ? ('0' + minute) : minute);
			second = (second.length == 1 ? ('0' + second) : second);
			date += ' '+ hour + ':' + minute + ':' + second;
		}

		return date;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener las fecha en formato ISO de un rango especificado
	* @param string. Date ISO
	* @param string. Date ISO
	* @return array. Dates ISO
	*/
	static getDataRange(dateBegin, dateEnd) {
		var dateRange = [];
		var startDate = new Date(dateBegin);
		var endDate    = new Date(dateEnd);

		while(endDate.getTime() >= startDate.getTime()) {
			startDate.setDate(startDate.getDate() + 1);
			dateRange.push(Util.getCurrentDate(startDate));
		}

		return dateRange;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para guardar y asociar archvios subidos al bucket a resgistros
	* @param string. Prefijo definido para el controllador en el Api REST
	*               Ejemplo: para el controllador 'TextoclausuladocumentoController' se define un Prefijo 'textoclausuladocumento' en el ruteo del api
	* @param integer | string. Primary key del registro al cual se asocia el archivo
	*               Ejemplo: el id del registro es el numero '1'
	* @param json. informacion retornada por la interfaz [/bucket/uploadfile] la cual realizar la carga del archivo al bucket S3
	*               Ejemplo de la informacion que retorna esta interfaz
	*               data : {
	*                   bucket: "contracts"
	*                   eTag: "\"26903498d5e6d8abc5c74e2c43047d1a\""
	*                   nameFile: "783010500383.pdf"
	*                   objectURL: "https://seguimientosbancarios.s3.amazonaws.com/desarrollo/783010500383.pdf"
	*               }
	* !importante: En el ruteo del Api, en la coleccion del controllador, debe estar definido un metodo POST
	*              aosciado al metodo 'postSupportLoadingService' con el alias de acceso 'loadsupport'
	* Ejemplo:
	*           $textoClausulaDocumento = new MicroCollection();
	*           $textoClausulaDocumento->setHandler('Api\controllers\contrato\TextoclausuladocumentoController', true);
	*           $textoClausulaDocumento->setPrefix('/textoclausuladocumento');
	*           $textoClausulaDocumento->post('/loadsupport', 'postSupportLoadingService');
	*           $app->mount($textoClausulaDocumento);
	* @param string
	*@return boolean
	*/
	static getSupportLoadingService(prefixController, idRecord, dataResponseFiles, cleverModules) {
	    for (var dataFile in dataResponseFiles) {
	        if (dataResponseFiles.hasOwnProperty(dataFile)) {
	            var file = dataResponseFiles[dataFile];
				if (file.error) {
					Util.getMsnDialog('danger', 'Error: ' + file.message);
				} else {
					var data = {
					   id_referencia_soporte : idRecord,
					   nombre_bucket : file.bucket,
					   nombre_archivo : file.nameFile,
					   url : file.objectURL,
					   etag : file.eTag,
					   estado : 1,
					   usuario_creacion : localStorage.getItem('username')
				   };

				   Util.ajaxRequest({
					   typeRequest : 'POST',
					   urlResquest : CleverConfig.getApiUrl((cleverModules || 'contract')) + '/' + prefixController + '/loadsupport',
					   dataSend : JSON.stringify(data),
					   parseResponse : 'json',
					   sync : false,
					   responseSuccess : function (response) {
						   if (!response.error) {
							   return Util.getMsnDialog('success', data.nombre_archivo + ' Saved File!!');
						   }
					   },
					   responseError : function (xhr) {
						   return Util.getMsnDialog('danger', 'Error: ' + xhr.statusText + ' When Saving File: ' + data.nombre_archivo);
					   },
				   });
				}
	        }
	    }

	    return;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para consumir el servicion que obtienen informacion de los archivos subidos al bucket de los registros de las tablas del modulo contracts
	* @param string prefixController. Prefijo definido para el controllador en el Api REST
	* @param integer idRecord. identificador primario de la tabla contr_soporte
	* @param object renderObject. objecto para renderizar el grid con el resultado del Api REST
	* @return object. grid informacion del soporte
	*/
	static getFilesBucketModuleContracts(prefixController, idRecord, renderObject, cleverModule) {
		var configColums = {
			module : (cleverModule || 'contract'),
			idTable : 'grid-soportes-' + prefixController,
			url : '/' + prefixController + '/bucketfiles/' + idRecord,
			pagination : false,
			divContainer : renderObject,
			serializeRows : true,
			classTable : 'highlight',
			key : 'idcontr_soporte',
			columns : [
	            {
	                attribute : 'nombre_archivo',
	                alias : 'File Name',
	            },
	            {
	                attribute : 'estado',
	                alias : 'Estatus',
	                value : function (data) {
	                    return (data.estado == 1 ? '<span class="glyphicon glyphicon-ok">Activo</span>' : '<span class="glyphicon glyphicon-remove">Inactivo</span>');
	                },
	            },
	            {
	                attribute : 'url',
	                alias : 'View Sopport',
	                value : function (data)  {
	                    return '<a href="javascript:void(0)" title="View File" onclick="Util.getFilesBucketsS3(this)" data-id="' + data.idcontr_soporte + '" data-bucket="' + data.nombre_bucket + '" data-file="' + data.nombre_archivo + '">' +
	                                '<i class="material-icons">visibility</i>' +
	                            '</a>';
	                }
	            }
	        ],
		};

		return new GridView(configColums);
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener el contenido de los archivos en los buckets de aws
	* @param string bucket. identificador del bucket en el api
	* @param string file. archivo a obtener el bucket
	* @return object pdf
	*/
	static getFilesBucketsS3(obj) {
		return Util.getContentBucket(CleverConfig.getApiUrl('frm') + '/bucket/contentfile/' + obj.dataset.bucket + '/' + obj.dataset.file);
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener el contenido de un archivo binario de una interfaz, y convertirlo a un archivo PDF (default)
	* @param string. url del servicion a consumir
	* @param string. Tipo de archivo a renderizar
	* @return mixed
	*/
	static getContentBucket(url, type) {
		var resonseType = type || 'application/pdf';
		return Util.ajaxRequest({
	        typeRequest : 'GET',
	        urlResquest : url,
	        responseType : 'blob',
	        responseSuccess : function (response) {
	                var blob = new Blob([response.response], {type: resonseType});
	                var fileURL = URL.createObjectURL(blob);
	                window.open(fileURL);
	        },
	        responseError : function (xhr) {
			    return Util.getMsnDialog('danger', 'File Not Available: ' + xhr.statusText);
	        },
	    });
	}

	/**
    * @author Felipe Tun <ftun@palaceresorts.com>
    * Funcion para obtener los valores de los elementos de un formulario
    * @param Object form. instancia del formualrio a enviar | !importante: el formulario debe contener el dataset 'data-method-api' definido
	* en caso contraio devolvera los atributos de usuario_creacion y usuario_ultima_modificacion con el username del usuario en sesion
    * @param Boolean string. para retornar un STRING || JSON (default STRING)
    * @return STRING || JSON
    */
	static getDataElementsForm(form, string) {
		if (form.nodeName != 'FORM') {
			return false;
		}

		var elements, element, value, json = {};
		elements = form.elements;
		for (var i = 0; i < elements.length; i++) {
			element = elements[i];
			if (element.name) {
				if (element.nodeName == 'INPUT' && element.type == 'radio') {
					var options = document.getElementsByName(element.name);
					for (var j = 0; j < options.length; j++) {
						if (options[j].checked) {
							value = options[j].value;
						}
					}
				} else if (element.nodeName == 'INPUT' && element.type == 'checkbox') {
					value = element.checked ? 1 : 0;
				}else if(element.nodeName == 'SELECT' && element.multiple){
					json['attributeMultiple'] = element.name;
					value = this.getDataAttributeMultiple(element.id);;
				} else {
					value = element.value;
				}

				json[element.name] = value;
			}
		}

		if (form.getAttribute('data-method-api')) {
			form.getAttribute('data-method-api').toUpperCase() == 'PUT' ?
			json.usuario_ultima_modificacion = localStorage.getItem('username') :
			json.usuario_creacion =  localStorage.getItem('username');
		} else {
			json.usuario_ultima_modificacion = localStorage.getItem('username');
			json.usuario_creacion =  localStorage.getItem('username');
		}

		return string === undefined || string ? JSON.stringify(json) : json;
	}

	/**
    * @author Miguel Chan <michan@palaceresorts.com>
    * Funcion para obtener los valores de los elementos multiples de un formulario
    * @param Object form. instancia del formualrio a enviar | !importante: el formulario debe contener el dataset 'data-method-api' definido
    * @param Boolean string. para retornar un STRING || JSON (default JSON)
    * @return STRING || JSON
    */
	static getDataAttributeMultiple(idAttributeMultiple) {

		var select = document.querySelector(`select#${idAttributeMultiple}`),
			options = select.selectedOptions,
			optionsSelect = []
		;
		for (var i = 0; i < options.length; i++) {
			if (options[i].value.trim() != "") {
				optionsSelect.push(options[i].value);
			}
		}

		return optionsSelect;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para llenar las options de un elemento select
	* @param String. Id del elemnto
	* @param Object JSON. {clave : valor}
	* @return Object
	*/
	static setDataDropDownList(id, data) {
		var select = document.getElementById(id);
		select.innerHTML = '';
		var promp = document.createElement("option");
		promp.text = 'Select...';
		promp.value = '';
		promp.setAttribute('disabled', 'disabled');
		promp.setAttribute('selected', 'selected');
		select.add(promp);
		var options = Object.keys(data);
		if (options.length > 0) {
			options.map(function(k) {
				var option = document.createElement("option");
				option.text = data[k];
				option.value = k;
				select.add(option);
			});
			select.disabled = false;
		} else {
			select.disabled = true;
		}
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para llenar el formulario
	* @param obj data. informacion
	* @param String idform. Formululario que va a llenar.
	*/
	static setDataForm(data, idForm) {
		var form = typeof idForm === 'string' ? document.getElementById(idForm) : idForm;
		if (form.nodeName != 'FORM') {
			return false;
		}

		for (var attr in data) {
			if (data.hasOwnProperty(attr)) {
				var obj = form.querySelector(`[name="${attr}"]`);
				if (obj) {
					if (obj.type == 'checkbox') {
						obj.checked = data[attr] != 0;
					} else {
						obj.value = data[attr];
					}

					obj.classList.add('valid');
					if (obj.nextSibling) {
						obj.nextSibling.classList.add('active');
					}
				}
			}
		}

		return data;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para buscar y ejecutar los filtros hacia el Api
	* !importante: Tener definido los siguientes dataset
	*       data-url = url del servicio a consumir
	*       data-key = valor de las key de los options del dropdown
	*       data-value = valor del display de los options del dropdown
	* @param string
	* @param string
	* @return Mixed
	*/
	static setElementDropDown(baseUrl, className) {
		var filtros = document.getElementsByClassName(className);

		for (var i = 0; i < filtros.length; i++) {
			var select = filtros[i];
			if (select.getAttribute('data-url') != undefined && select.getAttribute('data-key') != undefined && select.getAttribute('data-value') != undefined) {
				baseUrl = select.getAttribute('data-module') != undefined ? CleverConfig.getApiUrl(select.getAttribute('data-module')) : baseUrl;
				var url = baseUrl + select.getAttribute('data-url');
				url += select.getAttribute('data-key') != '' ? ('/' + select.getAttribute('data-key')) : '';
				url += select.getAttribute('data-value') != '' ? ('/' + select.getAttribute('data-value')) : '';

				Util.ajaxRequest({
					typeRequest : 'GET',
					parseResponse : 'json',
					urlResquest : url,
					sync : false,
					responseSuccess : function (response) {
						if (Object.keys(response).length > 0) {
							Util.setDataDropDownList(select.id, response);
						}
					},
					responseError : function (xhr) {
						if (select.getAttribute('data-msn-error') !== null) {
							Util.getMsnDialog('danger', select.getAttribute('data-msn-error'));
						}
					}
				});
			}
		}

		return;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para el envio de datos de un formulario
	*   !importante: el formulario debe contener el dataset 'data-method-api' definido, con el metodo http para la peticion
	* @param string. ID del formulario
	* @param function. Funcion callback para el response OK
	* @param function. Funcion callback para el response BAD
	* @param JSON.stringify. Datos a enviar
	* @return mixed
	*/
	static sendFormAjax(form, functionSuccess, functionError, dataSend) {
		return document.getElementById(form).addEventListener('submit', function (e) {

			Util.ajaxRequest({
				typeRequest : this.getAttribute('data-method-api'),
				urlResquest : this.action,
				dataSend : dataSend || Util.getDataElementsForm(this),
				parseResponse : 'json',
				responseSuccess : functionSuccess,
				responseError : functionError,
				sync : false
			});

			e.stopImmediatePropagation();
			e.preventDefault();
		}, false);
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener un array [clave => valor] de las opciones de un dropdown, omitiendo los valores de cadena vacia
	* @param string. Id del elemnto select
	* @return json
	*/
	static getSelectOptionsAsArray(idElement) {
		var select = document.getElementById(idElement).options,
			options = {},
			lg = 0
		;

		lg = Object.keys(select).length;
		for (var i = 0; i < lg; i++) {
			if (select[i].value != '') {
				options[select[i].value] = select[i].innerHTML;
			}
		}

		return options;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para crear un nuevo row en una tabla especificada, mediante el 'data-key' de la fila
	* @param key. dataset pasado como referencia en la creacion de la tabla con la funcion 'getDynamicTable' en el atributo 'key'
	* @param functionContent function callback. para el contenido de la nueva fila agregada, recibe como parametro el elemnto row a agregar
	* @param cls string. clases a agregar a la nueva fila
	* @return boolean
	*/
	static getRowNodeForContent(table, key, functionContent, cls) {
		var table = document.getElementById(table),
			row   = table.querySelector('tr[data-key="' + key + '"][data-identity="' + table.id + '"]'),
			tr    = table.querySelector('#child-tr-' + key + "-" + table.id),
			td    = table.querySelector('#child-td-' + key + "-" + table.id),
			rowClass = cls || '',
			contentRow
		;

		if (row === null) {
			return false;
		}

		if (tr === null) {
			tr = document.createElement('tr');
			tr.setAttribute('id', 'child-tr-' + key + "-" + table.id);
			tr.classList.add(rowClass);
			tr.appendAfter(row);
		}

		if (td === null) {
			var td = document.createElement('td');
			td.setAttribute('id', 'child-td-' + key + "-" + table.id);
			td.setAttribute('colspan', row.querySelectorAll('td').length);
			contentRow = functionContent(td);
			(typeof contentRow === 'string') ? td.innerHTML = contentRow : false;
			tr.appendChild(td);
		} else {
			tr.removeChild(td);
		}

		return true;
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* Funcion Util.collapseAccordion [funcion para colapsar un elemento ]
	* @param string. Id del elemnto
	*/
	static collapseAccordion(id) {

		var collapsible_accordion = document.getElementById(id);
		var element_li = collapsible_accordion.querySelector("li");
		var collapsible_header = element_li.querySelector('div.collapsible-header');
		var collapsible_body = element_li.querySelector('div.collapsible-body');
		var form=element_li.querySelector('form');

		// si existe un formulario en el div limpiamos su contenido
		if(form){
			form.reset();
			form.setAttribute('data-method-api', "POST");
			$('select').material_select();
		}

		if (element_li.classList.contains('active')) {
			element_li.classList.remove("active");
			collapsible_header.classList.remove('active');
			collapsible_body.style.display ='none';
		} else {
			element_li.classList.add('active');
			collapsible_header.classList.add('active');
			collapsible_body.style.display ='block';
		}

		return Util.topFunction();
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* When the user clicks on the button, scroll to the top of the document
	*/
	static topFunction() {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		return;
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* Funcion Util._datepicker [funcion para dar formato a date picker ]
	* @param HTMLObject. obj elemento que el evento
	* @param Bolean autoclose [true, false] si se requiere que se cierre ek elemnto al clic
	*/
	static _datepicker(obj, autoclose) {
		var date = new Date(obj.value);
		var curr_date =  (date.getDate() < 10 ? '0' : '') + date.getDate();
		var curr_month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
		var curr_year = date.getFullYear();
		obj.value = curr_year + "-" + curr_month + "-" + curr_date;
		obj.hasAttribute("data-compare") ?  Util.compare_input(obj): false;
		return obj;
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	*/
	static compare_input(obj) {
		var validate;
		var data_compare=obj.dataset;
		var elemt_to_compare =  document.getElementById(data_compare.compareInput);

		if (data_compare.typeCompare=="date") {
			if (obj.value !=="" && elemt_to_compare.value !== "" ) {
				var date1 = new Date(obj.value);
				var date2 = new Date(elemt_to_compare.value);
				var validate = Util.operationCompare(data_compare.operator,date1.getTime(),date2.getTime());
				if (!validate) {
					Util.getMsnDialog('danger', '<strong>Error: select a date '+ Util.operatorText(data_compare.operator)+" "+elemt_to_compare.value+'</strong>');
					obj.value="";
				}
			}
		} else if (data_compare.typeCompare=="integer") {
			var value1 = Number(obj.value);
			var value2=  Number(elemt_to_compare.value);
			validate = Util.operationCompare(data_compare.operator,value1,value2);
		} else if (data_compare.typeCompare=="String") {

		}
		return false;
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* operador string [mayor que (>), menor que (<), mayor o igual (>=), menor o igual (<=), igual que (==) y distinto de (!=)]
	* valeu1  [string, date, numbre, decimal]
	*/
	static operationCompare(operador, value1, value2) {
		if(operador=="<"){
		   return (value1 < value2);
		}
		else if (operador=="<=") {
			return (value1 <= value2);
		}
		else if (operador==">") {
		   return (value1 > value2);
		}
		else if (operador==">=") {
			return (value1  >= value2);
		}
		else if (operador=="=" || operador=="==" || operador=="===" ) {
		   return (value1 == value2);
		}
		else if (operador=="!=" || operador=="!==" ) {
		   return (value1 !== value2);
		}
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* operador string [mayor que (>), menor que (<), mayor o igual (>=), menor o igual (<=), igual que (==) y distinto de (!=)]
	* valeu1  [string, date, numbre, decimal]
	*/
	static operatorText(operador) {
		if(operador=="<"){
		   return 'less than';
		}
		else if (operador=="<=") {
			return 'Less than or equal to';
		}
		else if (operador==">") {
		   return 'greater than';
		}
		else if (operador==">=") {
			return 'greater than or equal to';
		}
		else if (operador=="=" || operador=="==" || operador=="===" ) {
		   return 'equal';
		}
		else if (operador=="!=" || operador=="!==" ) {
		   return '	Not equal';
		}
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para clonar dropdown list, de uno a otro, mediante el dataset 'data-select-clone' y especificando la class para la busqueda de los dropdown list
	* en el dataset 'data-select-clone' se espeficifa el id del select a clonar
	* @param string. Clase para buscar los dropdown a donde se vaciara el clon
	* @return.
	*/
	static setCloneDropdown(ClassCloneSelect) {
		var selectsForm = document.querySelectorAll('select.' + ClassCloneSelect);
		for (var i = 0; i < selectsForm.length; i++) {
			var selectOptions = document.getElementById(selectsForm[i].getAttribute('data-select-clone')).options;
			var selectEmpty = selectsForm[i];
			selectEmpty.innerHTML = '';
			for (var j = 0; j < selectOptions.length; j++) {
				var option = document.createElement("option");
					option.text = selectOptions[j].text;
					option.value = selectOptions[j].value;
					selectEmpty.add(option);
			}
		}

		return;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener el html para una alerta con las clases de boostrap
	* @param string. tipo de dialog ['success', 'info', 'warning', 'danger']
	* @param string. texto en el mensaje a mostrar. puede contener codigo html
	* @param integer. tiempo de duracion a mostrar en pantalla
	* @return string.
	*/
	static getMsnDialog(type, msnText, time) {
		var duration = time || 4000;
		var typeMsn = '';
		if (type === 'info') {
			typeMsn = '<div class="valign-wrapper blue-text darken-3"><h6><b>Info!</b><b> ' + msnText + ' </b></h6></div>';
		} else if (type === 'success') {
			typeMsn = '<div class="valign-wrapper green-text darken-3"><h6><b>Success!</b><b> ' + msnText + ' </b></h6></div>';
		} else if (type === 'warning') {
			typeMsn = '<div class="valign-wrapper orange-text darken-3"><h6><b>Warning!</b><b> ' + msnText + ' </b></h6></div>';
		} else if (type === 'danger') {
			typeMsn = '<div class="valign-wrapper red-text darken-3"><h6><b>Danger!</b><b> ' + msnText + ' </b></h6></div>';
		} else {
			return false;
		}

		return MComponentes.toast(typeMsn);
	}

	/**
	* ================================== WIDGET DETAIL VIEW =================================================================
	* Funcion para crear una tabla de detalles de un registro:
	* @author Felipe Tun <ftun@palaceresorts.com>
	* @param string. nombre del id de la tabla a crear
	* @param JSON. Array JSON para la creacion de la tabla
	*           {
	*               headerTable : string 'para establecer contenido en el header de la tabla'
	*               classTable : string 'se especifican las clases para agregar a la tabla'
	*               key : string 'nombre de la columna para setaer el "date-key" de los row de la tabla, sino especifica se setear con el consecutivo del bucle'
	*               dataProvider : 'JSON con la informacion a poblar en la tabla',
	*               columns : Array(JSON)
	*                   [
	*                       {
	*                           attribute : string 'nombre del atributo para desglosar en la columna',
	*                           alias :     string 'nombre personalizado para el header de las columnas, por defaul el nombre del atributo',
	*                           visible :   boolean 'para visibilidad de las columnas, por default true',
	*                           value :     string | function 'setear el valor de los atributos en la tabla'
	*                       },
	*                   ]
	*           }
	* Ejemplo de implemtacion:
	*   var configColums = {
	*       headerTable : '<h3>Details</h3>',
	*       classTable : 'responsive-table striped bordered',
	*       dataProvider : getRecordById(id),
	*       columns : [
	*           {
	*               attribute : 'descripcion',
	*               alias : 'Description'
	*           },
	*           {
	*               attribute : 'idgen_territorio_geografico',
	*               alias : 'Geographic Location',
	*               value : function (data) {
	*                   return data.idgen_territorio_geografico;
	*               },
	*           },
	*           {
	*               attribute : 'estado',
	*               alias : 'Estatus',
	*               value : function (data) {
	*                   return (data.estado == 1 ? 'Active' : 'Inactive');
	*               },
	*           },
	*       ]
	*   }
	*
	*   var tableDetail = Util.getDetailGridView('id-table', configColums);
	*
	* @return object. elemento DOM <table>
	*/
	static getDetailGridView(configColums) {
		var table = document.createElement('table'),
			tbody = document.createElement('tbody'),
			data = configColums.dataProvider,
			columns = configColums.columns
		;

		table.setAttribute('id', Util.uniqueID());
		table.classList.add(configColums.classTable);

		if (configColums.headerTable !== undefined) {
			var thead = document.createElement('thead'),
				tr = document.createElement("tr"),
				td = document.createElement("td")
			;

			td.setAttribute('colspan', columns.length);
			td.innerHTML = configColums.headerTable;
			tr.appendChild(td);
			thead.appendChild(tr);
			table.appendChild(thead);
		}

		if (Object.keys(data).length > 0) {
			configColums.key ? table.setAttribute('data-key', data[configColums.key]) : false;
			for (var row in columns) {
				if (columns.hasOwnProperty(row)) {
					var itemColum = columns[row];
					if (data.hasOwnProperty(itemColum.attribute)) {
						var tr = document.createElement("tr"),
							th = document.createElement("th"),
							td = document.createElement("td")
						;

						var data_i18n_t = (itemColum.data_i18n === undefined) ? '' : th.setAttribute("data-i18n", itemColum.data_i18n);
						(itemColum.data_i18n === undefined) ? '' : th.setAttribute("data-i18n", itemColum.data_i18n);

						th.innerHTML = itemColum.alias !== undefined ? itemColum.alias : itemColum.attribute.replace('_', ' ');
						th.innerHTML = (i18n.directivesTranslate.hasOwnProperty(itemColum.data_i18n) ? i18n.directivesTranslate[itemColum.data_i18n] : th.innerHTML);

						itemColum.visible === undefined || itemColum.visible ? '' : th.style.display = 'none';

						td.innerHTML =
							itemColum.value !== undefined && typeof itemColum.value === 'function' ? itemColum.value(data) :
							itemColum.value !== undefined && typeof itemColum.value !== 'function' ? itemColum.value :
							data[itemColum.attribute];
						itemColum.visible === undefined || itemColum.visible ? '' : td.style.display = 'none';

						tr.appendChild(th);
						tr.appendChild(td);
						tbody.appendChild(tr);
					}
				}
			}
		} else {
		   tr = document.createElement("tr");
		   td = document.createElement("td");
		   td.setAttribute('colspan', columns.length);
		   td.innerHTML = 'No se encontraron resultados';
		   tr.appendChild(td);
		   tbody.appendChild(tr);
	   }

		table.appendChild(tbody);
		return table;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener los errores del modelo de las peticiones POST y PUT, omitiendo los atributos por default de los modelos
	* @param string. xhr.response
	* @return string
	*/
	static getModelErrorMessages(response) {
	    if (response == '') {
	        return false;
	    }

	    var content = '',
	        responseError = typeof response == 'string' ? JSON.parse(response) : response,
	        errors = responseError.message,
	        notAttr = {
	            'fecha_creacion' : true,
	            'usuario_creacion' : true,
	            'fecha_ultima_modificacion' : true,
	            'usuario_ultima_modificacion' : true
	        }
	    ;

	    if (responseError.error && typeof errors == 'object') {
	        content =
	        '<div class="row blue-grey lighten-5">' +
	            '<ul class="collection with-header">' +
	                '<li class="collection-header"><h5>The Following Errors Were Obtained:</h5></li>';

	        for (var i = 0; i < errors.length; i++) {
	            var err = errors[i];
	            if (!notAttr.hasOwnProperty(err.field)) {
	                content +=
	                '<li class="collection-item">' +
	                    '<b>' + Util.getCleanAttributeName(err.field) + ': </b>' + err.message +
	                '</li>';
	            }
	        }

	        content +=
	            '</ul>' +
	        '</div>';
	    }

	    return content;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener el html del preloader circular de Materialize
	* @return string
	*/
	static getPreloader() {
	    return '<center>' +
	                '<div class="preloader-wrapper big active">' +
	                    '<div class="spinner-layer spinner-blue">' +
	                        '<div class="circle-clipper left"><div class="circle"></div></div>' +
	                        '<div class="gap-patch"><div class="circle"></div></div>' +
	                        '<div class="circle-clipper right"><div class="circle"></div></div>' +
	                    '</div>' +
	                    '<div class="spinner-layer spinner-red">' +
	                        '<div class="circle-clipper left"><div class="circle"></div></div>' +
	                        '<div class="gap-patch"><div class="circle"></div></div>' +
	                        '<div class="circle-clipper right"><div class="circle"></div></div>' +
	                    '</div>' +
	                    '<div class="spinner-layer spinner-yellow">' +
	                        '<div class="circle-clipper left"><div class="circle"></div></div>' +
	                        '<div class="gap-patch"><div class="circle"></div></div>' +
	                        '<div class="circle-clipper right"><div class="circle"></div></div>' +
	                    '</div>' +
	                    '<div class="spinner-layer spinner-green">' +
	                        '<div class="circle-clipper left"><div class="circle"></div></div>' +
	                        '<div class="gap-patch"><div class="circle"></div></div>' +
	                        '<div class="circle-clipper right"><div class="circle"></div></div>' +
	                    '</div>' +
	                '</div>' +
	            '</center>';
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener el valor de un parametro de la url en base a su nombre, si no se encuentra el nombre retorna null
	* location.search se asume que es la url donde se localiza el momento de invokar el metodo
	* @param string. Nombre del parametro
	* @return mixed
	* Ejemplo de uso:
	* 		query string: ?foo=lorem&bar=&baz
	* 		var foo = Util.getUrlParameterByName('foo'); // "lorem"
	*/
	static getUrlParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para tratar los nombres de los atributos de la BD del api REST, para no mostrar los nombre de atributo llaves.
	* y remplaza los guiones bajos por espacios en blancon. En caso que el atributo lo requiera.
	* @param string.
	* @return string
	*/
	static getCleanAttributeName(attribute) {
	    var io = attribute.indexOf('_') + 1;
	    var attr = (attribute.split('_')[0].indexOf('id') > -1 ? attribute.substr(io) : attribute);
	    return attr.replace('_', ' ');
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para agregar de un dropdown list a un textarea con el widget del editor
	* en el objeto se tienen que definir los siguientes datasets [
	*       data-select => id del dropdown
	*       data-textarea => name del textarea con la instancia del CKEDITOR
	*   ]
	* @param object. <select>
	* @return boolean.
	*/
	static setAddValueOfSelectToTextarea(obj) {
		var select =  document.getElementById(obj.dataset.select);
	    if (select.value !== '') {
	        var widget = CKEDITOR.instances[obj.dataset.textarea];
			if (widget !== undefined) {
				widget.focus();
		        widget.insertText(" " + select.value + " ");
		        return true;
			}
	    }

	    return false;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para consumir el servicion de envio de notificaciones
	* @param string. Tag de notificacion
	* @param object. Datos en tipo json
	* @param string. email_list lista extra de email que se incluiran la notificacion [email1@mail.com, email2@mail.com]
	* @return mixed.
	*/
	static getServiceNotification(tag, dataSend, email_list) {
	  (email_list) ? dataSend.email_list = email_list : null;
		return Util.ajaxRequest({
			typeRequest : 'POST',
			urlResquest : CleverConfig.getApiUrl('frm') + '/notificaciones/notificacion/' + tag,
			dataSend : JSON.stringify(dataSend),
			parseResponse : 'json',
			responseSuccess : function (response) {
				Util.getMsnDialog((response.status == 'success' ? 'info' : 'warning'), response.msg);
			},
			responseError : function (xhr) {
				Util.getMsnDialog('danger', 'Notification Error: ' + xhr.statusText);
			}
		});
	}

	/**
	* @author mvicente <mvicente@palaceresorts.com>
	* Funcion que permite mostrar o ocultar un elemento en el DOM
	* @param string. idElement Elemeto que se quiere ocultar o mostrar
	* @return bolean.
	*/
	static hideElement(idElement) {
	    var x = document.getElementById(idElement);
	    if (x.style.display === "none") {
	        x.style.display = "block";
	    } else {
	        x.style.display = "none";
	    }
	    return false;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para asociar los nodos de la lista con los nodos de options del select, en base a widget de materizalize.
	* la asociacion se realiza mendiante el value del option, el cual se incrusta en elemento <li> como el dataset 'data-option'
	* @param string. id del select
	* @return object
	*/
	static setAssociateSelectWithList(isSelect) {
	    var select = document.getElementById(isSelect),
	        options = select.options
	    ;
	    if (select.getAttribute('data-select-id')) {
	        var ul = document.getElementById('select-options-' + select.getAttribute('data-select-id')),
	            li = ul.childNodes
	        ;

	        for (var nodo in options) {
	            if (options.hasOwnProperty(nodo) && li.hasOwnProperty(nodo)) {
	                li[nodo].setAttribute('data-option', options[nodo].value);
	                li[nodo].classList.remove('active');
	                li[nodo].classList.remove('disabled');
	                options[nodo].removeAttribute('disabled');
	            }
	        }
	    }

	    return select;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para renderizar los registros del log de cambio en el modal alojado en la layout main
	* implemtacion:
	* 	var urlLog ='/template/log/' + id;
	* 	'<a href="javascript:void(0)" title = "Change Log onclick="Util.getViewChangeLog(' + urlLog + ')"><i class="material-icons">change_history</i></a>&nbsp;' +
	* @param string. Prefijo del modulo para obtener la urlbase del Api REST
	* @param string. url para obtener los datos. Ejemplo:  '/template/log/' + id;
	* @return mixed
	*/
	static getViewChangeLog(url, moduleApi) {
		Util.loader('block');
		return window.setTimeout(function () {
			var modal = document.getElementById('modal-general-change-log'),
				modalContent = modal.querySelector('div.modal-content'),
				configColums = {
			        idTable : 'grid-view-log-changes',
					module : moduleApi || 'contract',
			        url : url,
			        pagination : false,
			        serializeRows : true,
			        divContainer : modalContent,
			        classTable : 'responsive-table striped bordered',
			        key : 'idbit_valor_date',
			        columns : [
			            {
			                attribute : 'idbit_valor_date',
			                visible : false
			            },
			            {
			                attribute : 'atributo',
			                alias : 'Modified Attribute',
			                data_i18n : "{{'MODIFIED_ATTRIBUTE'}}",
			                value : function (data) {
			                    return Util.getCleanAttributeName(data.atributo);
			                }
			            },
			            {
			                attribute : 'bit_valor',
			                alias : 'Previous Value',
			                data_i18n : "{{'PREVIUS_VALUE'}}",
			            },
			            {
			                attribute : 'bit_valor_remplazo',
			                alias : 'Replacement Value',
			                data_i18n : "{{'REPLACEMENT_VALUE'}}",
			            },
			            {
			                attribute : 'usuario_modificacion',
			                alias : 'User Last Modified',
			                data_i18n : "{{'USER_LAST_MODIFIED'}}",
			            },
			            {
			                attribute : 'fecha_ultima_modificacion',
			                alias : 'Date Last Modified',
			                data_i18n : "{{'DATE_LAST_MODIFIED'}}",
			                value : function (data) {
			                    return data.fecha_modificacion + ' ' + data.hora_modificacion;
			                },
			            },
			        ]
			    }
			;

			new GridView(configColums);
			$('#modal-general-change-log').modal('open');
		    return Util.loader();
		}, 100);
	}

	/**
	* @author unknown
	* Crea un div con los parámetros indicados
	*    Crear una fila:
	*       Util.newDiv('texto de la fila',  { class: "row" })
	*    Crear una fila con dos columnas:
	*       let fila = Util.newDiv('',  { class: "row" })
	*       let column_A = Util.newDiv('texto columna A',  { class: "col m6" })
	*       let column_B = Util.newDiv('text columna B',  { class: "col m6" })
	*       fila.appendChild(column_a);
	*       fila.appendChild(column_b);
	*
	*    Crear una columna
	*       Util.newDiv(dato.fecha_creacion,  { class: "col m2" })
	*/
	static newDiv(text, options) {
	   let column = document.createElement("div");
	   column.innerHTML = text;
	   var optionkeys = Object.keys(options);
	   optionkeys.forEach(option => {
		  column.setAttribute(option, options[option]);
	   });
	   return column;
	}

	/**
	* @author unknown
	* Crea un elemento de tipo item-collection
	*/
	static newListItem(text, options) {
	   let li = document.createElement("li");
	   li.innerHTML = text;
	   if(typeof options !== 'undefined' ){
		  var optionkeys = Object.keys(options);
		  optionkeys.forEach(option => {
			 li.setAttribute(option, options[option]);
		  });
	   }
	   return li;
	}

	/**
	* @author unknown
	* Crea un botón con la clase flat en texto rojo
	* @param {string} text El innerHTML del botón
	* @param {array} options atributos del elemento
	* Ejemplo:
	*/
	static newFlatButton(text, options) {
	   let anchorbutton = document.createElement("a");
	   anchorbutton.innerHTML = text;
	   var optionkeys = Object.keys(options);
	   anchorbutton.classList.add("btn-flat", "red-text");
	   optionkeys.forEach(option => {
		  anchorbutton.setAttribute(option, options[option]);
	   });
	   return anchorbutton;
	}


	/**
	* @author unknown
	* Elimina elementos hijos de un elemento
	* Si se indica el nombre de la clase, sólo
	* se eliminarán los elementos que tengan dicha clase
	*/
	static removeChildren(parent) {
		if( parent != null ) {
			var len = parent.childNodes.length;
			while (parent.hasChildNodes()) {
				parent.removeChild(parent.firstChild);
			}
		}
	}

	/**
	* @author unknown
	* Funciones a generalizar
	*/
	static renderAsTitle(mainElement) {
		mainElement.classList.add = "row";
		let titleText = mainElement.innerText;
		Util.removeChildren(mainElement);
		let div = document.createElement("div");
		div.className = "col s12 m12";

		let div2 = document.createElement("div");
		div2.className = "card blue-grey darken-1";

		let div3 = document.createElement("div");
		div3.className = "card-content white-text";

		let span = document.createElement("span");
		span.className = "card-title";
		span.innerHTML = titleText;

		div3.appendChild(span);
		div2.appendChild(div3);
		div.appendChild(div2);
		mainElement.appendChild(div);
	}

	/**
	* @author unknown
	* Agrega las clases y elementos necesarios para mostrar el elemento como un botón
	* @param {element} element
	*/
	static renderAsButton(element) {
		element.classList.add('waves-effect', 'waves-light', 'btn');
		if( element.innerText == '' ){
			element.classList.add('btn-floating', 'waves-effect', 'waves-light', 'btn','button');
		}
		if( element.hasAttribute("tooltip") ) {
			element.setAttribute("data-position", "right");
			element.setAttribute("data-delay", "50");
			element.classList.add("tooltipped");
			element.setAttribute("data-tooltip", element.getAttribute("tooltip"));
		}
		if(element.hasAttribute("icon")){
			let icon = document.createElement('i');
			icon.className = "material-icons left";
			icon.innerHTML = element.getAttribute("icon");
			element.appendChild(icon);
		}
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para realizar un truncamiento a dos decimales de un numero, se valida que el parametro sea un numero
	* @param integer
	* @return integer | boolean
	*/
	static truncateDecimals(num) {
		if (!isNaN(parseFloat(num)) && isFinite(num)) {
			return num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
		}
		return false;
	}

	    /**
     * Funcion que agrega un elemento HTML al DOM
	 * @param string. Tag del elemento DOM a crear
     * @param {*} obj El objeto JSON el objeteto del cual queremos crear
     * Ejemplos de uso:
     *    let href_login_obj    = {"element":"a", "href":'http://localhost/site', "text":'Go', 'id':'MyLink'};
     *                              <a href=>"http://localhost/site" id ="MyLINK"> Go </a>
     *    let i_icon_login_obj  = { "element":"i", "class": 'material-icons right', "text":view_module};
                                   <i class="material-icons right">view_module</i>
     *    post('/contracts/post', data, onSuccess, onError);
     */
	static AddHtmlAttributte(obj) {
        let child = document.createElement(obj.element);
        for (var key in obj) {
         	if (obj.hasOwnProperty(key)) {
             	if (key !== 'element') {
                 	if (key !== 'text') {
                     	child.setAttribute(key, obj[key]);
                    } else {
                     	var txt_icon_href = document.createTextNode(obj[key]);
                        child.appendChild(txt_icon_href);
                    }
                }
            }
        }
        return child;
    }

	/**
	* Funcion para mostrar / ocultar el contenedor del loading
	* @param string
	* @return
	*/
	static loader(act) {
		var visible = act || 'none';
		document.getElementById('loading-main').style.display = visible;
	}

	/**
	* Funcion para generar un GUID de forma aleatoria
	* @return string
	*/
	static uniqueID() {
		return '_' + Math.random().toString(36).substr(2, 9);
	}

	/**
	* Funcion para guardar la informacion del token y hash de la session del usuario
	* @param string
	* @return mixed
	*/
	static setUserToken(username) {
		var dataSend = {
			"access_token" : localStorage.getItem("jwttoken") || ' ',
			"auth_key" : localStorage.getItem("uniqueID") || ' '
		};
		Util.ajaxRequest({
	        typeRequest : 'PUT',
	        sync : false,
	        urlResquest : CleverConfig.getApiUrl('auth') + '/usuario/put/' + username,
	        dataSend : JSON.stringify(dataSend),
	        parseResponse : 'json',
			responseSuccess : response => {},
	        responseError : xhr => {
				Util.getMsnDialog('danger', 'Error When Saving Hash: ' + xhr.statusText);
			},
	    });
	}

	/**
	* Funcion para eliminar datos del localStorage
	* @return mixed
	*/
	static getRemoveLocalStorage()
	{
		var username = localStorage.getItem('username');
	    localStorage.clear();
	    if (username) {
			Util.setUserToken(username);
		}

		return;
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para abrir / cerrar modal de confirmacion
	* @param string
	* @return mixed
	*/
	static setActionModalConfirm(action) {
		return $('#modal-confirm').modal(action);
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para desplegar el modal de confirmacion para ejecutar una accion
	* @param object. elemento que invoca la accion
	* @return mixed.
	* Example use: <a href="javascript:void(0)" onClick="getModalConfirm(this)" data-call="method_name"></a>
	*/
	static getModalConfirm(btn, params) {
	    document.getElementById('button-yes-modal').onclick = function () {
	        document.getElementById('progress').style.display = 'block';
	        return window[btn.dataset.call](btn, params);
	    }
	    document.getElementById('progress').style.display = 'none';
	    return Util.setActionModalConfirm('open');
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener los mensajes de errores de las peticiones de las interfaces REST
	* @param object HTTPRequest
	* @return mixed
	*/
	static getErrorRequest(xhr) {
		var errorText = JSON.parse(xhr.responseText);
		return Util.getMsnDialog('danger', 'Interface Error: ' + xhr.statusText + ' ' + errorText.message);
	}

	/**
	* Funcion para validar si existe una sesion activa al acceder a una vista
	* @return boolean
	*/
	static getAccessMiddleware() {
		if (localStorage.jwttoken) {
			return true;
		} else {
			window.location = '/index.php/site/forbidden';
			return false
		}
	}

	/**
	* Funcion para mostrar los mensajes de errores de las peticiones HTTPRequest de lectura
	* @param object
	* @return mixed
	*/
	static getResponseError(xhr) {
		var errorText = JSON.parse(xhr.responseText);
		return Util.getMsnDialog('danger', 'Interface Error: ' + xhr.statusText + ' ' + errorText.message);
	}

	/**
	* Funcion para mostrar los mensajes de errores de las peticiones HTTPRequest de escritura
	* @param object
	* @return mixed
	*/
	static setResponseError(xhr) {
		var errorText = JSON.parse(xhr.responseText),
			msnModel = Util.getModelErrorMessages(xhr.response)
		;

		return msnModel ? Util.getMsnDialog('danger', msnModel) : Util.getMsnDialog('danger', 'Error: ' + xhr.statusText + ' ' + errorText.message);
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para obtener un documento mediante el ID del contrato
	* @param string. id del contrato
	* @param function. callback para una respuesta OK
	* @param function. callback para una respuesta BAD
	* @param boolean
	* @return mixed
	*/
	static getRequest(url, functionSuccess, functionError, sync)
	{
		var sync = ( sync == undefined ) ? false : sync;
		return Util.ajaxRequest({
			typeRequest : 'GET',
			parseResponse : 'json',
			sync : sync,
			urlResquest : url,
			responseSuccess : functionSuccess,
			responseError : functionError || this.getResponseError,
		});
	}

	/**
	* @author Felipe Tun <ftun@palaceresorts.com>
	* Funcion para realizar peticiones de actualizacion y creacion
	* @param string
	* @param string
	* @param json
	* @param function
	* @param function
	* @param boolean
	* @return
	*/
	static setRequest(method, url, data, functionSuccess, functionError, sync)
	{
		var sync = ( sync == undefined ) ? false : sync;
		return Util.ajaxRequest({
			typeRequest : method,
			urlResquest : url,
			dataSend : JSON.stringify(data),
			parseResponse : 'json',
			sync : sync,
			responseSuccess : functionSuccess,
			responseError : functionError || this.setResponseError,
		});
	}

	/**
	 * Devuelve un string con el resultado de las clases agregadas y eliminadas
	 * @param {string | array} baseClasses Nombre de las clases css a colocar por defecto
	 * @param {string | array} className Clases CSS a agregar, incluyendo a baseClasses
	 * @param {string | array} removeCss Clasess CSS a eliminar, afecta a baseClasses
	 */
	static addRemoveClass(baseClasses, className, removeCss) {
		// Convertimos el string de clases en un array
		if (typeof baseClasses == 'string') {
			baseClasses = baseClasses.replace('  ', ' ').trim().split(' ');
		}
		// Crear un array con los nombres de las clases CSS
		let cssClass = className ? className.replace('  ', ' ').trim().split(' ') : [];
		removeCss = removeCss ? removeCss.replace('  ', ' ').trim().split(' ') : [];
		//  Agregar las clases CSS del componente
		cssClass = [...cssClass, ...baseClasses];
		// Eliminar clases indicadas en el atributo [removeCss] y espacios en blanco
		cssClass = cssClass.filter(c => c.length > 0 && removeCss.indexOf(c) == -1 ? c : null);
		// Volver a crear un string con las clasess CSS
		cssClass = cssClass.join(' ');
		return cssClass;
	}

	/*
	* @author Miguel Chan <michan@palaceresorts.com>
    * Funcion para obtener los valores de los elementos de un formulario
    * @param Object form. instancia del formualrio a enviar
	* @param String method. Methodo del formulario
    * @param Boolean showMsgError. para mostrar los mensajes de error
    * @return JSON if validate is TRUE return data and error { data: json, error: errors} else only return data
    */
	static getValidateDataForm(form, method, showMsgError) {
		var element,
		    value,
		    json = {},
		    elements = form.elements,
		    errors = [],
			msnError = '<ul class="collection">',
		    min = 0,
		    max = -1,
		    isNum = false,
		    hasError = false;

		for (var i = 0; i < elements.length; i++) {

			element = elements[i], min = 0, max = -1, isNum = false;
			if (element.name) {
				var getValidate = element.hasAttribute("required");
				var idInput = element.hasAttribute("id") ? element.id : element.name,
				    label = document.querySelector(`label[for='${idInput}']`),
				    txtLabel = label ? label.innerText : element.name;
				if (element.nodeName == 'INPUT' && element.type == 'radio') {
					var options = document.getElementsByName(element.name);
					for (var j = 0; j < options.length; j++) {
						if (options[j].checked) {
							value = options[j].value;
						}
					}
				} else if (element.nodeName == 'INPUT' && element.type == 'checkbox') {
					value = element.checked ? 1 : 0;
				} else if (element.nodeName == 'SELECT' && element.multiple) {
					json['attributeMultiple'] = element.name;
					value = this.getDataAttributeMultiple(element.id);
				} else if (element.nodeName == 'INPUT' && element.type == 'number') {
					value = element.value;
					min = element.hasAttribute("min") ? element.min : 0;
					max = element.hasAttribute("max") ? element.max : -1;
					isNum = true;
				} else if (element.nodeName == 'INPUT' && (element.type == 'text' || element.type == 'password')) {
					value = element.value;
					min = element.hasAttribute("minlength") ? element.minLength : 0;
					max = element.hasAttribute("maxlength") ? element.maxLength : -1;
				} else {
					value = element.value;
				}
				var error = this.ValidateValueInput(txtLabel, value, min, max, isNum);
				if (getValidate && error) {
					errors.push(error);
					hasError = true;
					msnError += `<li class="collection-item"><b>${error.field}</b> ${error.message}</li>`;
				}
				json[element.name] = value;
				value = "";
			}
		}
		method = method || form.method;
		method == 'POST' ? json.usuario_creacion = localStorage.username : json.usuario_ultima_modificacion = localStorage.username;

		if (hasError && !(showMsgError == false)) {
			msnError += ' </ul>';
			Util.getMsnDialog('warning', msnError);
		}

		return { data: json, error: hasError, message: errors };
	}

	/**
    * @author Miguel Chan <michan@palaceresorts.com>
    * Funcion para obtener si el valor del input es valido
    * @param Object value. valor a validar
    * @param Object min. valor minimo permitido
	* @param Object max. valor maximo permitido
	* @param Boolean isNum. determina si la validacion es numerica
    * @return mixed
    */
	static ValidateValueInput(name, value, min, max, isNum){
		var min = min || 0,
			max = max || -1,
			isNum = isNum == undefined ? false : isNum,
			valueLength = isNum ? 0 : value.length;
		if(value == undefined || value == null || value == ""){
			return { field: name, message: `is required` };
		} else if((isNum && (value < min)) || (isNum == false && (valueLength < min))){
			return { field: name, message: `the value is less than the required value` };
		} else if((isNum && (max != -1 && value > max)) || (isNum == false && (max != -1 && valueLength > max))){
			return { field: name, message: `the value is greater than the allowed value` };
		}
		return null;
	}

	/**
    * @author Miguel Chan <michan@palaceresorts.com>
    * Se obtiene el array de correos dado un string, retorna los posible emails no validos
    * @param String stringEmails. string de emails
    * @param Boolean showErros. valor para mostrar el mensaje de error
    * @return mixed
    */
	static getEmailsOfString(stringEmails, showErros) {
		showErros = showErros === undefined ? true : showErros
		var emails = stringEmails.replace(/(\n|\s|,|;|:)/mg," ").split(/\b\s+(?!$)/);
		return this.ValidateListEmail(emails, showErros);
	}

	/**
	* @author Miguel Chan <michan@palaceresorts.com>
	* Funcion para validar una lista de correos, retorna los posibles errores
	* @param Array elements. array de emails
    * @param Boolean showMsg. valor para mostrar el mensaje de error
	* @return
	*/
	static ValidateListEmail(elements,showMsg) {
		var totalElements = elements.length,
			errors = [],
			succes = [],
			showMsg = showMsg === undefined ? true : showMsg
		;
		for (let i = 0; i < totalElements; i++) {
			var value = elements[i].trim();
			if (this.isValidEmail(value))
				succes.push(value);
			else
				errors.push(value);
		}
		var hasError = !(succes.length == totalElements && totalElements > 0),
			msgError = errors.join(",")
		;
		succes = [...new Set(succes)]
		if(hasError && showMsg) Util.getMsnDialog( 'warning', `You have entered an invalid email address ${msgError != "" ? ": " + msgError : ""}.`)
		return {hasError: hasError, emails: succes, errors:errors};
	}

	/**
	* @author Miguel Chan <michan@palaceresorts.com>
	* Valida dado un string de correo es valido
	* @param value:(String)
	* @return mixed
	*/
	static isValidEmail(value){
		var mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return value.match(mailformat)
	}

	/**
    * @author Miguel Chan <michan@palaceresorts.com>
    * Funcion para parciar un arreglo en grupos
    * @param array:(array)
    * @param size:(int)
    * @return mixed
    */
	static chunkArray(array, size){
		var tempArray = [];
		for (let index = 0; index < array.length; index += size) {
			tempArray.push(array.slice(index, index+size));
		}
		return tempArray;
	}

}

module.exports = Util;

