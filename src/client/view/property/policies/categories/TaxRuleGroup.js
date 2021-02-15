import React, { Component } from 'react';
import { CleverLoading, ConfirmDialog, CleverAccordion, GridView, CleverForm, CleverEditor, CleverMethodsApi, MComponentes,CleverInputCheckBox, Chip } from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";
import Modal from '../../../../components/modal/Modal';

export default class TaxRuleGroup extends Component {
    constructor(props) {
        super(props)
        this.createTaxRuleGroup = this.createTaxRuleGroup.bind(this);
        this.detailsPolicyTaxGroup = this.detailsPolicyTaxGroup.bind(this);
        this.editPolicyTaxGroup = this.editPolicyTaxGroup.bind(this);

        this.state = {
			showLoading:false,
			showForm:true,
			hiddenCustomText:true,
        	dataSelectTaxBase:[],
        	dataSelectTaxType:[],
        	dataSelectTaxPrice:[],
        	dataSelectTaxVat:[],
        	dataForm_policy:{},
        	dataForm_policyTaxGroups:{}

        };
    }

    componentDidMount()
    {
    	this.getDataPoliciesByCategory();
    	this.getTaxBase();
    	this.getTaxType();
    	this.getTaxPrice();
    	this.getTaxVat();
    }

    getDataPoliciesByCategory()
    {
        this.setState({
            showLoading:true
        });
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/get/3', (response, error) => {
			if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
                if (response.data.length > 0) {
                    let data = response.data;
                    this.refTableTaxRuleGroup.setDataProvider(data);
                } else {
                    this.refTableTaxRuleGroup.setDataProvider([]);
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

    getTaxBase()
    {
    	let data = [];
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_tax_bases/get',(response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			response.data.map(base => {
    				data.push({value:base.iddef_policy_tax_base,option:base.description});
    			});
    			this.setState({
    				dataSelectTaxBase:data
    			});
    		} else {
    			console.error(error);
    		}
    	});
    }

    getTaxType()
    {
    	let data = [];
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_tax_types/get', (response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			response.data.map(type => {
    				data.push({value:type.iddef_policy_tax_type,option:type.description});
    			});
    			this.setState({
    				dataSelectTaxType:data
    			});
    		} else {
    			console.error(error);
    		}
    	});
    }

    getTaxPrice()
    {
    	let data = [];
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_tax_prices/get', (response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			response.data.map(price => {
    				data.push({value:price.iddef_policy_tax_price,option:price.description});
    			});
    			this.setState({
    				dataSelectTaxPrice:data
    			});
    		} else {
    			console.error(error);
    		}
    	});
    }

    getTaxVat()
    {
    	let data = [];
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policy_tax_vats/get', (response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
    			response.data.map(vat => {
    				data.push({value:vat.iddef_policy_tax_vat,option:vat.description});
    			});
    			this.setState({
    				dataSelectTaxVat:data
    			});
    		} else {
    			console.error(error);
    		}
    	});
    }

    createTaxRuleGroup()
    {
    	this.setState({
            titleModal:'Create Policy',
            hideTitleHead:true,
            hideTitleInput:false,
            hideButtonAdd:true,
            disableDelete:true,
            dataForm_policy:{
                iddef_policy_category:'3',
                iddef_policy:'0',
                iddef_currency:'0',
                policy_category:'TAX RULE GROUP',
                policy_code:''
            },
            dataForm_policyTaxGroups:{
				iddef_policy_tax_group:'0',
				iddef_policy_tax_base: '0',
				iddef_policy_tax_vat:'1',
            	amount:'0.00',
            	min_age:'0',
				max_age:'0',
				max_amount:"0"
            },
            btnAction:{
                label:"save",
                icon:"save",
                onClick:() => {this.save()}
            }
        });
        this.refEditorEnTaxRuleGroup.setContent('');
		this.refEditorEsTaxRuleGroup.setContent('');
		this.cleanValueChipAvailableDates();
    	this.refModalTaxRuleGroup.openModal();
    }

    save()
    {
		this.setState({
			showLoading: true
		});

		let policy = this.refFormTaxRuleGroup_policy.getData();
		let policy_tax_group = this.refFormTaxRuleGroup_policyTaxGroups_taxes.getData();
		let policy_advanceConfig = this.refFormTaxAdvance.getData();
		let ChipAvailableDates = this.getValueChipAvailableDates();
		let refEditorEnTaxRuleGroup = this.refEditorEnTaxRuleGroup.getContent()
		let refEditorEsTaxRuleGroup = this.refEditorEsTaxRuleGroup.getContent()
		if (this.state.hiddenCustomText == false) {
			if (refEditorEnTaxRuleGroup.trim() == "" || refEditorEsTaxRuleGroup.trim() == "") {
				MComponentes.toast("Description(s) is empty");
				this.setState({
					showLoading: false
				});
				return;
			}
		}else{
			refEditorEnTaxRuleGroup = policy.values.policy_code
			refEditorEsTaxRuleGroup = policy.values.policy_code
		}
		if (policy_tax_group.required.count > 0) {
			MComponentes.toast(policy_tax_group.required.inputs[0].label + " is empty");
			this.setState({
                showLoading:false
            });
			return
		}
		if(policy_advanceConfig.required.count > 0){
			MComponentes.toast(policy_advanceConfig.required.inputs[0].label + " is empty");
            this.setState({
                showLoading:false
            });
			return
		}
		

    	let dataSend_policy = {
			iddef_policy_category:'3',
			iddef_currency: Number(policy_tax_group.values.iddef_policy_tax_base) != 2 ? policy.values.iddef_currency : 1,
			option_selected: '0',
			text_only_policy: '0',
			policy_code: policy.values.policy_code,
			estado:'1',
			available_dates : this.castAvaileDate(ChipAvailableDates),
			is_default:0

		};

		CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_create",dataSend_policy,(response,error) => {
			if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
				let resp_policy = response.data;

				let dataSend_policyTaxGroup = {
					iddef_policy:resp_policy.iddef_policy,
					iddef_policy_tax_base: policy_tax_group.values.iddef_policy_tax_base,
					iddef_policy_tax_type: policy_tax_group.values.iddef_policy_tax_type,
					iddef_policy_tax_price: policy_tax_group.values.iddef_policy_tax_price,
					iddef_policy_tax_vat: policy_advanceConfig.values.iddef_policy_tax_vat,
					amount: parseFloat(policy_tax_group.values.amount).toFixed(2),
					description_en:refEditorEnTaxRuleGroup,
					description_es:refEditorEsTaxRuleGroup , 
					use_custom_desc: '0',
					use_ages_range:'0',
					use_dates_range:'0',
					max_amount: policy_tax_group.values.use_maximum_amount.length > 0 ? policy_tax_group.values.max_amount : "0" ,
					use_maximum_amount: policy_tax_group.values.use_maximum_amount.length > 0 ? 1 : 0,
					is_custom_text: policy_tax_group.values.is_custom_text.length > 0 ? 1 : 0,
					age_ranges:[{
						from:policy_advanceConfig.values.min_age,
						till:policy_advanceConfig.values.max_age
					}],
					date_ranges:[{
						start:policy_advanceConfig.values.DateRangeStart,
						end:policy_advanceConfig.values.DateRangeEnd
					}],
					estado:'1'
				};
		    	CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/policy_tax_groups/create",dataSend_policyTaxGroup,(response,error) => {
		    		if (response.status == 403) {
						MComponentes.toast('YOU ARE NOT AUTHORIZED');
						this.setState({ showLoading: false });
						return
					}
					if (!error) {
		    			this.getDataPoliciesByCategory();
		    			this.setState({
		    				showLoading:false
		    			}, () => {
		    				this.refModalTaxRuleGroup.closeModal();
		    			});
		    		} else {
		    			console.error(error);
		    			this.setState({
		    				showLoading:false
		    			});
		    		}
		    	});

			} else {
				console.error(error);
			}
    	});
    }

    update(iddef_policy)
    {
    	this.setState({
    		showLoading:true
		});
    	let policy = this.refFormTaxRuleGroup_policy.getData();
		let policy_tax_groups = this.refFormTaxRuleGroup_policyTaxGroups_taxes.getData();
		let policy_advanceConfig = this.refFormTaxAdvance.getData();
		let ChipAvailableDates = this.getValueChipAvailableDates() ;
		let refEditorEnTaxRuleGroup = this.refEditorEnTaxRuleGroup.getContent()
		let refEditorEsTaxRuleGroup = this.refEditorEsTaxRuleGroup.getContent()
		if (this.state.hiddenCustomText == false) {
			if (refEditorEnTaxRuleGroup.trim() == "" || refEditorEsTaxRuleGroup.trim() == "") {
				MComponentes.toast("Description(s) is empty");
				this.setState({
					showLoading: false
				});
				return;
			}
		}else{
			refEditorEnTaxRuleGroup = policy.values.policy_code
			refEditorEsTaxRuleGroup = policy.values.policy_code
		}
		
    	let policy_code = (policy.values.policy_code).replace(/ /g,"_");
		let updatePolicy = {
			iddef_policy_category: 3,
			iddef_currency: Number(policy_tax_groups.values.iddef_policy_tax_base) != 2 ? policy.values.iddef_currency : 1,
			policy_code: policy_code,
			option_selected: '0',
			text_only_policy: '0',
			estado: "1",
			available_dates : this.castAvaileDate(ChipAvailableDates)

		};

    	CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/single_update/"+iddef_policy,updatePolicy,(response,error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
				let resp_policy = response.data;

				let iddef_policy_tax_group = policy_tax_groups.values.iddef_policy_tax_group;
				let updatePolicyTaxGroup = {
					iddef_policy:resp_policy.iddef_policy,
					iddef_policy_tax_base: policy_tax_groups.values.iddef_policy_tax_base,
					iddef_policy_tax_type: policy_tax_groups.values.iddef_policy_tax_type,
					iddef_policy_tax_price: policy_tax_groups.values.iddef_policy_tax_price,
					iddef_policy_tax_vat: policy_advanceConfig.values.iddef_policy_tax_vat,
					amount: parseFloat(policy_tax_groups.values.amount).toFixed(2),
					max_amount: policy_tax_groups.values.use_maximum_amount.length > 0 ? policy_tax_groups.values.max_amount : "0" ,
					use_maximum_amount: policy_tax_groups.values.use_maximum_amount.length > 0 ? 1 : 0,
					use_custom_desc: '0',
					use_ages_range:'0',
					use_dates_range:'0',
					is_custom_text: policy_tax_groups.values.is_custom_text.length > 0 ? 1 : 0,
					age_ranges:[{
						from:policy_advanceConfig.values.min_age,
						till:policy_advanceConfig.values.max_age
					}],
					date_ranges:[{
						start:policy_advanceConfig.values.DateRangeStart,
						end:policy_advanceConfig.values.DateRangeEnd
					}],
					description_en:refEditorEnTaxRuleGroup,
					description_es:refEditorEsTaxRuleGroup,
					estado:'1'
				};

				CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policy_tax_groups/update/"+iddef_policy_tax_group,updatePolicyTaxGroup,(response,error) => {
					if (response.status == 403) {
						MComponentes.toast('YOU ARE NOT AUTHORIZED');
						this.setState({ showLoading: false });
						return
					}
					if (!error) {
		    			this.getDataPoliciesByCategory();
		    			this.setState({
		    				showLoading:false
		    			}, () => {
		    				this.refModalTaxRuleGroup.closeModal();
		    			});
					} else {
						console.error(error);
						this.setState({
							showLoading:false
						});
					}
				});
    		} else {
    			this.setState({
    				showLoading:false
    			});
    		}
    	});
    }

    getPolicyById(iddef_policy)
    {
    	this.setState({
    		showLoading:true
    	});
    	let policy = [];
    	let policy_tax_groups = [];
    	CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/policies/search/'+iddef_policy,(response, error) => {
    		if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
			}
			if (!error) {
				policy = response.data;
				this.cleanValueChipAvailableDates();
				for (let i = 0; i < policy.available_dates.length; i++) {
					let dateTemp = this.castDate(policy.available_dates[i].start_date, "USER") + " - " + this.castDate(policy.available_dates[i].end_date, "USER")
					this.setValueChipAvailableDates(dateTemp)
				}
    			this.setState({
    				dataForm_policy:{
    					iddef_policy_category:policy.iddef_policy_category,
    					iddef_policy:policy.iddef_policy,
    					iddef_currency:String(policy.iddef_currency),
						policy_code:policy.policy_code,
						available_dates: policy.available_dates,
					}
				});

    			if (policy.policy_tax_groups.length > 0) {
    				policy_tax_groups = policy.policy_tax_groups;
    				if (policy_tax_groups.length > 0) {
	    				policy_tax_groups = policy_tax_groups[0];
	    				let min_age = "0", max_age = "0";
	    				let date_ranges = {start:"",end:""};
	    				
	    				if (policy_tax_groups.age_ranges == null || policy_tax_groups.age_ranges == "") {
	    					min_age = "";
	    					max_age = "";
	    				} else {
	    					if (policy_tax_groups.age_ranges.length > 0) {
	    						min_age = policy_tax_groups.age_ranges[0].from;
	    						max_age = policy_tax_groups.age_ranges[0].till;	
	    					}
	    				}

	    				if (policy_tax_groups.date_ranges == null || policy_tax_groups.date_ranges == "") {
	    					date_ranges = {start:"", end:""};
	    				} else {
	    					if (policy_tax_groups.date_ranges.length > 0) {
	    						date_ranges = {start:policy_tax_groups.date_ranges[0].start, end:policy_tax_groups.date_ranges[0].end};	
	    					}
						}
						
	    				this.setState({
	    					dataForm_policyTaxGroups:{
	    						iddef_policy_tax_group:String(policy_tax_groups.iddef_policy_tax_group),
	    						iddef_policy_tax_base:String(policy_tax_groups.iddef_policy_tax_base),
	    						iddef_policy_tax_type:String(policy_tax_groups.iddef_policy_tax_type),
	    						iddef_policy_tax_price:String(policy_tax_groups.iddef_policy_tax_price),
	    						iddef_policy_tax_vat:String(policy_tax_groups.iddef_policy_tax_vat),
	    						amount:parseFloat(policy_tax_groups.amount).toFixed(2),
	    						min_age:policy_tax_groups.age_ranges[0].from,
								max_age:policy_tax_groups.age_ranges[0].till,
								DateRangeStart:policy_tax_groups.date_ranges[0].start,
								DateRangeEnd:policy_tax_groups.date_ranges[0].end,
								AvailableDateStart: "",
								AvailableDateEnd: "",
								use_maximum_amount: policy_tax_groups.use_maximum_amount == 1 ? ["1"] : []  ,
								max_amount : policy_tax_groups.max_amount,
								is_custom_text : policy_tax_groups.is_custom_text == 1 ? ["1"] : [] 
	    					}
	    				});
	    				this.refEditorEnTaxRuleGroup.setContent(policy_tax_groups.description_en);
	    				this.refEditorEsTaxRuleGroup.setContent(policy_tax_groups.description_es); 
	    				this.setState({
	    					showLoading:false
	    				});
	    			}
    			} else {
    				this.setState({
    					showLoading:false,
    					dataForm_policyTaxGroups: {}

    				});
    			}
    		} else {
    			console.error(error);
    			this.setState({
    				showLoading:false
    			});
    		}
    	});
    }

    detailsPolicyTaxGroup(iddef_policy)
    {
    	this.setState({
    		titleModal:'Details Policy',
    		hideTitleHead:false,
    		hideTitleInput:true,
    		btnAction:{}
    	});
    	this.getPolicyById(iddef_policy);
    	this.refModalTaxRuleGroup.openModal();
    }

    editPolicyTaxGroup(iddef_policy)
    {	
    	this.setState({
    		titleModal:'Update Policy',
    		hideTitleHead:true,
    		hideTitleInput:false,
    		btnAction:{
                label:"update",
                icon:"save",
                onClick:() => {this.update(iddef_policy)}
            }
    	});
    	this.getPolicyById(iddef_policy);
    	this.refModalTaxRuleGroup.openModal();
	}
	
	deleteTaxRuleGroupPolicy(e,data) {
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
	
	addToChip(){
        if (this.state.dataForm_policyTaxGroups .AvailableDateStart || this.state.dataForm_policyTaxGroups.AvailableDateEnd) {
            if (Date.parse(this.state.dataForm_policyTaxGroups.AvailableDateStart + " 12:00") < Date.parse(this.state.dataForm_policyTaxGroups.AvailableDateEnd + " 12:00")) {
                this.setValueChipAvailableDates(this.castDate(this.state.dataForm_policyTaxGroups.AvailableDateStart, "USER") + " - " + this.castDate(this.state.dataForm_policyTaxGroups.AvailableDateEnd, "USER"));
            } else {
                MComponentes.toast("Select a valid range");
                return;
            }

        } else {
            MComponentes.toast("Select a date range");
            return;
        }
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

	castAvaileDate(StringDate){
        let arrayReturn = []
        for (let index = 0; index < StringDate.length; index++) {
            let arraySplit = StringDate[index].split(" - ")
            arrayReturn.push({start_date: this.castDate(arraySplit[0], "SYSTEM"), end_date: this.castDate(arraySplit[1], "SYSTEM") })
        }
        return arrayReturn
	}
	
	setMaxAmout(data) {
        let length = data.value.length;
        let showForm = (length == 0 ? true : false);
        this.setState({
            showForm:showForm
        });
	}
	
	setCustomText(data) {
        let length = data.value.length;
        let hiddenCustomText = (length == 0 ? true : false);
        this.setState({
            hiddenCustomText:hiddenCustomText
        });
    }

	onChangeDate(e) {
        let form = JSON.parse(JSON.stringify(this.state.dataForm_policyTaxGroups));
        form[e.id] = e.dateString
        this.setState({ dataForm_policyTaxGroups: form })
	}
	
	onChangeData(e){
		let form = JSON.parse(JSON.stringify(this.state.dataForm_policyTaxGroups));
        form[e.name] = e.value
        this.setState({ dataForm_policyTaxGroups: form })
	}

	setDefaultPolicy(iddef_policy) {
        this.refDefaultConfirm.getInstance().open();
        this.setState({ setDefault_id: iddef_policy });
    }

    setDefaultConfirm() {
        let iddef_policy = this.state.setDefault_id;
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/policies/set_default/"+iddef_policy+"/3",{},(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ showLoading: false });
                return
            }
            if (!error) {
                this.getDataPoliciesByCategory();
                this.refDefaultConfirm.getInstance().close();
            } else {
                console.log(error);
                MComponentes.toast("ERROR");
            }
            
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
    			<GridView idTable='table-tax-rule-gridview'
                    onRef={ref => (this.refTableTaxRuleGroup = ref)}
                    filter={false}
                    serializeRows={false}
                    columns={[
                        {attribute: 'policy_code',alias: 'Policy code'},
						/*
						se comenta linea por que no se usa aqui esta funcion de acuerdo a kognitiv
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
                        }}, */
                        {attribute: '',alias: 'Actions',filter: false,value: (data) => {
                            return(
                                <div>
                                    <a id="detail" onClick={() => this.detailsPolicyTaxGroup(data.iddef_policy)} title="View Policies"><i className="material-icons left">visibility</i></a> 
                                    <a id="edit" onClick={() => this.editPolicyTaxGroup(data.iddef_policy)} title="Edit Policies"><i className="material-icons left">mode_edit</i></a>
									{
                                        data.estado == 1 ?
                                            <a onClick={(e) => this.deleteTaxRuleGroupPolicy(e,data)} title='Disable Policy'><i className='material-icons left'  >toggle_on</i></a>
                                        :
                                            <a onClick={(e) => this.deleteTaxRuleGroupPolicy(e,data)} title='Enable Policy'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                    
									}
                                </div>
                            );
                        }}
                    ]}
                />
                <Modal
                    id={"modalTaxRuleGroup"}
                    title={this.state.titleModal}
                    size={"full"}
                    ref={ref => this.refModalTaxRuleGroup = ref}
                    btnAction={this.state.btnAction}
                >
					<div className="row">
						<div className="col s12 m12 l12">
							<p>{"For Mexico we assume that prices are entered net (without VAT). You must define the VAT in the default tax rule set (Policies > Tax Rule Set)."}</p>		
						</div>
					</div>
					<div className="row">
						<CleverForm
							id="form_taxRuleGroup_policy"
							ref={ref => this.refFormTaxRuleGroup_policy = ref}
							data={this.state.dataForm_policy}
							forms={[
								{
									size:'col s12 m12 l12',
									inputs:[
										{row:[
											{type:'number',name:'iddef_policy_category',hidden:true},
											{type:'number',name:'iddef_policy',hidden:true}
										]}
									]
								},
								{
									size: 'col s12 m12 l12',
									inputs:[
										{row:[
											{type:'component',component: () => {
												return (
													<div className={this.state.hideTitleHead == true ? 'hide' : 'col s12 m12 l6'} >
														<h4>{this.state.dataForm_policy.policy_code}</h4>
													</div>
													
												);
											}},
											{type:'text',size:'s12 m6 l6',label:'Policy Name',name:'policy_code',required:true,hidden:this.state.hideTitleInput, characters:true},
											{type:'select',size:'col s12 m6 l6',hidden:Number(this.state.dataForm_policyTaxGroups.iddef_policy_tax_base) == 2 ? true : false, label:'currency',name:'iddef_currency',options:[{value:'1',option:'USD'},{value:'2',option:'MXN'}]},
											
										]}
									]
								}
							]}
						/>
					</div>
					<React.Fragment>
						<CleverAccordion
							id="tax_collapsible"
							size="s12 m12 l12"
							accordion={
								{
									head: [
										{accordion:'taxes',label:'Taxes',controls:[]},
										{accordion:'advance_configuration',label:'Advance configuration',controls:[]}
									],
									body: [
										{
											"taxes" :
												<div className="row" >
													<CleverForm
														id="form_taxRuleGroup_taxRuleGroupPolicy"
														ref={ref => this.refFormTaxRuleGroup_policyTaxGroups_taxes = ref}
														data={this.state.dataForm_policyTaxGroups}
														forms={[
															{
																size: 'col s12 m12 l12',
																inputs: [
																	{
																		row: [
																			{ type: 'number', name: 'iddef_policy_tax_group', hidden: true },
																			{ type: 'select', name: 'iddef_policy_tax_base', label: 'Tax base', onChange: e => this.onChangeData(e),size: 'col s12 m6 l6', options: this.state.dataSelectTaxBase, required:true },
																			{ type: 'select', name: 'iddef_policy_tax_type', label: 'Tax type', size: 'col s12 m6 l6', options: this.state.dataSelectTaxType, required:true },
																			{ type: 'select', name: 'iddef_policy_tax_price', label: 'Price calculation', size: 'col s12 m6 l6', options: this.state.dataSelectTaxPrice, required:true },
																			{ type: 'number', name: 'amount', label: Number(this.state.dataForm_policyTaxGroups.iddef_policy_tax_base) == 2 ? 'Percent' : 'Amount', size: 'col s12 m6 l6', required:true },
																			{ type:'checkbox',size:'col s12 m6 l6',label:'',name:'use_maximum_amount',onChange:(data) => {this.setMaxAmout(data)},checkboxs:[{value:'1',label:'Use maximum amounts'}]},
																			{ type: 'number', name: 'max_amount', hidden:this.state.showForm , label: 'Max Amount', size: 'col s12 m6 l6' },
																			{ type:'checkbox',size:'col s12 m12 l12',label:'',name:'is_custom_text',onChange:(data) => {this.setCustomText(data)},checkboxs:[{value:'1',label:'Custom text'}]},
																		]
																	},
																	{
																		row: [
																			 {
																				type: 'component', component: () => {
																					return (
																						<React.Fragment>
																							<div className={this.state.hiddenCustomText ? "hide" : "row"}>
																								<div className="col s12 m12 l6">
																									<p style={{ "color": "#01536d" }}>{"English Description"}</p>
																									<CleverEditor
																										name="editor_desc_en"
																										onRef={editor => this.refEditorEnTaxRuleGroup = editor}
																										buttons={[
																											'bold', 'italic', 'underline', 'strikethrough', '|',
																											'undo', 'redo', '|',
																											'eraser', '|',
																											'ul', 'ol'
																										]}
																									/>
																								</div>
																								<div className="col s12 m12 l6">
																									<p style={{ "color": "#01536d" }}>{"Spanish Description"}</p>
																									<CleverEditor
																										name="editor_desc_es"
																										onRef={editor => this.refEditorEsTaxRuleGroup = editor}
																										buttons={[
																											'bold', 'italic', 'underline', 'strikethrough', '|',
																											'undo', 'redo', '|',
																											'eraser', '|',
																											'ul', 'ol'
																										]}
																									/>
																								</div>
																							</div>
																						</React.Fragment>
																					)
																				}
																			},
																			{
																				type: 'component', component: () => {
																					return (
																						<div className={"col s12 m12 l12 "}>
																							<p style={{ "color": "#01536d" }}>{"Available Dates"}</p>
																						</div>
																					)
																				}
																			},
																			{ type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m4 l4 ", label: 'Start', name: 'AvailableDateStart' },
																			{ type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m4 l4 ", min: this.state.dataForm_policyTaxGroups.AvailableDateStart, label: 'End', name: 'AvailableDateEnd' },
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
												</div>,
											"advance_configuration" :
												<div className="row">
													<CleverForm
														id="form_taxRuleGroup_taxRuleGroupPolicy_2"
														ref={ref => this.refFormTaxAdvance = ref}
														data={this.state.dataForm_policyTaxGroups}
														forms={[
															{
																size: 'col s12 m12 l12',
																inputs: [
																	{row:[
																		{type:'number',name:'iddef_policy_tax_group',hidden:true},
																		{type:'select',name:'iddef_policy_tax_vat',label:'Tax Vat',size:'col s12 m6 l6',options:this.state.dataSelectTaxVat}
																		
																	]},
																	{row:[
																		{type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m12 l3", label: 'Start', name: 'DateRangeStart' },
																		{type: 'date', onChange: e => this.onChangeDate(e), colDate: "col s12 m12 l3 ", min: this.state.dataForm_policyTaxGroups.DateRangeStart, label: 'End', name: 'DateRangeEnd' },
																		{type:'number',size:'col s12 m12 l3',name:'min_age',label:'Min Age',min:'0'},
																		{type:'number',size:'col s12 m12 l3',name:'max_age',label:'Max Age',min:'0'}
																	]}
																]
															}
														]}
													/>
												</div>
										}
									]
								}
							}
						/>
					</React.Fragment>
                </Modal>
    		</div>
    	);

    }
}