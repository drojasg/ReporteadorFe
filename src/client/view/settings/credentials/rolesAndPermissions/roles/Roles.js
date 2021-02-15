import React, { Component } from 'react'
import { CleverLoading, GridView, CleverRequest, Modal, MComponentes, Table } from 'clever-component-library'
import CleverConfig from '../../../../../../../config/CleverConfig'
import NewRoleForm from './NewRoleForm'
import AddPermissionToRole from './AddPermissionToRole';

export default class Roles extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            dataRoles: [],
            title: {},
            defaultButton: {},
        };
        this.handleExpandRoles = React.createRef();
    }
    
    componentDidMount() {
        this.getRoles();
        this.props.btnAddRole.current ? document.getElementById(this.props.btnAddRole.current.id).addEventListener("click", e => this.openModalRoles(e)) : null;
    }

    reload = () => {
        this.getRoles();
        this.componentDidMount();
    }

    getRoles = () => {
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/auth-item/get?type=1', (response, error) => {
            if (!error) {
                this.setState({ dataRoles: response.data });
                this.handleExpandRoles.setDataProvider(this.state.dataRoles);
                this.setState({ load: false});   
            }
        });
    }

    getRoleByName = (name, functionGetData = () => {}) => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/auth-item/search/${name}`, (response, error) => {
            if (!error) {      
                let data = response.data;
                this.setState({
                    dataRoleByName: data
                }, functionGetData);                
            }
        });
    }

    openModalRoles = (name) => {
        if (typeof(name) === 'string') {
            //UPDATE DATA
            this.getRoleByName(name, () => {
                this.setState({
                    dataNewRoleForm: {
                        isEdit: true,
                        name: this.state.dataRoleByName.name,
                        description: this.state.dataRoleByName.description,
                        estado: this.state.dataRoleByName.estado,
                    },
                    defaultButton: {
                        icon: 'save',
                        text: 'Save changes',
                        click: this.updateData,
                    },
                    title: {
                        text: "Currently updating: " + this.state.dataRoleByName.name,
                    },
                }, () => this.modalNewRole.getInstance().open());
            });
        } else {
            //NEW ROLE
            this.setState({
                dataNewRoleForm:{
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
                    text: "Add role",
                },
            }, () => this.modalNewRole.getInstance().open());
        }
    }

    saveData = () => {
        let data =  this.refModalRole.getData();
        let dataSave = {
            'name': data.name,
            'type': 1,
            'description': data.description,
            'estado': data.estado,
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
                        notificationMessage = data.Msg;
                        this.reload();
                    } else {
                        notificationType = "error";
                        notificationMessage = data.Msg;
                    }
                    MComponentes.toast(notificationMessage);
                    this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }
            });
        }
    }

    toggleRoleStatus = (e, data) => {
        let toggleStatus = data;
        this.updateData(toggleStatus);
        toggleStatus = {};
    }

    updateData = (toggleStatus) => {
        if (toggleStatus != undefined) {
            //UPDATE STATUS ONLY
            this.getRoleByName(toggleStatus.name);
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
                'type': 1,
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
            let data =  this.refModalRole.getData();
            let oldName = this.state.dataRoleByName.name;
            if (data.estado == "") {data.estado = 0};
            let dataUpdate = {
                'description': data.description,
                'estado': parseInt(data.estado),
                'name': data.name,
                'type': 1,
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

    handleExpand = (param) => {
        this.setState({loading: true});
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/auth-child/get/${param.name}`, (response, error) => {
            if (!error) {
                this.setState({ dataRoles: response.data });
                this.tableChild.setData(this.state.dataRoles);
                this.setState({ load: false});   
            }
        });
        return (
            <div>
                <Table onRef={ref => (this.tableChild = ref)} options={{manual: true, filter: false}} columns={[
                    { key: 'child', label: 'Name' },
                    { key: 'estado', label: 'Status', value: (data) => {
                        return (
                            <>
                            {data.estado == 1 ? <b>Active</b> : <b className="red-text">Inactive</b>}
                            </>
                        );
                    }},
                    { key: '', label: 'Actions', value: (data) => { 
                        return (
                            <a onClick={(e) => this.togglePermissionStatus(e, data)} title="Disable permission"><i className="material-icons left teal-text">toggle_on</i></a>
                        );
                    }, filter: false     
                    }
                ]}/>
            </div>
        ); 
    }

    openModalAddPermission = (name) => {
        this.setState({
            dataAddPermissionToRole: {
                name: name
            },
            defaultButton: {
                icon: 'add',
                text: 'Add permission',
                click: this.addPermission,
            },
            title: {
                text: "Currently adding permission to: " + name,
            },
        }, () => this.modalAddPermissionToRole.getInstance().open());
    }

    addPermission = () => {
        let data =  this.refAddPermissionToRole.getData();
        let dataSave = {
            'parent': this.state.dataAddPermissionToRole.name,
            'child': data.name,
            'estado': 1,
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/auth-child/create', dataSave, (data, error) => {
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

    togglePermissionStatus = (e, data) => {
        let toggleStatus = data;
        this.updatePermissionStatus(toggleStatus);
        toggleStatus = {};
    }

    updatePermissionStatus = (toggleStatus) => {
        //UPDATE STATUS ONLY
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
            'parent': data.parent,
            'child': data.child,
            'estado': estado,
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/auth-child/update/${data.parent}/${data.child}`, dataUpdate, (data, error) => {
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
    
    render() {
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <Modal title={this.state.title} isFull={false} autoOpen = {false} onRef={ref => this.modalNewRole = ref} defaultButton={this.state.defaultButton} >
                    <div className="row">
                        <NewRoleForm dataNewRoleForm={this.state.dataNewRoleForm} ref={ref => this.refModalRole = ref}></NewRoleForm>
                    </div>
                </Modal>
                <Modal title={this.state.title} isFull={false} autoOpen = {false} onRef={ref => this.modalAddPermissionToRole = ref} defaultButton={this.state.defaultButton} >
                    <div className="row">
                        <AddPermissionToRole dataAddPermissionToRole={this.state.dataAddPermissionToRole} ref={ref => this.refAddPermissionToRole = ref}></AddPermissionToRole>
                    </div>
                </Modal>
                <GridView idhandleExpand='handleExpand-roles' floatHeader={true} onRef={ref => this.handleExpandRoles = ref} serializeRows={true} filter={true}
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
                                <a onClick={(e) => this.openModalRoles(data.name)} title="Edit role"><i className="material-icons left black-text">mode_edit</i></a>
                                <a onClick={(e) => this.openModalAddPermission(data.name)} title="Add permission"><i className="material-icons left black-text">how_to_reg</i></a>
                                { 
                                    data.estado == 1 ?
                                    <a onClick={(e) => this.toggleRoleStatus(e, data)} title="Disable role"><i className="material-icons left teal-text">toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.toggleRoleStatus(e, data)} title="Enable role"><i className="material-icons left red-text">toggle_off</i></a>
                                }
                            </>
                        );
                    }},
                    { 
                        alias: 'Expand', 
                        expandCall : (data) => this.handleExpand(data)
                    },
                ]}
                />
            </>
        )
    }
}
