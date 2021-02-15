import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { DatePicker, CleverLoading, CleverButton, GridView, CleverForm, ConfirmDialog, CleverEditor, CleverMethodsApi, CleverInputCheckBox, MComponentes,Chip, Panel } from 'clever-component-library';
import Header from '../../../../components/header/Header';
import CleverConfig from "../../../../../../config/CleverConfig";
import Modal from '../../../../components/modal/Modal';

export default class ShowFormBase extends Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.hiddenInput = this.hiddenInput.bind(this);
        this.hiddenInputSeasonal = this.hiddenInputSeasonal.bind(this);
        this.addSeasonal = this.addSeasonal.bind(this);
        this.addRefundable = this.addRefundable.bind(this);
        this.editRefundable = this.editRefundable.bind(this);
        this.addEdit = this.addEdit.bind(this);
        this.removeItem = this.removeItem.bind(this);

        this.state = {
            hideForm: false,
            load: true,
            opCancellation: [],
            opPenalty: [],
            dataForms: {},
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            hotelSelected : hotelSelected ? true : false,
            dataEdit: (this.props.dataEdit != null) ? this.props.dataEdit : null,
        };
    }

    componentDidMount(){
        let { dataEdit } = this.state;
        this.setState({ dataForms: {}, addEditStatus: 'ADD' });
        this.getCancellation();
        this.getPenalty();
        (dataEdit != null)? this.getAllDetailPolice() : this.setState({ dataForms: {}, load: false }) ;
     }


    getCancellation(){
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy-cancellation-option/get',(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    let data = [];

                    response.data.map(option => {
                        data.push({ value: option.iddef_policy_cancellation_option, option: option.text });
                    });
                    
                    this.setState({ opCancellation: data });
                } else {
                    this.setState({ load: false });
                    console.error(error);
                }
            } else {
                this.setState({ load: false });
                console.error(error);
            }
        });
    }

    getPenalty(){
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy-cancellation-penalty/get',(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    let data = [];

                    response.data.map(option => {
                        data.push({ value: option.iddef_policy_cancellation_penalty, option: option.text });
                    });
                    
                    this.setState({ opPenalty: data, resPenalty: response.data });
                } else {
                    this.setState({ load: false });
                    console.error(error);
                }
            } else {
                this.setState({ load: false });
                console.error(error);
            }
        });
    }

    getAllDetailPolice(){
        let { dataEdit } = this.state;

        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+`/api/policies/search/${dataEdit.iddef_policy}`,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    let dataRes = response.data;
                    // let dataRes = response.data response[0].is_default == 1;
                    let dataResPenaltieBase = dataRes.policy_cancel_penalties.base.find(item => item.is_base == 1);
                    let dataResNoRefundable = dataRes.policy_cancel_penalties.no_refundable;
                    let dataResSeasonal = dataRes.policy_cancel_penalties.seasonal_exception;
                    let arrayRefundableTmp = [];
                    let arraySeasonalTmp = [];
                    let hiddenLabelStatus = (dataResPenaltieBase.is_refundable == 1) ? (dataResPenaltieBase.inside_penalty.type == 'price')?
                        true : false : false;

                    let data = {
                        editor_desc_en: dataResPenaltieBase.description_en,
                        editor_desc_es: dataResPenaltieBase.description_es, 
                        iddef_cancellation_window: (dataResPenaltieBase.is_refundable == 1)? dataResPenaltieBase.iddef_cancellation_window : '',
                        iddef_inside_penalty: (dataResPenaltieBase.is_refundable == 1)? dataResPenaltieBase.iddef_inside_penalty : '',
                        non_refundable: (dataResPenaltieBase.is_refundable != 1)? ["1"] : [],
                        amount_inside_penalty: (dataResPenaltieBase.is_refundable == 1)? (dataResPenaltieBase.inside_penalty.type == 'price')?
                            dataResPenaltieBase.amount_inside_penalty : undefined : undefined,
                        policy_code: dataRes.policy_code,
                    };

                    arrayRefundableTmp.push(<CleverButton size={'col s12 m6 l6'} label={'Add a non-refundable'} fullSize={true} onClick={this.addRefundable}/>, <h1>&nbsp;</h1>,);
                    dataResNoRefundable.map((item, key)=>{
                        arrayRefundableTmp.push(<div key={key}>
                            <div className="col s12 m8 l8">
                                <label>{item.start_date} - {item.end_date}</label>
                            </div>
                            <div className="col s12 m2 l2">
                                <a onClick={(e) => this.editRefundable('EDIT', item)} 
                                    title='Interface Opera'>
                                        <i className='material-icons left'>edit</i>
                                </a>
                            </div>
                            <div className="col s12 m2 l2">
                                {
                                item.estado == 1 ?
                                    <a onClick={(e) => this.removeItem(item, 0)} title='Disable'><i className='material-icons left'  >toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.removeItem(item, 1)} title='Enable'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                }
                            </div>
                        </div>)
                    });

                    arraySeasonalTmp.push(<CleverButton size={'col s12 m6 l6'} label={'Add a seasonal'} fullSize={true} onClick={this.addSeasonal}/>, <h1>&nbsp;</h1>,);
                    dataResSeasonal.map((item, key)=>{
                        arraySeasonalTmp.push(<div key={key}>
                            <div className="col s12 m8 l8">
                                <label>{item.start_date} - {item.end_date}</label>
                            </div>
                            <div className="col s12 m2 l2">
                                <a onClick={(e) => this.editSeasonal('EDIT', item)}
                                    title='Interface Opera'>
                                        <i className='material-icons left'>edit</i>
                                </a>
                            </div>
                            <div className="col s12 m2 l2">
                                {
                                item.estado == 1 ?
                                    <a onClick={(e) => this.removeItem(item, 0)} title='Disable'><i className='material-icons left'  >toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.removeItem(item, 1)} title='Enable'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                }
                            </div>
                        </div>)
                    });
                    this.setState({ hiddenLabel: hiddenLabelStatus, dataForms: data,
                        arrayRefundable: arrayRefundableTmp, arraySeasonal: arraySeasonalTmp,
                        addEditStatus: 'EDIT', IdPolicyCancel:  dataRes.iddef_policy, dataNoRefundable: dataResNoRefundable,
                        dataException: dataResSeasonal, idCancellationDetailUpdate: dataResPenaltieBase.iddef_policy_cancellation_detail});
                        this.refEditorEnCancellationPolicy.setContent(dataResPenaltieBase.description_en);
                        this.refEditorEsCancellationPolicy.setContent(dataResPenaltieBase.description_es);
                }
            } else {
                this.setState({ dataForms: {}, load: false });
                console.error(error);
            }
        });
        this.setState({ load: false });
    }

    removeItem(data, status){
        this.setState({ load: true });
        let Id = data.iddef_policy_cancellation_detail;
        
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+`/api/policy-cancellation/delete/${Id}/${status}`, {}, (response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getAllDetailPolice();
                    MComponentes.toast('Success edit');
                    this.modalAddRefundable.closeModal();
                    this.modalAddSeasonal.closeModal();
                } else{
                    MComponentes.toast('Error edit');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    addEdit(){
        this.setState({ load: true });
        let { addEditStatus, IdPolicyCancel, dataEdit } = this.state;
        let formPolicyBase = this.formFilters.getData();
        let EditorEnPolicy = this.refEditorEnCancellationPolicy.getContent();
        let EditorEsPolicy = this.refEditorEsCancellationPolicy.getContent();
        let formValues = formPolicyBase.values;

        if (addEditStatus == 'ADD') {
            //Hacemos el CREATE
            let dataCreate = {"iddef_policy": 1, "is_base": 1, "id_type_detail": 0, "policy_code": formValues.policy_code}
            let amount = (formValues.amount_inside_penalty == undefined)? 0.0 : formValues.amount_inside_penalty;
            if (formValues.non_refundable.length > 0) {
                dataCreate.is_refundable = 0, dataCreate.description_en = EditorEnPolicy,
                dataCreate.description_es = EditorEsPolicy,
                dataCreate.end_date = "1900-01-01", dataCreate.start_date = "1900-01-01"
            } else {          
                dataCreate.iddef_cancellation_window = formValues.iddef_cancellation_window, 
                dataCreate.iddef_inside_penalty = formValues.iddef_inside_penalty,
                dataCreate.amount_inside_penalty = amount, dataCreate.description_en = EditorEnPolicy,
                dataCreate.description_es = EditorEsPolicy,
                dataCreate.end_date = "1900-01-01", dataCreate.start_date = "1900-01-01"
            }
            
            this.CreateBaseCancellation(dataCreate);
        } else if (addEditStatus == 'EDIT') {
            //Hacemos el UPDATE
            let amount = (formPolicyBase.values.amount_inside_penalty == undefined)? 0.0 : formPolicyBase.values.amount_inside_penalty;

            let dataUpdate = (formPolicyBase.values.non_refundable.length > 0)? { "policy_code": formValues.policy_code, "iddef_policy": dataEdit.iddef_policy/*IdPolicyCancel*/,
                "is_base": 1, "is_refundable": 0,
                "iddef_cancellation_window": 0, "iddef_inside_penalty": 0, "id_type_detail": 0,
                "description_en": EditorEnPolicy, "description_es": EditorEsPolicy }
            :
                { "policy_code": formValues.policy_code, "iddef_policy": dataEdit.iddef_policy/*IdPolicyCancel*/, "is_base": 1, "is_refundable": 1, "id_type_detail": 0,
                "iddef_cancellation_window": formPolicyBase.values.iddef_cancellation_window, "amount_inside_penalty": amount,
                "iddef_inside_penalty": formPolicyBase.values.iddef_inside_penalty, "description_en": EditorEnPolicy, "description_es": EditorEsPolicy };
            
            this.EditBaseCancellation(dataUpdate, dataEdit.iddef_policy);
            // this.policyEditAPI(dataUpdate, dataEdit.iddef_policy/*IdPolicyCancel*/);
        }
    }

    CreateBaseCancellation(data){
        this.setState({ load: true });
        let sendData = {
            "iddef_policy_category": 1,
            "iddef_currency": 1,
            "policy_code": data.policy_code,
            "text_only_policy": 0,
            "option_selected": 0,
            "is_default": 0,
            "estado": 1,
            "available_dates": []
        };

        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_create", sendData,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    let dataCreate = {};
                    
                    Object.keys(data).map((i, k)=>{
                        (i != 'policy_code')? dataCreate[i] = data[i] : null;
                    });

                    dataCreate.iddef_policy = response.data.iddef_policy;
                    this.setState({ dataEdit: {iddef_policy: response.data.iddef_policy} })
                    this.policyCreateAPI(dataCreate);
                } else{
                    MComponentes.toast('Error create');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    EditBaseCancellation(data, IdPolicyCancel){
        let { idCancellationDetailUpdate } = this.state;
        this.setState({ load: true });
        let sendData = {
            "iddef_policy_category": 1,
            "iddef_currency": 1,
            "policy_code": data.policy_code,
            "text_only_policy": 0,
            "option_selected": 0,
            "is_default": 0,
            "estado": 1,
            "available_dates": []
        };
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+`/api/policies/single_update/${IdPolicyCancel}`, sendData,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    let dataUpdate = {};
                    
                    Object.keys(data).map((i, k)=>{
                        (i != 'policy_code')? dataUpdate[i] = data[i] : null;
                    });

                    this.policyEditAPI(dataUpdate, idCancellationDetailUpdate);
                } else{
                    MComponentes.toast('Error edit');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    addEditRefundable(status, dataItem) {
        this.setState({ load: true });
        let { IdPolicyCancel, arrayRefundable, dataNoRefundable, dataEdit } = this.state;
        let formRefundable = this.formRefundable.getData();
        let formValues = formRefundable.values;
        let EditorEnRefundable = this.refEditorEnRefundable.getContent();
        let EditorEsRefundable = this.refEditorEsRefundable.getContent();
        let validateRange = '';
        
        if (status == 'ADD') {
            let data = {
                "iddef_policy": IdPolicyCancel,
                "is_refundable": 0,
                "id_type_detail": 2,
                "end_date": formValues.To,
                "start_date": formValues.From,
                "description_en": EditorEnRefundable,
                "description_es": EditorEsRefundable
            };

            validateRange = this.validateRange(dataNoRefundable, data);
            (!validateRange) ? this.policyCreateAPI(data) : this.setState({ load: false });
        } else if (status == 'EDIT') {
            let data = {
                "is_refundable": 0,
                "id_type_detail": 2,
                "end_date": formValues.To,
                "start_date": formValues.From,
                "description_en": EditorEnRefundable,
                "description_es": EditorEsRefundable
            }

            validateRange = this.validateRange(dataNoRefundable, data, dataItem.iddef_policy_cancellation_detail);
            (!validateRange) ? this.policyEditAPI(data, dataItem.iddef_policy_cancellation_detail) : this.setState({ load: false });
        }
    }

    addEditSeasonal(status, dataItem) {
        this.setState({ load: true });
        let { IdPolicyCancel, arrayRefundable, dataException } = this.state;
        let formSeasonal = this.formSeasonal.getData();
        let formValues = formSeasonal.values;
        let EditorEnSeasonal = this.refEditorEnSeasonal.getContent();
        let EditorEsSeasonal = this.refEditorEsSeasonal.getContent();
        let validateRange = '';
        
        if (status == 'ADD') {
            let data = {iddef_policy: IdPolicyCancel, id_type_detail: 1}

            if (formValues.non_refundable.length > 0) {
                data.is_refundable = 0;
                data.start_date = formValues.From;
                data.end_date = formValues.To;
                data.description_en = EditorEnSeasonal;
                data.description_es = EditorEsSeasonal;
            } else {
                data.end_date = formValues.To;
                data.start_date = formValues.From;
                data.iddef_cancellation_window = formValues.iddef_cancellation_window;
                data.iddef_inside_penalty = formValues.iddef_inside_penalty;
                data.amount_inside_penalty = (formValues.amount_inside_penalty!=undefined)?formValues.amount_inside_penalty:0.0;
                data.description_en = EditorEnSeasonal;
                data.description_es = EditorEsSeasonal;
            }

            validateRange = this.validateRange(dataException, data);
            (!validateRange) ? this.policyCreateAPI(data) : this.setState({ load: false });
        } else if (status == 'EDIT') {
            let data = {id_type_detail: 1};
            if (formValues.non_refundable.length > 0) {
                data.is_refundable = 0;
                data.start_date = formValues.From;
                data.end_date = formValues.To;
                data.description_en = EditorEnSeasonal;
                data.description_es = EditorEsSeasonal;
            } else {
                data.end_date = formValues.To;
                data.start_date = formValues.From;
                data.iddef_cancellation_window = formValues.iddef_cancellation_window;
                data.iddef_inside_penalty = formValues.iddef_inside_penalty;
                data.amount_inside_penalty = (formValues.amount_inside_penalty!=undefined)?formValues.amount_inside_penalty:0.0;
                data.description_en = EditorEnSeasonal;
                data.description_es = EditorEsSeasonal;
            }

            validateRange = this.validateRange(dataException, data, dataItem.iddef_policy_cancellation_detail);
            (!validateRange) ? this.policyEditAPI(data, dataItem.iddef_policy_cancellation_detail) : this.setState({ load: false });
        }
    }

    policyCreateAPI(data){
        let { arrayRefundable } = this.state;

        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy-cancellation/create", data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    // (isBase == true)? response.data.iddef_policy_cancellation_detail
                    this.getAllDetailPolice();
                    MComponentes.toast(response.Msg);
                    this.modalAddRefundable.closeModal();
                    this.modalAddSeasonal.closeModal();
                } else{
                    MComponentes.toast('Error create');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    policyEditAPI(data, IdPolicyCancel){
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy-cancellation/update/"+IdPolicyCancel, data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getAllDetailPolice();
                    MComponentes.toast(response.Msg);
                    this.modalAddRefundable.closeModal();
                    this.modalAddSeasonal.closeModal();
                } else{
                    MComponentes.toast('Error edit');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    render() {
        let { hotelSelected,load,hiddenPrincipal, hiddenLabel, hiddenPrincipalSeasonal, hiddenLabelSeasonal, btnModalSeasonal, btnModalRefundable, arraySeasonal,
            arrayRefundable, opCancellation, opPenalty }= this.state;
        //if (!hotelSelected){ return <Redirect to="/"/> }

        return (
            <div className='row'>
                <CleverLoading show={load}/>
                <ConfirmDialog
                    onRef={confirm => this.refConfirmSendMail = confirm}
                    yesButton={{ load:true,click: () => this.sendConfirmationLetter() }}
                />
                <Header title={'Base Policies'} id={'headerBasePolice'} style={{display:"none"}} controls={[
                    { control: <div className="row">
                            <div className='col s12 m6 l6'>
                            <button type='button' onClick={(e) => this.props.onClose('close')} id="btnCloseGeneralInfo" className='btn'>CLOSE</button>
                        </div>
                        <div className='col s12 m6 l6'>
                            <button type='button' onClick={(e) => this.addEdit()} id="btnCloseGeneralInfo" className='btn'>Save</button>
                        </div>
                    </div> 
                }]}/>
                <h4>&nbsp;</h4>
                <CleverForm
                    ref={ref => this.formFilters = ref}
                    id={'form-filters'}
                    data={ this.state.dataForms }
                    forms={[
                        {
                            fieldset: false,
                            title: "",
                            inputs: [
                                {row:[
                                    {type:'text', size:'col s12 m4 l4', name:'policy_code', label:'* Policy name', placeholder:'Insert policy name'},
                                    {type:'checkbox', size:'col s12 m5 l5', label:'', name:'non_refundable', onChange:(data) => {this.setTextOnly(data)}, checkboxs:[{value:'1',label:'This is non-refundable'}]},
                                    // {type: 'button', label: 'Save Base Policies', onClick: this.addEdit},
                                ]},
                            ]
                        },
                        (hiddenPrincipal != true )? 
                        {
                            inputs: [
                                {row:[
                                    {type: 'select', size:'col s12 m4 l4', label:'Cancellation window', name:'iddef_cancellation_window', options: opCancellation },
                                ]},
                                {row:[
                                    {type: 'select', size:'col s12 m4 l4', onChange: this.hiddenInput, label:'Inside penalty', name:'iddef_inside_penalty', options: opPenalty },
                                    (hiddenLabel == true) ? 
                                        {type:'number',size:'col s12 m2 l2',name:'amount_inside_penalty',label:'Amount inside penalty', placeholder:'Insert Amount inside penalty'}
                                        : {type:'component', component: () => { return (<div></div>); }},
                                ]},
                            ]
                        } : { inputs: [] },
                        {
                            fieldset: false,
                            title: "",
                            inputs: [
                                {row:[
                                    {type: 'component',component:() => {
                                        return (
                                            <React.Fragment>
                                            <div className="row">
                                                <div className="col s12 m12 l6">
                                                    <p style={{"color":"#01536d"}}>{"*English Description"}</p>
                                                    <CleverEditor
                                                        name="editor_desc_en"
                                                        required={true}
                                                        onRef ={editor => this.refEditorEnCancellationPolicy = editor}
                                                        // buttons={[
                                                        //     'bold','italic','underline', 'strikethrough','|',
                                                        //     'undo','redo','|', 'eraser','|', 'ul', 'ol'
                                                        // ]}
                                                    />
                                                </div>
                                                <div className="col s12 m12 l6">
                                                    <p style={{"color":"#01536d"}}>{"*Spanish Description"}</p>
                                                    <CleverEditor
                                                        name="editor_desc_es"
                                                        required={true}
                                                        onRef ={editor => this.refEditorEsCancellationPolicy = editor}
                                                        // buttons={[
                                                        //     'bold','italic','underline', 'strikethrough','|',
                                                        //     'undo','redo','|', 'eraser','|','ul', 'ol'
                                                        // ]}
                                                    />
                                                </div>
                                            </div>
                                        </React.Fragment>
                                        );
                                    }}
                                ]},
                                {row:[
                                    {type: 'component',component:() => {
                                        return (
                                            <React.Fragment>
                                            <h3>&nbsp;</h3>
                                            
                                            <div className="row">
                                                <div className="col s12 m6 l6">
                                                    {arraySeasonal}
                                                </div>
                                                <div className="col s12 m6 l6">
                                                    {arrayRefundable}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                        );
                                    }}
                                ]},
                            ]
                        },
                    ]}
                />



                <Modal
                    id={"modalSeasonal"}
                    title={'Seasonal'}
                    ref={ref => this.modalAddSeasonal = ref}
                    btnAction={btnModalSeasonal}>
                        <CleverForm
                            ref={ref => this.formSeasonal = ref}
                            id={'form-seasonal'}
                            data={ this.state.dataSeasonal }
                            forms={[
                                {
                                    fieldset: true,
                                    title: "Seasonal Exception",
                                    inputs: [
                                        {row:[
                                            {type: 'date', colDate: "col s12 m4 l4 ", label: 'Start', name: 'From', placeholder:'From'},
                                            {type: 'date', colDate: "col s12 m4 l4 ", label: 'End', name: 'To', placeholder:'To'},
                                        ]},
                                    ]
                                },
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {row:[
                                            {type:'checkbox', size:'col s12 m6 l6', label:'', name:'non_refundable', onChange:(data) => {this.setTextOnlySeasonal(data)}, checkboxs:[{value:'1',label:'This is non-refundable'}]},
                                        ]},
                                    ]
                                },
                                (hiddenPrincipalSeasonal != true )? 
                                {
                                    inputs: [
                                        {row:[
                                            {type: 'select', size:'col s12 m4 l4', label:'Cancellation window', name:'iddef_cancellation_window', options: opCancellation },
                                        ]},
                                        {row:[
                                            {type: 'select', size:'col s12 m4 l4', onChange: this.hiddenInputSeasonal, label:'Inside penalty', name:'iddef_inside_penalty', options: opPenalty },
                                            (hiddenLabelSeasonal == true) ? 
                                                {type:'number',size:'col s12 m3 l3',name:'amount_inside_penalty',label:'Amount inside penalty', placeholder:'Insert Amount inside penalty'}
                                                : {type:'component', component: () => { return (<div></div>); }},
                                        ]},
                                    ]
                                } : { inputs: [] },
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {row:[
                                            {type: 'component',component:() => {
                                                return (
                                                    <React.Fragment>
                                                    <div className="row">
                                                        <div className="col s12 m12 l6">
                                                            <p style={{"color":"#01536d"}}>{"*English Description"}</p>
                                                            <CleverEditor
                                                                name="editor_desc_en"
                                                                required={true}
                                                                onRef ={editor => this.refEditorEnSeasonal = editor}
                                                                // buttons={[
                                                                //     'bold','italic','underline', 'strikethrough','|',
                                                                //     'undo','redo','|', 'eraser','|', 'ul', 'ol'
                                                                // ]}
                                                            />
                                                        </div>
                                                        <div className="col s12 m12 l6">
                                                            <p style={{"color":"#01536d"}}>{"*Spanish Description"}</p>
                                                            <CleverEditor
                                                                name="editor_desc_es"
                                                                required={true}
                                                                onRef ={editor => this.refEditorEsSeasonal = editor}
                                                                // buttons={[
                                                                //     'bold','italic','underline', 'strikethrough','|',
                                                                //     'undo','redo','|', 'eraser','|', 'ul', 'ol'
                                                                // ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                                );
                                            }}
                                        ]},
                                    ]
                                },
                            ]}
                        />
                </Modal>
                <Modal
                    id={"modalRefundable"}
                    title={'Refundable'}
                    ref={ref => this.modalAddRefundable = ref}
                    btnAction={btnModalRefundable}>
                        <CleverForm
                            ref={ref => this.formRefundable = ref}
                            id={'form-refundable'}
                            data={ this.state.dataRefundable }
                            forms={[
                                {
                                    fieldset: true,
                                    title: "Non-refundable dates",
                                    inputs: [
                                        {row:[
                                            {type: 'date', colDate: "col s12 m4 l4 ", label: 'Start', name: 'From', placeholder:'From'},
                                            {type: 'date', colDate: "col s12 m4 l4 ", label: 'End', name: 'To', placeholder:'To'},
                                        ]},
                                        {row:[
                                            {type: 'component',component:() => {
                                                return (
                                                    <React.Fragment>
                                                    <div className="row">
                                                        <div className="col s12 m12 l6">
                                                            <p style={{"color":"#01536d"}}>{"*English Description"}</p>
                                                            <CleverEditor
                                                                name="editor_desc_en"
                                                                required={true}
                                                                onRef ={editor => this.refEditorEnRefundable = editor}
                                                                // buttons={[
                                                                //     'bold','italic','underline', 'strikethrough','|',
                                                                //     'undo','redo','|', 'eraser','|', 'ul', 'ol'
                                                                // ]}
                                                            />
                                                        </div>
                                                        <div className="col s12 m12 l6">
                                                            <p style={{"color":"#01536d"}}>{"*Spanish Description"}</p>
                                                            <CleverEditor
                                                                name="editor_desc_es"
                                                                required={true}
                                                                onRef ={editor => this.refEditorEsRefundable = editor}
                                                                // buttons={[
                                                                //     'bold','italic','underline', 'strikethrough','|',
                                                                //     'undo','redo','|', 'eraser','|', 'ul', 'ol'
                                                                // ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                                );
                                            }}
                                        ]},
                                    ]
                                },
                            ]}
                        />
                </Modal>
            </div>
        );
    }

    setTextOnly(data) {
        let length = data.value.length;
        let hideForm = (length == 1 ? true : false);
        this.setState({ hiddenPrincipal: hideForm });
    }

    hiddenInput(e) {
        let { resPenalty } = this.state;
        let dataRef = this.formFilters.getData();
        dataRef.values.iddef_inside_penalty = String(e.value);
        
        const found = resPenalty.find(i => i['iddef_policy_cancellation_penalty'] == e.value);

        let hideForm = (found.type == 'price' ? true : false);
        this.setState({ hiddenLabel: hideForm, dataForms: dataRef.values });
    }

    addSeasonal(){
        let form = this.formSeasonal.getData().values;
        form.non_refundable = ['1'];
        form.editor_desc_en = '';
        form.editor_desc_es = '';
        form.From = '';
        form.To = '';
        form.iddef_cancellation_window = '';
        form.iddef_inside_penalty = '';
        this.refEditorEnSeasonal.setContent('');
        this.refEditorEsSeasonal.setContent('');
        
        this.setState({ dataSeasonal: form, hiddenLabelSeasonal: false });
        this.setState({ btnModalSeasonal: { label:"Create", icon:"edit", onClick:() => {this.addEditSeasonal('ADD')} } });
        this.modalAddSeasonal.openModal();
    }
    editSeasonal(status, data){
        Object.keys(data).map((i, k)=>{
            if (data[i] == null) {
                data[i] = undefined;
            }
        })
        let statusHidden = data.inside_penalty == undefined? false : data.inside_penalty.type == 'price'? true:false;
        
        let statusRefundable = data.is_refundable != 1? ['1']:[];
        let form = { "To": data.end_date, "From": data.start_date, non_refundable: statusRefundable,
            "iddef_cancellation_window": data.iddef_cancellation_window, "iddef_inside_penalty": data.iddef_inside_penalty,
            "amount_inside_penalty": data.amount_inside_penalty, "description_en": data.description_en, "description_es": data.description_es}

        this.refEditorEnSeasonal.setContent(data.description_en);
        this.refEditorEsSeasonal.setContent(data.description_es);
        
        this.setState({ dataSeasonal: form, hiddenLabelSeasonal: statusHidden });
        this.setState({
            btnModalSeasonal: { label:"Edit", icon:"edit", onClick:() => {this.addEditSeasonal(status, data)} }
        });
        this.modalAddSeasonal.openModal();
    }


    addRefundable(){
        let form = { "To": '', "From": '' }
        this.refEditorEnRefundable.setContent('');
        this.refEditorEsRefundable.setContent('');
        
        this.setState({ dataRefundable: form });
        this.setState({ btnModalRefundable: { label:"Create", icon:"edit", onClick:() => {this.addEditRefundable('ADD')} } });
        this.modalAddRefundable.openModal();
    }
    editRefundable(status, data){
        let form = {
            "To": data.end_date,
            "From": data.start_date,
        }
        this.refEditorEnRefundable.setContent(data.description_en);
        this.refEditorEsRefundable.setContent(data.description_es);
        
        this.setState({ dataRefundable: form });
        this.setState({ btnModalRefundable: { label:"Edit", icon:"edit", onClick:() => {this.addEditRefundable(status, data)} } });
        this.modalAddRefundable.openModal();
    }
    
    setTextOnlySeasonal(data) {
        let length = data.value.length;
        let hideForm = (length == 1 ? true : false);
        this.setState({ hiddenPrincipalSeasonal: hideForm });
    }

    hiddenInputSeasonal(e) {
        let { resPenalty } = this.state;
        let dataRef = this.formSeasonal.getData();
        dataRef.values.iddef_inside_penalty = String(e.value);
        
        const found = resPenalty.find(i => i['iddef_policy_cancellation_penalty'] == e.value);

        let hideForm = (found.type == 'price'? true : false);
        this.setState({ hiddenLabelSeasonal: hideForm, dataSeasonal: dataRef.values });
    }

    validateRange(dataPresent, newRange, idPolicyCancellation){
        /** VALIDACION PARA AGREGAR UN NUEVO RANGO DONDE NO COINCIDA CON OTROS EXISTENTES.
         * RNI  >= RI AND RNF  <= RF OR
         * RNI  <  RI AND RNI  >  RF OR
         * RNF  <  RI AND RNF  >  RF
         */
        let response = {error: false, msg: 'Validate success'};  

        

        dataPresent.map((item, key) => {
            if (item.iddef_policy_cancellation_detail != idPolicyCancellation) {
                if (newRange.start_date == item.start_date || newRange.start_date == item.end_date) {
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }else if (newRange.end_date == item.start_date || newRange.end_date == item.end_date) {
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }else if (newRange.end_date > item.start_date && newRange.start_date < item.end_date){
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }else if (newRange.start_date > item.start_date && newRange.start_date < item.end_date){
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }  
            }else{
                if (item.start_date == newRange.start_date && item.end_date == newRange.end_date) {
                    response.error = false;                        
                }else if (newRange.start_date > item.start_date && newRange.end_date < item.end_date) {
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }else if (newRange.start_date < item.start_date && newRange.end_date > item.end_date) {
                    response.msg = 'El rango coincide con un existente';
                    response.error = true;
                }
            }
        });

        if (response.error) {
            MComponentes.toast(response.msg);
        }

        return response.error;
    }
}
