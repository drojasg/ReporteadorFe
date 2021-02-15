import React, { Component } from 'react'
import CleverConfig from '../../../../../config/CleverConfig'
import {CleverForm, CleverInputSelect,CleverRequest, MComponentes } from 'clever-component-library'

export default class NewCountryForm extends Component {
    constructor(props) {
        super(props);

        this.changeOptionFrmByLang = this.changeOptionFrmByLang.bind(this);
        
        this.state = {
            dataNewCountryForm: {},
            listMarkets: [],
            listDataByLanguaje : [],
            optionsLang : []
        }
    }

    componentDidMount() {        
        this.setState({dataCountries: this.props.dataNewCountryForm},()=>{
            let dataLang = this.state.dataCountries.data_langs !== undefined ? this.state.dataCountries.data_langs : [];
            this.setState({dataLangIni:dataLang},()=>{                
                this.startPag();
            });
        });
        
    }

    startPag(){
        let dataCountry = this.state.dataCountries;    
        dataCountry[`data_langs`] = dataCountry.data_langs.filter(dataLang => dataLang.estado == 1);
        let countriesOn = this.state.dataCountries.data_langs;
        
        countriesOn.map((lang)=>{
            let data = this.state.dataCountries;
            data[`${lang.lang_code}_name`]=lang.text;
        });
        
        this.getMarkets();
        this.getLanguages(()=>{
            this.optionsLang(()=>{
                this.createFrmByLang();
            });
        });
    }

    getMarkets = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/market/get?all=1`, (response, error) => { 
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let markets = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        markets.push({value: data.iddef_market_segment, option:data.code});
                    }
                });
                this.setState({listMarkets: markets});
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

    optionsLang(functionByLang=()=>{}){
        let listInfoByLang = this.state.dataCountries.data_langs;
        let listValLang = this.state.listsLang;
        let defaultOptionLang = [];
        listInfoByLang.map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                dataRow.lang_code == lang.value?
                    defaultOptionLang.push(lang.value)
                :null;
            });                
        });
        this.setState({optionsLang:defaultOptionLang},functionByLang);
    }

    createFrmByLang(){
        let listInfoByLang = this.state.optionsLang;
        let listValLang = this.state.listsLang;
        let arrayLang =[];
        listInfoByLang.sort().map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                if(dataRow == lang.value){ 
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
                            {type: 'text', size: 'col s6 m6 l6',name: lang.value+'_name', label: 'Name', required: true},                                             
                        ]
                    }
                }else{
                    row={row:[]}
                }
            arrayLang.push(row);
            });                
        });
        this.setState({listDataByLanguaje:arrayLang});
    }

    changeOptionFrmByLang(e){
        let langSelected = e.values; 
        
        this.state.dataCountries == undefined ? this.setState({dataCountries:{}}):null;

        this.setState({optionsLang:langSelected},()=>{         
            this.createFrmByLang();
        });
    }

    getData() {
        let data = this.refFormCountry.getData();
        let dataFrmValue = data.values;
        
        let dataCountry = {};
        let informationCountry = {};

        if (data.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            informationCountry.isError = true;
        } 
        else {
            let dataLangs = [];
            let langIni = this.state.dataLangIni;
            let langAct = this.state.optionsLang;
            let arrayOrigFin = [];
            let valuesAltaOnlyOrig = [];
            let valuesAltaOnlyNew = [];
            let valuesBaja = [];

            dataCountry.name = dataFrmValue.name;
            dataCountry.country_code = dataFrmValue.country_code;
            dataCountry.alias = dataFrmValue.alias;
            dataCountry.idmarket_segment = parseInt(dataFrmValue.idmarket_segment);
            dataCountry.dialling_code = dataFrmValue.dialling_code;
            dataCountry.estado = 1;   

            langIni !== undefined ?
                langIni.map((dataOrig)=>{
                    arrayOrigFin.push(dataOrig.lang_code)
                })
            : null;
            //valores de estatus baja
            valuesBaja = arrayOrigFin.filter(x => !langAct.includes(x));
            // valores de alta
            valuesAltaOnlyOrig = langAct.filter(x => arrayOrigFin.includes(x));
            valuesAltaOnlyNew = langAct.filter(x => !arrayOrigFin.includes(x));

            //Se arma la seccion de lang del request
            valuesBaja.map((dataLang)=>{
                let valueLang = langIni.find(lang => lang.lang_code == dataLang);
                dataLangs.push({
                            iddef_text_lang: valueLang.iddef_text_lang,
                            lang_code: dataLang,
                            text: valueLang.text,
                            estado:0}
                );
            });

            valuesAltaOnlyOrig.map((dataLang)=>{
                let valueLang = langIni.find(lang => lang.lang_code == dataLang);
                dataLangs.push({
                            iddef_text_lang: valueLang.iddef_text_lang,
                            lang_code: dataLang,
                            text: dataFrmValue[`${dataLang}_name`],
                            estado:1}
                );
            });

            valuesAltaOnlyNew.map((dataLang)=>{
                dataLangs.push({
                            iddef_text_lang: 0,
                            lang_code: dataLang,
                            text: dataFrmValue[`${dataLang}_name`],
                            estado:1}
                );
            });

            dataCountry.data_langs = dataLangs;  
            
            informationCountry.iddef_country = dataFrmValue.iddef_country !== '' ? dataFrmValue.iddef_country :0;
            informationCountry.dataCountry = dataCountry;
            informationCountry.isError = false;
        }
        return informationCountry;
    }

    render() {
        let {listsLang,optionsLang,dataCountries,listDataByLanguaje,listMarkets}= this.state;
        return (
            dataCountries ? 
                <div className="row">                  
                    <CleverInputSelect
                        id = {'optionsLanguages'}
                        size = {'input-field col s12 m6 l6'}
                        label = {'Add Name by Languages'}
                        name = {'tipsLanguages'}
                        options = {listsLang}
                        defaultValues={optionsLang}
                        multiple={true}
                        onChange = {this.changeOptionFrmByLang}                                            
                    />                                                    
                    <CleverForm
                        id={'formModalCountry'}
                        ref={ref => this.refFormCountry = ref}
                        data={dataCountries}
                        forms={[
                            {
                                inputs:[
                                    {row: [
                                        {type: 'number', size:'col s6 m6 l3', name:'iddef_country', label:'', hidden: true},
                                        {type: 'select', size: 'col s6 m6 l3', name: 'idmarket_segment', label: 'Market', required: true, options: listMarkets},   
                                        {type: 'text', size: 'col s6 m6 l3', name: 'name', label: 'Name', required: true},                                            
                                    ]},
                                ].concat(
                                    listDataByLanguaje
                                ).concat(
                                    [
                                        {row: [
                                            {type: 'text', size: 'col s6 m6 l3', name: 'country_code', label: 'Country code', required: true},
                                            {type: 'text', size: 'col s6 m6 l3', name: 'alias', label: 'Alias', required: true},
                                            {type: 'text', size:'col s6 m6 l3', name:'dialling_code', label:'Dialling  Code', },                                  
                                        ]},
                                    ]
                                )
                            },
                        ]}
                    />                
                </div>
            :null
        )
    }
}
