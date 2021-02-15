import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverEditor, CleverLoading, MComponentes, CleverButton } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from './../../../../axiosRequest';
import SelectedGalery from '../../../../components/galery/SelectedGalery';
import ContentIconsSVG from '../../../../components/SVG/ContentIconsSVG';

import "./csss.css"
import { isUndefined } from 'util';


class Services extends Component {
    constructor(props) {
        super(props)
        this.getUrlIcons = this.getUrlIcons.bind(this);
        this.getNameIcon = this.getNameIcon.bind(this);
        this.state = {
            newRowsLang: [],
            fieldDateServicesSamePrice: [],
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            nameViewIcons : 'visibility',
            viewICONS:false
        }
    }


    componentDidMount() {
        this.getDataServices();
        this.getCurrency();
        this.getPricing();
        this.getRestrictions();
        this.getLenguajes();
        this.props.btnAddService.current.id ?
            document.getElementById(this.props.btnAddService.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
            : null;
    }


    getDataServices() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/service/search-property/" + this.state.hotelData.iddef_property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                this.instanceGrid.setDataProvider(response.data);
            }
            else {
                MComponentes.toast("ERROR in services");
                console.log(error)

            };
            this.setState({ loader: false })
        });
    }

    getCurrency() {
        //Obetnemos las Currency
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/currency/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: String(response.data[index].iddef_currency), option: `${response.data[index].description} (${response.data[index].currency_code})` })
                    }
                    this.setState({ currencySelect: options })
                }
            }
            else {
                MComponentes.toast("ERROR get currency");
                console.log(error)

            };
        });
    }

    getPricing() {
        this.setState({pricingSelect:null , pricing:null})
        //Obetnemos las Currency
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/service-pricing-type/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: String(response.data[index].iddef_service_pricing_type), option: response.data[index].description })
                    }
                    this.setState({ pricingSelect: options, pricing: response.data })
                }
            }
            else {
                MComponentes.toast("ERROR get pricing");
                console.log(error)

            };
        });
    }
    getRestrictions() {
        //Obetnemos las restricciones
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/restriction/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: String(response.data[index].iddef_restriction), option: response.data[index].name })
                    }
                    this.setState({ restrictionSelect: options })
                }
            }
            else {
                MComponentes.toast("ERROR get restrictions");
                console.log(error)

            };
        });
    }

    getLenguajes() {
        //Obtenemos lenguajes disponibles
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property-lang/get?property=" + this.state.hotelData.iddef_property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                this.setState({ lenguajes: response.data })
            }
            else {
                MComponentes.toast("ERROR get lenguaje");
                console.log(error)

            };
        });
    }

    openModal(e, option, data) {
        this.setState({ dataForm: null, loader:true })
        if (option == "EDIT") {

            CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/service/search-property-lang/${data.iddef_service}/${this.state.hotelData.iddef_property}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!response.Error) {

                    let newDatos_services = []
                    for (let index = 0; index < response.data[0].datos_services.length; index++) {
                        response.data[0].datos_services[index].price = String(response.data[0].datos_services[index].price)
                        /*  newDatos_services.push(datos_services.price[index]) */
                    }



                    this.setState({
                        loader:false,
                        option: option,
                        dataForm: {
                            iddef_service: String(response.data[0].iddef_service),
                            service_code: response.data[0].service_code,
                            html_icon: response.data[0].html_icon,
                            nameInformation: response.data[0].name,
                            datos_cont_lang: response.data[0].datos_cont_lang,
                            iddef_currency: String(response.data[0].iddef_currency),
                            iddef_pricing_type: String(response.data[0].pricing_option.value),
                            pricing_options: String(response.data[0].pricing_option.option),
                            datos_restriction: this.castArrayStringToNumber(response.data[0].datos_restriction, "USER"),
                            available_upon_request: [String(response.data[0].available_upon_request)],
                            auto_add_price_is_zero: [String(response.data[0].auto_add_price_is_zero)],
                            is_same_price_all_dates: String(response.data[0].is_same_price_all_dates),
                            pricing_unit: String(response.data[0].pricing_option.units),
                            datos_services: 
                            response.data[0].datos_services.length > 0 ?
                                response.data[0].datos_services :
                                [{
                                    start_date: this.getNowDate(this.addDays(null)),
                                    end_date: this.getNowDate(this.addDays(1)),
                                    min_los: "0",
                                    price: "0",
                                    iddef_service_price: "6",
                                    max_los: "0"
                                }]

                        }
                    }, () => { this.rowNameLang(); this.onChangePricing(null, String(response.data[0].iddef_pricing_type), "INIT"); this.rowDateServices(); this.refModalAdd.getInstance().open(); })
                }
                else {
                    this.setState({loader:false})
                    MComponentes.toast("ERROR data");
                    console.log(error)

                };
            });
        }
        else if (option == "ADD") {
            this.setState({
                loader:false,
                option: option,
                dataForm: {
                    iddef_service: "0",
                    service_code: "",
                    html_icon: "",
                    nameInformation: "",
                    datos_cont_lang: [],
                    iddef_currency: "1",
                    iddef_pricing_type: "1",
                    pricing_options: "0",
                    pricing_unit:"",
                    datos_restriction: [],
                    available_upon_request: [],
                    auto_add_price_is_zero: [],
                    is_same_price_all_dates: "1",
                    datos_services: [{
                        start_date: this.getNowDate(this.addDays(null)),
                        end_date: this.getNowDate(this.addDays(1)),
                        min_los: "0",
                        price: "0",
                        iddef_service_price: "6",
                        max_los: "0"
                    }]

                }
            }, () => { this.rowNameLang(); this.onChangePricing(null, String("1"), "INIT"); this.rowDateServices(); this.refModalAdd.getInstance().open(); })

        }
    }
    castArrayStringToNumber(arraytocast, type) {
        if(arraytocast.length <= 0){
            return []
        }
        let newFormat = []
        //[1,2] -> ["1","2"]
        if (type == "USER") {
            arraytocast.map((arraytocast) =>
                newFormat.push(String(arraytocast))
            )
        }
        //["1","2"] -> [1,2]
        else if (type == "SYSTEM") {
            arraytocast.map((arraytocast) =>
                newFormat.push(Number(arraytocast))
            )
        }

        return newFormat
    }

    getNowDate(date) {
        var today = date ? date : new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        return (yyyy + '-' + mm + '-' + dd);

    }
    addDays(days) {
        var result = new Date();
        result.setDate(result.getDate() + days);
        return result;
    }

    getDataForm() {
        this.setState({loader:true})
        let valid = this.refFormView.getData()
        let refFormView = this.refFormView.getData().values
        let datos_cont_lang = []
        let datos_services = []
        if(this.state.dataForm.service_code.length > 45){
            this.setState({loader:false})
            MComponentes.toast('Maximum "Service code" field size is 10');
            return;
        }

        if(valid.required.count > 0){
            this.setState({loader:false})
            MComponentes.toast("Error, empty fields ");
            return;
        }
        if(valid.values.pricing_options == ""){
            this.setState({loader:false})
            MComponentes.toast("Error, empty fields Offered Quantity");
            return;
        }


        for (let index = 0; index < this.state.dataForm.datos_services.length; index++) {

            if (isNaN(parseFloat(refFormView["priceloss" + index])) || isNaN(parseInt(refFormView["minloss" + index])) || isNaN(parseInt(refFormView["maxloss" + index])) ) {
                this.setState({loader:false})
                MComponentes.toast("Set a number valid in PRICES AND BOOKING");
                return;

            }

            if (this.state.option == "ADD") {
                datos_services.push({
                    start_date: isUndefined(refFormView["dateStartLoss" + index]) ? this.getNowDate(this.addDays(null)) : refFormView["dateStartLoss" + index],
                    end_date: isUndefined(refFormView["dateEndLoss" + index]) ? this.getNowDate(this.addDays(1)) : refFormView["dateEndLoss" + index],
                    min_los: String(refFormView["minloss" + index]),
                    price: parseFloat(refFormView["priceloss" + index]),
                    max_los: String(refFormView["maxloss" + index])
                })
            } else if (this.state.option == "EDIT") {
                datos_services.push({
                    start_date: isUndefined(refFormView["dateStartLoss" + index]) ? this.getNowDate(this.addDays(null)) : refFormView["dateStartLoss" + index],
                    end_date: isUndefined(refFormView["dateEndLoss" + index]) ? this.getNowDate(this.addDays(1)) : refFormView["dateEndLoss" + index],
                    min_los: String(refFormView["minloss" + index]),
                    price: parseFloat(refFormView["priceloss" + index]),
                    iddef_service_price: this.state.dataForm["idloss" + index],
                    max_los: String(refFormView["maxloss" + index])
                })
            }
        }

        if (this.state.dataForm.datos_cont_lang.length > 0) {
            if (this.state.dataForm.datos_cont_lang[0].data_media.length > 0) {
                for (let index = 0; index < this.state.lenguajes.length; index++) {
                    let medias_id = [];
                    this.state.dataForm.datos_cont_lang[index].data_media.map((item, key) => {
                        medias_id.push(item.iddef_media);
                    })
                    datos_cont_lang.push({
                        language_code: this.state.lenguajes[index].language_code,
                        data_media: medias_id,
                        datos_lang: [{
                            Name: refFormView["nameContent" + this.state.arrayLang[index]],
                            icon_description: refFormView["iconDescription" + this.state.arrayLang[index]],
                            Description: this[`refEditorDescription${this.state.arrayLang[index]}`].getContent(),
                            Teaser: this[`refEditorTeaster${this.state.arrayLang[index]}`].getContent()
                        }]
                    })
                }
            }
            else {
                MComponentes.toast("Select a Img");
                this.setState({ loader: false })
                return;
            }
        } else {
            MComponentes.toast("Select a Img");
            this.setState({ loader: false })
            return;
        }

        var dataSend = {}
        var units = 0
        if (Number(this.state.dataForm.iddef_pricing_type) == 1 && Number(this.state.dataForm.pricing_options) == 2) {
            if (isNaN(Number(refFormView.pricing_unit)) || refFormView.pricing_unit == "") {
                MComponentes.toast("Error type Unit field");
                this.setState({ loader: false })
                return;
            }else{
                units = Number(refFormView.pricing_unit)
            }
        }

        let dataPricing = {
            value: Number(refFormView.iddef_pricing_type),
            option : Number(refFormView.pricing_options),
            units : units

        }

        if (this.state.option == "EDIT") {

            dataSend = {
                iddef_service: Number(this.state.dataForm.iddef_service),
                name: refFormView.nameInformation,
                service_code: this.state.dataForm.service_code,
                html_icon: refFormView.html_icon,
                available_upon_request: refFormView.available_upon_request.length > 0 ? Number(refFormView.available_upon_request[0]) : 0,
                auto_add_price_is_zero: refFormView.auto_add_price_is_zero.length > 0 ? Number(refFormView.auto_add_price_is_zero[0]) : 0,
                is_same_price_all_dates: Number(refFormView.is_same_price_all_dates),
                iddef_property: Number(this.state.hotelData.iddef_property),
                iddef_pricing_type: Number(refFormView.iddef_pricing_type),
                iddef_currency: Number(refFormView.iddef_currency),
                datos_restriction: this.castArrayStringToNumber(refFormView.datos_restriction, "SYSTEM"),
                datos_services: datos_services,
                datos_cont_lang: datos_cont_lang,
                datos_pricing_option: dataPricing
            }
        } else if(this.state.option == "ADD"){
            dataSend = {
                name: refFormView.nameInformation,
                service_code: this.state.dataForm.service_code,
                html_icon: refFormView.html_icon,
                available_upon_request: refFormView.available_upon_request.length > 0 ? Number(refFormView.available_upon_request[0]) : 0,
                auto_add_price_is_zero: refFormView.auto_add_price_is_zero.length > 0 ? Number(refFormView.auto_add_price_is_zero[0]) : 0,
                is_same_price_all_dates: Number(refFormView.is_same_price_all_dates),
                iddef_property: Number(this.state.hotelData.iddef_property),
                iddef_pricing_type: Number(refFormView.iddef_pricing_type),
                iddef_currency: Number(refFormView.iddef_currency),
                datos_restriction: this.castArrayStringToNumber(refFormView.datos_restriction, "SYSTEM"),
                datos_services: datos_services,
                datos_cont_lang: datos_cont_lang,
                datos_pricing_option: dataPricing
            }
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') + '/api/service/create', dataSend, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    this.refModalAdd.getInstance().close()
                    this.getDataServices();
                    this.getPricing();
                    this.setState({loader:false})
                    MComponentes.toast("Success");
                } else if (response.Error == true) {
                    this.setState({loader:false})
                    MComponentes.toast(response.Msg);
                    this.refModalAdd.getInstance().close()
                }
            }
        });

    }


    rowDateServices() {
        let newRows = []
        if (this.state.dataForm.is_same_price_all_dates == "1") {
            for (let index = 0; index < this.state.dataForm.datos_services.length; index++) {
                newRows.push({ type: 'text', size: 'col s12 m4 l4', required: true, label: 'Price', name: 'priceloss' + index, alphanumeric: true })
                newRows.push({ type: 'number', size: 'col s12 m4 l4', required: true, label: 'Min LOS(Days)', name: 'minloss' + index, min: 0  })
                newRows.push({ type: 'number', size: 'col s12 m4 l4', required: true, label: 'Max LOS(Days)', name: 'maxloss' + index, min: 0  })

            }

        } else if (this.state.dataForm.is_same_price_all_dates == "0") {
            for (let index = 0; index < this.state.dataForm.datos_services.length; index++) {
                newRows.push(
                    {
                        type: 'component', component: () => {
                            return (
                                <React.Fragment>
                                    <h5 style={{ marginTop: "1.75rem" }}>{"DATE RANGE N° " + (index + 1)}</h5>
                                </React.Fragment>
                            )
                        }
                    }
                )
                newRows.push({ type: 'date', colDate: "col s12 m5 l5 ", required: true, label: 'Name', name: 'dateStartLoss' + index })
                newRows.push({ type: 'date', colDate: "col s12 m5 l5 ", required: true, label: 'Name', name: 'dateEndLoss' + index })
                newRows.push({ type: 'button', size: 'col s12 m2 l2', hidden: this.state.dataForm.datos_services.length == "1" ? true : false, label: '-', onClick: () => this.addRange("DELETE", index) })
                newRows.push({ type: 'text', size: 'col s12 m4 l4', required: true, label: 'Price', name: 'priceloss' + index, alphanumeric: true })
                newRows.push({ type: 'number', size: 'col s12 m4 l4', required: true, label: 'Min LOS(Days)', name: 'minloss' + index, min: 0 })
                newRows.push({ type: 'number', size: 'col s12 m4 l4', required: true, label: 'Max LOS(Days)', name: 'maxloss' + index, min: 0 })

            }
        }
        this.setState({ fieldDateServicesSamePrice: newRows }, () => this.setTextDateRange())
    }

    setTextDateRange() {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));

        for (let index = 0; index < this.state.dataForm.datos_services.length; index++) {
            delete newForm["dateStartLoss" + index]
            delete newForm["dateEndLoss" + index]
            delete newForm["priceloss" + index]
            delete newForm["minloss" + index]
            delete newForm["maxloss" + index]
            delete newForm["idloss" + index]
        }


        for (let index = 0; index < this.state.dataForm.datos_services.length; index++) {
            newForm["dateStartLoss" + index] = this.state.dataForm.datos_services[index].start_date
            newForm["dateEndLoss" + index] = this.state.dataForm.datos_services[index].end_date
            newForm["priceloss" + index] = String(this.state.dataForm.datos_services[index].price)
            newForm["minloss" + index] = String(this.state.dataForm.datos_services[index].min_los)
            newForm["maxloss" + index] = String(this.state.dataForm.datos_services[index].max_los)
            newForm["idloss" + index] = String(this.state.dataForm.datos_services[index].iddef_service_price)
        }
        this.setState({ dataForm: newForm })

    }

    onChangeSamePrice(e) {
        
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        newForm.is_same_price_all_dates = e.value
        this.setState({ dataForm: newForm }, () => this.rowDateServices())
    }

    addRange(option, index) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));

        if (option == "ADD") {
            let copy =
            {
                start_date: this.getNowDate(null),
                max_los: "0",
                iddef_service_price: 6,
                iddef_service: this.state.dataForm.iddef_service,
                price: Math.floor(Math.random() * 10) + 1,
                min_los: "0",
                end_date: this.getNowDate(this.addDays(1))
            }
            newForm.datos_services.push(copy)
        }
        else if (option == "DELETE") {
            newForm.datos_services.splice(index, 1)
        }

        this.setState({ dataForm: newForm }, () => this.rowDateServices())
    }

    saveSelectedImg(responseImg) {

        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        let refFormView = this.refFormView.getData().values
        let datos_cont_lang = []
        for (let index = 0; index < this.state.lenguajes.length; index++) {
            datos_cont_lang.push({
                language_code: this.state.lenguajes[index].language_code, data_media: responseImg,
                datos_lang: [{
                    Name: refFormView["nameContent" + this.state.arrayLang[index]],
                    icon_description: refFormView["iconDescription" + this.state.arrayLang[index]],
                    Description: this[`refEditorDescription${this.state.arrayLang[index]}`].getContent(),
                    Teaser: this[`refEditorTeaster${this.state.arrayLang[index]}`].getContent()
                }]
            })
        }


        newForm.datos_cont_lang = datos_cont_lang
        this.setState({ dataForm: newForm }, () => this.rowNameLang())





    }



    rowNameLang() {

        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        let newRows = []
        let arrayLang = []
        for (let index = 0; index < this.state.lenguajes.length; index++) {
            newRows.push(
                {
                    type: 'component', component: () => {
                        return (
                            <React.Fragment>
                                <h6 className="col s12 m5 l5" style={{ marginBottom: "1em", marginTop: "1em" }}><b>{this.state.lenguajes[index].language}</b></h6>
                            </React.Fragment>
                        )
                    }
                }
            )
            newRows.push({ type: 'text', size: 'col s12 m12 l12', required: true, label: 'Name', name: 'nameContent' + this.state.lenguajes[index].language_code, characters: true, alphanumeric: true })
            newRows.push({ type: 'text', size: 'col s12 m12 l12', required: true, label: 'HTML icon description', name: 'iconDescription' + this.state.lenguajes[index].language_code, characters: true, alphanumeric: true })

            newRows.push(
                {
                    type: 'component', component: () => {
                        return (
                            <>
                                <label className="col s12 m6 l6">{"Teaser" + this.state.lenguajes[index].language_code}</label>
                                <label className="col s12 m6 l6">{"Description" + this.state.lenguajes[index].language_code}</label>
                                <div className="col s12 m6 l6" style={{ padding: '0 .75rem', margin: '0 0 1rem 0' }}>
                                    <CleverEditor name={"editorTeaster" + this.state.lenguajes[index].language_code} onRef={editor => this[`refEditorTeaster${this.state.lenguajes[index].language_code}`] = editor} />

                                </div>
                                <div className="col s12 m6 l6" style={{ padding: '0 .75rem', margin: '0 0 1rem 0' }}>
                                    <CleverEditor name={"editorDescription" + this.state.lenguajes[index].language_code} onRef={editor => this[`refEditorDescription${this.state.lenguajes[index].language_code}`] = editor} />
                                </div>


                            </>
                        )
                    }
                })

        }



        this.state.lenguajes.map((lenguajes) =>
            arrayLang.push(lenguajes.language_code)
        )

        this.setState({ newRowsLang: newRows, dataForm: newForm, arrayLang }, () => this.setTextEditors())

    }




    setTextEditors() {


        setTimeout(() => {
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            if (newForm.datos_cont_lang.length > 0) {
                if (newForm.datos_cont_lang[0].data_media.length > 0) {
                    for (let index = 0; index < newForm.datos_cont_lang.length; index++) {

                        for (let i = 0; i < this.state.arrayLang.length; i++) {
                            if (newForm.datos_cont_lang[index].language_code == this.state.arrayLang[i]) {
                                newForm["nameContent" + this.state.arrayLang[i]] = newForm.datos_cont_lang[index].datos_lang[0].Name
                                newForm["iconDescription" + this.state.arrayLang[i]] = newForm.datos_cont_lang[index].datos_lang[0].icon_description
                                this[`refEditorDescription${this.state.lenguajes[index].language_code}`].setContent(newForm.datos_cont_lang[index].datos_lang[0].Description);
                                this[`refEditorTeaster${this.state.lenguajes[index].language_code}`].setContent(newForm.datos_cont_lang[index].datos_lang[0].Teaser);
                            }

                        }
                    }
                    this.setState({ dataForm: newForm })
                }
            }
        }, 500);


    }

    onChangePricing(e, value, option) {
        let idValue = ""
        var options = []
        if (option == "INIT") {
            idValue = value
        } else if (option == "CHANGE") {
            idValue = e.value
        }
        for (let index = 0; index < this.state.pricing.length; index++) {
            if (String(this.state.pricing[index].iddef_service_pricing_type) == idValue) {
                for (let i = 0; i < this.state.pricing[index].options.length; i++){
                    options.push({ value: String(this.state.pricing[index].options[i].iddef_service_pricing_option), label: this.state.pricing[index].options[i].name })
                }
            }
        }

        let form = JSON.parse(JSON.stringify(this.state.dataForm));
        form["iddef_pricing_type"] = idValue
        this.setState({ pricingOptions: options, dataForm: form }, () => this.rowNameLang())
    }

    onChangeRestriction(e){
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        newForm[e.name] = e.values
        this.setState({ dataForm: newForm })
        
    }

    onChangeBandera(e) {
        if(e.name == "service_code"){
            if( e.value.length < 46){
                let form = JSON.parse(JSON.stringify(this.state.dataForm));
                form[e.name] = e.value
                this.setState({ dataForm: form })
            }else{
                MComponentes.toast("Maximum field size is 45");
            }
            
        }
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.value
            this.setState({ dataForm: form })
        
    }

    deleteService(e,data){
        this.refConfirm.getInstance().open()
        this.setState({ deleteService: data })
    }
    deleteServiceConfirm(){
        this.setState({loader:true})
        let data = {}
        let estado =  Number(!Boolean(this.state.deleteService.estado)) 
            axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/service/delete/${this.state.deleteService.iddef_service}/${estado}`, data, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!error) {
                    this.refConfirm.getInstance().close()
                    this.getDataServices();
                    this.getPricing();
                } else {
                    console.log(error)
                    MComponentes.toast("ERROR");
                }
                this.setState({loader:false})
            });
    }



    getConfigAddButtonsModal() {
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.getDataForm(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    getUrlIcons(functionURL=()=>{}){
        let idResort = 0;//this.state.propertySelected.iddef_property;
        let requestIcons = {
            search: "Svg_icons",
            type: 3,
            idproperty: idResort
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/media-general-search", requestIcons, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    // console.log('response ==> ',response);
                    if(response.data.length > 0){
                        let dataMedia = response.data[0];
                        let valueURL = dataMedia.url;                    
                        this.setState({urlIcons:valueURL,load: false},functionURL); 
                    }else{
                        this.setState({urlIcons:'',load: false},functionURL);
                    }
                    
                } else {
                    this.setState({urlIcons:'',load: false},functionURL);                    
                }                
            }else{
                this.setState({urlIcons:'',load: false},functionURL); 
            }
        });
    }

    viewIcons(e){
        this.setState({viewICONS:false,load: true});
        let valueFRM = this.refFormView.getData().values;
        let valueInputIcon = valueFRM.html_icon;

        this.getUrlIcons(()=>{
            this.setState({defaultIconSelected:valueInputIcon},()=>{
                this.refModal.getInstance().open();
                this.setState({nameViewIcons:'visibility_off',viewICONS:true,load:false});
            });
        });
    }

    getNameIcon(idIcon){
        let data = this.state.dataForm;

        if(idIcon !== ''){
            data['html_icon'] = idIcon;        
            this.setState({dataForm:data}); 
            this.closeModal('');     
        }
          
    }

    closeModal(e){
        this.setState({nameViewIcons:'visibility',defaultIconSelected:null,urlIcons:null,viewICONS:false},()=>
        {this.refModal.getInstance().close();
        }
        );
    }

    render() {
        let {nameViewIcons,viewICONS,urlIcons,defaultIconSelected}= this.state;
        return (
            <React.Fragment>
                <GridView
                    idTable='table-contracts-manuales'
                    filter={true}
                    serializeRows={false}
                    columns={[

                        { attribute: 'name', alias: 'Name' },
                        { attribute: 'service_code', alias: 'Service code' },
                        { attribute: 'price', alias: 'Price' },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>

                                        <a href="javascript:void(0)" onClick={(e) => this.openModal(e, "EDIT", data)} title='Edit RatePlan' ><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a href="javascript:void(0)" onClick={(e) => this.deleteService(e, data)} title='Disable RatePlan'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a href="javascript:void(0)" onClick={(e) => this.deleteService(e, data)} title='Enable RatePlan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }

                                    </div>)
                            }
                        }
                    ]}
                    onRef={grid => this.instanceGrid = grid}

                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteServiceConfirm() }}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addRestriction"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} >
                    {
                        this.state.currencySelect &&
                            this.state.restrictionSelect &&
                            this.state.lenguajes &&
                            this.state.pricingSelect &&
                            this.state.pricing &&
                            this.state.dataForm
                            ?
                            <CleverForm
                                id={'form-information'}
                                ref={ref => this.refFormView = ref}
                                data={this.state.dataForm}
                                forms={[
                                    {
                                        inputs: [
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">{'INFORMATION'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m4 l4', required: true, label: '* Name', name: 'nameInformation', characters: true, alphanumeric: true },
                                                    { type: 'text', size: 'col s12 m3 l3', onChange: (e) => this.onChangeBandera(e), required: true, label: '* Service code', name: 'service_code', characters: true, alphanumeric: true },
                                                    { type: 'text', size: 'col s12 m3 l3', required: true, label: '* html icon', name: 'html_icon', characters: true, alphanumeric: true },
                                                    { type: 'button', size: 'col s12 m1 l1', icon: nameViewIcons, onClick: (e) => this.viewIcons(e)  },
                                                ]
                                            },

                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <React.Fragment>
                                                                    <hr style={{ backgroundColor: "#018bb6", height: "1px", marginTop: "1.75rem" }}></hr>
                                                                </React.Fragment>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">{'CONTENT'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: this.state.newRowsLang
                                            },
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <div className="valign-wrapper">
                                                                    <div className="col s12 m4 l4">
                                                                        <img className="responsive-img" src={this.state.dataForm.datos_cont_lang.length > 0 ?
                                                                            (this.state.dataForm.datos_cont_lang[0].data_media.length > 0 ?
                                                                                this.state.dataForm.datos_cont_lang[0].data_media[0].url : "")
                                                                            : ""}></img>
                                                                    </div>
                                                                    <div className="col s12 m6 l6">
                                                                        <div id="cssGaleryServices">
                                                                            <SelectedGalery label={'Manager Images'} callBack={(response) => this.saveSelectedImg(response)}
                                                                                url={`/api/media-service/search-by-service-langcode/${this.state.dataForm.iddef_service}/EN/${this.state.hotelData.iddef_property}/1`} system={`bengine`} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },

                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <React.Fragment>
                                                                    <hr style={{ backgroundColor: "#018bb6", height: "1px", marginTop: "1.75rem" }}></hr>
                                                                </React.Fragment>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">{'PRICES AND BOOKING'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'select', size: 'col s12 m12 l12', label: 'Currency code', name: 'iddef_currency', manual: true, options: this.state.currencySelect, required: true },
                                                ]
                                            },
                                            {
                                                row: [
                                                    { type: 'select', size: 'col s12 m12 l12', onChange: (e) => this.onChangePricing(e, null, "CHANGE"), label: 'Pricing', id: 'iddef_pricing_type', name: 'iddef_pricing_type', manual: true, options: this.state.pricingSelect, required: true },
                                                    { type: 'radio', size: 'col s12 m6 l6', onChange: (e) => this.onChangeBandera(e), label: 'Offered quantity',id:'pricing_options',  name: 'pricing_options', radios: this.state.pricingOptions, required: true },
                                                    { type: 'text', size: Number(this.state.dataForm.iddef_pricing_type)==1 && Number(this.state.dataForm.pricing_options)==2 ? 'col s12 m6 l6' : 'col s12 m6 l6 outside', label: 'Unit', name: 'pricing_unit', characters: true, alphanumeric: true },
                                                ]
                                            },
                                            {
                                                row: [
                                                    { type: 'radio', onChange: (e) => this.onChangeSamePrice(e), size: 'col s12 m12 l12', label: 'Same price for all dates', name: 'is_same_price_all_dates', radios: [{ value: "0", label: 'Select price for ranges' }, { value: "1", label: 'Same price for all dates' }] },
                                                ]
                                            },
                                            /* {
                                                row: this.state.fieldDateServices
                                            }, */
                                            {
                                                row: this.state.fieldDateServicesSamePrice
                                            },
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <CleverButton size={'col s12 m12 l12'} hidden={this.state.dataForm.is_same_price_all_dates == "1" ? true : false} icon={'add'} label={'Add date range'} fullSize={true} onClick={() => this.addRange("ADD", null)} />
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'checkbox', size: 'col s12 m12 l12', label: 'Booking Options', name: 'available_upon_request', checkboxs: [{ value: "1", label: "Available upon request" }] },
                                                    { type: 'checkbox', size: 'col s12 m12 l12', label: '', name: 'auto_add_price_is_zero', checkboxs: [{ value: "1", label: "Automatically add when price is zero" }] },

                                                ]
                                            },
                                            {
                                                row: [
                                                    { type: 'select', onChange: (e) => this.onChangeRestriction(e), multiple: true, size: 'col s12 m12 l12', label: 'Access restrictions', name: 'datos_restriction', manual: true, options: this.state.restrictionSelect },
                                                ]
                                            }
                                        ]
                                    }
                                ]}
                            />
                            : null}
                </Modal>

                <Modal                
                idModal = "viewIcons"
                name = "viewIcons"
                isFull={true}
                defaultButton={{click:e=> this.closeModal(e),buttonClass: "red", text:"CLOSE"}}
                onRef={modal => this.refModal = modal}
            >
                {viewICONS == true? 
                    <div className="row">
                        <ContentIconsSVG 
                            width = {'50px'}
                            height = {'50px'}
                            color = {'#11ae92'}
                            colorIconSelect = {'#01536d'}
                            urlFile = {urlIcons}
                            onRef = {ref => this.referenceIcon = ref}
                            size = {'col s2 m2 l2'}
                            valueSelected = {defaultIconSelected}
                            label={'Choose Icon'}
                            onSaveIcon = {this.getNameIcon}
                            viewBtnSave= {true}
                            iconBtn={'check'}
                        /> 
                    </div>
                :null}
                
            </Modal>

                <CleverLoading show={this.state.loader} />
            </React.Fragment>
        );
    }
}

export default Services;