import React, { Component } from "react";
import { Redirect } from 'react-router-dom';
import CleverConfig from "./../../../../../config/CleverConfig";
import {CleverRequest,MComponentes,CleverAccordion, CleverLoading, GridView, Panel} from "clever-component-library";
import DetailVoucher from './DetailVouchers';

export default class MainVouchers extends Component {
    
    constructor(props) {
        super(props);
        this.startPag = this.startPag.bind(this);
        this.handlerChanges = this.handlerChanges.bind(this);
        this.getDataTable = this.getDataTable.bind(this);  
        this.saveVoucher = this.saveVoucher.bind(this);

        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : false,  
            hiddenPrincipal:false
        }
        this.TableMain = React.createRef();
    }

    componentDidMount(){
        // if(this.state.hotelSelected == true){
            this.startPag();
        // }
    } 

    startPag(){
        this.setState({ load: true });   
        this.getDataTable();   
    }  

    getDataTable(){
        // let property = this.state.hotelData.iddef_property;
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/promocode/search-all/get?all`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error==false) {
                    let dataTable = [];
    
                    response.data.map((item, key) => {
                        let tmpItem = item;
    
                        let Status = (item.status == 1)? 'Enable' : 'Disable';
                        tmpItem.status = Status;
    
                        tmpItem.type !== "Text only" ? tmpItem.currency == ''? tmpItem.currency = 'ALL CURRENCIES' : null : tmpItem.currency = '';

                        dataTable.push(tmpItem);
                    });
    
                    this.TableMain.setDataProvider(dataTable); 
                    this.setState({ load: false});
                }else{
                    this.setState({ load: false});
                }
            }else{
                this.setState({ load: false});
            }
            
        });        
    }

    saveVoucher(){
        this.setState({ load: true });
        //extraer la informacion para actualizar o agregar un nuevo voucher        
        let valueRequestVoucher = this.refDetailVoucher.generaRequestVoucher();
        let idVoucher = valueRequestVoucher.idVoucher;
        // console.log('RequestVoucher ==> ',JSON.stringify(valueRequestVoucher.request));
        if(!valueRequestVoucher.isError){
            let requestVoucher = valueRequestVoucher.request;
            if (idVoucher == 0) {
                //CREATE
                CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/promocode/create", requestVoucher, (response, error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";

                        if (!response.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";                        
                            this.handlerChanges('','close','');
                        } else {
                            this.setState({ load: false }); 
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                            
                        }

                        MComponentes.toast(notificationMessage);

                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }else{
                        this.setState({ load: false }); 
                    }
                });
            }else {
                //UPDATE
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/promocode/update/${idVoucher}`, requestVoucher, (response, error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";
                        // console.log('data Response update ',response);
                        
                        if (!response.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.handlerChanges('','close','');                            
                        } else {
                            this.setState({ load: false }); 
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }

                        MComponentes.toast(notificationMessage);

                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }else{
                        this.setState({ load: false }); 
                    }
                });
            }
        }else{
            this.setState({load:false});
        }
    }

    handlerChanges(e,tipo,value){ 
        switch (tipo){
            case 'new':
                    this.setState({idVoucher:0},()=>{this.setState({hiddenPrincipal:true})});
                break;

            case 'edit':
                this.setState({idVoucher:value},()=>{this.setState({hiddenPrincipal:true})});
                break;

            case 'close':
                    this.setState({idVoucher:null},()=>{
                        this.setState({hiddenPrincipal:false});
                        this.startPag();
                    });
                break;

            default:
                break;
        }         
    }

    render(){  
        let {load,hiddenPrincipal,idVoucher}= this.state;   

        return(
            <div className='row'>
                {/* <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine"> */}
                    <CleverLoading show={load}/>
                        
                        {hiddenPrincipal == false ?
                        <div>
                            <CleverAccordion 
                                id={'table_collapsible'}
                                accordion={
                                    {
                                        head:[
                                            {accordion:'vouchers',label:'ALL VOUCHERS', 
                                            controls:[{control: 
                                            <button type='button' onClick={(e) => this.handlerChanges(e,'new','')} 
                                            id="btnColap" className='btn' >CREATE VOUCHER
                                            </button>}]},
                                        ],
                                        body:[
                                            {vouchers: 
                                                <GridView
                                                    idTable='table-vouchers'
                                                    floatHeader= {true}
                                                    onRef={ref => this.TableMain = ref}
                                                    serializeRows={true}
                                                    classTable={'clever-table responsive-table striped bordered'}
                                                    filter={false}
                                                    columns={[
                                                        { attribute : 'iddef_voucher', visible : false },
                                                        { attribute : 'internal_name', alias : 'Name'},
                                                        { attribute : 'code', alias : 'Code voucher' },
                                                        { attribute : 'status', alias : 'Status' },
                                                        { attribute : 'type', alias : 'Type' },
                                                        { attribute : 'offer', alias : 'Offer' },
                                                        { attribute : 'currency', alias : 'Currency' },
                                                        { attribute : 'sold', alias : 'Sold maximum' },
                                                        // { attribute : 'bookable_until', alias : 'Bookable until' },
                                                        {attribute: 'actions',
                                                        alias: 'Actions',
                                                            value : (data) => {
                                                                return (
                                                                <div className='row'>
                                                                    <div className='col s12 m6 l6'>
                                                                        
                                                                        <a href="#" onClick={e=>this.handlerChanges('','edit',data.iddef_voucher)}>
                                                                            <i className="material-icons left">mode_edit</i>
                                                                        </a>
                                                                    </div>
                                                                </div>);
                                                            }
                                                        }
                                                    ]}
                                                />
                                            },
                                        ],
                                    }
                                }
                            />
                        </div>                    
                        :
                        
                        <DetailVoucher 
                            idVoucher = {idVoucher}
                            onClose = {this.handlerChanges} 
                            onSave = {this.saveVoucher} 
                            ref={ref => this.refDetailVoucher = ref}                 
                        />
                        }
                {/* </Panel> */}
            </div>
        );
    }   
}