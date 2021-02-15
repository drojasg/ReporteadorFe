import React, { Component } from 'react';
import CleverConfig from '../../../../../../config/CleverConfig';
import {CleverRequest,CleverLoading,ConfirmDialog,Modal,CleverForm,MComponentes, CleverInputSelect} from 'clever-component-library';
import ViewsAmenities from './ViewsAmenities';
import ContentIconsSVG from '../../../../components/SVG/ContentIconsSVG';

export default class CatalogueAmenities extends Component  {
    constructor(props) {
        super(props);
        this.clearGrids = this.clearGrids.bind(this);
        this.startAmenity = this.startAmenity.bind(this);        
        this.OnclickOptionTab = this.OnclickOptionTab.bind(this);
        this.getDataType = this.getDataType.bind(this);
        this.getDataGroup = this.getDataGroup.bind(this);
        this.getGridDisable = this.getGridDisable.bind(this);
        this.getGriEnable =  this.getGriEnable.bind(this);
        this.getGridAll = this.getGridAll.bind(this);
        this.getAmenityByID = this.getAmenityByID.bind(this);
        this.getLanguages = this.getLanguages.bind(this);
        this.functionRefAmenityOpenModal = this.functionRefAmenityOpenModal.bind(this);
        this.funcionRefDeleteAmenity = this.funcionRefDeleteAmenity.bind(this);
        this.optionsLang = this.optionsLang.bind(this);
        this.confirmDeleteAmenity = this.confirmDeleteAmenity.bind(this);
        this.getConfigAddButtonsModal = this.getConfigAddButtonsModal.bind(this);
        this.getListAttribByLang = this.getListAttribByLang.bind(this);
        this.changeOptionFrmByLang = this.changeOptionFrmByLang.bind(this);
        this.createFrmByLang = this.createFrmByLang.bind(this)
        this.saveAmenity = this.saveAmenity.bind(this);    
        this.getNameIcon = this.getNameIcon.bind(this);
        this.viewIcons = this.viewIcons.bind(this);
        this.getUrlIcons = this.getUrlIcons.bind(this);

        this.state = {           
            load : false,            
            dataGrids:[],
            listsGroup:[],
            listType:[],
            listsLang:[],
            listDataByLanguaje:[],
            isVisibleFrm : false,
            nameViewIcons : 'visibility',
            viewICONS:false,
            valuesHiddenTab:{isActive:['Activate','',''], 
                             isHidden:[false,true,true],
                             styleTabSelected:[{border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' }]
                            }
        }
    }

    componentDidMount() {
        this.props.refButtonAddAmenity.current.id ?
            document.getElementById(
                                    this.props.refButtonAddAmenity.current.id).addEventListener(
                                    "click", e => this.functionRefAmenityOpenModal(0)
                                    )
        : null;             
        this.startAmenity();          
    }  

    clearGrids(functionClear=()=>{}){
        this.setState({listAmenitieAll:null,
            listAmenitieEnable:null,
            listAmenitieDisable:null},functionClear); 
    }

    startAmenity(){
        this.setState({ load: true});
        this.getGridAll();
        this.getGriEnable();
        this.getGridDisable(()=>{            
            this.OnclickOptionTab(0);
            this.setState({ load: false});
        });
    }
    
    getGridAll(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity/get?all=1`, (response, error) => {
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
                        listAmenitieAll:dataTable
                    });
                }else{
                    this.setState({ load: false});
                }                               
            } else{
                this.setState({ load: false});
            }                      
        });                   

    }
    
    getGriEnable(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity/get`, (response, error) => {
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
                                    listAmenitieEnable:dataTable
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
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity/get?all=1`, (response, error) => {
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
                        listAmenitieDisable:dataTable
                    },functionGetData);
                }else{
                    this.setState({ load: false});
                }                                
            }else{
                this.setState({ load: false});
            }                
        });         
    }

    getAmenityByID (iddAmenity,functionByID=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity/search/${iddAmenity}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {   
                    let dataRequest={};  
                    let data = response.data[0];  
                    let listDataLang = [];
                    dataRequest.numberAmenity = data.iddef_amenity;
                    dataRequest.idGroup = String(data.iddef_amenity_group);
                    dataRequest.idType = String(data.iddef_amenity_type);                    
                    dataRequest.icon = data.html_icon;
                    // dataRequest.name = data.name;
                    // dataRequest.description = data.description;
                    
                    data.info_amenity_by_lang.map((infoByLang)=>{
                        let info =[]; 
                        let textUpper = infoByLang.lang_code.toUpperCase();                      
                        info.codeLang = `${textUpper}`;
                        info.description = infoByLang.description;
                        info.name = infoByLang.name;
                        info.idLangDescription = infoByLang.iddef_text_lang_description;
                        info.idLangName = infoByLang.iddef_text_lang_name;
                        dataRequest[info.codeLang+'_name']=infoByLang.name;
                        dataRequest[info.codeLang+'_description']=infoByLang.description;
                        listDataLang.push(info)
                    });
                    
                    dataRequest.infoAmenityByLang = listDataLang;
                    this.setState({ 
                        dataFrmAmenity:dataRequest
                    },functionByID);
                }else{
                    this.setState({ load: false});
                }                                
            }else{
                this.setState({ load: false});
            }              
        });  
    }

    getDataType(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-type/get`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let type = [];                
                response.data.map((data) => {                   
                    let infoInput = {};
                    infoInput.value = String(data.iddef_amenity_type);
                    infoInput.option = data.descripcion
                    type.push(infoInput);                                     
                });
                this.setState({ listType:type});
            }else{
                this.setState({ load: false});
            }  
        });
    }

