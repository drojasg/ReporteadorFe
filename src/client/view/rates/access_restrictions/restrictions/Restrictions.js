import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading,MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from '../../../../axiosRequest';
import './css.css'
var Helper = require('./Countries');

class Restrictions extends Component {
    constructor(props) {
        super(props)
        this.getDataForm = this.getDataForm.bind(this)
        this.instanceGrid = React.createRef();
        this.refModalAdd = React.createRef();
        this.state = {
            loader: false,
            mapeoTimes: this.mapeoTimes.bind(this),
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            dataHeader: {
                restriction_default: [],
                name: "",
                iddef_restriction_type:"4",
                iddef_restriction_by:"6"
            },
            dataForm: [],
            dataFormCopy: [{
                iddef_restriction_detail: 0,
                iddef_restriction: 0,
                bookable_weekdays: [],
                bookable_weekdays_option: "0",
                booking_window_option: "0",
                specific_channels: [],
                channel_option: "0",
                device_type_option: "0",
                geo_targeting_countries: [],
                geo_targeting_option: "0",
                market_option: "0",
                market_targeting: [],
                travel_window_option: "0",
                booking_window_times: [],
                travel_window: [],
                booking_window_dates: [],
                estado: 1
            }]
            /*   dataForm: [{
                  iddef_restriction_detail: 4,
                  iddef_restriction: 1,
                  bookable_weekdays: ["Sunday", "Monday"],
                  bookable_weekdays_option: "1",
                  booking_window_option: "1",
                  specific_channels: ["ibe"],
                  channel_option: "1",
                  device_type_option: "1",
                  geo_targeting_countries: ["AF", "AL", "DZ"],
                  geo_targeting_option: "1",
                  travel_window_option: "1",
                  booking_window_times: [{ "end_time": "13:00", "star_time": "12:00" }, { "end_time": "14:00", "star_time": "11:00" }],
                  travel_window: ["01/01/2020 - 02/01/2020", "01/01/2020 - 03/01/2020"],
                  booking_window_dates: ["09/01/2020 - 10/01/2020", "09/01/2020 - 11/01/2020"]
              },
          ] */

        }

    }

