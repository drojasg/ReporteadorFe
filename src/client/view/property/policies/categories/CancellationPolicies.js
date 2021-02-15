import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { DatePicker, CleverLoading, CleverButton, GridView, CleverForm, ConfirmDialog, CleverEditor, CleverMethodsApi, CleverInputCheckBox, MComponentes,Chip } from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";
import Modal from '../../../../components/modal/Modal';

export default class CancellationPolicies extends Component {
    constructor(props) {
        super(props)
        this.createCancellationPolicy = this.createCancellationPolicy.bind(this);
        this.editCancellationPolicy = this.editCancellationPolicy.bind(this);
        this.detailsCancellationPolicy = this.detailsCancellationPolicy.bind(this);
        this.createPenaltyDefinition = this.createPenaltyDefinition.bind(this);

        this.state = {
            showLoading:false,
            hideForm:false,
            hideButtonAdd:true,
            disableDelete:true,
            dataFormPolicy:{},
            dataFormCancelPenalties:{},
            dataFormCancelFees:{},
            policy_cancel_penalties_list:[],
            hiddenInput: this.hiddenInput.bind(this)
        };
    }

    componentDidMount()
    {
        this.getDataPoliciesByCategory();
        this.getDataOptionsByCategory();
    }

    getDataOptionsByCategory()
    {
        this.setState({
            optionsCategory:[]
        });
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_categories/search/1',(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                let data = [];
                let data_options = response.data.options.options;
                Object.keys(data_options).map(option => {
                    data.push({value:option,label:data_options[option]});
                });
                this.setState({
                    optionsCategory:data
                });
            } else {
                console.error(error);
            }
        });
    }

    getDataPoliciesByCategory()
    {
        this.setState({
            showLoading:true
        });
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/get/1', (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    let data = response.data;
                    this.refTableCancellationPolicies.setDataProvider(data);
                    this.setState({
                        showLoading:false
                    });
                } else {
                    console.log("Empty data");
                    this.refTableCancellationPolicies.setDataProvider([]);
                    this.setState({
                        showLoading:false
                    });
                }
            }
            else {
                console.error(error);
                this.setState({
                    showLoading:false
                });
            }
        });
    }

    createCancellationPolicy()
    {
        this.refEditorEnCancellationPolicy.setContent("");
        this.refEditorEsCancellationPolicy.setContent("");
        this.cleanValueChipAvailableDates();
        this.setState({
            titleModal:'Create Policy',
            hideTitleHead:true,
            hideTitleInput:false,
            hideButtonAdd:true,
            disableDelete:true,
            dataFormPolicy:{
                iddef_policy_category:'1',
                policy_category:'CANCELLATION POLICIES',
                iddef_currency:'1',
                iddef_policy:'0',
                policy_code:'',
                text_only_policy:[],
                option_selected:'1',
                available_dates:[]
            },
            dataFormCancelPenalties:{
                penalty_name:'',
                days_prior_to_arrival_deadline:'',
                time_date_deadline:''
            },
            dataFormCancelFees:{
                iddef_policy_rule:[],
                fixed_amount:'0',
                iddef_currency:'1',
                percent:'0',
                option_percent:'0',
                number_nights_percent:'0'
            },
            policy_cancel_penalties_list:[],
            btnAction:{
                label:"save",
                icon:"save",
                onClick:() => {this.saveCancellationPolicy()}
            }
        });
        this.refEditorEnCancellationPolicy.setContent("");
        this.refEditorEsCancellationPolicy.setContent("");
        this.refModalCancellationPolicy.openModal();
    }

    createPenaltyDefinition()
    {
        let policy = this.refFormCancellationPolicy.getData();
        this.setState({
            dataFormPolicy:policy.values,
            dataFormCancelPenalties:{
                iddef_policy:String(policy.values.iddef_policy),
                penalty_name:'',
                days_prior_to_arrival_deadline:'',
                time_date_deadline:''
            },
            dataFormCancelFees:{
                iddef_policy_rule:[],
                fixed_amount:'0',
                iddef_currency:String(policy.values.iddef_currency),
                percent:'0',
                option_percent:'0',
                number_nights_percent:'0'
            },
            btnAction:{
                label:"save",
                icon:"save",
                onClick:() => {this.saveCancellationPenalty()}
            }
        });
        this.refEditorEnCancellationPolicy.setContent("");
        this.refEditorEsCancellationPolicy.setContent("");
    }

    detailsCancellationPolicy(iddef_policy)
    {
        this.setState({
            titleModal:'Details Policy',
            disableDelete:true,
            disabledInput:false,
            hideTitleHead:false,
            hideTitleInput:true,
            hideButtonAdd:true,
            btnAction:{}
        });
        this.buildingDataForm(iddef_policy);
        this.refModalCancellationPolicy.openModal();
    }

    editCancellationPolicy(iddef_policy)
    {
        this.setState({
            titleModal:'Update Policy',
            hideButtonAdd:false,
            disableDelete:false,
            disabledInput:false,
            hideTitleHead:true,
            hideTitleInput:false,
            btnAction:{
                label:"update",
                icon:"edit",
                onClick:() => {this.updateCancellationPolicy(iddef_policy)}
            }
        });
        this.refEditorEnCancellationPolicy.setContent();
        this.refEditorEsCancellationPolicy.setContent();
        this.buildingDataForm(iddef_policy);
        this.refModalCancellationPolicy.openModal();
    }

    saveCancellationPolicy()
    {
        this.setState({
            showLoading:true
        });
        let policy = this.refFormCancellationPolicy.getData();
        let cancellationPenalty = this.refFormDeadOfDeadline.getData();
        let cancellationFees = this.refFormCancellationFee.getData();
        let ChipAvailableDates = this.getValueChipAvailableDates();
        let refEditorEnCancellationPolicy = this.refEditorEnCancellationPolicy.getContent()
        let refEditorEsCancellationPolicy = this.refEditorEsCancellationPolicy.getContent()
        if( refEditorEnCancellationPolicy.trim() == "" || refEditorEsCancellationPolicy.trim() == ""){
            MComponentes.toast("Description(s) is empty");
            this.setState({
                showLoading:false
            });
            return;
        }
        if (policy.required.count == 0) {
            if (cancellationPenalty.required.count == 0) {
                let policy_code = (policy.values.policy_code).replace(/ /g,"_");
                let text_only_policy = policy.values.text_only_policy.length == 1 ? "1" : "0";
                let is_default = policy.values.is_default.length != 0 ? "1" : "0";
                let createPolicy = {
                    "iddef_policy_category": 1,
                    "iddef_currency": cancellationFees.values.iddef_currency,
                    "policy_code": policy_code,
                    "text_only_policy": text_only_policy,
                    "option_selected": policy.values.option_selected,
                    "is_default":is_default,
                    "estado": 1,
                    "available_dates" : this.castAvaileDate(ChipAvailableDates)
                };

                CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_create",createPolicy,(response,error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ showLoading: false });
                        return
                    }

                    if (!error && !response.Error) {
                        let resp_policy = response.data;
                        
                        cancellationPenalty = cancellationPenalty.values;
                        let dptad = cancellationPenalty.days_prior_to_arrival_deadline == "" ? "0" : cancellationPenalty.days_prior_to_arrival_deadline;
                        let tdd = cancellationPenalty.time_date_deadline == "" ? "00:00:00" : cancellationPenalty.time_date_deadline;
                        let createCancelPenalty = {
                            "iddef_policy":resp_policy.iddef_policy,
                            "penalty_name":cancellationPenalty.penalty_name,
                            "days_prior_to_arrival_deadline":dptad,
                            "time_date_deadline":tdd,
                            "description_en":refEditorEnCancellationPolicy,
                            "description_es":refEditorEsCancellationPolicy,
                            "estado":1
                        }
    
                        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_cancel_penalties/create",createCancelPenalty,(response,error) => {
                            if (!error) {
                                let resp_cancel_penalty = response.data;
                                if (cancellationFees.values.iddef_policy_rule.length > 0 || cancellationFees.values.iddef_policy_rule.length == "") {
                                    let createCancellationFee = {};
                                    let count_deposit = cancellationFees.values.iddef_policy_rule == "" ? 0 : cancellationFees.values.iddef_policy_rule.length;
                                    for (let i = 1; i <= count_deposit; i++) {
                                        let posit = (parseInt(i)-parseInt(1));
                                        if (cancellationFees.values.iddef_policy_rule[posit] == 1) {
                                            createCancellationFee = {
                                                "iddef_policy_cancel_penalty": resp_cancel_penalty.iddef_policy_cancel_penalty,
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[posit],
                                                "fixed_amount": cancellationFees.values.fixed_amount,
                                                "percent": "0.00",
                                                "option_percent": "0",
                                                "number_nights_percent": "0",
                                                "estado": "1"
                                            }
                                        } else {
                                            createCancellationFee = {
                                                "iddef_policy_cancel_penalty": resp_cancel_penalty.iddef_policy_cancel_penalty,
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[posit],
                                                "fixed_amount": "0",    
                                                "percent": cancellationFees.values.percent,
                                                "option_percent": cancellationFees.values.option_percent != "1" ? "0" : "1",
                                                "number_nights_percent": cancellationFees.values.number_nights_percent,
                                                "estado": "1"
                                            }
                                        }

                                        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine') + "/api/policy_penalty_cancel_fees/create", createCancellationFee, (response, error) => {
                                            if (error) {
                                                MComponentes.toast("Error");
                                                console.error("error to insert cancellation fee ", error);
                                                this.setState({
                                                    showLoading: false
                                                });
                                                return;
                                            } else {
                                                this.setState({
                                                    showLoading: false
                                                });

                                            }
                                        });
                                    }
                                    this.refModalCancellationPolicy.closeModal();
                                    MComponentes.toast('SUCCESS ');
                                    this.setState({
                                        showLoading: false
                                    });
                                }
                                let update_default = {};
                                if (resp_policy.is_default == 1) {
                                    CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policies/set_default/" + resp_policy.iddef_policy + "/1", {}, (response, error) => {
                                        if (response.status == 403) {
                                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                            this.setState({ showLoading: false });
                                            return
                                        }
                                        if (!error) {
                                            MComponentes.toast('SUCCESS UPDATE DEFAULT');
                                            this.getDataPoliciesByCategory();
                                            update_default = response;
                                        }else{
                                            MComponentes.toast('ERROR UPDATE DEFAULT');
                                            this.getDataPoliciesByCategory();
                                        }
                                    });
                                }
                            } else {
                                MComponentes.toast("Error");
                                console.error("error to insert cancel penalty ",error);
                                this.setState({
                                    showLoading:false
                                });
                            }
                        });
                    } else if (response.Error) {
                        let msg = response.Msg == "Duplicate Policy Code" ? response.Msg : "Error"
                        MComponentes.toast(msg);
                        this.setState({
                            showLoading:false
                        });
                        return;
                    } else {
                        MComponentes.toast("Error");
                        console.error("error to insert policy ",error);
                        this.setState({
                            showLoading:false
                        });
                    }
                });
            } else {
                MComponentes.toast(cancellationPenalty.required.inputs[0].label + " is empty");
                this.setState({
                    showLoading:false
                });
            }
        } else {
            MComponentes.toast(policy.required.inputs[0].label + " is empty");
            this.setState({
                showLoading:false
            });
        }
    }

    updateCancellationPolicy(iddef_policy)
    {
        this.setState({
            showLoading:true
        });
        let policy = this.refFormCancellationPolicy.getData();
        let cancellationPenalty = this.refFormDeadOfDeadline.getData();
        let cancellationFees = this.refFormCancellationFee.getData();

        let ChipAvailableDates = this.getValueChipAvailableDates();
        let refEditorEnCancellationPolicy = this.refEditorEnCancellationPolicy.getContent()
        let refEditorEsCancellationPolicy = this.refEditorEsCancellationPolicy.getContent()
        if( refEditorEnCancellationPolicy.trim() == "" || refEditorEsCancellationPolicy.trim() == ""){
            MComponentes.toast("Description(s) is empty");
            this.setState({
                showLoading:false
            });
            return;
        }
        if (policy.required.count == 0) {
            if (cancellationPenalty.required.count == 0) {
                let policy_code = (policy.values.policy_code).replace(/ /g,"_");
                let is_default = policy.values.is_default.length != 0 ? "1" : "0";
                let text_only_policy = policy.values.text_only_policy.length == 1 ? "1" : "0";
                let updatePolicy = {
                    "iddef_policy_category": 1,
                    "iddef_currency": policy.values.iddef_currency,
                    "policy_code": policy_code,
                    "is_default": is_default,
                    "text_only_policy": text_only_policy,
                    "option_selected": policy.values.option_selected,
                    "available_dates" : this.castAvaileDate(ChipAvailableDates)
                };
                
                CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_update/"+iddef_policy,updatePolicy,(response,error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ showLoading: false });
                        return
                    }
                    if (!error) {
                        let resp_policy = response.data;
                        
                        cancellationPenalty = cancellationPenalty.values;
                        let iddef_policy_cancel_penalty = cancellationPenalty.iddef_policy_cancel_penalty;
                        let dptad = cancellationPenalty.days_prior_to_arrival_deadline == "" ? "0" : cancellationPenalty.days_prior_to_arrival_deadline;
                        let tdd = cancellationPenalty.time_date_deadline == "" ? "00:00:00" : cancellationPenalty.time_date_deadline;
                        let updateCancelPenalty = {
                            "iddef_policy":resp_policy.iddef_policy,
                            "penalty_name":cancellationPenalty.penalty_name,
                            "days_prior_to_arrival_deadline":dptad,
                            "time_date_deadline":tdd,
                            "description_en":refEditorEnCancellationPolicy,
                            "description_es":refEditorEsCancellationPolicy,
                            "estado":1
                        }

                        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy_cancel_penalties/update/"+iddef_policy_cancel_penalty,updateCancelPenalty,(response,error) => {
                            if (!error) {
                                let resp_cancel_penalty = response.data;
                                let iddef_policy_cancel_penalty = resp_cancel_penalty.iddef_policy_cancel_penalty;
    
                                if (cancellationFees.values.iddef_policy_rule.length > 0 || cancellationFees.values.iddef_policy_rule.length == "") {
                                    let updateCanecelFee = [];
                                    let count_deposit = cancellationFees.values.iddef_policy_rule == "" ? 0 : cancellationFees.values.iddef_policy_rule.length;
                                    for (let i = 1; i <= count_deposit; i++) {
                                        let cancelFee = {};
                                        let index = (parseInt(i)-parseInt(1));
                                        if (cancellationFees.values.iddef_policy_rule[index] == 1) {
                                            cancelFee = {
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[index],
                                                "policy_rule": "Fixed amount",
                                                "fixed_amount": String(cancellationFees.values.fixed_amount),
                                                "percent": "0.00",
                                                "option_percent": "0",
                                                "number_nights_percent": "0",
                                                "estado": "1"
                                            }
                                            updateCanecelFee.push(cancelFee);
                                        } else {
                                            cancelFee = {
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[index],
                                                "policy_rule": "Percent",
                                                "fixed_amount": "0",    
                                                "percent": String(cancellationFees.values.percent),
                                                "option_percent": cancellationFees.values.option_percent != "1" ? "0" : "1",
                                                "number_nights_percent": String(cancellationFees.values.number_nights_percent),
                                                "estado": "1"
                                            }
                                            updateCanecelFee.push(cancelFee);
                                        }
                                    }

                                    CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policy_penalty_cancel_fees/update_by_cancel_penalty/" + iddef_policy_cancel_penalty, updateCanecelFee, (response, error) => {
                                        if (!error) {
                                            MComponentes.toast("success");
                                            this.refModalCancellationPolicy.closeModal();
                                            let update_default = {};
                                            if (resp_policy.is_default == 1) {
                                                CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policies/set_default/" + resp_policy.iddef_policy + "/1", {}, (response, error) => {
                                                    if (response.status == 403) {
                                                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                                        this.setState({ showLoading: false });
                                                        return
                                                    }
                                                    if (!error) {
                                                        MComponentes.toast("SUCCESS UPTATE POLICY");
                                                        this.getDataPoliciesByCategory();
                                                        update_default = response;
                                                        this.setState({ showLoading: false });
                                                    }else{
                                                        MComponentes.toast("ERROR UPTATE POLICY");
                                                        this.getDataPoliciesByCategory();
                                                        update_default = response;
                                                        this.setState({ showLoading: false });
                                                    }
                                                });
                                            }
                                            else{
                                                MComponentes.toast('SUCCESS');
                                                this.setState({
                                                    showLoading:false
                                                });
                                            }
                                            
                                        } else {
                                            MComponentes.toast("Error");
                                            console.error("Error to update cancel fee ", error);
                                            this.setState({
                                                showLoading:false
                                            });
                                        }
                                    });
                                }
                            } else {
                                MComponentes.toast("Error");
                                console.error("error to insert cancel penalty ", error);
                                this.setState({
                                    showLoading:false
                                });
                            }
                        });
                    } else {
                        MComponentes.toast("Error")
                        console.error("Error to insert policy ", error);
                        this.setState({
                            showLoading:false
                        });
                    }
                });
            } else {
                MComponentes.toast(cancellationPenalty.required.inputs[0].label + " is empty");
                this.setState({
                    showLoading:false
                });
            }
        } else {
            MComponentes.toast(policy.required.inputs[0].label + " is empty");
            this.setState({
                showLoading:false
            });
        }
    }

    saveCancellationPenalty()
    {
        this.setState({
            showLoading:true
        });
        let policy = this.refFormCancellationPolicy.getData();
        let cancellationPenalty = this.refFormDeadOfDeadline.getData();
        let cancellationFees = this.refFormCancellationFee.getData();
        let ChipAvailableDates = this.getValueChipAvailableDates();
        let refEditorEnCancellationPolicy = this.refEditorEnCancellationPolicy.getContent()
        let refEditorEsCancellationPolicy = this.refEditorEsCancellationPolicy.getContent()
        if( refEditorEnCancellationPolicy.trim() == "" || refEditorEsCancellationPolicy.trim() == ""){
            MComponentes.toast("Description(s) is empty");
            this.setState({
                showLoading:false
            });
            return;
        }
        if (policy.required.count == 0) {
            if (cancellationPenalty.required.count == 0) {
                let policy_code = (policy.values.policy_code).replace(/ /g,"_");
                let is_default = policy.values.is_default.length != 0 ? '1' : '0';
                let text_only_policy = policy.values.text_only_policy.length == 1 ? '1' : '0';
                let updatePolicy = {
                    "iddef_policy_category": '1',
                    "iddef_currency": policy.values.iddef_currency,
                    "policy_code": policy_code,
                    "is_default": is_default,
                    "text_only_policy": text_only_policy,
                    "option_selected": policy.values.option_selected,
                    "estado": 1,
                    "available_dates" : this.castAvaileDate(ChipAvailableDates)
                };

                CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_update/"+policy.values.iddef_policy,updatePolicy,(response,error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ showLoading: false });
                        return
                    }
                    if (!error) {
                        let resp_policy = response.data;
                        
                        cancellationPenalty = cancellationPenalty.values;
                        let dptad = cancellationPenalty.days_prior_to_arrival_deadline == "" ? "0" : cancellationPenalty.days_prior_to_arrival_deadline;
                        let tdd = cancellationPenalty.time_date_deadline == "" ? "00:00:00" : cancellationPenalty.time_date_deadline;
                        let createCancelPenalty = {
                            "iddef_policy":resp_policy.iddef_policy,
                            "penalty_name":cancellationPenalty.penalty_name,
                            "days_prior_to_arrival_deadline":dptad,
                            "time_date_deadline":tdd,
                            "description_en":refEditorEnCancellationPolicy,
                            "description_es":refEditorEsCancellationPolicy,
                            "estado":1
                        }
    
                        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_cancel_penalties/create",createCancelPenalty,(response,error) => {
                            if (!error) {
                                let resp_cancel_penalty = response.data;
                                if (cancellationFees.values.iddef_policy_rule.length > 0 || cancellationFees.values.iddef_policy_rule.length == "") {
                                    let createCancellationFee = {};
                                    let count_deposit = cancellationFees.values.iddef_policy_rule == "" ? 0 : cancellationFees.values.iddef_policy_rule.length;
                                    for (let i = 1; i <= count_deposit; i++) {
                                        let posit = (parseInt(i)-parseInt(1));
                                        if (cancellationFees.values.iddef_policy_rule[posit] == 1) {
                                            createCancellationFee = {
                                                "iddef_policy_cancel_penalty": resp_cancel_penalty.iddef_policy_cancel_penalty,
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[posit],
                                                "fixed_amount": cancellationFees.values.fixed_amount,
                                                "percent": "0.00",
                                                "option_percent": "0",
                                                "number_nights_percent": "0",
                                                "estado": "1"
                                            }
                                        } else {
                                            createCancellationFee = {
                                                "iddef_policy_cancel_penalty": resp_cancel_penalty.iddef_policy_cancel_penalty,
                                                "iddef_policy_rule": cancellationFees.values.iddef_policy_rule[posit],
                                                "fixed_amount": "0",    
                                                "percent": cancellationFees.values.percent,
                                                "option_percent": cancellationFees.values.option_percent != "1" ? "0" : "1",
                                                "number_nights_percent": cancellationFees.values.number_nights_percent,
                                                "estado": "1"
                                            }
                                        }
                                        
                                        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_penalty_cancel_fees/create",createCancellationFee,(response, error) => {
                                            if (!error) {
                                                MComponentes.toast("success");
                                                this.refModalCancellationPolicy.closeModal();
                                                let update_default = {};
                                                if (resp_policy.is_default == 1) {
                                                    CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policies/set_default/" + resp_policy.iddef_policy + "/1", {}, (response, error) => {
                                                        if (!error) {
                                                            MComponentes.toast('SUCCESS UPDATE DEFAULT');
                                                            this.getDataPoliciesByCategory();
                                                            update_default = response;
                                                        }else{
                                                            MComponentes.toast('ERROR UPDATE DEFAULT');
                                                            this.getDataPoliciesByCategory();
                                                        }
                                                    });
                                                }
                                            } else {
                                                MComponentes.toast("Error");
                                                console.error("error to insert cancellation fee ", error);
                                                this.setState({
                                                    showLoading:false
                                                });
                                            }
                                        });
                                    }
                                    MComponentes.toast("Success");
                                    this.refModalCancellationPolicy.closeModal();
                                    this.getDataPoliciesByCategory();
                                    this.setState({
                                        showLoading:false
                                    });
                                }
                            } else {
                                MComponentes.toast("Error");
                                console.error("error to insert cancel penalty ", error);
                                this.setState({
                                    showLoading:false
                                });
                            }
                        });
                    } else {
                        MComponentes.toast("Error");
                        console.error("error to insert policy",error);
                        this.setState({
                            showLoading:false
                        });
                    }
                });
            } else {
                MComponentes.toast(cancellationPenalty.required.inputs[0].label + " is empty");
                this.setState({
                    showLoading:false
                });
            }
        } else {
            MComponentes.toast(policy.required.inputs[0].label + " is empty");
            this.setState({
                showLoading:false
            });
        }
    }

    deleteCancellationPenalty(iddef_policy_cancel_penalty)
    {
        this.setState({
            showLoading:true
        });
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy_cancel_penalties/delete/"+iddef_policy_cancel_penalty,(response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                MComponentes.toast("Deleted");
                this.setState({
                    showLoading:false
                });
            } else {
                MComponentes.toast("Error");
                this.setState({
                    showLoading:false
                });
            }
        });
    }

    getDataCancellationPenalties(iddef_policy)
    {
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/search/'+iddef_policy,(response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                if ([response.data].length > 0) {
                    if (response.data.policy_cancel_penalties.length > 0) {
                        this.setState({
                            policy_cancel_penalties_list:response.data.policy_cancel_penalties
                        });
                    } else {
                        this.setState({
                            policy_cancel_penalties_list:[]
                        });
                    }
                } else {
                    console.log("Data not found");
                }
            } else {
                console.error(error);
            }
        });
    }

    getCancellationPenalty(iddef_policy,iddef_cancelation_penalty)
    {
        if (this.state.titleModal == "Details Policy") {
            this.buildCancellationPenalty(iddef_cancelation_penalty);
            this.setState({
                btnAction:{}
            });
        } else {
            this.buildCancellationPenalty(iddef_cancelation_penalty);
            this.setState({
                btnAction:{
                    label:"update",
                    icon:"edit",
                    onClick:() => {this.updateCancellationPolicy(iddef_policy)}
                }
            });
        }
    }


    buildCancellationPenalty(iddef_cancelation_penalty)
    {
        this.setState({
            showLoading: true
        });

        let policy = this.refFormCancellationPolicy.getData();

        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_cancel_penalties/search/'+iddef_cancelation_penalty,(response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                let data_policy = policy.values;
                let data_policy_cancel_penalty = {};

                let cancel_fees = [];
                let data_cancel_fees = {};
                if([response.data].length > 0) {
                    let response_policy_cancellation_penalty = response.data;
                    
                    data_policy_cancel_penalty = {
                        iddef_policy_cancel_penalty: String(response_policy_cancellation_penalty.iddef_policy_cancel_penalty),
                        iddef_policy: String(response_policy_cancellation_penalty.iddef_policy),
                        penalty_name:String(response_policy_cancellation_penalty.penalty_name),
                        days_prior_to_arrival_deadline: String(response_policy_cancellation_penalty.days_prior_to_arrival_deadline),
                        time_date_deadline: String(response_policy_cancellation_penalty.time_date_deadline)
                    };
                    this.refEditorEnCancellationPolicy.setContent(response_policy_cancellation_penalty.description_en);
                    this.refEditorEsCancellationPolicy.setContent(response_policy_cancellation_penalty.description_es);

                    cancel_fees = response_policy_cancellation_penalty.cancel_fees;

                    if (cancel_fees.length > 0) {
                        if (cancel_fees.length == 1) {
                            cancel_fees = cancel_fees[0];
                            if (cancel_fees.iddef_policy_rule == 1) {
                                this.setState({
                                    disabledFixedAmount:false,
                                    disableIddefCurrency:true,
                                    disabledPercent:true,
                                    disabledOptionPercent:true,
                                    disabledNumberNightsPercent:true
                                });
                                data_cancel_fees = {
                                    iddef_policy_penalty_cancel_fee:String(cancel_fees.iddef_policy_penalty_cancel_fee),
                                    iddef_policy_cancel_penalty:String(cancel_fees.iddef_policy_cancel_penalty),
                                    iddef_policy_rule:[String(cancel_fees.iddef_policy_rule)],
                                    policy_rule:String(cancel_fees.policy_rule),
                                    fixed_amount:String(cancel_fees.fixed_amount),
                                    iddef_currency:String(policy.values.iddef_currency),
                                    percent:"0",
                                    option_percent:"0",
                                    number_nights_percent:"0"
                                };
                            } else {
                                this.setState({
                                    disabledFixedAmount:true,
                                    disableIddefCurrency:true,
                                    disabledPercent:false,
                                    disabledOptionPercent:false,
                                    disabledNumberNightsPercent:false
                                });
                                data_cancel_fees = {
                                    iddef_policy_penalty_cancel_fee:String(cancel_fees.iddef_policy_penalty_cancel_fee),
                                    iddef_policy_cancel_penalty:String(cancel_fees.iddef_policy_cancel_penalty),
                                    iddef_policy_rule:[String(cancel_fees.iddef_policy_rule)],
                                    policy_rule:String(cancel_fees.policy_rule),
                                    fixed_amount:"0",
                                    iddef_currency:String(policy.values.iddef_currency),
                                    percent:String(cancel_fees.percent),
                                    option_percent:String(cancel_fees.option_percent),
                                    number_nights_percent:String(cancel_fees.number_nights_percent)
                                };
                            }
                        } else {
                            this.setState({
                                disabledFixedAmount:false,
                                disableIddefCurrency:true,
                                disabledPercent:false,
                                disabledOptionPercent:false,
                                disabledNumberNightsPercent:false
                            });
                            
                            data_cancel_fees = {
                                iddef_policy_rule:["1","2"],
                                iddef_currency:String(policy.values.iddef_currency)
                            };

                            let ids = "";
                            let count = cancel_fees.length;
                            cancel_fees.map((pgd,key) => {
                                if(pgd.policy_rule == "Fixed amount") {
                                    data_cancel_fees.fixed_amount = String(pgd.fixed_amount);
                                } else if (pgd.policy_rule == "Percent") {
                                    data_cancel_fees.percent = String(pgd.percent);
                                    data_cancel_fees.option_percent = String(pgd.option_percent);
                                    data_cancel_fees.number_nights_percent = String(pgd.number_nights_percent);
                                } else {
                                    data_cancel_fees.fixed_amount = "0";
                                    data_cancel_fees.percent = "0";
                                    data_cancel_fees.option_percent = "0";
                                    data_cancel_fees.number_nights_percent = "0";
                                }
                                
                                if ((parseInt(key)+parseInt(1)) < count) {
                                    ids += pgd.iddef_policy_penalty_cancel_fee+"|";
                                } else {
                                    ids += pgd.iddef_policy_penalty_cancel_fee;
                                }
                            });
                            data_cancel_fees.iddef_policy_penalty_cancel_fee = ids;
                        }
                    }

                    this.setState({
                        dataFormPolicy:data_policy,
                        dataFormCancelPenalties:data_policy_cancel_penalty,
                        dataFormCancelFees:data_cancel_fees,
                        showLoading:false,
                    });
                } else {
                    this.setState({
                        showLoading:false
                    });
                    console.log("No hay penalties")
                }
            } else {
                this.setState({
                    showLoading:false
                });
                console.error(error);
            }
        });
    }

    buildingDataForm(iddef_policy)
    {
        this.setState({
            showLoading:true
        });
        this.getDataCancellationPenalties(iddef_policy);
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/search/'+iddef_policy,(response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                if ([response.data].length > 0) {
                    let policy = response.data;
                    let data_policy_obj = {};

                    let policy_cancel_penalties = [];
                    let data_policy_cancel_penalties_obj = {};

                    let cancel_fees = [];
                    let data_cancel_fees_obj = {};

                    let text_only_policy = (policy.text_only_policy == 1 ? ['1'] : []);
                    data_policy_obj = {
                        iddef_policy_category: String(policy.iddef_policy_category),
                        iddef_policy: String(policy.iddef_policy),
                        iddef_currency: String(policy.iddef_currency),
                        policy_category: String(policy.policy_category),
                        policy_code: String(policy.policy_code),
                        currency_code: String(policy.currency_code),
                        text_only_policy: text_only_policy,
                        option_selected: String(policy.option_selected),
                        available_dates: policy.available_dates,
                        is_default: [String(policy.is_default)],
                    };
                    
                    this.cleanValueChipAvailableDates();
                    for (let i = 0; i < policy.available_dates.length; i++) {
                        let dateTemp = this.castDate(policy.available_dates[i].start_date, "USER") + " - " + this.castDate(policy.available_dates[i].end_date, "USER")
                        this.setValueChipAvailableDates(dateTemp)
                    }
                    
                    if (policy.policy_cancel_penalties.length > 0) {
                        policy_cancel_penalties = policy.policy_cancel_penalties[0];
                        data_policy_cancel_penalties_obj = {
                            iddef_policy_cancel_penalty: String(policy_cancel_penalties.iddef_policy_cancel_penalty),
                            iddef_policy: String(policy_cancel_penalties.iddef_policy),
                            penalty_name:String(policy_cancel_penalties.penalty_name),
                            days_prior_to_arrival_deadline: String(policy_cancel_penalties.days_prior_to_arrival_deadline),
                            time_date_deadline: String(policy_cancel_penalties.time_date_deadline),
                            penalty_name: String(policy_cancel_penalties.penalty_name),
                        };

                        this.refEditorEnCancellationPolicy.setContent(policy_cancel_penalties.description_en);
                        this.refEditorEsCancellationPolicy.setContent(policy_cancel_penalties.description_es);
                        
                        cancel_fees = policy_cancel_penalties.cancel_fees;

                        if (cancel_fees.length > 0) {
                            if (cancel_fees.length == 1) {
                                cancel_fees = cancel_fees[0];
                                if (cancel_fees.iddef_policy_rule == 1) {
                                    data_cancel_fees_obj = {
                                        iddef_policy_penalty_cancel_fee:String(cancel_fees.iddef_policy_penalty_cancel_fee),
                                        iddef_policy_cancel_penalty:String(cancel_fees.iddef_policy_cancel_penalty),
                                        iddef_policy_rule:[String(cancel_fees.iddef_policy_rule)],
                                        policy_rule:String(cancel_fees.policy_rule),
                                        fixed_amount:String(cancel_fees.fixed_amount),
                                        iddef_currency:String(policy.iddef_currency),
                                        percent:"0",
                                        option_percent:"0",
                                        number_nights_percent:"0"
                                    };
                                } else {
                                    data_cancel_fees_obj = {
                                        iddef_policy_penalty_cancel_fee:String(cancel_fees.iddef_policy_penalty_cancel_fee),
                                        iddef_policy_cancel_penalty:String(cancel_fees.iddef_policy_cancel_penalty),
                                        iddef_policy_rule:[String(cancel_fees.iddef_policy_rule)],
                                        policy_rule:String(cancel_fees.policy_rule),
                                        fixed_amount:"0",
                                        iddef_currency:String(policy.iddef_currency),
                                        percent:String(cancel_fees.percent),
                                        option_percent:String(cancel_fees.option_percent),
                                        number_nights_percent:String(cancel_fees.number_nights_percent)
                                    };
                                }
                            } else {data_cancel_fees_obj = {
                                    iddef_policy_rule:["1","2"],
                                    iddef_currency:String(policy.iddef_currency)
                                };

                                let ids = "";
                                let count = cancel_fees.length;
                                cancel_fees.map((pgd,key) => {
                                    if(pgd.policy_rule == "Fixed amount") {
                                        data_cancel_fees_obj.fixed_amount = String(pgd.fixed_amount);
                                    } else if (pgd.policy_rule == "Percent") {
                                        data_cancel_fees_obj.percent = String(pgd.percent);
                                        data_cancel_fees_obj.option_percent = String(pgd.option_percent);
                                        data_cancel_fees_obj.number_nights_percent = String(pgd.number_nights_percent);
                                    } else {
                                        data_cancel_fees_obj.fixed_amount = "0";
                                        data_cancel_fees_obj.percent = "0";
                                        data_cancel_fees_obj.option_percent = "0";
                                        data_cancel_fees_obj.number_nights_percent = "0";
                                    }
                                    
                                    if ((parseInt(key)+parseInt(1)) < count) {
                                        ids += pgd.iddef_policy_penalty_cancel_fee+"|";
                                    } else {
                                        ids += pgd.iddef_policy_penalty_cancel_fee;
                                    }
                                });
                                data_cancel_fees_obj.iddef_policy_penalty_cancel_fee = ids;
                            }
                        }
                    }
                    this.setState({
                        dataFormPolicy:data_policy_obj,
                        dataFormCancelPenalties:data_policy_cancel_penalties_obj,
                        dataFormCancelFees:data_cancel_fees_obj,
                        showLoading:false
                    });
                } else {
                    console.log("Empty Cancellation Penalties");
                    this.setState({
                        showLoading:false
                    });
                }
            } else {
                this.setState({
                    showLoading:false
                });
            }
        });
    }

    castDate(datecast, type) {
        let newFormat = ""
        //2020-02-10 -> 10/02/2020
        if (type == "USER") {
            let arraySplit = datecast.split("-")
            newFormat = arraySplit[2] + "/" + arraySplit[1] + "/" + arraySplit[0]
        }
        //10/02/2020 -> 2020-02-10
        else if (type == "SYSTEM") {
            let arraySplit = datecast.split("/")
            newFormat = arraySplit[2] + "-" + arraySplit[1] + "-" + arraySplit[0]
        }


        return newFormat
    }

    addToChip(){
        if (this.state.dataFormPolicy.AvailableDateStart || this.state.dataFormPolicy.AvailableDateEnd) {
            if (Date.parse(this.state.dataFormPolicy.AvailableDateStart + " 12:00") < Date.parse(this.state.dataFormPolicy.AvailableDateEnd + " 12:00")) {
                this.setValueChipAvailableDates(this.castDate(this.state.dataFormPolicy.AvailableDateStart, "USER") + " - " + this.castDate(this.state.dataFormPolicy.AvailableDateEnd, "USER"));
            } else {
                MComponentes.toast("Select a valid range");
                return;
            }

        } else {
            MComponentes.toast("Select a date range");
            return;
        }
    }
    onChangeDate(e) {
        let form = JSON.parse(JSON.stringify(this.state.dataFormPolicy));
        form[e.id] = e.dateString
        this.setState({ dataFormPolicy: form })
    }

    castAvaileDate(StringDate){
        let arrayReturn = []
        for (let index = 0; index < StringDate.length; index++) {
            let arraySplit = StringDate[index].split(" - ")
            arrayReturn.push({start_date: this.castDate(arraySplit[0], "SYSTEM"), end_date: this.castDate(arraySplit[1], "SYSTEM") })
        }
        return arrayReturn
    }

     replaceBadInputs(val) {
        // Replace impossible inputs as the appear
        val = val.replace(/[^\dh:]/, "");
        val = val.replace(/^[^0-2]/, "");
        val = val.replace(/^([2-9])[4-9]/, "$1");
        val = val.replace(/^\d[:h]/, "");
        val = val.replace(/^([01][0-9])[^:h]/, "$1");
        val = val.replace(/^(2[0-3])[^:h]/, "$1");      
        val = val.replace(/^(\d{2}[:h])[^0-5]/, "$1");
        val = val.replace(/^(\d{2}h)./, "$1");      
        val = val.replace(/^(\d{2}:[0-5])[^0-9]/, "$1");
        val = val.replace(/^(\d{2}:\d[0-9])./, "$1");
        return val;
      }
      
      // Apply input rules as the user types or pastes input
      onChangeTimeInput(val){
        
        var val = val.value;
        var lastLength;
        do {
          // Loop over the input to apply rules repeately to pasted inputs
          lastLength = val.length;
          val = this.replaceBadInputs(val);

        } while(val.length > 0 && lastLength !== val.length);

        let form = JSON.parse(JSON.stringify(this.state.dataFormCancelPenalties));
        form["time_date_deadline"] = val
        this.setState({ dataFormCancelPenalties: form })

      }
    
      
      // Check the final result when the input has lost focus
      onBlurTimeInput(val){
        var val = val.value;
        val = (/^(([01][0-9]|2[0-3])h)|(([01][0-9]|2[0-3]):[0-5][0-9])$/.test(val) ? val : "")
        this.value = val;

        let form = JSON.parse(JSON.stringify(this.state.dataFormCancelPenalties));
        form["time_date_deadline"] = val
        this.setState({ dataFormCancelPenalties: form })
      }
    
    onChangeRule(e){
        let form = JSON.parse(JSON.stringify(this.state.dataFormCancelFees));
        let dataRef = this.refFormCancellationFee.getData().values

        if (e.name == "iddef_policy_rule") {
            form[e.name] = e.values
            form["fixed_amount"] = dataRef.fixed_amount
            form["iddef_currency"] = dataRef.iddef_currency
            form["option_percent"] = dataRef.option_percent
            form["number_nights_percent"] = dataRef.number_nights_percent

        }
        if (e.name == "option_percent") {
            form[e.name] = e.value
            form["iddef_policy_rule"] = dataRef.iddef_policy_rule
            form["fixed_amount"] = dataRef.fixed_amount
            form["iddef_currency"] = dataRef.iddef_currency
            form["percent"] = dataRef.percent
            form["number_nights_percent"] = dataRef.number_nights_percent
        }

        
        this.setState({ dataFormCancelFees: form })
    }

    hiddenInput(option, arrayValue) {
        try {
            if (arrayValue.indexOf(option) != -1) {
                return false
            }
            else {
                return true
            }
        } catch (error) {
            return true
        }

    }

    deleteCancellationPolicy(e,data) {
        this.refConfirm.getInstance().open();
        this.setState({ deletePolicy: data });
    }

    deletePolicyConfirm(e) {
        let iddef_policy = Number(this.state.deletePolicy.iddef_policy);
        let estado = this.state.deletePolicy.estado == 1 ? 0 : 1;
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+'/api/policies/change_status/'+iddef_policy+'/'+estado,{},(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                this.getDataPoliciesByCategory();
                this.refConfirm.getInstance().close();
            } else {
                console.log(error);
                MComponentes.toast("ERROR");
            }
        });
    }

    setDefaultPolicy(iddef_policy) {
        this.refDefaultConfirm.getInstance().open();
        this.setState({ setDefault_id: iddef_policy });
    }

    setDefaultConfirm() {
        let iddef_policy = this.state.setDefault_id;
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/set_default/"+iddef_policy+"/1",{},(response,error) => {
            if (response.Code == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                if (response.Code == 404) {
                    MComponentes.toast("Policy is disabled");
                } else {
                    this.getDataPoliciesByCategory();
                    this.getDataOptionsByCategory();
                    this.refDefaultConfirm.getInstance().close();
                    MComponentes.toast("SUCCESS UPDATE POLICY");
                }
            } else {
                console.log(error);
                MComponentes.toast("ERROR");
            } 
        });
    }

    setTextOnly(data) {
        let length = data.value.length;
        let hideForm = (length == 1 ? true : false);
        this.setState({
            hideForm:hideForm
        });
    }

    render() {
        return (
            <div className="row">
                <CleverLoading show={this.state.showLoading}/>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{click:(e) => this.deletePolicyConfirm()}}
                />
                <ConfirmDialog
                    onRef={defaultconfirm => this.refDefaultConfirm = defaultconfirm}
                    yesButton={{click:(e) => this.setDefaultConfirm()}}
                />
                <GridView idTable='table-cancelation-gridview'
                    onRef={ref => (this.refTableCancellationPolicies = ref)}
                    filter={false}
                    serializeRows={false}
                    columns={[
                        {attribute: 'policy_code',alias: 'Policy code'},
                        {attribute: '',alias: 'Penalties', value:(data) => {
                            if (data.policy_cancel_penalties) {
                                return data.policy_cancel_penalties.map((cancelPenalties,i) => {
                                    return (
                                        <div key={i}>
                                            <span>{cancelPenalties.penalty_name}</span>
                                        </div>
                                    );
                                });
                            } else {
                                return ('No hay nada');
                            }
                        }},
                        {attribute: '',alias: 'Default policy',value: (data) => {
                            return (
                                <div>
                                    {
                                        data.is_default == 1 ?
                                            <a><i className="material-icons">radio_button_checked</i></a>
                                        :
                                            <a onClick={() => this.setDefaultPolicy(data.iddef_policy)}><i className="material-icons">radio_button_unchecked</i></a>
                                    }
                                </div>
	                    		
	                    	);
                        }},
                        {attribute: '',alias: 'Actions',filter: false,value: (data) => {
                            return(
                                <div>
                                    <a id="detail" onClick={() => this.detailsCancellationPolicy(data.iddef_policy)} title="View Policies"><i className="material-icons left">visibility</i></a> 
                                    <a id="edit" onClick={() => this.editCancellationPolicy(data.iddef_policy)} title="Edit Policies"><i className="material-icons left">mode_edit</i></a>
                                    {
                                        data.estado == 1 ?
                                            <a onClick={(e) => this.deleteCancellationPolicy(e,data)} title='Disable Policy'><i className='material-icons left'  >toggle_on</i></a>
                                        :
                                            <a onClick={(e) => this.deleteCancellationPolicy(e,data)} title='Enable Policy'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                    }
                                </div>
                            );
                        }}
                    ]}
                />
                <Modal
                    id={"modalCancellationPolicies"}
                    title={this.state.titleModal}
                    size={"full"}
                    ref={ref => this.refModalCancellationPolicy = ref}
                    btnAction={this.state.btnAction}
                >
                    <CleverForm
                        id="form_cancellationPolicy"
                        ref={ref => this.refFormCancellationPolicy = ref}
                        data={this.state.dataFormPolicy}
                        className="form_cancellationPolicy"
                        forms={[
                            {
                                size:'col s12 m12 l12',
                                inputs:[
                                    {row:[
                                        {type:'number',name:'iddef_policy_category',hidden:true},
                                        {type:'number',name:'iddef_policy',hidden:true},
                                        {type:'number',name:'iddef_currency',hidden:true},
                                        {type:'text',name:'policy_category',hidden:true}
                                    ]}
                                ]
                            },
                            {
                                size: 'col s12 m12 l12',
                                inputs:[
                                    {row:[
                                        {type:'component',component: () => {
                                            return (
                                                <h4 className={this.state.hideTitleHead == true ? 'hide' : ''} >{this.state.dataFormPolicy.policy_code}</h4>
                                            );
                                        }},
                                        {type:'text',size:'s12 m12 l6',label:'*Policy Name',name:'policy_code',placeholder:'Policy Name',required:true,hidden:this.state.hideTitleInput, characters:true}
                                    ]}
                                ]
                            },
                            {
                                size: 'col s12 m12 l12',
                                inputs: [
                                    {row:[
                                        {type:'checkbox',size:'col s12 m12 l12',label:'',name:'text_only_policy',onChange:(data) => {this.setTextOnly(data)},checkboxs:[{value:'1',label:'Text only Policy: Description instead of exactly specified amounts (not recommended)'}]},
                                        {type:'checkbox',size:'col s12 m12 l12',label:'',name:'is_default',checkboxs:[{value:'1',label:'Default policy'}]},
                                    ]},
                                    {row:[                                            
                                        {type:'radio',size:'col s12 m12 l12',label:'',name:'option_selected',radios:this.state.optionsCategory}
                                    ]}
                                ]
                            }
                        ]}
                    />
                    <div id="all_forms" >
                        {/*

                        ## Se comenta de mientras en lo que viene mige 

                        <div className={this.state.hideForm ? "hide row" : " row"}>
                            <div className="col s12 m12 l12">
                                <h6 id="form_penalties">Penalties Definition</h6>
                            </div>
                            <CleverButton size={'col s12 m2 l1'} icon={'add'} fullSize={true} disabled={this.state.hideButtonAdd} hidden={this.state.hideButtonAdd} onClick={this.createPenaltyDefinition}/>
                        </div> 
                        <div className="row">
                        {
                            this.state.policy_cancel_penalties_list.length >= 1 ?
                                this.state.policy_cancel_penalties_list.map((penalty, key) => {
                                    return (
                                        <div style={{cursor:'pointer'}} key={key} className="chip">
                                            <span onClick={() => this.getCancellationPenalty(penalty.iddef_policy,penalty.iddef_policy_cancel_penalty)}>{(key+1)+'. '+penalty.penalty_name}</span>
                                            <i style={{cursor:"pointer", float: "right",fontSize: "16px",lineHeight: "32px",paddingLeft: "8px"}} className={this.state.disableDelete ? "material-icons hide" : "material-icons"} onClick={() => this.deleteCancellationPenalty(penalty.iddef_policy_cancel_penalty)}>close</i>
                                        </div>
                                    );
                                })
                            : null
                        }
                        
                        </div>
                        */}
                        <div className={this.state.hideForm ? "hide" : ""}>
                        <CleverForm
                            id="form_date_of_deadline"
                            ref={ref => this.refFormDeadOfDeadline = ref}
                            data={this.state.dataFormCancelPenalties}
                            forms={[
                                {
                                    fieldset:true,
                                    title:'Time - the date of deadline',
                                    size:'col s12 m12 l12',
                                    inputs:[
                                        {row:[
                                            {type:'text',name:'iddef_policy_penalty_cancel_fee',hidden:true},
                                            {type:'text',name:'iddef_policy_cancel_penalty',hidden:true}
                                        ]},
                                        {row:[
                                            {type:'text',name:'penalty_name',label:'*Penalty name',placeholder:'Penalty name',size:'col s12 m12 l6',alphanumeric:true, required:this.state.hideForm == true ? false : true}
                                        ]},
                                        {row:[
                                            {type:'number',name:'days_prior_to_arrival_deadline',size:'col s12 m12 l6',label:'*Days prior to Arrival',min:'0',required:this.state.hideForm == true ? false : true},
                                            /*{type:'component', component:() => {
                                                return (
                                                    <div>
                                                         <DatePicker
                                                            activeTime={true}
                                                            defaultTime={"10:30"}
                                                            formatTime={12}
                                                        />
                                                    </div>
                                                );
                                            }}*/
                                            {type:'text',name:'time_date_deadline',onBlur: e => this.onBlurTimeInput(e), onChange: e => this.onChangeTimeInput(e), size:'col s12 m12 l6',label:'*Time - the date of deadline(24 hours format: 00:00)',placeholder:'00:00',alphanumeric:true, characters:true,required:this.state.hideForm == true ? false : true}
                                        ]},
                                        {row:[
                                            {type: 'component',component:() => {
                                                return (
                                                    <div className="row">
                                                        <span className="col s12 m12 l12">*Guarantee payment will be only charged maximum 100 percent of booking amount.</span>
                                                    </div>
                                                );
                                            }}
                                        ]}
                                    ]
                                }
                            ]}
                        />
                        </div>
                        <br/>
                        
                        <CleverForm
                            id="form_cancel_fee"
                            ref={ref => this.refFormCancellationFee = ref}
                            data={this.state.dataFormCancelFees}
                            forms={[
                                {
                                    fieldset:true,
                                    title:'Cancellation Fee',
                                    size:'col s12 m12 l12',
                                    inputs:[
                                        {row:[
                                            {type:'text',name:'iddef_policy_penalty_cancel_fee',hidden:true},
                                            {type:'number',name:'iddef_policy_cancel_penalty',hidden:true}
                                        ]},
                                        {row:[
                                            {type: 'select',hidden:this.state.hideForm, onChange: e => this.onChangeRule(e), size:'col s12 m12 l2', label:'Policy rule',name:'iddef_policy_rule',options:[{value:'1',option:'Fixed amount'},{value:'2',option:'Percent'}],multiple:true},
                                            {type: 'number',hidden:this.state.hideForm || this.state.hiddenInput("1", this.state.dataFormCancelFees.iddef_policy_rule) ? true : false , size: 'col s12 m12 l2',label:'Fixed amount',name:'fixed_amount',min:'0'},
                                            {type: 'select',hidden:this.state.hideForm || this.state.hiddenInput("1", this.state.dataFormCancelFees.iddef_policy_rule) ? true : false , size: 'col s12 m2 l2',label:'currency',name:'iddef_currency',options:[{value:'1',option:'USD'},{value:'2',option:'MXN'}]},
                                            {type: 'number',hidden:this.state.hideForm || this.state.hiddenInput("2", this.state.dataFormCancelFees.iddef_policy_rule) ? true : false , size: 'col s12 m12 l2',label:'Percent',name:'percent',min:'0'},
                                            {type: 'select',hidden:this.state.hideForm || this.state.hiddenInput("2", this.state.dataFormCancelFees.iddef_policy_rule) ? true : false ,  onChange: e => this.onChangeRule(e), size: 'col s12 m2 l2',label:'Option percent',name:'option_percent',placeholder:'Option percent',options:[{value:'0',option:'FULLSTAY'},{value:'1',option:'NIGHTS'}]},
                                            {type: 'number',hidden: (this.state.hideForm == false && this.state.hiddenInput("2", this.state.dataFormCancelFees.iddef_policy_rule) == false && this.state.dataFormCancelFees.option_percent == "1") ? false : true , size: 'col s12 m12 l2',label:'Number of nights',name:'number_nights_percent',min:'0'}
                                        ]},
                                        {row:[
                                            {type: 'component',component:() => {
                                                return (
                                                    <div className="row">
                                                        <span className={ this.state.hideForm ? 'col s12 m12 l12 hide' : 'col s12 m12 l12'}>*Guarantee payment will be only charged maximum 100 percent of booking amount.</span>
                                                    </div>
                                                );
                                            }}
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
                                                                onRef ={editor => this.refEditorEnCancellationPolicy = editor}
                                                                // buttons={[
                                                                //     'bold','italic','underline', 'strikethrough','|',
                                                                //     'undo','redo','|',
                                                                //     'eraser','|',
                                                                //     'ul', 'ol'
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
                                                                //     'undo','redo','|',
                                                                //     'eraser','|',
                                                                //     'ul', 'ol'
                                                                // ]}
                                                            />
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                                );
                                            }}
                                        ]},
                                        {row:[
                                            {
                                                type: 'component', component: () => {
                                                    return (
                                                        <div className={"col s12 m12 l12 "}>
                                                        <p style={{"color":"#01536d"}}>{"Available Dates"}</p>
                                                        </div>
                                                    )
                                                }
                                            },
                                            { type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m4 l4 ", label: 'Start', name: 'AvailableDateStart' },
                                            { type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m4 l4 ", min: this.state.dataFormPolicy.AvailableDateStart, label: 'End', name: 'AvailableDateEnd' },
                                            {
                                                type: 'component', component: () => {
                                                    return (
                                                        <div className={"col s12 m4 l4 "}>
                                                            <button className="btn input-field" onClick={e => this.addToChip(e)} type="button">ADD DATE</button>
                                                        </div>
                                                    )
                                                }
                                            },
                                            {
                                                type: 'component', component: () => {
                                                return (
                                                    <div className="col s12 m12 l12 ">
                                                    
                                                    <Chip
                                                        readOnly={true}
                                                        setValue={set => { this.setValueChipAvailableDates= set; }}
                                                        getValue={get => { this.getValueChipAvailableDates = get; }}
                                                        cleanValue={ clean => {this.cleanValueChipAvailableDates = clean;} }
                                                        options={{
                                                            placeholder: "Available Dates",
                                                            secondaryPlaceholder: "Available Dates",
                                                        }}
                                                        label={{ t: "TAG", d: "{{'TAG'}}" }}
                                                    />
                                               </div>
                                                );
                                            }}
                                        ]},
                                    ]
                                }
                            ]}
                        />
                        
                    </div>
                    <div className="row">
                        <div className="col s12 m12 l12">
                            <p>
                                {"*When left empty, the system will use the following description:unkown deadline: free of charge"}
                            </p>
                            <p>{"*The field is mandatory. Saving is not possible without having this field set. "}</p>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}