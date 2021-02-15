import React from 'react';
import { CleverForm, SelectInput,Chip, CleverLoading,Table,CleverLog,Dropdown,Modal,MComponentes, GridView, CleverInputSelect ,CleverRequest, Card} from 'clever-component-library';
import CleverConfig from '../../../../../../config/CleverConfig';
import { columnsTableAuthItem } from "./TablesUsers";
import axiosRequest from '../../../../axiosRequest';

export default class Users extends React.Component {
    constructor(props){
        super(props);
        React.createRef();
        this.state = { 
                /*States credentials */
                stat:0,
                gridData: null,
                selectedItemAuth : "",
                itemsAuth:[],
                naneCredential: "",
                tokenData: "",
                channels: [],
                disabledInputIP:false,
                disabledInputDNS:false,
                dataChipsIP:[],
                dataChipsDNS:[],
                data:[],
                isEdit: false,
                isView :false,
                isEditAuth: false, 
                item_name: '',
                status: 0,
                user_id: '',
                loading: false,
                dataForm: {},
                password: '',
                interno: 0,
                tipo_autenticacion: 0,
                default: true,
                optionsType:[],
                chips:{}
            };

        this.handleTableUser = this.handleTableUser.bind(this);
        this.handlerCancel = this.handlerCancel.bind(this);
        this.handlerBtnEdit = this.handlerBtnEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFormulario = this.handleFormulario.bind(this);
        this.handlerSubmit = this.handlerSubmit.bind(this);
        // this.handleInterno = this.handleInterno.bind(this);
        this.handlerSubmitAuth = this.handlerSubmitAuth.bind(this);
        this.DetailModalAuth = this.DetailModalAuth.bind(this);
        this.handleCancelAuth = this.handleCancelAuth.bind(this);
        this.handlerBtnEditAuth = this.handlerBtnEditAuth.bind(this);
        this.handleGetColaborador = this.handleGetColaborador.bind(this);
        // this.handleauth = this.handleauth.bind(this);
        this.handleTableAuthUser = this.handleTableAuthUser.bind(this);
        /*Credentials*/
        this.getSecretToken = this.getSecretToken.bind(this);
        this.getChannels = this.getChannels.bind(this)
        this.setConfigChipIP = this.setConfigChipIP.bind(this)
        this.setConfigChipDNS = this.setConfigChipDNS.bind(this)
        this.funcionRefDeleteCredentials = this.funcionRefDeleteCredentials.bind(this)
        this.confirmDeleteCredentials = this.confirmDeleteCredentials.bind(this)
        this.setValuesEdit = this.setValuesEdit.bind(this)
        this.getAuthItemsSelect =this.getAuthItemsSelect.bind(this)
        /*this.addChipIP = this.addChipIP.bind(this)
        this.addChipDNS = this.addChipDNS.bind(this)*/
        /*this.getValueChipIP = this.getValueChipIP.bind(this)*/
      


    }

    componentDidMount(){
        MComponentes.Collapsible('#colap');
        this.getSecretToken()
        this.getChannels()
        this.getAuthItemsSelect()
    }

    setInit(){
        this.refSelectStatusEdit.init();
    }

