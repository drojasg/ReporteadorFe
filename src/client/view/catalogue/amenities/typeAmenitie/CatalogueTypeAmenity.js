import React, { Component } from 'react';
import CleverConfig from '../../../../../../config/CleverConfig';
import {CleverRequest,CleverLoading,ConfirmDialog,Modal,CleverForm,MComponentes} from 'clever-component-library';
import ViewsAmenities from './../amenity/ViewsAmenities';

export default class CatalogueTypeAmenities extends Component  {
    constructor(props) {
        super(props);
        this.clearGrids = this.clearGrids.bind(this);
        this.startType = this.startType.bind(this);
        this.OnclickOptionTab = this.OnclickOptionTab.bind(this);
        this.getGridDisable = this.getGridDisable.bind(this);
        this.getGriEnable =  this.getGriEnable.bind(this);
        this.getGridAll = this.getGridAll.bind(this);
        this.getTypeAmenityByID = this.getTypeAmenityByID.bind(this);
        this.funcionRefDeleteView = this.funcionRefDeleteView.bind(this);
        this.functionRefOpenModal = this.functionRefOpenModal.bind(this);  
        this.confirmDeleteType = this.confirmDeleteType.bind(this);
        this.getConfigAddButtonsModal = this.getConfigAddButtonsModal.bind(this);
        this.saveTypeAmenity = this.saveTypeAmenity.bind(this);

        this.state = {           
            load : false,
            valuesHiddenTab:{isActive:['Activate','',''], 
                             isHidden:[false,true,true],
                             styleTabSelected:[{border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' }]
                            },
            dataGrids:[],
        }
    }

    componentDidMount() {  
        this.props.refButtonAddType.current.id ?
            document.getElementById(this.props.refButtonAddType.current.id).addEventListener("click", e => this.functionRefOpenModal(0))
        : null;             
        this.startType();        
    }  

    clearGrids(functionClear=()=>{}){
        this.setState({listTypeDisable:null,
            listTypeEnable:null,
            listTypeAll:null},functionClear); 
    }

    startType(){  
        this.setState({ load: true});             
        this.getGridAll();
        this.getGriEnable();
        this.getGridDisable(()=>{            
            this.OnclickOptionTab(0);
            this.setState({ load: false});
        });
    }
    
    getGridAll(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-type/get?all=1`, (response, error) => {
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

                    this.setState({ 
                        listTypeAll:dataTable
                    });
                }else{
                    this.setState({ load: false});
                }                                 
            }else{
                this.setState({ load: false});
            }                         
        });                   

    }
    
    getGriEnable(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-type/get`, (response, error) => {
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
                    this.setState({ 
                                    listTypeEnable:dataTable
                                });
                }else{
                    this.setState({ load: false});
                }  
            }else{
                this.setState({ load: false});
            } 
        });  
    }
    
    getGridDisable(functionGetData = ()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-type/get?all=1`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let dataTable = [];
                    response.data.map((item, key) => {   
                        if(item.estado == 0){
                            let tmpItem = item;
                            dataTable.push(tmpItem);
                        }                
                    });

                    this.setState({ 
                        listTypeDisable:dataTable
                    },functionGetData);
                }else{
                    this.setState({ load: false});
                }                                 
            }else{
                this.setState({ load: false});
            }             
        });         
    }

    getTypeAmenityByID(iddType,functionByID=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-type/search/${iddType}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {   
                    let dataRequest={};  
                    let data = response.data;   

                    dataRequest.numberType = data.iddef_amenity_type;
                    dataRequest.descripcion = data.descripcion;

                    this.setState({ 
                        dataFrmType:dataRequest
                    },functionByID);
                }else{
                    this.setState({ load: false});
                }                                
            }else{
                this.setState({ load: false});
            }               
        });        

    }

    OnclickOptionTab(option){
        let valIsActivateTab = this.state.valuesHiddenTab.isActive;
        let valIsHiddenTab = this.state.valuesHiddenTab.isHidden;
        let valueStylesTabs = this.state.valuesHiddenTab.styleTabSelected;
        let newArrayActivate = [];
        let newArrayHidden = [];
        let newStyles = [];

        valIsActivateTab.map((activate,key)=>{
            let valActive = option == key ? 'Activate' : '';
            newArrayActivate.push(valActive)
        });
        valIsHiddenTab.map((hiddenTab,key)=>{
            let valIsHidden= option == key ? false: true;
            newArrayHidden.push(valIsHidden)
        });
        valueStylesTabs.map((stylesTabs,key)=>{
            let valStyles= option == key ? {border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' }:{border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' };
            newStyles.push(valStyles)
        });
        
        this.setState({valuesHiddenTab:{
                                        isActive:newArrayActivate,
                                        isHidden:newArrayHidden,
                                        styleTabSelected:newStyles
                                    }
                    });
    }

    funcionRefDeleteView(e, data){ 
        if(data !== undefined){
            let idTypeAmenity = data.iddef_amenity_type;
            let requestType = {};
            idTypeAmenity !== undefined ? requestType.estado = data.estado == 1 ? 0 : 1 : null;
            this.setState({ idType:idTypeAmenity, deleteType: requestType });
            this.refConfirmDeleteType.getInstance().open();  
        }    
    }

    confirmDeleteType(){
        let idTypeAmenity = this.state.idType;
        let requestType = this.state.deleteType;

        idTypeAmenity !== undefined && requestType !==undefined ?
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity-type/delete/${idTypeAmenity}`, requestType, (data, error) => {
                //             // console.log('put');
                if (data.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                            let notificationType = "";
                            let notificationMessage = "";
                            
                            if (!data.Error) {
                                notificationType = "success";
                                notificationMessage = "The data was saved";
                                this.clearGrids(()=>{this.startType()});                                
                            } else {
                                notificationType = "error";
                                notificationMessage = "The data was no saved";
                            }
                
                                MComponentes.toast(notificationMessage);
                
                                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }else{
                        this.setState({ load: false});
                }   
            })        
        :null
    }

    getConfigAddButtonsModal() {
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.saveTypeAmenity(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    functionRefOpenModal(iddType){
        this.setState({load: true,dataFrmType:{number:0,descripcion:''}});
        if(iddType !== 0){            
            this.getTypeAmenityByID(iddType,()=>{
                this.setState({ load: false}); 
                this.refModalAddType.getInstance().open();
            })
        }else{
            this.setState({ load: false}); 
            this.refModalAddType.getInstance().open();
        }        
    }

    saveTypeAmenity(){
        let requestTypeAmenity = {};
        let dataFrm = this.refFormAmenityType.getData();
        let dataFrmValue = dataFrm.values;
        let idType = dataFrmValue.numberType !== "" ? dataFrmValue.numberType : 0;

        if (dataFrm.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});

        } else {
            requestTypeAmenity.descripcion = dataFrmValue.descripcion;
            requestTypeAmenity.estado = 1;

            // console.log(JSON.stringify(requestTypeAmenity));
            if (idType == 0){
                //Realiza POST
                CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/amenity-type/create", requestTypeAmenity, (data, error) => {
                    // console.log('post');                    
                    if (data.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";

                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.refModalAddType.getInstance().close();
                            this.clearGrids(()=>{this.startType()}); 

                        } else {
                            // console.log('ERROR ==> ',data.Msg);                            
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }

                        MComponentes.toast(notificationMessage);

                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }else{
                        this.setState({ load: false});
                    }   
                });
                
            }
            else{
                //Realiza PUT
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity-type/update/${idType}`, requestTypeAmenity, (data, error) => {
                    // console.log('put');
                    if (data.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";

                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.refModalAddType.getInstance().close();
                            this.clearGrids(()=>{this.startType()}); 

                        } else {
                            // console.log('ERROR ==> ',data.Msg);
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }

                        MComponentes.toast(notificationMessage);

                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }else{
                        this.setState({ load: false});
                    }   
                });
            }

        }
        
    }

    render(){ 
        let {load,listTypeAll,listTypeEnable,listTypeDisable,valuesHiddenTab,dataFrmType} = this.state;
        return(
                <div>
                    <CleverLoading show={load}/> 
                    {listTypeAll &&
                        listTypeEnable &&
                        listTypeDisable ?
                            <div /*className='row'*/>
                                <ul id="tabs-swipe-demo" className="tabs" >
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(0)}>
                                        <a style={valuesHiddenTab.styleTabSelected[0]} href="#allType" className={valuesHiddenTab.isActive[0]} >ALL TYPE</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(1)}>
                                        <a style={valuesHiddenTab.styleTabSelected[1]} href="#enableType" className={valuesHiddenTab.isActive[1]}>ENABLE TYPE</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(2)}>
                                        <a style={valuesHiddenTab.styleTabSelected[2]} href="#desableType" className={valuesHiddenTab.isActive[2]}>DISABLE TYPE</a>
                                    </li>
                                </ul>
                                <div id="allType" hidden={valuesHiddenTab.isHidden[0]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {this.state.listTypeAll} 
                                                        tipGrid = {'type'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteView}
                                                        openModalAmenitie = {this.functionRefOpenModal}
                                                    />
                                </div>
                                <div id="enableType" hidden={valuesHiddenTab.isHidden[1]}>
                                                    <ViewsAmenities 
                                                        dataGrid={this.state.listTypeEnable} 
                                                        tipGrid={'type'}
                                                        onDeleteAmenitie={this.funcionRefDeleteView}
                                                        openModalAmenitie = {this.functionRefOpenModal}
                                                        />
                                </div>
                                <div id="desableType"hidden={valuesHiddenTab.isHidden[2]}>
                                                    <ViewsAmenities 
                                                        dataGrid={this.state.listTypeDisable} 
                                                        tipGrid={'type'}
                                                        onDeleteAmenitie={this.funcionRefDeleteView}
                                                        openModalAmenitie = {this.functionRefOpenModal}
                                                        />
                                </div>


                                <ConfirmDialog
                                    onRef={confirm => this.refConfirmDeleteType = confirm}
                                    yesButton={{ click: () => this.confirmDeleteType() }}
                                />

                                <Modal
                                    addButtons={this.getConfigAddButtonsModal()}
                                    idModal="addTypeAmenity"
                                    isFull={false}
                                    onRef={modal => this.refModalAddType = modal} 
                                >
                                    <div className="row">
                                            <h5>{'TYPE AMENITY'}</h5>

                                            <CleverForm    
                                                id={'form-amenityType'}
                                                data={dataFrmType}
                                                ref={ref => this.refFormAmenityType = ref}
                                                forms={[
                                                    {
                                                        inputs: [
                                                            {
                                                                row: [
                                                                    {type:'number',size:'col s16 m6 l6',name:'numberType',label:'', hidden:true},
                                                                    { type: 'text', size: 'col s12 m6 l6',name: 'descripcion', label: '* Description Type', placeholder:'Insert Description Type',required: true},                                                   
                                                                ]
                                                            },
                                                        
                                                        ],
                                                    },
                                                ]}                                
                                            />
                                    </div>
                                </Modal>
                            </div>
                        :null}

                

                </div>      
        );

    }
}