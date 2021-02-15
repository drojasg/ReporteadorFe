import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { CleverForm, CleverRequest, CleverLoading, MComponentes,Modal } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import ContentIconsSVG from '../../../../components/SVG/ContentIconsSVG';

export default class Details extends Component {
    constructor(props){
        super(props);
        this.refReservation = React.createRef();
        this.inicializaPagDetail = this.inicializaPagDetail.bind(this);
        this.getPropertyData = this.getPropertyData.bind(this);
        this.getStatusList = this.getStatusList.bind(this);
        this.getUrlIcons = this.getUrlIcons.bind(this);
        this.getBrandList = this.getBrandList.bind(this);
        this.getPropertyTypeList = this.getPropertyTypeList.bind(this);
        this.getTimeZonesList = this.getTimeZonesList.bind(this);
        this.getLanguajeList = this.getLanguajeList.bind(this);
        this.getFiltersList = this.getFiltersList.bind(this);
        this.resetModal = this.resetModal.bind(this);
        this.saveData = this.saveData.bind(this);
        this.getNameIcon = this.getNameIcon.bind(this);
        this.viewIcons = this.viewIcons.bind(this);

        this.state = {
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
            load : false,
            propertyData: {},
            invalidForm: false,
            brandList: [],
            propertyTypeList: [],
            timeZonesList: [],
            statusList: [],
            hiddeNotificationModal: true,
            notificationType: "",
            notificationMessage: "",
            nameViewIcons : 'visibility',
            viewICONS:false
        }
    }
    
    
    componentDidMount() {
        let id_property = this.state.propertySelected.iddef_property;
        this.setState({load : true })
        //se relaciona el boton del colapse con el evento
        this.props.reference.current.id ?
        document.getElementById(this.props.reference.current.id).addEventListener("click", this.saveData)
        : null;
        
        this.inicializaPagDetail();
    }

    inicializaPagDetail(){ 
        this.getBrandList();
        this.getPropertyTypeList();
        this.getTimeZonesList();
        this.getStatusList();
        this.getLanguajeList();
        this.getFiltersList();
        this.getPropertyData(()=>{
            this.setState({ load: false });
        });
    }

