import React, { Component } from "react";
import PropTypes from 'prop-types';
import CleverConfig from "../../../../../../config/CleverConfig";
import {MComponentes, CleverRequest, CleverLoading,CleverForm, } from "clever-component-library";
import moment from 'moment';

export default class FrmRoomsRates extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        

        this.state = {
            load : false, 
            listRooms:[],
            listRates:[],
            listDataRates:[],
            roomsAll:[],
            ratesFixByRoom: [],
        }
    }

    componentDidMount(){
        this.setState({load:true});
        this.setState({dataRoomRates:this.props.dataRoomRates,
                        countNigthDaily: this.props.countNigthDaily,
                        propertyID: this.props.propertyID,
                        valueCurrency: this.props.valueCurrency,
                        dataDailyRates:this.props.dataDailyRates,
                        requestGeneralGets: this.props.requestGeneralGets,
                        inputsAges: this.props.inputsAges,
                        paxesByRoom: this.props.paxesByRoom
            },
            ()=>{
                //consulta y llena informacion de combo de rooms
                this.setState({listRooms:[],listRates:[],listDataRates:[]},()=>{
                    this.generateContent("start");     
                });                             
            }
        );
    }

    generateContent(type){
        let {dataRoomRates} = this.state;
         //Genera datos de input por cada formulario
        dataRoomRates.sort().forEach((data,key)=>{
            //Genera data Input Room;
            this.setState({roomCurrent:[],roomsAll:[],ratesCurrent:[],currencyPrices:[], currencyPolicies:{}},()=>{   
                this.getDataInputs(key,type,"modCurrent");
            });
        }); 
    }

    getDataInputs(keyFrm,type){      
        let data = this.state.dataRoomRates[keyFrm];
        this.getInputRooms(keyFrm,()=>{
            this.state.listRooms[keyFrm]= this.state.roomCurrent;      
            this.valueDataInputs('room',keyFrm,this.state.roomCurrent);      
            //Si se tiene seleccionado un room se realizan consultas de rates sino se asigna vacio
            if(parseInt(data.iddef_room_type) !== 0){
                this.getInputRates(keyFrm,()=>{
                    this.state.listRates[keyFrm] = this.state.ratesCurrent;                    
                    this.setValuesFrm(data,keyFrm,type);                      
                    this.valueDataInputs('rate',keyFrm, this.state.ratesCurrent);                        
                });
            }else{
                    this.state.listRates[keyFrm] = [];
                    this.setValuesFrm(data,keyFrm,type);
            }
            
            
        });
    }
    
    valueDataInputs(nameInput,keyFrm,dataInputCurrent){
        let {dataRoomRates}=this.state;
        switch(nameInput){
            case "room":
                    let idRoomSelected = dataRoomRates[keyFrm].iddef_room_type;
                    let existRoom = dataInputCurrent.find(rooms => rooms.value == String(idRoomSelected));
                    if(existRoom == undefined){
                        dataRoomRates[keyFrm].room = "";
                        dataRoomRates[keyFrm].iddef_room_type = 0;
                    }
                break;
            case "rate":
                    let idRateSelected = dataRoomRates[keyFrm].idop_rate_plan;
                    let existRate = dataInputCurrent.find(rates => rates.value == String(idRateSelected));
                    if(existRate == undefined){
                        dataRoomRates[keyFrm].idop_rate_plan = "";
                    }
                break
            default:
                break;
        }
    }

    setValuesFrm(data,keyFrm,type){
        if(parseInt(data.iddef_room_type) !== 0 && parseInt(data.idop_rate_plan) !== 0){

            switch (type){
                case "start":
                        let idRoom = data.idbook_hotel_room !== "" && data.idbook_hotel_room !== undefined 
                                    ? parseInt(data.idbook_hotel_room) : "";
                            //Si no existe un ID de habitacion llenar conforma a los datos dinamicos de rate
                            if(idRoom !== ""){
                                this.getDailyByRoom(idRoom,()=>{
                                    let {dataRoomRates} = this.state;                    
                                    if(this.state.currencyPolicies !== undefined){
                                        let {currencyPolicies} = this.state;
                                        
                                        if(currencyPolicies.cancel_policy_detail !== undefined && currencyPolicies.cancel_policy_detail !== null){
                                            dataRoomRates[keyFrm].cancellationPolicy =  currencyPolicies.cancel_policy_detail.policy_code !== undefined ? currencyPolicies.cancel_policy_detail.policy_code: "";
                                            dataRoomRates[keyFrm].iddef_police_cancelation = currencyPolicies.cancel_policy_detail.id_policy !== undefined ? currencyPolicies.cancel_policy_detail.id_policy: 0;
                                        }else{
                                            dataRoomRates[keyFrm].cancellationPolicy = "";
                                            dataRoomRates[keyFrm].iddef_police_cancelation= 0;
                                        }
                                        
                                        if(currencyPolicies.guarantee_policy !== undefined && currencyPolicies.guarantee_policy !== null){
                                            dataRoomRates[keyFrm].bookingGuarante =  currencyPolicies.guarantee_policy.policy_code !== undefined ? currencyPolicies.guarantee_policy.policy_code: "";
                                            dataRoomRates[keyFrm].iddef_police_guarantee = currencyPolicies.guarantee_policy.id_policy !== undefined ? currencyPolicies.guarantee_policy.id_policy: 0;
                                        }else{
                                            dataRoomRates[keyFrm].bookingGuarante= "";
                                            dataRoomRates[keyFrm].iddef_police_guarantee = 0;
                                        }
                                        
                                        if(currencyPolicies.tax_policy !== undefined && currencyPolicies.tax_policy !== null){
                                            dataRoomRates[keyFrm].taxPolicy=  currencyPolicies.tax_policy.policy_code !== undefined ? currencyPolicies.tax_policy.policy_code : "";    
                                            dataRoomRates[keyFrm].iddef_police_tax = currencyPolicies.tax_policy.id_policy !== undefined ? currencyPolicies.tax_policy.id_policy: 0;
                                        }else{
                                            dataRoomRates[keyFrm].taxPolicy= "";
                                            dataRoomRates[keyFrm].iddef_police_tax = 0;
                                        }
                                        
                                    }else{                                
                                        dataRoomRates[keyFrm].cancellationPolicy= "";
                                        dataRoomRates[keyFrm].iddef_police_cancelation= 0;
                                        dataRoomRates[keyFrm].bookingGuarante= ""; 
                                        dataRoomRates[keyFrm].iddef_police_guarantee = 0; 
                                        dataRoomRates[keyFrm].taxPolicy == "";
                                        dataRoomRates[keyFrm].iddef_police_tax = 0;
                                    }
                                    this.state.listDataRates[keyFrm]= this.state.currencyPrices;
                                    this.state.ratesFixByRoom[keyFrm]= false;
                                    
                                    this.createTblDailyRates();   
                                });
                            }else{
                                this.setValuesFrm(data,keyFrm,"modCurrent");
                            }
                    break;
                case "modCurrent":
                        this.setDataRates(keyFrm,()=>{  
                            let {dataRoomRates} = this.state;                    
                            if(this.state.currencyPolicies !== undefined){
                                let {currencyPolicies} = this.state;
                                
                                if(currencyPolicies.cancel_policy_detail !== undefined && currencyPolicies.cancel_policy_detail !== null){
                                    dataRoomRates[keyFrm].cancellationPolicy =  currencyPolicies.cancel_policy_detail.policy_code !== undefined ? currencyPolicies.cancel_policy_detail.policy_code: "";
                                    dataRoomRates[keyFrm].iddef_police_cancelation = currencyPolicies.cancel_policy_detail.id_policy !== undefined ? currencyPolicies.cancel_policy_detail.id_policy: 0;
                                }else{
                                    dataRoomRates[keyFrm].cancellationPolicy = "";
                                    dataRoomRates[keyFrm].iddef_police_cancelation= 0;
                                }
                                
                                if(currencyPolicies.guarantee_policy !== undefined && currencyPolicies.guarantee_policy !== null){
                                    dataRoomRates[keyFrm].bookingGuarante =  currencyPolicies.guarantee_policy.policy_code !== undefined ? currencyPolicies.guarantee_policy.policy_code: "";
                                    dataRoomRates[keyFrm].iddef_police_guarantee = currencyPolicies.guarantee_policy.id_policy !== undefined ? currencyPolicies.guarantee_policy.id_policy: 0;
                                }else{
                                    dataRoomRates[keyFrm].bookingGuarante= "";
                                    dataRoomRates[keyFrm].iddef_police_guarantee = 0;
                                }
                                
                                if(currencyPolicies.tax_policy !== undefined && currencyPolicies.tax_policy !== null){
                                    dataRoomRates[keyFrm].taxPolicy=  currencyPolicies.tax_policy.policy_code !== undefined ? currencyPolicies.tax_policy.policy_code : "";    
                                    dataRoomRates[keyFrm].iddef_police_tax = currencyPolicies.tax_policy.id_policy !== undefined ? currencyPolicies.tax_policy.id_policy: 0;
                                }else{
                                    dataRoomRates[keyFrm].taxPolicy= "";
                                    dataRoomRates[keyFrm].iddef_police_tax = 0;
                                }
                                
                            }else{                                
                                dataRoomRates[keyFrm].cancellationPolicy= "";
                                dataRoomRates[keyFrm].iddef_police_cancelation= 0;
                                dataRoomRates[keyFrm].bookingGuarante= ""; 
                                dataRoomRates[keyFrm].iddef_police_guarantee = 0; 
                                dataRoomRates[keyFrm].taxPolicy == "";
                                dataRoomRates[keyFrm].iddef_police_tax = 0;
                            }
                            this.state.listDataRates[keyFrm]= this.state.currencyPrices;
                            this.state.ratesFixByRoom[keyFrm]= false;
                            
                            this.createTblDailyRates();
                        });
                    break;
                default:
                    break;
            }

        }else{
            this.state.dataRoomRates[keyFrm].cancellationPolicy= "";
            this.state.dataRoomRates[keyFrm].bookingGuarante= "";  
            this.state.dataRoomRates[keyFrm].taxPolicy == "";
            this.state.listDataRates[keyFrm]=[];
            this.state.ratesFixByRoom[keyFrm]= false;
            this.createTblDailyRates();
        }
    }

    //Obteniene daily rates y politicas por id de habitacion
    getDailyByRoom(idRoom,funcGetDaily=()=>{}){
        this.setState({load:true,currencyPrices:[],currencyPolicies:[]});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/room-rates/${idRoom}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    let listCurrentRates= response.data;
                    let policies= listCurrentRates.policies !== undefined ? listCurrentRates.policies :undefined;     
                    let ratesDaily= listCurrentRates.rates !== undefined ? listCurrentRates.rates  :[];   
                   
                    ratesDaily.map(dailyRate =>{
                        if(dailyRate.promotions == null){
                            dailyRate.promotions = {
                                "id_promotion":0,"value_discount":0,"code":""
                            }
                        }
                    });

                    ratesDaily.map(dailyRate =>{
                        dailyRate.amoutOrig= dailyRate.amount;
                        if(dailyRate.promotions == null){
                            dailyRate.promotions ={
                                "id_promotion": 0,
                                "value_discount": 0,
                                "code": ""
                            }
                        }
                        dailyRate.promotionscodeOrig= dailyRate.promotions.code;
                        dailyRate.modifyDailyRate= false;
                    });             
                    this.setState({currencyPrices:ratesDaily,currencyPolicies:policies},funcGetDaily);                                                            
                }else{
                    console.log('error', response.Error);
                    this.setState({currencyPrices:[],currencyPolicies:{},load: false},funcGetDaily);  
                }
            }else{
                    console.log('error', error);
                    this.setState({currencyPrices:[],currencyPolicies:{},load: false},funcGetDaily);  
                }
        }); 
    }
   
    //Llena Input select de Rooms;
    getInputRooms(key, funcRoomCurrent=()=>{}){       
    this.setState({load:true,roomCurrent:[]}); 
        let {paxesByRoom,requestGeneralGets} = this.state;       
        let requestRooms ={
            "lang_code": requestGeneralGets.lang_code,
            "property_code": requestGeneralGets.property_code,
            "date_start": requestGeneralGets.date_start,
            "date_end": requestGeneralGets.date_end,
            "pax": paxesByRoom[key],
            "market": requestGeneralGets.market,
        };
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/rooms/get`,requestRooms, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {                
                if (!response.Error) {
                    let listAct = response.data !== undefined ? response.data :[];
                    let rooms= []; 
                                      
                    listAct.map((data) => { 
                        let descritionRoom = data.room_description !== undefined ? data.room_description :"";  
                        rooms.push({value:`${data.iddef_room_type_category}`,option:`${descritionRoom} (${data.room_code})`});   
                    }); 
                    
                    this.state.roomsAll[key]=listAct;
                    this.setState({roomCurrent:rooms},funcRoomCurrent);               
                }else{
                    console.log('error', response.Error);
                    this.state.roomsAll[key]=[];
                    this.setState({roomCurrent:[],load: false},funcRoomCurrent); 
                }
                
            }else{
                console.log('error', error);
                this.state.roomsAll[key]=[];
                this.setState({roomCurrent:[],load: false},funcRoomCurrent); 
            }
        });    
    }
    
    //Llena Input select de Rates;
    getInputRates(key,funcRatesCurrent=()=>{}){
        this.setState({load:true,ratesCurrent:[]});
        let {dataRoomRates,paxesByRoom,requestGeneralGets} = this.state;
        
        let requestRatesInput ={
            "market": requestGeneralGets.market,
            "date_start": requestGeneralGets.date_start,
            "date_end": requestGeneralGets.date_end,
            "lang_code": requestGeneralGets.lang_code,
            "property_code": requestGeneralGets.property_code, 
            "room_type": parseInt(dataRoomRates[key].iddef_room_type),              
            "rooms": paxesByRoom[key],                
        };
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/rateplan`,requestRatesInput, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }

            if (!error) {                
                if (!response.Error) {
                    let listAct = response.data !== undefined ? response.data :[];
                    // listAct = listAct.length > 0 ? listAct.filter(data => data.estado==1) : [];  
                    let rates= [];                      
                    listAct.map((data) => { 
                        let descritionRate = data.rate_plan_name !== undefined ? data.rate_plan_name :"";  
                        rates.push({value:`${data.idop_rateplan}`,option:`${descritionRate} (${data.rate_code_clever})`});   
                    }); 
                    this.setState({ratesCurrent:rates},funcRatesCurrent);               
                }else{
                    console.log('error', response.Error);
                    this.setState({ratesCurrent:[],load: false},funcRatesCurrent);
                }
                
            }else{
                console.log('error', error);
                this.setState({ratesCurrent:[],load: false},funcRatesCurrent); 
            }
        }); 
    }

    //Consulta datos relacionados con rates diario por cada formulario
    setDataRates(key,funcDataRate=()=>{}){
        this.setState({load:true,currencyPrices:[],currencyPolicies:[]});
        let {dataRoomRates,requestGeneralGets,valueCurrency,paxesByRoom}= this.state;
        let requestRates ={
            "market": requestGeneralGets.market,
            "lang_code": requestGeneralGets.lang_code,
            "currency":valueCurrency,                
            "date_start": requestGeneralGets.date_start,
            "date_end": requestGeneralGets.date_end,
            "property_code": requestGeneralGets.property_code,
            "room_type": parseInt(dataRoomRates[key].iddef_room_type),
            "rate_plan": parseInt(dataRoomRates[key].idop_rate_plan),
            "rooms": paxesByRoom[key],        
        };
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/rates/`,requestRates, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    let listCurrentRates = response.data !== undefined ? response.data[0] !== undefined ? response.data[0] : undefined :undefined;
                    let policies = listCurrentRates !== undefined ? listCurrentRates.policies :undefined;     
                    let ratesDaily= listCurrentRates !== undefined ? listCurrentRates.promo_free_apply == false ? listCurrentRates.price_per_day :[]:[];   
                   
                    ratesDaily.map(dailyRate =>{
                        dailyRate.amoutOrig= dailyRate.amount;
                        if(dailyRate.promotions == null){
                            dailyRate.promotions ={
                                "id_promotion": 0,
                                "value_discount": 0,
                                "code": ""
                            }
                        }
                        dailyRate.promotionscodeOrig= dailyRate.promotions.code;
                        dailyRate.modifyDailyRate= false;
                    });             
                    this.setState({currencyPrices:ratesDaily,currencyPolicies:policies},funcDataRate);                                                            
                }else{
                    console.log('error', response.Error);
                    this.setState({currencyPrices:[],currencyPolicies:{},load: false},funcDataRate);  
                }
            }else{
                    console.log('error', error);
                    this.setState({currencyPrices:[],currencyPolicies:{},load: false},funcDataRate);  
                }
        });           
    }
    
    createTblDailyRates(typeUpdate){
        this.setState({load:true});
        let {dataDailyRates,dataRoomRates,valueCurrency,listDataRates}= this.state;
        let date = new Date();
        let dateNow = moment(date).format('YYYY-MM-DD');
        let countNigthDaily = dataDailyRates !== undefined ? dataDailyRates.difDates :0;
        let dayStart = dataDailyRates !== undefined ? moment(dataDailyRates.dateStart).format('YYYY-MM-DD') : dateNow
        let formsDaily = [];
        //Genera ratesDaily por formulario
        dataRoomRates.sort().map((data,key)=>{            
            let listDailys= [];
            let dataRatesByRoom = listDataRates[key] !== undefined ? listDataRates[key]!== undefined ? listDataRates[key]: [] : [];
            for(var index= 0; index < countNigthDaily ;index++){                
                let dateCurrency = moment(dayStart).add(index, 'days').toDate();
                let dateIndex = moment(dateCurrency).format("YYYY-MM-DD");
                let dataRatesIndex = dataRatesByRoom.findIndex(rates => moment(rates.efective_date).format("YYYY-MM-DD") == dateIndex);
                let dataRates = dataRatesIndex > -1 ? dataRatesByRoom[dataRatesIndex] : undefined;
                
                if(dataRatesIndex == -1){
                    dataRatesByRoom.push({promotions:{code:""},efective_date:dateIndex,amount:"0.00"});
                    dataRatesIndex = dataRatesByRoom.findIndex(rates => moment(rates.efective_date).format("YYYY-MM-DD") == dateIndex);
                    dataRates = dataRatesByRoom[dataRatesIndex]
                }

                listDailys.push(
                    <div className='col s12 m12 l12' key={`keyDaily|${key}|${index}`} >
                        <div className='col s12 m1 l1'></div>
                        <div className='col s12 m10 l10' style={{borderBottom: '1px solid #a7a6a6' , 
                            borderTop: index == 0 ? '1px solid #a7a6a6':'', borderLeft: '1px solid #a7a6a6', borderRight: '1px solid #a7a6a6'
                         }}>
                            <div className='input-field inline  col s12 m3 l3'>
                                <h6 style={{fontSize:"11px", color:"black", fontWeight:"bold",}}>
                                    {moment(dateCurrency).format("ddd DD/MM/YYYY")}
                                </h6>
                            </div>
                            <div className='input-field inline col s12 m5 l5'>
                                <input style={{fontSize:"11px", color:"black"}} type="text" disabled={true} 
                                    value={dataRates.promotions.code}
                                    id={`inputValPromotion|${key}|${dateIndex}`} 
                                />
                            </div>
                            <div className='input-field inline col s12 m3 l3'>
                                <input className='validate' style={{color:"black", textAlign:"right"}} 
                                    placeholder="Insert amount" type="text"
                                    name={`inputDailyRate|${key}|${dateIndex}`} id={`inputDailyRate|${key}|${dateIndex}`} 
                                    onChange={e=> this.onChangeRoomRates(e,"inputRate",key,dataRatesIndex)}                                   
                                    value={dataRates.amount} disabled={false} 
                                    />
                            </div>
                            <div className='input-field inline col s12 m1 l1'>
                                <h6 style={{fontSize:"12px", color:"black", fontWeight:"bold",}}>
                                    {valueCurrency}
                                </h6>
                            </div>
                        </div>                    
                        <div className='col s12 m1 l1'></div>
                    </div>                
                );        
            }
            formsDaily.push(listDailys);
        });
        
        this.setState({dailyRates:formsDaily},()=>{            
            this.createFrmRoomRates(typeUpdate);       
        });
    }

    createFrmRoomRates=(typeUpdate)=>{  
        this.setState({load:true});      
        let {dataRoomRates,inputsAges,dailyRates,listRooms,listRates,roomsAll}=this.state;
        let listFrmRoomRates=[];
        let lengthRooms = dataRoomRates.length;
        dataRoomRates.sort().map((data,key)=>{ 
            data.room = `${data.iddef_room_type !== undefined ? data.iddef_room_type : 0}`;
            data.idop_rate_plan = `${data.idop_rate_plan}`;
            data.idbook_hotel_room = `${data.idbook_hotel_room}`;
            let valPax = data.paxes;
            valPax.map(paxes=>{
                let name= `${paxes.age_code}INDEX${key}`;
                data[name]= paxes.total
            });
            
            listFrmRoomRates.push(
            <div key={key}>
                <CleverForm
                    id={`modifyRoomRates${key}`}
                    ref={ref => this[`refRoomRates${key}`]=ref}                        
                    data={data}
                    forms={[
                            {
                                fieldset:true,
                                title:`  Room ${key+1} of ${lengthRooms}  `,
                                inputs: [
                                    key !== 0 ?  
                                    {row:[
                                        {type: 'component', 
                                            component: () => {
                                                return (
                                                    <>
                                                        <div className='col s12 m10 l10'></div>
                                                        <div className='col s12 m2 l2'>
                                                            <a onClick={e=>this.DeleteFrmRoomRate(e,key)} title='Delete Voucher'>
                                                                <i className='material-icons right'>delete</i>
                                                            </a>                                                       
                                                        </div>
                                                    </>                                                
                                                )
                                            }
                                        },
                                    ]}
                                    :{row:[]},
                                    {row:[
                                        {type:'text',size:'col s12 m6 l6',name:'idbook_hotel_room',label:'iddRoomHotel', 
                                           characters:true,alphanumeric:true,disabled:true,hidden:true },
                                    ]},
                                    {row:[
                                        {type: 'component', 
                                            component: () => {
                                                return (
                                                    <>
                                                    <h6 style={{fontSize:"12px", color:"#5b5b5b" ,marginTop:'0px',marginBottom:'0px'}}>
                                                        Guests
                                                    </h6>                                                    
                                                    </>                                                
                                                )
                                            }
                                        },
                                    ]} ,                                  
                                    {row:inputsAges[key]},                                
                                    {row:[
                                        {type:'select',size:'col s12 m6 l6',name:'room',label:'Room', 
                                            placeholder:'Select Room',manual: true,autocomplete:true, required: true,
                                            options: listRooms!== undefined ? listRooms[key] !== undefined ? listRooms[key]: []:[],
                                            onChange: e=> this.props.onChangeSelect(e,'inputRoom',key,roomsAll[key],'')},
                                        {type:'select',size:'col s12 m6 l6',name:'idop_rate_plan',label:'Rate', 
                                            placeholder:'Select Rate',manual: true,autocomplete:true, required: true,
                                            onChange: e=> this.props.onChangeSelect(e,'inputRates',key,'',''),
                                            options:listRates !== undefined ? listRates[key] !== undefined? listRates[key]: [] :[]
                                            },
                                    ]},
                                    {row:[
                                        {type: 'component', 
                                            component: () => {
                                                let msgError= 'Not daily rates';
                                                    return (
                                                        <>
                                                            <div className='col s12 m4 l4'>
                                                                <h6 onClick={e=>this.onChangeRoomRates(e,'showRoomRates',key,data.viewDaily)}
                                                                style={{fontSize:"12px", color:"#01536d", fontWeight:"bold", textDecorationLine:"underline" ,marginTop:'0px',marginBottom:'0px'}}>
                                                                   {data.viewDaily == true ? "Hide Daily Rates" : "Show Daily Rates"}                                                                    
                                                                </h6>
                                                            </div>
                                                            <div className="row"></div>
                                                            <div  id={`divDaily${key}`} style={{display:'none'}}>
                                                                {dailyRates !== undefined ? dailyRates[key].length > 0 ? dailyRates[key] :msgError:msgError}
                                                            </div>
                                                            <div className="row"></div>
                                                            <div className="row"></div>
                                                            <div className="row"></div>
                                                        </>   
                                                    )   
                                            }
                                        }
                                    ]},      
                                    {row:[
                                        {type:'text',size:'col s12 m4 l4',name:'taxPolicy',label:'Tax Policy', 
                                            placeholder:' ',characters:true,alphanumeric:true,disabled:true },
                                        {type:'text',size:'col s12 m4 l4',name:'cancellationPolicy',label:'Cancellation Policy', 
                                            placeholder:' ',characters:true,alphanumeric:true,disabled:true },
                                        {type:'text',size:'col s12 m4 l4',name:'bookingGuarante',label:'Booking Guarantee', 
                                            placeholder:' ',characters:true,alphanumeric:true,disabled:true },
                                    ]},
                                ]
                            }
                        ]}                        
                    />
            </div>)
            
        }
        );

        this.setState({formsRoomRates:listFrmRoomRates},()=>{
            if(typeUpdate != "updatetblDailys"){this.props.getDataFrms('roomRate',this.state.listDataRates)};
            this.setState({load:false});})
    }

    updateRoomRates =(type,valState1,valState2,indexFrmAfect,otherState,otherData)=>{
        switch(type){
            case "dates":
                    //COnsulta y genera nuevamente todos los formularios, porque las fechas afectan a todos                    
                    this.setState({dataDailyRates: valState1,requestGeneralGets: valState2},()=>{
                        this.setState({listRooms:[],listRates:[],listDataRates:[]},()=>{
                            this.generateContent("modCurrent");      
                        });
                    });
                break;
            case "pax":   
                    //Consulta los inputs del formulario especifico y recrea los mismo                 
                    this.setState({[valState1]: valState2},()=>{                        
                        this.getDataInputs(indexFrmAfect,"modCurrent");
                    });
                break;
            case "roomRate":      
                    this.setState({[valState1]: valState2},()=>{
                        this.getDataInputs(indexFrmAfect,"modCurrent");
                    });
                    break;
            case "addFrmRoom":
                    this.setState({[valState1]: valState2,[otherState]:otherData},()=>{                        
                        this.getDataInputs(indexFrmAfect,"modCurrent");
                    });
                break;
            case "amountToPay":
                        this.state.dataRoomRates[indexFrmAfect].total_to_paid_room = valState1;
                    break;
            default:
                break;
        }
        
    }

    onChangeRoomRates(e,type,indexFrm,valEval){
        switch(type){
            case 'showRoomRates':                
                    this.state.dataRoomRates[indexFrm].viewDaily = !valEval;
                    this.state.dataRoomRates[indexFrm].viewDaily == true 
                    ? document.getElementById(`divDaily${indexFrm}`).style.display="block"
                    : document.getElementById(`divDaily${indexFrm}`).style.display="none"
                    this.createFrmRoomRates();
                break;
            case 'inputRate':                
                //Consulta los rates por noche
                let valOrig= this.state.listDataRates[indexFrm][valEval].amoutOrig;
                let valueInsert= e.target.value;
                let newVal= valueInsert !== "" ? valueInsert.replace(/[^0-9.]/g,'') : "0.0";
                let valEndPoint= newVal.split('.');
                if(valEndPoint.length> 1){
                    valEndPoint[1] = valEndPoint[1].length > 2 ? valEndPoint[1].substring(0,2) : valEndPoint[1];
                    newVal = `${valEndPoint[0]}.${valEndPoint[1]}`
                }
                this.state.listDataRates[indexFrm][valEval].amount= newVal;
                if(parseFloat(newVal) !== parseFloat(valOrig)){
                    this.state.listDataRates[indexFrm][valEval].modifyDailyRate = true;
                }else{
                    this.state.listDataRates[indexFrm][valEval].modifyDailyRate = false;
                }

                this.validateModDailyRates(indexFrm);        
                break;                
            default:
                break;
        }
    }

    validateModDailyRates(indexFrm){
        let {listDataRates}=this.state;
        let isModRateByRoom= [];
        let valStatusFix = false;
        //Extrae informacion por room
        if(listDataRates[indexFrm] !== undefined){
            let dataDailysRoomIndex = listDataRates[indexFrm];    
            //Extrae rates por la habiatacion evaluada que se hallan modificado        
            isModRateByRoom = dataDailysRoomIndex.filter(rates => rates.modifyDailyRate == true);
            // Validar si todos son falsos, sino poner promotions.code  en vacios por la habitacion en cuestion
            if(isModRateByRoom.length >0){
                listDataRates[indexFrm].map(dataRatesDaily=>{
                    dataRatesDaily.promotions.code = "";
                }); 
                valStatusFix=  true;
            }else{
                listDataRates[indexFrm].map(dataRatesDaily=>{
                    dataRatesDaily.promotions.code = dataRatesDaily.promotionscodeOrig;
                }); 
                valStatusFix=  false;
            }
        }
        this.state.ratesFixByRoom[indexFrm]= valStatusFix;
        // this.setState({ratesFix: valStatusFix})
        // this.props.statusViewVoucher(valStatusFix);
        this.createTblDailyRates();
    }

    DeleteFrmRoomRate(e,indexFrm){
        this.setState({load:true});
        let dataRooms = this.state.dataRoomRates;
        dataRooms[indexFrm].room= "";
        dataRooms[indexFrm].idop_rate_plan= "";
        this.setState({dataRoomRates:dataRooms},()=>{
            this.state.dataRoomRates.splice(indexFrm,1); //Datos generales del frm room rate
            this.state.inputsAges.splice(indexFrm,1);
            this.state.dailyRates.splice(indexFrm,1);
            this.state.listDataRates.splice(indexFrm,1); //Datos de la tabla de tarifa diaria
            this.state.ratesFixByRoom.splice(indexFrm,1); //Status de mod de los tarifa diaria va de la mano de listDataRates
            this.state.listRates.splice(indexFrm,1); // Datos del combo rate por frm
            this.state.listRooms.splice(indexFrm,1); // Datos del combo room por frm
            this.state.roomsAll.splice(indexFrm,1);
            this.state.paxesByRoom.splice(indexFrm,1); //Datos de los pax por frm
            this.createTblDailyRates(); 
            MComponentes.toast("The form Room And Rates was remove");
        });
    }

    getValueDailyRates=()=>{
        let {listDataRates} = this.state;
        return listDataRates;
    }

    valueDataQuoteRates=(dataPricing)=>{
        let {dataRoomRates}=this.state;
        let datalistDataRates = JSON.parse(JSON.stringify(this.state.listDataRates));
        let dataQuote = dataPricing.rooms !== undefined ? dataPricing.rooms :[];

        if(dataQuote.length > 0){
            dataQuote.map(roomRate =>{
                let nameFrm = roomRate.nameFrm !== undefined && roomRate.nameFrm !== "" ? roomRate.nameFrm : null;
                let splitIndex = nameFrm.split('divDaily');
                let indexValue = splitIndex[1];
                dataRoomRates[indexValue].total_room = roomRate.totalByRoom;
                dataRoomRates[indexValue].total_to_paid_room = roomRate.totalToPay;
                dataRoomRates[indexValue].total_paid_room = roomRate.totalPaid;

                let dailyRatesAPI = roomRate.dailyRatesAPI !== undefined ? roomRate.dailyRatesAPI : [];
                let listRatesCurrent = datalistDataRates[indexValue];          
                dailyRatesAPI.map(ratesAPI =>{
                    let dateRate = ratesAPI.efective_date;
                    let indexDataListRate = listRatesCurrent.findIndex(rateCurrent => rateCurrent.efective_date == dateRate);
                    if(indexDataListRate !== -1){
                        // datalistDataRates[indexValue][indexDataListRate].amount= ratesAPI.amount;
                        datalistDataRates[indexValue][indexDataListRate].pms_amount= ratesAPI.pms_amount;
                        datalistDataRates[indexValue][indexDataListRate].vaucher_discount= ratesAPI.vaucher_discount;
                        console.log(`${parseFloat(datalistDataRates[indexValue][indexDataListRate].amount)} !== ${parseFloat(ratesAPI.amount)}`);
                        datalistDataRates[indexValue][indexDataListRate].amount= parseFloat(datalistDataRates[indexValue][indexDataListRate].amount) !== parseFloat(ratesAPI.amount) 
                        ? parseFloat(ratesAPI.amount) : parseFloat(datalistDataRates[indexValue][indexDataListRate].amount)
                    }                    
                });
                console.log("datalistDataRates ==> ", datalistDataRates);
            });
            this.setState({listDataRates:datalistDataRates},()=>{
                console.log("listDataRates ==> ", this.state.listDataRates);
                this.createTblDailyRates("updatetblDailys");
            })
        }
        
    }

    getValueRooms =() =>{        
        let responseRooms = {};
        let rooms= [];           
        let validation = this.validateRooms(); 
        let isError = validation.filter(val => val.error== true);     
        if(isError.length == 0){                
            validation.map(valRoom=>{
                rooms.push(valRoom.data); 
            });
            responseRooms.error= false;
            responseRooms.rooms= rooms;
        }else{
            let message= "";
            isError.map(error =>{
                message = `${message} ${error.message},`
            });
    
            MComponentes.toast(`Complete the data required ${message}`);
                this.setState({ hiddeNotificationModal: false, notificationType: "error", 
                        notificationMessage: `Complete the data required of ${message}`});  
            responseRooms.error= true; 
            responseRooms.rooms= [];
        }

        return responseRooms;
        
    }

    validateRooms(){
        let {dataRoomRates,roomsAll,ratesFixByRoom,listDataRates}= this.state;
        let responseValidation= [];       
        dataRoomRates.sort().map((dataRoomsState,key)=>{  
            let dataCurrent= {};
            let dataRooms = this[`refRoomRates${key}`].getData();
            let requiredRooms= dataRooms.required.count;  
            let paxesCurrent = dataRoomsState.paxes;
            let findPaxAdult = paxesCurrent.find(paxesCurrent=> paxesCurrent.age_code == "adults");
            let dailyRates= listDataRates[key];
            let arrayRates= [];
            dailyRates !== undefined ?
                dailyRates.map(data=>{
                    let dataPromotion = data.promotions.id_promotion !== undefined  && data.promotions.id_promotion !== 0 ? data.promotions : {};
                    arrayRates.push({
                        "percent_discount": data.percent_discount !== undefined ? parseFloat(data.percent_discount) :0,
                        "efective_date": data.efective_date,
                        "amount_crossout": data.amount_crossout !== undefined ? parseFloat(data.amount_crossout) :0,
                        "amount": parseFloat(data.amount),
                        "promotions": dataPromotion,
                        "tax_amount": data.tax_amount !== undefined ? parseFloat(data.tax_amount) :0,
                        "vaucher_discount": data.vaucher_discount,
                        "price_pms": parseFloat(data.pms_amount)
                    })
                })
            :null;

            let dataPax = {};
            paxesCurrent.map(pax=>{
                dataPax[pax.age_code]= pax.total;
            });

            findPaxAdult !== undefined ? findPaxAdult.total == 0 ? requiredRooms= requiredRooms+1 : null : null;
            
            if(requiredRooms > 0){
                let inputRequiredRooms= dataRooms.required.inputs !== undefined ? dataRooms.required.inputs : []; 
                dataCurrent.error= true;
                dataCurrent.message = `${findPaxAdult !== undefined ? findPaxAdult.total == 0 ?  `, add adult in the form ${key+1}`: "" : ""}`;
                inputRequiredRooms.map(inputRom => {
                    dataCurrent.message = ` ${dataCurrent.message} Select one ${inputRom.label} in the form ${key+1}`;
                });
                dataCurrent.data = {};
            }else{
                dataCurrent.error= false;
                dataCurrent.message = "";
                let valuesRooms = dataRooms.values;
                let dataRoom = {};
                let findDetailRoom = roomsAll[key].find(room => room.iddef_room_type_category == parseInt(valuesRooms.room));
                dataRoom.room_number = parseInt(valuesRooms.idbook_hotel_room);
                dataRoom.iddef_room_type = parseInt(valuesRooms.room);
                dataRoom.idop_rate_plan = parseInt(valuesRooms.idop_rate_plan);
                dataRoom.rates_fix = ratesFixByRoom[key];
                dataRoom.rates = arrayRates;
                dataRoom.pax = dataPax;
                dataRoom.trade_name_room = findDetailRoom !== undefined ? findDetailRoom.room_description :"";
                dataRoom.total_room= dataRoomsState.total_room;
                dataRoom.total_to_paid_room= dataRoomsState.total_to_paid_room;
                dataCurrent.data = dataRoom;
            }
            responseValidation.push(dataCurrent);
        });
        return responseValidation
    }

    render(){  
        let {load,formsRoomRates,listRooms}= this.state;
        return(
            <>
                <CleverLoading show={load}/> 
                <div className='row'>
                    <div className='col s12 m10 l10'></div>
                    <div className='col s12 m2 l2'>
                        <a onClick={e=>this.props.onAddFrm(e,"roomRates")} title='Add Comments'>
                            <i className='small material-icons right'>add_box</i>
                        </a> 
                    </div>
                </div>
                {
                    formsRoomRates ?
                        formsRoomRates.sort().map((form,key) => (<div key={key}><div className='row'>{form}</div><div className='row'></div></div>))
                    :null
                }   
            </>
        );
    }
}

FrmRoomsRates.propTypes = {
    onRef: PropTypes.func,
    getDataFrms: PropTypes.func,
    statusViewVoucher: PropTypes.func,
    onChangeSelect: PropTypes.func,
    dataRoomRates: PropTypes.array,
    countNigthDaily: PropTypes.number,
    propertyID: PropTypes.number,
    valueCurrency: PropTypes.string,
    dataDailyRates: PropTypes.object,
    requestGeneralGets: PropTypes.object,
    inputsAges: PropTypes.array,
    paxesByRoom: PropTypes.array
}

FrmRoomsRates.defaultProps = {
    onRef: () => {},
    getDataFrms: () => {},
    statusViewVoucher: () => {},
    onChangeSelect: () => {},
    dataRoomRates:[{
        iddef_room_type:"0",
        idop_rate_plan:"0",
        taxPolicy:"",
        cancellationPolicy:"",
        bookingGuarante:"",
        viewDaily:false,
        paxes:[]
    }],
    countNigthDaily:0,
    propertyID:0,
    valueCurrency:"",
    dataDailyRates:{},
    requestGeneralGets:{
        lang_code: "",
        property_code: "",
        date_start: "",
        date_end: "",
        market: "",
    },
    inputsAges:[],
    paxesByRoom:[]
}