import React, { Component } from "react";
import PropTypes from 'prop-types';
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverRequest,MComponentes, CleverLoading,CleverForm,Modal,CleverButton} from "clever-component-library";
import Header from '../../../../components/header/Header';
import FrmContactInformation from './FrmContactInformation';
import moment from 'moment';
import FrmRoomsRates from './FrmRoomsRates';
import FrmVouchers from './FrmVouchers';
import FrmServices from './FrmServices';
import FrmComments from './FrmComments';
import FrmDates from '../FrmDates';
import FrmDetailPay from './FrmDetailPay';
import PaymentsInfo from '../PaymentsInfo';

export default class MainModify extends Component {

    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : false, 
            viewRoomsRates:false,
            viewFrmVouchers:false,
            dataGuarantee:{},
            dataPayments:{},
            countNights:0,
            countNigthDaily:0,
            isReembolso:false,
            messagePayment:"",
            isViewSectionVoucher: false,
            viewDataCard:false,
            viewDetailPay:false,
        }
    }

    componentDidMount(){
        // console.log('PROPS MODIFY => ',this.props);
        this.setState({load:true,
            idBookHotel: this.props.idBookHotel,
            propertyCode:this.props.propertyCode,
            idProperty: this.props.idProperty},()=>{
                if(this.state.idProperty !== 0) this.startPag();
            });
    }

    startPag(){        
        this.setState({
            propertyID: this.state.idProperty,
            viewRoomsRates:false,
            dataContactInfo:null,
            dataDatesCheckIn:"",
            dataDatesCheckOut:"",
            idsRooms: null,
            idsRates: null,
            dataVoucher: null,
            dataServices: null,
            dataComments: null,
            paymentOrig:null,
            isReembolso:false,
            messagePayment:"",
        },()=>{
            this.getGeneralResv(()=>{
                let {dataGeneralResv} = this.state;
                let date = new Date();
                let dateNow = moment(date).format('YYYY-MM-DD');
                let checkIn = dataGeneralResv.from_date !== undefined ? dataGeneralResv.from_date : dateNow;
                let checkOut = dataGeneralResv.to_date !== undefined ? dataGeneralResv.to_date : dateNow;                
                
                // this.getPaymentReservation();
                this.setState({dataDatesCheckIn:checkIn,dataDatesCheckOut:checkOut},
                    ()=>{
                        this.getDifDates("initial")
                    });
                this.getDataGeneralContact();
                this.getDataRooms(()=>{ 
                    this.getDataVouchers(()=>{this.setState({isViewSectionVoucher:true})});               
                    //Genera array de paxes
                    this.getCodesAgeRange(()=>{
                        this.getPaxesByRoom(()=>{
                            this.setState({viewRoomsRates:true});
                    });});                    
                });  
                
                this.getDataServices();
                this.getDataComments();
                this.setState({load:false});
            });
        });
    }

    getGeneralResv(functionGeneralResv=()=>{}){
        this.setState({load:true});
        let {idBookHotel}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }

                if (!error) {  
                    if (!response.Error) {
                        let dataGeneral = response.data;
                        let country = dataGeneral.country_code !== undefined ? dataGeneral.country_code :"";
                        let currency = dataGeneral.currency_code !== undefined ? dataGeneral.currency_code :"USD";
                        let pricing= {};                        
                        pricing.roomPrice= dataGeneral.total_gross !== undefined ? `${Number(dataGeneral.total_gross).toLocaleString('en')}` :  "";
                        pricing.discountPrice= dataGeneral.discount_amount !== undefined ? `${Number(dataGeneral.discount_amount).toLocaleString('en')}` :  "";
                        pricing.totalPrice= dataGeneral.total !== undefined ? `${Number(dataGeneral.total).toLocaleString('en')}` :  "";
                        let payment= {}; 
                        payment.type= "";
                        // payment.paymentBooking= pricing.totalPrice;
                        let dataRequestGeneralGets ={};
                        dataRequestGeneralGets.lang_code= dataGeneral.lang_code;
                        dataRequestGeneralGets.property_code= dataGeneral.property_code;
                        dataRequestGeneralGets.date_start= dataGeneral.from_date;
                        dataRequestGeneralGets.date_end= dataGeneral.to_date;
                        dataRequestGeneralGets.market= dataGeneral.market_code;
                        
                        this.setState({ dataGeneralResv:dataGeneral,
                                        valueCurrency:currency ,valueCountry:country,
                                        codeReservation: dataGeneral.code_reservation,
                                        requestGeneralGets:dataRequestGeneralGets  
                                    },
                                        functionGeneralResv);                
                    }else{
                        this.setState({dataGeneralResv:{},valueCurrency:"" ,valueCountry:"",load: false},functionGeneralResv);
                    }
                    
                }else{
                    this.setState({dataGeneralResv:{},valueCurrency:"" ,valueCountry:"",load: false},functionGeneralResv);
                }
            });
        }
    }

    getPaymentReservation(){
        this.setState({load:true});
        let {codeReservation,valueCurrency}= this.state;
        if(codeReservation !== ""){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/payments/total_transactions_code/${codeReservation}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (!response.Error) {
                        let payment = response.data;
                        let amountOrig= payment.total_transactions;
                        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
                        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
                        payment.PaymentOrigForm = numberFormat.format(amountOrig);
                        this.setState({ paymentOrig:payment});                
                    }else{
                        this.setState({paymentOrig:{}, load: false});
                    }
                    
                }else{
                    this.setState({paymentOrig:{}, load: false});
                }
            });
        }
    }

    getDataGeneralContact(){
        this.setState({load:true});
        let {idBookHotel,valueCurrency,valueCountry}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/customer/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (!response.Error) {
                        let dataContact = response.data;
                        let numberPhone = String(dataContact.phone_number);
                        let numOne = numberPhone.substring(0,3);
                        let numTwo = numberPhone.substring(numberPhone.length-7, numberPhone.length)
                        let number = `0000000${numTwo}`;
                        number = number.substring(number.length-7, number.length);
                        let numberLada = `000${numOne}`;
                        numberLada= numberLada.substring(numberLada.length-3, numberLada.length);
                        dataContact[`phoneContact`] = `000 ${numberLada} ${number} 0000`;
                        dataContact[`currency`] = valueCurrency;
                        dataContact[`country`] = valueCountry;   
                        dataContact[`diallingCodeText`] = dataContact.dialling_code;
                        let dataBirthDate =  `${dataContact.birthdate}`;  

                        this.setState({ dataContactInfo:dataContact, valueBirthDate:dataBirthDate});                
                    }else{
                        this.setState({dataContactInfo:{}, load: false});
                    }
                    
                }else{
                    this.setState({dataContactInfo:{}, load: false});
                }
            });
        }
    }

    getDataRooms(functionRooms=()=>{}){
        this.setState({load:true});
        let {idBookHotel}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/rooms/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (!response.Error) {
                        let dataRes = response.data !== undefined ? response.data : []; 
                        let rooms = [];
                        let rates = [];
                        dataRes.sort().map(dataRooms =>{
                            rooms.push(dataRooms.iddef_room_type);
                            rates.push(dataRooms.idop_rate_plan);
                            dataRooms.idop_rate_plan = String(dataRooms.idop_rate_plan);

                            if(dataRooms.paxes.length == 0){
                                dataRooms.paxes.push({ "estado":1, "total":1, "age_code": "adults"})
                            }
                        }); 
                        this.setState({dataRoomRates:dataRes,idsRooms:rooms,idsRates:rates},functionRooms);                
                    }else{
                        this.setState({dataRoomRates:[],idsRooms:[],idsRates:[], load: false},functionRooms);
                    }
                    
                }else{
                    this.setState({dataRoomRates:[],idsRooms:[],idsRates:[], load: false},functionRooms);
                }
            });
        }
    }

    getCodesAgeRange(functionAnge =()=>{}) {        
        this.setState({load:true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/age-range/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {    
                    let dataAnges =  response.data.filter(data=> data.estado == 1);
                    let list = [];
                    dataAnges.map(ages=>{
                        list.push({iddefAgeCode:ages.iddef_age_code, code:ages.code , ageRange:`(${ages.age_from}-${ages.age_to} years)`});
                    });
                    this.setState({ dataRangeAgeCode : list,load:false},functionAnge);    
                }else{
                    this.setState({ dataRangeAgeCode : [],load:false},functionAnge);    
                } 
            }else{
                this.setState({ dataRangeAgeCode : [],load:false},functionAnge);
            }
        }); 
    }  

    getPaxesByRoom(functionPaxes=()=>{}){
        let {dataRangeAgeCode,dataRoomRates}= this.state;
        let listInput= [];
        let listPaxes= [];
        dataRoomRates.sort().map((data,key)=>{
            let arrayPaxes= data.paxes;
            let inputs= [];
            let paxes= {}; 
            dataRangeAgeCode.sort().map((dataAge,keyAge)=>{
                inputs.push({type:'number',size:'col s12 m3 l3',name:`${dataAge.code}INDEX${key}`,label:`${dataAge.code} ${dataAge.ageRange}`, 
                            onChange:e=>this.onChangeRoomRates(e,"updatePaxes",key,`${dataAge.code}`,keyAge),
                            placeholder:`Insert ${dataAge.code}`});       
                let currentCodeAge = arrayPaxes.find(data => data.age_code == `${dataAge.code}`);
                let countPaxes = currentCodeAge !== undefined ? currentCodeAge.total:0;
                paxes[`${dataAge.code}`]= countPaxes;                   
            });
             
            listInput.push(inputs);
            listPaxes.push(paxes);
         });
        this.setState({inputsAges:listInput,paxesByRoom:listPaxes},functionPaxes);
    }

    getDataVouchers(functionGetVoucher=()=>{}){
        this.setState({load:true});
        let {idBookHotel,valueCurrency}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/promocode/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }

                if (!error) {
                    if (!response.Error) {
                        let dataRes = response.data; 
                        
                        if(dataRes.iddef_promo_code !== undefined){
                            let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
                            let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
                            let isText = dataRes.in_text;
                            let typeVoucher = dataRes.voucher_discount_type;
                            dataRes.value= isText == false ? 
                            typeVoucher != "Percent" ?`${numberFormat.format(dataRes.value)} ${valueCurrency}`  : `${dataRes.value} %`: "";
                            dataRes.iddef_promo_code = String(dataRes.iddef_promo_code);  
                        }                    
                        this.setState({ dataVoucher:dataRes},functionGetVoucher);                
                    }else{
                        this.setState({dataVoucher:{}, load: false},functionGetVoucher);
                    }
                }else{
                    this.setState({dataVoucher:{}, load: false},functionGetVoucher);
                }
            });
        }
    }

    getDataServices(){
        this.setState({load:true});
        let {idBookHotel}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/service/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (!response.Error) {
                        let dataRes = response.data; 

                        dataRes.map((data)=>{
                            data.iddef_service= String(data.iddef_service);
                            data.price= String(data.price);
                        });                        
                        this.setState({dataServices:dataRes});                
                    }else{
                        this.setState({dataServices:[], load: false});
                    }
                    
                }else{
                    this.setState({dataServices:[], load: false});
                }
            });
        }
    }

    getDataComments(){
        this.setState({load:true});
        let {idBookHotel}= this.state;
        if(idBookHotel !== 0){
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/comment/${idBookHotel}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {    
                    if (!response.Error) {
                        let data = response.data; 
                        let actData = data.length > 0 ? data.filter(data => data.estado == 1) : []; 
                        this.setState({ dataComments:actData});                
                    }else{
                        this.setState({dataComments:[], load: false});
                    }
                    
                }else{
                    this.setState({dataComments:[], load: false});
                }
            });
        }
    }

    validateDates=(e, type)=>{
        let dateInput = e.value.split('/');
        let valCheckInAll = new Date(dateInput[2],dateInput[1]-1,dateInput[0]);
        let valCheckIn = moment(valCheckInAll);
        let valCheckOutAll = new Date(dateInput[2],dateInput[1]-1,dateInput[0]);
        let valCheckOut = moment(valCheckOutAll);
        
        
        if(type == "frmDateCheckIn") {
            valCheckOut = this.refDateCheckOut.getValueDates() !=="" ? moment(this.refDateCheckOut.getValueDates()) : "";
            
            if(valCheckOut !== ""){
                if(valCheckIn == valCheckOut) difDates = 0;
                if(valCheckIn > valCheckOut){
                    MComponentes.toast('The Check-In Date is incorrect');
                }else{
                    this.setState({dataDatesCheckIn:valCheckIn,dataDatesCheckOut:valCheckOut},()=>{this.getDifDates("update")});
                }
            }else{
                MComponentes.toast('Select Check-Out Date');  
            }
        }

        if(type == "frmDateCheckOut") {
            valCheckIn = this.refDateCheckIn.getValueDates() !== "" ? moment(this.refDateCheckIn.getValueDates()) :"";
            
            if(valCheckIn !== ""){
                if(valCheckIn == valCheckOut) difDates = 0;
                if(valCheckOut < valCheckIn){
                    MComponentes.toast('The Check-Out Date is incorrect');
                }else{
                    this.setState({dataDatesCheckIn:valCheckIn,dataDatesCheckOut:valCheckOut},()=>{this.getDifDates("update")});
                }
            }else{
                MComponentes.toast('Select Check-In Date');            
            }
        }
    }

    getDifDates(type){
        let {dataDatesCheckIn,dataDatesCheckOut}= this.state;
        let dataDailys= {};
        let difDates = 0;   
        difDates = moment(dataDatesCheckOut).diff(moment(dataDatesCheckIn), 'days');
        dataDailys ={difDates:difDates,dateStart:dataDatesCheckIn,dateEnd:dataDatesCheckOut}
        
        switch(type){
            case "initial":
                    this.setState({dataDailyRates:dataDailys});
                break;
            case "update":
                    //Actualiza tabla de rates                  
                    let {requestGeneralGets}= this.state;
                    requestGeneralGets[`date_start`]= moment(dataDatesCheckIn).format("YYYY-MM-DD");
                    requestGeneralGets[`date_end`]= moment(dataDatesCheckOut).format("YYYY-MM-DD");
                    this.setState({dataDailyRates:dataDailys});
                    //Actualiza data generales y se recargan combos de services
                    this.refServices.updateServices('requestGeneralGets',requestGeneralGets);  
                    this.referenceVoucher.updateVoucher('requestGeneralGets',requestGeneralGets); 
                    //Actualiza data generales y se recargan combos de rooms 
                    this.refRoomRates.updateRoomRates("dates",dataDailys,requestGeneralGets,"","","");                    
                break;
            default:
                break;
        }
        
        this.setState({countNights:difDates});
    }

    onChangeRoomRates=(e,type,indexFrm,valCode,valSubIndex)=>{
        let {dataRoomRates,idsRooms,idsRates}= this.state; 
        switch(type){
            case 'updatePaxes':     
                    let valPaxCurrent = e.value !== "" ? parseInt(e.value):0;               
                    this.state.paxesByRoom[indexFrm][valCode] = valPaxCurrent;
                    //Si por alguna razon el objeto de pax en los datos del rate por habitacion no existe,se debe crear
                    this.state.dataRoomRates[indexFrm].paxes[valSubIndex] !== undefined ?
                        this.state.dataRoomRates[indexFrm].paxes[valSubIndex].total = valPaxCurrent
                    :this.state.dataRoomRates[indexFrm].paxes[valSubIndex]={
                        "estado":1, "total":valPaxCurrent, "age_code": valCode
                    };
                    this.refRoomRates.updateRoomRates("pax","paxesByRoom",this.state.paxesByRoom,indexFrm,"","");    
                    this.refServices.updateServices("paxesByRoom",this.state.paxesByRoom);        
                break;
            case 'inputRoom':   
                    let idRoom = e.value !== undefined ? e.value : 0;
                    let codeRoom = valCode.find(room => room.iddef_room_type_category == parseInt(idRoom));
                    dataRoomRates[indexFrm].room = e.value;
                    dataRoomRates[indexFrm].iddef_room_type = e.value !== "" ? parseInt(e.value) : 0;
                    dataRoomRates[indexFrm].room_code = codeRoom !== undefined ? codeRoom.room_code:"";
                    idsRooms[indexFrm]=parseInt(e.value); 
                    this.referenceVoucher.updateVoucher('idsRooms',idsRooms); 
                    this.refRoomRates.updateRoomRates("roomRate","dataRoomRates",this.state.dataRoomRates,indexFrm,"","");   
                break;
            case 'inputRates':                 
                    dataRoomRates[indexFrm].idop_rate_plan = e.value !== "" ? parseInt(e.value) : 0;
                    idsRates[indexFrm]=parseInt(e.value); 
                    this.referenceVoucher.updateVoucher('idsRates',idsRates); 
                    this.refRoomRates.updateRoomRates("roomRate","dataRoomRates",this.state.dataRoomRates,indexFrm,"",""); 
                break;
            case 'updateTotalRoom':
                    let splitName = indexFrm !== undefined && indexFrm !== "" ? indexFrm.split('divDaily') :"";
                    let valueToPay = splitName !== "" ? valCode !== "" ? parseFloat(valCode) :0 :0;
                    //Solamente si existe forma de obtener el indice
                    if(splitName !== ""){
                        let indexCurrent = splitName[1];   
                        this.refRoomRates.updateRoomRates("amountToPay",valueToPay,"",indexCurrent,"","");                   
                    }
                break;
            default:
                break;
        }
    }

    addFrm=(e,type)=>{
        switch(type){
            case 'roomRates':
                let {dataRoomRates,idsRooms,idsRates,dataRangeAgeCode}= this.state;
                let paxesCurrent= []; 
                dataRangeAgeCode.sort().map((dataAge)=>{                    
                    paxesCurrent.push({age_code:dataAge.code,estado:1,total:dataAge.code !== "adults" ? 0 : 1})
                });

                let currentIndexRooms= dataRoomRates.length;
                dataRoomRates[currentIndexRooms]= {
                        idbook_hotel_room:"0",
                        iddef_room_type:"0",
                        idop_rate_plan:"0",
                        taxPolicy:"",
                        cancellationPolicy:"",
                        bookingGuarante:"",
                        viewDaily:false,
                        paxes:paxesCurrent
                    }
                idsRooms[currentIndexRooms]= 0;
                idsRates[currentIndexRooms]= 0;
                this.getPaxesByRoom(()=>{
                    this.refRoomRates.updateRoomRates("addFrmRoom","paxesByRoom",this.state.paxesByRoom,currentIndexRooms,'inputsAges',this.state.inputsAges);
                });          
                break;
            default:
                break;
        }
    }
    
    getDataFrms=(type,listDataRates)=>{       
        let {dataRoomRates,requestGeneralGets,valueCurrency,idBookHotel,isViewSectionVoucher}= this.state;
        let requestTotales={};
        requestTotales.hotel= requestGeneralGets.property_code;
        requestTotales.market= requestGeneralGets.market;
        requestTotales.date_start= requestGeneralGets.date_start;
        requestTotales.date_end= requestGeneralGets.date_end;
        requestTotales.lang_code= requestGeneralGets.lang_code;
        requestTotales.currency= valueCurrency;

        requestTotales.promocode= isViewSectionVoucher == true ? this.referenceVoucher !== undefined ? parseInt(this.referenceVoucher.getValueVoucher("id")) : 0 :0;
        requestTotales.service_amount= this.refServices !== undefined ? this.refServices.getAmountServices() :0;
        requestTotales.idbook_hotel = idBookHotel;

        let valRooms= [];
        dataRoomRates.sort().map((data,key)=>{
            let room = {};
            let paxes = {};
            
            data.paxes.map(valuePaxes=>{
                paxes[valuePaxes.age_code]= valuePaxes.total;
            });
            
            room.form_reference= `divDaily${key}`;
            room.iddef_room_type= parseInt(data.iddef_room_type);
            room.idop_rate_plan= parseInt(data.idop_rate_plan);
            room.idbook_hotel_room= parseInt(data.idbook_hotel_room);
            room.policies= {
                "cancel": data.iddef_police_cancelation !== undefined ? data.iddef_police_cancelation : 0,
                "booking": data.iddef_police_guarantee !== undefined ? data.iddef_police_guarantee :0,
                "tax": data.iddef_police_tax !== undefined ? data.iddef_police_tax : 0
            };
            room.pax= paxes; 

            let rates=[];
            let valDataRates = type == 'roomRate' ? listDataRates : this.refRoomRates !== undefined ? this.refRoomRates.getValueDailyRates():[];
            let dataDates = valDataRates[key] !== undefined ? valDataRates[key] : [];
            dataDates.map(dates=>{
                let val={};
                val.amount= dates.amount!=="" ? parseInt(dates.amount):0;
                val.efective_date= dates.efective_date;
                rates.push(val);
            })

            room.rates= rates;
            if (rates.length > 0) valRooms.push(room);
        });
        requestTotales.rooms= valRooms;
        this.setState({dataPricing:null,load:true},()=>{
            this.getTotales(requestTotales);
        });        
    }

    getTotales(requestTotales){        
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/rates/quote`,requestTotales, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }

            if (!error) {                
                if (!response.Error) {
                    let dataTotales= response.data;
                    let dataRooms = dataTotales.rates !== undefined ? dataTotales.rates :[];
                    let pricing = {};
                    let dataRoom = [];
                    pricing.roomPrice = dataTotales.subtotal; 
                    pricing.totalPrice= dataTotales.total;
                    pricing.discountPrice= dataTotales.descount;
                    pricing.totalpaidResv = dataTotales.total_amount_paid;
                    pricing.amountRefund = dataTotales.total_amount_refund;
                    dataRooms.map(rooms=>{
                        let data = {};
                        let codeRoom = this.state.dataRoomRates.find(dataRoom => parseInt(dataRoom.idbook_hotel_room) == parseInt(rooms.idbook_hotel_room));
                        data.roomCode = codeRoom !== undefined ? codeRoom.room_code : "";
                        data.totalByRoom = rooms.total_room;
                        data.discountRoom = rooms.discount_total_room;
                        data.totalPaid = rooms.total_paid;
                        data.totalToPay = rooms.total_to_pay;
                        data.nameFrm = rooms.form_reference;
                        data.dailyRatesAPI = rooms.rates;
                        dataRoom.push(data);
                    })
                    pricing.rooms = dataRoom;
                    this.setState({dataPricing: pricing},()=>{
                        this.refRoomRates.valueDataQuoteRates(this.state.dataPricing);
                        this.validationAmountPay();                        
                    })     
                }else{
                    console.log('error', response.Error);
                    this.setState({dataPricing:{},dataPayments:{},load: false});
                }
                
            }else{
                console.log('error', error);
                this.setState({dataPricing:{},dataPayments:{},load: false});
            }
        });   
    }

    validationAmountPay(){
        let {dataPricing,valueCurrency} = this.state;
        let amountRefund = dataPricing.amountRefund !== undefined ? parseFloat(dataPricing.amountRefund) : 0.0;
        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
        let dataRefund = {
                            totalResv:`${numberFormat.format(dataPricing.totalPrice)} ${valueCurrency}`,
                            totalPaid:`${numberFormat.format(dataPricing.totalpaidResv)} ${valueCurrency}`,
                            totalRefund:`${numberFormat.format(dataPricing.amountRefund)} ${valueCurrency}`
                        }
        if(amountRefund > 0){
            this.setState({isReembolso:true,dataRefund:dataRefund,viewDetailPay:false},()=>{this.setState({load: false});});
        }else{
            this.setState({isReembolso:false,dataRefund:dataRefund,viewDetailPay:true, load: false});
        }
    }

    SaveReservation(e){
        this.setState({load:true});
        let {valueCurrency,requestGeneralGets,isReembolso,dataPricing,viewDataCard}= this.state;
        
        let requestReservation= {}
        let dataCheckIn = this.refDateCheckIn.getValueDates() !== "" ? moment(this.refDateCheckIn.getValueDates()).format("YYYY-MM-DD") :"";
        let dataCheckOut = this.refDateCheckOut.getValueDates() !=="" ? moment(this.refDateCheckOut.getValueDates()).format("YYYY-MM-DD") : "";
        let dataContact = this.refContactGeneral.getDataContactSave();
        let dataComments = this.referenceComments.getValueComments();
        let dataServices = this.refServices.getValueServices();
        let dataRooms = this.refRoomRates.getValueRooms();
        let totalToPay = dataPricing !== undefined ? dataPricing.totalToPay !== undefined ? dataPricing.totalToPay :0:0;
        let dataCard= {"error":false};
        let valueToPay = {"error":false}
        //validar si hay diferencia de pago para agregar nodo de datos de tarjeta ()
        if(viewDataCard){
            dataCard = this.referenceCardPay.getDataCard();  
        } 
        //Validar si existe un monto a pagar este visible y lleno los datos de la tarjeta
        if (totalToPay > 0 && !viewDataCard){
            MComponentes.toast("Complete the card data");
            valueToPay = {"error":true}
            this.setState({viewDataCard:true})
        }

        if(!dataContact.error && !dataComments.error && !dataServices.error && !dataRooms.error && !dataCard.error && !valueToPay.error){
            requestReservation.only_save= (viewDataCard || isReembolso ) ? false : true;
            requestReservation.external_payment= false;
            requestReservation.currency_code= valueCurrency;
            requestReservation.is_refund= isReembolso;
            requestReservation.amound_refund= isReembolso == true ? dataPricing.amountRefund !== undefined ? dataPricing.amountRefund : 0.0 : 0.0
            requestReservation.total = dataPricing.totalPrice !== undefined ? dataPricing.totalPrice :0.0;            
            requestReservation.customer= {
                "address": dataContact.address,
                "birthdate": dataContact.birthdate,
                "company": dataContact.company,
                "email": dataContact.email,
                "first_name": dataContact.first_name,
                "last_name": dataContact.last_name,
                "dialling_code": dataContact.dialling_code,
                "phone_number": dataContact.phone_number,
                "title": dataContact.title,
            }; 
            requestReservation.from_date = dataCheckIn;
            requestReservation.to_date = dataCheckOut;
            requestReservation.iddef_channel = 1;
            requestReservation.lang_code= requestGeneralGets.lang_code;
            requestReservation.market_code= requestGeneralGets.market;
            requestReservation.promo_code= this.referenceVoucher.getValueVoucher("code");
            requestReservation.property_code= requestGeneralGets.property_code;
            requestReservation.rooms= dataRooms.rooms;
            requestReservation.services= dataServices.services;
            requestReservation.comments= dataComments.comments;

            if(viewDataCard){
                let dataPay = dataCard.data;
                requestReservation.payment = {
                    "card_number": dataPay.card_number,
                    "holder_first_name": dataPay.firstName,
                    "holder_last_name": dataPay.last_name,
                    "exp_month": dataPay.expMM,
                    "exp_year": dataPay.expYY,
                    "cvv": dataPay.cvv
                };
            }
            this.updateDataReservation(requestReservation);
        }else{

            this.setState({load:false});
        }
    }

    updateDataReservation(requestReservation){
        let {codeReservation}= this.state;
        console.log(JSON.stringify(requestReservation));
        CleverRequest.putJSON(CleverConfig.getApiUrl('bengine')+`/api/booking/change/${codeReservation}`,requestReservation, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                 
                if (!response.Error) { 
                    let {idBookHotel}= this.state;
                    let idBH= idBookHotel;
                    let dataResponse = response.data;
                    let idBookingCurrent = dataResponse.idbook_hotel;    
                    let paymentType = dataResponse.transaction_type;
                    let paymentAmount = dataResponse.difference;    
                    let messagePay = "";
                    if(idBookingCurrent !== 0) idBH = idBookingCurrent;
                    switch(paymentType){
                        // case 1: //Pago
                        //         messagePay= `The difference to pay is  ${paymentAmount}`
                        //     break;
                        case 2: //Reembolso
                                messagePay= `Apply manual refund. Amount: ${paymentAmount}`;
                            break;
                        default:
                            break;
                    }
                    this.setState({idBookHotel:idBH,messagePayment:messagePay},()=>{
                        if(paymentType == 2){
                            this.setState({load: false},()=> {this.refConfirmPayment.getInstance().open();});
                        }else{
                            this.startPag();
                        }
                    }); 
                    
                    MComponentes.toast(`Reservation ${codeReservation} has been modified succesfully`);

                }else{
                    let messageType = typeof response.Msg;
                    MComponentes.toast(`It was not saved the Reservation ${codeReservation}`);                    
                    if(messageType === 'string'){
                        let {idBookHotel}= this.state;
                        let idBH= idBookHotel;
                        let splitMessageError = response.Msg.split('|');
                        let messageError = splitMessageError[0];
                        let idBookingCurrent = parseInt(splitMessageError[1]);
                        
                        if(idBookingCurrent !== 0) idBH = idBookingCurrent;
                        messageError !== undefined ? messageError !== "" ? MComponentes.toast(`${messageError}`):null :null;
                        this.setState({idBookHotel:idBH}/*,()=>{this.startPag();}*/);                        
                    }
                    this.setState({load: false});
                }
                
            }else{
                console.log('error', error);
                this.setState({load: false});
            }
        });   
    }

    confirmMsgPayment=()=>{
        this.startPag();
    }

    statusViewVoucher=(statusView)=>{
        this.setState({isViewSectionVoucher:!statusView})
    }

    activatePay=()=>{
        let {dataPricing}=this.state;
        let valPayByRoom = dataPricing !== undefined ? dataPricing.totalToPay !== undefined ? dataPricing.totalToPay :0:0;
        if(valPayByRoom == 0.00) valPayByRoom = 0; 
        let valueView = valPayByRoom !== 0 ? true : false;
        this.setState({viewDataCard:valueView});
    }

    validateViewFrmCard=()=>{
        let {dataPricing,viewDataCard}=this.state;
        let valPayByRoom = dataPricing !== undefined ? dataPricing.totalToPay !== undefined ? dataPricing.totalToPay :0:0;
        if(valPayByRoom == 0.00) valPayByRoom = 0; 
        if(viewDataCard == true){
            if(valPayByRoom == 0){
                this.setState({viewDataCard:false});
            }
        }
    }

    render(){  
        let {load,codeReservation,valueCurrency,dataContactInfo,valueBirthDate,viewDataCard,viewDetailPay,
            isReembolso,dataRefund,messagePayment,isViewSectionVoucher,
            viewRoomsRates,dataRoomRates,inputsAges,paxesByRoom,requestGeneralGets,dataDailyRates,
            dataVoucher,idsRooms,idsRates,dataComments,dataServices,dataPricing,countNights,
            dataStayDates,dataDatesCheckIn,dataDatesCheckOut,countNigthDaily,propertyID}= this.state;
        codeReservation = codeReservation == undefined ? "" : codeReservation;
        
        return(
            <div className="row">
                <CleverLoading show={load}/>                
                <Header 
                    title={`Reservation   ${codeReservation}`} 
                        controls={[
                        { control: 
                            <div className="row">
                                {codeReservation !== "" ?
                                    <div className='col s6 m6 l6'>
                                        <button type='button' 
                                            onClick={(e) => this.SaveReservation(e)} 
                                            id="btnSaveModifyReservation" className='btn'>SAVE
                                        </button>
                                    </div>
                                :null}
                                <div className='col s6 m6 l6'>
                                    <button type='button' 
                                        onClick={(e) => this.props.onClose(e,'close','')} 
                                        id="btnCloseModifyReservation" className='btn'>CLOSE
                                    </button>
                                </div>
                            </div> 
                    }]}
                />
                {codeReservation !== "" ?
                <div>                    
                    <div className="row"></div>
                    <div className="col s12 m12 l12">
                        <div className="row">
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>CONTACT INFORMATION</legend>
                                    {dataContactInfo && valueBirthDate?
                                        <FrmContactInformation
                                            dataContactInfo= {dataContactInfo}
                                            valueBirthDate= {valueBirthDate}
                                            onRef= {ref => this.refContactGeneral = ref}
                                        />
                                    :null}
                                </fieldset> 
                            </div>
                            <div className="row"></div>
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>STAY DATES</legend>
                                    {dataDatesCheckIn && dataDatesCheckOut?
                                        <CleverForm
                                            ref={ref => this.refModifyStayDates = ref}
                                                id={'modifyStayDates'}
                                                data={dataStayDates}
                                                forms={[
                                                        {inputs: [
                                                                {row:[
                                                                    {type: 'component', 
                                                                        component: () => {
                                                                            return (
                                                                                <FrmDates 
                                                                                    nameDate = "Check-In"
                                                                                    onRef = {ref => this.refDateCheckIn = ref}
                                                                                    idFrm ={"frmDateCheckIn"}
                                                                                    sizeContent="col s12 m4 l4"
                                                                                    changeDate={this.validateDates}
                                                                                    dateValue = {`${dataDatesCheckIn}`}
                                                                                />
                                                                            )
                                                                        }
                                                                    },
                                                                    {type: 'component', 
                                                                            component: () => {
                                                                                return (
                                                                                    <FrmDates 
                                                                                        nameDate = "Check-Out"
                                                                                        onRef = {ref => this.refDateCheckOut = ref}
                                                                                        idFrm ={"frmDateCheckOut"}
                                                                                        sizeContent="col s12 m4 l4"
                                                                                        dateValue ={`${dataDatesCheckOut}`}
                                                                                        changeDate={this.validateDates}
                                                                                    />
                                                                                )
                                                                            }
                                                                    },
                                                                ]},   
                                                                {row:[
                                                                    {type: 'component', 
                                                                        component: () => {
                                                                            return (
                                                                                <label style={{fontSize: '14px', fontWeight:"bold"}}>{`Length of Stay: ${countNights} nights`}</label>
                                                                            )
                                                                        }
                                                                    },
                                                                ]},                                                                                    
                                                            ]
                                                        }
                                                ]}
                                        /> 
                                    :null} 
                                </fieldset> 
                            </div>                        
                            <div className="row"></div>
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>ROOMS AND RATES</legend>
                                    {viewRoomsRates == true ?
                                        <FrmRoomsRates 
                                            onRef= {ref => this.refRoomRates = ref}
                                            onChangeSelect= {this.onChangeRoomRates}
                                            onAddFrm= {this.addFrm}
                                            countNigthDaily={countNigthDaily}
                                            propertyID={propertyID}
                                            dataRoomRates= {dataRoomRates}
                                            valueCurrency= {valueCurrency}
                                            dataDailyRates= {dataDailyRates}
                                            requestGeneralGets= {requestGeneralGets}
                                            inputsAges= {inputsAges}
                                            paxesByRoom= {paxesByRoom}
                                            getDataFrms= {this.getDataFrms}
                                            statusViewVoucher= {this.statusViewVoucher}
                                        />
                                    :null}
                                </fieldset> 
                            </div>
                            <div className="row"></div>
                            {isViewSectionVoucher == true?
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>VOUCHER</legend>                                
                                    <div className='row'>
                                        {dataVoucher ?
                                            <FrmVouchers 
                                                onRef={ref=> this.referenceVoucher = ref}
                                                requestGeneralGets= {requestGeneralGets}
                                                dataVoucher={dataVoucher}
                                                valueCurrency= {valueCurrency}
                                                idsRooms= {idsRooms}                                            
                                                idsRates= {idsRates} 
                                                getDataFrms= {this.getDataFrms} 
                                            />
                                        :null}
                                    </div>
                                </fieldset>                             
                            </div>
                            :null}
                            <div className="row"></div>
                            <div className="col s12 m6 l6">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>SERVICES</legend>
                                    {dataServices ?
                                        <FrmServices 
                                            onRef= {ref => this.refServices = ref}
                                            listFormsServices= {dataServices}
                                            valueCurrency= {valueCurrency}
                                            requestGeneralGets= {requestGeneralGets}
                                            paxesByRoom= {paxesByRoom}
                                            getDataFrms= {this.getDataFrms}
                                        />
                                    :null}
                                </fieldset>
                            </div>
                            <div className="col s12 m6 l6">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}>COMMENTS</legend>
                                    {dataComments ?
                                        <FrmComments 
                                            onRef={ref=> this.referenceComments = ref}
                                            dataComments={dataComments}
                                        />
                                    :null}
                                </fieldset>
                            </div> 
                            <div className="row"></div>
                            {viewDetailPay == true ?
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}> Detail Payments </legend>
                                    {dataPricing ? 
                                        <>
                                            <FrmDetailPay 
                                                dataPaid= {dataPricing}
                                                valueCurrency = {valueCurrency}
                                                validateViewFrmCard={this.validateViewFrmCard}
                                                onChangeRoomRates={this.onChangeRoomRates}
                                            />
                                            <div className='row'>
                                                <CleverButton
                                                 size={'col s12 m2 l2 offset-m10 offset-l10'} icon={'payment'} label={'PAY'} fullSize={true} onClick={this.activatePay}
                                                />
                                            </div>
                                        </>
                                        
                                    :   null}
                                </fieldset>
                            </div>
                            :null}
                            <div className="row"></div>
                            {viewDataCard == true  ? 
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                <legend style={{color:"#01536d", fontWeight:"bold"}}> PAYMENT </legend>   
                                <PaymentsInfo 
                                    onRef= {ref => this.referenceCardPay =ref}
                                />                                                           
                                </fieldset>
                            </div> 
                            :null} 
                            <div className="row"></div>
                            {isReembolso == true ?
                            <div className="col s12 m12 l12">
                                <fieldset style={{padding:'20px', paddingTop:'10px', paddingBottom:'1px', borderRadius:'3px', border:'1px solid #01536d'}}>
                                    <legend style={{color:"#01536d", fontWeight:"bold"}}> Detail Refund </legend>
                                        {dataRefund ? 
                                            <>
                                                <table className='clever-table responsive-table striped bordered' style={{width:"100%"}}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{textAlign:"center"}}>Total amount Reservation</th>
                                                            <th style={{textAlign:"center"}}>Amount paid</th>
                                                            <th style={{textAlign:"center"}}>Amount Refund</th>
                                                        </tr>                                                
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{textAlign:"center"}}>{dataRefund.totalResv}</td>
                                                            <td style={{textAlign:"center"}}>{dataRefund.totalPaid}</td>
                                                            <td style={{textAlign:"center", fontSize:"14px", color:"black" , fontWeight:"bold"}}>{dataRefund.totalRefund}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div className="row"></div>
                                            </>
                                        :null}
                                </fieldset>
                            </div>
                            :null}                          
                        </div>                    
                    </div>
                    <div className="row"></div>
                </div>
                :
                <div>
                    The reservation not editable
                </div>
                }
                <Modal
                    idModal={""}
                    modalClass={'alert small'}
                    title={{text:"Payment Reservation"}}
                    footerClass= 'text-center'
                    defaultButton={
                                    {
                                        buttonClass : "btn-warning hollow",
                                        i18n        : ("{{'OK'}}"),
                                        text        : ("OK"),
                                        title       : ("OK"),
                                        click       : () => this.confirmMsgPayment()
                                    }
                                }
                    autoOpen = {false}
                    paddingContent=""
                    onRef={modal => this.refConfirmPayment = modal}
                >
                    {<h5 className="text-center">{messagePayment}</h5> }
                </Modal>
            </div>
        );
    }
}

MainModify.propTypes = {
    onRef: PropTypes.func,
    idBookHotel: PropTypes.number,
    propertyCode: PropTypes.string,
    idProperty: PropTypes.number
}

MainModify.defaultProps = {
    onClose: () => {},
    idBookHotel: 0,
    propertyCode:"",
    idProperty:0
}