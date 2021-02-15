import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CleverForm, CleverRequest, CleverNotification, CleverLoading, MComponentes, CleverInputSelect} from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";

export default class AgeRange extends Component {
    constructor(props){
        super(props);
        this.props.onRef(this);
        const hotelSelected = localStorage.getItem("hotel");  
        this.changeOptionFrmByLang = this.changeOptionFrmByLang.bind(this);
        this.getPropeties = this.getPropeties.bind(this);
        this.getIdAllProperties = this.getIdAllProperties.bind(this);
        
        this.state = {
            propertySelected: JSON.parse(hotelSelected),
            formAgeRange:[],
            dataAgeRange:[],
            dataFormAgeRange:{},
            texts:[],
            dataListLang:[],
            load: false,
            datosForm:{
            },
            dataTexts:[],
            disableInput:true,
            visibleProperties:true,
        }
    }
    
    componentDidMount() {
        let {dataFormProperties,dataFormLang,codeAge} =  this.props; 
        this.getLanguages(()=>{this.setValueFrmsLang(dataFormLang);});        
        this.getPropeties(()=>{this.setValueFrmProperties(dataFormProperties,codeAge)})
        // codeAge !== '' ? codeAge !== 'adults'?
        //     this.getPropeties(()=>{this.setValueFrmProperties(dataFormProperties,true)})
        // : this.setValueFrmProperties(dataFormProperties,false):null;
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
                    infoInput.value = `${data.lang_code}`;
                    infoInput.option = data.description
                    language.push(infoInput);                                     
                }); 
                this.setState({ listsLang:language,load: false},functionLang);
            }else{
                this.setState({ load: false},functionLang);
            }  
        });
    }

    getPropeties(functionProperties=()=>{}) {
        this.setState({ loader: true })
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }

            if(!error){
                if (!response.Error) {
                    let data = response.data;
                    let dataProperties = [];
                    data.map((dataProperty)=>{
                        if(dataProperty.estado ==1){
                            let infoInput = {};
                            infoInput.value = `${dataProperty.iddef_property}`;
                            infoInput.option = dataProperty.short_name  
                            dataProperties.push(infoInput);
                        }
                    });
                    this.setState({ listsProperties: dataProperties,loader: false },functionProperties);
                }
                else {
                    MComponentes.toast("ERROR in propreties");
                    this.setState({ loader: false },functionProperties)
                }
            }else{
                this.setState({ loader: false },functionProperties)
            }
            
        });

    }

    setValueFrmsLang(dataFormLang){
        let dataInputsByLang = {};
        let langsSelected = [];

        dataFormLang.forEach(dataText => {
            langsSelected.push(dataText.codeLang);      
            dataInputsByLang[`text${dataText.codeLang}`] =  dataText.text;    
        });
        dataInputsByLang.optionsLanguages = langsSelected;
        this.setState({dataFormTexts:dataInputsByLang,listsLangSelected:langsSelected},()=>{
            this.createNamesByLang();
        })
    }

    setValueFrmProperties(dataFrmProperty,codeAge){
        let isDisable = (dataFrmProperty.disable_edit == 1)? true : false;
        let statusInput = false;
        codeAge !== '' ? codeAge !== 'adults'? statusInput = true : statusInput = false : null; 
        this.setState({dataFormAgeRange:dataFrmProperty,disableInput:isDisable,visibleProperties:statusInput})
    }

    changeOptionFrmByLang(e){
        let langSelected = e.values; 
        this.setState({listsLangSelected:langSelected},()=>{
            this.createNamesByLang();
        });
    }

    createNamesByLang(){
        let {listsLang,listsLangSelected}=this.state;
        let arrayInputsByLang = [];

        listsLangSelected.sort().map((codeLang)=>{
            let nameLang = listsLang.find(lang => lang.value == codeLang);
            nameLang = nameLang !== undefined ? nameLang.option  : '';
            arrayInputsByLang.push({ id: `text${codeLang}`,type: 'text', 
                                    size: 'col s12 m12 l12', 
                                    label: `* Age-group name ${nameLang}`,
                                    name: `text${codeLang}`,required: true, 
                                    characters:true,alphanumeric:true.option,
                                    placeholder:`Insert Age group name in ${nameLang}`
             })
        });

        this.setState({inputsName:arrayInputsByLang});
    }

    getIdAllProperties(){
        let {listsProperties} = this.state;
        let properties = [];
        listsProperties !== undefined ? listsProperties : [];

        listsProperties.map((property)=>{
            properties.push(property.value);
        });
        
        return properties;
    }

    render() {        
        let {listsLang,inputsName,listsProperties,dataFormTexts,dataFormAgeRange,disableInput,visibleProperties} = this.state;
        
        return (
            <CleverLoading show={this.state.load}/>,

            dataFormTexts && dataFormAgeRange?
            <div >  
                <div className='row'></div>                             
                <div className='col s12 m6 l6'>
                    <CleverForm
                        id={`formAgeRangeLang${this.props.idAgeRageCode}`}
                        ref={reference => this.refDataLang=reference}
                        data={dataFormTexts}
                        forms={[
                            {
                                inputs: [
                                    {row:[
                                        {type:'select',size:'col s12 m6 l6', name:'optionsLanguages',
                                            label:'* Languages', onChange:this.changeOptionFrmByLang,
                                            options:listsLang, required:true,autocomplete:true,
                                            placeholder:'Select languaje to name age group',multiple:true
                                        },   
                                    ]},
                                    inputsName?
                                    {row:inputsName
                                    }
                                    :{row:[]}
                                ]
                            },
                        ]}
                        
                    />
                </div>
                <div className='col s12 m6 l6' /*style={{borderLeft: 'outset'}}*/>
                    <CleverForm
                        id={`formAgeRangeProperty${this.props.idAgeRageCode}`}
                        ref={ref => this.refDataRangeAge = ref}
                        data={dataFormAgeRange}
                        forms={[
                            {
                                inputs: [
                                    {
                                        row: [
                                            {type: 'number', id: 'age_from' , size: 'col s12 m3 l3', label: '* Age from',
                                            name: 'age_from', required: true, disabled:disableInput, min:0, defaultValue:'age_from'},
                                            {type:'component', 
                                                component:() =>{
                                                    return(<div className='col s12 m1 l1 text-center'><h6> to </h6></div>);
                                                }
                                            },
                                            {type: 'number', id: 'age_to',  size: 'col s12 m3 l3', label: '* Age to',
                                            name: 'age_to', required: true, disabled:disableInput, min:0, defaultValue:'age_to'}  
                                        ]
                                    },
                                    visibleProperties == true ?
                                    {row:[
                                        {type:'select',size:'col s12 m12 l12', name:`appliedproperties`,
                                            label:'Applied Properties', 
                                            options:listsProperties, required:false,autocomplete:true,
                                            placeholder:'Select Properties',multiple:true
                                        },       
                                        
                                    ]}
                                    :
                                    {
                                        row: [
                                            {type:'component', 
                                                component:() =>{
                                                    return(<div className='col s12 m6 l6 text-center'><h6> Applied all properties </h6></div>);
                                                }
                                            },]
                                    },
                                ]
                            }
                        ]}
                    />                  
                </div>
            </div>
            :
            null
        );
    }
}

AgeRange.propTypes = {
    onRef: PropTypes.func,
    idAgeRageCode: PropTypes.number,
    dataFormLang:PropTypes.array,
    dataFormProperties:PropTypes.object,
    codeAge:PropTypes.string
}

AgeRange.defaultProps = {
    onRef: () => {},
    idAgeRageCode: 0,
    dataFormLang:[],
    dataFormProperties:{},
    codeAge: ''
}
