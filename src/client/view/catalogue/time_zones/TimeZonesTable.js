import React, { Component } from 'react'
import { CleverLoading, GridView, CleverRequest, Modal, MComponentes } from 'clever-component-library'
import CleverConfig from '../../../../../config/CleverConfig'
import NewTimeZoneForm from './NewTimeZoneForm'

export default class TimeZonesTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            dataTimeZones: [],
            title: {},
            isEdit: false,
        };
        this.handleExpandTimeZones = React.createRef();
    }

    componentDidMount() {
        this.getTimeZone();
        this.props.btnAddTimeZone.current ? document.getElementById(this.props.btnAddTimeZone.current.id).addEventListener("click", e => this.openModalTimeZone(e)) : null;
    }

    reload = () => {
        this.getTimeZone();
        this.componentDidMount();
    }

    openModalTimeZone = (data) => {        
        if (typeof(data.name) === 'string') {
            this.setState({isEdit: true});
            //UPDATE DATA
            this.setState({
                dataNewTimeZoneForm: {
                    iddef_time_zone: data.iddef_time_zone,
                    name: data.name,
                    code: data.code,
                    estado: data.estado,
                },
                title: {
                    text: "Currently updating: " + data.name,
                },
            }, () => this.modalNewTimeZone.getInstance().open());
        } else {
            this.state.isEdit ? this.setState({isEdit: false}) : null;
            //NEW ROLE
            this.setState({
                dataNewTimeZoneForm:{
                    iddef_time_zone: '',
                    name: '',
                    code: '',
                    estado: '',
                },
                title: {
                    text: "Add time zone",
                },
            }, () => this.modalNewTimeZone.getInstance().open());
        }
    }

    saveData = () => {
        let data =  this.refModalTimeZone.getData();
        let dataSave = {
            'name': data.name,
            'code': data.code,
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/time-zone/create', dataSave, (data, error) => {
                if (data.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";
                    if (!data.Error) {
                        notificationType = "success";
                        notificationMessage = "The data was saved";
                        this.reload();
                        this.modalNewTimeZone.getInstance().close();
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

    toggleTimeZoneStatus = (e, data) => {
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
                'iddef_time_zone': data.iddef_time_zone,
                'name': data.name,
                'code': data.code,
                'estado': parseInt(estado),
            }
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/time-zone/update/${data.iddef_time_zone}`, dataUpdate, (data, error) => {
                    if (data.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";
                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.reload();
                            this.modalNewTimeZone.getInstance().close();
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
            let data =  this.refModalTimeZone.getData();
            if (data.estado == "") {data.estado = 0};
            let dataUpdate = {
                'iddef_time_zone': data.iddef_time_zone,
                'name': data.name,
                'code': data.code,
                'estado': parseInt(data.estado),
            }
            if (data.required > 0) {
                MComponentes.toast("Complete the data required");
                this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            } else {
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/time-zone/update/${data.iddef_time_zone}`, dataUpdate, (data, error) => {
                    if (data.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        let notificationType = "";
                        let notificationMessage = "";
                        if (!data.Error) {
                            notificationType = "success";
                            notificationMessage = "The data was saved";
                            this.reload();
                            this.modalNewTimeZone.getInstance().close();
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

    getTimeZone = () => {
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/time-zone/get?all', (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                this.setState({ dataTimeZones: response.data });
                this.handleExpandTimeZones.setDataProvider(this.state.dataTimeZones);
                this.setState({ load: false});   
            }
        });
    }

    getConfigAddButtonsModal() {
        let buttons;
        if (this.state.isEdit) {
            buttons = [
                <button className="btn waves-effect waves-light" onClick={e => this.saveData(e)} >
                    <i className="material-icons right">save</i><span data-i18n="{{'SAVE'}}">Save changes</span>      
                </button>
            ];
        } else {
            buttons = [
                <button className="btn waves-effect waves-light" onClick={e => this.saveData(e)} >
                    <i className="material-icons right">add</i><span data-i18n="{{'ADD'}}">Add</span>      
                </button>
            ];
        }
        return buttons;
    }

    render() {
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <Modal title={this.state.title} isFull={true} autoOpen = {false} onRef={ref => this.modalNewTimeZone = ref} addButtons={this.getConfigAddButtonsModal()} >
                    <div className="row">
                        <NewTimeZoneForm dataNewTimeZoneForm={this.state.dataNewTimeZoneForm} ref={ref => this.refModalTimeZone = ref}></NewTimeZoneForm>
                    </div>
                </Modal>
                <GridView idTable="tableTimeZones" floatHeader={true} onRef={ref => this.handleExpandTimeZones = ref} serializeRows={false} filter={true}
                columns={[
                    { attribute : 'iddef_time_zone', alias : 'ID', visible: false },
                    { attribute : 'name', alias : 'Name' },
                    { attribute : 'code', alias : 'Code' },
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
                                <a onClick={(e) => this.openModalTimeZone(data)} title="Edit time zone"><i className="material-icons left black-text">mode_edit</i></a>
                                { 
                                    data.estado == 1 ?
                                    <a onClick={(e) => this.toggleTimeZoneStatus(e, data)} title="Disable time zone"><i className="material-icons left teal-text">toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.toggleTimeZoneStatus(e, data)} title="Enable time zone"><i className="material-icons left red-text">toggle_off</i></a>
                                }
                            </>
                        );
                    }},
                ]}
                />
            </>
        )
    }
}
