import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import GridViewAux from '../../../../components/gridView/GridView'
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from './../../../../axiosRequest';
import Rooms from './Rooms';

class RatePlan extends Component {
    constructor(props) {
        super(props)
        this.arrayCuartos = []
        this.arrayPropiedades = []
        this.getDataForm = this.getDataForm.bind(this);
        this.onChangeRooms = this.onChangeRooms.bind(this);
        this.state = {
            copyRatePlan:{code:""},
            text_modal:"",
            demoCross: { percent: "0" },
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            disableAddCross: false
        }
    }

    componentDidMount() {
        this.getDataRatePlan();
        this.getRoomListSearch();
    }

    getRoomListSearch() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/room-type-category/get/list", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        if (response.data[index].room_name.length > 0) {
                            options.push({ value: response.data[index].room_code, option: response.data[index].room_name })
                        }
                    }
                    this.setState({ roomFilter: options })
                }
            }
            else {
                MComponentes.toast("ERROR");
                console.log(error)
            };
        });
    }


    searchInGrid(e) {
        let searchInGrid =  this.refFormSearch.getData().values
        let newGridCode = []
        let newGridRoom = []


        if (searchInGrid.nameFilter != "") {
            for (let index = 0; index < this.state.dataGrid.length; index++) {
                var str = this.state.dataGrid[index].code
                var matching = searchInGrid.nameFilter
                var res = str.match(new RegExp(matching, 'gi'));
                if (res != null || res > 0) {
                    newGridCode.push(this.state.dataGrid[index])
                }
            }
        } else {
            newGridCode = JSON.parse(JSON.stringify(this.state.dataGrid));
        }

        if (searchInGrid.roomFilterOption != "" && searchInGrid.roomFilterOption.length > 0) {
            for (let index = 0; index < newGridCode.length; index++) {
                var arrayGrid = newGridCode[index].rooms
                var arraySearch = searchInGrid.roomFilterOption

                for (let i = 0; i < arraySearch.length; i++) {
                    if (arrayGrid.indexOf(arraySearch[i]) != -1) {
                        newGridRoom.push(newGridCode[index])
                        break;
                    }
                }


            }
            this.instanceGrid.setDataProvider(newGridRoom);

        } else {
            this.instanceGrid.setDataProvider(newGridCode);
        }

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

    getDataRatePlan() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/rate-plan/get?all=1&order=estado&desc=1", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                let data= [];
                if (response != null) {
                    data = response.data !== undefined ? response.data :[];

                    data.map(dataRate =>{
                        dataRate.textESTADO= dataRate.estado == 0 ? "DISABLE" :"ENABLE";
                    });
                    this.instanceGrid.setDataProvider(data);
                }
                this.getDataSelects();
                this.setState({ loader: false, dataGrid: data })
            }
            else {
                MComponentes.toast("ERROR in rate plan");
                console.log(error)
                this.setState({ loader: false })
            };
        });
    }

    getHotelGrid(){
        this.setState({dataHoteles:null })

        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {

                    this.setState({  dataHoteles: response.data },() => this.instanceGridHoteles.setDataProvider(response.data) )
                }
                this.setState({ loader: false })
            }
            else {
                MComponentes.toast("ERROR property in grid");
                console.log(error)
                this.setState({ loader: false })
            };
        });
    }

    getDataSelects() {
        this.setState({ loader: true})

        //get policies
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/policies/single_get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var optionsCancelacion = []
                    var optionsBooking = []
                    var optionsTax = []
                    for (let index = 0; index < response.data.length; index++) {
                        if (response.data[index].policy_category == "CANCELLATION POLICIES") {
                            response.data[index].is_default == 1 ? this.setState({ defaultCancelacion: String(response.data[index].iddef_policy) }) : null
                            optionsCancelacion.push({ value: response.data[index].iddef_policy, option: response.data[index].policy_code })
                        } else if (response.data[index].policy_category == "BOOKING GUARANTEE") {
                            response.data[index].is_default == 1 ? this.setState({ defaultBooking: String(response.data[index].iddef_policy) }) : null
                            optionsBooking.push({ value: response.data[index].iddef_policy, option: response.data[index].policy_code })
                        }
                        else if (response.data[index].policy_category == "TAX RULE GROUP") {
                            response.data[index].is_default == 1 ? this.setState({ defaultTaxt: String(response.data[index].iddef_policy) }) : null
                            optionsTax.push({ value: response.data[index].iddef_policy, option: response.data[index].policy_code })
                        }

                    }
                    this.setState({
                        policyCancelacionSelect: optionsCancelacion,
                        policyBookingSelect: optionsBooking,
                        policyTaxSelect: optionsTax
                    })
                }
                this.setState({ loader: false })
            }
            else {
                MComponentes.toast("ERROR in polices");
                console.log(error)
                this.setState({ loader: false })
            };
        });


        //Obetnemos las crossout
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/crossout/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    options.push({ value: "0" , option: "Select Crossout" })
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: response.data[index].idop_cross_out_config, option: response.data[index].cross_out_name })
                    }
                    this.setState({ crossoutSelect: options, crossoutData: response.data })
                }
            }
            else {
                MComponentes.toast("ERROR in crossout");
                console.log(error)

            };
        });
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
                        options.push({ value: response.data[index].iddef_restriction, option: response.data[index].name })
                    }
                    this.setState({ restrictionSelect: options })
                }
            }
            else {
                MComponentes.toast("ERROR in restrictions");
                console.log(error)

            };
        });
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
                        options.push({ value: response.data[index].currency_code, option: `${response.data[index].description} (${response.data[index].currency_code})` })
                    }
                    this.setState({ currencySelect: options })
                }
            }
            else {
                MComponentes.toast("ERROR in currency type");
                console.log(error)

            };
        });
        //Obtenemos lenguajes disponibles
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/language/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: response.data[index].lang_code, option: response.data[index].description })
                    }
                    this.setState({
                        lenguajes: response.data , lenguajesSelect : options
                    })
                }
            }
            else {
                MComponentes.toast("ERROR in language");
                console.log(error)

            };
        });
    }

    openModal(e, option, dataDetail, isCopy) {
       this.arrayCuartos = [];
       this.arrayPropiedades = [];
        if (option == "EDIT") {
            this.setState({ loader: true, dataForm: null, option: null, estadoRatePlan: null, idRatePlan: null, dataHoteles: null })
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/rate-plan/search/" + dataDetail.idop_rateplan, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!error) {
                    if (response != null) {

                        let restrictionList = []
                        response.data.restrictions.map((restrictions) =>
                            restrictionList.push(String(restrictions.iddef_restriction))
                        )

                        let crossoutList = []
                        response.data.crossouts.map((crossouts) =>
                            crossoutList.push(String(crossouts.idop_cross_out_config) + " - " + crossouts.cross_out_name)
                        )

                        response.data["properties"] = this.castArrayStringToNumber(response.data["properties"], "USER")
                        response.data["policiesCancelacion"] = this.castArrayStringToNumber(response.data["policy_penalty"], "USER")
                        response.data["policiesBooking"] = this.castArrayStringToNumber(response.data["policy_guaranty"], "USER")
                        response.data["policiesTax"] = this.castArrayStringToNumber(response.data["policy_tax"], "USER")
                        response.data["rooms"] = this.castArrayStringToNumber(response.data["rooms"], "USER")

                        this.setState({
                            option: "EDIT",
                            estadoRatePlan: response.data.estado,
                            idRatePlan: response.data.idop_rateplan,
                            isCopy: isCopy,
                            text_modal: isCopy ? 'Copy from "'+ response.data.code+'"' : "",
                            dataForm: {
                                code: response.data.code,
                                currency_option: response.data.currency_code,
                                restrictions: restrictionList,
                                crossout_option: "",
                                rooms: response.data.rooms,
                                crossouts: crossoutList,
                                text_langs: response.data.text_langs,
                                properties: response.data.properties,
                                policiesCancelacion: response.data.policiesCancelacion,
                                policiesBooking: response.data.policiesBooking,
                                policiesTax: response.data.policiesTax,
                                rate_code_clever: response.data.rate_code_clever,
                                refundable: [String(response.data.refundable)],
                                lead_time: response.data.lead_time,
                            }
                        },() => { this.rowNameLang("EDIT");   this.getHotelGrid();} )
                    }

                }
                else {
                    MComponentes.toast("ERROR");
                    console.log(error)
                    this.setState({ loader: false })

                };
            });

        }
        else if (option == "ADD") {
           
            let newState = JSON.parse(JSON.stringify(this.state));
            const { defaultCancelacion, defaultBooking, defaultTaxt } = newState;
            this.setState({ dataForm: null, idRatePlan: null }, () =>
            this.setState({
                idRatePlan: 0,
                option: "ADD",
                estadoRatePlan: 1,
                isCopy: isCopy,
                text_modal: "",
                dataForm: {
                    code: "",
                    currency_option: "",
                    restrictions: [],
                    crossout_option: "",
                    rooms: [],
                    polices: [],
                    crossouts: [],
                    text_langs: [{lang_code: "EN", text: "", estado: 1}],
                    properties: this.state.hotelData ? this.state.hotelData.iddef_property : [],
                    policiesCancelacion: this.state.defaultCancelacion ? [defaultCancelacion] : [],
                    policiesBooking: this.state.defaultBooking ? [defaultBooking] : [],
                    policiesTax: this.state.defaultTaxt ? [defaultTaxt] : [],
                    rate_code_clever: "",
                    refundable: [],
                    lead_time: [],
                }
            }, () => { this.rowNameLang("ADD");   this.getHotelGrid();})
            
            )
        }
            
        this.refModalAdd.getInstance().open()

    }

    rowNameLang(option) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        let newRows = []
        let lenguaje = []

        this.state.dataForm.text_langs.map((lenguajes) =>
            newRows.push(
                { type: 'text', size: 'col s12 m4 l4', characters: true, required: true, alphanumeric: true, label: '*Tradename in ' + lenguajes.lang_code, name: 'text' + lenguajes.lang_code , id: 'text' + lenguajes }
            )
        )

        this.state.dataForm.text_langs.map((lenguajes) =>
            lenguaje.push(lenguajes.lang_code)
        )
        for (let index = 0; index < this.state.dataForm.text_langs.length; index++) {
            newForm["text" + this.state.dataForm.text_langs[index].lang_code] = this.state.dataForm.text_langs[index].text
        }



        newForm["lenguaje"] = lenguaje;

        this.setState({ newRowsLang: newRows, dataForm: newForm })

    }

    onChangeBandera(e) {
        let disableAdd = null;
        if (e.name == "crossout_option") {
            disableAdd = e.value == "0" ? true : false
            
            this.setState({ disableAddCross: disableAdd,  demoCross: { percent: "0" } }, () =>
                this.state.crossoutData.map((crossoutData) =>
                    crossoutData.idop_cross_out_config == e.value ?
                        this.setState({ demoCross: crossoutData })
                        :
                        null
                )
            )
        }
        if (e.name == "lenguaje") {
            let newRows = []
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            if (e.values.length > 0) {
                form[e.name] = e.values
            }
            else {
                form[e.name] = ["EN"]
            }

            form.lenguaje.map((lenguajes) =>
            newRows.push(
                { type: 'text', size: 'col s12 m4 l4', characters: true, required: true, alphanumeric: true, label: '*Tradename in ' + lenguajes, name: 'text' + lenguajes, id: 'text' + lenguajes }
            ))

            this.setState({ newRowsLang: newRows, dataForm: form })
        }
    }
    addCrossout(e) {
        if (this.state.demoCross.idop_cross_out_config !== undefined) {
            this.setChipCrossout(this.state.demoCross.idop_cross_out_config + " - " + this.state.demoCross.cross_out_name)
        } else {
            MComponentes.toast("Please selecte a crossout valid");
        }
    }

    getDataForm(e) {
        let refFormView = this.refFormView.getData().values;
        let validador = this.refFormView.getData();
        let chipCross = this.getChipCrossout();
        const cancelacion = refFormView.policiesCancelacion != "" && refFormView.policiesCancelacion.length > 0 ? refFormView.policiesCancelacion : (this.state.defaultCancelacion ? [this.state.defaultCancelacion] : []);
        const booking = refFormView.policiesBooking != "" && refFormView.policiesBooking.length > 0 ? refFormView.policiesBooking : (this.state.defaultBooking ? [this.state.defaultBooking] : []);
        const tax = refFormView.policiesTax != "" && refFormView.policiesTax.length > 0 ? refFormView.policiesTax : [];

        let arrayrooms = [];
        for (let index = 0; index < this.arrayCuartos.length; index++) {
            arrayrooms = arrayrooms.concat(this.arrayCuartos[index]);
        }

        try {

            if (validador.required.count == 0  && refFormView.code != "") {
               

                let url = "";
                let method = "";

                if (this.state.option == "ADD") {
                    url = "/api/rate-plan/create";
                    method = "POST";
                }
                else if (this.state.option == "EDIT" && this.state.isCopy) {
                    url = "/api/rate-plan/create";
                    method = "POST";
                }
                else if (this.state.option == "EDIT" && !this.state.isCopy) {
                    url = "/api/rate-plan/update/" + this.state.idRatePlan;
                    method = "PUT";
                }

                this.setState({ loader: true })
               

 
                fetch(CleverConfig.getApiUrl('bengine') + url, {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                        'Content-Type': 'application/json; charset=utf-8'
                    }),
                    method: method,
                    body: JSON.stringify({
                     code: refFormView.code,
                    crossouts: this.getIdCrossouts(chipCross),
                    rooms: this.castArrayStringToNumber(arrayrooms, "SYSTEM"),
                    properties: this.castArrayStringToNumber(this.arrayPropiedades, "SYSTEM"),
                    restrictions: refFormView.restrictions == "" ? [] : this.castArrayStringToNumber(refFormView.restrictions, "SYSTEM"),
                    policies: refFormView.policies == "" ? [] : this.castArrayStringToNumber([].concat(cancelacion, booking, tax), "SYSTEM"),
                    currency_code: refFormView.currency_option,
                    estado: this.state.estadoRatePlan,
                    rate_code_clever:refFormView.rate_code_clever ,
                    refundable: refFormView.refundable.length > 0 ? Number(refFormView.refundable[0]) : 0 ,
                    text_langs: this.getTextLangs(refFormView),
                    lead_time: refFormView.lead_time,
                    })
                })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ loader: false });
                            return
                        }
                        if (!json.Error) {
                            this.getDataRatePlan()
                            this.refModalAdd.getInstance().close()
                            this.setState({ loader: false })
                            MComponentes.toast("DONE");
                        }
                        else {
                            MComponentes.toast("Error in post");
                            this.setState({ loader: false })
                        }

                    })
                    .catch(error => {
                        this.setState({ loader: false })
                        MComponentes.toast("ERROR");
                    })


            } else {
                this.setState({ loader: false })
                MComponentes.toast("Error, empty fields ");
            }
        } catch(error){
            this.setState({ loader: false })
            console.log(error)
        }


    }

    getTextLangs(refFormView) {
        let text_langs = []
        this.state.dataForm.lenguaje.map(arrayLang =>
            text_langs.push({ lang_code: arrayLang, estado: 1, text: refFormView["text" + arrayLang] })
        )
        return text_langs
    }

    getIdCrossouts(crossout) {
        let ids = []
        if(crossout.length == 0 ){
            return ids
        }
        for (let index = 0; index < crossout.length; index++) {
            let arraySplit = crossout[index].split(" - ")
            ids.push(Number(arraySplit[0]))
        }
        return ids
    }

    castArrayStringToNumber(arraytocast, type) {
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

    onChangeRooms(e, index , idHotel){
        if(e.value.length != 0){
            if( this.arrayPropiedades.indexOf(idHotel) == -1 ) {
                this.arrayPropiedades.push(idHotel)
            }

        }else{
            if( this.arrayPropiedades.indexOf(idHotel) != -1 ) {
                this.arrayPropiedades.splice(this.arrayPropiedades.indexOf(idHotel) , 1) 
            }
        }
        this.arrayCuartos[index] = e.value
    }
    deleteRatePlan(e, data) {
        this.refConfirm.getInstance().open()
        this.setState({ deleteRatePlan: data })
    }
    copyRatePlan(e, data) {
        this.refConfirmCopy.getInstance().open()
        this.setState({ copyRatePlan: data })
    }
    deleteRatePlanConfirm() {
        this.setState({ loader: true })
        let data = { estado: Number(!Boolean(this.state.deleteRatePlan.estado)) }

        axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/rate-plan/update-estado/${this.state.deleteRatePlan.idop_rateplan}`, data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                this.refConfirm.getInstance().close()
                this.getDataRatePlan();
            } else {
                console.log(error)
                MComponentes.toast("ERROR, try again");
            }
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
    render() {
        return (
            <React.Fragment>
                
                <CleverForm
                    data={{}}
                    id={"FormSearchRatePlan"}
                    ref={ref => this.refFormSearch = ref}

                    forms={[
                        {
                            inputs: [

                                {
                                    row: [
                                        { type: 'text', size: 'col s12 m4 l4 selectHotelFilter', id: 'inputSearchFilter', placeholder: "Name filter",characters: true, alphanumeric: true , required: false, name: 'nameFilter' },
                                        { type: 'select', size: 'col s12 m4 l4 selectHotelFilter', autocomplete:true, multiple: true, id: 'abc', name: 'roomFilterOption', placeholder: "Room filter", options: this.state.roomFilter },
                                        { type: 'button', size: 'col s12 m2 l2', label: 'search', onClick: (e) => this.searchInGrid(e) },
                                        { type: 'button', size: 'col s12 m2 l2', label: 'add', onClick: (e) => this.openModal(e, "ADD", null, false)  },
                                    ],
                                },
                            ]
                        },
                    ]}
                />
                <GridView
                    idTable='table-contracts-manuales'
                    serializeRows={false}
                    filter={true}
                    columns={[

                        { attribute: 'code', alias: 'Name',  filter: false},
                        { attribute: "textESTADO", alias: "Status" },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>
                                        <a onClick={(e) => this.openModal(e, "EDIT", data, false)} title='Edit Rate Plan' ><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a onClick={(e) => this.deleteRatePlan(e, data)} title='Disable Rate Plan'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a onClick={(e) => this.deleteRatePlan(e, data)} title='Enable Rate Plan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }
                                        <a onClick={(e) => this.copyRatePlan(e, data)} title='New record from this Rate Plan' ><i className='material-icons left'>content_copy</i></a>

                                    </div>)
                            }
                        }
                    ]}
                    onRef={grid => this.instanceGrid = grid}

                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirmCopy = confirm}
                    yesButton={{ click: (e) => this.openModal(e, "EDIT", this.state.copyRatePlan, true ) }}>
                    <h5 className="text-center">Do you want to create a new record from this Rate Plan "{this.state.copyRatePlan.code}" </h5>
                </ConfirmDialog>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteRatePlanConfirm()}}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addRestriction"
                    isFull={true}
                    title = {{text: this.state.text_modal}}
                    onRef={modal => this.refModalAdd = modal} >


                    {
                        this.state.currencySelect &&
                            this.state.restrictionSelect &&
                            this.state.dataForm &&
                            this.state.newRowsLang &&
                            this.state.lenguajes &&
                            this.state.policyBookingSelect &&
                            this.state.policyCancelacionSelect &&
                            this.state.policyTaxSelect &&
                            this.state.crossoutSelect ?
                            <CleverForm
                                data={this.state.dataForm}
                                id={this.props.id}
                                ref={ref => this.refFormView = ref}
                                forms={[
                                    {
                                        inputs: [
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">{'RATE & RESTRICTIONS'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m4 l4', label: 'Name', name: 'code', characters: true, alphanumeric: true },
                                                    { type: 'select', autocomplete:true, onChange: (e) => this.onChangeBandera(e) , multiple: true, required: true, size: 'col s12 m4 l4', name: 'lenguaje', label: 'Lenguajes', options: this.state.lenguajesSelect },
                                                ],
                                            },
                                            {
                                                row: this.state.newRowsLang,
                                            },
                                            {
                                                row: [
                                                    { type: 'select', autocomplete:true, size: 'col s12 m4 l4', required: true, name: 'currency_option', label: '*Currency', options: this.state.currencySelect },
                                                    { type: 'select', autocomplete:true, multiple: true, required: true, size: 'col s12 m4 l4', name: 'restrictions', label: '*Restrictions', options: this.state.restrictionSelect },
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'select', autocomplete:true, multiple: true, required: true, size: 'col s12 m4 l4', name: 'policiesCancelacion', label: '*Policies Cancellation', options: this.state.policyCancelacionSelect },
                                                    { type: 'select', autocomplete:true, multiple: true, required: true, size: 'col s12 m4 l4', name: 'policiesBooking', label: '*Policies Booking', options: this.state.policyBookingSelect },
                                                    { type: 'select', autocomplete:true, multiple: true, required: false, size: 'col s12 m4 l4', name: 'policiesTax', label: 'Policies Tax', options: this.state.policyTaxSelect },
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m4 l4', label: '*Rate Code Clever', name: 'rate_code_clever',required:true, characters: true, alphanumeric: true },
                                                    { type: 'number', size: 'col s12 m4 l4', label: "Lead time", name: 'lead_time' },
                                                    { type: 'checkbox', size: 'col s12 m4 l4', label: 'Refundable', name: 'refundable', checkboxs: [{ value: "1", label: "No Refundable" }] }
                                                ],
                                            },
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <hr style={{ backgroundColor: "#018bb6", height: "1px" }}></hr>
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
                                                                <h5 className="col s12 m5 l5">{'CROSSOUTS'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'select', autocomplete:true, onChange: (e) => this.onChangeBandera(e), size: 'col s12 m4 l4', name: 'crossout_option', label: 'Crossouts', options: this.state.crossoutSelect },
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <div className={"col s12 m4 l4"}>

                                                                    <h6 className="input-field" style={{ textAlign: "center" }} >{"Inflated price: % "} {this.state.demoCross.percent ? this.state.demoCross.percent : 0}</h6>
                                                                </div>

                                                            )
                                                        }
                                                    },
                                                    {
                                                        type: 'component', component: () => {
                                                            return (

                                                                     <CleverButton size={'col s12 m3 l3'} disabled={this.state.disableAddCross} label={'ADD CROSSOUT'} fullSize={true} onClick={e => this.addCrossout(e)}/>
                                                            )
                                                        }
                                                    },
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <div className={"col s12 m12 l12 "}>
                                                                    <Chip
                                                                        readOnly={true}
                                                                        setValue={set => { this.setChipCrossout = set; this.setChipCrossout(this.state.dataForm.crossouts); }}
                                                                        getValue={get => { this.getChipCrossout = get }}
                                                                        cleanValue={ clean => {this.cleanChipCrossout = clean;} }
                                                                        options={{
                                                                            placeholder: "Crossout",
                                                                            secondaryPlaceholder: "Crossout",
                                                                        }}
                                                                        label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                    }

                                                ],
                                            },
                                            ,
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12">&nbsp;</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            }

                                        ]
                                    },
                                ]}

                            /> 
  

                            : null}
                            {
                                this.state.dataHoteles
                                
                                ? 
                                <React.Fragment>
                                    <h5>ASSIGN TO </h5>
                    <GridViewAux
                        idTable='table-hotels-select'
                        filter={false}
                        serializeRows={false}
                        columns={[
                            { attribute: 'short_name', alias: 'Name' },
                            { attribute: 'property_code', alias: 'Property code' },
                            {
                                alias: 'Rooms',
                                expandCall: (data, index) => {
                                    return (
                                     
                                       <Rooms data={data} idRatePlan={this.state.idRatePlan} onChangeRooms={this.onChangeRooms} index={index} ></Rooms> 
                                       
                                    );
                                }
                            }
                        ]}
                        onRef={grid => this.instanceGridHoteles = grid}

                    /> 
                    </React.Fragment>
                    : null
                    }
                </Modal>
                <CleverLoading show={this.state.loader} />
            </React.Fragment>
        );
    }
}

export default RatePlan;