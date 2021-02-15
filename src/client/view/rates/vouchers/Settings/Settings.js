import React, { Component } from "react";
import CleverConfig from "./../../../../../../config/CleverConfig";
import {CleverForm, CleverRequest, Chip,CleverLoading, MComponentes} from "clever-component-library";
var Helper = require('./../../access_restrictions/restrictions/Countries');

export default class Settings extends Component {
    constructor(props) {
        super(props);

        this.startPagSettings = this.startPagSettings.bind(this);
        this.setValuesEdit = this.setValuesEdit.bind(this);        
        this.getChannels = this.getChannels.bind(this);
        this.getCountries = this.getCountries.bind(this);
        this.getMarket =  this.getMarket.bind(this);
        this.handlerChangeSelect = this.handlerChangeSelect.bind(this);
        this.validateInputs = this.validateInputs.bind(this);   
        this.addChip = this.addChip.bind(this); 
        // this.getValuesDatesTypes = this.getValuesDatesTypes.bind(this);    
        this.getValueListChannels = this.getValueListChannels.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : false, 
            amount: true,
            max_Booking:true,
            los: true,
            sales_limit: true,
            stay_dates: true,
            booking_dates: true,
            booking_time:true,
            channels: true,
            geo_targeting: true,
            market_option: true,
            country_option: true,
            listCountries:[],
            listChannels:[],
            listIniChannels:[],
            listIniGeoTargeting:[],
            listCancelPolicy:[{value:'0',option:''}], 
            dataChips:[],
            dataChipsBooking:[],
            dataChipTimeBooking:[],
            allDataStay:[],
            allDataBooking:[],
            iniCountries:[]
        }
    }

    componentDidMount(){  
        this.setState({
            load : true, 
            dataSettings: this.props.dataSettings,
            idVoucher:this.props.idVoucher
        },()=>{
            this.startPagSettings();
        });
    }

    startPagSettings(){ 
        this.getChannels();
        this.getMarket();
        this.getCountries();            
        this.getCancelPolity();
        this.setState({load:false});  
    }

    getChannels(){
        this.setState({load:true},()=>{
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/channels/get-all`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if(!response.Error){
                        let responseData = response.data;
                        let tiposChannels = [];                    
                        responseData.map((data) => {
                            data.estado == 1 ?
                                tiposChannels.push({value: String(data.iddef_channel), option: data.description})
                            :null;            
                        });
    
                        this.setState({ listChannels:tiposChannels,load:false});
                    }else{
                        this.setState({load:false});
                    }
                }else{
                    this.setState({load:false});
                }
            });
        });
    }

    getMarket(){
        this.setState({load:true},()=>{
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/market/get`, (response, error) => {          
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if(!response.Error){
                        let responseData = response.data;
                        let market = [];
                        
                        responseData.map((data) => {
                            data.estado == 1 ?
                                market.push({value: String(data.iddef_market_segment), option: data.description})
                            :null;            
                        });
    
                        this.setState({ listMarkets:market,load:false});
                    }else{
                        this.setState({load:false});
                    }
                }else{
                    this.setState({load:false});
                }
            });
        });
    }

    getCountries(){
        let {dataSettings} = this.state;
        let markets = '';
        let urlCountry = '/api/country/get';
        /*Verificar si opcion de mercado es 1 o 2, es decir se tienen seleccionados mercados,
         Si es asi se realizara la consulta por mercado sino se hara por todos los paises;         
        */
        dataSettings.market_option !== '' 
        ?
            (dataSettings.market_option !== '1')|| (dataSettings.market_option !== '2')
            ? (
                markets = dataSettings.market_targeting,
                markets.length > 0 
                ? urlCountry = `/api/country/get?market=${markets}`
                :null
            )
            :null
        :null;

        this.setState({load:true},()=>{
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`${urlCountry}`, (response, error) => {          
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if(!response.Error){
                        let responseData = response.data;
                        let countries = [];
                        
                        responseData.map((data) => {
                            data.estado == 1 ?
                                countries.push({value: String(data.country_code), option: data.name})
                            :null;            
                        });
    
                        this.setState({ listCountries:countries,load:false});
                    }else{
                        this.setState({load:false});
                    }
                }else{
                    this.setState({load:false});
                }
            });
        });       
    }

    getCancelPolity(){
        let idCancelPolicy= 1;
        this.setState({load:true},()=>{
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/policies/get/${idCancelPolicy}`, (response, error) => {          
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if(!response.Error){
                        let responseData = response.data;
                        let politicasCancel = [];
                        
                        responseData.map((data) => {
                            data.estado == 1 ?
                                // politicasCancel.push({value: String(data.iddef_policy), option: data.policy_code})
                            this.setState(prevState => ({
                                    listCancelPolicy: [...prevState.listCancelPolicy, {value: String(data.iddef_policy), option: data.policy_code}]
                            }))
                            :null;            
                        });
    
                        this.setState({ /*listCancelPolicy:politicasCancel,*/load:false});
                        
                    }else{
                        this.setState({load:false});
                    }
                }else{
                    this.setState({load:false});
                }
            });
        });
        
    }
    
    setValuesSettings(idVoucher,dataSettings){
        this.setState({load:true,dataSettings:dataSettings},()=>{
            this.setValuesEdit(()=>{            
                if(idVoucher !== 0){
                    this.validateInputs('los',0);
                    this.validateInputs('amount',0);
                    this.validateInputs('max_Booking',0)
                    this.validateInputs('sales_limit',0); 
                    this.validateInputs('channels',0);
                    this.validateInputs('stay_dates',0);
                    this.validateInputs('booking_dates',0);
                    this.validateInputs('country_option',0);
                    this.validateInputs('market_option',0);
                }
                this.setState({load:false});
            }); 
        });
    }

    setValuesEdit(functionSetChips=()=>{}){
        this.setState({load:true});
        let data = this.state.dataSettings;
        let arrayChipsBooking = [];
        let arrayChipStay = [];
        let arrayChipsBookingTime = [];
        let listIniChannels = [];

        data.select_channels.map((item)=>{
            listIniChannels.push(item);
        });

        //llena el chip de stay dates
        data.stay_dates_value.map((dataDatesStay)=>{
            let value = dataDatesStay.start_date+' / '+dataDatesStay.end_date  
            arrayChipStay.push(value);                  
        });        
        //llena el chip de booking dates
        data.booking_dates_value.map((dataDatesBooking)=>{    
            let value = dataDatesBooking.start_date+' / '+dataDatesBooking.end_date;  
            arrayChipsBooking.push(value);           
        });    
        //llena el chip de booking time
        data.booking_times_value.map((dataTimesBooking)=>{    
            let value = dataTimesBooking.start_time+' / '+dataTimesBooking.end_time;  
            arrayChipsBookingTime.push(value);           
        });
            
        this.setState({            
            dataChips: arrayChipStay,
            dataChipsBooking: arrayChipsBooking,
            dataChipTimeBooking: arrayChipsBookingTime,
            iniChannels: listIniChannels,
        },functionSetChips); 
    }

    validateInputs(name,type){
        let settingsValues = type == 0 ? this.state.dataSettings : this.refSettings.getData().values;
        let dateNow= Date().toString();
        let valuedefault = true;               
        if(settingsValues[name] !== ''){
            switch (name){
                case 'los':
                case 'amount':
                case 'max_Booking':
                case 'sales_limit': 
                case 'channels':   
                case 'market_option':  
                case 'country_option':        
                        //Si seleccionado opcion 1 es oculto sino es visible 
                        settingsValues[name] == '0' || settingsValues[name] == '1' ? valuedefault = true : valuedefault = false                    
                        this.setState({[name]:valuedefault});
                    break;

                case 'stay_dates': 
                        if(settingsValues[name] == '1'){
                            if(type !== 0){
                                //antes de ocultar el objeto extrae la informacion para que no se pierda
                                if(settingsValues[`start_stay_dates`] !== undefined){
                                    
                                    let datesStay= this.getValueChipStay();
                                    this.setState({ 
                                        dataChips:datesStay
                                    });                                
                                }
                            }
                                
                                valuedefault = true;
                        }else{
                                settingsValues[`start_stay_dates`] = dateNow;
                                settingsValues[`end_stay_dates`] = dateNow;
                                valuedefault = false;
                        }
                        
                        this.setState({dataSettings:settingsValues},()=>{
                            this.setState({[name]:valuedefault})
                        });
                    break;
                    
                case 'booking_dates':
                        if(settingsValues[name] == '1'){
                            if(type !== 0){
                                //antes de ocultar el objeto extrae la informacion para que no se pierda
                                if(settingsValues[`start_booking_dates`] !== undefined){
                                    let datesBooking = this.getValueChipBooking();
                                    let timesBooking = this.getValueChipBookingTime();
                                    this.setState({ 
                                        dataChipsBooking:datesBooking,
                                        dataChipTimeBooking:timesBooking
                                    });                             
                                }
                            }
                            valuedefault = true;
                        }else{
                            settingsValues[`start_booking_dates`] = dateNow,
                            settingsValues[`end_booking_dates`] = dateNow,
                            settingsValues[`start_bookingTime_dates`] = '', 
                            settingsValues[`end_bookingTime_dates`] = '',
                            valuedefault = false
                        }
                        
                        this.setState({dataSettings:settingsValues},()=>{
                            this.setState({[name]:valuedefault})
                        });
                    break;

                default:
                    break;
            }
        }
    }

    handlerChangeSelect(e){
        let dataValuesSettings = this.refSettings.getData().values;
        let name = e.name;
        let value = name =='market_targeting' ? e.values.length !==0 ? e.values :[] : e.value;    
        
        dataValuesSettings[name] = value;        
        this.setState({dataSettings: dataValuesSettings},()=>{   
            name =='market_targeting'
            ? this.getCountries()      
            :this.validateInputs(name);
        });
    }

    addChip(type){
        let datafrmSettings= this.refSettings.getData();
        let data = datafrmSettings.values;          
        let tag;
        let nameStart=`start_${type}_dates`;
        let nameEnd=`end_${type}_dates`;

            tag = data[nameStart]+' / '+data[nameEnd];
        
        switch(type){
            case 'stay':
                    this.setValueChipStay(tag);
                break;
            case 'booking':
                    this.setValueChipBooking(tag);
                break;
            case 'bookingTime':
                    data[nameStart] !== '' ?
                        data[nameEnd] !== '' ?
                            this.setValueChipBookingTime(tag)
                        :MComponentes.toast('Select a End Booking Time')
                    :MComponentes.toast('Select a Star Booking Time');
                break;
            default:
                break;
        }
    }

    getValueStayDate(){   
        let {stay_dates} = this.state;  
        let dataActStay = [];
        let stay_dates_value = [];

        //Extraer Informacion Actual de los chips, todos estos deberan tener un status de alta (1)
        stay_dates == false ? dataActStay = this.getValueChipStay() : null;
        // Se arma el objeto de request de dates_types_values por tipo y estado    
        // Todos los de tipo Stay con estatus de alta    
        dataActStay.length > 0 ?
            dataActStay.map((dataAltaStay)=>{
                //Para extraer, en la posicion 0 esta la fecha inicial y en la 1 la final
                let splitStay = dataAltaStay.split(' / ');
                stay_dates_value.push(
                    {  
                        // iddef_promo_code_type_date:valueStay,
                        start_date: splitStay[0],
                        end_date: splitStay[1],
                        // estado: statusON
                    }
                );
            })
        :null;
      
        return stay_dates_value;
    }

    getValuesBookingDates(){   
        let {booking_dates} = this.state;  
        let dataActBooking = [];
        let booking_dates_value = [];

        //Extraer Informacion Actual de los chips, todos estos deberan tener un status de alta (1)
        if(booking_dates == false){ 
            dataActBooking = this.getValueChipBooking();
        }
       
        // Todos los de tipo Booking con estatus alta  
        dataActBooking.length > 0 ?
            dataActBooking.map((dataAltaBooking)=>{
                //Para extraer, en la posicion 0 esta la fecha inicial y en la 1 la final
                let splitBooking = dataAltaBooking.split(' / ');
                booking_dates_value.push(
                    {   
                        // iddef_promo_code_type_date:valueBooking,
                        start_date: splitBooking[0],
                        end_date: splitBooking[1],
                        // estado: statusON
                    }
                );
            })
        :null;

        return booking_dates_value;
    }

    getValuesBookingTimesDates(){   
        let {booking_dates} = this.state;  
        let dataTimeBooking = [];
        let booking_times_value = [];
        //Extraer Informacion Actual de los chips, todos estos deberan tener un status de alta (1)
        if(booking_dates == false){ 
            dataTimeBooking = this.getValueChipBookingTime();
        }

        dataTimeBooking.length > 0 ?
            dataTimeBooking.map((dataTimeBooking)=>{
                let splitBookingTime = dataTimeBooking.split(' / ');
                booking_times_value.push(
                    {   
                        // iddef_promo_code_type_date:valueBooking,
                        start_time: splitBookingTime[0],
                        end_time: splitBookingTime[1],
                        // estado: statusON
                    }
                );
            })
        :null;

        return booking_times_value;
    }


    getValueListChannels(){
        let frmSettings = this.refSettings.getData().values;
        let listOriginal = this.state.iniChannels;
        let listChannelsAct = frmSettings.select_channels !=="" ? frmSettings.select_channels :[];
        let statusOn = 1;
        let statusOff = 0;
        let arrayFinal = [];  
        let dataOnlyOrig = [];
        let dataChannelsAlta = [];
        
        listOriginal !== undefined ?
            /*Se extraen compara el array inicial con lo actual de los valores de 
            chanels para determinar cuales se conservaron*/
            dataChannelsAlta = listChannelsAct.filter(x => listOriginal.includes(x)).
                        concat(listChannelsAct.filter(x => !listOriginal.includes(x))) /*Se extraen los valores que unicamente existen en el array actual de chanels es decir que son nuevos*/
        : dataChannelsAlta = listChannelsAct
        
        listOriginal !== undefined ?
            /*Se extraen los valores que unicamente existen en el array inicial, 
            es decir que fueron desmarcados y por tanto es una baja*/
            dataOnlyOrig = listOriginal.filter(x => !listChannelsAct.includes(x))
        : dataOnlyOrig = []
        
        /*Se agregan al arreglo todos aquellos que deban tener estatus 1, es decir q se conservan o sean nuevos*/
        dataChannelsAlta.map((item)=>{
            let value = {};
            value.iddef_channel = parseInt(item);
            value.estado = statusOn;

            arrayFinal.push(value);
        });
        /*Se agregan al arreglo todos aquellos que deban tener estatus 0, es decir q fueron desmarcados*/
        dataOnlyOrig.map((item)=>{
            let value = {};

            value.iddef_channel = parseInt(item);
            value.estado = statusOff;

            arrayFinal.push(value);
        });
        
        return arrayFinal;
    }

    validateRequiereDates(){
        // let {booking_dates,stay_dates} = this.state;
        let responseValDates = {};
        let menssage = [];
        let error = false;
        let dataSettings = this.refSettings.getData().values;
        let valueOptionStay = parseInt(dataSettings.stay_dates);
        let valueOptionBooking = parseInt(dataSettings.booking_dates)
        
        if(valueOptionStay !== 1){
            let valChipStay = this.getValueChipStay();
            if(valChipStay.length == 0){
                menssage.push('Add Stay Dates');
                error = true;
            }
        } 

        if(valueOptionBooking !== 1){
            let valueChipBooking = this.getValueChipBooking();
            if(valueChipBooking.length == 0){
                menssage.push('Add Booking Dates');
                error = true;
            }
        } 

        responseValDates={msg: menssage ,isError:error}
       
        return responseValDates;
    }

    render(){         
        let {load,dataSettings,los,stay_dates,amount,max_Booking,dataChips,booking_dates,dataChipsBooking,dataChipTimeBooking,
            listCancelPolicy,sales_limit,channels,listChannels,market_option,listMarkets,
            country_option,listCountries,} = this.state;
               
        return(
                 <div>
                    <CleverLoading show={load}/>
                    {dataSettings ?
                    <CleverForm
                        id={'Settings'}
                        ref={ref => this.refSettings = ref}
                        data={dataSettings}
                        forms={[
                            { 
                                inputs:[
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'los',label:'* Min LOS', 
                                            placeholder:'Select Min LOS',autocomplete:true,
                                            options:[{value:'1',option:'None'},{value:'2',option:'Custom'}], 
                                            onChange:this.handlerChangeSelect,required:true},
                                        {type:'number',size:'col s12 m3 l3',name:'text_los',
                                            label:los == true ? 'Value Min LOS' :'* Value Min LOS',
                                            placeholder:'Insert Value Min LOS',
                                            id:'los',hidden:los, required:los == true ? false : true},
                                        {type:'select',size:'col s12 m3 l3', name:'amount',label:'* Min Booking Amount', 
                                            onChange:this.handlerChangeSelect,required:true,
                                            placeholder:'Select Min Booking Amount',autocomplete:true,
                                            options:[{value:'1',option:'None'}, {value:'2',option:'Custom'}]}, 
                                        {type:'number',size:'col s12 m3 l3',name:'text_amount',id:'amount',
                                            label:amount == true ? 'Value Min Booking Amount': '* Value Min Booking Amount',
                                            placeholder: 'Insert Value Min Booking Amount',
                                            hidden:amount, required:amount == true ? false : true},
                                    ]},
                                    {row:[                                        
                                        {type:'select',size:'col s12 m3 l3', name:'max_Booking',label:'* Max Booking Amount', 
                                            onChange:this.handlerChangeSelect,required:true,
                                            placeholder:'Select Max Booking Amount',autocomplete:true,
                                            options:[{value:'1',option:'None'}, {value:'2',option:'Custom'}]}, 
                                        {type:'number',size:'col s12 m3 l3',name:'text_MaxBooking',
                                            label:max_Booking == true ? 'Value Max Booking Amount': '* Value Max Booking Amount',
                                            placeholder: 'Insert Value Max Booking Amount',
                                            hidden:max_Booking, required:max_Booking == true ? false : true},
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'stay_dates',
                                            label:'* Stay dates',required:true, placeholder:'Select Stay dates',
                                            options:[{value:'1',option:'All dates, no restrictions'},
                                                    {value:'2',option:'Custom dates'},
                                                    {value:'3',option:'Blackout dates'}], 
                                            onChange:this.handlerChangeSelect, autocomplete:true},
                                    ]},
                                    stay_dates == false ?                                                
                                    {
                                        row:[
                                            {type:'date', colDate:'col s12 m3 l3', labelDate:'Start Date',
                                                name:'start_stay_dates', time:false, disabled:stay_dates},
                                            {type:'date', colDate:'col s12 m3 l3',name:'end_stay_dates', time:false, 
                                                disabled:stay_dates,},
                                            {type:'button',label:'',icon:'add',onClick:e=>this.addChip('stay')}
                                        ]
                                    }                                                    
                                    : {row:[]}, 

                                    stay_dates == false ?                                                
                                    {
                                        row:[
                                            {type:'component', 
                                                component:() =>{
                                                    return (                                                        
                                                        <div>                                                    
                                                            <Chip
                                                                id='tag_stay_dates' 
                                                                setValue={ set => {this.setValueChipStay = set; 
                                                                                    this.setValueChipStay(dataChips)
                                                                                    } 
                                                                        }
                                                                getValue={ get => {this.getValueChipStay = get;} }
                                                                cleanValue={ clean => {this.cleanValueChipStay = clean;} }
                                                                readOnly={true}
                                                            />
                                                        </div>                                                                    
                                                    )                                                                    
                                                }
                                            }
                                        ]
                                    }                                                    
                                    : {row:[]}, 
                                
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'booking_dates',
                                            label:'* Booking dates',required:true, placeholder:'Select Booking dates',
                                            options:[{value:'1',option:'All dates, no restrictions'},
                                                    {value:'2',option:'Custom dates'},
                                                    {value:'3',option:'Blackout dates'}], 
                                            onChange:this.handlerChangeSelect,autocomplete:true},
                                        ]
                                    }, 
                                    booking_dates == false ? 
                                    {row:[  {type:'date', colDate:'col s12 m3 l3', name:'start_booking_dates', time:false,
                                                disabled:booking_dates},
                                            {type:'date', colDate:'col s12 m3 l3', name:'end_booking_dates', time:false,
                                                disabled:booking_dates},
                                            {type:'button',label:'',icon:'add',onClick:e=>this.addChip('booking')}                                                            
                                        ]
                                    }
                                    : {row:[]},

                                    booking_dates == false ?                                     
                                    {row:[
                                        {type:'component', 
                                            component:() =>{
                                                return (
                                                    <div>
                                                        <Chip
                                                            id='tag_Booking'
                                                            setValue={ set => {this.setValueChipBooking = set;
                                                                                this.setValueChipBooking(dataChipsBooking)
                                                                            } 
                                                                    }
                                                            getValue={ get => {this.getValueChipBooking = get;} }
                                                            cleanValue={ clean => {this.cleanValueChipBooking = clean;} }
                                                            readOnly={true}
                                                    />
                                                    </div>
                                                )
                                            }
                                        },
                                    ]}
                                    : {row:[]},
                                    booking_dates == false ? 
                                    {row:[
                                        {type: 'component', 
                                            component: () => {return ( <label>{'Booking Time of Day'}</label>)}
                                        },
                                        { type: 'select', size: 'col s12 m4 l4', name: 'start_bookingTime_dates', label: 'Start Time', options: Helper.hours},
                                        { type: 'select', size: 'col s12 m4 l4', name: 'end_bookingTime_dates', label: 'End Time', options: Helper.hours},
                                        {type:'button',label:'',icon:'add',onClick:e=>this.addChip('bookingTime')}  
                                    ]}
                                    : {row:[]},
                                    // booking_time == false ?
                                    booking_dates == false ?                                     
                                    {row:[
                                        {type:'component', 
                                            component:() =>{
                                                return (
                                                    <div>
                                                        <Chip
                                                            id='tag_BookingTime'
                                                            setValue={ set => {this.setValueChipBookingTime = set;
                                                                                this.setValueChipBookingTime(dataChipTimeBooking)
                                                                            } 
                                                                    }
                                                            getValue={ get => {this.getValueChipBookingTime = get;} }
                                                            cleanValue={ clean => {this.cleanValueChipBookingTime = clean;} }
                                                            readOnly={true}
                                                    />
                                                    </div>
                                                )
                                            }
                                        },
                                    ]}
                                    : {row:[]},
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'sales_limit', required:true,
                                            label:'* Global Sales Limit',placeholder:'Select Global Sales Limit',
                                            options:[{value:'1',option:'Unlimited'},{value:'2',option:'Limited'}], 
                                            onChange:this.handlerChangeSelect,autocomplete:true,},    
                                        {type:'number',size:'col s12 m3 l3',name:'text_sales_limit',
                                            label:sales_limit == true ? 'Value Global Sales Limit': '* Value Global Sales Limit',
                                            placeholder:'Insert Value Global Sales Limit',
                                            id:'sales_limit',hidden:sales_limit,
                                            required:sales_limit == true ? false : true},     
                                            {type:'select',size:'col s12 m6 l6', name:'cancellation_policy',
                                            label:'Cancellation Policy', onChange:this.handlerChangeSelect,
                                            options:listCancelPolicy, required:false,autocomplete:true,
                                            placeholder:'Select Cancellation Policy'
                                        },       
                                        
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'channels',
                                            label:'Channels',required:false, placeholder:'Select Channels',
                                            options:[{value:'0',option:''},{value:'1',option:'All Channels'},
                                            {value:'2',option:'Only these channels'}, 
                                            {value:'3',option:'All channels, with these exceptions'}], 
                                            onChange:this.handlerChangeSelect,autocomplete:true,},
                    
                                        {type:'select',size:'col s12 m6 l6', name:'select_channels',
                                            label: channels == true ?'Channels':' *Channels', placeholder:'Select Channels', hidden:channels,
                                            required:channels == true ? false : true, 
                                            options:listChannels, multiple:true,autocomplete:true,},                                
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'market_option', placeholder:'Select Market', 
                                            label:'Market', required:false, onChange:this.handlerChangeSelect,
                                            options:[{value:'0',option:''},{value:'1',option:'All markets'},
                                            {value:'2',option:'Custom markets'},
                                            {value:'3',option:'All markets, with these exceptions'}],autocomplete:true,},

                                        {type:'select',size:'col s12 m6 l6', name:'market_targeting',
                                            placeholder:'Select Markets', hidden:market_option,options:listMarkets, 
                                            label:market_option == true ?'Markets':'* Markets', 
                                            required:market_option == true ? false : true,
                                            multiple:true, onChange:this.handlerChangeSelect, autocomplete:true,},
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m3 l3', name:'country_option',placeholder:'Select Geo Targeting',
                                            label:'Geo Targeting',required:false, onChange:this.handlerChangeSelect,
                                            options:[{value:'0',option:''},{value:'1',option:'All countries'},{value:'2',option:'Custom countries'},{value:'3',option:'All countries, with these exceptions'}],
                                            autocomplete:true,
                                        },

                                        {type:'select',size:'col s12 m6 l6', name:'country_targeting',
                                            label:country_option == true ? 'Countries' :'* Countries', 
                                            placeholder:'Select Countries', hidden:country_option,
                                            required:country_option == true ? false : true,
                                            options:listCountries,multiple:true,autocomplete:true,},
                                    ]},
                                    {row:[
                                        {type:'component', 
                                            component:() =>{
                                                return (
                                                    <div style={{ height: 200 }}>
                                                        
                                                    </div>
                                                )
                                            }
                                        },
                                    ]}
                                ]
                            }
                        ]}
                    />                    
                    :null}
                </div>
            
        );
    }

}

Settings.defaultProps = {
    idVoucher: 0,
    dataSettings : {
        los:'',
        text_los:'',
        amount:'',
        text_amount:'',   
        max_Booking:'',
        text_MaxBooking:'',
        stay_dates:'', 
        booking_dates:'',
        start_stay_dates :'1900-01-01',
        end_stay_dates :'1900-01-01',
        start_booking_dates :'1900-01-01',
        end_booking_dates :'1900-01-01',
        sales_limit :'',
        text_sales_limit:'',
        stay_dates_value:[],
        booking_dates_value:[],
        cancellation_policy:'',
        country_option:'',
        country_targeting:[],
        market_option:'',
        market_targeting:[],
        channels:'',
        select_channels: [],
    }
}
