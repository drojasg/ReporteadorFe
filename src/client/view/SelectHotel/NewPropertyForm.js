import React, { Component } from 'react'
import CleverConfig from '../../../../config/CleverConfig'
import {CleverForm, CleverRequest} from 'clever-component-library'

export default class NewPropertyForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewPropertyForm: {},
            listBrands: [],
            listPropertyTypes: [],
            listTimeZones: [],
            listFilters: [],
            listLanguages: [],
        }
    }

    componentDidMount() {
        this.getBrands();
        this.getPropertyTypes();
        this.getTimeZones();
        this.getFilters();
        this.getLanguages();
    }

    getBrands = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/brand/get`, (response, error) => { 
            if (!error) {
                let brands = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        brands.push({value: data.iddef_brand, option:data.name});
                    }
                });
                this.setState({listBrands: brands});
            }
        });
    }

    getPropertyTypes = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/property-type/get`, (response, error) => { 
            if (!error) {
                let property_types = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        property_types.push({value: data.iddef_property_type, option:data.description});
                    }
                });
                this.setState({listPropertyTypes: property_types});
            }
        });
    }

    getTimeZones = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/time-zone/get?all`, (response, error) => { 
            if (!error) {
                let timeZones = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        timeZones.push({value: data.iddef_time_zone, option:data.code});
                    }
                });
                this.setState({listTimeZones: timeZones});
            }
        });
    }

    getFilters = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/filters/get`, (response, error) => { 
            if (!error) {
                let filters = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        filters.push({value: data.iddef_filters, option:data.name});
                    }
                });
                this.setState({listFilters: filters});
            }
        });
    }

    getLanguages = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/language/get`, (response, error) => { 
            if (!error) {
                let languages = [];
                response.data.map((data) => {
                    languages.push({value: data.iddef_language, option:data.lang_code});
                });
                this.setState({listLanguages: languages});
            }
        });
    }

    getData = () => {
        let data = this.refFormProperty.getData().values;
        let dataProperty = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            dataProperty.short_name = data.short_name;
            dataProperty.trade_name = data.trade_name;
            dataProperty.icon_logo_name = data.icon_logo_name;
            dataProperty.property_code = data.property_code;
            dataProperty.web_address = data.web_address;
            dataProperty.iddef_time_zone = data.iddef_time_zone;
            dataProperty.iddef_brand = data.iddef_brand;
            dataProperty.iddef_property_type = data.iddef_property_type;
            dataProperty.filters = data.filters;
            dataProperty.property_lang = data.property_lang;
            dataProperty.estado = data.estado;
        }
        return dataProperty;
    }

    render() {
        return (
            <CleverForm
                id={'formModalProperty'}
                ref={ref => this.refFormProperty = ref}
                data={this.props.dataNewPropertyForm}
                forms={[
                    {
                        inputs:[{
                            row: [
                                {type: 'text', size:'col s6 m6 l3', name: 'trade_name', label: 'Property name', required: true, uppercase: false},
                                {type: 'text', size:'col s6 m6 l3', name: 'short_name', label: 'Short name', required: true, uppercase: false},
                                {type: 'text', size:'col s6 m6 l3', name: 'property_code', label: 'Code', required: true, uppercase: false},
                                {type: 'text', size:'col s6 m6 l3', name: 'web_address', label: 'Web address', required: true, uppercase: false},
                                {type: 'select', size:'col s6 m6 l3', name: 'iddef_time_zone', label: 'Time zone', required: true, uppercase: false, options: this.state.listTimeZones},
                                {type: 'select', multiple: true, size:'col s6 m6 l3', name: 'property_lang', label: 'Property language', required: true, uppercase: false, options: this.state.listLanguages},
                                {type: 'select', size: 'col s6 m6 l3', name: 'iddef_brand', label: 'Brand', required: true, uppercase: false, options: this.state.listBrands},
                                {type: 'select', size: 'col s6 m6 l3', name: 'iddef_property_type', label: 'Property type', required: true, uppercase: false, options: this.state.listPropertyTypes},
                                {type: 'select', size: 'col s6 m6 l3', name: 'estado', label: 'Status', required: true, uppercase: false, options: [
                                    {value: 0, option: 'Closed'},
                                    {value: 1, option: 'Open'},
                                ]},
                                {type: 'select', multiple: true, size:'col s6 m6 l3', name: 'filters', label: 'Filters', required: true, uppercase: false, options: this.state.listFilters},
                                {type: 'text', size:'col s6 m6 l3', name: 'icon_logo_name', label: 'Icon name', required: true, uppercase: false},
                            ]
                        }]
                    },
                ]}
            />
        )
    }
}
