import React, { Component } from 'react'
import CleverConfig from '../../../../../../config/CleverConfig'
import {CleverRequest,CleverLoading,ConfirmDialog,Modal,CleverForm,MComponentes} from 'clever-component-library'
import ViewsAmenities from './../amenity/ViewsAmenities'

export default class CatalogueGroupAmenities extends Component  {
    constructor(props) {
        super(props);
        this.clearGrids = this.clearGrids.bind(this);
        this.startGroup = this.startGroup.bind(this);        
        this.OnclickOptionTab = this.OnclickOptionTab.bind(this);
        this.getGridDisable = this.getGridDisable.bind(this);
        this.getGriEnable =  this.getGriEnable.bind(this);
        this.getGridAll = this.getGridAll.bind(this);
        this.getGroupAmenityByID = this.getGroupAmenityByID.bind(this);
        this.funcionRefDeleteGroup = this.funcionRefDeleteGroup.bind(this);
        this.functionRefGroupOpenModal = this.functionRefGroupOpenModal.bind(this);
        this.confirmDeleteGroup = this.confirmDeleteGroup.bind(this);
        this.getConfigAddButtonsModal = this.getConfigAddButtonsModal.bind(this);
        this.saveGroupAmenity = this.saveGroupAmenity.bind(this);

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
        this.props.refButtonAddGroup.current.id ?
            document.getElementById(this.props.refButtonAddGroup.current.id).addEventListener("click", e => this.functionRefGroupOpenModal(0))
        : null;             
        this.startGroup();         
    }  
    
    clearGrids(functionClear=()=>{}){
        this.setState({listGroupAll:null,
            listGroupEnable:null,
            listGroupDisable:null},functionClear); 
    }

    startGroup(){  
        this.setState({ load: true});
        this.getGridAll();
        this.getGriEnable();
        this.getGridDisable(()=>{            
            this.OnclickOptionTab(0);
            this.setState({ load: false});
        });
    }
    
