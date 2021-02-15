import React, { Component } from "react";
import CleverConfig from "../../../../../config/CleverConfig";
import {CleverForm,CleverRequest,MComponentes,CleverAccordion, CleverLoading} from "clever-component-library";
import Header from '../../../components/header/Header';
import Offer from './Offer/Offer';
import Settings from './Settings/Settings'
import RestriccionsByProperty from './Restriccions/RestriccionsByProperty';

export default class DetailVouchers extends Component {
    
    constructor(props) {
        super(props);
        this.startPag = this.startPag.bind(this);
        this.getDataVoucher = this.getDataVoucher.bind(this);     
        this.generaRequestVoucher = this.generaRequestVoucher.bind(this);    
        this.validateOption = this.validateOption.bind(this);    

        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : false,  
            hiddenRoomRate:true
        }
        this.TableMain = React.createRef();
    }

    componentDidMount(){
        this.setState({idVoucher:this.props.idVoucher},()=>{
            this.startPag();
        }); 
    } 

    startPag(){
        let id = this.state.idVoucher;
        let dateNow= Date().toString();
        
        id !== 0 
        ? 
            this.setState({load: true},()=>{this.getDataVoucher()})            
        :
            this.setState({
                dataInformation: {  voucher_name: '',
                                    voucher_code: '',           
                                    status: [''],},
                dataOffer: {discount: '',
                            value: '',
                            type: '',
                            currency: '',
                            maximum_nights_option: '',
                            maximum_nights_value: '',      
                            description: []
                        }, 
                dataRestriccions : {room_rates:''},
                dataRatePlans:[], 
                dataSettings : {
                        los:'',
                        text_los:'',
                        amount:'',
                        text_amount:'',  
                        max_Booking:'',
                        text_MaxBooking:'',             
                        stay_dates:'', 
                        booking_dates:'',
                        start_stay_dates :dateNow,
                        end_stay_dates :dateNow,
                        start_booking_dates :dateNow,
                        end_booking_dates :dateNow,
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
                },                                       
            }); 
          
    }  

    getDataVoucher(){
        let idVoucher = this.state.idVoucher;
        let dataInformation={};
        let dataOffer={};
        let dataRestriccions={};
        let dataRatePlans = [];
        let dataSettings={};        
        let dateNow= Date().toString();
        let arrayCheckedsChannels=[];

        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/promocode/search-by-voucher/${idVoucher}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error){
                if (!response.Error) {
                    let data = response.data;        
                    let arrayLangDefault=[];

                    dataInformation.voucher_name = data.name;
                    dataInformation.voucher_code = data.code;            
                    dataInformation.status =  data.estado == 0 ? [] : ["Status"];
    
                    dataOffer.discount = String(data.iddef_promo_code_discount_type);
                    dataOffer.value = data.value_discount? String(data.value_discount) : '0.0';
                    dataOffer.type = String(data.iddef_promo_code_type_amount);
                    data.currency_code == 'ALL CURRENCIES' ? data.currency_code = '' :null;
                    dataOffer.currency = data.currency_code !== null ? data.currency_code !== '' ? data.currency_code : '0' : '0';
                    dataOffer.maximum_nights_option = String(data.maximum_nights_option);
                    dataOffer.maximum_nights_value = data.maximum_nights_value !== 0 ? data.maximum_nights_value :0.0;       
                    dataOffer.description = data.description;
                    dataOffer.description.map((description)=>{
                        let nameLang = description.lang_code;
                        arrayLangDefault.push(nameLang);
                    });
                    dataOffer.editorByLang = arrayLangDefault;
                    dataRestriccions.room_rates = data.room_types_option;  
                    dataRatePlans = data.promo_code_rateplans;
                    
                    dataSettings.los = String(data.min_LOS_option);
                    dataSettings.text_los = String(data.min_LOS_value);
                    dataSettings.amount = String(data.min_booking_amount_option);
                    dataSettings.text_amount = String(data.min_booking_value);      
                    dataSettings.max_Booking = String(data.max_booking_amount_option);
                    dataSettings.text_MaxBooking = String(data.max_booking_value);       
                    dataSettings.stay_dates = String (data.stay_dates_option);  
                    dataSettings.booking_dates = String(data.booking_dates_option);
                    dataSettings.start_stay_dates = dateNow;
                    dataSettings.end_stay_dates = dateNow;
                    dataSettings.start_booking_dates = dateNow;
                    dataSettings.end_booking_dates = dateNow;
                    dataSettings.sales_limit = String (data.global_sales_limit_option);
                    dataSettings.text_sales_limit = String(data.global_sales_limit_value);
                    dataSettings.stay_dates_value = data.stay_dates_value;
                    dataSettings.booking_dates_value = data.booking_dates_value;
                    dataSettings.booking_times_value = data.booking_times_value;
                    dataSettings.cancellation_policy = String(data.cancel_policy_id);
                    dataSettings.country_option = String(data.country_option);
                    dataSettings.country_targeting =  data.country_targeting !== null ? data.country_targeting : [];
                    dataSettings.market_option = String(data.market_option);
                    dataSettings.market_targeting = data.market_targeting !== null ? data.market_targeting.length > 0 ? data.market_targeting.map(String) : [] : [];
                    dataSettings.channels = String(data.channel_option);

                    data.promo_code_channels.map((channels)=>{
                        let channel = String(channels.iddef_channel);           
                        arrayCheckedsChannels.push(channel);
                    });
                    dataSettings.select_channels = arrayCheckedsChannels;
                    

                    this.setState({
                        dataInformation: dataInformation,
                        dataOffer: dataOffer, 
                        dataRestriccions : dataRestriccions, 
                        dataRatePlans : dataRatePlans,
                        dataSettings : dataSettings,                                       
                    },()=>{
                        this.setState(
                            {load: false,},
                            ()=>{
                                let dataRestriccions = this.state.dataRestriccions;                                    
                                dataRestriccions.room_rates == '2' 
                                ? this.setState({hiddenRoomRate:false})
                                : this.setState({hiddenRoomRate:true});

                                // this.refOffer.setDataOffer(this.state.dataOffer);
                                this.refSettings.setValuesSettings(idVoucher,dataSettings);
                            });
                    });
                    
                }else{
                    let menssage = `There isn't data`;       
                    MComponentes.toast(menssage);                    
                    this.setState({
                                    load: false                  
                                },()=>{
                                    this.setState({ hiddeNotificationModal: false, notificationMessage: menssage, notificationType: "error"});
                                });   
                }
            }else{
                this.setState({
                    load: false                  
                }); 
            }
        });
    }

    generaRequestVoucher(){
        let data = {};
        let idVoucher = this.state.idVoucher;

        let refInformation = this.refInformation.getData();        
        let requiredInformation = refInformation.required.count;

        let refOffer = this.refOffer.refOffer.getData();        
        let requiredOffer = refOffer.required.count;

        let refRestriccions = this.refRestriccions.getData();
        let requiredRestriccions = refRestriccions.required.count;
        
        let refSettings = this.refSettings.refSettings.getData();
        let requiredSettings = refSettings.required.count;
        
        let isErrorValueDates = false;
        requiredSettings == 0 ?
            isErrorValueDates = this.refSettings.validateRequiereDates()
        :null;

        if (requiredInformation > 0 || requiredOffer > 0 || requiredRestriccions > 0 || requiredSettings > 0 || isErrorValueDates.isError == true) {     
            let nameInfo = requiredInformation > 0 ? 'Information,': '';
            let nameOffer = requiredOffer > 0 ? 'Offer,': '';     
            let nameRestriccions = requiredRestriccions > 0 ? 'Restriccions,': '';            
            let nameSettings = requiredSettings > 0 ? 'Settings': '';     

            let menssage = `Complete the data required to Section: ${nameInfo} ${nameOffer} ${nameRestriccions} ${nameSettings}`;       
            isErrorValueDates.isError == true ?
                isErrorValueDates.msg.map(msg => MComponentes.toast(msg))
            :MComponentes.toast(menssage);

            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: menssage, 
                notificationType: "error",});
            data.isError= true;
            data.idVoucher = idVoucher;
            data.request = {};
        } else {
            let request = {};
            let dataInformation = refInformation.values;
            let dataOffer = refOffer.values;
            let dataRestriccions = refRestriccions.values;
            let dataSettings = refSettings.values;
            // console.log('dataSettings ==> ',dataSettings);
            idVoucher == 0 ? request.iddef_promo_code = 0 : null;
            // request.iddef_property                  = property;
            request.name                            = dataInformation.voucher_name;
            request.code                            = dataInformation.voucher_code;
            request.estado                          = dataInformation.status.length > 0 ? 1 : 0;
            request.iddef_promo_code_discount_type  = parseInt(dataOffer.discount);
            request.value_discount                  = request.iddef_promo_code_discount_type == 1 ? dataOffer.value !=="" ? parseInt(dataOffer.value) : 0 : 0;
            request.iddef_promo_code_type_amount    = request.iddef_promo_code_discount_type == 1 ? dataOffer.type !=="" ?parseInt(dataOffer.type) : 0 : 0;
            request.currency_code                   = request.iddef_promo_code_discount_type == 1 ? dataOffer.currency !== '0'  ? dataOffer.currency : '' :'';
            request.maximum_nights_option           = request.iddef_promo_code_discount_type == 1 ? dataOffer.maximum_nights_option !=="" ? parseInt(dataOffer.maximum_nights_option):0 :0;
            request.maximum_nights_value            = request.iddef_promo_code_discount_type == 1 ? dataOffer.maximum_nights_value !=="" ? dataOffer.maximum_nights_value :0.0 :0.0;
            request.description                     = this.refOffer.getValuesEdit();
            request.room_types_option               = parseInt(dataRestriccions.room_rates); 
            request.promo_code_rateplans            = request.room_types_option == 1 ? [] : this.refRatePlans.getValuesFrm();
            request.min_LOS_option                  = dataSettings.los!=="" ? parseInt(dataSettings.los) : 1 ;
            request.min_LOS_value                   = dataSettings.text_los !=="" ? parseInt(dataSettings.text_los) : 0;
            request.min_booking_amount_option       = dataSettings.amount !=="" ? parseInt(dataSettings.amount) : 1  ;
            request.min_booking_value               = dataSettings.text_amount !=="" ? parseInt(dataSettings.text_amount) : 0 ;
            request.max_booking_amount_option       = dataSettings.max_Booking !=="" ? parseInt(dataSettings.max_Booking) : 1  ;
            request.max_booking_value               = dataSettings.text_MaxBooking !=="" ? parseInt(dataSettings.text_MaxBooking) : 0 ;
            request.global_sales_limit_option       = dataSettings.sales_limit  !=="" ? parseInt(dataSettings.sales_limit) :  1;
            request.global_sales_limit_value        = dataSettings.text_sales_limit  !=="" ? parseInt(dataSettings.text_sales_limit) : 0;            
            request.cancel_policy_id                = dataSettings.cancellation_policy  !=="" ? parseInt(dataSettings.cancellation_policy) : 0 ;  
            request.market_option                   = dataSettings.market_option !=="" ? parseInt(dataSettings.market_option) : 0 ; 
            request.market_targeting                = (request.market_option == 0 || request.market_option == 1) ? [] : dataSettings.market_targeting.map((item)=>{return parseInt(item);});
            request.country_option                  = dataSettings.country_option !=="" ? parseInt(dataSettings.country_option) : 0 ; 
            request.country_targeting               = (request.country_option == 0 || request.country_option == 1) ? [] : dataSettings.country_targeting;
            request.channel_option                  = dataSettings.channels  !=="" ? parseInt(dataSettings.channels) : 0 ;  
            request.channel_list                    = (request.channel_option == 0 || request.channel_option == 1) ? [] : this.refSettings.getValueListChannels(); 
            request.stay_dates_option               = dataSettings.stay_dates !=="" ? parseInt(dataSettings.stay_dates) : 1 ;
            request.booking_dates_option            = dataSettings.booking_dates !=="" ? parseInt(dataSettings.booking_dates) : 1  ;
            request.stay_dates_value                = this.refSettings.getValueStayDate();
            request.booking_dates_value             = this.refSettings.getValuesBookingDates();
            request.booking_times_value             = this.refSettings.getValuesBookingTimesDates();

            data.isError = false;
            data.idVoucher = idVoucher;
            data.request = request;
        }

        return data;
    }  
    
    validateOption(e){
        if(this.refRestriccions !== undefined){            
            let dataRestriccions = this.state.dataRestriccions;            
            dataRestriccions[e.name] = e.value;
            
            this.setState({dataRestriccions:dataRestriccions},()=>{
                let valueRestriction = this.refRestriccions.getData().values;
                let valueRoomRate = valueRestriction.room_rates;
                
                valueRoomRate == '2' 
                ? this.setState({hiddenRoomRate:false})
                : this.setState({hiddenRoomRate:true})
            });
        }
    }

    render(){  
        let {load,dataInformation,idVoucher,dataOffer,
            dataRestriccions,hiddenRoomRate,dataRatePlans,dataSettings}= this.state;   

        return(
            <div className='row'>
                <CleverLoading show={load}/>
                <Header title={'ADD/EDIT VOUCHER'} controls={[
                            { control: <div className="row">
                                            <div className='col s12 m3 l3'>
                                                <button type='button' onClick={(e) => this.props.onClose(e,'close','')} ref={this.btnCloseGeneralInfo} id="btnCloseGeneralInfo" className='btn'>CLOSE</button>
                                            </div>
                                            <div className='col s12 m1 l1'></div>
                                            <div className='col s12 m8 l8'>
                                                <button type='button' onClick={(e) =>this.props.onSave(e)} ref={this.btnSaveGeneralInfo} id="btnSaveGeneralInfo" className='btn'>SAVE VOUCHER</button>
                                            </div> 
                                        </div> 
                        }]}/>
                <CleverAccordion 
                    id={'collapsibleVoucher'}
                    accordion={
                        {
                            head:[
                                {accordion:'information',label:'INFORMATION', controls:[]},
                                {accordion:'offer',label:'OFFER', controls:[]},
                                {accordion:'restriccions',label:'RESTRICCIONS BY PROPERTY', controls:[]},
                                {accordion:'settings',label:'SETTINGS', controls:[]},

                            ],
                            body:[
                                {
                                    information: <div className='row'><CleverForm
                                                    id={'Information'}
                                                    ref={ref => this.refInformation = ref}
                                                    data={dataInformation}
                                                    size='col s12 m12 l12'
                                                    forms={[
                                                            { 
                                                            inputs:[                                  
                                                                    {row:[
                                                                        {type:'text',size:'col s12 m6 l12',name:'voucher_name',label:'* Internal voucher name', placeholder:'Insert Internal voucher name',
                                                                        characters: true, alphanumeric:true,required: true},
                                                                        {type:'text',size:'col s12 m6 l12',name:'voucher_code',label:'* Vaucher code', placeholder:'Insert Vaucher code',
                                                                        characters: true, alphanumeric:true,required: true},
                                                                        {type:'checkbox',size:'col s12 m6 l12',name:'status',checkboxs:[{value:"Status", label:"Enabled"}]}
                                                                                            
                                                                    ]},
                                                            ]
                                                        }, 
                                                    ]}                                        
                                                /></div>,

                                    offer: <div className='row'>
                                            {dataOffer ?
                                                <Offer 
                                                    dataOffer={dataOffer} 
                                                    ref={ref => this.refOffer = ref}                                                                                  
                                                />
                                            :null}
                                            </div>,
                                    restriccions:  <div className='row'>
                                                        <CleverForm
                                                            id={'Restriccions'}
                                                            ref={ref => this.refRestriccions = ref}
                                                            data={dataRestriccions}
                                                            forms={[
                                                                    { 
                                                                    inputs:[
                                                                            {row:[
                                                                                {type:'select',size:'col s12 m3 l3', name:'room_rates',label:'',
                                                                                    onChange:e=>this.validateOption(e),
                                                                                    options:[{value:'1',option:'No Restrictions'}, 
                                                                                    {value:'2',option:'Rooms-Rate'}], required:true},
                                                                            ]}
                                                                        ],
                                                                    }, 
                                                                ]}
                                                        />
                                                        {hiddenRoomRate == false ?
                                                            <RestriccionsByProperty 
                                                                dataRatePlans={dataRatePlans}
                                                                ref={ref => this.refRatePlans = ref}
                                                            />
                                                        :null}
                                                    </div>,
                                    settings: <div className='row'><Settings 
                                                idVoucher = {idVoucher}
                                                dataSettings= {dataSettings}   
                                                ref={ref => this.refSettings = ref}                                          
                                            /></div>                                    
                                }
                            ],
                        }
                    }                                                    
                />   
            </div>
        );
    }   
}

DetailVouchers.defaultProps = {
    onClose: () => {},
    onSave: () => {},
    idVoucher: 0
}