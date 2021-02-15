import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from '../../../../../config/CleverConfig';



export default class Channels extends Component {
    constructor(props) {
        super(props);
        this.getDataForm = this.getDataForm.bind(this),
            this.state = {
                listsSistems: [],
                listChannelType: [],
                load: false,
                dataForm: [],
                dataFormUpdate: null
            }
        this.TableChannel = React.createRef();
    }

    componentDidMount() {
        this.props.btnAddConfig.current.id ?
            document.getElementById(this.props.btnAddConfig.current.id).addEventListener("click", e => this.openModal(e, "ADD", null))
            : null;
        this.getData();
        this.getDataSistems();
        this.getDataChannelType();
    }

    getData = (e) => {
        this.setState({ load: true });

        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/channels/get-table`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                this.setState({ dataForm: response.data });
                this.TableChannel.setDataProvider(response.data);
                this.setState({ load: false })
            }
        });
    }

    getDataSistems() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/sistems/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let sistem = [];
                response.data.map((data) => {
                    let infoInput = {};
                    infoInput.value = String(data.idop_sistemas);
                    infoInput.option = data.nombre
                    sistem.push(infoInput);
                });
                this.setState({ listsSistems: sistem });
            } else {
                this.setState({ load: false });
            }
        });
    }

    getDataChannelType() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/channel-type/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let channelType = [];
                response.data.map((data) => {
                    let infoInput = {};
                    infoInput.value = String(data.iddef_channel_type);
                    infoInput.option = data.name
                    channelType.push(infoInput);
                });
                this.setState({ listChannelType: channelType });
            } else {
                this.setState({ load: false });
            }
        });
    }

    getDataForm(e) {
        let refFormView = this.refFormView.getData().values
        let validador = this.refFormView.getData()

        try {
            if (validador.required.count == 0 && refFormView.iddef_channel != "") {

                let url = "";
                let method = "";


                if (this.state.option == "ADD") {
                    url = "/api/channels/create";
                    method = "POST";
                }
                else if (this.state.option == "EDIT") {

                    url = "/api/channels/update/" + this.state.iddef_channel;
                    method = "PUT";
                };
                this.setState({ load: true })
                fetch(CleverConfig.getApiUrl('bengine') + url, {
                    headers: new Headers({
                        'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                        'Content-Type': 'application/json; charset=utf-8'
                    }),
                    method: method,
                    body: JSON.stringify({
                        name: refFormView.name,
                        description: refFormView.description,
                        iddef_channel_type: refFormView.iddef_channel_type,
                        idop_sistemas: refFormView.idop_sistemas,
                        estado: 1,
                        external_id: refFormView.external_id,
                        url: refFormView.url
                    })
                })
                    .then(res => res.json())
                    .then(json => {
                        if (json.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
                            return
                        }
                        if (!json.Error) {
                            this.getData()
                            this.refModalAdd.getInstance().close()
                            this.setState({ load: false })
                            MComponentes.toast("DONE");
                        }
                        else {
                            MComponentes.toast(json.Msg);
                            this.setState({ load: false })
                        }
                    })
                    .catch(error => {
                        this.setState({ load: false })
                        MComponentes.toast("ERROR");
                    })
            } else {
                this.setState({ loader: false })
                MComponentes.toast("Error, empty fields ");
            }
        } catch{
            this.setState({ load: false })
        }

    }


    deleteConfig(e, data) {
        this.refConfirm.getInstance().open()
        this.setState({ deleteConfig: data })
    }

    deleteConfigConfirm() {
        this.setState({ loader: true })
        let estado = 0
        if (this.state.deleteConfig.estado == 1) {
            estado = 0
        } else {
            estado = 1
        }

        let data = {
            estado: estado,
            name: this.state.deleteConfig.name,
            iddef_channel_type: this.state.deleteConfig.iddef_channel_type,
            description: this.state.deleteConfig.description,
            idop_sistemas: this.state.deleteConfig.idop_sistemas,
            url: this.state.deleteConfig.url
        }

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/channels/delete-status/${this.state.deleteConfig.iddef_channel}`, data, (response, error) => {
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

    getConfigAddButtonsModal() {
        let buttons = [
            <button className="btn waves-effect waves-light" onClick={e => this.getDataForm(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons
    }

    openModal(e, option, dataDetail) {
        this.setState({ data: null, option: null, estadoConfig: null, iddef_channel: null })
        if (option == "EDIT") {
            this.setState({ formChannel: dataDetail, option: "EDIT", iddef_channel: dataDetail.iddef_channel });
        }
        else if (option == "ADD") {
            this.setState({
                option: "ADD",
                formChannel: {
                    description: "",
                    iddef_channel_type: "",
                    idop_sistemas: "",
                    name: "",
                    external_id: "",
                    url: ""
                }
            })

        }

        this.refModalAdd.getInstance().open()

    }


    render() {
        let { listsSistems, listChannelType } = this.state;
        return (
            <div>
                <CleverLoading show={this.state.load} />
                <GridView
                    idTable='table-channel'
                    floatHeader={true}
                    onRef={ref => this.TableChannel = ref}
                    pagination={1000}
                    serializeRows={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={true}
                    columns={[
                        { attribute: 'iddef_channel', visible: false },
                        { attribute: 'name', alias: 'Name' },
                        { attribute: 'description', alias: 'Description' },
                        { attribute: 'nombre_sistema', alias: 'Op Sistema' },
                        { attribute: 'name_channel_type', alias: 'Channel Type' },
                        { attribute: 'external_id', alias: 'External ID' },
                        { attribute: 'url', alias: 'URL' },
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            filter: false,
                            value: (data, index) => {
                                return (
                                    <div>
                                        {
                                            data.estado == 1 ?
                                                <a onClick={(e) => this.openModal(e, "EDIT", data)} title='Edit brand configuration'><i className='material-icons left black-text'>mode_edit</i></a>
                                                :
                                                null
                                        }
                                        {
                                            data.estado == 1 ?
                                                <a onClick={(e) => this.deleteConfig(e, data)} title='Disable channel'><i className='material-icons left teal-text'>toggle_on</i></a>
                                                :
                                                <a onClick={(e) => this.deleteConfig(e, data)} title='Enable channel'><i className='material-icons left red-text'>toggle_off</i></a>
                                        }
                                    </div>
                                );
                            }
                        }
                    ]}
                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteConfigConfirm() }}
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
                                data={this.state.formChannel}
                                id={'formChannel'}
                                ref={ref => this.refFormView = ref}
                                forms={[
                                    {
                                        inputs: [
                                            {
                                                row: [
                                                    {
                                                        type: 'component', component: () => {
                                                            return (
                                                                <h5 className="col s12 m5 l5">Config Channels</h5>
                                                            )
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                row: [
                                                    { type: 'text', size: 'col s12 m4 l4', label: 'channel name', name: 'name', placeholder: 'Insert name', characters: true, alphanumeric: true, required: true },
                                                    { type: 'text', size: 'col s12 m4 l4', label: 'channel description', name: 'description', placeholder: 'Insert channel description', characters: true, alphanumeric: true, required: true },
                                                    {
                                                        type: 'select', size: 'col s12 m4 l4', name: 'idop_sistemas', label: '* Op Sistema', placeholder: 'Select Op Sistema',
                                                        options: listsSistems, required: true, autocomplete: true
                                                    },
                                                    {
                                                        type: 'select', size: 'col s12 m4 l4', name: 'iddef_channel_type', label: '* Channel Type', placeholder: 'Select Channel Type',
                                                        options: listChannelType, required: true, autocomplete: true
                                                    },
                                                    { type: 'text', size: 'col s12 m4 l4', label: 'external id', name: 'external_id', placeholder: 'Insert External ID', characters: true, alphanumeric: true },
                                                    { type: 'text', size: 'col s12 m4 l4', label: 'url', name: 'url', placeholder: 'Insert URL', characters: true, alphanumeric: true},

                                                ]
                                            },
                                        ]
                                    }
                                ]}
                            /> : null}
                </Modal>


            </div>
        )
    }
}