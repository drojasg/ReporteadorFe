import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from '../../../../../config/CleverConfig';

export default class Currency extends Component{
    constructor(props){
        super(props);
        this.getDataForm = this.getDataForm.bind(this),
        this.state = {
            load: false,
            dataForm: [],
            dataFormUpdate: null
        }
        this.TableCurrency = React.createRef();
    }

    componentDidMount(){
        this.props.btnAddCurrency.current.id ?
        document.getElementById(this.props.btnAddCurrency.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
        : null;
        this.getData();
    }

    getData = (e) => {
        this.setState({ load: true} );
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/currency/get?all=1`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if(!error) {
                this.setState({ dataForm: response.data });
                this.TableCurrency.setDataProvider(this.state.dataForm);
                this.setState({load: false})
            }
        });
    }

    getDataForm(e){

        let refFormView = this.refFormView.getData().values
        let validador = this.refFormView.getData()
        try {
            if(validador.required.count == 0 && refFormView.iddef_currency != ""){

                let url = "";
                let method = "";
                               

                if(this.state.option == "ADD"){
                    url="/api/currency/create";
                    method = "POST";
                }
                else if(this.state.option=="EDIT"){
                    
                    url="/api/currency/update/" + this.state.iddef_currency;
                    method = "PUT";
                };
                this.setState({load:true})
                fetch(CleverConfig.getApiUrl('bengine')+url, {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                        'Content-Type': 'application/json; charset=utf-8'
                    }),
                    method:method,
                    body: JSON.stringify({
                        currency_code: refFormView.currency_code,
                        description: refFormView.description,
                        own_exchange_rate: this.state.dataForm.own_exchange_rate,
                        estado: this.state.dataForm.estadoConfig
                    })
            })
            
                    .then(res => res.json())
                    .then(json=>{
                        if (json.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
                            return
                        }

                        if(!json.Error) {
                            this.getData()
                            this.refModalAdd.getInstance().close()
                            this.setState({load:false})
                            MComponentes.toast("DONE");
                        }
                        else{
                            MComponentes.toast(json.Msg);
                            this.setState({load:false})
                        }
                    })
                    .catch(error =>{
                        this.setState({load:false})
                        MComponentes.toast("ERROR1");
                    })
        } else {
            this.setState({loader:false})
            MComponentes.toast("Error, empty fields ");
        }
    }catch{
        this.setState({load:false})
    }

    }


    
    deleteConfig(e,data){
        this.refConfirm.getInstance().open()
        this.setState({deleteConfig: data})
    }

    deleteConfigConfirm(){
        this.setState({loader:true})
        let data = {estado: Number(!Boolean(this.state.deleteConfig.estado))}

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/currency/update-status/${this.state.deleteConfig.iddef_currency}`, data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                this.refConfirm.getInstance().close()
                this.getData();
            } else {
                MComponentes.toast("ERROR");
            }
        });

    }

    getConfigAddButtonsModal(){
        let buttons = [
            <button className="btn waves-effect waves-light" onClick={e => this.getDataForm(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons
    }

    openModal(e, option, dataDetail) {
        this.setState({data:null, option:null,estadoConfig:null,iddef_currency:null})
        if (option == "EDIT") {
            this.setState({load:true})
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/currency/search/" + dataDetail.iddef_currency, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                
                if (!error) {
                    if (response != null) {

                        let restrictionList = []
                        
                        restrictionList.push(String(response.data.iddef_currency))
                        
                        this.setState({
                            option:"EDIT",
                                                                                    
                            load:false,
                            iddef_currency: response.data.iddef_currency,
                            estadoConfig:response.data.estado,
                            dataForm: {
                                //poner los campos del response de la api 
                                iddef_currency: response.data.iddef_currency,
                                estadoConfig:response.data.estado,
                                currency_code:response.data.currency_code,
                                description: response.data.description,
                                description: response.data.description,
                                own_exchange_rate: response.data.own_exchange_rate
                            }
                        })
                    }
                  
                }
                else {
                    MComponentes.toast("ERROR");
                    this.setState({loader:false})

                };
            });

        }
        else if (option == "ADD") {
            this.setState({
                option:"ADD",
                estadoRatePlan:1,
                dataForm: {
                //poner los campos del response de la api 
                iddef_currency: "",
                estadoConfig: 1,
                currency_code: "",
                description: ""
                }
            } )

        }

        this.refModalAdd.getInstance().open()

    }


    render(){
        return (
            <div>
            <CleverLoading show={this.state.load}/>
            <GridView
                idTable = 'table-config'
                floatHeader = {true}
                onRef={ref => this.TableCurrency = ref}
                pagination={1000}
                serializeRows={true}
                classTable={'clever-table responsive-table striped bordered'}
                filter={false}
                columns={[
                    { attribute : 'iddef_currency', visible : false },
                    { attribute : 'currency_code', alias : 'Curency Code' },
                    { attribute : 'description', alias : 'Description' },
                    { attribute : 'own_exchange_rate', alias : 'Own exchange rate' },
                    { attribute : 'exchange_rate_today', alias : 'Today exchange rate' },
                    {
                        attribute: 'actions',
                        alias: 'Actions',
                        filter: false,
                        value:(data, index) => {
                            return(
                                <div>
                                    <a onClick={(e) => this.openModal(e,  "EDIT", data)} title='Edit Currency'><i className='material-icons left'>mode_edit</i></a>
                                    {
                                        data.estado == 1 ?
                                        <a onClick={(e) => this.deleteConfig(e, data)} title='Disable currency'><i className='material-icons left'  >toggle_on</i></a>
                                        :
                                        <a onClick={(e) => this.deleteConfig(e, data)} title='Enable currency'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                    }    
                                </div>
                            );
                        }
                    }
                ]}
            />
            <ConfirmDialog
                onRef={confirm => this.refConfirm = confirm}
                yesButton={{ click: () => this.deleteConfigConfirm()}}
            />
            <Modal
                addButtons={this.getConfigAddButtonsModal()}
                idModal="addConfig"
                isFull={true}
                onRef={modal => this.refModalAdd = modal}
            >
                {
                    this.state.dataForm ? 
                    <CleverForm
                        data={this.state.dataForm}
                        id={'gio'}
                        ref={ref => this.refFormView =ref}
                        forms={[
                            {
                                inputs : [
                                    {
                                        row: [
                                            {
                                                type: 'component', component: () => {
                                                    return (
                                                        <h5 className="col s12 m5 l5">Config Booking</h5>
                                                    )
                                                }
                                            }
                                        ]},
                                        {
                                                row: [
                                                    { type: 'text', size: 'col s12 m4 l4', label: '* currency code', name: 'currency_code', placeholder: 'Insert currency code', characters:true, alphanumeric:true, required:true},
                                                    { type: 'text', size: 'col s12 m4 l4', label: '* name', name: 'description', characters:true, alphanumeric:true, placeholder: 'Insert description', required:true},
                                                    { type: 'number', size: 'col s12 m4 l4', label: '* Own exchange rate', name: 'own_exchange_rate', characters:true,  alphanumeric:true }
                                                    
                                                ]
                                            },
                                        ]
                                    
                                

                            }
                        ]}
                />:null}
                </Modal>

            
                </div>
        )
    }
}