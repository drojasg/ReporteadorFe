import React, { Component } from 'react'
import CleverConfig from '../../../../../config/CleverConfig'
import { GridView, ConfirmDialog, CleverRequest, Modal, CleverInputSelect, CleverLoading, MComponentes} from 'clever-component-library'
import './crossout.css'
import FrmCrossout from './FrmCrossout'

export default class DetailCrossout extends Component {
    constructor(props) {
        super(props);

        this.getDataActivos = this.getDataActivos.bind(this);
        this.getDataAll = this.getDataAll.bind(this);
        this.openModal = this.openModal.bind(this);
        this.deleteCrossout = this.deleteCrossout.bind(this);
        this.updateCrossout = this.updateCrossout.bind(this);
        this.getConfigAddButtonsModal = this.getConfigAddButtonsModal.bind(this);
        this.saveCrossout = this.saveCrossout.bind(this);
        this.getCrossoutByID = this.getCrossoutByID.bind(this);
        this.createCrossout = this.createCrossout.bind(this);
        this.ChangeStatusCrossout = this.ChangeStatusCrossout.bind(this);
        this.getRequest = this.getRequest.bind(this);
        this.startpage = this.startpage.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            listSystem:[],
            load : false, 
        }
        this.TableMainCrossout = React.createRef();
    }

    componentDidMount() {        
        let idCross = 0;
        this.props.refButtonAdd.current.id ?
            document.getElementById(this.props.refButtonAdd.current.id).addEventListener("click", e => this.openModal(idCross))
        : null;
        this.startpage('inicio');
    }

    startpage(tipo){
        let all = '1';
        this.setState({ valSelectStatusCross:all,
                        load: true, 
                        dataFrmCross:{
                            id_sistema:"",
                            cross_out_name:"",
                            percent:"",
                            restriction:[""]
                        }
                    });          
        this.getDataAll(all);

        tipo == 'modal' ? this.refModalAdd.getInstance().close(): null;
    }

    ChangeStatusCrossout(e){      
        let value = String(e.value);

        switch(value){
            case '1':
                    this.setState({ load: true });                    
                    this.getDataAll(value);
                break;
            case '2':
                    this.setState({ load: true });
                    this.getDataActivos();
                break;
            case '3':
                    this.setState({ load: true });                    
                    this.getDataAll(value);
                break;
        }

        this.setState({ valSelectStatusCross:value});
    }
    
    getDataActivos = (e) => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/crossout/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let dataTable = [];
    
                    response.data.map((item, key) => {
                        let tmpItem = item;
                        dataTable.push(tmpItem);
                    });
    
                    this.TableMainCrossout.setDataProvider(dataTable); 
                    this.setState({ load: false});
                }else{
                    this.setState({ load: false});
                }
            }else{
                this.setState({ load: false});
            }
        });
    }
    
    getDataAll = (tipCross) => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/crossout/get?all=1`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let dataTable = [];
    
                    if(tipCross == '1'){
                        response.data.map((item, key) => {                   
                            let tmpItem = item;
                            dataTable.push(tmpItem);
                        });
                    }else
                        //Lista unicamente los inactivos
                        if(tipCross == '3'){
                            response.data.map((item, key) => {     
                                if(item.estado == 0){
                                    let tmpItem = item;
                                    dataTable.push(tmpItem);
                                }  
                            });                    
                    }
                    this.TableMainCrossout.setDataProvider(dataTable); 
                    this.setState({ load: false});
                }else{
                    this.setState({ load: false});
                }
            }else{
                this.setState({ load: false});
            }
            
        });
    }

    getCrossoutByID(idop_cross_out_config ,functionGetData = ()=>{}) {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/crossout/search/${idop_cross_out_config}`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {                 
                let data = response.data; 
                this.setState({
                    dataCrossout:data
                },functionGetData);                
            }
        }) ;  
    }

    getRequest(data,tipOper){
        let requestCrossout = {}; 
        
        if (data !== undefined){
            let listRestriccionsDef = [];

                tipOper =='modal' ? requestCrossout.idop_cross_out_config = data.idop_cross_out_config : null;
                requestCrossout.cross_out_name = data.cross_out_name;
                requestCrossout.id_sistema = tipOper =='modal' ? String(data.id_sistema) : data.id_sistema;  
                tipOper !=='modal' ? requestCrossout.date_start = "2020-01-01" : null;
                tipOper !=='modal' ? requestCrossout.date_end = "2020-12-31" : null;              
                requestCrossout.percent = data.percent;

                if(tipOper == 'delete'){
                    data.estado == 1 ? requestCrossout.estado = 0 : requestCrossout.estado = 1;
                }else if(tipOper == 'update'){
                    requestCrossout.estado = 1;
                }
                
                data.restrictions.map((restriccion)=>{
                    tipOper =='modal' ? listRestriccionsDef.push(String(restriccion.iddef_restriction))
                                      : listRestriccionsDef.push(restriccion.iddef_restriction);
                });

                requestCrossout.restriction = listRestriccionsDef;  
        }
        return requestCrossout;
    }

    deleteCrossout(e, data) {        
        let idop_cross_out_config= data.idop_cross_out_config;

        if (idop_cross_out_config !== 0){
            this.getCrossoutByID(idop_cross_out_config, ()=>{
                let request = this.getRequest(this.state.dataCrossout,'delete');
                this.updateCrossout(idop_cross_out_config,request);
            });
        }
    }

    openModal(idop_cross_out_config) { 
        if (idop_cross_out_config !== 0){
            this.getCrossoutByID(idop_cross_out_config, ()=>{ 
                let request = this.getRequest(this.state.dataCrossout,'modal');     
                this.setState({
                    dataFrmCross: request
                }, () => this.refModalAdd.getInstance().open());
            });
        }
        else{
           this.setState({
                    dataFrmCross:{
                        id_sistema:"",
                        cross_out_name:"",
                        percent:"",
                        restriction:[""]
                    }
                }, () => this.refModalAdd.getInstance().open());
        }   
    }
    
    getConfigAddButtonsModal() {
        let buttons = [
            <button className="btn waves-effect waves-light" onClick={this.saveCrossout} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    saveCrossout(){
        let data = this.refModalCrossout.getDataCrossout();    
        if(data.idop_cross_out_config !== 0){
            let request = this.getRequest(data,'update');
            this.updateCrossout(data.idop_cross_out_config,request);

        }else{
            let request = this.getRequest(data,'create');            
            this.createCrossout(request);
        }        
    }

    createCrossout(requestCrossout){
        // console.log(JSON.stringify(requestCrossout));
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/crossout/create", requestCrossout, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            // console.log('post');
            if (!error) {
                let notificationType = "";
                let notificationMessage = "";

                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was saved";
                    this.startpage('modal');                    
                } else {
                    notificationType = "error";
                    notificationMessage = "The data was no saved";
                }

                MComponentes.toast(notificationMessage);

                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
            }
        });
    }

    updateCrossout(idCrossout,requestCrossout){   
        // let requestCrossout = this.state.dataCrossout;
        // console.log('idCrossout ==> ', idCrossout);
        // console.log(JSON.stringify(requestCrossout));
        CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/crossout/update/${idCrossout}`, requestCrossout, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
                // console.log('put');
            if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";

                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was saved";
                    this.startpage('modal');
                } else {
                    notificationType = "error";
                    notificationMessage = "The data was no saved";
                }

                MComponentes.toast(notificationMessage);

                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
            }
        });
    }
   
    render() {
        return (
           <div className='row'>
               <div className='row'>
                    <CleverInputSelect
                        id = {'tipCross'}
                        size = {'col s12 m6 l6'}
                        label = {'State Crossout'}
                        name = {'tipCross'}
                        options = {[
                            {value:'1',option:'ALL'},
                            {value:'2',option:'ENABLE'},
                            {value:'3',option:'DISABLE'}
                        ]}
                        defaultValue={this.state.valSelectStatusCross}
                        onChange = {this.ChangeStatusCrossout}
                    />
                </div>
               <CleverLoading show={this.state.load}/> 
               <GridView
                    idTable='table-crossout'
                    floatHeader= {true}
                    onRef={ref => this.TableMainCrossout = ref}
                    pagination={1000}
                    serializeRows={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                                { attribute : 'idop_cross_out_config', visible : false },
                                { attribute : 'id_sistema', alias : 'System ID'},
                                { attribute : 'cross_out_name', alias : 'Crossout name' },
                                // { attribute : 'estado', alias : 'Status' },                                
                                { attribute : 'percent', alias : 'Discount percentage' },
                                // { attribute : 'restriction', alias : 'Restriction' },
                                {
                                    attribute: 'actions',
                                    alias: 'Actions',
                                    filter: false,
                                    value: (data, index) => {
                                        return (
                                            <div>
                                                {data.estado == 1 ?
                                                    <a onClick={(e) => this.openModal(data.idop_cross_out_config)} title='Edit Crossout'><i className='material-icons left'>mode_edit</i></a>
                                                    :
                                                   null
                                                }
                                                {data.estado == 1 ?
                                                    <a onClick={(e) => this.deleteCrossout(e, data)} title='Disable Crossout'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) => this.deleteCrossout(e, data)} title='Enable Crossout'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                }        
                                            </div>)
                                    }
                                }
                            ]}
                />

                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.updateCrossout() }}
                />
                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal = "addCrossout"
                    name = "addCrossout"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} 
                >
                    <div className="row">
                        <h5>{'ADD CROSSOUT'}</h5>

                            <FrmCrossout
                                dataFrmCross = {this.state.dataFrmCross}
                                ref = {ref => this.refModalCrossout = ref}                              
                            />
                            
                    </div>
                </Modal> 
           </div>
        )
    }
}
