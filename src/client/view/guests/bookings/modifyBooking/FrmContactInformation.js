import React, { Component } from "react";
import PropTypes from 'prop-types';
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverRequest,MComponentes, CleverLoading,CleverForm} from "clever-component-library";
import FrmDates from '../FrmDates';
import moment from 'moment';

export default class FrmContactInformation extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        
        this.onChangeContact = this.onChangeContact.bind(this);
        this.state = {
            load : false,  
            countNights:0,
            viewCode:true
        }
    }

    componentDidMount(){
        // console.log('PROPS CONTACTS ==> ', this.props);
        this.setState({dataContactInfo: this.props.dataContactInfo,
                        valueBirthDate: this.props.valueBirthDate       
                    });
        this.getCountries();
    }

    getCountries(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/country/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let listCountries = [];  
                    let codePhone = [];
                    let listAct = response.data !== undefined ? response.data :[];
                    listAct = listAct.length > 0 ? listAct.filter(data => data.estado==1) : [];
                    listAct.map((data) => {   
                        listCountries.push({value:`${data.country_code}`,option:data.name});  
                        codePhone.push({value:`${data.dialling_code}`,option:`${data.name}(${data.dialling_code})`});  
                    });                  
                    this.setState({ countries:listCountries,listCodeLine:codePhone});                
                }else{
                    this.setState({ load: false});
                }
                
            }else{
                this.setState({ load: false});
            }
        });
    }

    onChangeContact(e,type){
        let contactData = this.state.dataContactInfo;
        switch(type){
            case 'textCode':
                    this.setState({viewCode:false});
                break;
            case 'selectCode':
                    contactData[`diallingCodeText`] = String(e.value);
                    this.setState({dataContactInfo:contactData},()=>{
                        this.setState({viewCode:true})
                    });
                break;
            default:
                break;
        }
    }

    getDataContactSave =() =>{
        let dataCustomer= {};
        let dataContact = this.refModifyContact.getData();
        let valDateBirth = moment(this.refBirthDate.getValueDates()).format("YYYY-MM-DD");
        let requiredContact = dataContact.required;
        let countRequired = requiredContact.count;

        if(valDateBirth == "Invalid date"){
            countRequired= countRequired+1;
            requiredContact.inputs.push({"label":"Birth date"});
        }
        if(countRequired > 0){
            MComponentes.toast("Complete the data required");
            requiredContact.inputs.map((dataError)=>{
                MComponentes.toast(`Add value of ${dataError.label} of CONTACT INFORMATION`);
                this.setState({ hiddeNotificationModal: false, notificationType: "error", 
                    notificationMessage: `Add value of ${dataError.label} of CONTACT INFORMATION`});            
            });
            dataCustomer.error= true;
            dataCustomer.data= {};
        }else{
            let valueContact = dataContact.values;
            // valueContact.diallingCodeText;
            dataCustomer.error= false;
            dataCustomer.address={
                "address":valueContact.address,
                "city":valueContact.city,
                "country_code":valueContact.country,
                "state":"",
                "street":"",
                "zip_code":valueContact.zip_code,
            }
            dataCustomer.birthdate= valueContact.frmBirthDate;
            dataCustomer.company= valueContact.company;
            dataCustomer.email= valueContact.email;
            dataCustomer.first_name= valueContact.first_name;
            dataCustomer.last_name= valueContact.last_name;
            dataCustomer.dialling_code= valueContact.diallingCodeText !== undefined ? valueContact.diallingCodeText: valueContact.dialling_code ;
            dataCustomer.phone_number= valueContact.phoneContact;
            dataCustomer.title= valueContact.title;   
        }

        return dataCustomer;
    }

    render(){  
        let {load,dataContactInfo,countries,listCodeLine,viewCode,valueBirthDate}= this.state;
        
        return(
            <div>
                <CleverLoading show={load}/> 
                {dataContactInfo && valueBirthDate ?
                    <CleverForm
                        ref={ref => this.refModifyContact = ref}
                        id={'contactModify'}
                        data={ dataContactInfo }
                        forms={[
                            {
                                inputs: [
                                    {row:[
                                        {type:'text',size:'col s12 m3 l3',name:'title',label:'Saludation',placeholder:'Insert Saludation',characters:true,alphanumeric:true,required:false},
                                    ]}, 
                                    {row:[
                                        {type:'text',size:'col s12 m6 l6',name:'first_name',label:'* First name', placeholder:'Insert First name',characters:true,alphanumeric:true,required:true},
                                        {type:'text',size:'col s12 m6 l6',name:'last_name',label:'* Last name', placeholder:'Insert Last name',characters:true,alphanumeric:true,required:true},
                                    ]}, 
                                    {row:[
                                        {type:'text',size:'col s12 m4 l4',name:'email',label:'* Email', placeholder:'Insert Email',characters:true,alphanumeric:true,required:true},
                                        {type: 'select',size: 'col s12 m4 l4',label: '* Country: ',name: 'country',placeholder:'Select Country',manual: true,options:countries,autocomplete:true, required: true},
                                        {type:'text',size:'col s12 m4 l4',name:'city',label:'* City',placeholder:'Insert City',characters:true,alphanumeric:true,required:true},                                   
                                    ]},
                                    {row:[                                   
                                        {type:'text',size:'col s12 m2 l2',name:'zip_code',label:'ZIP',placeholder:'Insert ZIP',characters:true,alphanumeric:true,required:false},
                                        viewCode == false 
                                        ?{type: 'select',size: 'col s12 m3 l3',label: '* Dialling Code ',name: 'dialling_code',
                                            placeholder:'Select Dialling Code',manual: true,options:listCodeLine,
                                            autocomplete:true, required: true,onChange:e=>this.onChangeContact(e,'selectCode')}
                                        :{type:'text',size:'col s12 m3 l3',name:'diallingCodeText',label:'* Dialling Code',placeholder:'Insert Dialling Code',characters:true,alphanumeric:true,required:true,
                                         onFocus:e=>this.onChangeContact(e,'textCode')},
                                        {type: 'phone',name:'phoneContact',
                                            sizeRegion : 'col s2 m2 l2',labelRegion: '* Region',region:false,
                                            sizeArea : 'col s2 m23 l2',labelArea: '* Area',area:false,
                                            sizeNumber: 'col s12 m3 l3',labelNumber: '* Number',
                                            sizeExtension : 'col s2 m2 l2',labelExtension: 'Extension',extension:false,
                                            required: true,
                                        },
                                        {type:'text',size:'col s12 m4 l4',name:'company',label:'company', 
                                            placeholder:'Insert Company',characters:true,alphanumeric:true,required: false},                                
                                    ]}, 
                                    {row:[
                                        {type: 'component', 
                                            component: () => {
                                                return (
                                                    <FrmDates 
                                                        nameDate = "* Birth date"
                                                        onRef = {ref => this.refBirthDate= ref}
                                                        idFrm ={"frmBirthDate"}
                                                        sizeContent="col s12 m4 l4"
                                                        dateValue={valueBirthDate}
                                                    />
                                                )
                                            }
                                        },                                        
                                    ]},
                                    {row:[
                                        {type:'text',size:'col s12 m12 l12',name:'address',label:'Address', 
                                            placeholder:'Insert Address',characters:true,alphanumeric:true,required: false},
                                    ]}, 
                                    
                                ]
                            }
                        ]}
                    />
                :null}                
            </div>
        );
    }
}

FrmContactInformation.propTypes = {
    onRef: PropTypes.func,
    dataContactInfo: PropTypes.object,
    valueBirthDate: PropTypes.string
}

FrmContactInformation.defaultProps = {
    onRef: () => {},
    dataContactInfo:{
        saludation:"",
        firstName:"",
        lastName:"",
        email:"",
        country:"",
        city:"",
        zip:"",
        diallingCode:"",
        diallingCodeText:"",
        phoneContact:"",
        address:"",
        address2:"",
    },
    valueBirthDate:""
}