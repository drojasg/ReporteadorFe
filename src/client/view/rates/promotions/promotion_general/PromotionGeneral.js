import React, { Component } from 'react';
import GridViewAux from '../../../../components/gridView/GridView'
import {GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverAccordion, CleverLoading, MComponentes, CleverButton } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from './../../../../axiosRequest';
import Rooms from './Rooms';
import './../../access_restrictions/restrictions/css.css'

var Helper = require('./../../access_restrictions/restrictions/Countries');
class PromotionGeneral extends Component {
    constructor(props) {
        super(props)
        this.onChangeDataGrid = this.onChangeDataGrid.bind(this);
        this.getDataForm = this.getDataForm.bind(this);
        this.arrayRatePlan = null;
        this.state = {
            loader: false,
            mapeoTimes: this.mapeoTimes.bind(this),
            mapeoInputChild: this.mapeoInputChild.bind(this),
            range: this.optionRange(1, 18),
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            dataForm: {},
            rowDiscount:[],
            enableTimer: true,
            isVisibleLengthStayRestric: false
        }
    }

    componentDidMount() {
        this.props.btnAddPromotion.current.id ?
            document.getElementById(this.props.btnAddPromotion.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
            : null;
        this.getDataChannels();
        this.getDataMarket();
        this.getPromotions();
        this.getvalueType();
        this.getDiscountType();
        this.getDataHotels();
        this.getDataAges();
        
    }

    getDataAges() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/age-range/get-in-english", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {

                let arrayReturn = [];
                let arrayReturnAge = [];

                arrayReturnAge.push({ value: "0", option: "For all age range" })

                for (let index = 0; index < response.data.length; index++) {
                    if (response.data[index].iddef_age_code != 1) {
                        arrayReturnAge.push( response.data[index] )
                        arrayReturn.push({ value: String(response.data[index].iddef_age_code), option: response.data[index].text })
                    }
                }


                this.setState({ ageRange: arrayReturnAge, ageRangeSelect: arrayReturn  })

            }
            else {
                MComponentes.toast("ERROR in Age Range");
                console.log(error)

            };
            this.setState({ loader: false })
        });
    }

    optionRange(inicio, fin) {

        let arrayReturn = [];
        for (inicio; inicio <= fin; inicio++) {

            arrayReturn.push({ value: String(inicio), option: String(inicio) })
        }

        return arrayReturn;
    }

    getPropeties() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                this.setState({ dataHotel: response.data }, () => this.createAcordion() );
            }
            else {
                MComponentes.toast("ERROR in propreties");
                console.log(error)

            };
            this.setState({ loader: false })
        });

    }

    createAcordion(){
        const head2= []
        this.state.dataHotel.map((dataHotel,index) =>
        head2.push({accordion: 'view'+index,label:dataHotel.short_name,controls:[]})
        )
       this.setState({head:head2},() =>{
           this.createContent();
       })
    }

    createContent() {
        var jsonBody = {}
        for (var i = 0; i < this.state.dataHotel.length; i++) {
            let codeHotel= this.state.dataHotel[i].property_code;
            let idHotel= this.state.dataHotel[i].iddef_property;
            let indexAcordion = i
            jsonBody["view" + i] = <GridViewAux
                idTable={'table-rateplan-select-' + this.state.dataHotel[i].iddef_property}
                filter={false}
                serializeRows={false}
                columns={[
                    { attribute: 'code', alias: 'code' },
                    { attribute: 'rate_code_clever', alias: 'rate_code_clever' },
                    {
                        alias: 'Rooms',
                        expandCall: (data, index) => {
                            return (
                                <Rooms
                                    data={data.rate_plan_rooms}
                                    ratePlans={this.state.dataForm.rate_plans}
                                    codeHotel={codeHotel}
                                    idHotel={idHotel} 
                                    idRateplan={data.idop_rateplan}
                                    index={index}
                                    indexAcordion={indexAcordion}
                                    onChangeDataGrid={this.onChangeDataGrid}
                                />
                            );
                        }
                    }
                ]}
                onRef={grid => {   this[`instanceGridRatePlan${idHotel}`] = grid; }}
            />
        }
        this.setState({body:jsonBody}, ()=>this.setDatas() )
    }

    setDatas(){

        for (let index = 0; index < this.state.dataHotel.length; index++) {
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property-plans/get?property="+this.state.dataHotel[index].iddef_property , (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!response.Error) {
                   this[`instanceGridRatePlan${this.state.dataHotel[index].iddef_property}`].setDataProvider(response.data); 
                   this[`instanceGridRatePlan${this.state.dataHotel[index].iddef_property}`].setDataProvider(response.data); 
                }
                else {
                    MComponentes.toast("ERROR in table rateplan");
                    console.log(error)
    
                };
                this.setState({ loader: false })
            });
            
        }

        
    }

    getPromotions() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/promotions/get?all&order=estado&desc`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                let data= [];
                data = response.data !== undefined ? response.data :[];
                data.map(dataPromotion =>{
                    dataPromotion.textESTADO= dataPromotion.estado == 0 ? "DISABLE" :"ENABLE";
                });
                this.instanceGrid.setDataProvider(response.data);
            }
            else {
                MComponentes.toast("ERROR in promotion");
                console.log(error)

            };
            this.setState({ loader: false })
        });

    }

    getvalueType() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/promotion-discount-format/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                let arrayReturn = [];

                for (let index = 0; index < response.data.length; index++) {
                    arrayReturn.push({ value: String(response.data[index].iddef_promotion_discount_format ), option: String(response.data[index].simbol ) })
                    
                }
               
                this.setState({valueType : arrayReturn})
            }
            else {
                MComponentes.toast("ERROR in valueType");
                console.log(error)

            };
            this.setState({ loader: false })
        });

    }

    getDiscountType() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/promotion-discount-type/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                let arrayReturn = [];
                for (let index = 0; index < response.data.length; index++) {
                    arrayReturn.push({ value: response.data[index].iddef_promotion_discount_type, option: response.data[index].code })
                    
                }
                this.setState({discountType : response.data, discountTypeSelect: arrayReturn })
            }
            else {
                MComponentes.toast("ERROR in discoun type");
                console.log(error)

            };
            this.setState({ loader: false })
        });

    }

    openModal(e, option, data) {
        this.getDataHotels();
        
        
        this.setState({ dataForm: null, loader:true })
        if (option == "EDIT") {
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/promotions/search/"+ data.idop_promotions , (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }
                if (!error) {
                    if (response != null) {

                         // para chip de fechas
                         let booking_window_times = []
                         for (let i = 0; i < response.data.detail_restriction.data.booking_window_times.length; i++) {
                             booking_window_times.push( response.data.detail_restriction.data.booking_window_times[i].start_time +" - "+ response.data.detail_restriction.data.booking_window_times[i].end_time )
                         }

                        // para chip de Travel window
                        let arrayDatesTravel = []
                        for (let i = 0; i < response.data.detail_restriction.data.travel_window.length; i++) {
                            let dateTemp = this.castDate(response.data.detail_restriction.data.travel_window[i].start_date, "USER") + " - " + this.castDate(response.data.detail_restriction.data.travel_window[i].end_date, "USER")
                            arrayDatesTravel.push(dateTemp)
                        }

                        // para chip de Booking window
                        let arrayDatesBooking = []
                        for (let i = 0; i < response.data.detail_restriction.data.booking_window_dates.length; i++) {
                            let dateTemp = this.castDate(response.data.detail_restriction.data.booking_window_dates[i].start_date, "USER") + " - " + this.castDate(response.data.detail_restriction.data.booking_window_dates[i].end_date, "USER")
                            arrayDatesBooking.push(dateTemp)
                        }


                        // para discount select
                        let arrayDiscountSelect = []
                        for (let index = 0; index < response.data.discounts.length; index++) {
                            arrayDiscountSelect.push(String(response.data.discounts[index].type))
                        }

                        // para free child condition
                        let jsonFreeChild = {}
                        for (let index = 0; index < response.data.free_childs_conditions.length; index++) {
                            jsonFreeChild["child_input_" + response.data.free_childs_conditions[index].age_id ] =String(response.data.free_childs_conditions[index].free);
                          
                        }

                        //
                        let jsonFreeChildOption = [];
                        let Afor_allRange = "1";
                        for (let index = 0; index < response.data.free_childs_conditions.length; index++) {
                            if (response.data.free_childs_conditions[index].age_id != 1) {
                                jsonFreeChildOption.push(String(response.data.free_childs_conditions[index].age_id))
                            }
                            if (response.data.free_childs_conditions[index].age_id == 0){
                                Afor_allRange = "0";
                            }
                        }
                        //Valida si se oculta o no la seccion LENGTH OF STAY RESTRICTIONS
                        let isViewSectionStay = this.validateViewRestricStay(arrayDiscountSelect);  
                        let timerOffer = response.data.time_offset !== "" 
                                        ? response.data.time_offset.split(":")
                                        :0;
                        let hour=  timerOffer !== 0 ? timerOffer[0] : "";
                        let minute= timerOffer !== 0 ? timerOffer[1] : "";
                        let second= timerOffer !== 0 ? timerOffer[2] : "";  
                        let statusTimer = response.data.timer;

                        let dataForm ={
                                idop_promotions : response.data.idop_promotions,

                                internal_code: String(response.data.code),
                                internal_name: String(response.data.name),

                                discounts: response.data.discounts,
                                discount_type_select: arrayDiscountSelect,

                                /* free_childs: response.data.free_childs, */

                                childs_free_option: String(response.data.free_childs),
                                free_childs_conditions: response.data.free_childs_conditions, 
                                free_childs_conditions_option: jsonFreeChildOption,
                                for_allRange : Afor_allRange,

                                nigths_free_option: String(response.data.free_nights),
                                nights_paid_select : String(response.data.free_nights_conditions.paid ? response.data.free_nights_conditions.paid : ""),
                                nights_free_select : String(response.data.free_nights_conditions.free ? response.data.free_nights_conditions.free : ""),
                                nigths_apply : [String(response.data.free_nights_conditions.apply_once ? response.data.free_nights_conditions.apply_once : "")],


                                rooms_free_option: String(response.data.free_rooms),
                                rooms_paid_select : String(response.data.free_rooms_conditions.paid ? response.data.free_rooms_conditions.paid : ""),
                                rooms_free_select : String(response.data.free_rooms_conditions.free ? response.data.free_rooms_conditions.free : ""),
                                rooms_apply : [String(response.data.free_rooms_conditions.apply_once ? response.data.free_rooms_conditions.apply_once : "")],


                                length_stay_min: response.data.length_of_stay.minLOS !== undefined ? response.data.length_of_stay.minLOS.inherit !== null ? String(response.data.length_of_stay.minLOS.inherit) :"0" :"0",
                                length_stay_min_num: response.data.length_of_stay.minLOS !== undefined ? response.data.length_of_stay.minLOS.value !== null ? String(response.data.length_of_stay.minLOS.value):"0":"0",

                                length_stay_max: response.data.length_of_stay.maxLOS !== undefined ? response.data.length_of_stay.maxLOS.inherit !== null ? String(response.data.length_of_stay.maxLOS.inherit) : "0":"0",
                                length_stay_max_num: response.data.length_of_stay.maxLOS !== undefined ? response.data.length_of_stay.maxLOS.value !== null ? String(response.data.length_of_stay.maxLOS.value) : "0":"0",


                                name_restriction : String(response.data.detail_restriction.name),
                                iddef_restriction : response.data.detail_restriction.iddef_restriction,
                                iddef_restriction_detail: response.data.detail_restriction.data.iddef_restriction_detail,

                                travel_window_option: String(response.data.detail_restriction.data.travel_window_option),
                                travel_window: arrayDatesTravel,


                                bookable_weekdays_option: String(response.data.detail_restriction.data.bookable_weekdays_option),
                                bookable_weekdays: response.data.detail_restriction.data.bookable_weekdays,
                                partial_aplication: String(response.data.partial_aplication),

                                booking_window_option: String(response.data.detail_restriction.data.booking_window_option),
                                booking_window_dates: arrayDatesBooking,

                                booking_window_times: booking_window_times ,

                                limit_sales: String(response.data.limit_sales),
                                limit_sales_count: String(response.data.limit_sales_count),

                                
                                dayOffset: response.data.days_offset,
                                hourOffset: parseInt(hour),
                                minutesOffset: parseInt(minute),
                                secondsOffset: parseInt(second),

                                promotional_code: response.data.detail_restriction.name,
                                channel_option: String(response.data.detail_restriction.data.channel_option),
                                specific_channels: this.castArrayStringToNumber(response.data.detail_restriction.data.specific_channels, "USER"),

                                market_option: String(response.data.detail_restriction.data.market_option),
                                market_targeting : this.castArrayStringToNumber(response.data.detail_restriction.data.market_targeting,"USER"),

                                geo_targeting_option: String(response.data.detail_restriction.data.geo_targeting_option),
                                geo_targeting_countries: this.castArrayStringToNumber(response.data.detail_restriction.data.geo_targeting_countries,"USER"),

                                device_type_option: String(response.data.detail_restriction.data.device_type_option),

                                rate_plans: response.data.rate_plans,
                                crossoutPercentage: String(response.data.percent_cross_out),
                        }

                        var newObj = Object.assign({}, dataForm, jsonFreeChild)
                       

                        this.setState({
                            option:"EDIT",
                            dataForm: newObj,
                            isVisibleLengthStayRestric: isViewSectionStay,
                            enableTimer: statusTimer,
                            loader:false
                        }, () => {this.getCoutry("EDIT") , this.rowDiscount(), this.getPropeties(); this.refModalAdd.getInstance().open(); })
                    }
                    this.setState({ loader: false })
                }
                else {
                    MComponentes.toast("ERROR property");
                    console.log(error)
                    this.setState({ loader: false })
                };
            });
        }else if(option == "ADD"){
             // para free child condition
            let jsonFreeChild = {}

             let dataForm ={
                     idop_promotions : 0,

                     internal_code: "",
                     internal_name: "",

                     discounts: [],
                     discount_type_select: [],

                     for_allRange: "0" ,
                     free_childs_conditions_option:[],
                     childs_free_option: "0",
                     child_input_0: "0",

                     nigths_free_option: "0",
                     nights_paid_select : "0",
                     nights_free_select : "0",
                     nigths_apply : [],


                     rooms_free_option: "0",
                     rooms_paid_select : "0",
                     rooms_free_select : "0",
                     rooms_apply : [],


                     length_stay_min: "0",
                     length_stay_min_num: "0",

                     length_stay_max: "0",
                     length_stay_max_num: "0",


                     name_restriction : "",
                     iddef_restriction : "0",
                     iddef_restriction_detail: "",

                     travel_window_option: "0",
                     travel_window: [],


                     bookable_weekdays_option: "0",
                     bookable_weekdays: [],
                     partial_aplication: "0",

                     booking_window_option: "0",
                     booking_window_dates: [],

                     booking_window_times: [] ,

                     limit_sales: "0",
                     limit_sales_count: "0",

                     dayOffset: "",
                     hourOffset: "",
                     minutesOffset: "",
                     secondsOffset: "",

                     promotional_code: "",
                     channel_option: "0",
                     specific_channels: [],

                     market_option: "0",
                     market_targeting : [],

                     geo_targeting_option: "0",
                     geo_targeting_countries: [],

                     device_type_option: "0",

                     rate_plans: [],
                     crossoutPercentage: "0",
             }

             var newObj = Object.assign({}, dataForm, jsonFreeChild)
            

             this.setState({
                 option:"ADD",
                 dataForm: newObj,
                 isVisibleLengthStayRestric:true,
                 loader:false
             }, () => {this.getCoutry("ADD") , this.rowDiscount(), this.getPropeties(); this.refModalAdd.getInstance().open(); })
        }
    }

    getDataForm() {
        let {isVisibleLengthStayRestric,enableTimer}= this.state;
        if(this.refFormView.getData().required.count > 0 ){
            MComponentes.toast("Complete the data required");
            for (let index = 0; index < this.refFormView.getData().required.inputs.length; index++) {
                MComponentes.toast("Empty field " + this.refFormView.getData().required.inputs[index].label );
            }
            return;
        } 

        this.setState({ loader: true })
        let form = this.refFormView.getData()
        let ChipStayDate = this.getValueChipStayDate();
        let ChipBookigWindow = this.getValueChipBookigWindow();
         let ChipBookingtime = this.getValueChipBookingTime();
        
        let arrayTimes = []

        for (let i = 0; i < ChipBookingtime.length; i++) {
            let str = ChipBookingtime[i]
            let res = str.split(" - ")
            arrayTimes.push({ "start_time": res[0], "end_time": res[1] })
        } 
        
        let arrayDiscounts = []
        for (let index = 0; index < form.values.discount_type_select.length; index++) {
           arrayDiscounts.push({ 
               type: Number(form.values.discount_type_select[index]), 
               value: Number(form.values["discount_value_offer_"+form.values.discount_type_select[index]]), 
               format: Number(form.values["discount_valuetype_offer_"+form.values.discount_type_select[index]]), 
               days: Number(form.values["discount_lead_day_"+form.values.discount_type_select[index]]) 
            })
            
        }

        let arrayFree_childs = []
        if (this.state.dataForm.for_allRange == "0") {
            arrayFree_childs.push({
                free: Number(form.values["child_input_0"]),
                age_id: 0,
            })
        } else {

            for (let index = 0; index < this.state.dataForm.free_childs_conditions_option.length; index++) {
                arrayFree_childs.push({
                    free: Number(form.values["child_input_" + this.state.dataForm.free_childs_conditions_option[index]]),
                    age_id: Number(this.state.dataForm.free_childs_conditions_option[index]),

                })

            }
        }

        

        let detail_detail_restriction = {
            "restriction_default":  0,
            "iddef_restriction_detail": this.state.option == "ADD"? 0 : this.state.dataForm.iddef_restriction_detail,
            "iddef_restriction": this.state.option == "ADD"? 0 : this.state.dataForm.iddef_restriction,
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
            "geo_targeting_countries": Number(form.values.geo_targeting_option) == 0 ? [] : this.compareGeo(form.values.geo_targeting_countries ),
            "market_option": form.values.market_option,
            "market_targeting": Number(form.values.market_option) == 0 ? [] : this.castArrayStringToNumber(form.values.market_targeting,"SYSTEM"),
            "device_type_option": form.values.device_type_option,
            "booking_window_times": arrayTimes, 
           /*  "booking_window_times": this.state.dataForm.booking_window_times, */
            "min_los": 0,
            "max_los": 0,
            "value": {},
        }
        let detail_restriction= [{ 
            iddef_restriction: this.state.option == "ADD" ? 0 : this.state.dataForm.iddef_restriction,
            name : this.state.option == "ADD" ? form.values.internal_name : this.state.dataForm.promotional_code,
            data: [detail_detail_restriction]
        }]

        let length_of_stay= {}
        if (isVisibleLengthStayRestric){
            length_of_stay = {
                "minLOS": {
                    "inherit":Number( form.values.length_stay_min),
                    "value": form.values.length_stay_min == 1 ? Number( form.values.length_stay_min_num) :  0
                },
                "maxLOS": {
                    "inherit": Number(form.values.length_stay_max),
                    "value": form.values.length_stay_max == 1 ? Number(form.values.length_stay_max_num) : 0
                }
            }
        }

         let free_nights_conditions = {
            "paid": Number(form.values.nights_paid_select),
            "free": Number(form.values.nights_free_select),
            "apply_once": form.values.nigths_apply.length > 0 ? Number(form.values.nigths_apply[0]) : 0
        }

        let free_rooms_conditions = {
            "paid": Number(form.values.rooms_paid_select),
            "free": Number(form.values.rooms_free_select),
            "apply_once": form.values.rooms_apply.length > 0 ? Number(form.values.rooms_apply[0]) : 0
        }

        let hour = form.values.hourOffset !== undefined ? form.values.hourOffset !== null ? String(`00${form.values.hourOffset}`) : '00' : '00';
            hour = hour !== '00' ? hour.substring(hour.length-2, hour.length) : '00' ;
        let minute = form.values.minutesOffset !== undefined ? form.values.minutesOffset !== null ? String(`00${form.values.minutesOffset}`): '00' : '00';
            minute = minute !== '00' ? minute.substring(minute.length-2, minute.length) : '00' ;
        let second = form.values.secondsOffset !== undefined ? form.values.secondsOffset !== null ? String(`00${form.values.secondsOffset}`): '00' : '00';
            second = second !== '00' ? second.substring(second.length-2, second.length) : '00' ;

        let timeOffset= `${hour}:${minute}:${second}`;
        let daysOffset= form.values.dayOffset !== undefined ? form.values.dayOffset !== null ? Number(form.values.dayOffset): 0 : 0;
        let isActiveTimer = timeOffset !=='00:00:00' || daysOffset !== 0 ? true : false;
        
        fetch(CleverConfig.getApiUrl('bengine') + `/api/promotions/create`, {
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                'Content-Type': 'application/json; charset=utf-8'
            }),
            method: 'POST',
            body: JSON.stringify({
                idop_promotions: this.state.option == "ADD" ? 0 : this.state.dataForm.idop_promotions,
                name: form.values.internal_name,
                code: form.values.internal_code,
                discounts: arrayDiscounts,

                free_childs: Number(form.values.childs_free_option),
                free_childs_conditions: arrayFree_childs,

                free_nights: Number(form.values.nigths_free_option),
                free_nights_conditions: free_nights_conditions,
                free_rooms: Number(form.values.rooms_free_option),
                free_rooms_conditions: free_rooms_conditions,
                limit_sales: Number(form.values.limit_sales),
                limit_sales_count: Number(form.values.limit_sales_count),
                timer: isActiveTimer == true ? enableTimer == true ? 1 : 0 :0,
                days_offset: daysOffset,
                time_offset: timeOffset,
                length_of_stay: length_of_stay,
                partial_aplication: Number(form.values.partial_aplication),
                detail_restriction: detail_restriction,
                rate_plans: this.arrayRatePlan,
                percent_cross_out: Number(form.values.crossoutPercentage)
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
                    this.getPromotions();
                    this.refModalAdd.getInstance().close()
                    this.setState({ loader: false })
                    this.arrayRatePlan = null
                    MComponentes.toast("DONE");
                }
                else{
                    MComponentes.toast("Error in post: ", json.Msg);
                    this.setState({ loader: false })
                }
                
            })
            .catch(error => {
                this.setState({ loader: false })
                console.log(error)
                MComponentes.toast("ERROR");
            })
    }

    getDataHotels() {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                       options.push({ id_property: response.data[index].iddef_property, rate_plans: [] }) 
                    }
                    this.arrayRatePlan =  options 
                }
                this.setState({ loader: false })
            }
            else {
                MComponentes.toast("ERROR property");
                console.log(error)
                this.setState({ loader: false })
            };
        });
    }
    getDataChannels() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/channels/get-all", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var jotason = []
                    for (let index = 0; index < response.data.length; index++) {
                        jotason.push({ value: response.data[index].iddef_channel, option: response.data[index].description })
                    }
                    this.setState({ dataChannels: jotason })
                }

            }
            else {
                MComponentes.toast("ERROR");
                console.log(error)
            };
        });
    }

    getDataMarket() {
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
                        jotason.push({ value: response.data[index].iddef_market_segment, option: response.data[index].code + " - " + response.data[index].description })
                    }
                    this.setState({ dataMarket: jotason })
                }

            }
            else {
                MComponentes.toast("ERROR");
                console.log(error)
            };
        });
    }

    

    onChangeBandera(e) {
        if (e.name == "market_targeting") {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.values
            
            this.setState({ dataForm: form }, () => this.getCoutry("EDIT"))

        }
        else if (e.name == "discount_type_select") {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.values;
            let arraySelected = e.values;

            let viewSection = this.validateViewRestricStay(arraySelected);

            if(!viewSection){
                form !== null ? form["length_stay_min"]= "0" :null;
                form !== null ?form["length_stay_min_num"]= "0": null;
                form !== null ? form["length_stay_max"]=  "0" : null;
                form !== null ? form["length_stay_max_num"]=  "0": null;
            }

            this.setState({ dataForm: form ,isVisibleLengthStayRestric: viewSection}, () => this.rowDiscount() );
        }
        
        else if (e.name == "free_childs_conditions_option") {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.values
            this.setState({ dataForm: form })
            
        }
        else {
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.name] = e.value
            this.setState({ dataForm: form })
        }

    }

    validateViewRestricStay(arraySelected){
        let isVisible = false;
        let {discountTypeSelect}= this.state;
        /*Verifica si en el select discounts existe opcion de Length of Stay, si existe se extrae el id para compararse 
            con los que estan seleccionados actualemnte y decidir si se oculta o no la seccion de minimos y maximos*/
        let existLengthStay = discountTypeSelect.find(typeDiscount => typeDiscount.option.toUpperCase().replace(/ /g, "") == "LENGTHOFSTAY");
        let valueIDLengthStay = existLengthStay !== undefined ? String(existLengthStay.value) :null;
        let isSelectedLengthStay = valueIDLengthStay !== null ?
                arraySelected.length >0 ?
                    arraySelected.includes(valueIDLengthStay)
                :false
            :false;
      
        //si esta seleccionado se debe ocultar la seccion por eso se invierte el resultado
        isVisible = !isSelectedLengthStay;
        return isVisible;
    }

    onChangeDate(e) {
        let form = JSON.parse(JSON.stringify(this.state.dataForm));
        form[e.id] = e.dateString
        this.setState({ dataForm: form })
    }

    addToChip(e, toChip) {
        switch (toChip) {
            case "onChangeDateBookingWindow":
                if (this.state.dataForm.DateBookingWindow1 || this.state.dataForm.DateBookingWindow2) {
                    if (Date.parse(this.state.dataForm.DateBookingWindow1 + " 12:00") < Date.parse(this.state.dataForm.DateBookingWindow2 + " 12:00")) {
                        this.setValueChipBookigWindow(this.castDate(this.state.dataForm.DateBookingWindow1, "USER") + " - " + this.castDate(this.state.dataForm.DateBookingWindow2, "USER"));
                    } else {
                        MComponentes.toast("Select a valid range");
                        return;
                    }

                } else {
                    MComponentes.toast("Select a date range");
                    return;
                }
                break;
            case "onChangeDateStayDates":
                if (this.state.dataForm.DateStayDates1 || this.state.dataForm.DateStayDates2) {
                    if (Date.parse(this.state.dataForm.DateStayDates1 + " 12:00") < Date.parse(this.state.dataForm.DateStayDates2 + " 12:00")) {
                        this.setValueChipStayDate(this.castDate(this.state.dataForm.DateStayDates1, "USER") + " - " + this.castDate(this.state.dataForm.DateStayDates2, "USER"));
                    } else {
                        MComponentes.toast("Select a valid range");
                        return;
                    }

                } else {
                    MComponentes.toast("Select a date range");
                    return;
                }
                break;

                case "onChangeTimeBooking":

                    let form = this.refFormView.getData().values
                    let bookingTimeStart = form.bookingTimeStart
                    let bookingTimeEnd = form.bookingTimeEnd
    
                    if (bookingTimeStart != "" && bookingTimeEnd != "") {
    
                        // if (Date.parse('01/01/2011 ' + bookingTimeStart) < Date.parse('01/01/2011 ' + bookingTimeEnd)) {
                            this.setValueChipBookingTime(bookingTimeStart + " - " + bookingTimeEnd );
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

    addBookingWindowTimes(action, indexTime) {
        if (action == "ADD") {
            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            let newDate = newForm.free_childs_conditions.concat({ "to": "1", "max": "1", "from": "1" })
            newForm.free_childs_conditions = newDate


            for (let i = 0; i < newForm.free_childs_conditions.length; i++) {
                newForm["from_" + i] = String(newForm.free_childs_conditions[i].from)
                newForm["to_" + i] = String(newForm.free_childs_conditions[i].to)
                newForm["max_" + i] =String(newForm.free_childs_conditions[i].max)
            }

            this.setState({ dataForm: newForm })


        } else if (action == "DELETE") {

            let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
            let form = this.refFormView.getData().values

            if (newForm.free_childs_conditions.length > 1) {

                for (let index = 0; index < newForm.free_childs_conditions.length; index++) {
                    newForm.free_childs_conditions[index].from = form["from_" + index]
                    newForm.free_childs_conditions[index].to = form["to_" + index]
                    newForm.free_childs_conditions[index].max = form["max_" + index]

                } 

                for (let i = 0; i < newForm.free_childs_conditions.length; i++) {
                    delete newForm["from_" + i]
                    delete newForm["to_" + i]
                    delete newForm["max_" + i]
                }
                
               
                
                newForm.free_childs_conditions.splice(indexTime, 1)
                
                

                for (let i = 0; i < newForm.free_childs_conditions.length; i++) {
                    newForm["from_" + i] = String(newForm.free_childs_conditions[i].to)
                    newForm["to_" + i] = String(newForm.free_childs_conditions[i].from)
                    newForm["max_" + i] = String(newForm.free_childs_conditions[i].max)
                }


                this.setState({ dataForm: newForm })
            }
            else {
                MComponentes.toast("YOU CAN'T DO THIS ACTION");
            }

        }
    }

    mapeoTimes(free_childs_conditions) {
        let returnArray = [];

        returnArray.push(
            { type: 'radio', size: 'col s12 m12 16', onChange: e => this.onChangeBandera(e), label: 'Free childs', name: 'free_childs', radios: [{ value: "0", label: 'Disble' }, { value: "1", label: 'Enable' }] })

        for (let index = 0; index < free_childs_conditions.length; index++) {
            if (index == 0) {

                returnArray.push(
          

                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', name: 'from_' + index, label: 'From', options: this.state.range },
                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', name: 'to_' + index, label: 'To', options: this.state.range },
                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m4 l4' : 'col s12 m3 l3 outside', name: 'max_' + index, label: 'Max quantity', options: this.state.range },

                    {
                        type: 'component', component: () => {
                            return (
                                <>
                                    <CleverButton size={Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m1 l1' : 'col s12 m1 l1 outside'} icon={'add'} fullSize={true} onClick={() => this.addBookingWindowTimes("ADD", 0)} />
                                    <CleverButton size={Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m1 l1' : 'col s12 m1 l1 outside'} icon={'remove'} fullSize={true} onClick={() => this.addBookingWindowTimes("DELETE", index)} />
                                </>
                            )
                        }
                    }
                )

            }
            else {
                returnArray.push(
                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', name: 'from_' + index, label: 'From', options: this.state.range },
                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', name: 'to_' + index, label: 'To', options: this.state.range },
                    { type: 'select', size: Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m4 l4' : 'col s12 m3 l3 outside', name: 'max_' + index, label: 'Max quantity', options: this.state.range },
                    {
                        type: 'component', component: () => {
                            return (
                                <CleverButton size={  Number(this.state.dataForm.free_childs) == 1  ? 'col s12 m2 l2' : 'col s12 m2 l2 outside'} icon={'remove'} fullSize={true} onClick={() => this.addBookingWindowTimes("DELETE", index)} />
                            )
                        }
                    }
                )
            }
        }

        return returnArray
    }

    mapeoInputChild(free_childs_conditions_option, for_allRange){
        let returnArray = [];

        if(for_allRange == "0"){
            returnArray.push(
                       
                { type: 'number', size: Number(this.state.dataForm.childs_free_option) == 1 ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', required: true, label: "For all age range" , name: 'child_input_0', id: 'child_input_0' },
                
                
            )
        }else{
        console.log(free_childs_conditions_option)
        for (let index = 0; index < free_childs_conditions_option.length; index++) {

            for (let i = 0; i < this.state.ageRange.length; i++) {

                if (String(this.state.ageRange[i].iddef_age_code) == String(free_childs_conditions_option[index]) ) {
                    returnArray.push(
                       
                        { type: 'number', size: Number(this.state.dataForm.childs_free_option) == 1 ? 'col s12 m3 l3' : 'col s12 m3 l3 outside', required: true, label: this.state.ageRange[i].text , name: 'child_input_' + String(free_childs_conditions_option[index]), id: 'child_input_' + String(free_childs_conditions_option[index]) },
                        
                    )
                }
            }
        }
    }
        return returnArray
    }
    compareGeo(countries){
        
        let pisesSelected = countries
        let paisesXmercado = this.state.paisesXmercado
        let arrayChidori = []
        for (let index = 0; index < paisesXmercado.length; index++) {
            if( pisesSelected.indexOf(paisesXmercado[index].value) != -1 ){
                arrayChidori.push(paisesXmercado[index].value)
            }
            
        }
        return arrayChidori;
    }

    async getCoutry(action) {

        let paramsCountry = "";
        if (action == "EDIT") {
            if (Number(this.state.dataForm.market_option) != 0) {
                let stringUrl = ""
                this.state.dataForm.market_targeting.map((idMarket) =>
                    stringUrl = stringUrl + idMarket + ","
                )
                paramsCountry = stringUrl != "" ?  "?market=" + stringUrl : ""
            }
        }
        this.setState({ loader: true })
        await CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/country/get" + paramsCountry, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                var jotason = []
                for (let index = 0; index < response.data.length; index++) {
                    jotason.push({ value: response.data[index].country_code, option: response.data[index].name })
                }
                this.setState({ paisesXmercado: jotason, loader: false })
            }
            else {
                this.setState({ loader: false })
                MComponentes.toast("ERROR country");
                console.log(error)
            };
        });

        
        
    }

    castBookingTravelDate(StringDate){
        let arrayReturn = []
        for (let index = 0; index < StringDate.length; index++) {
            let arraySplit = StringDate[index].split(" - ")
            arrayReturn.push({start_date: this.castDate(arraySplit[0], "SYSTEM"), end_date: this.castDate(arraySplit[1], "SYSTEM") })
        }
        return arrayReturn
    }

    castDate(datecast, type) {
        let newFormat = ""
        //2020-02-10 -> 10/02/2020
        if (type == "USER") {
            let arraySplit = datecast.split("-")
            newFormat = arraySplit[2] + "/" + arraySplit[1] + "/" + arraySplit[0]
        }
        //10/02/2020 -> 2020-02-10
        else if (type == "SYSTEM") {
            let arraySplit = datecast.split("/")
            newFormat = arraySplit[2] + "-" + arraySplit[1] + "-" + arraySplit[0]
        }


        return newFormat
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

    rowDiscount() {
        let returnArrayRow = [];
        let newState = JSON.parse(JSON.stringify(this.state));
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
       
        for (let index = 0; index < newForm.discount_type_select.length; index++) {

            for (let i = 0; i < newState.discountType.length; i++) {

                if (String(newForm.discount_type_select[index]) == String(newState.discountType[i].iddef_promotion_discount_type) ) {
                    returnArrayRow.push(
                        {
                            type: 'component', component: () => {
                                return (
                                    <h5 className="col s12 m12 l12">{newState.discountType[i].code}</h5>
                                )
                            }
                        },
                        { type: 'text', size: 'col s12 m4 l4', required: true, label: `Amount` , placeholder: "Discount", name: ('discount_value_offer_'+newForm.discount_type_select[index]), characters: true, alphanumeric: true },
                        { type: 'select', size: 'col s12 m4 l4', name: ('discount_valuetype_offer_'+newForm.discount_type_select[index]), label: 'Value Type', options: this.state.valueType },
                        { type: 'text', size: 'col s12 m4 l4', disabled: Number( newForm.discount_type_select[index] ) == 1 ? true : false , required: true, label: 'Lead Days', placeholder: "Discount", name: ('discount_lead_day_'+newForm.discount_type_select[index]), characters: true, alphanumeric: true })
      
                }
            }
            if(newForm.discounts[index] === undefined){
                this.state.dataForm.discounts.push({days: 0, type: newForm.discount_type_select[index] , value: 0, format: 0 })
            } 
        }


        this.setState({ rowDiscount: returnArrayRow }, () => this.setValueDiscount())
    }

    setValueDiscount(){
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));

        for (let index = 0; index < this.state.discountType.length; index++) {
            delete newForm["discount_value_offer_" + this.state.discountType[index].iddef_promotion_discount_type ]
            delete newForm["discount_valuetype_offer_" + this.state.discountType[index].iddef_promotion_discount_type ]
            delete newForm["discount_lead_day_" + this.state.discountType[index].iddef_promotion_discount_type ]
        }


        for (let index = 0; index < this.state.dataForm.discounts.length; index++) {
            newForm["discount_value_offer_" + this.state.dataForm.discounts[index].type] = String(this.state.dataForm.discounts[index].value)
            newForm["discount_valuetype_offer_" + this.state.dataForm.discounts[index].type] = String(this.state.dataForm.discounts[index].format)
            newForm["discount_lead_day_" + this.state.dataForm.discounts[index].type] = String(this.state.dataForm.discounts[index].days)
        }

        this.setState({ dataForm: newForm })
    }



    onChangeDataGrid(e, idPropiedad, idRateplan, indexAcordion) {
      /*  console.log(e, indexAcordion, idRateplan) */
      
            if (String(this.arrayRatePlan[indexAcordion].id_property) == String(idPropiedad)) {
                if( this.arrayRatePlan[indexAcordion].rate_plans.length > 0 ){

                     for (let k = 0; k < this.arrayRatePlan[indexAcordion].rate_plans.length; k++) {
                       
                        if(this.arrayRatePlan[indexAcordion].rate_plans[k].id_rateplan == idRateplan ){
                           /*  console.log(this.arrayRatePlan[indexAcordion].rate_plans[k] , e.value)  */
                            this.arrayRatePlan[indexAcordion].rate_plans[k].rate_plan_rooms = this.castArrayStringToNumber(e.value, "SYSTEM")
                            break
                        }
                      
                    } 
                

                    let bandera = true
                    for (let i = 0; i < this.arrayRatePlan[indexAcordion].rate_plans.length; i++) {
                        if (this.arrayRatePlan[indexAcordion].rate_plans[i].id_rateplan == idRateplan){
                           bandera = false
                           break
                        }
                    }
                    if(bandera){
                        this.arrayRatePlan[indexAcordion].rate_plans.push({ id_rateplan: idRateplan , rate_plan_rooms: this.castArrayStringToNumber(e.value, "SYSTEM") })
                        /* console.log("push 2") */
                    }

                    
                }else{
                    this.arrayRatePlan[indexAcordion].rate_plans.push({ id_rateplan: idRateplan , rate_plan_rooms: this.castArrayStringToNumber(e.value, "SYSTEM") })
                   /*  console.log("push 1")
 */
                }
                

            }


    }



    deletePromotion(e, data) {
        this.refConfirm.getInstance().open()
        this.setState({ deletePromotion: data })
    }

    deletePromotionConfirm() {
        this.setState({ loader: true })
        
        let estado = Number(!Boolean(this.state.deletePromotion.estado))
        let data = {}
        axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/promotions/delete/${this.state.deletePromotion.idop_promotions}/${estado}`, data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!error) {
                this.refConfirm.getInstance().close()
                this.getPromotions();
                
            } else {
                console.log(error)
                MComponentes.toast("ERROR");
            }
            this.setState({ loader: false })
        });
    }
   

    getConfigAddButtonsModal() {
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e =>  this.getDataForm() } >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    changeStatus(tipo,status){
        if(tipo == 'timer'){
            let isEnableTimer = status == 1 ? true : false;
            this.setState({enableTimer:isEnableTimer});
        }    
    }

    validateTimer(e){
        let form = JSON.parse(JSON.stringify(this.state.dataForm));
        let nameInput = e.name;
        let valueData = parseInt(e.value);

        switch(nameInput){
            case 'hourOffset':
                    if(valueData > 23){
                        MComponentes.toast("Hour not valid");
                        form[nameInput] = "";
                        this.setState({ dataForm: form });
                    }
                break;
            case 'minutesOffset':
                    if(valueData > 59){
                        MComponentes.toast("Minute not valid");
                        form[nameInput] = "";
                        this.setState({ dataForm: form });
                    }
                break;
            case 'secondsOffset':
                    if(valueData > 59){
                        MComponentes.toast("Second not valid");
                        form[nameInput] = "";
                        this.setState({ dataForm: form });
                    }
                break;
            case 'dayOffset':
                    if(valueData > 999){
                        MComponentes.toast("Day not valid");
                        form[nameInput] = "";
                        this.setState({ dataForm: form });
                    }
                break;
            default:
                break;
        }
    }

    validatePercentage(e){
        let form = JSON.parse(JSON.stringify(this.state.dataForm));
        let valueData = parseInt(e.value);

        if (valueData < 0) {
            MComponentes.toast("Crossout Percentage not valid");
            form[e.name] = "0";
        } else if ( e.value.toString().indexOf('.') != -1 ) {
            MComponentes.toast("Crossout Percentage is float");
            form[e.name] = "0";
        }
        this.setState({ dataForm: form });
    }

    render() {
        let {enableTimer,isVisibleLengthStayRestric}=this.state;
        // console.log(this.state)
        return (
            <React.Fragment>
                <GridView
                    idTable='table-contracts-manuales'
                    filter={true}
                    serializeRows={false}
                    columns={[

                        { attribute: 'name', alias: 'Name' },
                        { attribute: 'code', alias: 'Code' },
                        { attribute: "textESTADO", alias: "Status" },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>
                                        <div className='col s12 m6 l6'>
                                            <a onClick={(e) => this.openModal(e, "EDIT", data)} title='Edit RatePlan' ><i className='material-icons left'>mode_edit</i></a>
                                        </div>
                                        <div className='col s12 m6 l6'>
                                            {data.estado == 1 ?
                                                <a onClick={(e) => this.deletePromotion(e, data)} title='Disable RatePlan'><i className='material-icons left'  >toggle_on</i></a>
                                                :
                                                <a onClick={(e) => this.deletePromotion(e, data)} title='Enable RatePlan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                            }
                                        </div>
                                    </div>)
                            }
                        }
                    ]}
                    onRef={grid => this.instanceGrid = grid}

                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deletePromotionConfirm() }}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addPromotion"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} >
                    {this.state.dataForm  &&
                    this.state.body &&
                    this.state.head  ?
                    <React.Fragment>
                        <CleverForm
                            id={'form-Promotion'}
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
                                                { type: 'text', size: 'col s12 m6 l6', required: true, label: 'Internal Promotion Name', name: 'internal_name', characters: true, alphanumeric: true },
                                                { type: 'text', size: 'col s12 m6 l6', required: true, label: 'Internal Code ', name: 'internal_code', characters: true, alphanumeric: true },

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
                                                            <h5 className="col s12 m5 l5">{'OFFERS'}</h5>
                                                        )
                                                    }
                                                }
                                            ],
                                        },
                                        {
                                            row: [
                                                {
                                                    type: 'select', size: 'col s12 m12 l12',
                                                    name: 'discount_type_select', label: 'Discounts', id: 'discount_type_select',
                                                    options: this.state.discountTypeSelect ? this.state.discountTypeSelect : [],
                                                    onChange : (e) => this.onChangeBandera(e),
                                                    multiple: true
                                                }
                                            ]
                                        },
                                        {
                                            row: this.state.rowDiscount 
                                        },
                                       /*  {
                                            row: this.state.mapeoTimes(this.state.dataForm.free_childs_conditions)
                                        }, */
                                        {
                                            row: [
                                                
                                                { type: 'radio', size: 'col s12 m12 l12', onChange: e => this.onChangeBandera(e), label: 'Free childs', name: 'childs_free_option', radios: [{ value: "0", label: 'Disble' }, { value: "1", label: 'Enable' }] },
                                                { type: 'select', onChange : e => this.onChangeBandera(e), size: Number(this.state.dataForm.childs_free_option) == 1  ? 'col s12 m16 l6' : 'col s12 m6 l6 outside' , name: 'free_childs_conditions_option', label: 'Age Range Select', options: this.state.ageRangeSelect, multiple:true, disabled: this.state.dataForm.for_allRange == "0"  ? true : false, required: Number(this.state.dataForm.for_allRange) == "0"  ? false : true },
                                                { type: 'radio', size: Number(this.state.dataForm.childs_free_option) == 1  ? 'col s12 m16 l6 cssinline' : 'col s12 m6 l6 outside cssinline', onChange: e => this.onChangeBandera(e), label: '', name: 'for_allRange', radios: [{ value: "0", label: 'Check for all age range  ' }, { value: "1", label: 'Check to select age ranges' }] },
                                                
                                                /* { type: 'select', size: Number(this.state.dataForm.childs_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , name: 'childs_paid_select', label: 'Paid Child', options: this.state.range },
                                                { type: 'select', size: Number(this.state.dataForm.childs_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside', name: 'childs_free_select', label: 'Free Child', options: this.state.range },
                                                { type: 'checkbox', size: Number(this.state.dataForm.childs_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , label: '', name: 'childs_apply', checkboxs: [{ label: "Apply only once in a length of stay ", value: "1" }] }
 */
                                            ]
                                        },
                                        {
                                            row: this.state.mapeoInputChild(this.state.dataForm.free_childs_conditions_option, this.state.dataForm.for_allRange )
                                        },
                                        {
                                            row: [
                                                
                                                { type: 'radio', size: 'col s12 m12 16', onChange: e => this.onChangeBandera(e), label: 'Free Nights', name: 'nigths_free_option', radios: [{ value: "0", label: 'Disble' }, { value: "1", label: 'Enable' }] },
                                                { type: 'select', size: Number(this.state.dataForm.nigths_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , name: 'nights_paid_select', label: 'Paid Nights', options: this.state.range },
                                                { type: 'select', size: Number(this.state.dataForm.nigths_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside', name: 'nights_free_select', label: 'Free Nights', options: this.state.range },
                                                { type: 'checkbox', size: Number(this.state.dataForm.nigths_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , label: '', name: 'nigths_apply', checkboxs: [{ label: "Apply only once in a length of stay ", value: "1" }] }

                                            ]
                                        },
                                        {
                                            row: [
                                                
                                                { type: 'radio', size: 'col s12 m12 16', onChange: e => this.onChangeBandera(e), label: 'Free Rooms', name: 'rooms_free_option', radios: [{ value: "0", label: 'Disble' }, { value: "1", label: 'Enable' }] },
                                                { type: 'select', size: Number(this.state.dataForm.rooms_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , name: 'rooms_paid_select', label: 'Paid Rooms', options: this.state.range },
                                                { type: 'select', size: Number(this.state.dataForm.rooms_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside', name: 'rooms_free_select', label: 'Free Rooms', options: this.state.range },
                                                { type: 'checkbox', size: Number(this.state.dataForm.rooms_free_option) == 1  ? 'col s12 m6 l4' : 'col s12 m6 l4 outside' , label: '', name: 'rooms_apply', checkboxs: [{ label: "Apply only once in a length of stay ", value: "1" }] }

                                            ]
                                        },
                                        {
                                            row: [
                                                { type: 'component', component: () => {
                                                    return (
                                                        <React.Fragment>
                                                            <hr style={{ backgroundColor: "#018bb6", height: "1px", marginTop: "1.75rem" }}></hr>
                                                        </React.Fragment>
                                                    )} 
                                                },
                                                { type: 'component', component: () => {
                                                    return (
                                                        <h5 className="col s12 m5 l5">{'CROSSOUT'}</h5>
                                                    ) }
                                                },
                                            ],
                                        },
                                        {
                                            row: [
                                                {type:'number', size:'col s12 m3 l3', name:'crossoutPercentage',label:'* crossout Percentage',min:0, max:999,onChange:e=>this.validatePercentage(e)},
                                            ]
                                        },
                                        isVisibleLengthStayRestric == true ?
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
                                        }:{row:[]},
                                        isVisibleLengthStayRestric == true ?
                                        {
                                            row: [
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5 className="col s12 m5 l5">{'LENGTH OF STAY RESTRICTIONS'}</h5>
                                                        )
                                                    }
                                                }
                                            ],
                                        }:{row:[]},
                                        isVisibleLengthStayRestric == true ?
                                        {
                                            row: [
                                                { type: 'radio', onChange: e => this.onChangeBandera(e), size: 'col s6 m6 l6', label: 'MIN LOS', name: 'length_stay_min', radios: [{ value: "0", label: 'Inherit' }, { value: "1", label: 'Longer MinLOS than Base' }] },
                                                { type: 'radio', onChange: e => this.onChangeBandera(e), size: 'col s6 m6 l6', label: 'MAX LOS', name: 'length_stay_max', radios: [{ value: "0", label: 'Inherit' }, { value: "1", label: 'Longer MaxLOS than Base' }] },
                                                { type: 'text', size: 'col s6 m6 l6', hidden: this.state.dataForm.length_stay_min == "0" ? true : false, required: true, placeholder: 'Inherit', name: 'length_stay_min_num', characters: true, alphanumeric: true },
                                                { type: 'text', size: this.state.dataForm.length_stay_min == '0' ?  'col s6 offset-s6 m6 offset-m6 l6 offset-l6' : 'col s6 m6 l6' , hidden: this.state.dataForm.length_stay_max == "0" ? true : false, required: true, placeholder: 'Inherit', name: 'length_stay_max_num', characters: true, alphanumeric: true },

                                            ]
                                        }:{row:[]},
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
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5>{'TRAVEL WINDOW'}</h5>
                                                        )
                                                    }
                                                },
                                                {
                                                    type: 'select', size: 'col s12 m12 l12', name: 'travel_window_option', label: 'Stay Dates',
                                                    onChange: (e) => this.onChangeBandera(e),
                                                    options: [
                                                        { value: '0', option: 'All dates, no restrictions' },
                                                        { value: '1', option: 'Custom dates' },
                                                        { value: '2', option: 'Blackout dates' },
                                                    ]
                                                },
                                                { type: 'date', onChange: e => this.onChangeDate(e), colDate: Number(this.state.dataForm.travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ", label: 'Name', name: 'DateStayDates1' },
                                                { type: 'date', onChange: e => this.onChangeDate(e), colDate: Number(this.state.dataForm.travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ", min: this.state.dataForm.DateStayDates1, label: 'Name', name: 'DateStayDates2' },

                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <div className={Number(this.state.dataForm.travel_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 "}>
                                                                <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeDateStayDates")} type="button">ADD DATE</button>
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <div className={Number(this.state.dataForm.travel_window_option) == 0 ? "col s12 m12 l12 outside" : "col s12 m12 l12 "}>
                                                                <Chip
                                                                    readOnly={true}
                                                                    setValue={set => { this.setValueChipStayDate = set; this.setValueChipStayDate(this.state.dataForm.travel_window); }}
                                                                    getValue={get => { this.getValueChipStayDate = get; }}
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
                                                            <React.Fragment>
                                                                <hr style={{ backgroundColor: "#018bb6", height: "1px", marginTop: "1.75rem" }}></hr>
                                                            </React.Fragment>
                                                        )
                                                    }
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5>{'Travel Days of the Week'}</h5>
                                                        )
                                                    }
                                                },
                                                { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m6 l6', label: 'Bookable Weekdays', name: 'bookable_weekdays_option', radios: [{ value: "0", label: 'All days' }, { value: "1", label: "Only these days" }] },
                                                { type: 'checkbox', size: Number(this.state.dataForm.bookable_weekdays_option) == 0 ? "col s12 m6 l6 outside" : "col s12 m6 l6 ", label: 'Bookable Weekdays', id: 'bookable_weekdays', name: 'bookable_weekdays', checkboxs: [{ label: "Sunday", value: "Sunday" }, { label: "Monday", value: "Monday" }, { label: "Tuesday", value: "Tuesday" }, { label: "Wednesday", value: "Wednesday" }, { label: "Thursday", value: "Thursday" }, { label: "Friday", value: "Friday" }, { label: "Saturday", value: "Saturday" }] },
                                                { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m7 l7', label: 'Partial Application', name: 'partial_aplication', radios: [{ value: "0", label: 'Apply promotion on single stay dates.' }, { value: "1", label: "Entire stay must qualify for promotion" }] },

                                               
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
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5>{'Booking Window'}</h5>
                                                        )
                                                    }
                                                },
                                                {
                                                    type: 'select', size: 'col s12 m12 l12', name: 'booking_window_option', label: 'Booking Window',
                                                    onChange: (e) => this.onChangeBandera(e),
                                                    options: [
                                                        { value: '0', option: 'All dates, no restrictions' },
                                                        { value: '1', option: 'Custom dates' },
                                                        { value: '2', option: 'Blackout dates' },
                                                    ]
                                                },
                                                { type: 'date', onChange: e => this.onChangeDate(e), colDate: Number(this.state.dataForm.booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ", label: 'Name', name: 'DateBookingWindow1' },
                                                { type: 'date', onChange: e => this.onChangeDate(e), colDate: Number(this.state.dataForm.booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 ", min: this.state.dataForm.DateBookingWindow1, label: 'Name', name: 'DateBookingWindow2' },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <div className={Number(this.state.dataForm.booking_window_option) == 0 ? "col s12 m4 l4 outside" : "col s12 m4 l4 "}>
                                                                <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeDateBookingWindow")} type="button">ADD DATE</button>
                                                            </div>
                                                        )
                                                    }
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <div className={Number(this.state.dataForm.booking_window_option) == 0 ? "col s12 m12 l12 outside" : "col s12 m12 l12 "}>
                                                                <Chip
                                                                    readOnly={true}
                                                                    setValue={set => { this.setValueChipBookigWindow = set; this.setValueChipBookigWindow(this.state.dataForm.booking_window_dates) }}
                                                                    getValue={get => { this.getValueChipBookigWindow = get; }}
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
                                                },
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
                                                                <button className="btn input-field" onClick={e => this.addToChip(e, "onChangeTimeBooking")} type="button">ADD TIME</button>
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
                                                                    setValue={set => { this.setValueChipBookingTime= set;  this.setValueChipBookingTime(this.state.dataForm.booking_window_times) }}
                                                                    getValue={get => { this.getValueChipBookingTime = get; }}
                                                                    options={{
                                                                        placeholder: "Booking Time",
                                                                        secondaryPlaceholder: "Booking Time",
                                                                    }}
                                                                    label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                                />
                                                           </div>
                                                        )
                                                    }
                                                },
                                                { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m7 l7', label: 'Global Sales Limit', name: 'limit_sales', radios: [{ value: "0", label: 'Unchanged' }, { value: "1", label: "Limited" }] },
                                                { type: 'text', size: 'col s12 m3 l3', hidden: this.state.dataForm.limit_sales == "0" ? true : false, required: true, placeholder: 'Limit', name: 'limit_sales_count', characters: true, alphanumeric: true },
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
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5>{'Timer Config'}</h5>
                                                        )
                                                    }
                                                },                                           
                                            ]
                                        },
                                        {
                                            row:[                                    
                                                {type:'component',
                                                    component:() =>{
                                                        return(
                                                                <div>
                                                                {
                                                                        enableTimer == true ?
                                                                            <a onClick={(e) => this.changeStatus('timer',0)} title='Disable Timer'>
                                                                                <i className='material-icons small'  >toggle_on</i>
                                                                            </a>
                                                                        :
                                                                            <a onClick={(e) => this.changeStatus('timer',1)} title='Enable Timer'>
                                                                                <i className='material-icons small' style={{ color: "#990303" }}>toggle_off</i>
                                                                            </a>
                                                                        }  
                                                                </div>
                                                        );
                                                    }
                                                },
                                            ]
                                        },
                                        enableTimer == true ?
                                        {
                                            row:[                                    
                                                {type:'number', size:'col s12 m3 l3', name:'dayOffset',label:'Day offset',min:0, max:999,onChange:e=>this.validateTimer(e)},
                                                {type:'number', size:'col s12 m3 l3', name:'hourOffset',label:'Hours offset', min:0, max:23,onChange:e=>this.validateTimer(e)},
                                                {type:'number', size:'col s12 m3 l3', name:'minutesOffset',label:'Minutes offset',min:0, max:59,onChange:e=>this.validateTimer(e)},
                                                {type:'number', size:'col s12 m3 l3', name:'secondsOffset',label:'Seconds offset',min:0, max:59,onChange:e=>this.validateTimer(e)},
                                            ]
                                        }:{row:[]},
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
                                                },
                                                {
                                                    type: 'component', component: () => {
                                                        return (
                                                            <h5>{'MARKETING'}</h5>
                                                        )
                                                    }
                                                },
                                                { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m12 l12', label: 'Channels', name: 'channel_option', radios: [{ value: "0", label: 'All Channels' }, { value: "1", label: 'Only these channels' }] },
                                                {
                                                    type: 'select', size: 'col s12 m12 l12',
                                                    name: 'specific_channels', label: 'Channels', id: 'specific_channels',
                                                    options: this.state.dataChannels ? this.state.dataChannels : [],
                                                    hidden: Number(this.state.dataForm.channel_option) == 0 ? true : false,
                                                        multiple: true
                                                    },
                                                    { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m6 l6', label: 'Market option', name: 'market_option', radios: [{ value: "0", label: 'All markets' }, { value: "1", label: 'Custom markets' }, { value: "2", label: ' All markets, with these exceptions' }] },
                                                    {
                                                        type: 'select', size: 'col s12 m12 l12',
                                                        name: 'market_targeting', label: 'Markets',
                                                        options: this.state.dataMarket,
                                                        hidden: Number(this.state.dataForm.market_option) == 0 ? true : false,
                                                        onChange: (e) => this.onChangeBandera(e),
                                                        multiple: true
                                                    }
                                                ]
                                        },
                                        {
                                            row: [

                                                { type: 'radio', onChange: (e) => this.onChangeBandera(e), size: 'col s12 m6 l6', label: 'Geo Targeting Option', name: 'geo_targeting_option', radios: [{ value: "0", label: 'All countries' }, { value: "1", label: 'Custom countries' }, { value: "2", label: 'All countries, with these exceptions' }] },
                                                {
                                                    type: 'select', size: 'col s12 m12 l12',
                                                    name: 'geo_targeting_countries', label: 'Countries',
                                                    options: this.state.paisesXmercado,
                                                    hidden: Number(this.state.dataForm.geo_targeting_option) == 0 ? true : false,
                                                    multiple: true
                                                },
                                            ]
                                        },
                                        {
                                            row: [
                                                { type: 'radio', size: 'col s12 m6 l6', name: 'device_type_option', label: 'Divice Option', radios: [{ value: "0", label: 'All Channels' }, { value: "1", label: 'Only desktop divices' }, { value: "2", label: 'Only mobile divices' }] },
                                            ]
                                        },
                                        
                                    ]
                                    }
                                ]}
                            />

                         <div className="row">
                                <CleverAccordion
                                    id={'test-collapsible'}
                                    accordion={
                                        {
                                            head: this.state.head,
                                            body: [
                                                this.state.body
                                            ],
                                        }
                                    }

                                />
                            </div> 
                           

                      
                        </React.Fragment>
                        : <CleverLoading show={true} />}
                        
                    
                </Modal>
                <CleverLoading show={this.state.loader} />
            </React.Fragment>
        );
    }
}

export default PromotionGeneral;