    getDataGroup(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/amenity-group/get`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let group = [];                
                response.data.map((data) => {                   
                    let infoInput = {};
                    infoInput.value = String(data.iddef_amenity_group);
                    infoInput.option = data.name
                    group.push(infoInput);                                     
                });
                this.setState({ listsGroup:group});
            }else{
                this.setState({ load: false});
            }  
        });
    }

    getLanguages(functionLang=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/language/get`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let language = [];       
                response.data.map((data) => {                   
                    let infoInput = {};
                    let textUpper = data.lang_code.toUpperCase();  
                    infoInput.value = `${textUpper}`;
                    infoInput.option = data.description
                    language.push(infoInput);                                     
                });
                this.setState({ listsLang:language,load: false},functionLang);
            }else{
                this.setState({ load: false},functionLang);
            }  
        });
    }

    OnclickOptionTab(optionSelect){
        let valIsActivateTab = this.state.valuesHiddenTab.isActive;
        let valIsHiddenTab = this.state.valuesHiddenTab.isHidden;
        let valueStylesTabs = this.state.valuesHiddenTab.styleTabSelected;
        let newArrayActivate = [];
        let newArrayHidden = [];
        let newStyles = [];

        valIsActivateTab.map((activate,key)=>{
            let valActive = optionSelect == key ? 'Activate' : '';
            newArrayActivate.push(valActive)
        });
        valIsHiddenTab.map((hiddenTab,key)=>{
            let valIsHidden= optionSelect == key ? false: true;
            newArrayHidden.push(valIsHidden)
        });
        valueStylesTabs.map((stylesTabs,key)=>{
            let valStyles= optionSelect == key ? {border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' }:{border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' };
            newStyles.push(valStyles)
        });
        
        this.setState({valuesHiddenTab:{
                                        isActive:newArrayActivate,
                                        isHidden:newArrayHidden,
                                        styleTabSelected:newStyles
                                    }
                    });
    }

    funcionRefDeleteAmenity(e, data){  
        if(data !== undefined){
            let id = data.iddef_amenity;
            let requestAmenity = {};
            id !== undefined ? requestAmenity.estado = data.estado == 1 ? 0 : 1 : null;
            this.setState({ idAmenity:id, deleteAmenity: requestAmenity });
            this.refConfirmDeleteAmenity.getInstance().open();   
        }
    }

    confirmDeleteAmenity(){
        let idAmenity = this.state.idAmenity;
        let requestAmenity = this.state.deleteAmenity;

        idAmenity !== undefined && requestAmenity !==undefined ?
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity/update-status/${idAmenity}`, requestAmenity, (data, error) => {
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
                                this.clearGrids(()=>{this.startAmenity()});                                
                            } else {
                                notificationType = "error";
                                notificationMessage = data.Msg;
                            }
                
                                MComponentes.toast(notificationMessage);
                
                                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }else{
                    this.setState({ load: false});
                }   
            })        
        :null
    }

    getConfigAddButtonsModal(){
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.saveAmenity(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    functionRefAmenityOpenModal(iddAmenity){
        this.setState({load: true,dataFrmAmenity:null});
        this.getDataType();
        this.getDataGroup();
        this.getLanguages();
        
        if(iddAmenity !== 0){   
            this.getAmenityByID(iddAmenity,()=>{
                /*Se llena array de datos por idioma, dependiendo si se trae dicho dato en el request*/
                this.optionsLang(()=>{
                    this.createFrmByLang(()=>{
                        this.setState({isVisibleFrm:true, load: false}); 
                        this.refModalAddAmenity.getInstance().open();
                    });
                });
                
            })
        }else{
            this.setState({ dataFrmAmenity:null,options:[],listDataByLanguaje:[],isVisibleFrm:false,load: false}); 
            this.refModalAddAmenity.getInstance().open();
        } 
    }

    optionsLang(functionByLang=()=>{}){
        let listInfoByLang = this.state.dataFrmAmenity.infoAmenityByLang;
        let listValLang = this.state.listsLang;
        let defaultOptionLang = [];
        listInfoByLang.map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                dataRow.codeLang == lang.value?
                    defaultOptionLang.push(lang.value)
                :null;
            });                
        });
        this.setState({options:defaultOptionLang},functionByLang);
    }

    createFrmByLang(functionByLang=()=>{}){
        let listInfoByLang = this.state.options;
        let listValLang = this.state.listsLang;
        let arrayLang =[];
        
        listInfoByLang.sort().map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                let valLang = lang.value;
                if(dataRow.toUpperCase()  == valLang.toUpperCase() ){ 
                    row ={row:
                        [
                            {type:'component',
                                component:() =>{
                                    return(
                                        <div id={lang.value}>
                                            <label>{lang.option}:</label>
                                        </div>
                                        
                                        );
                                }
                            },
                            {type: 'text', size: 'col s6 m6 l6',name: lang.value+'_name', label: '* Name',placeholder:`Insert Name in ${lang.option}`, required: true,characters:true,alphanumeric:true},
                            {type: 'text', size: 'col s6 m6 l6',name: lang.value+'_description', label: '* Description', placeholder:`Insert Description in ${lang.option}`, required: true,characters:true,alphanumeric:true,onChange:e=>this.valueLengthText(e,lang.option)},                                                  
                        ]
                    }
                }else{
                    row={row:[]}
                }
            arrayLang.push(row);
            });                
        });
        this.setState({listDataByLanguaje:arrayLang},functionByLang);
    }

    valueLengthText(e, lang){
        let form = JSON.parse(JSON.stringify(this.state.dataFrmAmenity));
        let nameInput= e.name;
        let valueInput= e.value;
        let lengthDescrip= valueInput.length;
        
        if(lengthDescrip > 100){
            MComponentes.toast(`the maximum description size exceeded for the ${lang} language`);            
            let textMax = valueInput.substring(0,100);
            form[nameInput] = textMax;
            this.setState({ dataFrmAmenity: form });
        }
    }

    changeOptionFrmByLang(e){
        let langSelected = e.values; 
        this.state.dataFrmAmenity == undefined ? this.setState({dataFrmAmenity:{}}):null
        this.setState({options:langSelected},()=>{
            this.createFrmByLang(()=>{
                this.setState({isVisibleFrm:true});             
            });
        });
    }

    getListAttribByLang(listLangAct,dataFrmValue){
        let arrayOrigLang = this.state.dataFrmAmenity.infoAmenityByLang;
        let dataLang =[];
        let valuesBaja = [];
        let valuesAltaOnlyNew = [];
        let valuesAltaOnlyOrig = [];
        let arrayOrigFin = [];

        arrayOrigLang !== undefined ?
            arrayOrigLang.map((dataOrig)=>{
                arrayOrigFin.push(dataOrig.codeLang)
            })
        : null;
        
        //valores de estatus baja
        valuesBaja = arrayOrigFin.filter(x => !listLangAct.includes(x));
        //valores de alta
        valuesAltaOnlyOrig = listLangAct.filter(x => arrayOrigFin.includes(x));
        valuesAltaOnlyNew = listLangAct.filter(x => !arrayOrigFin.includes(x));

        //se arma el response de attributos por idioma de las bajas
        valuesBaja.map((valueLanB)=>{
            arrayOrigLang.map((dataOrig)=>{
                let nameByLang = {};
                let descriptionByLang = {};
                if(valueLanB == dataOrig.codeLang){
                    nameByLang.lang_code = valueLanB;
                    nameByLang.text = dataOrig.name;
                    nameByLang.attribute ='name'
                    nameByLang.estado = 0;
                    nameByLang.iddef_text_lang= dataOrig.idLangName;
    
                    descriptionByLang.lang_code = valueLanB;
                    descriptionByLang.text = dataOrig.description;
                    descriptionByLang.attribute ='description'
                    descriptionByLang.estado = 0;
                    descriptionByLang.iddef_text_lang= dataOrig.idLangDescription;
    
                    dataLang.push(nameByLang);
                    dataLang.push(descriptionByLang);
                }
            });
        });
        //se arma el response de las altas por idioma de los atributos
        valuesAltaOnlyOrig.map((dataByLang)=>{;
            arrayOrigLang.map((dataOrig)=>{
                let nameByLang = {};
                let descriptionByLang = {};
                if(dataByLang == dataOrig.codeLang){
                    nameByLang.lang_code = dataByLang;
                    nameByLang.text = dataFrmValue[dataByLang+'_name'];
                    nameByLang.attribute ='name'
                    nameByLang.estado = 1;
                    nameByLang.iddef_text_lang = dataOrig.idLangName;

                    descriptionByLang.lang_code = dataByLang;
                    descriptionByLang.text = dataFrmValue[dataByLang+'_description'];
                    descriptionByLang.attribute ='description'
                    descriptionByLang.estado = 1;
                    descriptionByLang.iddef_text_lang = dataOrig.idLangDescription;

                    dataLang.push(nameByLang);
                    dataLang.push(descriptionByLang);
                }
            });
        });

        valuesAltaOnlyNew.map((dataOnlyNew)=>{
            let nameByLang = {};
            let descriptionByLang = {};
            
            nameByLang.lang_code = dataOnlyNew;
            nameByLang.text = dataFrmValue[dataOnlyNew+'_name'];
            nameByLang.attribute ='name'
            nameByLang.estado = 1;
            nameByLang.iddef_text_lang = 0;

            descriptionByLang.lang_code = dataOnlyNew;
            descriptionByLang.text = dataFrmValue[dataOnlyNew+'_description'];
            descriptionByLang.attribute ='description'
            descriptionByLang.estado = 1;
            descriptionByLang.iddef_text_lang = 0;

            dataLang.push(nameByLang);
            dataLang.push(descriptionByLang);

        });

        return dataLang;
    }

    saveAmenity(){
        let listLangAct = this.state.options;
        listLangAct = listLangAct.sort();        
        
        if (listLangAct.length > 0){
            let requestAmenity = {};
            let dataFrm = this.refFormAmenity.getData();
            let dataFrmValue = dataFrm.values;        
            let idAmenity = dataFrmValue.numberAmenity !== "" ? dataFrmValue.numberAmenity : 0;

            if (dataFrm.required.count > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                
                let generalname = listLangAct.length >0 ? dataFrmValue[listLangAct[0]+'_name'] : '';
                let generalDesc = listLangAct.length >0 ? dataFrmValue[listLangAct[0]+'_description'] : '';
                
                requestAmenity.name = generalname;
                requestAmenity.description = generalDesc;
                requestAmenity.html_icon = dataFrmValue.icon;
                requestAmenity.iddef_amenity_group = dataFrmValue.idGroup !== '' ? parseInt(dataFrmValue.idGroup) : 0;
                requestAmenity.iddef_amenity_type = dataFrmValue.idType !== '' ? parseInt(dataFrmValue.idType) : 0;
                requestAmenity.estado = 1;
                requestAmenity.info_amenity_by_lang = this.getListAttribByLang(listLangAct,dataFrmValue);
                // console.log(idAmenity,' == ',JSON.stringify(requestAmenity));
                if (idAmenity == 0){
                    //Realiza POST
                    CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/amenity/create", requestAmenity, (data, error) => {
                        // console.log('post amenity/create');                    
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
                                this.refModalAddAmenity.getInstance().close();
                                this.clearGrids(()=>{this.startAmenity()}); 
    
                            } else {
                                // console.log('ERROR ==> ',data); 
                                // console.log('ERROR ==> ',data.Msg);                            
                                notificationType = "error";
                                notificationMessage = data.Msg;
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
                    CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/amenity/update/${idAmenity}`, requestAmenity, (data, error) => {
                        // console.log('put ==> ',idAmenity);
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
                                this.refModalAddAmenity.getInstance().close();
                                this.clearGrids(()=>{this.startAmenity()}); 
    
                            } else {
                                // console.log('ERROR ==> ',data); 
                                // console.log('ERROR ==> ',data.Msg);
                                notificationType = "error";
                                notificationMessage = data.Msg;
                            }
    
                            MComponentes.toast(notificationMessage);
    
                            this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                        }else{
                            this.setState({ load: false});
                        }   
                    });
                }
            }
            
        }else{
            MComponentes.toast("Add at least one name and description");
            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: "Add at least one name and description", notificationType: "error"});
        }

        
    }

    viewIcons(e){
        this.setState({viewICONS:false,load: true});
        let valueFRM = this.refFormAmenity.getData().values;
        let valueInputIcon = valueFRM.icon;
        this.getUrlIcons(()=>{
            this.setState({defaultIconSelected:valueInputIcon},()=>{
                // console.log('valueInputIcon ==> ',this.state.defaultIconSelected);
                this.refModal.getInstance().open();
                this.setState({nameViewIcons:'visibility_off',viewICONS:true,load: false});
            });
        });
    }

    getUrlIcons(functionURL=()=>{}){
        let idResort = 0;
        let requestIcons = {
            search: "Svg_icons",
            type: 3,
            idproperty: idResort
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/media-general-search", requestIcons, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    if(response.data.length > 0){
                        let dataMedia = response.data[0];
                        let valueURL = dataMedia.url;                    
                        this.setState({urlIcons:valueURL,load: false},functionURL); 
                    }else{
                        this.setState({urlIcons:'',load: false},functionURL); 
                    }
                } else {
                    this.setState({urlIcons:'',load: false},functionURL);                    
                }                
            }else{
                this.setState({urlIcons:'',load: false},functionURL); 
            }
        });
    }

    getNameIcon(idIcon){
        let dataFrmAmenity = this.state.dataFrmAmenity;

        if(idIcon !== ''){
            dataFrmAmenity['icon'] = idIcon;        
            this.setState({dataFrmAmenity:dataFrmAmenity}); 
            this.closeModal('');     
        }
          
    }

    closeModal(e){
        this.setState({nameViewIcons:'visibility',defaultIconSelected:null,urlIcons:null,viewICONS:false},()=>
        {this.refModal.getInstance().close();
        }
        );
    }
    
    render(){ 
        let {valuesHiddenTab,dataFrmAmenity,listAmenitieAll,listAmenitieEnable,listAmenitieDisable,
            load,listsLang,options,listDataByLanguaje,isVisibleFrm,nameViewIcons,
            defaultIconSelected,urlIcons,viewICONS} = this.state;
        return(
                <div>
                    <CleverLoading show={load}/> 
                    {listAmenitieAll &&
                        listAmenitieEnable &&
                        listAmenitieDisable ?
                            <div /*className='row'*/>
                                <ul id="tabs-swipe-demo" className="tabs" >
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(0)}>
                                        <a style={valuesHiddenTab.styleTabSelected[0]} href="#allAmenitie" className={valuesHiddenTab.isActive[0]} >ALL AMENITY</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(1)}>
                                        <a style={valuesHiddenTab.styleTabSelected[1]} href="#enableAmenitie" className={valuesHiddenTab.isActive[1]}>ENABLE AMENITY</a>
                                    </li>
                                    <li className="tab col s4" onClick={()=>this.OnclickOptionTab(2)}>
                                        <a style={valuesHiddenTab.styleTabSelected[2]} href="#desableAmenitie" className={valuesHiddenTab.isActive[2]}>DISABLE AMENITY</a>
                                    </li>
                                </ul>
                                <div id="allAmenitie" hidden={valuesHiddenTab.isHidden[0]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {listAmenitieAll} 
                                                        tipGrid = {'amenity'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteAmenity}
                                                        openModalAmenitie = {this.functionRefAmenityOpenModal}
                                                    />
                                </div>
                                <div id="enableAmenitie" hidden={valuesHiddenTab.isHidden[1]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {listAmenitieEnable} 
                                                        tipGrid = {'amenity'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteAmenity}
                                                        openModalAmenitie = {this.functionRefAmenityOpenModal}    
                                                    />
                                </div>
                                <div id="desableAmenitie"hidden={valuesHiddenTab.isHidden[2]}>
                                                    <ViewsAmenities 
                                                        dataGrid = {listAmenitieDisable} 
                                                        tipGrid = {'amenity'}
                                                        onDeleteAmenitie = {this.funcionRefDeleteAmenity}
                                                        openModalAmenitie = {this.functionRefAmenityOpenModal}
                                                    />
                                </div>
                                <ConfirmDialog
                                    onRef={confirm => this.refConfirmDeleteAmenity = confirm}
                                    yesButton={{ click: () => this.confirmDeleteAmenity() }}
                                />
                                <Modal
                                    addButtons={this.getConfigAddButtonsModal()}
                                    idModal="addAmenity"
                                    isFull={true}
                                    onRef={modal => this.refModalAddAmenity = modal} 
                                >
                                    <div className="row">
                                            <h5>{'AMENITY'}</h5>
                                            <CleverInputSelect
                                                id = {'optionsLanguages'}
                                                size = {'input-field col s12 m6 l6'}
                                                label = {'Languages'}
                                                name = {'tipsLanguages'}
                                                options = {listsLang}
                                                defaultValues={options}
                                                multiple={true}
                                                onChange = {this.changeOptionFrmByLang} 
                                                autocomplete = {true}                                           
                                            />
                                        
                                        {/* {ListFrmAmenity ?
                                            ListFrmAmenity                        
                                        :null}    */}
                                        {dataFrmAmenity && listDataByLanguaje && isVisibleFrm == true?
                                            <CleverForm    
                                                id={'form-amenityType'}
                                                data={dataFrmAmenity}
                                                ref={ref => this.refFormAmenity = ref}
                                                forms={[
                                                        {
                                                            inputs: [{row: [
                                                                            {type:'number',size:'col s16 m6 l6',name:'numberAmenity',label:'', hidden:true},                                                 
                                                                        ]},
                                                                    ].concat(
                                                                        listDataByLanguaje
                                                                    )
                                                                    .concat(
                                                                        [{row: [
                                                                            {type: 'select', size: 'col s4 m4 l4', name: 'idGroup', label: '* Group', placeholder:'Select Group',
                                                                                options: this.state.listsGroup,required: true, autocomplete:true},
                                                                            {type: 'select', size: 'col s4 m4 l4', name: 'idType', label: '* Type', placeholder:'Select Type',
                                                                                options: this.state.listType,required: true, autocomplete:true},    
                                                                            // {type: 'text', size: 'col s4 m4 l4',name: 'icon', label: 'Icon', required: true},                                              
                                                                            ]}
                                                                        ],
                                                                        ).concat(
                                                                            [{row: [
                                                                                {type: 'text', size: 'col s4 m4 l4',name: 'icon', label: '* Icon', placeholder:'Select Icon',
                                                                                    disabled:false,characters:true,alphanumeric:true},                                              
                                                                                {type: 'button', size: 'col s3 m3 l3', icon: nameViewIcons, onClick: (e) => this.viewIcons(e)  },   
                                                                            ]}
                                                                            ],
                                                                        )
                                                        },
                                                    ]}                                
                                            />                            
                                        :null}   
                                    </div>
                                </Modal>


                                <Modal                
                                    idModal = "viewIcons"
                                    name = "viewIcons"
                                    isFull={true}
                                    defaultButton={{click:e=> this.closeModal(e),buttonClass: "red", text:"CLOSE"}}
                                    onRef={modal => this.refModal = modal}
                                >
                                    {viewICONS == true? 
                                        <div className="row">
                                            <ContentIconsSVG 
                                                width = {'50px'}
                                                height = {'50px'}
                                                color = {'#11ae92'}
                                                colorIconSelect = {'#01536d'}
                                                urlFile = {urlIcons}
                                                onRef = {ref => this.referenceIcon = ref}
                                                size = {'col s2 m2 l2'}
                                                valueSelected = {defaultIconSelected}
                                                label={'Choose Icon'}
                                                onSaveIcon = {this.getNameIcon}
                                                viewBtnSave= {true}
                                                iconBtn={'check'}
                                            /> 
                                        </div>
                                    :null}
                                    
                                </Modal>
                            </div>                        
                    :null}       
                </div>      
        );

    }
}

CatalogueAmenities.defaultProps = {
    iddef_amenity: '',
}