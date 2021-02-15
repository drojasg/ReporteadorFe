import React, { Component } from "react";
import PropTypes from 'prop-types';
import CleverConfig from "../../../../../../config/CleverConfig";
import {MComponentes, CleverLoading,CleverForm,CleverRequest} from "clever-component-library";

export default class FrmServices extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        
        this.state = {
            load : false,  
        }
    }

    componentDidMount(){
        // console.log('PROPS Services ==> ', this.props);
        this.setState({load:true});
        this.setState({
            listFormsServices:this.props.listFormsServices,
            valueCurrency: this.props.valueCurrency,
            requestGeneralGets: this.props.requestGeneralGets,
            paxesByRoom: this.props.paxesByRoom
        },()=>{
            this.getInputServices(()=>{
                this.createFrmServices(()=>{this.setState({load:false})});
            }); 
        })
    }

    getInputServices(functionServices=()=>{}){      
        this.setState({load:true});  
        let {paxesByRoom,requestGeneralGets} = this.state;
        let requestServices ={
            "lang_code": requestGeneralGets.lang_code,
            "id_hotel": requestGeneralGets.property_code,
            "date_start": requestGeneralGets.date_start,
            "date_end": requestGeneralGets.date_end,
            "rooms": paxesByRoom,
            "market": requestGeneralGets.market,
        };
        
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/service`,requestServices, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {                
                if (!response.Error) {
                    let listAct = response.data !== undefined ? response.data :[];
                    let services= [];                    
                    listAct.map((data) => { 
                        let descritionService = data.service_code !== undefined ? data.service_code :"";  
                        services.push({value:`${data.iddef_service}`,option:`${data.name} (${descritionService})`});   
                    }); 
                    this.setState({listServices:services,listServicesAll:listAct, load: false},functionServices);               
                }else{
                    console.log('error', response.Error);
                    this.setState({listServices:[],listServicesAll:[],load: false},functionServices);
                }
                
            }else{
                console.log('error', error);
                this.setState({listServices:[],listServicesAll:[],load: false},functionServices);
            }
        });   
    }

    createFrmServices(functionCreateService=()=>{}){
        let {listFormsServices,listServices,valueCurrency}= this.state;
        let listFrmServices =[];
        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
        
        listFormsServices.sort().map((dataServices,key)=>{
            dataServices.totalPrice = `${numberFormat.format(dataServices.price)} ${valueCurrency}`;
            listFrmServices.push(
                <CleverForm
                        ref={ref => this[`refDataServices${key}`] = ref}
                        id={`modifyServices${key}`}
                        data={dataServices}
                        forms={[
                            {
                                fieldset:true,
                                inputs: [
                                    {row:[
                                        {type: 'component', 
                                            component: () => {
                                                return (
                                                    <>
                                                        <div className='col s12 m10 l10'></div>
                                                        <div className='col s12 m2 l2'>
                                                            <a onClick={e=>this.DeleteFrmService(e,key)} title='Delete Voucher'>
                                                                <i className='material-icons right'>delete</i>
                                                            </a>                                                      
                                                        </div>
                                                    </>                                                
                                                )
                                            }
                                        },
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m12 l12',name:'iddef_service',label:'Service', 
                                        placeholder:'Select Service',manual: true,autocomplete:true, required: true,
                                        options:listServices !== undefined ? listServices: [],
                                        onChange:e=>this.onChangeServices(e,key)},
                                    ]}, 
                                    {row:[
                                        {type:'text',size:'col s12 m9 l9',name:'totalPrice',label:'Total Service Price', 
                                            placeholder:'Insert Total Service Price',characters:true,alphanumeric:true,disabled:true},
                                    ]},
                                ]
                            }
                        ]}
                    />
            )
        });
        this.setState({formsServices:listFrmServices},functionCreateService);
    }

    onChangeServices=(e,indexFrm)=>{
        let {listServicesAll,listFormsServices,valueCurrency}= this.state;
        let idServices= '0';
        let valueCurrent= undefined;
        switch(e.name){
            case 'quantity':
                let valInput = parseInt(e.value);
                let valuesService = this[`refDataServices${indexFrm}`].getData().values;
                idServices = valuesService !== undefined ? parseInt(valuesService.iddef_service) :0;
                valueCurrent= listServicesAll.find(data => data.iddef_service == idServices);
                    if(valInput > 99){
                        MComponentes.toast('Quantity exceeded');
                        listFormsServices[indexFrm].quantity= "";
                        this.createFrmServices(()=>{this.setState({load:false})});
                    }else{
                       let priceCurrent = valueCurrent !== undefined ? valInput*valueCurrent.price : 0;
                       listFormsServices[indexFrm].quantity= e.value;
                       listFormsServices[indexFrm].price = priceCurrent;
                       this.createFrmServices(()=>{this.setState({load:false})});
                    }                   
                break;
            case 'iddef_service':                    
                    idServices= parseInt(e.value);
                    valueCurrent= listServicesAll.find(data => data.iddef_service == idServices);
                    if(valueCurrent !== undefined){
                        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
                        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
                         listFormsServices[indexFrm].iddef_service= e.value;
                        listFormsServices[indexFrm].quantity= 1;
                        listFormsServices[indexFrm].price= valueCurrent.price;
                        listFormsServices[indexFrm].totalPrice= `${numberFormat.format(valueCurrent.price)} ${valueCurrency}`
                        this.createFrmServices(()=>{
                            this.setState({load:false});
                            this.props.getDataFrms('services',[]);
                        });
                    }
                    
                break;
            case 'totalPrice':
                    let splitPrice = e.value.split(" ");
                    this.state.listFormsServices[indexFrm].price= splitPrice[0];
                    this.state.listFormsServices[indexFrm].totalPrice= e.value;
                break
            default:
                break;
        }
    }

    updateServices =(nameState,updateState)=>{
        this.setState({load:true});  
        this.setState({[nameState]: updateState,listServices:[],listServicesAll:[]},()=>
            {
                this.getInputServices(()=>{
                    let {listServices,listFormsServices}= this.state;

                    if(listServices.length > 0){
                        listFormsServices.sort().map((dataServices,key)=>{
                            let finServicesCurrent = listServices.find(services => services.value ==dataServices.iddef_service);
                            finServicesCurrent == undefined ? listFormsServices[key] = {iddef_service: "0", totalPrice: "0.00 MXN",quantity:0} :null;
                        });    
                    }                        
                    this.createFrmServices(()=>{this.setState({load:false})});
                })
            }
        );
    }

    AddFrmServices(e){
        this.setState({load:true});  
        let {listFormsServices}= this.state;
        listFormsServices.push({
            iddef_service:"0",
            quantity:"",
            totalPrice:"",
            price:"0"
        });
        this.createFrmServices(()=>{this.setState({load:false})});
    }

    DeleteFrmService(e,indexFrm){
        this.setState({load:true});  
        this.state.listFormsServices.splice(indexFrm,1);
        this.createFrmServices(()=>{
            this.setState({load:false})
            this.props.getDataFrms('services',[]);
        });
        MComponentes.toast("The form services was remove");
    }

    getAmountServices=()=>{
        let {listFormsServices} = this.state;
        let amountServices = 0;

        if(listFormsServices.length >0){
            listFormsServices.sort().map((dataServices)=>{
                let valCurrency = dataServices.price !== undefined ? Number(dataServices.price):0;
                amountServices =  amountServices + valCurrency;
            });
        }
        return amountServices;
    }

    getValueServices=()=>{
        let {listFormsServices}= this.state;
        let responseServices = {};
        let services= [];           
        
        if(listFormsServices.length >0){
            let validation = this.validateService(); 
            let isError = validation.filter(val => val.error== true);        
            if(isError.length == 0){                
                validation.map(data=>{
                    services.push(parseInt(data.idService)); 
                });
                responseServices.error= false;
                responseServices.services= services;
            }else{
                let message= "";
                isError.map(error =>{
                    message = `${message} ${error.message},`
                });
    
                MComponentes.toast(`Select service in the ${message}`);
                    this.setState({ hiddeNotificationModal: false, notificationType: "error", 
                        notificationMessage: `Select service in the ${message}`});  
                responseServices.error= true; 
                responseServices.services= []; 
            }
        }else{
            responseServices.error= false;
            responseServices.services= []; 
        }       
        return responseServices;
    }

    validateService(){
        let {listFormsServices,listServices}= this.state;
        let responseValidation= [];
        let lengthListServices= listServices? listServices.length :0;

        if(lengthListServices > 0){
            listFormsServices.sort().map((data,key)=>{
                let dataCurrent= {};
                if(this[`refDataServices${key}`] !== null){
                    let dataService = this[`refDataServices${key}`].getData();
                    let requiredService = dataService.required.count;  
                    if(requiredService > 0){
                        dataCurrent.error= true;
                        dataCurrent.message = ` Form ${key+1}`;
                        dataCurrent.idService = "";
                    }else{
                        dataCurrent.error= false;
                        dataCurrent.message = "";
                        let valuesService = dataService.values;
                        dataCurrent.idService = valuesService.iddef_service;
                    }
                    responseValidation.push(dataCurrent);    
                }
            });    
        }
        return responseValidation
    }

    render(){  
        let {load,formsServices,listServices}= this.state;
        let lengthListServices= formsServices? formsServices.length :0;
        let lengthServicesAvail = listServices!== undefined ? listServices.length : 0;
        return(
            <>
                <CleverLoading show={load}/>
                <div className='row'>
                    <div className='col s12 m10 l10'></div>
                    {lengthServicesAvail > 0 ?
                        <div className='col s12 m2 l2'>
                            <a onClick={e=>this.AddFrmServices(e)} title='Add Services'>
                                <i className='small material-icons right'>add_box</i>
                            </a> 
                        </div>
                    :null}
                </div>
                {lengthListServices == 0 && lengthServicesAvail > 0?
                <div className='row' style={{paddingLeft:'10px'}}>
                    <p>There aren't added services</p>
                </div>
                :null}
                {lengthServicesAvail == 0?
                <div className='row' style={{paddingLeft:'10px'}}>
                    <p>Not services available</p>
                </div>
                :null}
                {
                    formsServices && lengthServicesAvail > 0?
                        formsServices.map((form,key) => (<div key={key}><div className='row'>{form}</div><div className='row'></div></div>))
                    :null
                }               
            </>
        );
    }
}

FrmServices.propTypes = {
    onRef: PropTypes.func,
    getDataFrms: PropTypes.func,
    listFormsServices: PropTypes.array,
    valueCurrency: PropTypes.string,
    requestGeneralGets: PropTypes.object,
    paxesByRoom: PropTypes.array
}

FrmServices.defaultProps = {
    onRef: () => {},
    getDataFrms: () => {},
    listFormsServices:[],
    valueCurrency:"",
    requestGeneralGets:{
        lang_code: "",
        property_code: "",
        date_start: "",
        date_end: "",
        market: "",
    },
    paxesByRoom:[]
}