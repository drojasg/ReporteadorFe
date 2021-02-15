import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from '../../../../../config/CleverConfig';



export default class Brands extends Component{
    constructor(props){
        super(props);
        this.getDataForm = this.getDataForm.bind(this),
        this.state = {
            load: false,
            dataForm: {},
            dataFormUpdate: {}
        }
        this.TableBrand = React.createRef();
    }

    componentDidMount(){
        this.props.btnAddConfig.current.id ?
        document.getElementById(this.props.btnAddConfig.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
        : null;
        this.getData();
    }

    getData = (e) => {
        this.setState({ load: true} );
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/brand/get?all`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if(!error) {
                this.setState({ dataForm: response.data });
                this.TableBrand.setDataProvider(this.state.dataForm);
                this.setState({load: false})
            }
        });
    }

    getDataForm(e){

        let refFormView = this.refFormView.getData().values
        let validador = this.refFormView.getData()
        
        try {
            if(validador.required.count == 0 && refFormView.id_brand != ""){

                let url = "";
                let method = "";

                console.log("reform->", refFormView)
                               

                if(this.state.option == "ADD"){
                    url="/api/brand/create";
                    method = "POST";
                    console.log("si lega post", this.state.estadoConfig)
                }
                else if(this.state.option=="EDIT"){
                    
                    url="/api/brand/update/" + this.state.id_brand;
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
                        name: refFormView.name,
                        code: refFormView.code,
                        estado: this.state.dataForm.estado
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
        let data = {estado: Number(!Boolean(this.state.deleteConfig.estado)), code: this.state.deleteConfig.code, name:this.state.deleteConfig.name }

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/brand/delete-status/${this.state.deleteConfig.iddef_brand}`, data, (response, error) => {
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
        this.setState({data:null, option:null,estadoConfig:null,id_brand:null})
        if (option == "EDIT") {
            this.setState({load:true})
            CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/brand/search/" + dataDetail.iddef_brand, (response, error) => {
                console.log("res=>",response.data)
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                
                if (!error) {
                    if (response != null) {

                        let restrictionList = []
                        
                        restrictionList.push(String(response.data.iddef_brand))
                        
                        console.log("resp->", response)

                        this.setState({
                            option:"EDIT",

                            id_brand:response.data.iddef_brand,
                            name: response.data.name,
                            code: response.data.code,
                            estado: response.data.estado,
                            load:false,
                            
                            dataForm: {
                                //poner los campos del response de la api 
                                name: response.data.name,
                                code: response.data.code,
                                estado: response.data.estado,
                                iddef_brand: response.data.iddef_brand
                                
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
                id_brand: "",
                estado: 1,
                name: "",
                code: "",
                }
            } )

        }

        this.refModalAdd.getInstance().open()

    }


    render(){
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <GridView
                    idTable = 'table-brand'
                    floatHeader = {true}
                    onRef={ref => this.TableBrand = ref}
                    pagination={1000}
                    serializeRows={true}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                        { attribute : 'iddef_brand', visible : false },
                        { attribute : 'name', alias : 'Name' },
                        { attribute : 'code', alias : 'Code' },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value:(data, index) => {
                                return (
                                    data.estado == 1 ? (
                                        <>
                                            <a onClick={(e) => this.openModal(e,  "EDIT", data)} title='Edit brand configuration'><i className='material-icons left black-text'>mode_edit</i></a>
                                            <a onClick={(e) => this.deleteConfig(e, data)} title='Disable brand'><i className='material-icons left teal-text'>toggle_on</i></a>
                                        </>
                                    )
                                    :
                                    <a onClick={(e) => this.deleteConfig(e, data)} title='Enable brand'><i className='material-icons left red-text'>toggle_off</i></a>                                        
                                );
                            }
                        }
                    ]}
                />
                <ConfirmDialog onRef={confirm => this.refConfirm = confirm} yesButton={{ click: () => this.deleteConfigConfirm()}}/>
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
                                ref={ref => this.refFormView =ref}
                                forms={[
                                    {
                                        inputs : [
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">Config Brands</h5>
                                                            )
                                                        }
                                                    }
                                                ]},
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m3 l3', label: 'name', name: 'name', placeholder: 'Insert name',characters:true, alphanumeric:true, required: true },
                                                    { type: 'text', size: 'col s12 m3 l3', label: 'code', name: 'code', placeholder: 'Insert code',characters:true, alphanumeric:true, required: true },
                                                ]
                                            },
                                        ]
                                            
                                        
                                    }
                                ]}
                            />
                        :
                            null
                    }
                </Modal>
            </>
        )
    }
}