    async getCoutry(action) {
       
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        if (action == "EDIT") {
            
            for (let indexForm = 0; indexForm < this.state.dataForm.length; indexForm++) {
                this.setState({loader:true})
                let paramsCountry = ""
                if (Number(this.state.dataForm[indexForm]["market_option"]) != 0) {
                    let stringUrl = ""
                    this.state.dataForm[indexForm]["market_targeting"].map((idMarket) =>
                        stringUrl = stringUrl + idMarket + ","
                    )
                    paramsCountry = stringUrl != "" ?  "?market=" + stringUrl : ""
                }

                await CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/country/get" + paramsCountry, (response, error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ loader: false });
                        return
                    }
                    if (!response.Error) {
                        if (response != null) {
                            var jotason = []
                            for (let index = 0; index < response.data.length; index++) {
                                jotason.push({ value: response.data[index].country_code, option: response.data[index].name })
                            }
                            newForm[indexForm]["paisesXmercado"] = jotason
                            this.setState({ dataForm: newForm })
                        }
                        this.setState({loader:false})
                    }
                    else {
                        this.setState({loader:false})
                        MComponentes.toast("ERROR in country");
                        console.log(error)
                    };
                });
            }
          
        }
        else if (action == "ADD") {
            this.setState({loader:true})
            let paramsCountry = ""
            await CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/country/get" + paramsCountry, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!error) {
                    if (response != null) {
                        var jotason = []
                        for (let index = 0; index < response.data.length; index++) {
                            jotason.push({ value: response.data[index].country_code, option: response.data[index].name })
                        }
                        newForm[0]["paisesXmercado"] = jotason

                    }
                    this.setState({ dataForm: newForm,loader:false })
                }
                else {
                    this.setState({loader:false})
                    MComponentes.toast("ERROR country");
                    console.log(error)
                };
            });
        }
    }


    componentDidMount() {
        //se relaciona el boton del colapse con el evento
        this.props.refButton.current.id ?
            document.getElementById(this.props.refButton.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
            : null;
        this.getDataRestriction();
        this.getDataChannels();
       


    }

    openModal(e, option, dataDetail) {
        this.setState({ dataForm: null, loader: true })
        switch (option) {
            case "EDIT":
                CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/restriction-detail/get/" + dataDetail.iddef_restriction, (response, error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ loader: false });
                        return
                    }
                    if (!error) {
                        if (response.data.length > 0) {
                            for (let index = 0; index < response.data.length; index++) {
                                // para chip de fechas
                                let booking_window_times = []
                                for (let i = 0; i < response.data[index].booking_window_times.length; i++) {

                                    response.data[index]["bookingTimeEnd" + i] = response.data[index].booking_window_times[i].end_time
                                    response.data[index]["bookingTimeStart" + i] = response.data[index].booking_window_times[i].start_time
                                    booking_window_times.push( response.data[index].booking_window_times[i].start_time +" - "+ response.data[index].booking_window_times[i].end_time )
                                }
                                response.data[index]["booking_window_times"] = booking_window_times
                                // para chip de Booking window
                                let arrayDatesBooking = []
                                for (let i = 0; i < response.data[index].booking_window_dates.length; i++) {
                                    let dateTemp = this.castDate(response.data[index].booking_window_dates[i].start_date, "USER")+" - "+ this.castDate(response.data[index].booking_window_dates[i].end_date, "USER")
                                    arrayDatesBooking.push(dateTemp)
                                }
                                response.data[index]["booking_window_dates"] = arrayDatesBooking
                                // para chip de Travel window
                                let arrayDatesTravel = []
                                for (let i = 0; i < response.data[index].travel_window.length; i++) {
                                    let dateTemp = this.castDate(response.data[index].travel_window[i].start_date, "USER")+" - "+ this.castDate(response.data[index].travel_window[i].end_date, "USER")
                                    arrayDatesTravel.push(dateTemp)
                                }
                                response.data[index]["travel_window"] = arrayDatesTravel

                                response.data[index]["specific_channels"] = this.castArrayStringToNumber(response.data[index]["specific_channels"],"USER")
                                response.data[index]["market_targeting"] = this.castArrayStringToNumber(response.data[index]["market_targeting"],"USER")

                            }
                            this.setState({
                                option:option,
                                formLength: response.data.length,
                                dataDetail: dataDetail,
                                dataForm: response.data,
                                dataHeader: { name: response.data[0].name, restriction_default: [String(response.data[0].restriction_default)], iddef_restriction_by: dataDetail.iddef_restriction_by, iddef_restriction_type : dataDetail.iddef_restriction_type  },
                                loader: false
                            }, ()=>  this.getCoutry("EDIT") )
                            this.refModalAdd.getInstance().open()
                        }else{
                            this.setState({ loader: false })
                            MComponentes.toast("ERROR no related data");
                        }

                    }
                    else {
                        this.setState({ loader: false })
                        console.log(error)
                        MComponentes.toast("ERROR");
                    };
                });
                break;
            case "ADD":
                this.setState({
                    option:option,
                    loader: false,
                    formLength: 1,
                    dataHeader: {
                        restriction_default: [],
                        name: "",
                        iddef_restriction_type: "4",
                        iddef_restriction_by: "6"
                    },
                    dataForm: [{
                        iddef_restriction_detail: 0,
                        iddef_restriction: 0,
                        bookable_weekdays: [],
                        bookable_weekdays_option: "0",
                        booking_window_option:"0",
                        specific_channels: [],
                        channel_option: "0",
                        device_type_option: "0",
                        market_option: "0",
                        market_targeting: [],
                        geo_targeting_countries: [],
                        geo_targeting_option: "0",
                        travel_window_option: "0",
                        booking_window_times:[],
                        travel_window: [],
                        booking_window_dates: [],
                        estado: 1
                    }]
                },()=>  this.getCoutry("ADD"))
                this.refModalAdd.getInstance().open()
                break;

            default:
                break;
        }



    }

    compareGeo(countries,indexForm){
        let pisesSelected = countries
        let paisesXmercado = this.state.dataForm[indexForm].paisesXmercado
        let arrayChidori = []
        for (let index = 0; index < paisesXmercado.length; index++) {
            if( pisesSelected.indexOf(paisesXmercado[index].value) != -1 ){
                arrayChidori.push(paisesXmercado[index].value)
            }
            
        }
        return arrayChidori;
    }

    getDataForm(e) {
        let arrayData = []
        let arrayPost = {}
        let refFormHeader = this.refFormHeader.getData()
        try{
        if( refFormHeader.required.count == 0 ){

        this.setState({ loader: true })


        for (let index = 0; index < this.state.dataForm.length; index++) {
            let form = this[`refForm${index}`].getData()
            let ChipStayDate = this[`getValueChipStayDate${index}`]();
            let ChipBookigWindow = this[`getValueChipBookigWindow${index}`]();
            let ChipBookingtime = this[`getValueChipBookingTime${index}`]();
           
            let arrayTimes = []

            for (let i = 0; i < ChipBookingtime.length; i++) {
                let str = ChipBookingtime[i]
                let res = str.split(" - ")
                arrayTimes.push({ "start_time": res[0], "end_time": res[1] })
            }
            let jsonPost = {
                "restriction_default": refFormHeader.values.restriction_default[0] ? refFormHeader.values.restriction_default[0] : 0,
                "iddef_restriction_detail": this.state.option == "ADD"? 0 : this.state.dataForm[index].iddef_restriction_detail,
                "iddef_restriction": this.state.option == "ADD"? 0 : this.state.dataForm[index].iddef_restriction,
                "estado": this.state.option == "ADD"? 1 :form.values.estado,
                "channel_option": form.values.channel_option,
                "specific_channels": Number(form.values.channel_option) == 0 ? [] :this.castArrayStringToNumber(form.values.specific_channels,"SYSTEM"),
                "travel_window_option": form.values.travel_window_option,
                "travel_window": Number(form.values.travel_window_option) == 0 ? [] : this.castBookingTravelDate(ChipStayDate),
                "booking_window_option": form.values.booking_window_option,
                "booking_window_dates": Number(form.values.booking_window_option) == 0 ? [] : this.castBookingTravelDate(ChipBookigWindow),
                "bookable_weekdays": Number(form.values.bookable_weekdays_option) == 0 ? [] : form.values.bookable_weekdays,
                "bookable_weekdays_option": form.values.bookable_weekdays_option,
                "geo_targeting_option": form.values.geo_targeting_option,
                "geo_targeting_countries": Number(form.values.geo_targeting_option) == 0 ? [] : this.compareGeo(form.values.geo_targeting_countries,index ),
                "market_option": form.values.market_option,
                "market_targeting": Number(form.values.market_option) == 0 ? [] : this.castArrayStringToNumber(form.values.market_targeting,"SYSTEM"),
                "device_type_option": form.values.device_type_option,
                "booking_window_times": arrayTimes,
                "min_los": 0,
                "max_los": 0,
                "value": {},
            }

            arrayData.push(jsonPost)
           
        }

           
        fetch(CleverConfig.getApiUrl('bengine')+`/api/restriction/create`, {
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                'Content-Type': 'application/json; charset=utf-8'
            }),
            method: 'POST',
            body: JSON.stringify({
                name: refFormHeader.values.name,
                iddef_restriction: this.state.option == "ADD"? 0 :this.state.dataDetail.iddef_restriction,
                iddef_restriction_by:  6,
                iddef_restriction_type: 4,
                estado: 1,
                data: arrayData
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
                    this.getDataRestriction()
                    this.refModalAdd.getInstance().close()
                    this.setState({ loader: false })
                    MComponentes.toast("DONE");
                }
                else{
                    MComponentes.toast("Error in post");
                    this.setState({ loader: false })
                }
                
            })
            .catch(error => {
                this.setState({ loader: false })
                MComponentes.toast("ERROR");
            })

        }else{
            MComponentes.toast("REQUIRE A NAME");
        }
        }
        catch(Exception){
            console.log(Exception)
            this.setState({ loader: false })
            MComponentes.toast("ERROR");
        }
    }

    castArrayStringToNumber(arraytocast, type){
        let newFormat = []
        //[1,2] -> ["1","2"]
        if(type == "USER"){
            arraytocast.map((arraytocast) =>
            newFormat.push(String(arraytocast))
            )
        }
        //["1","2"] -> [1,2]
        else if(type == "SYSTEM"){
            arraytocast.map((arraytocast) =>
            newFormat.push(Number(arraytocast))
            )
        }
        

        return newFormat
    }

    castBookingTravelDate(StringDate){
        let arrayReturn = []
        for (let index = 0; index < StringDate.length; index++) {
            let arraySplit = StringDate[index].split(" - ")
            arrayReturn.push({start_date: this.castDate(arraySplit[0], "SYSTEM"), end_date: this.castDate(arraySplit[1], "SYSTEM") })
        }
        return arrayReturn
    }

    castDate(datecast, type){
        let newFormat = ""
        //2020-02-10 -> 10/02/2020
        if(type == "USER"){
            let arraySplit = datecast.split("-")
            newFormat = arraySplit[2]+"/"+arraySplit[1]+"/"+arraySplit[0]
        }
        //10/02/2020 -> 2020-02-10
        else if(type == "SYSTEM"){
            let arraySplit = datecast.split("/")
            newFormat = arraySplit[2]+"-"+arraySplit[1]+"-"+arraySplit[0]
        }
        

        return newFormat
    }

    getDataRestriction() {
        let restrictionOnlyGeneral=6;
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/restriction/get?restricionby=${restrictionOnlyGeneral}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    this.instanceGrid.setDataProvider(response.data);
                }
                this.setState({ loader: false })
            }
            else {
                 MComponentes.toast("ERROR restrictions");
                console.log(error)
                this.setState({ loader: false })
            };
        });
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/market/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var jotason = []
                    for (let index = 0; index < response.data.length; index++) {
                        jotason.push({ value: response.data[index].iddef_market_segment, option: response.data[index].code+" - "+response.data[index].description })
                    }
                    this.setState({dataMarket : jotason})
                }

            }
            else {
                 MComponentes.toast("ERROR");
                console.log(error)
            };
        });
    }

    getDataChannels() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/channels/get-all", (response, error) => {
            if (!error) {
                if (response != null) {
                    var jotason = []
                    for (let index = 0; index < response.data.length; index++) {
                        jotason.push({ value: response.data[index].iddef_channel, option: response.data[index].description })
                    }
                    this.setState({dataChannels : jotason})
                }

            }
            else {
                 MComponentes.toast("ERROR");
                console.log(error)
            };
        });
    }

    addToChip(e, toChip, index) {
        switch (toChip) {
            case "onChangeDateBookingWindow":
                if(this.state.dataForm[index].DateBookingWindow1 || this.state.dataForm[index].DateBookingWindow2 ){
                    if(Date.parse(this.state.dataForm[index].DateBookingWindow1 + " 12:00") < Date.parse(this.state.dataForm[index].DateBookingWindow2 + " 12:00")){
                        this[`setValueChipBookigWindow${index}`]( this.castDate(this.state.dataForm[index].DateBookingWindow1, "USER")+ " - " + this.castDate(this.state.dataForm[index].DateBookingWindow2,"USER"));
                    }else{
                        MComponentes.toast("Select a valid range");
                        return;
                    }
                
                }else{
                    MComponentes.toast("Select a date range");
                    return;
                }
                break;
            case "onChangeDateStayDates":
                    if(this.state.dataForm[index].DateStayDates1 || this.state.dataForm[index].DateStayDates2 ){
                        if(Date.parse(this.state.dataForm[index].DateStayDates1 + " 12:00") < Date.parse(this.state.dataForm[index].DateStayDates2 + " 12:00")){
                            this[`setValueChipStayDate${index}`]( this.castDate(this.state.dataForm[index].DateStayDates1, "USER")+ " - " + this.castDate(this.state.dataForm[index].DateStayDates2,"USER"));
                        }else{
                            MComponentes.toast("Select a valid range");
                            return;
                        }
                    
                    }else{
                        MComponentes.toast("Select a date range");
                        return;
                    }
                break;
            case "onChangeTimeBooking":

                let form = this[`refForm${index}`].getData().values
                let bookingTimeStart = form.bookingTimeStart
                let bookingTimeEnd = form.bookingTimeEnd

                if (bookingTimeStart != "" && bookingTimeEnd != "") {

                    // if (Date.parse('01/01/2011 ' + bookingTimeStart) < Date.parse('01/01/2011 ' + bookingTimeEnd)) {
                        this[`setValueChipBookingTime${index}`](bookingTimeStart + " - " + bookingTimeEnd );
                    // } else {
                    //     MComponentes.toast("Error the End Time must be greater than the Start Time");
                    // }
                }
                else {
                    MComponentes.toast("Error you must select Star Time and End Time");
                }


                break;

            default:
                break;
        }

    }

    addRule(action, indexForm) {
        if (action == "ADD") {
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            let gg = newForm.concat(this.state.dataFormCopy[0])
            this.setState({ dataForm: gg })
        } else if(action == "DELETE") {
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            newForm.splice(indexForm, 1)
            this.setState({ dataForm: newForm })
        }
    }

    addBookingWindowTimes(action, indexForm, indexTime) {
        if (action == "ADD") {
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            let newDate = newForm[indexForm].booking_window_times.concat({ "end_time": "12:00", "start_time": "12:00" })
            newForm[indexForm].booking_window_times = newDate

            for (let index = 0; index < newForm.length; index++) {
                for (let i = 0; i < newForm[index].booking_window_times.length; i++) {
                    newForm[index]["bookingTimeEnd" + i] = newForm[index].booking_window_times[i].end_time
                    newForm[index]["bookingTimeStart" + i] = newForm[index].booking_window_times[i].start_time
                }

            }
            this.setState({ dataForm: newForm })


        } else if (action == "DELETE") {
            
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            let form = this[`refForm${indexForm}`].getData().values

            if(newForm[indexForm].booking_window_times.length > 1){

            for (let index = 0; index < newForm[indexForm].booking_window_times.length; index++) {
                newForm[indexForm].booking_window_times[index].end_time = form["bookingTimeEnd" + index]
                newForm[indexForm].booking_window_times[index].start_time = form["bookingTimeStart" + index]

            }


            for (let index = 0; index < newForm.length; index++) {
                for (let i = 0; i < newForm[index].booking_window_times.length; i++) {
                    delete newForm[index]["bookingTimeEnd" + i]
                    delete newForm[index]["bookingTimeStart" + i]
                }

            }

            newForm[indexForm].booking_window_times.splice(indexTime, 1)
            for (let index = 0; index < newForm.length; index++) {
                for (let i = 0; i < newForm[index].booking_window_times.length; i++) {
                    newForm[index]["bookingTimeEnd" + i] = newForm[index].booking_window_times[i].end_time
                    newForm[index]["bookingTimeStart" + i] = newForm[index].booking_window_times[i].start_time
                }

            }
            this.setState({ dataForm: newForm })
        }
        else{
            MComponentes.toast("YOU CAN'T DO THIS ACTION");
        }

        }
    }


    mapeoTimes(booking_window_times, indexForm) {
        let returnArray = [];

        returnArray.push(
            {
                type: 'component', component: () => {
                    return (
                        <h5>{'Booking Time of Day'}</h5>
                    )
                }
            })

        for (let index = 0; index < booking_window_times.length; index++) {
            if (index == 0) {

                returnArray.push(

                    { type: 'select', size: 'col s12 m5 l5', name: 'bookingTimeStart' + index, label: 'Start', options: Helper.hours },
                    { type: 'select', size: 'col s12 m5 l5', name: 'bookingTimeEnd' + index, label: 'End', options: Helper.hours },

                    {
                        type: 'component', component: () => {
                            return (
                                <>
                                    <CleverButton size={'col s12 m1 l1'} icon={'add'} fullSize={true} onClick={() => this.addBookingWindowTimes("ADD", indexForm, 0)} />
                                    <CleverButton size={'col s12 m1 l1'} icon={'remove'} fullSize={true} onClick={() => this.addBookingWindowTimes("DELETE", indexForm, index)} />
                                </>
                            )
                        }
                    }
                )

            }
            else {
                returnArray.push(
                    { type: 'select', size: 'col s12 m5 l5', name: 'bookingTimeStart' + index, label: 'Stay Dates', options: Helper.hours },
                    { type: 'select', size: 'col s12 m5 l5', name: 'bookingTimeEnd' + index, label: 'Stay Dates', options: Helper.hours },
                    {
                        type: 'component', component: () => {
                            return (
                                <CleverButton size={'col s12 m2 l2'} icon={'remove'} fullSize={true} onClick={() => this.addBookingWindowTimes("DELETE", indexForm, index)} />
                            )
                        }
                    }
                )
            }
        }

        return returnArray
    }
    onChangeDateBookingWindow(e,indexForm) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        newForm[indexForm][e.id] = e.dateString
        this.setState({dataForm:newForm})
    }
    onChangeDateStayDates(e,indexForm) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        newForm[indexForm][e.id] = e.dateString
        this.setState({dataForm:newForm})
    }
    

    deleteRestriction(e, data) {
        this.refConfirm.getInstance().open()
        this.setState({ deleteRestriction: data })
    }
    deleteRestrictionConfirm(e) {
        let data = {
            estado: Number(!Boolean(this.state.deleteRestriction.estado)),
            iddef_restriction_by: 6,
            iddef_restriction_type: 4,
            name: this.state.deleteRestriction.name
        }
        axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/restriction/put/${this.state.deleteRestriction.iddef_restriction}`, data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                this.refConfirm.getInstance().close()
                this.getDataRestriction();
            } else {
                console.log(error)
                MComponentes.toast("ERROR");
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

    onChangeBandera(e, indexForm) {
        if (e.name == "market_targeting") {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[indexForm][e.name] = e.values
            
            this.setState({ dataForm: form }, () => this.getCoutry("EDIT"))

        } else {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[indexForm][e.name] = e.value
            this.setState({ dataForm: form })
        }

    }
   
    
    render() {
        return (
            <React.Fragment>
                <div className="row"></div>
                <GridView
                    idTable='table-contracts-manuales'

                    serializeRows={true}
                    columns={[
                        { attribute: 'name', alias: 'Name' },
                        { attribute: 'restrictionby', alias: 'Restriction By' },
                        { attribute: 'restrictiontype', alias: 'Restriction Type' },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>

                                        <a onClick={(e) => this.openModal(e, "EDIT", data)} title='Edit Restriction'><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a onClick={(e) => this.deleteRestriction(e, data)} title='Disable Restriction'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a onClick={(e) => this.deleteRestriction(e, data)} title='Enable Restriction'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }

                                    </div>)
                            }
                        }
                    ]}
                    onRef={grid => this.instanceGrid = grid}

                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteRestrictionConfirm() }}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addRestriction"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} >

                    {this.state.dataForm && this.state.dataHeader ?
                        <div className="row">
                            <h5>{'RESTRICTION OPTIONS'}</h5>

                            <CleverForm
                                ref={ref => this.refFormHeader = ref}
                                id={'form-test'}
                                forms={[
                                    {
                                        inputs: [
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m6 l6', required: true, label: '* Name', name: 'name', placeholder: 'Inser name', characters: true, alphanumeric: true },
                                                    { type: 'checkbox', size: 'col s12 m6 l6', label: '', name: 'restriction_default', checkboxs: [{ value: 1, label: "Make This Your Default Access Restriction" }] },
                                                ]
                                            },
                                           
                                        ],
                                    },
                                ]}
                                data={this.state.dataHeader}
                            />
                            {this.state.dataForm.map((FormRestriction, index) =>
                                <React.Fragment>
                                    <h5>&nbsp;</h5>
                                    <hr style={{ backgroundColor: "#018bb6", height: "1px" }}></hr>
                                    <CleverForm
                                        ref={ref => this[`refForm${index}`] = ref}
                                        id={'formData' + index}
                                        data={this.state.dataForm[index]}
                                        forms={[
                                            {
                                                inputs: [
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5 className="col s12 m5 l5">{'Channels'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'radio', size: 'col s12 m5 l5 cssinline', label: 'Restriction option is: ', name: 'estado', radios: [{ value: "0", label: 'Disable' }, { value: "1", label: 'Enable' }] },
                                                            
                                                              this.state.formLength < (index + 1)? 
                                                            
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <CleverButton size={'col s12 m1 l1 offset-m1 offset-l1'} icon={'delete'}  fullSize={true} onClick={() => this.addRule("DELETE", index)} />
                                                                    )
                                                                }
                                                            }
                                                            :{
                                                                type: 'component', component: () => {
                                                                    return (
                                                                       <></>
                                                                    )
                                                                }
                                                            }
                                                                ,
                                                            { type: 'radio', onChange: (e) => this.onChangeBandera(e,index ) , size: 'col s12 m6 l6', label: 'Channels', name: 'channel_option', radios: [{ value: "0", label: 'All Channels' }, { value: "1", label: 'Only these channels' }] },
                                                            {
                                                                type: 'select', size: 'col s12 m12 l12',
                                                                autocomplete:true,
                                                                name: 'specific_channels', label: 'Channels', id: 'specific_channels',
                                                                options: this.state.dataChannels ? this.state.dataChannels : [],
                                                                hidden : Number(this.state.dataForm[index].channel_option) == 0 ? true : false,
                                                                multiple: true
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Stay Dates'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            {
                                                                type: 'select', size: 'col s12 m12 l12', name: 'travel_window_option', label: 'Stay Dates',
                                                                onChange: (e) => this.onChangeBandera(e,index ),
                                                                options: [
                                                                    { value: '0', option: 'All dates, no restrictions' },
                                                                    { value: '1', option: 'Custom dates' },
                                                                    { value: '2', option: 'Blackout dates' },
                                                                ]
                                                            },
                                                            { type: 'date', onChange: e => this.onChangeDateStayDates(e, index), colDate: Number(this.state.dataForm[index].travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ",  label: 'Name', name: 'DateStayDates1' },
                                                            { type: 'date', onChange: e => this.onChangeDateStayDates(e,index),colDate: Number(this.state.dataForm[index].travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ",  min: this.state.dataForm[index].DateStayDates1, label: 'Name', name: 'DateStayDates2' },
                                                            
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className={Number(this.state.dataForm[index].travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 " }>
                                                                            <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeDateStayDates", index)} type="button">ADD DATE</button>
                                                                        </div>
                                                                    )
                                                                }
                                                            },
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className={Number(this.state.dataForm[index].travel_window_option) == 0 ? "col s12 m12 l12 outside" : "col s12 m12 l12 " }>
                                                                            <Chip
                                                                                readOnly={true}
                                                                                setValue={set => { this[`setValueChipStayDate${index}`] = set; this[`setValueChipStayDate${index}`](this.state.dataForm[index].travel_window) }}
                                                                                getValue={get => { this[`getValueChipStayDate${index}`] = get; }}
                                                                                cleanValue={clean => { this.cleanValueChip = clean; }}
                                                                                options={{
                                                                                    placeholder: "Stay Days",
                                                                                    secondaryPlaceholder: "Stay",
                                                                                }}
                                                                                label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Booking Window'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            {
                                                                type: 'select', size: 'col s12 m12 l12', name: 'booking_window_option', label: 'Booking Window',
                                                                onChange: (e) => this.onChangeBandera(e,index ),
                                                                options: [
                                                                    { value: '0', option: 'All dates, no restrictions' },
                                                                    { value: '1', option: 'Custom dates' },
                                                                    { value: '2', option: 'Blackout dates' },
                                                                ]
                                                            },
                                                            { type: 'date', onChange: e => this.onChangeDateBookingWindow(e, index), colDate: Number(this.state.dataForm[index].booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ",  label: 'Name', name: 'DateBookingWindow1' },
                                                            { type: 'date', onChange: e => this.onChangeDateBookingWindow(e,index),colDate: Number(this.state.dataForm[index].booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ",  min: this.state.dataForm[index].DateBookingWindow1, label: 'Name', name: 'DateBookingWindow2' },
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className={Number(this.state.dataForm[index].booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 "}>
                                                                            <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeDateBookingWindow", index)} type="button">ADD DATE</button>
                                                                        </div>
                                                                    )
                                                                }
                                                            },
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className={Number(this.state.dataForm[index].booking_window_option) == 0 ? "col s12 m12 l12 outside" : "col s12 m12 l12 "}>
                                                                            <Chip
                                                                                readOnly={true}
                                                                                setValue={set => { this[`setValueChipBookigWindow${index}`] = set; this[`setValueChipBookigWindow${index}`](this.state.dataForm[index].booking_window_dates) }}
                                                                                getValue={get => { this[`getValueChipBookigWindow${index}`] = get; }}
                                                                                cleanValue={clean => { this.cleanValueChip = clean; }}
                                                                                options={{
                                                                                    placeholder: "Booking Window",
                                                                                    secondaryPlaceholder: "Booking Window",
                                                                                }}
                                                                                label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            }
                                                        ]
                                                    },

                                                    /* {
                                                        row: this.state.mapeoTimes(this.state.dataForm[index].booking_window_times, index)
                                                    }, */


                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Booking Time of Day'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'select', size: 'col s12 m4 l4', name: 'bookingTimeStart', label: 'Start', options: Helper.hours },
                                                            { type: 'select', size: 'col s12 m4 l4', name: 'bookingTimeEnd', label: 'End', options: Helper.hours },
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className={ "col s12 m4 l4 " }>
                                                                            <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeTimeBooking", index)} type="button">ADD TIME</button>
                                                                        </div>
                                                                    )
                                                                }
                                                            },
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <div className="col s12 m12 l12 ">
                                                                            <Chip
                                                                                readOnly={true}
                                                                                setValue={set => { this[`setValueChipBookingTime${index}`] = set;  this[`setValueChipBookingTime${index}`](this.state.dataForm[index].booking_window_times) }}
                                                                                getValue={get => { this[`getValueChipBookingTime${index}`] = get; }}
                                                                                options={{
                                                                                    placeholder: "Booking Time",
                                                                                    secondaryPlaceholder: "Booking Time",
                                                                                }}
                                                                                label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                                            />
                                                                       </div>
                                                                    )
                                                                }
                                                            }
                                                        ]
                                                    },

                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Bookable only on the following weekdays'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'radio',  onChange: (e) => this.onChangeBandera(e,index ), size: 'col s12 m6 l6', label: 'Bookable Weekdays', name: 'bookable_weekdays_option', radios: [{ value: "0", label: 'All days' }, { value: "1", label: "Only these days" }] },
                                                            { type: 'checkbox', size: Number(this.state.dataForm[index].bookable_weekdays_option) == 0 ? "col s12 m6 l6 outside" : "col s12 m6 l6 ", label: 'Bookable Weekdays', id: 'bookable_weekdays', name: 'bookable_weekdays', checkboxs: [{ label: "Sunday", value: "Sunday" }, { label: "Monday", value: "Monday" }, { label: "Tuesday", value: "Tuesday" }, { label: "Wednesday", value: "Wednesday" }, { label: "Thursday", value: "Thursday" }, { label: "Friday", value: "Friday" }, { label: "Saturday", value: "Saturday" }] },
                                                        ]
                                                    },
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Market'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'radio',onChange: (e) => this.onChangeBandera(e,index ), size: 'col s12 m6 l6', label: 'Market Option', name: 'market_option', radios: [{ value: "0", label: 'All markets' }, { value: "1", label: 'Custom markets' }, { value: "2", label: ' All markets, with these exceptions' }] },
                                                            {
                                                                type: 'select', size: 'col s12 m12 l12',
                                                                name: 'market_targeting', label: 'Markets',
                                                                autocomplete:true,
                                                                options: this.state.dataMarket,
                                                                hidden : Number(this.state.dataForm[index].market_option) == 0 ? true : false,
                                                                onChange: (e) => this.onChangeBandera(e,index ),
                                                                multiple: true
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Geo Targeting'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'radio',onChange: (e) => this.onChangeBandera(e,index ), size: 'col s12 m6 l6', label: 'Geo Targeting Option', name: 'geo_targeting_option', radios: [{ value: "0", label: 'All countries' }, { value: "1", label: 'Custom countries' }, { value: "2", label: 'All countries, with these exceptions' }] },
                                                            {
                                                                type: 'select', size: 'col s12 m12 l12',
                                                                autocomplete:true,
                                                                name: 'geo_targeting_countries', label: 'Countries',
                                                                options: this.state.dataForm[index].paisesXmercado,
                                                                hidden : Number(this.state.dataForm[index].geo_targeting_option) == 0 ? true : false,
                                                                multiple: true
                                                            },
                                                        ]
                                                    },
                                                    {
                                                        row: [
                                                            {
                                                                type: 'component', component: () => {
                                                                    return (
                                                                        <h5>{'Device Type'}</h5>
                                                                    )
                                                                }
                                                            },
                                                            { type: 'radio', size: 'col s12 m6 l6', name: 'device_type_option', label: 'Divice Option', radios: [{ value: "0", label: 'All Channels' }, { value: "1", label: 'Only desktop divices' }, { value: "2", label: 'Only mobile divices' }] },
                                                        ]
                                                    }
                                                ]
                                            },
                                        ]}


                                    />
                                </React.Fragment>
                            )}
                            <CleverButton size={'col s12 m12 l12'} icon={'add'} label={'ADD NEW RULE'} fullSize={true} onClick={() => this.addRule("ADD")} />
                        </div>
                        : null}
                </Modal>
                <div className='row'>
                    <CleverLoading show={this.state.loader} />
                </div>
            </React.Fragment>
        );
    }
}

export default Restrictions;