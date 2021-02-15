import React, { Component,Fragment, useCallback } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverLoading,CleverForm, CleverRequest,MComponentes, CleverButton} from "clever-component-library";
import FormMapGoogle from './FormMapGoogle';

export default class FormContact extends Component {
    constructor(props) {
        super(props);

        this.starPag = this.starPag.bind(this);
        this.getContacts = this.getContacts.bind(this);
        this.getCountries = this.getCountries.bind(this);
        // this.getStates = this.getStates.bind(this);     
        this.getViewForm = this.getViewForm.bind(this);
        this.getRequestContact = this.getRequestContact.bind(this);
        this.handlerADDMobil = this.handlerADDMobil.bind(this);
        this.onClickRemove = this.onClickRemove.bind(this);
        this.handleSaveContact = this.handleSaveContact.bind(this);
        this.handleAddContact = this.handleAddContact.bind(this);
        this.onRemoveFrm = this.onRemoveFrm.bind(this);
        this.updateDataContact = this.updateDataContact.bind(this);
        this.createDataContact = this.createDataContact.bind(this);
        this.deleteFrmByID = this.deleteFrmByID.bind(this);
        this.validateSave = this.validateSave.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load: false,
            isViewMap: false,
            listFrmContact:[],
            listRefFrmContact:[],
            namestate:[
                {
                    nombre:'QR',
                    descripcion:'Quintana Roo'
                },
                {
                    nombre:'Yucatan',
                    descripcion:'Yucatan'
                }
            ],
            diallingCodeByCountry:'000',
            listDiallingByCountry:[]
        }
    }

    componentDidMount(){    
        this.props.refSaveData !== null ? document.getElementById(this.props.refSaveData.current.id).addEventListener("click", this.handleSaveContact) : null; 
        this.props.refAddFrmContact !== null ? document.getElementById(this.props.refAddFrmContact.current.id).addEventListener("click", this.handleAddContact): null;       
        let typeC = this.props.tipoFrm ? this.props.tipoFrm : 1;      
        this.starPag(typeC);  
    }

    starPag(typeC){
        this.setState({load:true,typeContact:typeC},()=>{            
            // this.getStates();
            this.getCountries(()=>
            {
                this.getContacts(()=>{
                    this.getViewForm(()=>{   
                        this.setState({load:false});
                    });               
                });
            });
        });
    }

    getCountries(functionCountries=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/country/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let listCountries = [];  

                    response.data.map((data) => {    
                        if(data.estado){
                            let infoInput = {};
                            infoInput.value = `${data.country_code}`;
                            infoInput.option = data.name;
                            listCountries.push(infoInput);  
                            
                            this.setState(prevState => ({
                                listDiallingByCountry: [...prevState.listDiallingByCountry,
                                    {code:`${data.country_code}`,dialling:`${data.dialling_code}`}],
                            }))      
                        }               
                                                   
                    });                    
                    this.setState({ countries:listCountries},functionCountries);                
                }else{
                    this.setState({ load: false},functionCountries);
                }
                
            }else{
                this.setState({ load: false},functionCountries);
            }
        });
    }

    getContacts(functionContact=()=>{}){
        let property_id = this.state.hotelData.iddef_property;
        let iddef_contact_type = this.state.typeContact; 
        let listCodeLineCountry = this.state.listDiallingByCountry;

        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/contact-form/search/${property_id}/${iddef_contact_type}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let listFrm = [];
                    let dataInfo = [];
                    let dataMapLayout = {};

                    if(iddef_contact_type == 1){
                        dataInfo.push(response.data)
                    }else{
                        dataInfo = response.data;
                    }
                    dataInfo.length > 0 ?
                        dataInfo.map((data)=>{
                            let dataContact = {};                        
                            let dataMobil = [];

                            dataContact.iddef_contact = data.iddef_contact !== undefined ? data.iddef_contact : 0;
                            dataContact.first_name = data.first_name !== undefined ? data.first_name :'';
                            dataContact.last_name = data.last_name!== undefined ? data.last_name  :'';
                            dataContact.estado = data.estado!== undefined ? data.estado  : 1;
                            
                            data.addresses ?
                                data.addresses.map((addressContact)=>{
                                    dataContact.iddef_address = addressContact.iddef_address;
                                    dataContact.address = addressContact.address;
                                    // dataContact.stateContact = addressContact.state_code;
                                    dataContact.city = addressContact.city;
                                    dataContact.zip_code = addressContact.zip_code;
                                    dataContact.country = addressContact.country_code;
                                    iddef_contact_type == 1 ?
                                        dataMapLayout.latitud = addressContact.latitude ? addressContact.latitude :'0'
                                    :null;
                                    iddef_contact_type == 1 ?
                                        dataMapLayout.longitud = addressContact.longitude ? addressContact.longitude :'0'
                                    :null;                                
                                }
                                )
                            :null;      

                            let diallingCode = listCodeLineCountry.find(listDialling => listDialling.code == dataContact.country);
                            
                            diallingCode !== undefined ?
                                this.setState({diallingCodeByCountry:diallingCode.dialling})
                            :   this.setState({diallingCodeByCountry:''});

                            data.email_contacts  ?
                                data.email_contacts.map((emailsContacts)=>
                                {
                                    //si el email esta activo
                                    if (emailsContacts.estado == 1){ 
                                        let contactPrincipal= emailsContacts.iddef_email_contact;
                                        contactPrincipal ? contactPrincipal : 0

                                        if(emailsContacts.email_type==1){
                                            let notifyEmail = emailsContacts.notify_booking; 
                                            dataContact.notify_booking= notifyEmail == 0 ? [] : ["Send booking notification"];
                                            dataContact.email = emailsContacts.email;                                
                                            dataContact.iddef_email_contactPrncipal = contactPrincipal;
                                            
                                        }

                                        if(emailsContacts.email_type==2){
                                            dataContact.alt_email = emailsContacts.email,
                                            dataContact.iddef_email_contactSecundario = contactPrincipal;
                                        }

                                        if(iddef_contact_type == 1){
                                            if(emailsContacts.email_type==3){
                                                dataContact.emailProperty = emailsContacts.email;
                                                dataContact.iddefEmailProperty = contactPrincipal;
                                            }   
                                        }                                        
                                    }
                                    
                                })
                            :null;

                            dataContact.diallingByCountry= this.state.diallingCodeByCountry;
                            data.contact_phones ? 
                                data.contact_phones.map((phones,key)=>{
                                    if(phones.estado == 1){
                                        let country = {};
                                        let area = {};
                                        let number = {};
                                        let extension = {};
                                        
                                        country = `000`;

                                        area = `000${String(phones.area)}`;
                                        area = area.substring(area.length-3, area.length);

                                        number = `0000000${String(phones.number)}`;
                                        number = number.substring(number.length-7, number.length);

                                        extension = `0000${String(phones.extension)}`;
                                        extension = extension.substring(extension.length-4, extension.length);
                                        
                                        if(phones.iddef_phone_type == 1){
                                            dataContact.iddef_contact_phonePrin = phones.iddef_contact_phone;  
                                            dataContact.phonePrincipal = phones.number !== 0 ? `${country} ${area} ${number} ${extension}` : '';                                      
                                        }

                                        if(phones.iddef_phone_type == 3){
                                            dataContact.iddef_contact_phoneFax = phones.iddef_contact_phone;   
                                            dataContact.fax = phones.number !== 0 ? `${country} ${area} ${number} ${extension}` :'';
                                        }

                                        if(phones.iddef_phone_type == 2){
                                            let newMobile = {};
                                            newMobile.iddef_contact_phoneMobil = phones.iddef_contact_phone,
                                            newMobile.mobil = `${country} ${area} ${number}`,
                                            newMobile.estado = phones.estado;
                                            newMobile.isExist = 'mobil_E_';
                                            dataContact['mobil_E_'+phones.iddef_contact_phone] = `${country} ${area} ${number}`,

                                            dataMobil.push(newMobile);
                                        }

                                        if(iddef_contact_type == 1){
                                            if(phones.iddef_phone_type == 4){
                                                dataContact.iddefContactPhoneProperty = phones.iddef_contact_phone;  
                                                dataContact.phoneProperty = phones.number !== 0 ? `${country} ${area} ${number} ${extension}` : '';                                      
                                            }
                                        }
                                    }
                                })
                            :null;

                            dataContact.mobil = dataMobil;

                            dataContact.estado == 1 ? 
                                listFrm.push(dataContact)
                            : null;
                    })
                    :null;

                    this.setState(
                        {
                         formContact: listFrm,
                         formMap: dataMapLayout,
                         dataOrig : dataInfo,
                        },functionContact
                    );  
                }else{
                    this.setState({ load: false});
                }
                
            }else{
                this.setState({ load: false});
            }
        });
    }

    handleAddContact(){
        let {typeContact,formContact}= this.state;
        let maxFrmSec = 10;        
        let dataOrin = formContact;
        let valActive = formContact.filter(data => data.estado == 1); 
        let numFrmAct = valActive.length;
               
        if (typeContact == 2){
            // console.log(numFrmAct,' < ',maxFrmSec);
            
            if(numFrmAct < maxFrmSec){
                let dataNewFrm = {
                    iddef_contact:0,
                    first_name: '',
                    last_name: '',  
                    estado:1,                  
                    iddef_address: '',
                    address: '',
                    stateContact: '',
                    city: '',
                    zip_code: '',
                    country: '',
                    notify_booking: [],
                    email: '',                               
                    iddef_email_contactPrncipal: '',
                    alt_email: '',
                    iddef_email_contactSecundario: '',                    
                    iddef_contact_phonePrin: '',
                    phonePrincipal: '',
                    iddef_contact_phoneFax: '',
                    fax: '',
                    diallingByCountry:'',
                    mobil: []
                };
                dataOrin.push(dataNewFrm);
                this.getViewForm();    
            }else{
                MComponentes.toast("Has exceeded the maximum allowed forms");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Has exceeded the maximum allowed forms", notificationType: "error"});
            }
        }
    }

    handlerADDMobil(keyFrm){    
        keyFrm = this.state.typeContact == 2 ? keyFrm-1 : keyFrm;         
        let dataOrin = this.state.formContact[keyFrm].mobil !== undefined ? this.state.formContact[keyFrm].mobil : this.state.formContact[keyFrm].mobil = [];
        let valActive = dataOrin.filter(data => data.estado == 1);        
        let countMobil = valActive.length;
        let maxMobil = 5;

        if(countMobil < maxMobil){
            dataOrin.push({iddef_contact_phoneMobil: 0,mobil: "",estado:1,isExist:'mobil_N_'});   
            this.getViewForm(); 
        }else{
            MComponentes.toast("You have exceeded the maximum allowed mobile");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "You have exceeded the maximum allowed mobile", notificationType: "error"});
        }        
    }

    onClickRemove(phoneRemove){        
        let splitFrm = phoneRemove.split('_');
        let indexFrm = splitFrm[0];
        indexFrm = this.state.typeContact == 2 ? indexFrm-1 : indexFrm;
        let indexPhone = splitFrm[1];     
        let dataFormIndex =  this.state.formContact[indexFrm];   
        let valueMobil = dataFormIndex.mobil;
        
        let dataRef = this.state.listRefFrmContact[indexFrm].getData();
        let valueRef = dataRef.values;
        
        let arrayMobil = [];
        valueMobil.map((valueArrayMobil,key)=>{   
            let valNewArray;
            let dataMobil = {}
            let nameMobil = valueArrayMobil.isExist  == 'mobil_E_'  
                            ? 'mobil_E_'+valueArrayMobil.iddef_contact_phoneMobil
                            : 'mobil_N_'+key;

            let regMob = '000'// valueRef[nameMobil+'_region'] !== undefined ? `000${valueRef[nameMobil+'_region']}` : '';
            let areaMob = valueRef[nameMobil+'_area'] !== undefined ? `000${valueRef[nameMobil+'_area']}` : '';
            let numberMob = valueRef[nameMobil+'_number'] !== undefined ? `0000000${valueRef[nameMobil+'_number']}` : '';
           
            // regMob = regMob.substring(regMob.length-3, regMob.length);
            areaMob = areaMob.substring(areaMob.length-3, areaMob.length);
            numberMob = numberMob.substring(numberMob.length-7, numberMob.length);

            dataMobil.iddef_contact_phoneMobil = valueArrayMobil.iddef_contact_phoneMobil;
            dataMobil.mobil = valueArrayMobil.estado == 0 ? valueArrayMobil.mobil :`${regMob} ${areaMob} ${numberMob}`;
            dataMobil.estado = indexPhone == key ? 0 : valueArrayMobil.estado;
            dataMobil.isExist = valueArrayMobil.isExist;
            
            delete this.state.formContact[indexFrm].nameMobil;

            if(dataMobil.estado == 1 || (dataMobil.estado == 0 && dataMobil.iddef_contact_phoneMobil !== 0)){
                arrayMobil.push(dataMobil);
                valNewArray = arrayMobil.length-1;
                dataMobil.isExist == 'mobil_E_' 
                    ? dataFormIndex[nameMobil] = dataMobil.mobil == '000 000 0000000' ? ' ' :dataMobil.mobil 
                    : dataFormIndex['mobil_N_'+valNewArray] =  dataMobil.mobil == '000 000 0000000' ? ' ' :dataMobil.mobil 
                                     
            }

        });        
        this.state.formContact[indexFrm].mobil = arrayMobil;
        this.getViewForm();
    }

    onRemoveFrm(index){
        let indexFrm = this.state.typeContact == 2 ? index-1 : index; 
        let dataFormIndex =  this.state.formContact[indexFrm];
        /*Primer se valida si el formulario es nuevo o ya existia
        si es totalmente nuevo solo se eliminara, pero si ya exitia,
        se procede a realizar el update a la api*/
        this.setState({load:true});  
        if(dataFormIndex.iddef_contact !== 0){  
            let dataFrmORIG = this.state.dataOrig.filter(data => data.iddef_contact == dataFormIndex.iddef_contact);
                dataFrmORIG = dataFrmORIG[0];
            let id = dataFrmORIG.iddef_contact;
                dataFrmORIG.estado = 0;
                dataFrmORIG.email_contacts.map((dataEmail)=>{
                    dataEmail.notify_booking = 0;
                });
            //Se envia el nuevo request al update                  
            this.updateDataContact(id,dataFrmORIG,()=>{      
                /*Si la respuesta del update es exitoso se setea mensaje de exito
                y se elimina el objeto del estate de formularios, 
                posteriormenete se llama al metodo que pinta los grids para 
                que en la vista ya ano aparexca el formulario removido*/
                let notifytype = this.state.notificationType;
                if( notifytype == 'success'){
                    this.deleteFrmByID(true,notifytype,indexFrm);
                }
                else{
                    this.deleteFrmByID(false,notifytype,null);
                }
            });
        }else{
            this.deleteFrmByID(true,'success',indexFrm);
        }
    }

    deleteFrmByID(statusDelete,notificationType,indexFrm){
        let notificationMessage ='';
        
        if(statusDelete == true){
            notificationMessage = "The form was remove";
            //Se elimina del state de formulario
            delete this.state.formContact[indexFrm];
            //Recarga el pintado de los formularios
            this.getViewForm();        
        }else{
            //Si la respuesta es negativa se setea mensaje de error
            notificationMessage = "The form was not removed"
        }
        //Se muestra el mensaje
        MComponentes.toast(notificationMessage);
        this.setState({load:false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
    }

    getViewForm(functionView=()=>{}){
        let listView=[];
        let frmRefs = [];
        let contenedor = "";
        let isbuttonAditional = false;
        let {formContact,formMap,countries,typeContact} = this.state;
        /* Si el tipo d contacto es 1 significa que es del apartado contactos 
           si no signica q es un 2 y hace referencia a otros contactos*/
        if(typeContact == 1){
            contenedor = "col s6 m6 l6";
            isbuttonAditional = false;
        }else if(typeContact == 2){
            contenedor = "col s12 m12 l12";
            isbuttonAditional = true;
        }

        formContact ?
            formContact.map((data,key)=>{
                if(data.estado == 1){
                    typeContact == 2 ? key=key+1 : null;
                    
                    let row ={};
                    let listMobil = [];
                    data.mobil !== undefined ?
                        data.mobil.sort().map((dataMobil,keyMobil)=>{
                            // console.log('dataMobil ==> ', dataMobil);
                            
                            if (dataMobil.estado == 1){
                                let namePhone = dataMobil.iddef_contact_phoneMobil == 0 
                                                ? '_N_'+keyMobil 
                                                :'_E_'+dataMobil.iddef_contact_phoneMobil;
                                row ={row:[ {type: 'text',size: 'col s3 m3 l3',label: 'Dialling Code: ',placeholder:'+000',
                                            name: 'diallingByCountry',disabled:true,characters:true,alphanumeric:true},                                    
                                            {type: 'phone',name:'mobil'+namePhone,
                                            // sizeRegion : 'col s3 m3 l3',labelRegion : 'Country',region:false,
                                            sizeArea : 'col s3 m3 l3',labelArea: '*Area',area:true,
                                            sizeNumber: 'col s3 m3 l3',labelNumber: '*Number',
                                            required: true,
                                            },
                                            {type:'component',
                                        component:() =>{
                                            return(  
                                                    <div className='col s2 m2 l2'>
                                                        <a onClick={ e => this.onClickRemove(key+'_'+keyMobil)} >
                                                            <i className='material-icons'>remove_circle</i>
                                                        </a>
                                                    </div>
                                            );
                                        }
                                    },
                                ]}
                                listMobil.push(row);
                            }
                            
                        })
                    :null;

                    listView.push(
                        <div key={'FrmContact'+key}>
                            
                            {typeContact ==1 ?(
                                <div className="col s6 m6 l6">
                                    <Fragment>
                                        <FormMapGoogle
                                        dataMaps ={formMap}
                                        />
                                    </Fragment>
                                </div>
                            )
                            :null
                            }
                            {/* {rowsFrm ? */}
                            <div className={contenedor}>
                                <CleverForm
                                    id={'form-dataContact_'+key}
                                    data={data}
                                    ref={ref => frmRefs.push(ref)}
                                    forms={[
                                            { 
                                                fieldset: true,
                                                title: '',                                       
                                                inputs:[ 
                                                    {row:
                                                        isbuttonAditional == true ?
                                                        [
                                                        {type:'component',                          
                                                            component:() =>{
                                                                return(
                                                                    <div className='col s1 m1 l1 offset-s12 offset-m12 offset-l12'>
                                                                        <a onClick={e=>this.onRemoveFrm(key) } >
                                                                            <i style={{color:'red'}} className='material-icons'>remove_circle</i>
                                                                        </a>
                                                                    </div>
                                                                );
                                                            }
                                                        },
                                                        ]:[]
                                                    },
                                                    {row:[
                                                        {type: 'number',size: 'col s12 m6 l6',label: '',name: 'iddef_contact',
                                                            required: false,hidden:true},
                                                        {type: 'text',size: 'col s12 m6 l6',label: '* First Name: ',name: 'first_name',
                                                            placeholder:'Insert First Name',required: true,alphanumeric:true,characters:true},
                                                        {type: 'text',size: 'col s12 m6 l6',label: '* Last Name: ',name: 'last_name',
                                                            placeholder:'Insert Last Name',required: true,alphanumeric:true,characters:true},
                                                    ]},
                                                    {row:[    
                                                        {type: 'text',size: 'col s12 m6 l6',label: '* Address: ',name: 'address',
                                                            placeholder:'Insert Address',required: true,alphanumeric:true,characters:true},
                                                        {type: 'text',size: 'col s12 m6 l6',label: '* City: ',name: 'city',
                                                            placeholder:'Insert City',required: true,alphanumeric:true,characters:true},
                                                    ]},
                                                    {row:[
                                                        {type: 'select',size: 'col s12 m6 l6',label: '* Country: ',name: 'country',
                                                            placeholder:'Select Country',manual: true,options:countries,
                                                            autocomplete:true, required: true,onChange:e => this.onChangeCountry(e,key)},
                                                        {type: 'text',size: 'col s12 m6 l6',label: '* ZIP Code: ',name: 'zip_code',
                                                            placeholder:'Insert ZIP Code',required: true,alphanumeric:true},
                                                    ]},
                                                    {row:[
                                                        {type:'component',                          
                                                            component:() =>{
                                                                return(
                                                                        <label  >Landline:</label>  
                                                                );
                                                            }
                                                        },
                                                    ]},
                                                    {row:[
                                                        {type: 'text',size: 'col s3 m3 l3',label: 'Dialling Code: ',name: 'diallingByCountry',placeholder:'+000',disabled:true,characters:true,alphanumeric:true}, 
                                                        {type: 'phone',name:'phonePrincipal',
                                                        sizeArea : 'col s3 m3 l3',labelArea: typeContact == 2 ? 'Area':'* Area',area:true,
                                                        sizeNumber: 'col s3 m3 l3',labelNumber: typeContact == 2 ? 'Number':'* Number',
                                                        sizeExtension : 'col s3 m3 l3',labelExtension: 'Extension',extension:true,
                                                        required: typeContact == 2 ? false : true,
                                                        },
                                                    ]}, 
                                                    {row:[
                                                        {type:'component',
                                                            component:() =>{
                                                                return(
                                                                        <label  >Fax:</label>  
                                                                );
                                                            }
                                                        },
                                                    ]},
                                                    {row:[
                                                        {type: 'text',size: 'col s3 m3 l3',label: 'Dialling Code: ',name: 'diallingByCountry',placeholder:'+000',disabled:true,characters:true,alphanumeric:true}, 
                                                        {type: 'phone',name:'fax',
                                                        sizeArea : 'col s3 m3 l3',labelArea: 'Area',area:true,
                                                        sizeNumber: 'col s3 m3 l3',labelNumber: 'Number',
                                                        sizeExtension : 'col s3 m3 l3',labelExtension: 'Extension',extension:true,
                                                        required: false,
                                                        },
                                                    ]}, 
                                                    {row:[
                                                        {type:'component',
                                                            component:() =>{
                                                                return(
                                                                        <label  >Mobil:</label>                                 
                                                                );
                                                            }
                                                        },
                                                    ]},
                                                ]
                                                .concat(listMobil)
                                                .concat([
                                                    {row:[
                                                        {type:'component', 
                                                            component:() =>{                                      
                                                                return (
                                                                    <div>
                                                                        <div className='col s12 m12 l12'>
                                                                            <button type='button' onClick={e=>this.handlerADDMobil(key)} id="AddPhone" className='btn' >ADD PHONE</button>
                                                                        </div>
                                                                        <div className='col s12 m12 l12'>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }   
                                                        },
                                                    ]},
                                                    {row:[
                                                        {type: 'email',size: 'col s12 m6 l6',label: '* E-mail: ',name: 'email',placeholder:'Insert Email',required: true},      
                                                        {type: 'email',size: 'col s12 m6 l6',label: 'Alt. e-mail: ',name: 'alt_email',placeholder:'Insert Alt. e-mail',required: false},    
                                                    ]},
                                                    {row:[                                   
                                                        { type: 'checkbox', size: 'col s12 m3 l3', name: 'notify_booking',
                                                        checkboxs: [{value: "Send booking notification",label: "Send booking notification"}]},
                                                    ]},                                                    
                                                ])   
                                            },
                                            typeContact == 1?
                                            { 
                                                fieldset: true,
                                                title: 'PROPERTY CONTACT',                                       
                                                inputs:[ 
                                                    {row:[
                                                        {type:'component',                          
                                                            component:() =>{return( <label>Phone Contact:</label> );}
                                                        },
                                                    ]},
                                                    {row:[
                                                        {type: 'text',size: 'col s3 m3 l3',label: 'Dialling Code: ',name: 'diallingByCountry',placeholder:'+000',disabled:true,characters:true,alphanumeric:true}, 
                                                        {type: 'phone',name:'phoneProperty',
                                                        sizeArea : 'col s3 m3 l3',labelArea: 'Area',area:true,sizeNumber: 'col s3 m3 l3',labelNumber: 'Number',
                                                        sizeExtension : 'col s3 m3 l3',labelExtension: 'Extension',extension:true,
                                                        required: false,
                                                        },
                                                    ]},
                                                    {row:[
                                                        {type: 'email',size: 'col s12 m12 l12',label: 'E-mail: ',name: 'emailProperty',placeholder:'Insert Email Contact',required: false}                                                          
                                                    ]}, 
                                                ]
                                            }: { inputs:[{row:[]}]}
                                    ]}    
                                />

                            </div>
                        </div>                       
                    );
                }
            })
        :null;

        this.setState(
            {listRefFrmContact:frmRefs,
                listFrmContact:listView
            },functionView()
        );        
    }

    getRequestContact(dataValues, dataOrig){           
        let request={};
        let property_id = this.state.hotelData.iddef_property;
        let typeContact = this.state.typeContact;
        let id_contact = dataValues.iddef_contact !== '' ? dataValues.iddef_contact  : 0;
        let addreses = [];
        let dataAddreses={};
        let emails = [];
        let dataemail = {};
        let dataemail_alt = {};
        let dataEmailProperty = {};
        let phones = [];
        let datatypePhone = {};
        let datatypeFax = {};
        let faxFull = {};
        let landlineFull = {};
        let dataPhoneProperty = {};
        let phonePropertyFull = {};
 
        // id_contact == 0 ? request.iddef_property = property_id :null;        
        request.iddef_property = property_id
        request.iddef_contact = id_contact;
        request.last_name = dataValues.last_name;
        request.first_name = dataValues.first_name;
        request.iddef_contact_type = typeContact;
        request.estado = dataValues.estado !== undefined ? dataValues.estado :1;

        dataAddreses.iddef_address = id_contact!== 0 ? dataOrig.iddef_address ? dataOrig.iddef_address : 0 :0;
        dataAddreses.address = dataValues.address;
        dataAddreses.latitude = typeContact == 1 ? document.getElementById("latitud").value : '';
        dataAddreses.longitude = typeContact == 1 ? document.getElementById("longitud").value : '';
        dataAddreses.country_code = dataValues.country;
        dataAddreses.state_code = /*dataValues.stateContact*/'';
        dataAddreses.zip_code = dataValues.zip_code;
        dataAddreses.city = dataValues.city;
        dataAddreses.estado = 1;
        addreses.push(dataAddreses);

        request.addresses = addreses;            

        dataemail.iddef_email_contact = id_contact!== 0 ? dataOrig.iddef_email_contactPrncipal ? dataOrig.iddef_email_contactPrncipal : 0 :0;
        dataemail.email = dataValues.email;
        dataemail.notify_booking = (dataValues.notify_booking.length > 0) ? 1 : 0;
        dataemail.iddef_contact = id_contact;
        dataemail.email_type = 1;
        dataemail.estado = 1;
        emails.push(dataemail);

        dataemail_alt.iddef_email_contact = id_contact!== 0 ? dataOrig.iddef_email_contactSecundario ? dataOrig.iddef_email_contactSecundario : 0 :0;
        dataemail_alt.email = dataValues.alt_email;
        dataemail_alt.notify_booking = 0;
        dataemail_alt.iddef_contact = id_contact;
        dataemail_alt.email_type = 2;
        dataemail_alt.estado = 1;
        emails.push(dataemail_alt);
        
        if(typeContact == 1){
            dataEmailProperty.iddef_email_contact = id_contact!== 0 ? dataOrig.iddefEmailProperty ? dataOrig.iddefEmailProperty : 0 :0;
            dataEmailProperty.email = dataValues.emailProperty !== undefined ? dataValues.emailProperty !== null ? dataValues.emailProperty : "" :"";
            dataEmailProperty.notify_booking = 0;
            dataEmailProperty.iddef_contact = id_contact;
            dataEmailProperty.email_type = 3;
            dataEmailProperty.estado = 1;
            emails.push(dataEmailProperty);
        }

        request.email_contacts = emails;

        datatypePhone.iddef_contact_phone = id_contact!== 0 ? dataOrig.iddef_contact_phonePrin ? dataOrig.iddef_contact_phonePrin : 0 :0;
        datatypePhone.iddef_phone_type = 1;
        datatypePhone.iddef_contact = id_contact;        

        landlineFull = dataValues.phonePrincipal !== undefined ? dataValues.phonePrincipal.split(' ') :null;
        datatypePhone.country = dataValues.phonePrincipal !== undefined ? dataValues.diallingByCountry !== '' ? dataValues.diallingByCountry : '':'';
        datatypePhone.area = dataValues.phonePrincipal_area == undefined ? dataValues.phonePrincipal !== undefined ? landlineFull[0] != '000' ? String(landlineFull[0]) : '':'':String(dataValues.phonePrincipal_area);
        datatypePhone.number = dataValues.phonePrincipal_number == undefined ? dataValues.phonePrincipal !== undefined ? landlineFull[1] != '0000000' ? parseInt(landlineFull[1]) : 0:0: dataValues.phonePrincipal_number !=='' ? parseInt(dataValues.phonePrincipal_number):0;
        datatypePhone.extension = dataValues.phonePrincipal_extension == undefined ? dataValues.phonePrincipal !== undefined ? landlineFull[2] != '0000' ? parseInt(landlineFull[2]) :0:0: dataValues.phonePrincipal_extension !=='' ? parseInt(dataValues.phonePrincipal_extension):0;
        datatypePhone.estado = 1;
        phones.push(datatypePhone);

        datatypeFax.iddef_contact_phone = id_contact!== 0 ? dataOrig.iddef_contact_phoneFax ? dataOrig.iddef_contact_phoneFax : 0 :0;
        datatypeFax.iddef_phone_type = 3;
        datatypeFax.iddef_contact = id_contact;
              
        faxFull = dataValues.fax !== undefined ? dataValues.fax.split(' ') :'';
        datatypeFax.country = dataValues.fax !== undefined ? dataValues.diallingByCountry !== '' ? dataValues.diallingByCountry : '':'';
        datatypeFax.area = dataValues.fax_area == undefined ? dataValues.fax !== undefined ? faxFull[0] != '000' ? String(faxFull[0]) : '':'': String(dataValues.fax_area);
        datatypeFax.number = dataValues.fax_number == undefined ? dataValues.fax !== undefined ? faxFull[1] != '0000000' ? parseInt(faxFull[1]) : 0:0: dataValues.fax_number !== '' ? parseInt(dataValues.fax_number):0;
        datatypeFax.extension = dataValues.fax_extension == undefined ? dataValues.fax !== undefined ? faxFull[2] != '0000' ? parseInt(faxFull[2]) :0:0: dataValues.fax_extension !== '' ? parseInt(dataValues.fax_extension):0;
        datatypeFax.estado = 1;
        phones.push(datatypeFax);

        if(typeContact == 1){
            dataPhoneProperty.iddef_contact_phone = id_contact!== 0 ? dataOrig.iddefContactPhoneProperty ? dataOrig.iddefContactPhoneProperty : 0 :0;
            dataPhoneProperty.iddef_phone_type = 4;
            dataPhoneProperty.iddef_contact = id_contact;      

            phonePropertyFull = dataValues.phoneProperty !== undefined ? dataValues.phoneProperty.split(' ') :null;
            dataPhoneProperty.country = dataValues.phoneProperty !== undefined ? dataValues.diallingByCountry !== '' ? dataValues.diallingByCountry : '':'';
            dataPhoneProperty.area = dataValues.phoneProperty_area == undefined ? dataValues.phoneProperty !== undefined ? phonePropertyFull[0] != '000' ? String(phonePropertyFull[0]) : '':'':String(dataValues.phoneProperty_area);
            dataPhoneProperty.number = dataValues.phoneProperty_number == undefined ? dataValues.phoneProperty !== undefined ? phonePropertyFull[1] != '0000000' ? parseInt(phonePropertyFull[1]) : 0:0: dataValues.phoneProperty_number !=='' ? parseInt(dataValues.phoneProperty_number):0;
            dataPhoneProperty.extension = dataValues.phoneProperty_extension == undefined ? dataValues.phoneProperty !== undefined ? phonePropertyFull[2] != '0000' ? parseInt(phonePropertyFull[2]) :0:0: dataValues.phoneProperty_extension !=='' ? parseInt(dataValues.phoneProperty_extension):0;
            dataPhoneProperty.estado = 1;
            phones.push(dataPhoneProperty);
        }

        dataOrig !== undefined ?
        dataOrig.mobil.map((dataMobil,key)=>{
            let datatypePhoneMobil={};
            let valueArea = '';
            let valueNumber = '';
            let valFullOrigMob = dataMobil.mobil.split(' ');

            let nameInputMob = dataMobil.isExist == 'mobil_E_' 
                    ? dataMobil.isExist+dataMobil.iddef_contact_phoneMobil 
                    : dataMobil.isExist+key;

            datatypePhoneMobil.iddef_contact_phone = dataMobil.iddef_contact_phoneMobil;
            datatypePhoneMobil.iddef_phone_type = 2;
            datatypePhoneMobil.iddef_contact = id_contact;
            
            if(dataMobil.estado == 1){
                // valueCountry = dataValues[nameInputMob+'_region'];
                valueArea= dataValues[nameInputMob+'_area'];
                valueNumber = dataValues[nameInputMob+'_number'];
            }else{
                // valueCountry = valFullOrigMob[0] != '000' ? parseInt(valFullOrigMob[0]) : 0;
                valueArea= valFullOrigMob[1] != '000' ? valFullOrigMob[1]: 0;
                valueNumber = valFullOrigMob[2] != '0000000' ? parseInt(valFullOrigMob[2]) : 0;
            }; 

            datatypePhoneMobil.country = dataValues.diallingByCountry !== '' ? dataValues.diallingByCountry : '';;
            datatypePhoneMobil.area = String(valueArea);
            datatypePhoneMobil.number  = parseInt(valueNumber);          
            datatypePhoneMobil.extension = 0;
            datatypePhoneMobil.estado = dataMobil.estado;

            phones.push(datatypePhoneMobil);
        })
        :null;

        request.contact_phones = phones;

        return request;
    }

    handleSaveContact(){
        let tipForm = this.state.typeContact;
        let isSave = false;
        //Valida si todos los formularios estan completos
        let dataValidate = this.validateSave(tipForm);
        let valError = dataValidate.filter(data => data.isSave == false);

        valError.length > 0 ? (
            MComponentes.toast(valError[0].message),
            this.setState({ hiddeNotificationModal: false, notificationMessage: valError[0].message, notificationType: "error"}),
            isSave= false
        )        
        : isSave= true;
            
        isSave == true ?
            this.state.listRefFrmContact.map((reference)=>{
                let notificationType = "";
                let notificationMessage = "";
                let DataValues = reference.getData().values; 
                
                let keyFrm = reference.props.id.split('_');
                /*Si es tipo 2 se resta uno puesto q en la 
                creacion del formulario al key se le suma 1*/
                keyFrm = tipForm == 2 ? keyFrm[1]-1 :keyFrm[1];
                // console.log('tipForm ==> ',tipForm,'    keyFrm ==>  ' ,keyFrm);
                
                let DataOrig = this.state.formContact[keyFrm];  
                // this.setState({load:true});
                let requestContact = this.getRequestContact(DataValues,DataOrig);
                // console.log('requestContact ==> ',JSON.stringify(requestContact));
                let iddef_contact = requestContact.iddef_contact;                
                if(iddef_contact == 0){
                    this.createDataContact(requestContact,()=>{    
                        let notifytype = this.state.notificationType;
                        if (notifytype == 'success') {
                            this.starPag(tipForm);
                            notificationType = notifytype;
                            notificationMessage = "The data was saved";
        
                        } else {       
                            this.setState({load:false});                         
                            notificationType = notifytype;
                            notificationMessage = "The data was no saved";
                        } 
                        MComponentes.toast(notificationMessage);
        
                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });                       
                    });
                }else{                    
                    this.updateDataContact(iddef_contact,requestContact,()=>{    
                        let notifytype = this.state.notificationType;
                        if (notifytype == 'success') {
                            this.starPag(tipForm);
                            notificationType = notifytype;
                            notificationMessage = "The data was saved";
        
                        } else {       
                            this.setState({load:false});                         
                            notificationType = notifytype;
                            notificationMessage = "The data was no saved";
                        }
        
                        MComponentes.toast(notificationMessage);
        
                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    });
                }  
            })
        :null;
    }

    validateSave(tipForm){
        let dataValidate =[];
        /*Primero valida que todos los formularios se encuentren llenos
            de no ser asi no procede a armar los request ni a realizar
            el guardado de los mismo*/
        this.state.listRefFrmContact.map((reference,key)=>{
            let dataForm = reference.getData();
            let dataValues = dataForm.values; 
            // console.log('dataValues ==> ', dataValues);
            let messageComplete = "";
            if (dataForm.required.count > 0) {               
                tipForm == 2 
                    ? messageComplete =`The form ${key+1}  was not saved. Please complete the required data to save the form `
                    : messageComplete ='"Complete the data required"';
                // MComponentes.toast(messageComplete);
                // this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
                
                dataValidate.push({keyFrm:key,message:messageComplete,isSave:false});
            }else{
                let email = dataValues.email.trim();
                let emailAlt = dataValues.alt_email.trim();
                /** Valida emails no sean iguales */                
                if(email == emailAlt){
                    tipForm == 2 
                    ? messageComplete =`The form ${key+1}  was not saved. The E-mail field is equal to the field Alt-e-mail`
                    : messageComplete ='The E-mail field is equal to the field Alt-e-mail';
                    dataValidate.push({keyFrm:key,message:messageComplete,isSave:false});
                }else{
                    dataValidate.push({keyFrm:key,message:'',isSave:true});
                }
                
                /** validacion telefonos, tengan la longitud */
            }           
        })
        return dataValidate
    }

    updateDataContact(iddef_contact,requestContact,functionUpdate=()=>{}){   
        // console.log('iddef_contact ==>  ',iddef_contact,'   requestContact ==> ',JSON.stringify(requestContact));     
        CleverRequest.putJSON(CleverConfig.getApiUrl('bengine') +`/api/contact-form/update/${iddef_contact}`, requestContact, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            // console.log('data ==> ', data);
            let type = {}
            if (!error) {
                if (!data.Error) {
                   // this.starPag(tipForm);
                    type = "success";
                    this.setState({notificationType:type},functionUpdate);
                } else {
                    type = "error";
                    this.setState({notificationType:type},functionUpdate);
                }
            }else{
                type = "error";
                this.setState({notificationType:type},functionUpdate);                    
            }
        });
    }

    createDataContact(requestContact,functionCreate=()=>{}){
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine') +"/api/contact-form/create", requestContact, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            // console.log('data ==> ', data);
            let type = {}
            if (!error) {
                if (!data.Error) {
                   // this.starPag(tipForm);
                    type = "success";
                    this.setState({notificationType:type},functionCreate);
                } else {
                    type = "error";
                    this.setState({notificationType:type},functionCreate);
                }
            }else{
                type = "error";
                this.setState({notificationType:type},functionCreate);                    
            } 
        });
    }

    onChangeCountry(e,index){
        let indexFrm = this.state.typeContact == 2 ? index-1 :index;
        let valueCountry= e.value;
        let listCodeLineCountry = this.state.listDiallingByCountry;
        let diallingCode = listCodeLineCountry.find(listDialling => listDialling.code == valueCountry); 

        let dataFrmContact = this.state.formContact[indexFrm]; 
        dataFrmContact.diallingByCountry = diallingCode.dialling;

        this.setState({diallingCodeByCountry:diallingCode.dialling});   
        this.getViewForm();         
    }

    render(){
        if (!this.state.hotelData) {
            return <Redirect to="/" />
        }
        
        return(
            <div className="row">
                <CleverLoading show={this.state.load}/>               
                {
                    this.state.listFrmContact ?
                        this.state.typeContact == 2 ?
                            this.state.listFrmContact.map(form => (
                                <div className='col s12 m6 l6'><div style={{ height: 20 }}></div>{form}</div>
                            ))
                        : this.state.listFrmContact
                    :null
                }                
            </div>
                        
        );
    }

}

FormContact.defaultProps = {
    refSaveData: null,
    refAddFrmContact:null
}