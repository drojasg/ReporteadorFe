import React, { Component } from 'react'
import { CleverLoading, GridView, CleverRequest, Modal, MComponentes } from 'clever-component-library'
import CleverConfig from '../../../../../../../config/CleverConfig'
import NewPermissionForm from './NewPermissionForm'

export default class Permissions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            dataPermissions: [],
            title: {},
            defaultButton: {},
        };
        this.tablePermissions = React.createRef();
    }
    
    componentDidMount() {
        this.getPermissions();
        this.props.btnAddPermission.current ? document.getElementById(this.props.btnAddPermission.current.id).addEventListener("click", e => this.openModalPermissions(e)) : null;
    }

    reload = () => {
        this.getPermissions();
        this.componentDidMount();
    }

    getPermissions = () => {
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/auth-item/get?type=2', (response, error) => {
            if (!error) {
                this.setState({ dataPermissions: response.data });
                this.tablePermissions.setDataProvider(this.state.dataPermissions);
                this.setState({ load: false});   
            }
        });
    }

    getPermissionByName = (name, functionGetData = () => {}) => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/auth-item/search/${name}`, (response, error) => {
            if (!error) {      
                let data = response.data;
                this.setState({
                    dataPermissionByName: data
                }, functionGetData);                
            }
        });
    }

    openModalPermissions = (name) => {
        if (typeof(name) === 'string') {
            //UPDATE DATA
            this.getPermissionByName(name, () => {
                this.setState({
                    dataNewPermissionForm: {
                        isEdit: true,
                        name: this.state.dataPermissionByName.name,
                        description: this.state.dataPermissionByName.description,
                        estado: this.state.dataPermissionByName.estado,
                    },
                    defaultButton: {
                        icon: 'save',
                        text: 'Save changes',
                        click: this.updateData,
                    },
                    title: {
                        text: "Currently updating: " + this.state.dataPermissionByName.name,
                    },
                }, () => this.modalNewPermission.getInstance().open());
            });
        } else {
            //NEW PERMISSION
            this.setState({
                dataNewPermissionForm:{
                    name: '',
                    description: '',
                    estado: '',
                
                },
                defaultButton: {
                    icon: 'add',
                    text: 'Add',
                    click:  this.saveData,
                },
                title: {
                    text: "Add permission",
                },
            }, () => this.modalNewPermission.getInstance().open());
        }
    }

    saveData = () => {
        let data =  this.refModalPermission.getData();
        let dataSave = {
            'name': data.name,
            'type': 2,
            'description': data.description,
            'estado': parseInt(data.estado),
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/auth-item/create', dataSave, (data, error) => {
                if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";
                    if (!data.Error) {
                        notificationType = "success";
                        notificationMessage = "The data was saved";
                        this.reload();
                    } else {
                        notificationType = "error";
                        notificationMessage = "The data was no saved";
                    }
                    MComponentes.toast(notificationMessage);
                    this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }
            });
        }
    }

    updateData = (toggleStatus) => {
        if (toggleStatus != undefined) {
            //UPDATE STATUS ONLY
            this.getPermissionByName(toggleStatus.name);
            let data = toggleStatus;
            let estado = data.estado;
            switch (estado) {
                case 1:
                    estado = 0;
                    break;
                case 0:
                    estado = 1;
                    break;
            };
            let dataUpdate = {
                'description': data.description,
                'estado': parseInt(estado),
                'name': data.name,
                'type': 2,
            }
            let name = data.name;
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/auth-item/update/${name}`, dataUpdate, (data, error) => {
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";
                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.reload();
                        } else {
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }
                        MComponentes.toast(notificationMessage);
                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }
                });
            }
        } else {
            //UPDATE DATA
            let data =  this.refModalPermission.getData();
            let oldName = this.state.dataPermissionByName.name;
            if (data.estado == "") {data.estado = 0};
            let dataUpdate = {
                'description': data.description,
                'estado': parseInt(data.estado),
                'name': data.name,
                'type': 2,
            }
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/auth-item/update/${oldName}`, dataUpdate, (data, error) => {
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";
                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.reload();
                        } else {
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }
                        MComponentes.toast(notificationMessage);
                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }
                });
            }
        }
    }

    togglePermissionStatus = (e, data) => {
        let toggleStatus = data;
        this.updateData(toggleStatus);
        toggleStatus = {};
    }

    render() {
        return (
            <div>
                <CleverLoading show={this.state.load}/>
                <Modal title={this.state.title} isFull={false} autoOpen = {false} onRef={ref => this.modalNewPermission = ref} defaultButton={this.state.defaultButton} >
                    <div className="row">
                        <NewPermissionForm dataNewPermissionForm={this.state.dataNewPermissionForm} ref={ref => this.refModalPermission = ref}></NewPermissionForm>
                    </div>
                </Modal>
                <GridView idTable='table-permissions' floatHeader={true} onRef={ref => this.tablePermissions = ref} serializeRows={true} filter={true}
                columns={[
                    { attribute : 'name', alias : 'Name' },
                    { attribute : 'description', alias : 'Description' },
                    { attribute : 'type', alias : 'Type', visible: false },
                    { attribute: 'estado', alias: 'Status', filter: false, value: (data) => {
                        return (
                            <>
                            {data.estado == 1 ? <b>Active</b> : <b className="red-text">Inactive</b>}
                            </>
                        );
                    }},
                    { attribute: 'actions', alias: 'Actions', filter: false, value: (data) => {
                        return (
                            <>
                                <a onClick={(e) => this.openModalPermissions(data.name)} title="Edit permission"><i className="material-icons left black-text">mode_edit</i></a>
                                { 
                                    data.estado == 1 ?
                                    <a onClick={(e) => this.togglePermissionStatus(e, data)} title="Disable permission"><i className="material-icons left teal-text">toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.togglePermissionStatus(e, data)} title="Enable permission"><i className="material-icons left red-text">toggle_off</i></a>
                                }
                            </>
                        );
                    }},
                ]}
                />
            </div>
        )
    }
}
