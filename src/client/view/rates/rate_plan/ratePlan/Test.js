import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from './../../../../axiosRequest';

class RatePlan extends Component {
    constructor(props) {
        super(props)
        this.getDataForm = this.getDataForm.bind(this),
            this.state = {
                demoCross: { percent: "0" },
                hotelData: JSON.parse(localStorage.getItem('hotel')),
                dataFormCopy: {

                }
            }
    }

    componentDidMount() {
        /*    //se relaciona el boton del colapse con el evento
           this.props.refButton.current.id ?
               document.getElementById(this.props.refButton.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
               : null;
   
              this.props.refButtonSearch.current.id ?
               document.getElementById(this.props.refButtonSearch.current.id).addEventListener("click", e => this.searchInGrid(e,this.props.refEventSearch) )
               : null; 
    */
        this.getDataRatePlan();

    }
    componentDidUpdate() {
        this.props.refFormSearch ?
            document.getElementById("FormSearchRatePlan-ADD").addEventListener("click", e => this.openModal(e, "ADD", null))
            : null;

        this.props.refFormSearch ?
            document.getElementById('FormSearchRatePlan-Search').addEventListener("click", e => this.searchInGrid(e, this.props.refEventSearch))
            : null;

    }


    searchInGrid(e, data) {
        let searchInGrid = data();
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
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/rate-plan/get?all=1", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response != null) {
                    this.instanceGrid.setDataProvider(response.data);
                }
                this.getDataSelects();
                this.setState({ loader: false, dataGrid: response.data })
            }
            else {
                MComponentes.toast("ERROR in rate plan");
                console.log(error)
                this.setState({ loader: false })
            };
        });
    }

    getRoomsByHotels(option) {
        this.setState({ loader: true })
        let paramsHotel = ""
        if (option == "EDIT") {
            let stringUrl = ""
            this.state.dataForm["properties"].map((idHotels) =>
                stringUrl = stringUrl + idHotels + ","
            )
            paramsHotel = "?properties=" + stringUrl

            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/room-type-category/get/single" + paramsHotel, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (response != null) {
                        var options = []
                        for (let index = 0; index < response.data.length; index++) {
                            if (response.data[index].room_name.length > 0) {
                                options.push({ value: response.data[index].iddef_room_type_category, option: response.data[index].room_name[0].lang_code == "en" ? `${response.data[index].room_name[0].text}(${response.data[index].property_code})` : `${response.data[index].room_name[1].text}(${response.data[index].property_code})` })
                            }

                        }
                        this.setState({ roomsByHotelSelect: options })
                    }
                    this.setState({ loader: false })
                }
                else {
                    MComponentes.toast("ERROR room type");
                    console.log(error)
                    this.setState({ loader: false })
                };
            });

        }
        else if ("ADD") {
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/room-type-category/get/single?properties=" + this.state.hotelData.iddef_property, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (response != null) {
                        var options = []
                        for (let index = 0; index < response.data.length; index++) {
                            if (response.data[index].room_name.length > 0) {
                                options.push({ value: response.data[index].iddef_room_type_category, option: response.data[index].room_name[0].lang_code == "en" ? `${response.data[index].room_name[0].text}(${response.data[index].property_code})` : `${response.data[index].room_name[1].text}(${response.data[index].property_code})` })
                            }
                        }
                        this.setState({ roomsByHotelSelect: options })
                    }
                    this.setState({ loader: false })
                }
                else {
                    MComponentes.toast("ERROR room type");
                    console.log(error)
                    this.setState({ loader: false })
                };
            });
        }
    }

    getDataSelects() {
        this.setState({ loader: true })

        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        options.push({ value: response.data[index].iddef_property, option: response.data[index].short_name })
                    }
                    this.setState({ allHotels: options })
                }
                this.setState({ loader: false })
            }
            else {
                MComponentes.toast("ERROR property");
                console.log(error)
                this.setState({ loader: false })
            };
        });

        //get policies
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/policies/single_get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
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
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
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
                this.setState({ load: false });
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
                this.setState({ load: false });
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
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property-lang/get?property=" + this.state.hotelData.iddef_property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response != null) {
                    this.setState({
                        lenguajes: response.data
                    })
                }
            }
            else {
                MComponentes.toast("ERROR in language");
                console.log(error)

            };
        });
    }

    openModal(e, option, dataDetail) {
        this.setState({ dataForm: null, option: null, estadoRatePlan: null, idRatePlan: null })
        if (option == "EDIT") {
            this.setState({ loader: true })
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/rate-plan/search/" + dataDetail.idop_rateplan, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
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

                            }
                        }, () => { this.rowNameLang("EDIT"); this.getRoomsByHotels("EDIT") })
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
            const { defaultCancelacion, defaultBooking, defaultTaxt } = newState
            this.setState({
                option: "ADD",
                estadoRatePlan: 1,
                dataForm: {
                    code: "",
                    currency_option: "",
                    restrictions: [],
                    crossout_option: "",
                    rooms: [],
                    polices: [],
                    crossouts: [],
                    properties: [String(this.state.hotelData.iddef_property)],
                    policiesCancelacion: this.state.defaultCancelacion ? [defaultCancelacion] : [],
                    policiesBooking: this.state.defaultBooking ? [defaultBooking] : [],
                    policiesTax: this.state.defaultTaxt ? [defaultTaxt] : [],

                }
            }, () => { this.rowNameLang("ADD"); this.getRoomsByHotels("ADD"); })

        }

        this.refModalAdd.getInstance().open()

    }

    rowNameLang(option) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        let newRows = []
        let arrayLang = []
        this.state.lenguajes.map((lenguajes) =>
            newRows.push(
                { type: 'text', size: 'col s12 m4 l4', required: true, label: 'Tradename in ' + lenguajes.language, name: 'text' + lenguajes.language_code }
            )
        )

        this.state.lenguajes.map((lenguajes) =>
            arrayLang.push(lenguajes.language_code)
        )

        if (option == "EDIT") {
            for (let index = 0; index < this.state.dataForm.text_langs.length; index++) {
                newForm["text" + this.state.dataForm.text_langs[index].lang_code] = this.state.dataForm.text_langs[index].text
            }
        }

        this.setState({ newRowsLang: newRows, dataForm: newForm, arrayLang })

    }

    onChangeBandera(e) {
        if (e.name == "crossout_option") {
            this.state.crossoutData.map((crossoutData) =>
                crossoutData.idop_cross_out_config == e.value ?
                    this.setState({ demoCross: crossoutData })
                    :
                    null
            )
        }
        else if (e.name == "properties") {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.values
            this.setState({ dataForm: form }, () => this.getRoomsByHotels("EDIT"))

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
        let refFormView = this.refFormView.getData().values
        let validador = this.refFormView.getData()
        let chipCross = this.getChipCrossout()

        const cancelacion = refFormView.policiesCancelacion != "" && refFormView.policiesCancelacion.length > 0 ? refFormView.policiesCancelacion : (this.state.defaultCancelacion ? [this.state.defaultCancelacion] : [])
        const booking = refFormView.policiesBooking != "" && refFormView.policiesBooking.length > 0 ? refFormView.policiesBooking : (this.state.defaultBooking ? [this.state.defaultBooking] : [])
        const tax = refFormView.policiesTax != "" && refFormView.policiesTax.length > 0 ? refFormView.policiesTax : (this.state.defaultTaxt ? [this.state.defaultTaxt] : [])
        try {

            if (validador.required.count == 0 && chipCross.length > 0 && refFormView.code != "") {


                let url = "";
                let method = "";

                if (this.state.option == "ADD") {
                    url = "/api/rate-plan/create";
                    method = "POST";
                }
                else if (this.state.option == "EDIT") {
                    url = "/api/rate-plan/update/" + this.state.idRatePlan;
                    method = "PUT";
                };
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
                        rooms: refFormView.rooms == "" ? [] : this.castArrayStringToNumber(refFormView.rooms, "SYSTEM"),
                        properties: refFormView.properties == "" ? [] : this.castArrayStringToNumber(refFormView.properties, "SYSTEM"),
                        restrictions: refFormView.restrictions == "" ? [] : this.castArrayStringToNumber(refFormView.restrictions, "SYSTEM"),
                        policies: refFormView.policies == "" ? [] : this.castArrayStringToNumber([].concat(cancelacion, booking, tax), "SYSTEM"),
                        currency_code: refFormView.currency_option,
                        estado: this.state.estadoRatePlan,
                        text_langs: this.getTextLangs(refFormView),
                    })
                })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
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
        } catch{
            this.setState({ loader: false })
        }


    }

    getTextLangs(refFormView) {
        let text_langs = []
        this.state.arrayLang.map(arrayLang =>
            text_langs.push({ lang_code: arrayLang, estado: 1, text: refFormView["text" + arrayLang] })
        )
        return text_langs
    }

    getIdCrossouts(crossout) {
        let ids = []
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

    deleteRatePlan(e, data) {
        this.refConfirm.getInstance().open()
        this.setState({ deleteRatePlan: data })
    }
    deleteRatePlanConfirm() {
        this.setState({ loader: true })
        let data = { estado: Number(!Boolean(this.state.deleteRatePlan.estado)) }

        axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/rate-plan/update-estado/${this.state.deleteRatePlan.idop_rateplan}`, data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
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
        console.log(this.state)
        return (
            <React.Fragment>

                <GridView
                    idTable='table-contracts-manuales'
                    filter={false}
                    serializeRows={false}
                    columns={[

                        { attribute: 'code', alias: 'Name' },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>

                                        <a onClick={(e) => this.openModal(e, "EDIT", data)} title='Edit RatePlan' ><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a onClick={(e) => this.deleteRatePlan(e, data)} title='Disable RatePlan'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a onClick={(e) => this.deleteRatePlan(e, data)} title='Enable RatePlan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }

                                    </div>)
                            }
                        }
                    ]}
                    onRef={grid => this.instanceGrid = grid}

                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteRatePlanConfirm() }}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addRestriction"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} >


                    {
                       
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
                                                                <h5 className="col s12 m5 l5">{'testS'}</h5>
                                                            )
                                                        }
                                                    }
                                                ],
                                            },
                                            {
                                                row: [
                                                    { type: 'text', onChange:e => console.log("tugfa"), size: 'col s12 m4 l4', label: 'Name', name: 'code', characters: true, alphanumeric: true },
                                              ],
                                            },
                                       
                                       
                                         
                                        ]
                                    },
                                ]}

                            /> }

                </Modal>
                <CleverLoading show={this.state.loader} />
            </React.Fragment>
        );
    }
}

export default RatePlan;