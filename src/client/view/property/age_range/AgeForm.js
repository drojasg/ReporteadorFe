import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { CleverForm, CleverRequest, CleverLoading, MComponentes, ConfirmDialog} from 'clever-component-library';
import CleverConfig from "../../../../../config/CleverConfig";

export default class AgeForm extends Component {
    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");    
        this.refFormView = React.createRef();
        this.handlerSaveData = this.handlerSaveData.bind(this);
        this.disable= this.disable.bind(this);
        this.refFormView1 = React.createRef();
        this.refFormInputs = React.createRef();
        this.state = {
            propertySelected: JSON.parse(hotelSelected),
            dataRange: this.props.dataRange,
            dataLang: this.props.dataLang,

            formAgeRange:[],
            dataAgeRange:[],
            dataFormTexts:{},
            dataFormAgeRange:{},
            texts:[],
            dataListLang:[],
            load: true,
            datosForm:{
            },
            dataTexts:[]
        }
        this.arrayInputsText = new Array();
        this.arrayL = new Array();
    }
    
    componentDidMount() {
        let dataRange = this.state.dataRange;
        let dataLang = this.state.dataLang;
        this.readDataRange(dataRange, dataLang);
        
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.handlerSaveData)
           : null;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.dataRange !== this.props.dataRange || prevProps.dataLang !== this.props.dataLang) {

            this.setState({ dataRange: this.props.dataRange, dataLang: this.props.dataLang })
            this.setState({ load: true });
            let dataRange = this.props.dataRange;
            let dataLang = this.props.dataLang;
            this.readDataRange(dataRange, dataLang);
        }
    }

    getDataAgeRange = async (iddef_age_range) => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/age-range/search/${iddef_age_range}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    let itemResponse = Object(response.data[0]);
                    console.log('itemResponse: ', itemResponse);
                    
                    this.dataNewRange.push(itemResponse);
                }
            }
        });
    }


    readDataRange = async (dataRange, dataLang) => {
        console.log('dataRange INICIO: ', dataRange);
        console.log('dataLang INICIO: ', dataLang);
        let arrayInputs = [], dataForm = {}, idRepetido = 0, inputFrom = '', inputTo = '';
        this.idAgeRange = new Array();
        this.langCode = new Array();

        dataRange = dataRange.sort(function (a, b) {
            if (a.age_from < b.age_from) {
            return 1;
            }
            if (a.age_from > b.age_from) {
            return -1;
            }
            // a must be equal to b
            return 0;
        });

        dataLang.map((item, key) =>{
            this.langCode.push(item.language_code)
        })
        console.log('langCode: ', this.langCode);

        dataRange.map((item, key) =>{
            let disableInput = (item.disable_edit == 1)? true : false;
            this.idAgeRange.push(item.iddef_age_range);
            
            this.langCode.map((itemLang, key) => {
                // console.log('item.age_to: ', item.age_to);
                let code = item['text'+itemLang];
                let idAgeRange = item.iddef_age_range;

                dataForm['text_'+ idAgeRange+'_'+itemLang] = code;
                dataForm['age_from_'+ idAgeRange+'_'+itemLang] = item.age_from;
                dataForm['age_to_'+ idAgeRange+'_'+itemLang] = item.age_to;
                
                if (idAgeRange != idRepetido) {
                    inputFrom = { id: 'age_from_'+ idAgeRange+'_'+itemLang, type: 'number', size: 'col s12 m2 l2', label: 'age from',
                    name: 'age_from_'+ idAgeRange+'_'+itemLang, required: true, disabled:disableInput };                    
                    inputTo = { id: 'age_to_'+ idAgeRange+'_'+itemLang, type: 'number', size: 'col s12 m2 l2', label: 'age_to',
                        name: 'age_to_'+ idAgeRange+'_'+itemLang, required: true, disabled:disableInput };

                    arrayInputs.push(
                        {type:'component', component:() =>{
                            return(<div className='row'>
                                <div className='col s12 m2 l2'><h6>{code.toUpperCase()}</h6></div>
                                {/* <div className='col s12 m4 l4'>
                                    <button type="button" className="waves-effect waves-light btn btn-warning hollow" onClick={e => this.disable(e)} id={idAgeRange}>DISABLE</button>
                                </div> */}
                            </div>);
                        }},
                        { id: 'text_'+ idAgeRange+'_'+itemLang, type: 'text', size: 'col s12 m6 l6', label: 'Age-group name '+ itemLang,
                            name: 'text_'+ idAgeRange+'_'+itemLang, required: true, alphanumeric: true },
                        inputFrom,
                        {type:'component', component:() =>{
                            return(<div className='col s12 m1 l1 text-center'><h6> to </h6></div>);
                        }},
                        inputTo,
                    );
                }else{
                    arrayInputs.push(
                        { id: 'text_'+ idAgeRange+'_'+itemLang, type: 'text', size: 'col s12 m6 l6', label: 'Age-group name '+ itemLang,
                            name: 'text_'+ idAgeRange+'_'+itemLang, required: true, alphanumeric: true },
                        {type:'component', component:() =>{
                            return(<div className='row'> <div className='col s12 m6 l6'> </div>  </div>);
                        }},
                        {type:'component', component:() =>{
                            return(<div className='row'> <div className='col s12 m1 l1'></div>
                                <div className='col s12 m10 l10'> 
                                    <h4>&nbsp;</h4>
                                    <hr style={{ backgroundColor: "#018bb6", height: "1px" }}></hr>
                                </div>
                            <div className='col s12 m1 l1'></div> </div>);
                        }}
                    );
                }

                idRepetido = idAgeRange;
            })
        })

        this.setState({ InputList: arrayInputs, dataForm: dataForm, load: false }, this.props.reload(false));
    }

    handlerSaveData(){
        this.setState({ load: true });
        let dataAgeForm = this.dataAgeForm.getData();
        this.arrayDatos = new Array();
        // this.sendData = new Array();
        let { propertySelected } = this.state;
        console.log(dataAgeForm);
        console.log('idAgeRange: ', this.idAgeRange);

        this.idAgeRange.map((itemId, key) => {
            let preSendData = {}
            this.langCode.map((itemLang, key) => {
                let subData = {};
                Object.keys(dataAgeForm.values).map((item, key)=>{
                    preSendData.iddef_property = propertySelected.iddef_property;
                    let valueItem = (dataAgeForm.values[item] == "")? 0 : dataAgeForm.values[item];
                    (item == ['age_from_'+itemId+'_'+itemLang]) ? preSendData.age_from = valueItem : null;
                    (item == ['age_to_'+itemId+'_'+itemLang]) ? preSendData.age_to = valueItem : null;
                    (item == ['text_'+itemId+'_'+itemLang]) ? subData.lang_code = itemLang : null;
                    (item == ['text_'+itemId+'_'+itemLang]) ? subData.text = dataAgeForm.values[item] : null;
                })
                this.arrayDatos.push(subData)
            })
            preSendData.datos = this.arrayDatos;
            // console.log(itemId, preSendData);
            this.updateData(itemId, preSendData);
            // this.sendData.push(preSendData);
            this.arrayDatos = [];
        })

        this.setState({ load: false });
        // {"iddef_property":3,"age_from":"18","age_to":"100","datos":[{"lang_code":"EN","text":"ADULT"},{"lang_code":"ES","text":"ADULTOS"}]}
        // There is specified age range
    }

    updateData = async (id, sendData) => {
        console.log('sendData ==> ',JSON.stringify(sendData));
        CleverRequest.put(CleverConfig.getApiUrl('bengine')+`/api/age-range/update/${id}`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    // this.setState({ load: false });
                    MComponentes.toast('The data was saved');
                } else {
                    this.setState({ load: false });
                    MComponentes.toast(response.Msg);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast('Error');
            }
        });
    }

    disable(e){
        this.refConfirm.getInstance().open()
        this.setState({ idDelete: e.target.id })
    }

    deleteAgeRange(){
        this.setState({ loader: true })
        let requestAgeRange = {}
        let estado = Number(0);

        CleverRequest.put(CleverConfig.getApiUrl('bengine')+`/api/age-range/delete/${this.state.idDelete}/${estado}`,  requestAgeRange, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    this.setState({ load: false });
                    MComponentes.toast('The data was saved');
                    window.location = "/property/age_range";
                } else {
                    this.setState({ load: false });
                    MComponentes.toast(response.Msg);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast('Error');
            }
        });
    }

    render() {
        let InputList = this.state.InputList? this.state.InputList : [];

        return (
            <div className='row'>
                <CleverLoading show={this.state.load}/>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteAgeRange() }}
                />
                <div className='col s12 m12 l12'>
                    <CleverForm
                        id={'dataAgeForm'}
                        ref={ref => this.dataAgeForm = ref}
                        forms={[
                            { 
                                inputs:[{ row: InputList }],
                            }, 
                        ]}
                        data={this.state.dataForm}
                    />
                </div>
            </div>
        );
    }
}
