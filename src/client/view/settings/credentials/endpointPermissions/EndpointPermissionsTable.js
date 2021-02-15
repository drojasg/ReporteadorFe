import React, { Component } from 'react'
import { CleverLoading, GridView, CleverRequest, Modal, MComponentes, Table } from 'clever-component-library'
import CleverConfig from '../../../../../../config/CleverConfig'
import NewEndpointPermissionForm from './NewEndpointPermissionForm'

export default class EndpointPermissions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            dataEndpointPermissions: [],
            title: {},
            defaultButton: {},
        };
        this.handleExpandEndpointPermissions = React.createRef();
    }

    componentDidMount() {
        this.getAuthProfileView();
        this.props.btnAddEndpointPermission.current ? document.getElementById(this.props.btnAddEndpointPermission.current.id).addEventListener("click", e => this.openModalEndpointPermission(e)) : null;
    }

    reload = () => {
        this.getAuthProfileView();
        this.componentDidMount();
    }

    openModalEndpointPermission = (data) => {
        if (typeof(data.auth_item) === 'string') {
            //UPDATE DATA
            this.setState({
                dataNewEndpointPermissionForm: {
                    id_profile_view: data.id_profile_view,
                    auth_item: data.auth_item,
                    action: data.action,
                    estado: data.estado,
                },
                defaultButton: {
                    i18n: "{{'SAVE'}}",
                    icon: "save",
                    iconClass: "right",
                    buttonClass: "teal",
                    title: "",
                    text: "Save changes",
                    click: this.updateData,
                },
                title: {
                    text: "Currently updating: " + data.auth_item,
                },
            }, () => this.modalNewEndpointPermission.getInstance().open(), () => this.props.setValueChipEndpoint(data.estado));
        } else {
            //NEW ROLE
            this.setState({
                dataNewEndpointPermissionForm:{
                    id_profile_view: '',
                    auth_item: '',
                    action: '',
                    estado: '',
                },
                defaultButton: {
                    i18n: "{{'ADD'}}",
                    icon: "add",
                    iconClass: "right",
                    buttonClass: "teal",
                    title: "",
                    text: "Add",
                    click: this.saveData,
                },
                title: {
                    text: "Add role",
                },
            }, () => this.modalNewEndpointPermission.getInstance().open());
        }
    }

    saveData = () => {
        let data =  this.refModalEndpointPermission.getData();
        let dataSave = {
            'auth_item': data.auth_item,
            'action': data.action,
            //'estado': parseInt(data.estado),
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/auth-profile-view/add-role-by-endpoint', dataSave, (data, error) => {
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

    toggleEndpointPermissionStatus = (e, data) => {
        let toggleStatus = data;
        this.updateData(toggleStatus);
        toggleStatus = {};
    }

    updateData = (toggleStatus) => {
        if (toggleStatus != undefined) {
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
                'action': data.action,
                'auth_item': data.auth_item,
                'controller': data.controller,
                'estado': parseInt(estado),
                'id_profile_view': data.id_profile_view,
            }
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/auth-profile-view/update/${data.id_profile_view}`, dataUpdate, (data, error) => {
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
            let data =  this.refModalEndpointPermission.getData();
            let action = data.action;
            let actionString = action.toString();
            if (data.estado == "") {data.estado = 0};
            let dataUpdate = {
                'action': actionString,
                'auth_item': data.auth_item,
                'controller': data.controller,
                'estado': parseInt(data.estado),
                'id_profile_view': data.id_profile_view,
            }
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/auth-profile-view/update/${data.id_profile_view}`, dataUpdate, (data, error) => {
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

    getAuthProfileView = () => {
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/auth-profile-view/get?all', (response, error) => {
            if (!error) {
                this.setState({ dataEndpointPermissions: response.data });
                this.handleExpandEndpointPermissions.setDataProvider(this.state.dataEndpointPermissions);
                this.setState({ load: false});   
            }
        });
    }

    render() {
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <Modal title={this.state.title} isFull={true} autoOpen = {false} onRef={ref => this.modalNewEndpointPermission = ref} defaultButton={this.state.defaultButton} >
                    <div className="row">
                        <NewEndpointPermissionForm dataNewEndpointPermissionForm={this.state.dataNewEndpointPermissionForm} ref={ref => this.refModalEndpointPermission = ref}></NewEndpointPermissionForm>
                    </div>
                </Modal>
                <GridView idTable="tableEndpointPermissions" floatHeader={true} onRef={ref => this.handleExpandEndpointPermissions = ref} serializeRows={false} filter={true}
                columns={[
                    { attribute : 'id_profile_view', alias : 'ID' },
                    { attribute : 'auth_item', alias : 'Role' },
                    { attribute : 'action', alias : 'Endpoint' },
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
                                <a onClick={(e) => this.openModalEndpointPermission(data)} title="Edit endpoint"><i className="material-icons left black-text">mode_edit</i></a>
                                { 
                                    data.estado == 1 ?
                                    <a onClick={(e) => this.toggleEndpointPermissionStatus(e, data)} title="Disable endpoint"><i className="material-icons left teal-text">toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.toggleEndpointPermissionStatus(e, data)} title="Enable endpoint"><i className="material-icons left red-text">toggle_off</i></a>
                                }
                            </>
                        );
                    }},
                    /* { 
                        alias: 'Expand', 
                        expandCall : (data) => this.handleExpand(data)
                    }, */
                ]}
                />
            </>
        )
    }
}
