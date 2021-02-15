import React, { Component } from 'react';
import { CleverNotification, ConfirmDialog, CleverButton, CleverLoading, GridView, CleverForm, CleverEditor, CleverMethodsApi, CleverRequest, MComponentes, CleverInputCheckBox } from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";
import Modal from '../../../../components/modal/Modal';
export default class CancelationPolicies extends Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");

        this.createBookingGuaranteePolicy = this.createBookingGuaranteePolicy.bind(this);
        this.editBookingGuaranteePolicy = this.editBookingGuaranteePolicy.bind(this);
        this.detailsBookingGuaranteePolicy = this.detailsBookingGuaranteePolicy.bind(this);
        
        this.saveBookingGuaranteePolicy = this.saveBookingGuaranteePolicy.bind(this);
        this.updateBookingGuaranteePolicy = this.updateBookingGuaranteePolicy.bind(this);
        this.deleteConfirmMessage = this.deleteConfirmMessage.bind(this);
        this.deleteBookingGuaranteePolicy = this.deleteBookingGuaranteePolicy.bind(this);
        this.closeNotification = this.closeNotification.bind(this);
        
        this.setConfigInputs = this.setConfigInputs.bind(this);

        this.state = {
			hiddenInput: this.hiddenInput.bind(this),
            hideNotification:true,
            showLoading:false,
            hideForm:false,
			hideTextOptionBooking:true,
			hideFormFraud:true,
			dataRuleFraudFixAmount:{},
			dataRuleFraudMoreDays:{},
            dataTableBookingGuarantee:[],
            dataFormBookingGuarantee:{
            	policy:{},
            	policy_guarantees:{},
            	policy_guarantee_deposits:{}
            }
        };
    }

    componentDidMount()
    {
    	this.getDataPoliciesByCategory();
    	this.getOptionsByCategory();
    	this.getPolicyGuaranteeType();
    }

    getOptionsByCategory()
    {
    	this.setState({
    		optionsCategory:[]
    	});
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_categories/search/2',(response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			let data = [];
    			let data_options = response.data.options.options;
   				Object.keys(data_options).map(option => {
   					data.push({value:option,option:data_options[option]});
   				});
   				this.setState({
   					optionsCategory:data
   				});
    		} else {
    			console.error(error);
    		}
    	});
    }

    getPolicyGuaranteeType()
    {
    	this.setState({
    		guaranteesType:[]
    	});
    	CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/policy_guarantee_types/get', (response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			let data = [];
    			let data_guarantees_type = response.data;
    			data_guarantees_type.map(guarantee_type => {
    				data.push({
    					value:guarantee_type.iddef_policy_guarantee_type,
    					option:guarantee_type.description});
    			});
    			this.setState({
    				guaranteesType:data
    			});
    		} else {
    			console.error(error)
    		}
    	});
    }

    getDataPoliciesByCategory()
    {
        this.setState({
            showLoading:true
        });
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/get/2', (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
                if (response.data.length > 0) {
                    this.setState({
                        dataTableBookingGuarantee:response.data
                    },() => {
                        this.refTableBookingGuarantee.setDataProvider(this.state.dataTableBookingGuarantee);
                    });
                } else {
                	this.refTableBookingGuarantee.setDataProvider([]);
                }
                this.setState({
                	showLoading:false
                });
            }
            else {
            	console.error(error);
            }
        });
    }

    detailsBookingGuaranteePolicy(iddef_policy)
	{
		window.scroll(0,0);
		this.setState({
			titleModal:"Details Policy",
			showLoading:true,
			disabledInput:false,
			hideTitleHead:false,
			hideTitleInput:true,
			hideTextOptionBooking:true,
			hideFormPolicyGuaranteeDeposit:true,
			hideDates:true,
			hideDiscount:true,
			btnAction:{}
		});
		CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/search/'+iddef_policy,(response,error) => {
			if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
                if ([response.data].length > 0) {
                	let policy = response.data;
                	let data_policy = {};

                	let policy_guarantees = [];
	                let data_policy_guarantees = {};

	                let policy_guarantee_deposits = [];
	                let data_policy_guarantee_deposits = {};

	                data_policy = {
	                    iddef_policy_category: String(policy.iddef_policy_category),
	                    iddef_policy: String(policy.iddef_policy),
	                    iddef_currency: String(policy.iddef_currency),
	                    policy_category: String(policy.policy_category),
	                    policy_code: String(policy.policy_code),
	                    currency_code: String(policy.currency_code),
	                    text_only_policy: [String(policy.text_only_policy)],
						option_selected: String(policy.option_selected),
						is_default: [String(policy.is_default)],
	                };

	                policy_guarantees = policy.policy_guarantees;
	                
	                if (policy_guarantees.length > 0) {
	                	policy_guarantees = policy_guarantees[0];
	                	
	                	data_policy_guarantees = {
	                		iddef_policy:String(policy_guarantees.iddef_policy),
	                        iddef_policy_guarantee:String(policy_guarantees.iddef_policy_guarantee),
	                        iddef_policy_guarantee_type:String(policy_guarantees.iddef_policy_guarantee_type),
	                        allow_hold_free:String(policy_guarantees.allow_hold_free),
	                        hold_duration:String(policy_guarantees.hold_duration),
	                        stay_dates_option:String(policy_guarantees.stay_dates_option),
	                        stay_dates:policy_guarantees.stay_dates,
	                        reminder_lead_time:String(policy_guarantees.reminder_lead_time),
	                        offer_last_chance_promotion:String(policy_guarantees.offer_last_chance_promotion),
	                        type_discount:String(policy_guarantees.type_discount),
	                        discount_per_night:String(policy_guarantees.discount_per_night),
	                        min_lead_time:String(policy_guarantees.min_lead_time),
	                        availability_threshold:String(policy_guarantees.availability_threshold),
	                        estado:String(policy_guarantees.estado)
	                	};

	                	this.refEditorEnBoogingGuarantee.setContent(policy_guarantees.description_en);
                		this.refEditorEsBookingGuarantee.setContent(policy_guarantees.description_es);

						if (policy_guarantees.iddef_policy_guarantee_type == 2) {
							let policy_guarantee_antifrauds = policy_guarantees.policy_guarantee_antifrauds !== undefined 
															? policy_guarantees.policy_guarantee_antifrauds : [];
							let rulesAntiFraudOneNight={};
							let rulesAntiFraudMoreNight={};
							policy_guarantee_antifrauds.map(rulesAntiFrauds =>{
								//One night
								if(rulesAntiFrauds.guarantee_nights_type == 1){
									rulesAntiFraudOneNight.optionAmount= String(rulesAntiFrauds.guarantee_payment_type);
									rulesAntiFraudOneNight.fixAmoutFraud= rulesAntiFrauds.guarantee_payment_type == 1 ? rulesAntiFrauds.amount_payment : 0.0;
									rulesAntiFraudOneNight.numberDaysFraud= rulesAntiFrauds.guarantee_payment_type == 2 ? rulesAntiFrauds.nights_payment : 0;
									rulesAntiFraudOneNight.currency= rulesAntiFrauds.currency_code;
									rulesAntiFraudOneNight.iddef_policy_guarantee_antifraud = rulesAntiFrauds.iddef_policy_guarantee_antifraud;
								}

								//More nights
								if(rulesAntiFrauds.guarantee_nights_type == 2){
									rulesAntiFraudMoreNight.optionAmount= String(rulesAntiFrauds.guarantee_payment_type);
									rulesAntiFraudMoreNight.fixAmoutFraud= rulesAntiFrauds.guarantee_payment_type == 1 ? rulesAntiFrauds.amount_payment : 0.0;
									rulesAntiFraudMoreNight.numberDaysFraud= rulesAntiFrauds.guarantee_payment_type == 2 ? rulesAntiFrauds.nights_payment : 0;
									rulesAntiFraudMoreNight.currency= rulesAntiFrauds.currency_code;
									rulesAntiFraudMoreNight.iddef_policy_guarantee_antifraud = rulesAntiFrauds.iddef_policy_guarantee_antifraud;
								}

							});
							this.setState({
								hideFormFraud:false,
								dataRuleAntiFraud:{numberDaysFraud:policy_guarantees.nights_applied_antifraud !== undefined ? policy_guarantees.nights_applied_antifraud : 0},
								dataRuleFraudFixAmount: rulesAntiFraudOneNight,
								dataRuleFraudMoreDays:rulesAntiFraudMoreNight,
							});
							
						}else if (policy_guarantees.iddef_policy_guarantee_type > 2) {
	                		this.setState({
								hideFormPolicyGuaranteeDeposit:false,
								hideFormFraud:true
	                		});
	                	} else {
	                		this.setState({
								hideFormPolicyGuaranteeDeposit:true,
								hideFormFraud:true
	                		});
	                	}

	                	if (policy_guarantees.stay_dates_option > 1) {
	                		this.setState({
	                			hideDates:false
	                		});
	                	} else {
	                		this.setState({
	                			hideDates:true
	                		});
	                	}


	                	policy_guarantee_deposits = policy_guarantees.policy_guarantee_deposits;

	                	if (policy_guarantee_deposits.length > 0) {
	                		if (policy_guarantee_deposits.length == 1) {
	                			policy_guarantee_deposits = policy_guarantee_deposits[0];
	                			if (policy_guarantee_deposits.iddef_policy_rule == 1) {
	                				this.setState({
	                					disabledFixedAmount:false,
	                					disableIddefCurrency:true,
	                					disabledPercent:true,
	                					disabledOptionPercent:true,
	                					disabledNumberNightsPercent:true
	                				});
	                				data_policy_guarantee_deposits = {
	                					iddef_policy_guarantee_deposit:String(policy_guarantee_deposits.iddef_policy_guarantee_deposit),
	                					iddef_policy_guarantee:String(policy_guarantee_deposits.iddef_policy_guarantee),
	                					iddef_policy_rule:[String(policy_guarantee_deposits.iddef_policy_rule)],
	                					policy_rule:String(policy_guarantee_deposits.policy_rule),
	                					fixed_amount:String(policy_guarantee_deposits.fixed_amount),
	                					iddef_currency:String(policy.iddef_currency),
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
	                				data_policy_guarantee_deposits = {
	                					iddef_policy_guarantee_deposit:String(policy_guarantee_deposits.iddef_policy_guarantee_deposit),
	                					iddef_policy_guarantee:String(policy_guarantee_deposits.iddef_policy_guarantee),
	                					iddef_policy_rule:[String(policy_guarantee_deposits.iddef_policy_rule)],
	                					policy_rule:String(policy_guarantee_deposits.policy_rule),
	                					fixed_amount:"0",
	                					iddef_currency:String(policy.iddef_currency),
	                					percent:String(policy_guarantee_deposits.percent),
	                					option_percent:String(policy_guarantee_deposits.option_percent),
	                					number_nights_percent:String(policy_guarantee_deposits.number_nights_percent)
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
                				
                				data_policy_guarantee_deposits = {
                					iddef_policy_rule:["1","2"],
                					iddef_currency:String(policy.iddef_currency)
                				};

                				let ids = "";
                				let count = policy_guarantee_deposits.length;
                				policy_guarantee_deposits.map((pgd,key) => {
                					if(pgd.policy_rule == "Fixed amount") {
                						data_policy_guarantee_deposits.fixed_amount = String(pgd.fixed_amount);
                					} else if (pgd.policy_rule == "Percent") {
                						data_policy_guarantee_deposits.percent = String(pgd.percent);
                						data_policy_guarantee_deposits.option_percent = String(pgd.option_percent);
                						data_policy_guarantee_deposits.number_nights_percent = String(pgd.number_nights_percent);
                					} else {
                						data_policy_guarantee_deposits.fixed_amount = "0";
                						data_policy_guarantee_deposits.percent = "0";
                						data_policy_guarantee_deposits.option_percent = "0";
                						data_policy_guarantee_deposits.number_nights_percent = "0";
                					}
                					
                					if ((parseInt(key)+parseInt(1)) < count) {
                						ids += pgd.iddef_policy_guarantee_deposit+"|";
                					} else {
                						ids += pgd.iddef_policy_guarantee_deposit;
                					}
                				});
                				data_policy_guarantee_deposits.iddef_policy_guarantee_deposit = ids;
	                		}
	                	}
	                }
					
					this.refEditorEnBoogingGuarantee.setReadOnly(true);
					this.refEditorEsBookingGuarantee.setReadOnly(true);
					
					let data_form = Object.assign({},{policy:data_policy},{policy_guarantees:data_policy_guarantees},{policy_guarantee_deposits:data_policy_guarantee_deposits});
					
					this.setState({
						dataFormBookingGuarantee:data_form,
						showLoading:false
					});
					this.refModalBookingGuarantee.openModal();
                } else {
                	console.log("Data is Empty");
                }
			} else {
				console.error(error);
			}
		});
	}

	createBookingGuaranteePolicy()
	{
		window.scroll(0,0);
		this.setState({
			titleModal:"Add Booking Guarantee",
			disabledInput:false,
			hideTitleHead:true,
			hideTitleInput:false,
			hideTextOptionBooking:true,
			hideFormPolicyGuaranteeDeposit:true,
			hideDates:true,
			hideDiscount:true,
			hideFormFraud:true,
			dataRuleAntiFraud:{numberDaysFraud:0},
			dataRuleFraudFixAmount: {
				optionAmount:"1",
				fixAmoutFraud:0,
				numberDaysFraud:0,
				currency:'USD',
				iddef_policy_guarantee_antifraud:0
			},
			dataRuleFraudMoreDays:{
				optionAmount:"2",
				fixAmoutFraud:0,
				numberDaysFraud:0,
				currency:'USD',
				iddef_policy_guarantee_antifraud:0
			},
			dataFormBookingGuarantee:{
				policy:{
					iddef_policy_category:2,
					is_default:["0"],
					text_only_policy:['0'],
					option_selected:'1'
				},
				policy_guarantees:{
					iddef_policy_guarantee_type:"1",
					allow_hold_free:"1",
					hold_duration:"1",
					stay_dates_option:"1",
					reminder_lead_time:"12",
					offer_last_chance_promotion:"0",
					type_discount:"0",
					min_lead_time:"1",
					availability_threshold:"1",
					discount_per_night:"0",


				},
				policy_guarantee_deposits:{
					iddef_policy_rule:[],
					iddef_currency:'1',
					fixed_amount:"0",
					percent:"0",
					number_nights_percent:"0"
				}
			},
			btnAction:{
				label:"save",
				icon:"save",
				onClick:this.saveBookingGuaranteePolicy
			}
		},()=>{
			this.refEditorEnBoogingGuarantee.setContent("");
			this.refEditorEsBookingGuarantee.setContent("");
			this.refEditorEnBoogingGuarantee.setReadOnly(false);
			this.refEditorEsBookingGuarantee.setReadOnly(false);
			this.refModalBookingGuarantee.openModal();
		});		
	}

	editBookingGuaranteePolicy(iddef_policy)
	{
		window.scroll(0,0);
		this.setState({
			titleModal:"Edit Booking Guarantee",
			showLoading:true,
			disabledInput:false,
			hideTitleHead:true,
			hideTitleInput:false,
			hideTextOptionBooking:true,
			hideFormPolicyGuaranteeDeposit:true,
			hideFormFraud:true,
			hideDates:true,
			hideDiscount:true,
			btnAction:{
				label:"update",
				icon:"edit",
				onClick:() => {this.updateBookingGuaranteePolicy(iddef_policy)}
			}
		});
		CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/search/'+iddef_policy,(response,error) => {
			if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
                if ([response.data].length > 0) {
                	let policy = response.data;
                	let data_policy = {};

                	let policy_guarantees = [];
	                let data_policy_guarantees = {};

	                let policy_guarantee_deposits = [];
	                let data_policy_guarantee_deposits = {};

	                data_policy = {
	                    iddef_policy_category: String(policy.iddef_policy_category),
	                    iddef_policy: String(policy.iddef_policy),
	                    iddef_currency: String(policy.iddef_currency),
	                    policy_category: String(policy.policy_category),
	                    policy_code: String(policy.policy_code),
	                    currency_code: String(policy.currency_code),
	                    text_only_policy: [String(policy.text_only_policy)],
						option_selected: String(policy.option_selected),
						is_default: [String(policy.is_default)]
	                };

	                policy_guarantees = policy.policy_guarantees;
	                
	                if (policy_guarantees.length > 0) {
	                	policy_guarantees = policy_guarantees[0];
	                	
	                	let stay_dates = (policy_guarantees.stay_dates != null || policy_guarantees.stay_dates != {}) ? policy_guarantees.stay_dates : {end:"",start:""};

	                	data_policy_guarantees = {
	                		iddef_policy:String(policy_guarantees.iddef_policy),
	                        iddef_policy_guarantee:String(policy_guarantees.iddef_policy_guarantee),
	                        iddef_policy_guarantee_type:String(policy_guarantees.iddef_policy_guarantee_type),
	                        allow_hold_free:String(policy_guarantees.allow_hold_free),
	                        hold_duration:String(policy_guarantees.hold_duration),
	                        stay_dates_option:String(policy_guarantees.stay_dates_option),
	                        stay_dates:policy_guarantees.stay_dates,
	                        reminder_lead_time:String(policy_guarantees.reminder_lead_time),
	                        offer_last_chance_promotion:String(policy_guarantees.offer_last_chance_promotion),
	                        type_discount:String(policy_guarantees.type_discount),
	                        discount_per_night:String(policy_guarantees.discount_per_night),
	                        min_lead_time:String(policy_guarantees.min_lead_time),
	                        availability_threshold:String(policy_guarantees.availability_threshold),
	                        estado:String(policy_guarantees.estado)
	                	};

	                	this.refEditorEnBoogingGuarantee.setContent(policy_guarantees.description_en);
                		this.refEditorEsBookingGuarantee.setContent(policy_guarantees.description_es);

						if (policy_guarantees.iddef_policy_guarantee_type == 2) {
							let policy_guarantee_antifrauds = policy_guarantees.policy_guarantee_antifrauds !== undefined 
															? policy_guarantees.policy_guarantee_antifrauds : [];
							let rulesAntiFraudOneNight={};
							let rulesAntiFraudMoreNight={};
							policy_guarantee_antifrauds.map(rulesAntiFrauds =>{
								//One night
								if(rulesAntiFrauds.guarantee_nights_type == 1){
									rulesAntiFraudOneNight.optionAmount= String(rulesAntiFrauds.guarantee_payment_type);
									rulesAntiFraudOneNight.fixAmoutFraud= rulesAntiFrauds.guarantee_payment_type == 1 ? rulesAntiFrauds.amount_payment : 0.0;
									rulesAntiFraudOneNight.numberDaysFraud= rulesAntiFrauds.guarantee_payment_type == 2 ? rulesAntiFrauds.nights_payment : 0;
									rulesAntiFraudOneNight.currency= rulesAntiFrauds.currency_code;
									rulesAntiFraudOneNight.iddef_policy_guarantee_antifraud = rulesAntiFrauds.iddef_policy_guarantee_antifraud;
								}

								//More nights
								if(rulesAntiFrauds.guarantee_nights_type == 2){
									rulesAntiFraudMoreNight.optionAmount= String(rulesAntiFrauds.guarantee_payment_type);
									rulesAntiFraudMoreNight.fixAmoutFraud= rulesAntiFrauds.guarantee_payment_type == 1 ? rulesAntiFrauds.amount_payment : 0.0;
									rulesAntiFraudMoreNight.numberDaysFraud= rulesAntiFrauds.guarantee_payment_type == 2 ? rulesAntiFrauds.nights_payment : 0;
									rulesAntiFraudMoreNight.currency= rulesAntiFrauds.currency_code;
									rulesAntiFraudMoreNight.iddef_policy_guarantee_antifraud = rulesAntiFrauds.iddef_policy_guarantee_antifraud;
								}

							});
							this.setState({
								hideFormFraud:false,
								dataRuleAntiFraud:{numberDaysFraud:policy_guarantees.nights_applied_antifraud !== undefined ? policy_guarantees.nights_applied_antifraud : 0},
								dataRuleFraudFixAmount: rulesAntiFraudOneNight,
								dataRuleFraudMoreDays:rulesAntiFraudMoreNight,
							});
						}else if (policy_guarantees.iddef_policy_guarantee_type > 2) {
	                		this.setState({
								hideFormPolicyGuaranteeDeposit:false,
								hideFormFraud:true,
	                		});
	                	} else {
	                		this.setState({
								hideFormPolicyGuaranteeDeposit:true,
								hideFormFraud:true,
	                		});
	                	}

	                	if (policy_guarantees.stay_dates_option > 1) {
	                		this.setState({
	                			hideDates:false
	                		});
	                	} else {
	                		this.setState({
	                			hideDates:true
	                		});
	                	}

	                	if (policy_guarantees.offer_last_chance_promotion != 1) {
	                		this.setState({
	                			hideDiscount:true
	                		});
	                	} else {
	                		this.setState({
	                			hideDiscount:false
	                		});
	                	}

	                	policy_guarantee_deposits = policy_guarantees.policy_guarantee_deposits;

	                	if (policy_guarantee_deposits.length > 0) {
	                		if (policy_guarantee_deposits.length == 1) {
	                			policy_guarantee_deposits = policy_guarantee_deposits[0];
	                			if (policy_guarantee_deposits.iddef_policy_rule == 1) {
	                				this.setState({
	                					disabledFixedAmount:false,
	                					disableIddefCurrency:true,
	                					disabledPercent:true,
	                					disabledOptionPercent:true,
	                					disabledNumberNightsPercent:true
	                				});
	                				data_policy_guarantee_deposits = {
	                					iddef_policy_guarantee_deposit:String(policy_guarantee_deposits.iddef_policy_guarantee_deposit),
	                					iddef_policy_guarantee:String(policy_guarantees.iddef_policy_guarantee),
	                					iddef_policy_rule:[String(policy_guarantee_deposits.iddef_policy_rule)],
	                					policy_rule:String(policy_guarantee_deposits.policy_rule),
	                					fixed_amount:String(policy_guarantee_deposits.fixed_amount),
	                					iddef_currency:String(policy.iddef_currency),
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
	                				data_policy_guarantee_deposits = {
	                					iddef_policy_guarantee_deposit:String(policy_guarantee_deposits.iddef_policy_guarantee_deposit),
	                					iddef_policy_guarantee:String(policy_guarantees.iddef_policy_guarantee),
	                					iddef_policy_rule:[String(policy_guarantee_deposits.iddef_policy_rule)],
	                					policy_rule:String(policy_guarantee_deposits.policy_rule),
	                					fixed_amount:"0",
	                					iddef_currency:String(policy.iddef_currency),
	                					percent:String(policy_guarantee_deposits.percent),
	                					option_percent:String(policy_guarantee_deposits.option_percent),
	                					number_nights_percent:String(policy_guarantee_deposits.number_nights_percent)
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
                				
                				data_policy_guarantee_deposits = {
                					iddef_policy_rule:["1","2"],
                					iddef_currency:String(policy.iddef_currency)
                				};

                				let ids = "";
                				let count = policy_guarantee_deposits.length;
                				policy_guarantee_deposits.map((pgd,key) => {
                					if(pgd.policy_rule == "Fixed amount") {
                						data_policy_guarantee_deposits.fixed_amount = String(pgd.fixed_amount);
                					} else if (pgd.policy_rule == "Percent") {
                						data_policy_guarantee_deposits.percent = String(pgd.percent);
                						data_policy_guarantee_deposits.option_percent = String(pgd.option_percent);
                						data_policy_guarantee_deposits.number_nights_percent = String(pgd.number_nights_percent);
                					} else {
                						data_policy_guarantee_deposits.fixed_amount = "0";
                						data_policy_guarantee_deposits.percent = "0";
                						data_policy_guarantee_deposits.option_percent = "0";
                						data_policy_guarantee_deposits.number_nights_percent = "0";
                					}
                					
                					if ((parseInt(key)+parseInt(1)) < count) {
                						ids += pgd.iddef_policy_guarantee_deposit+"|";
                					} else {
                						ids += pgd.iddef_policy_guarantee_deposit;
                					}
                				});
                				data_policy_guarantee_deposits.iddef_policy_guarantee_deposit = ids;
	                		}
	                	}
	                }
					
					this.refEditorEnBoogingGuarantee.setReadOnly(false);
					this.refEditorEsBookingGuarantee.setReadOnly(false);
					
					let data_form = Object.assign({},{policy:data_policy},{policy_guarantees:data_policy_guarantees},{policy_guarantee_deposits:data_policy_guarantee_deposits});
					
					this.setState({
						dataFormBookingGuarantee:data_form,
						showLoading:false
					});
					this.refModalBookingGuarantee.openModal();
                } else {
                	console.log("Empty Data");
                }
			} else {
				console.error(error);
			}
		});
	}

	setDefaultPolicy(iddef_policy)
    {
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+"/api/policies/set_default/"+iddef_policy+"/2",(response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
				MComponentes.toast('SUCCESS');
    			this.getDataPoliciesByCategory();
    			return true;
    		} else {
				MComponentes.toast('ERRR DEFAULT POLICY');
    			console.error(error);
    			return false;
    		}
    	});
    }

	saveBookingGuaranteePolicy()
	{
		this.setState({
			showLoading:true
		});
		let policy = this.refFormBookingGuaranteePolicy.getData();
		let policy_guarantees_p1 = this.refFormBookingGuarantee_policyGuarantees_guaranteeType.getData();
		let policy_guarantees_p2 = this.refFormBookingGuarantee_policyGuarantees_onHoldConfiguration.getData();
		let policy_guarantee_deposits = this.refFormBookingGuaranteePolicyGuaranteeDeposit.getData();
		let ruleAntiFraud = this.refRuleAntiFraud.getData();
		let frmFraudFixAmount = this.refFormFraudFixAmount.getData();
		let frmFraudMoreDays = this.refFormFraudMoreDays.getData();

		if (policy.required.count == 0 && policy_guarantees_p2.required.count == 0 && 
			policy_guarantee_deposits.required.count == 0 &&
			ruleAntiFraud.required.count == 0 &&
			frmFraudFixAmount.required.count == 0 &&
			frmFraudMoreDays.required.count == 0) {
			let policy_code = (policy.values.policy_code).replace(/ /g,"_");
			let is_default = policy.values.is_default.length != 0 ? "1" : "0";
			let text_only_policy = policy.values.text_only_policy.length == 1 ? 1 : 0;
			let createPolicy = {
				"iddef_policy_category": 2,
				"iddef_currency": policy_guarantee_deposits.values.iddef_currency,
				"policy_code": policy_code,
				"is_default": is_default,
				"text_only_policy": text_only_policy,
				"option_selected": policy.values.option_selected,
				"estado": 1
			};

			CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_create",createPolicy,(response,error) => {
				if (response.status == 403) {
					MComponentes.toast('YOU ARE NOT AUTHORIZED');
					this.setState({ showLoading: false });
					return
				}
				if (!error) {
					MComponentes.toast('SUCCESS CREATE POLICY');
					let resp_policy = response.data;
					
					let type_discount = policy_guarantees_p2.values.type_discount != "" ? policy_guarantees_p2.values.type_discount : "0";
					let dates = this.state.hideDates ? {start:"",end:""} : {start:policy_guarantees_p2.values.start_date,end:policy_guarantees_p2.values.end_date} 

					let rulesAntiFraud = [];
					rulesAntiFraud.push(
						{
							iddef_policy_guarantee_antifraud: 0,
							guarantee_nights_type:1,
							guarantee_payment_type: parseInt(frmFraudFixAmount.values.optionAmount),
							nights_payment: parseInt(frmFraudFixAmount.values.optionAmount) == 2 ? frmFraudFixAmount.values.numberDaysFraud : 0,
							amount_payment: parseInt(frmFraudFixAmount.values.optionAmount) == 1 ? frmFraudFixAmount.values.fixAmoutFraud : 0.0,
							currency_code: this.state.dataRuleFraudFixAmount.currency ? this.state.dataRuleFraudFixAmount.currency :"USD", 
							estado: 1
						},
						{
							iddef_policy_guarantee_antifraud: 0,
							guarantee_nights_type: 2,
							guarantee_payment_type: parseInt(frmFraudMoreDays.values.optionAmount),
							nights_payment: parseInt(frmFraudMoreDays.values.optionAmount) == 2 ? frmFraudMoreDays.values.numberDaysFraud : 0,
							amount_payment: parseInt(frmFraudMoreDays.values.optionAmount) == 1 ? frmFraudMoreDays.values.fixAmoutFraud : 0.0,
							currency_code: this.state.dataRuleFraudMoreDays.currency ?  this.state.dataRuleFraudMoreDays.currency : "USD",
							estado: 1
						},
					);

					let createBookingGuarantee = {
						"iddef_policy": resp_policy.iddef_policy,
						"iddef_policy_guarantee_type": String(policy_guarantees_p1.values.iddef_policy_guarantee_type),
						"allow_hold_free": String(policy_guarantees_p2.values.allow_hold_free),
						"hold_duration": String(policy_guarantees_p2.values.hold_duration),
						"stay_dates_option": String(policy_guarantees_p2.values.stay_dates_option),
						"stay_dates": dates,
						"reminder_lead_time": String(policy_guarantees_p2.values.reminder_lead_time),
						"offer_last_chance_promotion": String(policy_guarantees_p2.values.offer_last_chance_promotion),
						"type_discount": type_discount,
						"availability_threshold": String(policy_guarantees_p2.values.availability_threshold),
						"discount_per_night": String(policy_guarantees_p2.values.discount_per_night),
						"min_lead_time": String(policy_guarantees_p2.values.min_lead_time),
						"description_en": this.refEditorEnBoogingGuarantee.getContent(),
						"description_es": this.refEditorEsBookingGuarantee.getContent(),
						nights_applied_antifraud:parseInt(ruleAntiFraud.values.numberDaysFraud),
						policy_guarantee_antifrauds: rulesAntiFraud
					};
					// console.log('createBookingGuarantee ==> ',JSON.stringify(createBookingGuarantee));
					CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_guarantees/create",createBookingGuarantee,(response,error) => {
						if (response.status == 403) {
							MComponentes.toast('YOU ARE NOT AUTHORIZED');
							this.setState({ showLoading: false });
							return
						}
						if (!error) {
							MComponentes.toast('SUCCESS CREATE BOOKING GUARNATEE');
							let resp_booking_guarantee = response.data;
							if (policy_guarantees_p1.values.iddef_policy_guarantee_type > 2) {
								if (policy_guarantee_deposits.values.iddef_policy_rule.length > 0 || policy_guarantee_deposits.values.iddef_policy_rule.length == "") {
									let createBookingGuaranteeDeposit = {};
									let count_deposit = policy_guarantee_deposits.values.iddef_policy_rule == "" ? 0 : policy_guarantee_deposits.values.iddef_policy_rule.length;
									for (let i = 1; i <= count_deposit; i++) {
										let posit = (parseInt(i)-parseInt(1));
	                					if (policy_guarantee_deposits.values.iddef_policy_rule[posit] == 1) {
	                						createBookingGuaranteeDeposit = {
												"iddef_policy_guarantee": resp_booking_guarantee.iddef_policy_guarantee,
												"iddef_policy_rule": policy_guarantee_deposits.values.iddef_policy_rule[posit],
												"fixed_amount": policy_guarantee_deposits.values.fixed_amount,
												"percent": "0.00",
												"option_percent": "0",
												"number_nights_percent": "0",
												"estado": "1"
	                						}
	                					} else {
	                						createBookingGuaranteeDeposit = {
												"iddef_policy_guarantee": resp_booking_guarantee.iddef_policy_guarantee,
												"iddef_policy_rule": policy_guarantee_deposits.values.iddef_policy_rule[posit],
												"fixed_amount": "0",	
												"percent": policy_guarantee_deposits.values.percent,
												"option_percent": policy_guarantee_deposits.values.option_percent != "1" ? "0" : "1",
												"number_nights_percent": policy_guarantee_deposits.values.number_nights_percent,
												"estado": "1"
	                						}
	                					}
	                					
	                					CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_guarantee_deposits/create",createBookingGuaranteeDeposit,(response, error) => {
	                						if (response.status == 403) {
												MComponentes.toast('YOU ARE NOT AUTHORIZED');
												this.setState({ showLoading: false });
												return
											}
											if (!error) {
												this.refModalBookingGuarantee.closeModal();
												MComponentes.toast('SUCCESS GUARANTEE DEPOSITS');
											} else {
												MComponentes.toast('ERROR GUARANTEE DEPOSITS');
												console.error(error);
												this.setState({
													showLoading:false
												});
	                						}
	                					});
									}
									this.getDataPoliciesByCategory();
									this.setState({
										showLoading:false
									});
									this.refModalBookingGuarantee.closeModal();
								}
							} else {
								this.getDataPoliciesByCategory();
								this.setState({
									showLoading: false
								});
								this.refModalBookingGuarantee.closeModal();
							}
							let update_default = {};
							if (resp_policy.is_default == 1) {
								CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policies/set_default/" + resp_policy.iddef_policy + "/2", {}, (response, error) => {
									if (response.status == 403) {
										MComponentes.toast('YOU ARE NOT AUTHORIZED');
										this.setState({ showLoading: false });
										return
									}
									if (!error) {
										this.getDataPoliciesByCategory();
										update_default = response;
										MComponentes.toast('SUCCESS UPDATE DEFAULT');
									} else {
										MComponentes.toast('ERROR UPDATE DEFAULT');
									}
								});
							}else{
								console.log("no default")
							}
						} else {
							console.error(error);
						}
					});
				} else {
					console.error(error);
				}
			});

		} else {
			MComponentes.toast('Empty inputs');
			console.log("empty inputs");
			this.setState({
				showLoading:false
			});
		}
	}

    updateBookingGuaranteePolicy(iddef_policy)
    {
    	this.setState({
			showLoading:true
		});
		let policy = this.refFormBookingGuaranteePolicy.getData();
		let policy_guarantees_p1 = this.refFormBookingGuarantee_policyGuarantees_guaranteeType.getData();
		let policy_guarantees_p2 = this.refFormBookingGuarantee_policyGuarantees_onHoldConfiguration.getData();
		let policy_guarantee_deposits = this.refFormBookingGuaranteePolicyGuaranteeDeposit.getData();
		let ruleAntiFraud = this.refRuleAntiFraud.getData();
		let frmFraudFixAmount = this.refFormFraudFixAmount.getData();
		let frmFraudMoreDays = this.refFormFraudMoreDays.getData();
		
		if (policy.required.count == 0 && 
			policy_guarantees_p1.required.count == 0 && 
			policy_guarantees_p2.required.count == 0 &&
			ruleAntiFraud.required.count == 0 &&
			frmFraudFixAmount.required.count == 0 &&
			frmFraudMoreDays.required.count == 0 ) 
			{
			let policy_code = (policy.values.policy_code).replace(/ /g,"_");
			let is_default = policy.values.is_default.length != 0 ? "1" : "0";
			let text_only_policy = policy.values.text_only_policy.length == 1 ? 1 : 0;
			let updatePolicy = {
				"iddef_policy_category": 2,
				"iddef_currency": policy.values.iddef_currency,
				"policy_code": policy_code,
				"is_default": is_default,
				"text_only_policy": text_only_policy,
				"option_selected": policy.values.option_selected,
				"estado": "1"
			};
			
			CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_update/"+iddef_policy,updatePolicy,(response,error) => {
				if (response.status == 403) {
					MComponentes.toast('YOU ARE NOT AUTHORIZED');
					
					this.setState({ showLoading: false });
					return
				}
				if (!error) {
					MComponentes.toast('UPDATE POLICY');
					let resp_policy = response.data;
					let iddef_policy_guarantee = policy_guarantees_p1.values.iddef_policy_guarantee;
					let type_discount = policy_guarantees_p2.values.type_discount != "" ? policy_guarantees_p2.values.type_discount : "0";
					let dates = this.state.hideDates ? {start:"",end:""} : {start:policy_guarantees_p2.values.start_date,end:policy_guarantees_p2.values.end_date} 
				
					let rulesAntiFraud = [];
					rulesAntiFraud.push(
						{
							iddef_policy_guarantee_antifraud: frmFraudFixAmount.values.iddef_policy_guarantee_antifraud !== "" ? parseInt(frmFraudFixAmount.values.iddef_policy_guarantee_antifraud):0,
							guarantee_nights_type:1,
							guarantee_payment_type: parseInt(frmFraudFixAmount.values.optionAmount),
							nights_payment: parseInt(frmFraudFixAmount.values.optionAmount) == 2 ? frmFraudFixAmount.values.numberDaysFraud : 0,
							amount_payment: parseInt(frmFraudFixAmount.values.optionAmount) == 1 ? frmFraudFixAmount.values.fixAmoutFraud : 0.0,
							currency_code: this.state.dataRuleFraudFixAmount.currency ? this.state.dataRuleFraudFixAmount.currency :"USD", 
							estado: 1
						},
						{
							iddef_policy_guarantee_antifraud: frmFraudMoreDays.values.iddef_policy_guarantee_antifraud !== "" ? parseInt(frmFraudMoreDays.values.iddef_policy_guarantee_antifraud) :0,
							guarantee_nights_type: 2,
							guarantee_payment_type: parseInt(frmFraudMoreDays.values.optionAmount),
							nights_payment: parseInt(frmFraudMoreDays.values.optionAmount) == 2 ? frmFraudMoreDays.values.numberDaysFraud : 0,
							amount_payment: parseInt(frmFraudMoreDays.values.optionAmount) == 1 ? frmFraudMoreDays.values.fixAmoutFraud : 0.0,
							currency_code: this.state.dataRuleFraudMoreDays.currency ? this.state.dataRuleFraudMoreDays.currency : "USD",
							estado: 1
						},
					)
					let updateBookingGuarantee = {
						"iddef_policy_guarantee_type": String(policy_guarantees_p1.values.iddef_policy_guarantee_type),
						"allow_hold_free": String(policy_guarantees_p2.values.allow_hold_free),
						"hold_duration": String(policy_guarantees_p2.values.hold_duration),
						"stay_dates_option": String(policy_guarantees_p2.values.stay_dates_option),
						"stay_dates": dates,
						"reminder_lead_time": String(policy_guarantees_p2.values.reminder_lead_time),
						"offer_last_chance_promotion": String(policy_guarantees_p2.values.offer_last_chance_promotion),
						"type_discount": type_discount,
						"availability_threshold": String(policy_guarantees_p2.values.availability_threshold),
						"discount_per_night": String(policy_guarantees_p2.values.discount_per_night),
						"min_lead_time": String(policy_guarantees_p2.values.min_lead_time),
						"description_en": this.refEditorEnBoogingGuarantee.getContent(),
						"description_es": this.refEditorEsBookingGuarantee.getContent(),
						"estado":"1",
						nights_applied_antifraud:ruleAntiFraud.values.numberDaysFraud !== "" ? parseInt(ruleAntiFraud.values.numberDaysFraud) : 0,
						policy_guarantee_antifrauds: ruleAntiFraud.values.numberDaysFraud !== "" ? rulesAntiFraud:[]
					};
					// console.log('updateBookingGuarantee ==> ',JSON.stringify(updateBookingGuarantee));
					CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy_guarantees/update/"+iddef_policy_guarantee,updateBookingGuarantee,(response,error) => {
						if (response.status == 403) {
							MComponentes.toast('YOU ARE NOT AUTHORIZED');
							this.setState({ showLoading: false });
							return
						}
						if (!error) {
							if(!response.Error){
								MComponentes.toast('UPDATE BOOKING GUARNATEE');
								let resp_booking_guarantee = response.data;
								let iddef_policy_guarantee = resp_booking_guarantee.iddef_policy_guarantee;
								
								if (policy_guarantees_p1.values.iddef_policy_guarantee_type > 2) {
									if (policy_guarantee_deposits.values.iddef_policy_rule.length > 0 || policy_guarantee_deposits.values.iddef_policy_rule.length == "") {
										let updateBookingGuaranteeDeposit = [];
										let count_deposit = policy_guarantee_deposits.values.iddef_policy_rule == "" ? 0 : policy_guarantee_deposits.values.iddef_policy_rule.length;
										for (let i = 1; i <= count_deposit; i++) {
											let updateDeposit = {};
											let index = (parseInt(i)-parseInt(1));
											if (policy_guarantee_deposits.values.iddef_policy_rule[index] == 1) {
												updateDeposit = {
													"iddef_policy_rule": policy_guarantee_deposits.values.iddef_policy_rule[index],
													"policy_rule": "Fixed amount",
													"fixed_amount": policy_guarantee_deposits.values.fixed_amount,
													"percent": "0.00",
													"option_percent": "0",
													"number_nights_percent": "0",
													"estado": "1"
												}
												updateBookingGuaranteeDeposit.push(updateDeposit);
											} else {
												let nights_percent = (policy_guarantee_deposits.values.number_nights_percent != '')? policy_guarantee_deposits.values.number_nights_percent : '0';

												updateDeposit = {
													"iddef_policy_rule": policy_guarantee_deposits.values.iddef_policy_rule[index],
													"policy_rule": "Percent",
													"fixed_amount": "0",	
													"percent": policy_guarantee_deposits.values.percent,
													"option_percent": policy_guarantee_deposits.values.option_percent != "1" ? "0" : "1",
													"number_nights_percent": nights_percent,
													"estado": "1"
												}
												updateBookingGuaranteeDeposit.push(updateDeposit);
											}
										}

										CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy_guarantee_deposits/update_by_guarantee/"+iddef_policy_guarantee,updateBookingGuaranteeDeposit,(response, error) => {
											if (response.status == 403) {
												MComponentes.toast('YOU ARE NOT AUTHORIZED');
												this.setState({ showLoading: false });
												return
											}
											if (!error) {
												MComponentes.toast("UPDATE SUCCESS");
												this.refModalBookingGuarantee.closeModal();
												this.setState({ showLoading: false });
												if (resp_policy.is_default == 1) {
													CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine') + "/api/policies/set_default/" + iddef_policy + "/2", {}, (response, error) => {
														if (error) {
															console.error("Error updating default policy", error);
															MComponentes.toast("Error updating default policy");
															this.setState({ showLoading: false });
														} else {
															this.getDataPoliciesByCategory();
															MComponentes.toast("Success updating default policy");
															this.setState({ showLoading: false });
														}
													});
												}
											} else {
												console.error(error);
												this.setState({
													showLoading: false
												});
											}
										});
									}
								} else {
									this.getDataPoliciesByCategory();
									this.setState({
										showLoading:false
									});
									this.refModalBookingGuarantee.closeModal();
								}
							}else{
								MComponentes.toast("Error, policie not save");
								this.setState({
									showLoading:false
								});
							}							
						} else {
							console.error(error);
						}
					});
				} else {
					console.error(error);
				}
			});
		} else {
			MComponentes.toast('Empty inputs');
			console.log("empty inputs");
			this.setState({
				showLoading:false
			});
		}
    }

    deleteConfirmMessage(iddef_policy)
    {
    	this.setState({
    		hideNotification:false,
    		notificationBtnCancel:true,
    		notificationIcon:'warning',
    		notificationBody:'Do you want delete this policy?',
    		notificationDone:() => {this.deleteBookingGuaranteePolicy(iddef_policy)},
    		notificationCancel:this.closeNotification
    	});
    }

    closeNotification()
    {
    	this.setState({
    		hideNotification:true,
    		notificationBtnCancel:false,
    		notificationIcon:'',
    		notificationBody:'',
    		notificationDone:() => {},
    		notificationCancel:() => {}
    	});
    }

    deleteBookingGuaranteePolicy(iddef_policy)
    {
    	this.closeNotification();
    	this.setState({
    		showLoading:true
    	});
    	CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/delete/"+iddef_policy,{}, (response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			this.getDataPoliciesByCategory();
    		} else {
    			console.error(error);
    		}
    	});
	}
	
	onChangeRule(e){
        let form = JSON.parse(JSON.stringify(this.state.dataFormBookingGuarantee));
        let dataRef = this.refFormBookingGuaranteePolicyGuaranteeDeposit.getData().values

        if (e.name == "iddef_policy_rule") {
            form.policy_guarantee_deposits[e.name] = e.values
            form.policy_guarantee_deposits["fixed_amount"] = dataRef.fixed_amount
            form.policy_guarantee_deposits["iddef_currency"] = dataRef.iddef_currency
            form.policy_guarantee_deposits["option_percent"] = dataRef.option_percent
            form.policy_guarantee_deposits["number_nights_percent"] = dataRef.number_nights_percent

        }
        if (e.name == "option_percent") {
            form.policy_guarantee_deposits[e.name] = e.value
            form.policy_guarantee_deposits["iddef_policy_rule"] = dataRef.iddef_policy_rule
            form.policy_guarantee_deposits["fixed_amount"] = dataRef.fixed_amount
            form.policy_guarantee_deposits["iddef_currency"] = dataRef.iddef_currency
            form.policy_guarantee_deposits["percent"] = dataRef.percent
            form.policy_guarantee_deposits["number_nights_percent"] = dataRef.number_nights_percent
		}
		this.setState({ dataFormBookingGuarantee: form })
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

    setConfigInputs(e)
    {
    	let policy = this.refFormBookingGuaranteePolicy.getData();
		let policy_guarantees_p1 = this.refFormBookingGuarantee_policyGuarantees_guaranteeType.getData();
		let policy_guarantees_p2 = this.refFormBookingGuarantee_policyGuarantees_onHoldConfiguration.getData();
		let policy_guarantee_deposits = this.refFormBookingGuaranteePolicyGuaranteeDeposit.getData();

		if (e.name == "option_selected") {
			if (e.value > 1) {
				this.setState({
					hideTextOptionBooking:false
				});
			} else {
				this.setState({
					hideTextOptionBooking:true
				});
			}
			policy.values.option_selected = String(e.value);
		} else if (e.name == "iddef_policy_guarantee_type") {
			if (e.value == 2) {
				this.setState({
					hideFormFraud:false
				});
			}else if (e.value > 2) {
				this.setState({
					hideFormPolicyGuaranteeDeposit:false,
					hideFormFraud:true
				});
			} else {
				this.setState({
					hideFormPolicyGuaranteeDeposit:true,
					hideFormFraud:true
				});
			}
			policy_guarantees_p1.values.iddef_policy_guarantee_type = String(e.value);
		} else if (e.name == "allow_hold_free") {
			if (e.value == 1) {
				this.setState({
					hideHoldDuration:false,
					hideStayDateOption:false,
					hideDates:true,
					hideReminderLeadTime:false,
					hideOfferLastChancePromotion:false,
					hideDiscount:true,
					hideLeadTime:false,
					hideAvalabilityThreshold:false
				});
			} else {
				this.setState({
					hideHoldDuration:true,
					hideStayDateOption:true,
					hideDates:true,
					hideReminderLeadTime:true,
					hideOfferLastChancePromotion:true,
					hideDiscount:true,
					hideLeadTime:true,
					hideAvalabilityThreshold:true
				});
			}
			policy_guarantees_p2.values.allow_hold_free = String(e.value);
		} else if (e.name == "iddef_policy_rule") {
			if (e.values.length > 0) {
	    		if(e.values.length == 1) {
	    			if (e.values[0] == 1) {
	    				this.setState({
	    					disabledFixedAmount:false,
							disableIddefCurrency:true,
							disabledPercent:true,
							disabledOptionPercent:true,
							disabledNumberNightsPercent:true
	    				});
	    				
	    			} else {
	    				this.setState({
	    					disabledFixedAmount:true,
							disableIddefCurrency:true,
							disabledPercent:false,
							disabledOptionPercent:false,
							disabledNumberNightsPercent:false
	    				});
	    			}
	    		} else {
	    			this.setState({
	    				disabledFixedAmount:false,
						disableIddefCurrency:true,
						disabledPercent:false,
						disabledOptionPercent:false,
						disabledNumberNightsPercent:false
	    			});
	    		}
	    	} else {
	    		this.setState({
					disabledFixedAmount:true,
					disableIddefCurrency:true,
					disabledPercent:true,
					disabledOptionPercent:true,
					disabledNumberNightsPercent:true
				});
	    	}
	    	policy_guarantee_deposits.values.iddef_policy_rule = e.values;
		} else if (e.name == "stay_dates_option") {
			if (e.value > 1) {
				this.setState({
					hideDates:false
				});
			} else {
				this.setState({
					hideDates:true
				});
			}
			policy_guarantees_p2.values.stay_dates_option = String(e.value);
		} else if (e.name == "offer_last_chance_promotion") {
			if (e.value == 1) {
				this.setState({
					hideDiscount:false
				});
			} else {
				this.setState({
					hideDiscount:true
				});
			}
			policy_guarantees_p2.values.offer_last_chance_promotion = String(e.value);
		}

		let policy_guarantees = {
			iddef_policy_guarantee:policy_guarantees_p1.values.iddef_policy_guarantee,
			iddef_policy_guarantee_type: policy_guarantees_p1.values.iddef_policy_guarantee_type,
			allow_hold_free: policy_guarantees_p2.values.allow_hold_free,
			hold_duration: policy_guarantees_p2.values.hold_duration,
			stay_dates_option: policy_guarantees_p2.values.stay_dates_option,
			stay_dates: policy_guarantees_p2.values.stay_dates, 
			reminder_lead_time: policy_guarantees_p2.values.reminder_lead_time,
			offer_last_chance_promotion: policy_guarantees_p2.values.offer_last_chance_promotion,
			type_discount: policy_guarantees_p2.values.type_discount,
			discount_per_night: policy_guarantees_p2.values.discount_per_night,
			min_lead_time: policy_guarantees_p2.values.min_lead_time,
			availability_threshold: policy_guarantees_p2.values.availability_threshold
		}

		this.setState({
			dataFormBookingGuarantee:{
				policy:policy.values,
				policy_guarantees:policy_guarantees,
				policy_guarantee_deposits:policy_guarantee_deposits.values
			}
		});
	}
	
	deleteBookingGuaranteePolicy(e,data) {
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
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/set_default/"+iddef_policy+"/2",{},(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
				MComponentes.toast('SUCCESS');
                this.getDataPoliciesByCategory();
                this.refDefaultConfirm.getInstance().close();
            } else {
                console.log(error);
                MComponentes.toast("ERROR DEFAULT POLICY");
            }
            
        });
	}
	
	onChangeRuleFraud(e,type){
		switch(type){
			case "oneDay":
						let formFixAmount = JSON.parse(JSON.stringify(this.state.dataRuleFraudFixAmount));
						formFixAmount.optionAmount= e.value;
						this.setState({dataRuleFraudFixAmount:formFixAmount});
				break;
			case "moreDay":
						let formMoreDays = JSON.parse(JSON.stringify(this.state.dataRuleFraudMoreDays));
						formMoreDays.optionAmount= e.value;
						this.setState({dataRuleFraudMoreDays:formMoreDays});
				break;
			default:
				break;
		}		
		
	}

    render() {
    	return (
    		<div className="row">
    			<CleverLoading show={this.state.showLoading} />
				<ConfirmDialog
					onRef={confirm => this.refConfirm = confirm}
					yesButton={{click:(e) => this.deletePolicyConfirm()}}
				/>
				<ConfirmDialog
                    onRef={defaultconfirm => this.refDefaultConfirm = defaultconfirm}
                    yesButton={{click:(e) => this.setDefaultConfirm()}}
                />
    			<CleverNotification 
    				id="booking_guarantee_notification"
                	hidden={this.state.hideNotification}
    				icon={this.state.notificationIcon}
                	body={this.state.notificationBody}
                	onClickDone={this.state.notificationDone}
                	btnCancel={this.state.notificationBtnCancel}
                	onClickCancel={this.state.notificationCancel}
                />
    			{/*<CleverButton size={'col s12 m2 l3'} icon={'add'} label={'Booking Policy'} fullSize={true} onClick={this.createBookingGuaranteePolicy}/>*/}
    			<br/>
    			<GridView idTable='table-guarantee-gridview'
	                onRef={ref => (this.refTableBookingGuarantee = ref)}
	                filter={false}
	                serializeRows={false}
	                columns={[
	                    {attribute: 'policy_code',alias: 'Policy code'},
	                    {attribute: '',alias: 'Default policy',value:(data) => {
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
	                    {attribute: '',alias: 'Actions',value: (data, index) => {
	                        return(
	                            <div>
	                                <a id={'detail_'+data.iddef_policy} onClick={() => this.detailsBookingGuaranteePolicy(data.iddef_policy)} title='View Policies'><i className='material-icons left'>visibility</i></a> 
	                                <a id={'edit_'+data.iddef_policy} onClick={() => this.editBookingGuaranteePolicy(data.iddef_policy)} title='Edit Policies'><i className='material-icons left'>mode_edit</i></a>
	                                {
										data.estado == 1 ?
                                            <a onClick={(e) => this.deleteBookingGuaranteePolicy(e,data)} title='Disable Policy'><i className='material-icons left'  >toggle_on</i></a>
                                        :
                                            <a onClick={(e) => this.deleteBookingGuaranteePolicy(e,data)} title='Enable Policy'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
									}
	                            </div>
	                        );
	                    }}
	                ]}
	            />
	            <br/>
    			<Modal
                    id={"modalBookingGuarantee"}
                    title={this.state.titleModal}
                    size={"full"}
                    ref={ref => this.refModalBookingGuarantee = ref}
                    btnAction={this.state.btnAction}
                >
                	<CleverForm 
                        id="form_bookingGuaranteePolicy"
                        ref={ref => this.refFormBookingGuaranteePolicy = ref}
                        data={this.state.dataFormBookingGuarantee.policy}
                        forms={[
                            {
                                size:'col s12 m12 l12',
                                inputs:[
                                    {row:[
                                        {type:'number',name:'iddef_policy_category',hidden:true},
                                        {type:'number',name:'iddef_policy',hidden:true},
                                        {type:'number',name:'iddef_currency',hidden:true}

                                    ]}
                                ]
                            },
                            {
                                size: 'col s12 m12 l12',
                                inputs:[
                                    {row:[
                                        {type:'component',component: () => {
                                            return (
                                                <h4 className={this.state.hideTitleHead == true ? 'hide' : ''} >{this.state.dataFormBookingGuarantee.policy.policy_code}</h4>
                                            );
                                        }},
                                        {type:'text',size:'s12 m12 l6',label:'Policy Name',name:'policy_code',required:true,hidden:this.state.hideTitleInput, characters:true}
                                    ]}
                                ]
                            },
                            {
                                size: 'col s12 m12 l12',
                                inputs: [
                                    {row:[
										{type:'checkbox',size:'col s12 m12 l12',label:'',name:'text_only_policy',checkboxs:[{value:'1',label:'Text only Policy: Description instead of exactly specified amounts (not recommended)'}]},
										{id:'chbxDefault',type:'checkbox',size:'col s12 m12 l12',label:'',name:'is_default',checkboxs:[{value:'1',label:'Default policy'}]},
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m4 l4',label:'Configuration',name:'option_selected',options:[{value:'1',option:'Obligatory booking'},{value:'2',option:'Book on request'},{value:'3',option:'Availability-independent booking'}],onChange:this.setConfigInputs,disabled:this.state.disabledInput},
                                        {type:'component',component: () => {
                                            return (
                                                <div className={"col s12 m8 l6" + (this.state.hideTextOptionBooking ? " hide" : "")}>
                                                    <p>Booking must be confirmed by property-owner within 2.0 days (48 hours).</p>
                                                </div>
                                            );
                                        }}
                                    ]}
                                ]
                            },
                        ]}
                    />
		        	<CleverForm
                        id={'form_bookingGuarantee_policyGuarantees_guaranteeType'}
                        ref={ref => this.refFormBookingGuarantee_policyGuarantees_guaranteeType = ref}
                        data={this.state.dataFormBookingGuarantee.policy_guarantees}
                        forms={[
                            {
                                fieldset:true,
                                title:'Guarantee Type',
                                size:'col s12 m12 l12',
                                inputs:[
                                    {row:[
                                    	{type:'number',name:'iddef_policy_guarantee',hidden:true},
										{type:'select',size:'col s12 m2 l4',label:'Guarantee type',name:'iddef_policy_guarantee_type',
										options:this.state.guaranteesType,onChange:this.setConfigInputs,disabled:this.state.disabledInput},
                                        {type:'component', component: () => {
                                            return (
                                                <div className="col s12 m12 l6">
                                                    <p>Online Credit Card Payment, To use online payment you must have a payment provider active and a merchant ID set.</p>
                                                </div>
                                            );
                                        }}
                                    ]}
                                ]
                            }
                        ]}
                    />
					<div className="row" style={{display:this.state.hideFormFraud ? "none" : ""}}>
						<fieldset style={{paddingTop:'10px', paddingBottom:'10px', 
						borderRadius:'3px', border:'1px solid lightgray',
						marginInlineStart:'20px', marginInlineEnd:'20px'}}>
							<legend style={{color:"#01536d"}}>Anti-fraud Charge Rule</legend>
							<CleverForm
								id={'formRuleAntiFraud'}
								ref={ref => this.refRuleAntiFraud = ref}
								data={this.state.dataRuleAntiFraud}
								forms={[
									{
										inputs: [
											{row:[
												{type:'number',size:'col s12 m4 l4',label:'Number nights applied for the rule',
												name:'numberDaysFraud',required:this.state.hideFormFraud ?false :true},
											]}
											]
										}    
									]}
							/>
							<CleverForm
								id={'formRuleOneNigth'}
								ref={ref => this.refFormFraudFixAmount = ref}
								data={this.state.dataRuleFraudFixAmount}
								forms={[
									{
										fieldset: true,
										title:'ONE NIGHT',
										size: 'col s12 m12 l12',
										inputs: [
											{row:[
												{type:"text",name:"iddef_policy_guarantee_antifraud",hidden:true},
												{type: 'select', size: 'col s12 m2 l2',label:'Type Charge',required:this.state.hideFormFraud ?false :true,
												name:'optionAmount',onChange: e => this.onChangeRuleFraud(e,'oneDay'),
												options:[{value:'1',option:'Fix amount'},{value:'2',option:'Charge per night'}]},
												{type:'number',size:'col s12 m4 l4',label:'Amount',
												name:'fixAmoutFraud',
												hidden:this.state.dataRuleFraudFixAmount ? this.state.dataRuleFraudFixAmount.optionAmount == 1 ? false :true :true,
												required:this.state.dataRuleFraudFixAmount ? this.state.dataRuleFraudFixAmount.optionAmount == 1 ? true :false :false},
												{type:'number',size:'col s12 m4 l4',label:'Number of night',
												name:'numberDaysFraud',
												hidden:this.state.dataRuleFraudFixAmount ? this.state.dataRuleFraudFixAmount.optionAmount == 2 ? false :true :true,
												required:this.state.dataRuleFraudFixAmount ? this.state.dataRuleFraudFixAmount.optionAmount == 2 ? true :false :false},
												{type: 'component',component:() => {
													return (
														<div className={'col s12 m2 l2'}>
															<h6 style={{fontSize:"12px", color:"black", fontWeight:"bold",}}>{`${this.state.dataRuleFraudFixAmount.currency !== undefined ? this.state.dataRuleFraudFixAmount.currency : 'USD'}`}</h6>
														</div>
													);
												}}												
											]}
											]
										}    
									]}
							/>
							<CleverForm
								id={'formRuleMoreNigth'}
								ref={ref => this.refFormFraudMoreDays = ref}
								data={this.state.dataRuleFraudMoreDays}
								forms={[
									{
										fieldset: true,
										title:'MORE NIGHTS',
										size: 'col s12 m12 l12',
										inputs: [
											{row:[
												{type:"text",name:"iddef_policy_guarantee_antifraud",hidden:true},
												{type: 'select', size: 'col s12 m2 l2',label:'Type Charge',required:this.state.hideFormFraud ?false :true,
												name:'optionAmount',onChange: e => this.onChangeRuleFraud(e,'moreDay'),
												options:[{value:'1',option:'Fix amount'},{value:'2',option:'Charge per night'}]},
												{type:'number',size:'col s12 m4 l4',label:'Amount',
												name:'fixAmoutFraud',
												hidden:this.state.dataRuleFraudMoreDays ? this.state.dataRuleFraudMoreDays.optionAmount == 1 ? false :true :true,
												required:this.state.dataRuleFraudMoreDays ? this.state.dataRuleFraudMoreDays.optionAmount == 1 ? true :false :false},
												{type:'number',size:'col s12 m4 l4',label:'Number of night',
												name:'numberDaysFraud',
												hidden:this.state.dataRuleFraudMoreDays ? this.state.dataRuleFraudMoreDays.optionAmount == 2 ? false :true :true,
												required:this.state.dataRuleFraudMoreDays ? this.state.dataRuleFraudMoreDays.optionAmount == 2 ? true :false :false},
												// {type: 'component',component:() => {
												// 	return (
												// 		<div className={'col s12 m2 l2'}>
												// 			<h6 style={{fontSize:"12px", color:"black", fontWeight:"bold",}}>{`${this.state.dataRuleFraudMoreDays.currency !== undefined ? this.state.dataRuleFraudMoreDays.currency : 'USD'}`}</h6>
												// 		</div>
												// 	);
												// }}
											]}
											]
										}    
									]}
							/>							
						</fieldset> 						
					</div>
                    <div style={{display:this.state.hideFormPolicyGuaranteeDeposit ? "none" : ""}}>
	                    <CleverForm
	                        id="form_bookingGuarantee_policyGuranteeDeposit"
	                        ref={ref => this.refFormBookingGuaranteePolicyGuaranteeDeposit = ref}
	                        data={this.state.dataFormBookingGuarantee.policy_guarantee_deposits}
	                        forms={[
	                            {
	                                fieldset:true,
	                                title:'Deposit amount',
	                                size:'col s12 m12 l12',
	                                inputs:[
	                                	{row:[
	                                		{type:"text",name:"iddef_policy_guarantee_deposit",hidden:true},
	                                		{type:"number",name:"iddef_policy_guarantee",hidden:true}
	                                	]},
	                                    {row:[

											{type: 'select',hidden:this.state.hideForm, onChange: e => this.onChangeRule(e), size:'col s12 m12 l2', label:'Policy rule',name:'iddef_policy_rule',options:[{value:'1',option:'Fixed amount'},{value:'2',option:'Percent'}],multiple:true},
                                            {type: 'number',hidden:this.state.hideForm || this.state.hiddenInput("1", this.state.dataFormBookingGuarantee.policy_guarantee_deposits.iddef_policy_rule) ? true : false , size: 'col s12 m12 l2',label:'Fixed amount',name:'fixed_amount',min:'0'},
                                            {type: 'select',hidden:this.state.hideForm || this.state.hiddenInput("1", this.state.dataFormBookingGuarantee.policy_guarantee_deposits.iddef_policy_rule) ? true : false , size: 'col s12 m2 l2',label:'currency',name:'iddef_currency',options:[{value:'1',option:'USD'},{value:'2',option:'MXN'}]},
                                            {type: 'number',hidden:this.state.hideForm || this.state.hiddenInput("2", this.state.dataFormBookingGuarantee.policy_guarantee_deposits.iddef_policy_rule) ? true : false , size: 'col s12 m12 l2',label:'Percent',name:'percent',min:'0'},
                                            {type: 'select',hidden:this.state.hideForm || this.state.hiddenInput("2", this.state.dataFormBookingGuarantee.policy_guarantee_deposits.iddef_policy_rule) ? true : false ,  onChange: e => this.onChangeRule(e), size: 'col s12 m2 l2',label:'Option percent',name:'option_percent',placeholder:'Option percent',options:[{value:'0',option:'FULLSTAY'},{value:'1',option:'NIGHTS'}]},
											{type: 'number',hidden: (this.state.hideForm == false && this.state.hiddenInput("2", this.state.dataFormBookingGuarantee.policy_guarantee_deposits.iddef_policy_rule) == false && this.state.dataFormBookingGuarantee.policy_guarantee_deposits.option_percent == "1") ? false : true , size: 'col s12 m12 l2',label:'Number of nights',name:'number_nights_percent',min:'0'}
										]},
	                                    {row:[
	                                        {type: 'component',component:() => {
	                                            return (
	                                                <span className={'col s12 m12 l12'}>*Guarantee payment will be only charged maximum 100 percent of booking amount.</span>
	                                            );
	                                        }}
	                                    ]}
	                                ]
	                            }
	                        ]}
	                    />
                    </div>
                    <CleverForm
                        id={'form_bookingGuarantee_policyGuarantees_onHoldConfiguration'}
                        ref={ref => this.refFormBookingGuarantee_policyGuarantees_onHoldConfiguration = ref}
                        data={this.state.dataFormBookingGuarantee.policy_guarantees}
                        forms={[
                            {
                                fieldset: true,
                                title:'On Hold Configuration',
                                size: 'col s12 m12 l12',
                                inputs: [
                                    {row:[
                                        {type:'component', component: () => {
                                            return (
                                                <div className="col s12 m12 l12">
                                                    <p>You can increase your direct bookings conversion by allowing potential guests to place a booking on hold for a few hours and return to confirm it, instead of letting them abandon the booking process.
                                                    Guests can hold the selected rates for free and confirm the booking with the applicable policies afterwards. You can also offer them a "last chance discount" with the booking reminder email.</p>
                                                </div>
                                            );
                                        }},
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m12 l4',label:'Allow Hold for Free*',name:'allow_hold_free',options:[{value:'0',option:'No'},{value:'1',option:'Yes (recommended)'}],disabled:this.state.disabledInput,onChange:this.setConfigInputs}
                                    ]},
                                    {row:[
                                        {type:'select',size:'col s12 m12 l4',label:'On Hold duration',name:'hold_duration',options:[{value:"1",option:'1 day (24 hrs)'},{value:"2",option:'2 days (48 hrs)'},{value:"3",option:'3 days (72 hrs)'}],disabled:this.state.disabledInput,hidden:this.state.hideHoldDuration},
                                        {type:'select',size:'col s12 m12 l4',label:'Stay dates',name:'stay_dates_option',options:[{value:"1",option:'All dates, no restrictions'},{value:"2",option:'Custom dates'},{value:"3",option:'Blackout dates'}],onChange:this.setConfigInputs,disabled:this.state.disabledInput,hidden:this.state.hideStayDateOption}
                                    ]},
                                    {row:[
		                                {type:'date',colDate:'col s12 m12 l8',name:'stay_dates',labelDate:'Dates',selected:true,hidden:this.state.hideDates}
		                            ]},
		                            {row:[
                                        {type:'number',size:'col s12 m12 l4',label:'Reminder lead time',name:'reminder_lead_time',disabled:this.state.disabledInput,hidden:this.state.hideReminderLeadTime},
                                        {type:'select',size:'col s12 m12 l4',label:'Offer Last Chance Promotion',name:'offer_last_chance_promotion',options:[{value:'0',option:'No'},{value:'1',option:'Yes (recommended)'}],onChange:this.setConfigInputs,disabled:this.state.disabledInput,hidden:this.state.hideOfferLastChancePromotion},
                                        {type:'select',size:'col s12 m12 l2',label:'Discount type',name:'type_discount',options:[{value:0,option:'Choose option'},{value:1,option:'Amount'},{value:2,option:'Percent'}],hidden:this.state.hideDiscount,disabled:this.state.disabledInput},
                                        {type:'number',size:'col s12 m12 l2',label:'Discount p/night',name:'discount_per_night',min:'0',hidden:this.state.hideDiscount,disabled:this.state.disabledInput}
                                    ]},
                                    {row:[
                                        {type:'number',size:'col s12 m12 l4',label:'Min. Lead Time',name:'min_lead_time',disabled:this.state.disabledInput,hidden:this.state.hideLeadTime},
                                        {type:'number',size:'col s12 m12 l4', label:'Availability Threshold',name:'availability_threshold',disabled:this.state.disabledInput,hidden:this.state.hideAvalabilityThreshold}
                                    ]},
                                ]
                            }    
                        ]}
                    />
					<React.Fragment>
						<div className="row">
							<div className="col s12 m12 l6">
								<p style={{"color":"#01536d"}}>{"English Description"}</p>
								<CleverEditor
									name="editor_desc_en"
									required={true}
									onRef ={editor => this.refEditorEnBoogingGuarantee = editor}
									// buttons={[
									// 	'bold','italic','underline', 'strikethrough','|',
									// 	'undo','redo','|',
									// 	'eraser','|',
									// 	'ul', 'ol'
									// ]}
								/>
							</div>
							<div className="col s12 m12 l6">
								<p style={{"color":"#01536d"}}>{"Spanish Description"}</p>
								<CleverEditor
									name="editor_desc_es"
									required={true}
									onRef ={editor => this.refEditorEsBookingGuarantee = editor}
									// buttons={[
									// 	'bold','italic','underline', 'strikethrough','|',
									// 	'undo','redo','|',
									// 	'eraser','|',
									// 	'ul', 'ol'
									// ]}
								/>
							</div>
						</div>
					</React.Fragment>
                </Modal>
            </div>
    	);
    }
}