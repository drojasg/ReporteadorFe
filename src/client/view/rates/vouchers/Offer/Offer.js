import React, { Component } from "react";
import CleverConfig from "./../../../../../../config/CleverConfig";
import {CleverLoading,CleverForm, CleverRequest, CleverEditor, MComponentes} from "clever-component-library";

export default class Offer extends Component {
    
    constructor(props) {
        super(props);
        this.startOffer = this.startOffer.bind(this);
        this.getCurrency = this.getCurrency.bind(this);
        this.getLanguajes = this.getLanguajes.bind(this);
        this.createEditors = this.createEditors.bind(this);
        this.handlerChangeOffer = this.handlerChangeOffer.bind(this);
        this.validacionesOffer = this.validacionesOffer.bind(this);
        this.getValuesEdit = this.getValuesEdit.bind(this);     

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : false, 
            discount: true, 
            type:true,
            editors:[],
            maximum_nights_option:true,
            listTypeCurrency:[],
            listType:[{value:'1',option:'per stay'},{value:'2',option:'per room'},{value:'3',option:'per night'},{value:'4',option:'percentage'}],
            listCurrency:[],
            isDisabledCurrency:false,
        }
    }

    componentDidMount(){      
        this.setState({
            load : true, 
            dataOffer: this.props.dataOffer
        },()=>{this.startOffer()});
    }

    startOffer(){
        this.getCurrency();  
        this.getLanguajes(()=>{
            // this.createEditors();
            this.createEditors(()=>{
                let {dataOffer}=this.state;
                if(dataOffer !== undefined){
                    // console.log(dataOffer);
                    let dataDescription = dataOffer.description !== undefined ? dataOffer.description : [];
                    let dataEditor = dataOffer[`editorByLang`] !== undefined ? dataOffer[`editorByLang`] :[]
                    //Se setea en el editor la informacion correspondiente
                    dataEditor.map((refByLang)=>{
                        // console.log(`refEditor${refByLang} ==> `,this[`refEditor${refByLang}`]);
                        //Se extrae en nombre del editor para conpararlo con la lista de descripcion del request
                        if(this[`refEditor${refByLang}`] !== undefined){
                            let langRef = this[`refEditor${refByLang}`].name;                        
                            dataDescription.map((description)=>{
                                let nameLang = description.lang_code; //codigo idioma q viene del request
                                let contenido = description.text; //texto que viene desde el request
                                if(nameLang === langRef){
                                    this[`refEditor${refByLang}`].setContent(contenido);
                                }
                            });
                        }
                    });
                    this.validacionesOffer('discount','INICIO');
                    this.validacionesOffer('currency','INICIO');
                    this.validacionesOffer('type','INICIO');
                    this.validacionesOffer('maximum_nights_option','INICIO');
                    this.setState({load:false});
                }
            });
        });
    }

    getCurrency(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/currency/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error){
                if (response.Error==false) {
                    let dataCurrency = response.data;

                    dataCurrency.map((currency) => {
                        let codeCurrency = String(currency.currency_code);

                        if (currency.estado == 1){
                            if(codeCurrency == 'USD' || codeCurrency == 'MXN'){
                                this.setState(prevState => ({
                                    listCurrency: [...prevState.listCurrency, {value: codeCurrency, option: codeCurrency}]
                                }))
                            }
                        }           
                    });
                }
            }     
        });
    }

    getLanguajes(functionByLang=()=>{}){
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
                this.setState({ listLang:language,load: false},functionByLang);
            }else{
                this.setState({ load: false},functionByLang);
            }  
        });      
    }

    createEditors(functionCreateEdit=()=>{}){
        let {listLang,dataOffer}= this.state;  
        let dataArrayLang = dataOffer['editorByLang'];
        let langsSelected = dataArrayLang !== undefined ? dataArrayLang.sort():[];
        let listLanguages = listLang !== undefined ?listLang : [];
        let arrayLang =[];
        let editorsByLang = [];   

        editorsByLang = listLanguages.filter(lang => langsSelected.includes(lang.value));
        editorsByLang.forEach((data)=>{
            // console.log('data ==> ', data);
            let editor =(<div className='col s12 m6 l6' key={data.value}>
                        <label><b>{data.option}</b></label>
                        <CleverEditor name={data.value} width='100%' height='100%'
                        onRef={edit => this[`refEditor${data.value}`]=edit}/>
                         
                    </div> 
                );
            arrayLang.push(editor);
        });
        this.setState({editors:arrayLang},functionCreateEdit);        
    }

    changeEditorsByLang(e){
        let langSelected = e.values; 
        this.state.editors == undefined ? this.setState({editors:{}}):null
        let dataOffer = this.state.dataOffer;
        let arrayDataEditor = [];
        /** Extrer el contenido actual de los editores, antes de agregar o eliminar alguno
         * de esta forma repintar dicha informacion
         */       
        //dataOffer[`editorByLang`].map((dataRefAct)=>{
        this.state.editors.map((dataRefAct)=>{
            let nameLang = dataRefAct.key;// extre el nombre del idioma del editor
            // console.log(nameLang);
            //Extrae la informacion actual de los editores
            let textContent = this[`refEditor${nameLang}`].getContent();
            // console.log(textContent);
            arrayDataEditor.push({lang:`${nameLang}`,text:textContent})
        });        
        //Agrega los idiomas seleccionados al estado del formulario
        dataOffer[`editorByLang`]=langSelected;
        //Actualiza el selected del formulario y procede a la creacion de los editores por idioma seleccionado
        this.setState({dataOffer:dataOffer},()=>{
            this.createEditors(()=>{
                /** Se asigna el valor correspondiente a los campos de texto de los editores antes de agregar o eliminar alguno
                 * de esta forma se asegura que no habra perdida de informacion de dichos campos
                 */
                dataOffer[`editorByLang`].map((refEditors)=>{
                    arrayDataEditor.map((contentEditorsBefore)=>{ 
                        /** Se recorre el arreglo de idiomas seleccionados actualente, comparando con la referencia de datos
                         * guardada anteriormente  para asignar dichos datos al editor correspondiente. */                      
                        if(refEditors == contentEditorsBefore.lang){
                            this[`refEditor${refEditors}`].setContent(contentEditorsBefore.text);
                        }
                    });                    
                });
            }); 
        });
        
    }

    handlerChangeOffer(e){
        let dataValues = this.refOffer.getData().values;         
        let name = e.name;
        let value = e.value;

        dataValues[name] = value;
        this.setState({dataOffer:dataValues},()=>{
            this.validacionesOffer(name,'');
        });
    }

    validacionesOffer(name,procedencia){
        let dataValues = procedencia == 'INICIO' ? this.state.dataOffer :this.refOffer.getData().values ;
        
        switch (name){
            case 'discount':
                    dataValues[name] == '1' 
                    ?
                        this.setState({discount: false})
                    :
                    (
                        dataValues['value']= '',
                        dataValues['currency']= '',
                        dataValues['type'] ='',
                        dataValues['maximum_nights_option'] = '',
                        dataValues['maximum_nights_value'] = '',
                        this.setState({dataOffer:dataValues,discount: true, 
                                        type:true,maximum_nights_option:true})
                    )
                break;

            case 'currency':
                    let listCurrency=[];
                    //Descripcion de moneda per stay, per room y per nigth
                    let variationCurrency = this.state.listType;                    
                    
                    if(dataValues[name] !== '0'){
                        listCurrency = [];                                    
                        variationCurrency.map((data)=>{                
                            let description = data.option;
                            description !== 'percentage' ? 
                                description = `${dataValues[name]} ${description}`                              
                            :null;
                            listCurrency.push({value: String(data.value), option:`${description}`})
                        });

                        this.setState({
                            listTypeCurrency:listCurrency,
                            dataOffer:dataValues
                        },()=>{
                            this.state.dataOffer['maximum_nights_option'] = '';
                            this.state.dataOffer['maximum_nights_value'] = '';   
                        });
                    }
        break;

            case 'type':
                    
                    dataValues[name] == '3' 
                    ? this.setState({type:false})
                    :this.setState({dataOffer:dataValues,type:true,maximum_nights_option: true,isDisabledCurrency:false});

                    if(dataValues[name] == '4'){
                        let currencyOrig = this.state.listType;
                        let optionAll = {value: String(0), option: 'ALL CURRENCIES'};
                        this.setState(prevState => ({
                            listCurrency: [...prevState.listCurrency, optionAll]
                        }));
                        dataValues['currency'] = "0";
                        this.setState({dataOffer:dataValues,listTypeCurrency:currencyOrig,isDisabledCurrency:true});
                    }else{
                        let array = this.state.listCurrency;
                        let index = array.findIndex(data => data['value'] === '0');
                        index !== -1 ? array.splice(index, 1) :null;
                        
                        this.setState({listCurrency:[]},()=>{
                            this.setState({listCurrency:array});
                            if( dataValues['currency'] == "0"){
                                dataValues['currency'] = "";
                                this.setState({dataOffer:dataValues});
                            }
                        });
                    }
                        
                break;
                
            case 'maximum_nights_option':
                    dataValues[name] == '1' 
                    ? 
                        this.setState({maximum_nights_option: false})
                    :
                    (
                        dataValues['maximum_nights_value'] = '',
                        this.setState({dataOffer:dataValues, maximum_nights_option: true  })
                    )
                        
                break;

            default:
                break;
        }
    }

    getValuesEdit(){
        let description = []; 
        //Extrae la informacion de los editores y si tienen informacion los agrega al arreglo de descripciones
        this.state.dataOffer[`editorByLang`] !== '' ?   
            this.state.dataOffer[`editorByLang`].map((refByLang,key)=>{
                // console.log(`refEditor${refByLang} ==> `,this[`refEditor${refByLang}`]);
                if(this[`refEditor${refByLang}`] !== undefined){
                    let dataDescription = {};
                    dataDescription.lang_code = this[`refEditor${refByLang}`].name;
                    dataDescription.text = this[`refEditor${refByLang}`].getContent();
                    description.push(dataDescription);
                } 
            })
        :null;
        return description;
    }

    render(){ 
        let {load,dataOffer,discount,type,maximum_nights_option,editors,listCurrency,listTypeCurrency,listLang,isDisabledCurrency} = this.state;
      
        return(                                                                          
            <div>
                <CleverLoading show={load}/>
                
                <CleverForm
                    id={'Offer'}
                    ref={ref => this.refOffer = ref}
                    data={dataOffer}
                    forms={[
                            { 
                            inputs:[
                                    {row:[
                                            {type:'select',size:'col s14 m4 l4', name:'discount',label:'* Discount type',
                                                placeholder:'Select Discount Type',autocomplete:true, required:true,
                                                options:[{value:'1',option:'Numerical discount'},{value:'2',option:'Text only'}],
                                                onChange:this.handlerChangeOffer
                                            },
                                            {type:'quantity',size:'col s14 m4 l4',name:'value',placeholder:'Insert Value Discount',
                                                label:discount == true ? 'Value': '* Value',
                                                hidden:discount,required:discount == true ? false :true},                                        
                                            {type:'select',size:'col s14 m4 l4',name:'type',placeholder:'Select Type Payment',
                                                label:discount == true ? 'Type':'* Type', autocomplete:true,
                                                hidden:discount,required:discount == true ? false :true,
                                                options:listTypeCurrency,onChange:this.handlerChangeOffer
                                            },
                                        ]
                                    },
                                    {row:[
                                            {type:'select',size:'col s14 m4 l4',name:'currency', placeholder:'Select Currency',
                                                label:discount == true ? 'Currency': '* Currency',
                                                autocomplete:true,hidden:discount,required:discount == true ? false :true,
                                                disabled:isDisabledCurrency,
                                                options:listCurrency,onChange:this.handlerChangeOffer
                                            },
                                            {type:'select',size:'col s14 m4 l4',name:'maximum_nights_option', placeholder:'Select Maximum Applied Nights',
                                                label:type == true ? 'Maximum applied nights': '* Maximum applied nights',
                                                options:[{value:'0',option:'None'},{value:'1',option:'Custom'}],
                                                onChange:this.handlerChangeOffer,autocomplete:true,
                                                hidden:type,required:type == true ? false :true,
                                            },
                                            {type:'number',size:'col s14 m4 l4',name:'maximum_nights_value',placeholder:'Insert No. Nights',
                                                label:maximum_nights_option == true ? 'Nights': '* Nights', hidden:maximum_nights_option,
                                                required:maximum_nights_option == true ? false :true,
                                            },
                                            {type:'select', size:'col s4, m4, l4', name:'editorByLang',label:'Editor By Lang', 
                                            placeholder:'Select Lang For Editors',options:listLang,
                                            multiple:true,onChange:e=>this.changeEditorsByLang(e),autocomplete:true }
                                        ]
                                    }
                                ],
                            }, 
                        ]}
                />
                <div className='col s12 m12 l12'>
                    {editors ? editors :null}
                </div>
                
            </div>            
        )
    }
}

Offer.defaultProps = {
    dataOffer: {}
}