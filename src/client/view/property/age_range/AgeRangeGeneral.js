import React, { Component } from 'react';
import AgeRange from './ageRange/AgeRange';
import {Panel, CleverRequest, CleverNotification, CleverLoading, Modal, CleverForm, MComponentes} from 'clever-component-library'
import CleverConfig from "./../../../../../config/CleverConfig";

export default class Main extends Component {  

    constructor(props){
        super(props);
        this.btnAddRange = React.createRef();
        const hotelSelected = localStorage.getItem("hotel");

        this.state ={
            propertySelected: JSON.parse(hotelSelected),
            hotelSelected : hotelSelected ? true : false,            
            value:1,
            load:false,
            viewAge:false,
        }
    }
    btnSaveGeneral = React.createRef();

    componentDidMount(){
       this.startViewAge();
    }

    startViewAge(){
        this.setState({viewAge:false, load: true }); 
        this.getCodesAgeRange(()=>{
            //Una vez obtenidos los datos se llama al metodo, para crear los formularios
            this.createFrmAgeRange();
        });
    }
    /** Metodo Para obtener los rage code age existentes */
    getCodesAgeRange(functionAnge =()=>{}) {        
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/age-range/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {       
                    this.setState({ dataRangeAgeCode : response.data,load:false},functionAnge);    
                }else{
                    this.setState({ dataRangeAgeCode : [],load:false},functionAnge);    
                    MComponentes.toast('Sin rangos configurados'); 
                } 
            }else{
                this.setState({ dataRangeAgeCode : [],load:false},functionAnge);
            }
        }); 
    }   

    createFrmAgeRange(){
        this.setState({ load: true });
        let {dataRangeAgeCode} = this.state;
        let arrayFrm = [];
        /** Recorre el state de range age y genera por cada uno una seccion con el formulario e informacion pertinente */
        dataRangeAgeCode.map((dataAge,key)=>{
            let dataFormProperties = {};
            let dataFormLang = [];
            let idAgeRageCode =  dataAge.iddef_age_code;
            let nameRef = `refAgeCode${idAgeRageCode}`
            let title=dataAge.code;

            dataFormProperties.iddef_age_code = dataAge.iddef_age_code;
            dataFormProperties.codeAge = dataAge.code;
            dataFormProperties.estado = dataAge.estado;
            dataFormProperties.disable_edit = dataAge.disable_edit;
            dataFormProperties.age_from = String(dataAge.age_from);
            dataFormProperties.age_to = String(dataAge.age_to);            
            dataFormProperties.appliedproperties = dataAge.appliedproperties;
            
            dataFormLang = dataAge.nameGroup;

            let frmAge = (<div key ={key} className='row' style={{ height: '500px' }} >
                    <div className='col s12 m2 l2'><h6>{title.toUpperCase()}</h6></div>
                    <AgeRange 
                        key ={key}
                        onRef={ref =>this[`${nameRef}`] = ref} 
                        idAgeRageCode={idAgeRageCode} 
                        dataFormLang={dataFormLang}
                        codeAge = {dataAge.code}
                        dataFormProperties = {dataFormProperties}
                    />
                    
            </div>)
            arrayFrm.push(frmAge)
        });
        this.setState({formsAgeRange:arrayFrm},()=>{this.setState({viewAge:true,load: false })})
    }

    saveDataAges(e){
        this.setState({ load: true });
        let {dataRangeAgeCode} = this.state;
        let validateRequieredFrm = [];
        let requestAgeRange = [];
        let rangeAges = [];
        dataRangeAgeCode !== undefined ? dataRangeAgeCode : [];

        dataRangeAgeCode.map((dataRangeAge)=>{
            let dataRequestAge = {};
            let requestLang = [];
            let idAgeRageCode =  dataRangeAge.iddef_age_code;
            let codeAge = dataRangeAge.code.toUpperCase();

            let detailLang = this[`refAgeCode${idAgeRageCode}`].refDataLang.getData();
            let detailAgeRange = this[`refAgeCode${idAgeRageCode}`].refDataRangeAge.getData();
            let detailLangRequired = detailLang.required.count;            
            let detailAgeRangeRequiered = detailAgeRange.required.count;
            let detailLangValue = detailLang.values;
            let detailAgeRangeValue = detailAgeRange.values;

            //Si existen inputs marcados como required sin llenar se agregan al array
            detailLangRequired > 0 
            ? validateRequieredFrm.push(codeAge)
            : detailAgeRangeRequiered >0 ? validateRequieredFrm.push(codeAge) :null;
            
            rangeAges.push({codeAge:codeAge,age_from:detailAgeRangeValue.age_from,age_to:detailAgeRangeValue.age_to});
            //Se arma request por cada id age code
            dataRequestAge.age_from = detailAgeRangeValue.age_from;
            dataRequestAge.disable_edit = /*dataRangeAge.disable_edit*/0;
            dataRequestAge.age_to = detailAgeRangeValue.age_to;
            dataRequestAge.code = dataRangeAge.code;
            dataRequestAge.estado = 1;
            dataRequestAge.iddef_age_code = idAgeRageCode;
            dataRequestAge.appliedproperties = dataRangeAge.code == 'adults'
            ? this[`refAgeCode${idAgeRageCode}`].getIdAllProperties() 
            : detailAgeRangeValue.appliedproperties !== "" ? detailAgeRangeValue.appliedproperties : [];

            //Se recorre los idiomas capturados actualmente para agregarse al request junto con la descripcion de cada uno.
            detailLangValue.optionsLanguages !== undefined ? 
                detailLangValue.optionsLanguages.map((dataLang)=>{
                    let data = {};
                    data.codeLang = dataLang;
                    data.text = detailLangValue[`text${dataLang}`];
                    requestLang.push(data);
                })
            :null;

            dataRequestAge.nameGroup = requestLang;
            requestAgeRange.push(dataRequestAge);
        });

        // console.log('rangeAges ==> ', rangeAges);
        //Verifica si todos los formuarios tienen los campos required llenos
        if( validateRequieredFrm.length > 0){
            MComponentes.toast(`Complete the data required for forms: ${validateRequieredFrm}`);
            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: `Complete the data required for forms: ${validateRequieredFrm}`, 
                notificationType: "error"});
            this.setState({ load: false });
        }else{
            //Una vez llenos los campos de los formularios, validar que no existan codigos ni rangos duplicados
            let validateRanges = [];

            rangeAges.forEach((dataRanges) => {
                let newRange = {};
                newRange.age_from = dataRanges.age_from;
                newRange.age_to = dataRanges.age_to;
                //Para excluir del array el valor actual
                let rangeCurrency = rangeAges.filter(data => data.codeAge !== dataRanges.codeAge);
                rangeCurrency = rangeCurrency.sort();
                let valueRanges = this.validateRange(rangeCurrency,newRange);

                valueRanges.error == true ? 
                    validateRanges.push(dataRanges.codeAge)
                :null;
                // console.log(`valueRanges ${dataRanges.codeAge}==> ` ,valueRanges);
            });
            
            if(validateRanges.length > 0) {
                MComponentes.toast(`There is specified age range in the forms: ${validateRanges}`);
                this.setState({ hiddeNotificationModal: false, 
                    notificationMessage: `There is specified age range in the forms: ${validateRanges}`, 
                    notificationType: "error"});
                this.setState({ load: false });
            }else{
                //Se han pasado todas las validaciones por tanto se realiza el update
                requestAgeRange.map((request)=>{
                    let idAgeCode = request.iddef_age_code;
                    // console.log('RequestVoucher ==> ',JSON.stringify(request));
                    CleverRequest.putJSON(CleverConfig.getApiUrl('bengine') +`/api/age-range/update/${idAgeCode}`, request, (response, error) => {
                        if (response.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
                            return
                        }
                        if (!error) {
                            let notificationType = "";
                            let notificationMessage = "";
                            
                            if (!response.Error) {
                                notificationType = "success";
                                notificationMessage = "The data was saved";  
                                this.startViewAge();                         
                            } else {
                                this.setState({ load: false }); 
                                notificationType = "error";
                                notificationMessage = "The data was no saved";
                            }
        
                            MComponentes.toast(notificationMessage);
        
                            this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                        }else{
                            this.setState({ load: false }); 
                        }
                    });
                });            
            }
            
        }
    }

    validateRange(rangeAge, newRange){
        /** VALIDACION PARA AGREGAR UN NUEVO RANGO DONDE NO COINCIDA CON OTROS EXISTENTES.
         * RNI  >= RI AND RNF  <= RF OR
         * RNI  <  RI AND RNI  >  RF OR
         * RNF  <  RI AND RNF  >  RF
         */
        let response = {error: false, msg: ''};  

        rangeAge.map((item, key) => {
            if (newRange.age_from == item.age_from || newRange.age_from == item.age_to) {
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_to == item.age_from || newRange.age_to == item.age_to) {
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_from > item.age_from && newRange.age_to < item.age_to) {
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_from > item.age_from && newRange.age_from < item.age_to) {
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_from < item.age_from && newRange.age_to > item.age_to) {
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_from < item.age_from && newRange.age_from > item.age_to){
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }else if (newRange.age_to < item.age_from && newRange.age_from > item.age_to){
                response.msg = 'El rango coincide con un existente';
                response.error = true;
            }
        });
        
        return response;
    }

    validateCode(dataRange, iddef_code){
        let response = {error: false, msg: ''};  
            
        dataRange.map((item, key) => {
            if (item.iddef_age_code == iddef_code) {
                response.error = true;    
                response.msg = 'El codigo ya fue utilizado';    
            }
        });

        if (response.error) {
            MComponentes.toast(response.msg);            
        }

        return response.error;
    }

    render() {
        let {load,formsAgeRange,viewAge} = this.state;
        return (
            // this.state.btnView && this.state.head && this.state.body && this.state.inputsAG ? 
            <Panel className='col s12 m12 l12' icon="" bold={true} capitalize={true} title="Age range">
            <CleverLoading show={load}/>
                <div className='row'>
                    {/* <div className='col s12 m6 l6'>
                        <button type="button" className="btn" onClick={this.newAddAgeRange}> ADD NEW</button>
                    </div> */}
                    <div className='col s12 m1 l1' style={{float:'right'}}>
                        <button type='button' id="btnSaveGeneral" className='btn' onClick={e => this.saveDataAges(e)}>SAVE</button>
                    </div>
                </div>

                {formsAgeRange /*&& viewAge == true*/?
                    formsAgeRange.map((frm,key) => {return (<div className='row' key={key} style={{border: 'outset'}}>{frm}</div>)})
                :null
                }
            </Panel>
        );
    }
}
