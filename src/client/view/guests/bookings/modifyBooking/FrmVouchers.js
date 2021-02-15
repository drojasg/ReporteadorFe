import React, { Component } from "react";
import PropTypes from 'prop-types';
import CleverConfig from "../../../../../../config/CleverConfig";
import {MComponentes, CleverLoading,CleverForm,CleverRequest} from "clever-component-library";

export default class FrmVouchers extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        
        this.AddFrmVoucher = this.AddFrmVoucher.bind(this);
        this.state = {
            load : false,  
            forms: [],
            viewFrm:false,
            hiddenDescription:true,
        }
    }

    componentDidMount(){
        // console.log('PROPS VOUCHER ==> ', this.props);
        this.setState({load:true});
        this.setState({requestGeneralGets: this.props.requestGeneralGets,
                        dataVoucher:this.props.dataVoucher,
                        valueCurrency: this.props.valueCurrency,
                        idsRooms: this.props.idsRooms,
                        idsRates: this.props.idsRates,
        },()=>{
            this.getVouchers(()=>{
                this.state.dataVoucher.iddef_promo_code !== undefined 
                ? this.validateIDVaoucher(this.state.dataVoucher.iddef_promo_code)
                :this.setState({viewFrm: false,hiddenDescription:true},()=>{this.setState({load:false})})
            });            
        });        
    }
    
    updateVoucher=(nameState,updateState)=>{        
        let dataRef = this.state.viewFrm == true ? this.refVoucher !== null ? this.refVoucher.getData().values : {iddef_promo_code:0} : {iddef_promo_code:0};
        this.setState({load:true,[nameState]: updateState,listVouchers:[],dataVoucherAll:[]},()=>
            {
                this.getVouchers(()=>{
                    let {viewFrm,listVouchers}= this.state;
                    //Si existe formulario de voucher, sino no hace nada
                    if(viewFrm && listVouchers.length >0){    
                        this.validateIDVaoucher(dataRef.iddef_promo_code);
                    }                    
                });
            }
        );
    }

    validateIDVaoucher(iddef_promo_code){
        let {dataVoucherAll}= this.state;
        let idVoucherSelected = iddef_promo_code;
        let findVoucherCurrent = idVoucherSelected !== "" ?  dataVoucherAll.find(voucher=> voucher.iddef_promo_code == parseInt(idVoucherSelected)):undefined;
        //Si en el nuevo listado no existe concidencia con el voucher anterior limpiar campos
        if(findVoucherCurrent == undefined){
            this.setState({dataVoucher:{},viewFrm: false,hiddenDescription:true},()=>{this.setState({load:false})})
        }else{
            this.setState({viewFrm: true,hiddenDescription:false},()=>{this.setState({load:false});});
        }
    }

    getVouchers(functionVoucher=()=>{}){
        this.setState({load:true});
        let {idsRooms,idsRates,requestGeneralGets} = this.state;
        let idsRoomsCurrent = idsRooms.filter(data => data !== 0);
        let idsRatesCurrent = idsRates.filter(data => data !== 0);
        let requestVoucher ={
            "lang_code": requestGeneralGets.lang_code,
            "property_code": requestGeneralGets.property_code,
            "date_start": requestGeneralGets.date_start,
            "date_end": requestGeneralGets.date_end,
            "rateplans": idsRatesCurrent,
            "rooms": idsRoomsCurrent,
            "market": requestGeneralGets.market
        };
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine')+`/api/internal/booking/promocode`,requestVoucher, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {                
                if (!response.Error) {
                    let listAct = response.data !== undefined ? response.data :[];
                    let vouchers= [];                      
                    listAct.map((data) => { 
                        let descritionVoucher = data.promo_code !== undefined ? data.promo_code :"";  
                        vouchers.push({value:`${data.iddef_promo_code}`,option:`${data.name} (${descritionVoucher})`});   
                    }); 
                    this.setState({listVouchers:vouchers,dataVoucherAll:listAct, load: false},functionVoucher);               
                }else{
                    console.log('error', response.Error);
                    this.setState({listVouchers:[],dataVoucherAll:[], load: false},functionVoucher);
                }
                
            }else{
                console.log('error', error);
                this.setState({listVouchers:[],dataVoucherAll:[], load: false},functionVoucher);
            }
        });   
    }

    AddFrmVoucher(e){  
        this.setState({dataVoucher:{
            "description":"",
            "iddef_promo_code":"0",
            "in_text":true,
            "name":"",
            "promo_code":"",
            "value":"",
            "voucher_discount_type":"",
        },load:true},()=>{
            this.setState({viewFrm:true,hiddenDescription:true},()=>{
                this.setState({load:false});
            })
        }); 
    }

    deleteFrm(){
        this.setState({load:true},()=>{
            this.setState({dataVoucher:{},viewFrm: false,hiddenDescription:true},()=>{
                this.setState({load:false});
                this.props.getDataFrms('voucher',[]);
            })
        });        
    }

    onChangeVoucher(e){
        this.setState({load:true});
        let {dataVoucherAll,valueCurrency}= this.state;
        let currentVoucher= JSON.parse(JSON.stringify(this.state.dataVoucher));;
        let idVoucher= parseInt(e.value);
        let valueCurrent= dataVoucherAll.find(data => data.iddef_promo_code == idVoucher);
        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
        let valueVoucher = valueCurrent.value !== undefined ? valueCurrent.value : 0.0;

        currentVoucher.description= valueCurrent !== null ? valueCurrent.description : "";
        currentVoucher.iddef_promo_code= valueCurrent !== null ? String(valueCurrent.iddef_promo_code) : "";
        currentVoucher.in_text= valueCurrent !== null ? valueCurrent.in_text : true;
        currentVoucher.name= valueCurrent !== null ? valueCurrent.name : "";
        currentVoucher.promo_code= valueCurrent !== null ? valueCurrent.promo_code : "";
        currentVoucher.value= valueCurrent !== null ? 
                    valueCurrent.in_text == false ? 
                    valueCurrent.voucher_discount_type != "Percent" ?
                    `${numberFormat.format(valueVoucher)} ${valueCurrency}` 
                    :`${valueVoucher} %` 
                    :""
                    : "";
        currentVoucher.voucher_discount_type= valueCurrent !== null ? valueCurrent.voucher_discount_type : "";
        
        this.setState({dataVoucher:currentVoucher},()=>{
            this.setState({viewFrm: true,hiddenDescription:false,load:false});
            this.props.getDataFrms('voucher',[]);
        });
    }

    getValueVoucher=(type)=>{
        let {viewFrm,dataVoucher,dataVoucherAll} = this.state;
        let idPromo = "";
        let idSelectionFrm = dataVoucher.iddef_promo_code;
        switch(type){
            case "id":
                        idPromo = viewFrm == true ? idSelectionFrm :"0";
                break;
            case "code":
                        if(viewFrm == true){
                            let voucherSelected = dataVoucherAll.find(voucher => voucher.iddef_promo_code == parseInt(idSelectionFrm));
                            if(voucherSelected !== undefined){
                                idPromo= String(voucherSelected.promo_code);
                            }
                        } 
                break;
            default:
                break;
        }
       
        return idPromo;
    }

    render(){  
        let {load,viewFrm,dataVoucher,listVouchers,hiddenDescription}= this.state;
        let lengthVoucher = listVouchers !== undefined ? listVouchers.length : 0;
        return(
            <>
                <CleverLoading show={load}/> 
                <div className='row'>
                    <div className='col s12 m10 l10'></div>
                    <div className='col s12 m2 l2'>
                        {viewFrm == false && lengthVoucher > 0 ? 
                            <a onClick={e=>this.AddFrmVoucher(e)} title='Add Voucher'>
                                <i className='small material-icons right'>add_box</i>
                            </a> 
                        :null }
                    </div>
                </div>
                {viewFrm == false && lengthVoucher > 0?
                <div className='row' style={{paddingLeft:'10px'}}>
                    <p>There aren't added services voucher</p>
                </div>
                :null}
                {lengthVoucher == 0 ?
                <div className='row' style={{paddingLeft:'10px'}}>
                    <p>Not vouchers available</p>
                </div> 
                :null}
                {viewFrm == true && lengthVoucher >0?
                    <div >
                        <CleverForm
                            id={`modifyVoucher`}
                            ref={ref => this.refVoucher =ref}                        
                            data={dataVoucher}
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
                                                                <a onClick={e=>this.deleteFrm(e)} title='Delete Voucher'>
                                                                    <i className='material-icons right'>delete</i>
                                                                </a>
                                                            </div>
                                                        </>                                                
                                                    )
                                                }
                                            },
                                        ]},
                                        {row:[
                                            {type:'select',size:'col s12 m6 l6',name:'iddef_promo_code',label:'Voucher', 
                                                placeholder:'Select Voucher',manual: true,options:listVouchers,
                                                autocomplete:true, required: true, onChange:e=>this.onChangeVoucher(e)},
                                        ]}, 
                                        {row:[
                                            {type:'text',size:'col s12 m4 l4',name:'promo_code',label:'Promo Code', 
                                                placeholder:' ',characters:true,alphanumeric:true,
                                                disabled:true, hidden:hiddenDescription },
                                            {type:'text',size:'col s12 m4 l4',name:'name',label:'Name',hidden:hiddenDescription, 
                                                placeholder:'Insert Name',characters:true,alphanumeric:true,disabled:true },
                                            {type:'text',size:'col s12 m4 l4',name:'value',label:'Value', hidden:hiddenDescription,
                                                placeholder:' ',characters:true,alphanumeric:true,disabled:true },                                    
                                        ]},
                                        {row:[
                                            {type:'text',size:'col s12 m6 l6',name:'voucher_discount_type',label:'Voucher discount type', 
                                                placeholder:'Insert Voucher discount',characters:true,alphanumeric:true,
                                                hidden:dataVoucher.in_text,disabled:true },
                                            {type:'text',size:'col s12 m6 l6',name:'description',label:'Description', 
                                                placeholder:' ',characters:true,alphanumeric:true,
                                                hidden:dataVoucher.in_text,disabled:true },
                                        ]}                             
                                    ]
                                }
                            ]}                        
                        />
                        <div className='row'></div>
                    </div>
                :null
                }
                <div className='row'></div>
            </>
        );
    }
}

FrmVouchers.propTypes = {
    onRef: PropTypes.func,
    getDataFrms: PropTypes.func,
    requestGeneralGets: PropTypes.object,
    dataVoucher : PropTypes.object,
    valueCurrency: PropTypes.string,
    idsRooms: PropTypes.array,
    idsRates: PropTypes.array
}

FrmVouchers.defaultProps = {
    onRef: () => {},
    getDataFrms: () => {},
    requestGeneralGets:{
        lang_code: "",
        property_code: "",
        date_start: "",
        date_end: "",
        market: "",
    },
    dataVoucher:{},
    valueCurrency: "",
    idsRooms: [],
    idsRates: []
}