    getUrlIcons(functionURL=()=>{}){
        let idResort = 0;//this.state.propertySelected.iddef_property;
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
                    // console.log('response ==> ',response);
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

    resetModal() {
        this.setState({hiddeNotificationModal: true});
    }
    
    saveData() {
        let dataForm =  this.refFormView.getData();
        let dataSave = dataForm.values;
        if (dataForm.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});

        } else {
            const property_id = this.state.propertySelected.iddef_property;
            this.setState({ load: true});
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/property/update/${property_id}`, dataSave, (data, error) => {
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
                        this.inicializaPagDetail();

                    } else {
                        notificationType = "error";
                        notificationMessage = "The data was no saved";
                        this.setState({ load: false });
                    }

                    MComponentes.toast(notificationMessage);
                    
                    this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }
                else{
                    this.setState({ load: false });
                }
            });
        }
    }

    getBrandList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/brand/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({"value": String(item.iddef_brand), "option": item.name});
                    });
                    this.setState({brandList: response});
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }
    
    getPropertyTypeList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/property-type/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({ "value": String(item.iddef_property_type), "option": item.description });
                    });
                    this.setState({ propertyTypeList: response });
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getTimeZonesList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/time-zone/get?all", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({ "value": String(item.iddef_time_zone), "option": item.code });
                    });
                    this.setState({ timeZonesList: response });
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getCurrencyList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/currency/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({ "value": String(item.currency_code), "option": item.currency_code });
                    });
                    this.setState({ currencyList: response });
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getLanguajeList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/language/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({ "value": String(item.iddef_language), "option": item.lang_code });
                    });
                    this.setState({ langList: response });
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getFiltersList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/filters/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let response = [];
                    data.data.map((item, index) => {
                        response.push({ "value": String(item.iddef_filters), "option": item.name });
                    });
                    this.setState({ filtersList: response });
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getStatusList() {
        this.setState({
            statusList: [
                { value: "1", option: "Open" },
                { value: "0", option: "Close" }
            ]});
    }
    
    getPropertyData(functionData=()=>{}){
        const property_id = this.state.propertySelected.iddef_property;                    
        
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/property/search/${property_id}`, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let listFilter=[];
                    let listLang=[];
                    let propertyData = data.data;

                    propertyData.property_lang.map((data)=>{
                        listLang.push(String(data));
                    });

                    propertyData.filters.map((data)=>{
                        listFilter.push(String(data));
                    });

                    propertyData.property_lang = listLang;
                    propertyData.filters = listFilter;     
                    propertyData.iddef_brand = String(propertyData.iddef_brand);  
                    propertyData.iddef_property_type = String(propertyData.iddef_property_type);      
                    propertyData.estado = String(propertyData.estado);
                    propertyData.push_property = String(propertyData.push_property);
                    propertyData.iddef_time_zone = String(propertyData.iddef_time_zone);
                    
                    this.setState({propertyData: propertyData, load: false,},functionData);
                }else {
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    viewIcons(e){
        this.setState({viewICONS:false,load: true});
        let valueFRM = this.refFormView.getData().values;
        let valueInputIcon = valueFRM.icon_logo_name;

        this.getUrlIcons(()=>{
            this.setState({defaultIconSelected:valueInputIcon},()=>{
                this.refModal.getInstance().open();
                this.setState({nameViewIcons:'visibility_off',viewICONS:true,load:false});
            });
        });
    }

    getNameIcon(idIcon){
        let property = this.state.propertyData;

        if(idIcon !== ''){
            property['icon_logo_name'] = idIcon;        
            this.setState({propertyData:property}); 
            this.closeModal('');     
        }
          
    }

    closeModal(e){
        this.setState({nameViewIcons:'visibility',defaultIconSelected:null,urlIcons:null,viewICONS:false},()=>
        {this.refModal.getInstance().close();
        }
        );
    }

    render() {
        let { 
            brandList,
            propertyTypeList,
            timeZonesList,
            statusList,
            propertyData,
            propertySelected,
            langList,
            filtersList,
            nameViewIcons,
            defaultIconSelected,
            urlIcons,
            viewICONS
        } = this.state;
        if (!propertySelected) {
            return <Redirect to="/" />
        }

        const username = localStorage.username;
        const notificationModal = null//<CleverNotification icon={notificationType} body={notificationMessage} hidden={hiddeNotificationModal} onClickDone={this.resetModal} />;
        return (
            <div className="row">
                <CleverLoading show={this.state.load}/>
                {notificationModal}
                <CleverForm 
                    id={'form-property'}
                    ref={ref => this.refFormView = ref}
                    data={propertyData}
                    forms={[
                        {
                            inputs: [
                                {row:[
                                    {type: 'text', size: 'col s12 m3 l3', placeholder:'Insert Property name',label: '* Property name',name: 'trade_name',uppercase: false,alphanumeric:true, characters:true,required: true,},
                                    {type: 'text', size: 'col s12 m3 l3',placeholder:'Insert Short name', label: '* Short name',name: 'short_name',required: true,uppercase: false,alphanumeric:true, characters:true},
                                    {type: 'text', size: 'col s12 m3 l3',placeholder:'Insert Code', label: '* Code',name: 'property_code', required: true,uppercase: false,alphanumeric:true, characters:true},
                                    {type: 'text', size: 'col s12 m3 l3',placeholder:'Insert Web address', label: '* Web address',name: 'web_address', required: true,uppercase: false,alphanumeric:true, characters:true},
                                ]}, 
                                {row:[ 
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Time zone', label: '* Time zone', name: 'iddef_time_zone', required: true, uppercase: false, options: timeZonesList },
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Property Lang', label: '* Property Lang', name: 'property_lang', multiple: true, options: langList, required: true},
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Brand', label: '* Brand', name: 'iddef_brand', manual: true, options: brandList, required: true, uppercase: false },
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Property type', label: '* Property type', name: 'iddef_property_type', manual: true, options: propertyTypeList, required: true, uppercase: false },
                                ]},
                                {row:[ 
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Status', label: '* Status', name: 'estado', options: statusList, required: true, uppercase: false },
                                    { type: 'select', size: 'col s12 m3 l3', placeholder:'Select Filters', label: '* Filters', name: 'filters',multiple: true, options: filtersList, required: true},
                                    {type: 'text', size: 'col s12 m3 l3',placeholder:'Insert Icon Name', label: '* Icon Name',name: 'icon_logo_name',required: true,uppercase: false,alphanumeric:true, characters:true},
                                    {type: 'button', size: 'col s3 m3 l3', icon: nameViewIcons, onClick: (e) => this.viewIcons(e)  },   
                                ]},
                            ]
                        }
                    ]}
                />

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
        );
    }
}
