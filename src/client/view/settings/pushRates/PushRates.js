
import React, { Component }  from 'react';
import {CleverLoading,CleverForm,Datepicker,CleverRequest,Card,MComponentes} from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";
import ResponsePushRate from "./ResponsePushRate";
import moment from 'moment';

export default class PushRates extends Component  {

    constructor(props) {
        super(props);

        this.startPagPush = this.startPagPush.bind(this);
        this.newPush = this.newPush.bind(this);
        this.changeStatus = this.changeStatus.bind(this);
        this.savePushRate =  this.savePushRate.bind(this);
        this.getSelectResorts = this.getSelectResorts.bind(this);
        this.getaDataRatePlan = this.getaDataRatePlan.bind(this);
        this.handlerChangeSelect = this.handlerChangeSelect.bind(this);
        this.changeResort = this.changeResort.bind(this);
        
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
            includePromotion:false,
            isviewDateProm:false,
            isviewDetailRate:false,
            refundable:false,
            viewResponse:false,
            isviewFormPush:true,
            isViewBtn:false,
            isErrorResponse:false,
            msgError:"",
            responsePushRate:[],
            disableRates:true
        }
    }
    
    componentDidMount() {         
        this.startPagPush();
    }

    startPagPush(){
        this.setState({load:true,isviewFormPush:true,viewResponse:false});
        this.getSelectResorts();
    }

    getSelectResorts(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +"/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) 
            {
                if(!response.Error){
                    let listSelect = [];
                    let listResorts = [];
                    response.data.map((dataResort) =>{
                        if(dataResort.estado == 1){
                            let dataSelected = {};

                            dataSelected.value = String(dataResort.property_code);
                            dataSelected.option = `${dataResort.property_code}  /  ${dataResort.short_name}`;

                            listSelect.push(dataSelected);
                            listResorts.push({resort:dataResort.property_code, idResort:dataResort.iddef_property})
                        }
                    });

                    this.setState({listResorts:listSelect,listAllResorts:listResorts,load:false});
                }else{
                    this.setState({listResorts:listSelect,listAllResorts:listResorts,load:false});
                    // console.log('ERROR: ',response.Msg)
                }
            }
            else
            {
                this.setState({ load: false });
                // console.log(error)
            };
        });
    }

    getaDataRatePlan(url){        
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +url, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) 
            {
                if(!response.Error){
                    let listSelect = [];
                    let listDataRate = []; 
                    let statusRate = true;

                    response.data.map((dataRate) =>{
                        if(dataRate.estado == 1){
                            let dataSelected = {};
                            let dataArrayRate = {};

                            dataSelected.value = String(dataRate.code);
                            dataSelected.option = dataRate.code;

                            dataArrayRate.code = dataRate.code;
                            dataArrayRate.rate_code_clever = dataRate.rate_code_clever;
                            dataArrayRate.refundable = dataRate.refundable;

                            listSelect.push(dataSelected);
                            listDataRate.push(dataArrayRate);
                        }
                    });

                    listSelect.length > 0 ?
                        statusRate = false
                    : MComponentes.toast('There are not rates plans configured');
                    
                    this.setState({ratePlanChanel:listSelect,dataRatesPlan:listDataRate,load: false,disableRates:statusRate})
                }else{
                    this.setState({ load: false });
                    MComponentes.toast("An error occurred when consulting the rate plan. Please contact system");
                    this.setState({ hiddeNotificationModal: false, notificationMessage: "An error occurred when consulting the rate plan. Please contact system", notificationType: "error"});
                }
            }
            else
            {
                this.setState({ load: false });
                MComponentes.toast("An error occurred when consulting the rate plan. Please contact system");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "An error occurred when consulting the rate plan. Please contact system", notificationType: "error"});
            };
        });
    }

    newPush(){
        this.setState({dataRates:{}},()=>{this.startPagPush();});
    }
    /**Metodo que muestra el detalle (code rate plan clever y refundable) del rate plan seleccionado en el combo
     * rate plan channel
     */
    handlerChangeSelect(e){
        let dataRfm = {};
        let valuerefundable = 0;
        let valueViewDateProm = this.state.isviewDateProm;
        let valueProm = this.state.includePromotion;
        let valueArrayRatePlan = this.state.dataRatesPlan;
        let valueSelectedRate = e.value;
        let valueFrmAct = this.refPushRates.getData().values;

        valueArrayRatePlan.map((data)=>{

            if(valueSelectedRate == data.code){
                dataRfm.rate_plan_clever = data.rate_code_clever;
                valuerefundable = data.refundable
            }
        });
        
        dataRfm.rate_plan_channel = valueSelectedRate    
        dataRfm.resort = valueFrmAct.resort;
        dataRfm.start_date = valueFrmAct.start_date;
        dataRfm.end_date = valueFrmAct.end_date;
        dataRfm.date_start_promotions = valueFrmAct.date_start_promotions;

        this.setState({ isviewDetailRate : true,
                        refundable : valuerefundable,
                        isviewDateProm : valueViewDateProm,
                        includePromotion: valueProm
                    },()=>{
                       this.setState({dataRates : dataRfm,});
                    });
    }

    changeResort(e){               
        let {listAllResorts} = this.state;  
        let codeResort = e.value;
        let findResort = listAllResorts.find(data => data.resort == codeResort);
        if(findResort !== undefined){
            let idproperty = findResort.idResort;
            let url= `/api/rate-plan/get?all=1&property=${idproperty}`;
            this.setState({ load: true },()=>{this.getaDataRatePlan(url);});            
        }
    }
    /**Metodo para mostrar u ocultar  input date start promotion, dependiendo de la 
     * opcion selccionada en include promotion
    */
    changeStatus(tipo,status){

        if(tipo == 'promotion'){
            switch(status){
                case 1:
                    this.setState({includePromotion:false,isviewDateProm:false});
                    break;
                case 0:
                    this.setState({includePromotion:true,isviewDateProm:true});
                    break;
            }
        }else if(tipo == 'refundable'){
            switch(status){
                case 1:
                    this.setState({refundable:false});
                    break;
                case 0:
                    this.setState({refundable:true});
                    break;
            }
        }
    }
    /** Lanza los eventos cuando se da click en el boton guardar */
    savePushRate(){ 
        this.setState({load:true});     
        let data = this.refPushRates.getData();
        let value = data.values;
        let required = data.required.count;
        let valRefundable = this.state.refundable == false ? false: true; 
        let valIncludePromotion = this.state.includePromotion == false ? 0: 1; 
        let date = new Date();
        let dateNow = moment(date).format('YYYY-MM-DD');
        
        value.start_date == ""  ? required += 1 :null;
        value.end_date == ""  ? required += 1 :null;

        if (required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: "Complete the data required", 
                notificationType: "error",
                load:false});

        } else {
            let requestWireClever = {};
            let valIsErrorResponse;
            let valMsgError;
            let valResponsePushRate ={};
            let valIsviewFormPush;
            let valViewResponse;
            let valIsViewBtn;

            requestWireClever.hotel                 = value.resort;
            requestWireClever.date_start            = moment(value.start_date).format('YYYY-MM-DD');
            requestWireClever.date_end              = moment(value.end_date).format('YYYY-MM-DD');
            requestWireClever.rate_plan_clever      = value.rate_plan_clever;
            requestWireClever.rate_plan_channel     = value.rate_plan_channel;
            requestWireClever.include_promotion     = valIncludePromotion == 0 ? false : true;
            valIncludePromotion == 1?
                requestWireClever.date_start_promotions = value.date_start_promotions !== "" 
                                                            ? moment(value.date_start_promotions).format('YYYY-MM-DD') 
                                                            : dateNow
            : requestWireClever.date_start_promotions = dateNow;
            requestWireClever.refundable            = valRefundable;

            // console.log(JSON.stringify(requestWireClever));

            CleverRequest.postJSON(CleverConfig.getApiUrl('wireclever') + "/api/rates/PushRates_BEngine", requestWireClever, (response, error) => {
                if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";

                    notificationType = "success";
                    notificationMessage = "The data was saved";

                    valIsErrorResponse = false;
                    valMsgError = "";
                    valResponsePushRate = response;
                    valIsviewFormPush = false;
                    valViewResponse = true;
                    valIsViewBtn = true;

                    MComponentes.toast(notificationMessage);
        
                    this.setState({hiddeNotificationModal: false, 
                        notificationMessage: notificationMessage, 
                        notificationType: notificationType });
                                          
                }else{
                    valIsErrorResponse = true;
                    valMsgError =  error;
                    valResponsePushRate = null;
                    valIsviewFormPush = false;
                    valViewResponse = true;
                    valIsViewBtn = true;                    
                }

                this.setState(
                    {
                        isErrorResponse:valIsErrorResponse,
                        msgError:valMsgError,
                        responsePushRate:valResponsePushRate,
                        isviewFormPush:valIsviewFormPush,
                        viewResponse:valViewResponse
                        },()=>{
                            this.setState(
                                {
                                    isViewBtn:valIsViewBtn,
                                    load:false   
                                }
                            );
                        }
                );
            });
           
        }
        
    }

    render() {
        let {listResorts,ratePlanChanel,isviewDetailRate,refundable,
            isviewDateProm,includePromotion,viewResponse,isviewFormPush,
            responsePushRate,isViewBtn, isErrorResponse,msgError,load,dataRates,disableRates}= this.state;

        return (
            <div className="row">
                <CleverLoading show={load}/>
                    <Card header={'Push rates'}
                        control={
                            isViewBtn == true ? 
                            <a className="btn btn-small" onClick={this.newPush}>New push rate</a>
                            : false
                        }
                        style={{
                            "minHeight": "40rem"
                        }}
                    >
                    {isviewFormPush ?
                        <CleverForm
                            id={'form-pushRates'}
                            data={dataRates}
                            ref={ref => this.refPushRates = ref}
                            forms={[
                                {inputs:[
                                    {row:[
                                            {type: 'select',size: 'col s4 m4 l4',label: 'Resort: ',name: 'resort',
                                                options:listResorts,required: true,uppercase: true, onChange:e=>this.changeResort(e)},
                                            {type: 'select',size: 'col s4 m4 l4',label: 'Rate Plan Channel: ',
                                                name: 'rate_plan_channel',options:ratePlanChanel,disabled:disableRates,
                                                required: true,uppercase: true, onChange:this.handlerChangeSelect},
                                    
                                        ]                                   
                                    },
                                    isviewDetailRate == true ?
                                    {row:[
                                        {type: 'text',size: 'col s4 m4 l4',label: 'Rate Plan Clever: ',
                                            name: 'rate_plan_clever',required: false,uppercase: true,
                                            alphanumeric:true,disabled:true},                                    
                                        {type:'component',
                                            component:() =>{
                                                return(
                                                        <div>                                                        
                                                            <label>Refundable:</label>
                                                                <div>
                                                                {
                                                                    refundable == true ?
                                                                    // <a >
                                                                    //     <i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i>
                                                                    // </a>
                                                                    <a onClick={(e) => this.changeStatus('refundable',1)} title=''>
                                                                        <i className='material-icons left'  >toggle_on</i>
                                                                    </a>
                                                                    :
                                                                    <a onClick={(e) => this.changeStatus('refundable',0)} title=''>
                                                                        <i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i>
                                                                    </a>
                                                                    // <a >
                                                                    //     <i className='material-icons left'  >toggle_on</i>
                                                                        
                                                                    // </a>

                                                                }  
                                                                </div>
                                                        </div>
                                                );
                                            }
                                        },  
                                        ],                               
                                    }
                                    :{row:[]},                                
                                    {row:[
                                        {type:'component',
                                            component:() =>{
                                                return(
                                                    <div>
                                                        <div className='col s4 m4 l4'>
                                                            <div >
                                                                <label>Start Date:</label>
                                                            </div>
                                                            <div >
                                                                <Datepicker
                                                                    colDate={'col s12 m12 l12'}
                                                                    name={'start_date'}
                                                                    id={'startDate'}
                                                                />
                                                            </div>
                                                        </div> 
                                                        
                                                        <div className='col s4 m4 l4'>
                                                            <div>
                                                                <label>End Date:</label>
                                                            </div>
                                                            <div>
                                                                <Datepicker
                                                                    colDate={'col s12 m12 l12'}
                                                                    name={'end_date'}
                                                                    id={'endDate'}
                                                                />
                                                            </div>
                                                        </div> 
                                                    </div>
                                                );
                                            }
                                        }, 
                                        ]                                 
                                    },
                                    {row:[                                    
                                        {type:'component',
                                            component:() =>{
                                                return(
                                                    <label>Include Promotion:</label>
                                                );
                                            }
                                        },
                                    ]},
                                    {row:[                                    
                                        {type:'component',
                                            component:() =>{
                                                return(
                                                        <div>
                                                        {
                                                                includePromotion == true ?
                                                                    <a onClick={(e) => this.changeStatus('promotion',1)} title='Include Promotion'>
                                                                        <i className='material-icons left'  >toggle_on</i>
                                                                    </a>
                                                                :
                                                                    <a onClick={(e) => this.changeStatus('promotion',0)} title='Include Promotion'>
                                                                        <i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i>
                                                                    </a>
                                                                }  
                                                        </div>
                                                );
                                            }
                                        },
                                    ]},
                                    isviewDateProm == true ?
                                        {row:[                                    
                                            {type:'component',
                                                component:() =>{
                                                    return(
                                                            <label>Date Start Promotions:</label>  
                                                    );
                                                }
                                            },
                                            {type:'date', colDate:'col s4 m4 l4', name:'date_start_promotions',
                                            labelDate: 'Date Start Promotions:'},
                                        ]}
                                    :{row:[]}
                                ]}
                            ]}  
                            btnAdditionals={[
                                {id:'btnSave',size:'col s12 m3 l3',label:'Save',icon:'add',
                                fullSize:true,onClick:this.savePushRate},
                            ]}              
                        />
                    :
                        ""
                    }
                    </Card>

                {viewResponse == true ?
                    <ResponsePushRate 
                        errorResponse={isErrorResponse} 
                        msgError={msgError}
                        dataResponse={responsePushRate} 
                    />
                :
                    ""
                }
            </div>
        )
    }

}