    getGridAll(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-group/get?all=1`, (response, error) => {
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
                        listGroupAll:dataTable
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
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-group/get`, (response, error) => {
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
                                    listGroupEnable:dataTable
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
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-group/get?all=1`, (response, error) => {
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
                        listGroupDisable:dataTable
                    },functionGetData);
                }else{
                    this.setState({ load: false});
                }                                 
            }else{
                this.setState({ load: false});
            }             
        });         
    }

    getGroupAmenityByID (iddGroup,functionByID=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-group/search/${iddGroup}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {   
                    let dataRequest={};  
                    let data = response.data;                      
                    
                    dataRequest.numberGroup = data.iddef_amenity_group;
                    dataRequest.name = data.name;
                    dataRequest.description = data.description;

                    this.setState({ 
                        dataFrmGroup:dataRequest
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

    funcionRefDeleteGroup(e, data){   
        if(data !== undefined){
            let idGroupAmenity = data.iddef_amenity_group;
            let requestGroup = {};
            idGroupAmenity !== undefined ? requestGroup.estado = data.estado == 1 ? 0 : 1 : null;
            this.setState({ idGroup:idGroupAmenity, deleteGroup: requestGroup });
            this.refConfirmDeleteType.getInstance().open();   
        }   
        
    }

    confirmDeleteGroup(){
        let idGroupAmenity = this.state.idGroup;
        let requestGroup = this.state.deleteGroup;

        idGroupAmenity !== undefined && requestGroup !==undefined ?
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity-group/delete/${idGroupAmenity}`, requestGroup, (data, error) => {
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
                                this.clearGrids(()=>{this.startGroup()});                                
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

            <button className="btn waves-effect waves-light" onClick={e => this.saveGroupAmenity(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    functionRefGroupOpenModal(iddGroup){
        this.setState({load: true,dataFrmGroup:{number:0,name:'',description:''}});
        if(iddGroup !== 0){            
            this.getGroupAmenityByID(iddGroup,()=>{
                this.setState({ load: false}); 
                this.refModalAddGroup.getInstance().open();
            })
        }else{
            this.setState({ load: false}); 
            this.refModalAddGroup.getInstance().open();
        }        
    }

    saveGroupAmenity(){
        let requestGroupAmenity = {};
        let dataFrm = this.refFormAmenityGroup.getData();
        let dataFrmValue = dataFrm.values;
        // console.log('dataFrmValue ==> ',dataFrmValue);        
        let idGroup = dataFrmValue.numberGroup !== "" ? dataFrmValue.numberGroup : 0;

        if (dataFrm.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});

        } else {
            requestGroupAmenity.name = dataFrmValue.name;
            requestGroupAmenity.description = dataFrmValue.description;
            requestGroupAmenity.estado = 1;
            // console.log(JSON.stringify(requestGroupAmenity));
            if (idGroup == 0){
                //Realiza POST
                CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/amenity-group/create", requestGroupAmenity, (data, error) => {
                    // console.log('post amenity-group');                    
                    if (response.status == 403) {
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
                            this.refModalAddGroup.getInstance().close();
                            this.clearGrids(()=>{this.startGroup()}); 

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
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity-group/update/${idGroup}`, requestGroupAmenity, (data, error) => {
                    // console.log('put amenity-group/',idGroup);
                    if (response.status == 403) {
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
                            this.refModalAddGroup.getInstance().close();
                            this.clearGrids(()=>{this.startGroup()}); 

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
        let {load,listGroupAll,listGroupEnable,listGroupDisable,valuesHiddenTab,dataFrmGroup} = this.state;
        return(
                <div>
                    <CleverLoading show={load}/> 
                    {listGroupAll &&
                        listGroupEnable &&
                        listGroupDisable ?
                            <div /*className='row'*/>
                                <ul id="tabs-swipe-demo" className="tabs" >
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(0)}>
                                        <a style={valuesHiddenTab.styleTabSelected[0]} href="#allGroup" className={valuesHiddenTab.isActive[0]} >ALL GROUP</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(1)}>
                                        <a style={valuesHiddenTab.styleTabSelected[1]} href="#enableGroup" className={valuesHiddenTab.isActive[1]}>ENABLE GROUP</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(2)}>
                                        <a style={valuesHiddenTab.styleTabSelected[2]} href="#desableGroup" className={valuesHiddenTab.isActive[2]}>DISABLE GROUP</a>
                                    </li>
                                </ul>
                                <div id="allGroup" hidden={valuesHiddenTab.isHidden[0]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {this.state.listGroupAll} 
                                                        tipGrid = {'group'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteGroup}
                                                        openModalAmenitie = {this.functionRefGroupOpenModal}
                                                    />
                                </div>
                                <div id="enableGroup" hidden={valuesHiddenTab.isHidden[1]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {this.state.listGroupEnable} 
                                                        tipGrid = {'group'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteGroup}
                                                        openModalAmenitie = {this.functionRefGroupOpenModal}
                                                    />
                                </div>
                                <div id="desableGroup"hidden={valuesHiddenTab.isHidden[2]}>
                                                    <ViewsAmenities dataGrid = {this.state.listGroupDisable} 
                                                    tipGrid = {'group'}
                                                    onDeleteAmenitie = {this.funcionRefDeleteGroup}
                                                    openModalAmenitie = {this.functionRefGroupOpenModal}
                                                    />
                                </div>

                                <ConfirmDialog
                                    onRef={confirm => this.refConfirmDeleteType = confirm}
                                    yesButton={{ click: () => this.confirmDeleteGroup() }}
                                />

                                <Modal
                                    addButtons={this.getConfigAddButtonsModal()}
                                    idModal="addRestriction"
                                    isFull={false}
                                    onRef={modal => this.refModalAddGroup = modal} 
                                >
                                    <div className="row">
                                        <h5>{'GROUP AMENITY'}</h5>

                                        <CleverForm    
                                                id={'form-amenityGroup'}
                                                data={dataFrmGroup}
                                                ref={ref => this.refFormAmenityGroup = ref}
                                                forms={[
                                                        {
                                                            inputs: [
                                                                    {
                                                                        row: [
                                                                                {type:'number',size:'col s16 m6 l6',name:'numberGroup',label:'', hidden:true},
                                                                                { type: 'text', size: 'col s12 m6 l6',name: 'name', label: '* Name', placeholder:'Insert Name Group', required: true},
                                                                                { type: 'text', size: 'col s12 m6 l6',name: 'description', label: '* Description Group', placeholder:'Insert Description Group', required: true},                                                   
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