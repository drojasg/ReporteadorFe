'use strict';

/**
* @property string. Variable de entorno del sistema
*/
const ENV = process.env.APP_ENV || 'DEV';


/**
* @author Felipe Tun Cauich <ftun@palaceresorts.com>
* Clase para obtener informacion de las configuraciones del entorno de la aplicacion
*/
class CleverConfig {

	/**
 * Funcion para obtener la url base del Api de un modulo de Clever
 * @param string.
 * @return string.
 */
	static getApiUrl(module) {
		var urls = CleverConfig.environmentSettings();
		return urls['apiUrl'][module];
	}

	/**
 * Funcion para obtener la url base del frontend de la aplicacion de un modulo de Clever
 * @param string.
 * @return string.
 */
	static getFeUrl(module) {
		var urls = CleverConfig.environmentSettings();
		return urls['feUrl'][module];
	}

	/**
 * Funcion que retorna un objeto json de las configuracion en base al entorno de la aplicacion
 * @return object.
 */
	static environmentSettings() {
		var config = {
			'DEV': {
				'apiUrl': {
                    'bengine': 'http://127.0.0.1:5000', /* 'http://bengine-api-qa.clever.palace-resorts.local', */
					'booking': 'http://booking-api-qa.clever.palace-resorts.local',
					'rate': 'http://rates-api-qa.clever.palace-resorts.local',
					'contract': 'http://contracts-api-qa.clever.palace-resorts.local',
					'wire': 'http://wire-dev6/WireREST/api',
					'core': 'http://core-api-qa.clever.palace-resorts.local',
					'auth': 'http://auth-api-qa.clever.palace-resorts.local',
					'frm': 'http://frm-api-qa.clever.palace-resorts.local',
					'general': 'http://dev.clever-api-contracts.local',
					'fin': 'http://fin-api-qa.clever.palace-resorts.local',
					'products': 'http://dev.clever-api-products.local',
					'events': 'http://dev.clever-api-events.local',
					'productions': 'http://dev.clever-api-productions.local',
					'profile': 'http://profile-api-qa.clever.palace-resorts.local',
					'supplier': 'http://10.8.18.183',
					'benefit': 'http://dev.clever-api-benefit.local',
					'books': 'http://books-api-qa.clever.palace-resorts.local',
					'apiReportPy': 'http://report-api-qa.clever.palace-resorts.local',
					'apiAssetsPy':'http://awsutil-api-qa.clever.palace-resorts.local',
					'auth2': 'http://10.8.19.232',
					'cleversign': {
						'url': 'http://sign-front-qa.clever.palace-resorts.local',
						'user': 'cleversign',
						'password': 'yP7e]$~<C/z=74'
					},
					'apimaps': 'https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places',
					'wireclever': 'http://web-test19:8086/CleverReservationService',//'http://wire-dev6',//'http://wire-dev2/AspNetCoreWebService'/*'https://wireclever.palaceresorts.com'*/
				},
				'feUrl': {
                    'bengine': 'http://localhost:5000',
					'core': 'http://localhost:3000',
					'contract': 'http://qa.clever-contracts-front.palace-resorts.local',
					'events': 'http://events-front-qa.clever.palace-resorts.local',
					'products': 'http://products-front-qa.clever.palace-resorts.local',
					'productions': 'http://productions-front-qa.clever.palace-resorts.local',
					'profile': 'http://profile-front-qa.clever.palace-resorts.local',
					'leads': 'http://leads-front-qa.clever.palace-resorts.local',
					'sales': 'http://sales-front-qa.clever.palace-resorts.local',
					'crm': 'http://10.8.18.205',
					'proagent': 'http://proagent-front-qa.clever.palace-resorts.local',
					'supplier': 'http://10.8.18.195',
					'benefit': 'http://dev.clever-benefit.local',
					'books': 'http://books-front-qa.clever.palace-resorts.local'
				}
			},
			'QA': {
				'apiUrl': {
					'bengine': 'http://bengine-api-qa.clever.palace-resorts.local',
					'booking': 'http://booking-api-qa.clever.palace-resorts.local',
					'rate': 'http://rates-api-qa.clever.palace-resorts.local',
					'contract': 'http://contracts-api-qa.clever.palace-resorts.local',
					'wire': 'http://web-asp/BBRest/api',
					'core': 'http://core-api-qa.clever.palace-resorts.local',
					'auth': 'http://auth-api-qa.clever.palace-resorts.local',
					'frm': 'http://frm-api-qa.clever.palace-resorts.local',
					'general': 'http://contracts-api-qa.clever.palace-resorts.local',
					'fin': 'http://fin-api-qa.clever.palace-resorts.local',
					'products': 'http://products-api-qa.clever.palace-resorts.local',
					'events': 'http://events-api-qa.clever.palace-resorts.local',
					'productions': 'http://productions-api-qa.clever.palace-resorts.local',
					'profile': 'http://profile-api-qa.clever.palace-resorts.local',
					'supplier': 'http://10.8.18.183',
					'benefit': 'http://dev.clever-api-benefit.local',
					'books': 'http://books-api-qa.clever.palace-resorts.local',
					'apiReportPy': 'http://report-api-qa.clever.palace-resorts.local',
					'apiAssetsPy':'http://awsutil-api-qa.clever.palace-resorts.local',
					'auth2': 'http://10.8.19.232',
					'cleversign': {
						'url': 'http://sign-front-qa.clever.palace-resorts.local',
						'user': 'cleversign',
						'password': 'yP7e]$~<C/z=74'
					},
					'apimaps': 'https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places',
					'wireclever': 'http://wire-dev6/clever_reservation',//'http://wire-dev6',//'http://wire-dev2/AspNetCoreWebService'/*'https://wireclever.palaceresorts.com'*/
				},
				'feUrl': {
					'bengine': 'http://bengine-admin-qa.clever.palace-resorts.local',
					'core': 'http://front-qa.clever.palace-resorts.local',
					'contract': 'http://qa.clever-contracts-front.palace-resorts.local',
					'events': 'http://events-front-qa.clever.palace-resorts.local',
					'products': 'http://products-front-qa.clever.palace-resorts.local',
					'productions': 'http://productions-front-qa.clever.palace-resorts.local',
					'profile': 'http://profile-front-qa.clever.palace-resorts.local',
					'leads': 'http://leads-front-qa.clever.palace-resorts.local',
					'sales': 'http://sales-front-qa.clever.palace-resorts.local',
					'crm': 'http://10.8.18.205',
					'proagent': 'http://proagent-front-qa.clever.palace-resorts.local',
					'supplier': 'http://10.8.18.195',
					'benefit': 'javascript:void(0)',
					'books': 'http://books-front-qa.clever.palace-resorts.local'
				}
			},
			'PRO': {
				'apiUrl': {
					'bengine': 'http://bengine-api.clever.palace-resorts.local',
					'booking': 'http://booking-api.clever.palace-resorts.local',
					'contract': 'http://contracts-api.clever.palace-resorts.local',
					'wire': 'http://web-asp/BBRest/api',
					'core': 'http://core-api.clever.palace-resorts.local',
					'auth': 'http://auth-api.clever.palace-resorts.local',
					'frm': 'http://frm-api.clever.palace-resorts.local',
					'general': 'http://contracts-api.clever.palace-resorts.local',
					'fin': 'http://finance-api.clever.palace-resorts.local',
					'profile': 'http://10.8.17.196',
					'events': 'http://events-api.clever.palace-resorts.local',
					'products': 'http://products-api.clever.palace-resorts.local',
					'productions': 'http://productions-api.clever.palace-resorts.local',
					'supplier': 'http://10.8.17.29',
					'benefit': 'http://dev.clever-api-benefit.local',
					'books': 'http://books-api.clever.palace-resorts.local',
					'apiReportPy': 'http://report-api.clever.palace-resorts.local',
					'apiAssetsPy':'http://awsutil-api.clever.palace-resorts.local',
					'cleversign': {
						'url': 'https://sign.palaceresorts.com',
						'user': 'cleversign',
						'password': 'yP7e]$~<C/z=74'
					},
					'apimaps': 'https://maps.googleapis.com/maps/api/js?key=&v=3.exp&libraries=geometry,drawing,places',
					'wireclever':'http://web-asp/resv',
				},
				'feUrl': {
					'bengine': 'http://bengine-admin.clever.palace-resorts.local/',
					'core': 'http://front.clever.palace-resorts.local',
					'contract': 'http://contracts-front.clever.palace-resorts.local',
					'events': 'http://events-front.clever.palace-resorts.local',
					'products': 'http://products-front.clever.palace-resorts.local',
					'productions': 'http://productions-front.clever.palace-resorts.local',
					'profile': 'http://profile-front.clever.palace-resorts.local',
					'leads': 'http://leads-front.clever.palace-resorts.local',
					'sales': 'http://sales-front.clever.palace-resorts.local',
					'crm': 'http://10.8.19.17',
					'proagent': 'http://proagent-front.clever.palace-resorts.local',
					'supplier': 'http://suppliers-front.clever.palace-resorts.local',
					'benefit': 'javascript:void(0)',
					'books': 'http://books-front.clever.palace-resorts.local'
				}
			}
		};

		return config[ENV];
	}
}

module.exports = CleverConfig; // require('../../../../config/CleverConfig');
//# sourceMappingURL=CleverConfig.js.map
