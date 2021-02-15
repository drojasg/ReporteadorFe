import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from '../../../../../config/CleverConfig';



export default class ConfigBooking extends Component{
    constructor(props){
        super(props);
        this.getDataForm = this.getDataForm.bind(this),
        this.state = {
            load: false,
            dataForm: [],
            dataFormUpdate: null
        }
        this.TableConfig = React.createRef();
    }

    componentDidMount(){
        this.props.btnAddConfig.current.id ?
        document.getElementById(this.props.btnAddConfig.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
        : null;
        this.getData();
    }

    getData = (e) => {
        this.setState({ load: true} );
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/config_booking/search-all`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if(!error) {
                this.setState({ dataForm: response.data });
                this.TableConfig.setDataProvider(this.state.dataForm);
                this.setState({load: false})
            }
        });
    }

    getDataForm(e){

        let refFormView = this.refFormView.getData().values
        let validador = this.refFormView.getData()
        
        try {
            if(validador.required.count == 0 && refFormView.idconfig_booking != ""){

                let url = "";
                let method = "";
                               

                if(this.state.option == "ADD"){
                    url="/api/config_booking/create";
                    method = "POST";
                    console.log("si lega post", this.state.estadoConfig)
                }
                else if(this.state.option=="EDIT"){
                    
                    url="/api/config_booking/update/" + this.state.idconfig_booking;
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
                        param: refFormView.param,
                        value: refFormView.value,
                        type: refFormView.type,
                        enable_public: refFormView.enable_public,
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
        console.log("hola hola hola")
        this.setState({loader:true})
        let data = {estado: Number(!Boolean(this.state.deleteConfig.estado))}

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/config_booking/delete-status/${this.state.deleteConfig.idconfig_booking}`, data, (response, error) => {
            console.log(response)
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                this.refConfirm.getInstance().close()
                this.getData();
            } else {
                console.log(error)
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
        this.setState({data:null, option:null,estadoConfig:null,idconfig_booking:null})
        if (option == "EDIT") {
            this.setState({load:true})
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/config_booking/search/" + dataDetail.idconfig_booking, (response, error) => {
                console.log("res=>",response.data)
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (response != null) {

                        let restrictionList = []
                        
                        restrictionList.push(String(response.data.idconfig_booking))
                        

                        this.setState({
                            option:"EDIT",
                            
                            idRatePlan:response.data.idop_rateplan,
                            load:false,
                            idconfig_booking: response.data.idconfig_booking,
                            estadoConfig:response.data.estado,
                            dataForm: {
                                //poner los campos del response de la api 
                                idconfig_booking: response.data.idconfig_booking,
                                estadoConfig:response.data.estado,
                                param: response.data.param,
                                type: response.data.type,
                                value: response.data.value,
                                enable_public: String(response.data.enable_public)
                                
                            }
                        })
                    }
                  
                }
                else {
                    MComponentes.toast("ERROR");
                    console.log(error)
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
                idconfig_booking: "",
                estadoConfig: 1,
                param: "",
                type: "",
                value: "",
                enable_public:"0"
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
                onRef={ref => this.TableConfig = ref}
                pagination={1000}
                serializeRows={true}
                classTable={'clever-table responsive-table striped bordered'}
                filter={false}
                columns={[
                    { attribute : 'idconfig_booking', visible : false },
                    { attribute : 'param', alias : 'Param' },
                    { attribute : 'value', alias : 'Value' },
                    { attribute : 'type', alias : 'Type'},
                    {
                        attribute: 'actions',
                        alias: 'Actions',
                        filter: false,
                        value:(data, index) => {
                            return(
                                <div>
                                    {
                                        data.estado == 1 ? 
                                        <a onClick={(e) => this.openModal(e,  "EDIT", data)} title='Edit booking configuration'><i className='material-icons left'>mode_edit</i></a>
                                        :
                                        null
                                    }
                                    {
                                        data.estado == 1 ?
                                        <a onClick={(e) => this.deleteConfig(e, data)} title='Disable market'><i className='material-icons left'  >toggle_on</i></a>
                                        :
                                        <a onClick={(e) => this.deleteConfig(e, data)} title='Enable market'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
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
                                                    { type: 'text', size: 'col s12 m3 l3', label: '* param', name: 'param', placeholder: 'Inser param', characters:true, alphanumeric:true, required: true, disabled: this.state.option=="EDIT" ? true : false },
                                                    { type: 'text', size: 'col s12 m3 l3', label: '* type', name: 'type', placeholder: 'Inser type', characters:true, alphanumeric:true, required: true, },
                                                    { type: 'text', size: 'col s12 m3 l3', label: '* value', name: 'value', placeholder: 'Inser value', characters:true, alphanumeric:true, required: true, },
                                                    { type: 'select', size: 'col s12 m3 l3', label: '* Enable public', name: 'enable_public', placeholder: 'Inser Enable public', required: true, manual: true, options: [{ value: "0", option: "Isn't enable to public site" },{ value: "1", option: "Is enable to public site" }], required: true},
                                                    
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