    getSecretToken() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/credentials/get-secret-token',(response, error) => {        
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error){
                this.setState({
                    tokenData : response.data,
                })
            }else{
                console.log("ErrorGetToken =>", error)
            }

        });
    }

    getChannels(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/channels/get-all',(response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if(!error){
                let temp = response.data.map(o => ({'value':String(o.iddef_channel), 'option':o.description}));
                this.setState({channels: temp},() => this.setState({channels:temp}))
            }else{
                this.setState({channels: []});
            }
        });
    }

    setConfigChipIP(e){
        let reference = e;
        console.log("confirm ", reference.value);

        if (reference.value.length == 1){
            this.setState({
                disabledInputIP: true,
            });
        }else{
            this.setState({
                disabledInputIP: false,
            });
        }
    }


    setValuesEdit(data,functionSetChips=()=>{}){
        if(data == null) {
            this.setState({chips: {}},functionSetChips)
        }else{

            let arrayChipIP=[];
            let arrayChipDNS=[];

            //llena el chip de ip
            data.ip_list_allowed.map((datos)=>{
                let value = datos
                arrayChipIP.push(value);                  
            });        
        //llena el chip de booking dates
            data.dns_list_allowed.map((datos)=>{    
                let value = datos;  
                arrayChipDNS.push(value);           
            });    


            this.setState({            
                dataChipsIP: arrayChipIP,
                dataChipsDNS: arrayChipDNS,

            },functionSetChips); 

        } 
    }

    /*addChipIP(){
        let dataChipIP  = this.getValueChipIP()
        this.setValueChipIP(dataChipIP)
    }*/

    setConfigChipDNS(e){
        let reference = e;
        console.log("confirm ", reference.value);

        if (reference.value.length == 1){
            this.setState({
                disabledInputDNS: true,
            });
        }else{
            this.setState({
                disabledInputDNS: false,
            });
        }
    }

    /*addChipDNS(){

        /*SACAMOS LOS VALORES DEL CHIP */
       /* let dataChipDNS  = this.getValueChipDNS()
        this.setValueChipDNS(dataChipDNS)
        /*tag=data.start_booking_dates+' / '+data.end_booking_dates;
        this.setValueChipBooking(tag);*/
    /*}*/

    /*Modal para insertar credenciales nuevas*/
    getConfigModal() {

        console.log("dataS1",this.state.dataChipsIP)

        let content= <div className="row">
            <CleverForm

                data={this.state.dataForm}
                ref={ref => this.refForm = ref}
                forms={[
                    {
                        inputs:[
                        {row: [
                        {type:'text',size:'col s12 m4 l4',name:'name', id:'name',required:true,label:'Name', disabled:this.state.isView},
                        {type:'text',size:'col s12 m4 l4',name:'description',id: 'description', label:'Description',required:true, disabled:this.state.isView},
                        {type:'text',size:'col s12 m4 l4',name:'api_key', id: 'api_key', disabled:this.state.isView, value:this.state.tokenData ,defaultValue:this.state.tokenData, required:false,label:'Key',hidden:true},
                        {type:'select', size:'col s12 m4 l4', name:'iddef_channel', required:true, label:'Channel',
                            options: this.state.channels, isView: this.state.isView
                        },
                        {id:'resticted_ip',type:'checkbox', disabled: this.state.isView,size:'col s12 m4 l4',label:'',name:'restricted_ip',checkboxs:[{value:'1',label:'Restricted IP'}],onChange:this.setConfigChipIP},
                        {id:'restricted_dns',type:'checkbox', disabled: this.state.isView, size:'col s12 m4 l4',label:'',name:'restricted_dns',checkboxs:[{value:'1',label:'Restricted DNS'}],onChange:this.setConfigChipDNS},
                        ]},
                        this.state.disabledInputIP == true ?                               
                        {row:[                        
                            {type:'component', 
                                component:() =>{

                                    return (
                                        <div>
                                            <Chip
                                                id='tag_IP'
                                                name='tags_ip'
                                                setValue={ set => {this.setValueChipIP = set;
                                                                    this.setValueChipIP(this.state.dataChipsIP)
                                                                } 
                                                        }
                                                getValue={ get => {this.getValueChipIP = get;} }
                                                cleanValue={ clean => {this.cleanValueChipIP = clean;} }
                                                readOnly={this.state.isView}
                                                options={{
                                                    placeholder: "Restricted IP",
                                                    secondaryPlaceholder: "Restricted IP",
                                                }}
                                                label={{ t: "Restricted IP", d: "{{'TAG'}}" }}
                                        />
                                        </div>
                                    )
                                }
                            },
                        ]}
                        : {row:[]},

                        this.state.disabledInputDNS == true ?                               
                        {row:[                        
                            {type:'component', 
                                component:() =>{
                                    console.log("referencia", this.refForm.getData().values);
                                    return (
                                        <div>
                                            <Chip
                                                id='tag_DNS'
                                                name='tags_dns'
                                                setValue={ set => {this.setValueChipDNS = set;
                                                                    this.setValueChipDNS(this.state.dataChipsDNS)
                                                                } 
                                                        }
                                                getValue={ get => {this.getValueChipDNS = get;} }
                                                cleanValue={ clean => {this.cleanValueChipDNS = clean;} }
                                                readOnly={this.state.isView}
                                                options={{
                                                    placeholder: "Restricted DNS",
                                                    secondaryPlaceholder: "Restricted DNS",
                                                }}
                                                label={{ t: "Restricted DNS", d: "{{'TAG'}}" }}
                                        />
                                        </div>
                                    )
                                }
                            },
                        ]}
                        : {row:[]},

                    ]
                }
            ]}
            data={this.state.dataForm}
            />
            </div>;

        return content;
    }

    handlerSubmit(){
        /*obtenemos los datos del form*/
        let data = this.refForm.getData();
        /*SACAMOS LOS VALORES DEL CHIP */
        let dataChipIP  = this.getValueChipIP ? this.getValueChipIP() : [];
        let dataChipDNS = this.getValueChipDNS ? this.getValueChipDNS() : [];
        /*console.log("data1->", dataChipIP)*/
        let formValue= data.values;

        let save_data = {}

        save_data['name'] = formValue['name']
        save_data['description'] = formValue['description']
        save_data['api_key'] = this.state.tokenData
        save_data['iddef_channel'] = formValue['iddef_channel']
        save_data['restricted_ip'] = this.state.disabledInputIP ? 1 : 0;
        save_data['ip_list_allowed'] = dataChipIP ? dataChipIP : [];
        save_data['restricted_dns'] = this.state.disabledInputDNS ? 1 : 0;
        save_data['dns_list_allowed'] = dataChipDNS ? dataChipDNS : [];


        CleverRequest.post(CleverConfig.getApiUrl('bengine')+'/api/credentials/add', 
        save_data,
                (response, error) => {
                    if(error === false){
                        MComponentes.toast(response.Msg);
                        this.instanceGrid.update()
                        this.setState({ 
                            dataForm: {},
                            isEdit: false
                        });
                        this.getSecretToken();
                        this.refModal.getInstance().close();
                    }else{
                        MComponentes.toast(response.Msg);
                        this.setState({
                            isEdit: false
                        })
                    }
                });
    }

    handlerBtnEdit(){

        /**aqui se hace el update */

            /*obtenemos los datos del form*/
            let data = this.refForm.getData();
            /*SACAMOS LOS VALORES DEL CHIP */
            let dataChipIP  = this.getValueChipIP ? this.getValueChipIP() : [];
            let dataChipDNS = this.getValueChipDNS ? this.getValueChipDNS() : [] ;
            /*console.log("data1->", dataChipIP)*/
            let formValue= data.values;

            let save_data = {}

            save_data['name'] = formValue['name']
            save_data['description'] = formValue['description']
            /*save_data['api_key'] = this.state.tokenData*/
            save_data['iddef_channel'] = formValue['iddef_channel']
            save_data['restricted_ip'] = this.state.disabledInputIP ? 1 : 0;
            save_data['ip_list_allowed'] = dataChipIP ? dataChipIP : [];
            save_data['restricted_dns'] = this.state.disabledInputDNS ? 1 : 0;
            save_data['dns_list_allowed'] = dataChipDNS ? dataChipDNS : [];

            console.log("save_data",save_data)


        CleverRequest.put(CleverConfig.getApiUrl('bengine')+'/api/credentials/update/'+this.state.id_usuario,
            save_data,
                (res) => {
                    if(res.error != false){
                        MComponentes.toast("Credencials has been updated!");
                        this.instanceGrid.updateRow(CleverConfig.getApiUrl('bengine')+'/api/credentials/search-by-id/' + this.state.id_usuario);
                        this.refModal.getInstance().close();
                        this.setState({ 
                            dataForm: {},
                            isEdit: false
                        });
                    }
                })

    }

    funcionRefDeleteCredentials(e, data){ 

        console.log("eCreden->", e, "", "dataCred->", data.estado)
        if(data !== undefined){
            let id = data.iddef_credentials;
            let requestCredentials = {};
            id !== undefined ? requestCredentials.estado = data.estado == 1 ? 0 : 1 : null;
            requestCredentials.description = data.description;
            requestCredentials.name = data.name;
            requestCredentials.restricted_ip = data.restricted_ip;
            requestCredentials.restricted_dns = data.restricted_dns;
            this.setState({ id_usuario:data.iddef_credentials, deleteCredentials: requestCredentials });
            /*this.refConfirmDeleteAmenity.getInstance().open();*/
            this.instanceGrid.update()
            this.confirmDeleteCredentials();
        }
    }

    confirmDeleteCredentials(){
        let idCredentials = this.state.id_usuario;
        let requestCredentials = this.state.deleteCredentials;

        idCredentials !== undefined && requestCredentials !==undefined ?
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/credentials/update-status/${idCredentials}`, requestCredentials, (data, error) => {

                if (!error) {
                            let notificationType = "";
                            let notificationMessage = "";

                            if (!data.Error) {
                                this.instanceGrid.update()
                                notificationType = "success";
                                notificationMessage = "The data was saved";

                            } else {
                                this.instanceGrid.update()
                                notificationType = "error";
                                notificationMessage = "The data was no saved";
                            }
                        
                                MComponentes.toast(notificationMessage);
                        
                                /*this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });*/
                }else{
                    this.setState({ load: false});
                }   
            })        
        :null
        
    }


    /* Table credentials */

    handleTableUser(e, param, posicion) {
        let text = e.selectedOption.text;
        if(text === 'Edit'){  
            this.setState({
                isEdit: true,
                indexRow: posicion,
                isView:false,
            },()=>{
                this.handleFormulario(param.iddef_credentials,()=>{
                    this.refModal.getInstance().open();
                });
            }        
            );
            /*this.refModal.getInstance().open();*/
        }else if(text === 'View'){
            this.setState({
                isView: true,
            },()=>{
                this.handleFormulario(param.iddef_credentials,()=>{
                    this.refModal.getInstance().open();
                });
            }        
            );
        }else if(text === 'Assign'){
            this.setState({
                user_id: param.iddef_credentials,
                naneCredential: param.name,
               posicion: posicion, 
               isEditAuth: false,
            }, () => this.getModalAuthItem())
        }

    }

    /*Obtenemos las credenciales de acuerdo al id */
    handleFormulario (id,functionForm=()=>{}){
        this.setState({loading : true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/credentials/search-by-id/'+ id,(res, error) => {

                if (!error) {  
                    if (res.Error == false) {
                        let data =res.data;

                        let comboip = [];
                        let comboDNS = [];
                        comboDNS.push(String(data.restricted_dns))
                        comboip.push(String(data.restricted_ip));                    

                        data['restricted_dns'] = comboDNS;
                        data['restricted_ip'] = comboip;
                        data['iddef_channel'] = String(data.iddef_channel);

                        this.setValuesEdit(data,()=>{
                            this.setState({ 
                                dataForm:data,
                                loading : false,
                                id_usuario: id,
                            }, functionForm)
                        });
                    }else{
                        this.setState({
                            loading : false,
                        },functionForm);
                    }
                }else{
                    this.setState({ load: false},functionForm);
                }
            }
        )

    }

    /*auth*/
    /*Carga la tabla de los hijos */
    handleDetalle(param){
        this.setState({loading : true});
        CleverRequest.get(
            CleverConfig.getApiUrl('bengine')+'/api/auth-assignment/get/'+param.iddef_credentials,
                (response) => {
                    console.log("reslog", response)
                    if(response != null){
                        this.tableAuth.setData(response.data);
                        this.setState({loading : false});
                    }else{
                        let response = [];
                        this.tableAuth.setData(response.data);
                        MComponentes.toast("No result was found");
                        this.setState({loading : false});
                    }
                }
            )

        return(      
            <div> 
                <Table  onRef={ref => (this.tableAuth = ref)} options={{manual:true, filter: false}} columns={columnsTableAuthItem} onFun={this.handleTableAuthUser}/>            
            </div>
        );

    }

    DetailModalAuth(id) {

        CleverRequest.get(
            CleverConfig.getApiUrl('bengine')+'/api/auth-assignment/get/'+ id,
                (res) => {
                    if (res != null) {
                    let content = <CleverForm
                                    ref={ref => this.refForm = ref}
                                    forms={[
                                        { 
                                            inputs:[
                                                {
                                                    row: [
                                                        {type:'select',size:'col s12 m4 l4',name:'interno',disabled:true,label:'Interno',
                                                            options:[
                                                                {value:'0',option:'External'},
                                                                {value:'1',option:'Internal'},
                                                            ],
                                                        },
                                                        {type:'select',size:'col s12 m4 l4',name:'tipo_autenticacion',disabled:true,label:'Autentication',
                                                            options:[
                                                                {value:'0',option:'Local'},
                                                                {value:'1',option:'Domain'},
                                                            ]
                                                        },
                                                        {type:'text',size:'col s12 m4 l4',name:'no_colaborador', id:'no_colaborador',disabled:true,label:'No Colaborador'},
                                                        {type:'text',size:'col s12 m4 l4',name:'username',disabled:true,label:'Username'},
                                                        {type:'text',size:'col s12 m4 l4',name:'username_sistema_externo',disabled:true,label:'External system'},
                                                        {type:'text',size:'col s12 m4 l4',name:'name',id:'name',disabled:true,label:'Name'},
                                                        {type:'text',size:'col s12 m4 l4',name:'tittle', id:'tittle',disabled:true,label:'Title'},
                                                        {type:'text',size:'col s12 m4 l4',name:'password',id:'password',disabled:true,label:'Password'},
                                                        {type:'text',size:'col s12 m4 l4',name:'email',disabled:true,label:'Email'},
                                                        {type:'select',size:'col s12 m4 l4', name:'estado',disabled:true, label:'Status',
                                                            options:[
                                                                {value:'0', option:'Inactive'},
                                                                {value:'1', option:'Active'},
                                                            ]
                                                        },
                                                    ]
                                                }
                                            ]
                                        }
                                    ]}
                                    data={res}
                                /> ;    
                                
            this.modalAuth.setContentModal(content);
            this.modalAuth.getInstance().open();
            } 
        })

    }

    /*obtenemos los auth items*/
    getAuthItemsSelect = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/auth-item/get?all=1`, (response, error) => { 
            if (!error) {
                let items = [{"value": 0, "option": "SELECT ITEM"}];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        items.push({value: data.name, option:data.description});
                    }
                });
                this.setState({itemsAuth: items});
            }
        });
    }
    /*obtneemos los items seleccionados */
    handleInputSelectItemsAuth = (_optionSelected) => {
        this.setState({selectedItemAuth: _optionSelected.value});
    }

    /** Modal de editar E INSERTAR hijos */
    getModalAuthItem(){

            let content = (
                <div className="row">
                    <div className="col s12 m12 l12">
                        <label>Credential Name</label>
                        <input type='text' disabled value={this.state.naneCredential || ''} placeholder="Credential Name" id="user_id" name='user_id' onChange={(e)=>{this.handleChange(e)}}/>
                    </div>
                    { this.state.isEditAuth == true ? (
                        <div>
                            <div className="col s12 m12 l12">
                                <label>Permission Item</label>
                                    <input type='text' disabled value={this.state.item_name || ''} placeholder="item_name" id="item_name" name='item_name'/>
                            </div>
                            <div className="col s12 m12 l12">
                                <label className="active" htmlFor='authChild'>Status</label>
                                    <SelectInput
                                    name = "status"
                                    required ={true}
                                    itemOptions={{ "0" : "Inactive", "1" : "Active" }}
                                    onRef={select => this.refSelectStatusEdit = select}
                                    disabled={false}
                                    />
                            </div>       
                        </div>
                        ) : (
                        <div className="col s12 m12 l12">
                            <label className="active" htmlFor='authChild'>Item Permission</label>
                            <CleverInputSelect id="id-inputSelect-itemsAuth"  uppercase={true} name="name-inputSelect-Auth" options={this.state.itemsAuth} defaultValue={"0"} onChange={this.handleInputSelectItemsAuth}/>
                        </div>
                        )
                    }
                </div>
            );
                
        this.modalAuthItem.setContentModal(content)
        return this.modalAuthItem.getInstance().open();

    }

    handleGetColaborador(e){
        let algo = e.value;
        let form = this.refForm.getData();
        let datoForm = form.values;
        this.setState({loading: true});
        axiosRequest.get(CleverConfig.getApiUrl('auth')+'/usuario/peoplesoftcolaborador/'+ algo,
            (response) => {
                if(response.error === false){
                    datoForm.name = response.data['NAME_DISPLAY'];
                    datoForm.tittle = response.data['DESCR'];
                    this.setState({
                        dataForm: datoForm,
                        loading: false
                    });    
                }else{
                    datoForm.name = '';
                    datoForm.name = '';
                    this.setState({
                        dataForm: datoForm,
                        loading: false
                    }); 
                }
            }
        );


    }

    handlerCancel(){
        this.setState({ 
            dataForm: {}, 
            isEdit: false,
            isView:false,
        });
    }

    handleChange(e){
        this.setState({[e.target.name]:e.target.value});
    }

    handleTableAuthUser(e, param, posicion){
        const target = e.target;
        console.log("targ", param)
        //if (target.matches('i.material-icons')) {


                this.setState({
                    idauth_assignment: param.idauth_assignment,
                    user_id: param.credentials_id,
                    stat: param.estado == 1 ? 0 : 1,
                    item_name: param.item_name,
                    posicion: posicion,
                });
                this.setState({isEditAuth: true}, () => this.handlerBtnEditAuth());
            
        //}

    }

    handleCancelAuth(){
        this.setState({isEditAuth: false });
        this.setState({user_id: ''});
        this.setState({item_name: ''});
        this.setState({status: 0}); 
    }

    /*INSERTA UN HIJO*/
    handlerSubmitAuth(){

        let save_data={};
        let user = localStorage.username;
        let val = this.state.selectedItemAuth;
        save_data['item_name'] = val
        save_data['credentials_id'] = this.state.user_id;
        save_data['estado'] = 1;
        //save_data['usuario_creacion'] = user;

        CleverRequest.post(CleverConfig.getApiUrl('bengine')+'/api/auth-assignment/create', 
            save_data,
                (response,Error) => {
                    if(Error === false){
                        MComponentes.toast("New permission add!");
                        this.handleCancelAuth();
                        this.modalAuthItem.getInstance().close();
                        this.tableAuth.newItem(save_data);
                    }else{
                        MComponentes.toast("Not permission add!");
                    }
                })

    }

    /*Cambiar estatus hijos*/
    handlerBtnEditAuth(){

        let update_data={};
        let user = localStorage.username;
        update_data['item_name'] = this.state.item_name;
        update_data['credentials_id'] = this.state.user_id;
        update_data['estado'] = this.state.stat
        //update_data['usuario_ultima_modificacion'] = user;

        CleverRequest.put(CleverConfig.getApiUrl('bengine')+'/api/auth-assignment/update-status/'+this.state.item_name+'/'+this.state.user_id,
            update_data,
            (response, error) => {
                if(error === false){
                    MComponentes.toast("Item has been updated!");
                    this.tableAuth.setIdEdit(this.state.posicion);
                    this.tableAuth.updateData(update_data);
                    this.modalAuthItem.getInstance().close();
                    this.handleCancelAuth();
                }
            }
        )
    }

    getConfigAddButtonsModal(){
        let buttons = [];
            if (this.state.isEdit){
                buttons = [ 
                    <button className="btn btn-warning" type="submit" onClick={() => this.handlerBtnEdit()}>
                        <i className="material-icons left">mode_edit</i><span data-i18n="{{'UPDATE'}}">Update</span>
                    </button>
                ];
            } else{
                buttons = [
                    <button className="btn waves-effect waves-light" type="submit" onClick={() => this.handlerSubmit()}>
                        <i className="material-icons right">save</i><span data-i18n="{{'SAVE'}}">Save</span>
                    </button>
                ];
            }

            if (this.state.isView){
                buttons = []

            }

        return buttons;
    }

    getConfigAddButtonsModalAuthItem(){
    
        let buttons = [];
        if(this.state.isEditAuth){
            buttons = [ 
                <button className="btn btn-warning" type="submit" onClick={() => this.handlerBtnEditAuth()}>
                    <i className="material-icons left">mode_edit</i><span data-i18n="{{'UPDATE'}}">Update</span>
                </button>
            ];
        }else{
            buttons = [
                <button className="btn waves-effect waves-light" type="submit" onClick={() => this.handlerSubmitAuth()}>
                    <i className="material-icons right">save</i><span data-i18n="{{'SAVE'}}">Save</span>
                </button>
            ];
        }

        return buttons;
    }

    // handleauth(){
    //     let name = this.refSelectIdItemName.getValue();

    //     axiosRequest.get(
    //         CleverConfig.getApiUrl('auth')+'/authitem/elementbyid/'+ name,
    //             (res) => {
    //                 if (res.error==false) {
    //                     this.setState({idauth_item: res.data['idauth_item']});
    //                 }else{
    //                     this.setState({idauth_item: 0});
    //                 }
    //             }
    //     )

    // }

    render() {

        var instanceGrid = null;
        var instanceGridBlock = null;

        return (
        
            <div className="row">
                <CleverLoading show={this.state.loading}></CleverLoading>
                <Card header={'Admin credentials and permissions'} control={
                        <Modal
                        idModal="modalUser"
                        title={{ "text":"Configure Credential","i18n":"CONFIGURE CREDENTIAL"}}
                        modalClass = "modal-fixed-footer"
                        addButtons={this.getConfigAddButtonsModal()}
                        openButton={
                            {
                                i18n: "{{'ADD'}}",
                                icon : "add",
                                iconClass: "right",
                                buttonClass : "btn btn-small",
                                text: 'Add new'
                            }
                        }
                        defaultButton = {
                            {
                                i18n: "{{'CLOSE'}}",
                                icon: "close",
                                iconClass: "right",
                                buttonClass: "red",
                                title: "",
                                text: "Close",
                                click: this.handlerCancel
                            }
                        }                            
                        onRef={modal => this.refModal = modal}
                        options={{dismissible:false}}
                    >
                        {this.getConfigModal()}
                    </Modal>
                }>
                    <div className="row">
                        <div className="col s12 m12 l12 xl12">
                            <GridView
                                serializeRows={false}
                                url={CleverConfig.getApiUrl('bengine') + '/api/credentials/search-all'}
                                classTable={'clever-table responsive-table striped bordered'}
                                idTable="tableUsers"
                                floatHeader={true}
                                columns={[
                                    { 
                                        attribute: 'iddef_credentials', 
                                        alias: 'ID' 
                                    },
                                    { 
                                        attribute: 'name', 
                                        alias: 'NAME' 
                                    },
                                    { 
                                        attribute: 'api_key', 
                                        alias: 'KEY' 
                                    },
                                    { 
                                        attribute: 'channel_name', 
                                        alias: 'CHANNEL' 
                                    },
                                    {
                                        attribute:'ip_list_allowed',
                                        alias: 'IP ALLOWED'
                                    },
                                    {
                                        attribute:'dns_list_allowed',
                                        alias: 'DNS ALLOWED'
                                    },
                                    { 
                                        alias: 'Expand', 
                                        expandCall : (data) => this.handleDetalle(data)
                                    },                            
                                    { 
                                        alias : 'Status', 
                                        value : (data, index) => {
                                            return data.estado == 1 ? <b className="green-text">Active</b> : <b className="red-text">Inactive</b> ;
                                        }
                                    },
                                    { 
                                        alias: 'Actions', 
                                        value : (data, index) => {
                                            const datos = [
                                                { "value":"data", "text":"Edit", icon:"mode_edit"},
                                            {"value":"data", "text":"View", icon:"visibility"},
                                                { "value":"data", "text":"Assign", icon:"assignment_ind"},
                                            ]
                                            return (
                                                <div>
                                                    {data.estado == 1 ? 
                                                    <Dropdown data={datos} type='icon' onChange={(e)=> this.handleTableUser(e,data,index)} />
                                                    :
                                                    null
                                                    }
                                                    {data.estado == 1 ?
                                                    <a onClick={(e) =>this.funcionRefDeleteCredentials(e, data)} 
                                                    title='Disable Credential'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) =>this.funcionRefDeleteCredentials(e, data)} 
                                                    title='Enable Credential'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                    }
                                                </div>
                                            );
                                        }
                                    },
                                ]}
                                onRef={gridView => this.instanceGrid = gridView}
                            >
                            </GridView>
                        </div>
                    </div>
                </Card>
                <Modal
                    idModal="modalUserEdit"
                    title={{ "text":"View Detail","i18n":"VIEW DETAIL"}}
                    modalClass = "modal-fixed-footer"
                    defaultButton = { 
                        {
                            i18n: "{{'CLOSE'}}",
                            icon: "close",
                            iconClass: "right",
                            buttonClass: "red",
                            title: "",
                            text: "Close",
                            click: this.handlerCancel
                        }
                    }                            
                    onRef={modal => this.modalAuth = modal}
                    >
                </Modal>    
                <Modal
                    idModal="modalAuthItem"
                    title={{ "text":"Configure Permissions","i18n":"CONFIGURE PERMISSIONS"}}
                    addButtons={this.getConfigAddButtonsModalAuthItem()}
                    modalClass = "modal-fixed-footer"
                    defaultButton = { 
                                        {
                                            i18n: "{{'CLOSE'}}",
                                            icon: "close",
                                            iconClass: "right",
                                            buttonClass: "red",
                                            title: "",
                                            text: "Close",
                                            click: this.handleCancelAuth
                                        }
                                    }                            
                    onRef={modal => this.modalAuthItem = modal}
                    >               
                </Modal>
                <CleverLog 
                    apiUrl={CleverConfig.getApiUrl('auth')+'/usuario' + '/log/'} 
                    isFull={false} 
                    onRef={log => this.refLogs = log}>
                </CleverLog>
            </div>
        );
    }
}