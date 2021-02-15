import React, { Component } from 'react'
import {CleverForm, CleverRequest, MComponentes, Chip } from 'clever-component-library'
import CleverConfig from '../../../../../../config/CleverConfig'

export default class NewEndpointPermissionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewEndpointPermissionForm: {},
            listRoles: [],
            dataChipsEndpoint: [],
        }
    }

    componentDidMount() {
        this.getRoles();
    }

    componentWillReceiveProps(props) {
        if (props.dataNewEndpointPermissionForm) {
            this.cleanValueChipEndpoint();
            let data = props.dataNewEndpointPermissionForm;
            if (data.action) {
                this.setValueChipEndpoint(data.action);
            }
        }
    }

    getRoles = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/auth-item/get?type=1', (response, error) => { 
            if (!error) {
                let roles = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        roles.push({value: data.name, option: data.description});
                    }
                });
                this.setState({listRoles: roles});
            }
        });
    }

    getData = () => {
        let data = this.refFormEndpointPermission.getData().values;
        let dataChips = this.getValueChipEndpoint();
        let dataEndpointPermission = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            //Hidden
            dataEndpointPermission.id_profile_view = data.id_profile_view;
            dataEndpointPermission.controller = data.controller;
            dataEndpointPermission.estado = data.estado;
            //Visible
            dataEndpointPermission.action = dataChips;
            dataEndpointPermission.auth_item = data.auth_item;
        }
        return dataEndpointPermission;
    }

    render() {
        return (
            <CleverForm
                id={'formModalEndpointPermission'}
                ref={ref => this.refFormEndpointPermission = ref}
                data={this.props.dataNewEndpointPermissionForm}
                forms={[
                    {
                        inputs:[{
                            row: [
                                //Hidden
                                {type: 'number', size: 'col s12 m12 l12', name: 'id_profile_view', label: 'ID', hidden: true},
                                {type: 'number', size: 'col s12 m12 l12', name: 'controller', label: 'Controller', hidden: true},
                                {type: 'number', size: 'col s12 m12 l12', name: 'estado', label: 'Status', hidden: true},
                                //Visible
                                {type: 'select', size: 'col s12 m12 l12', name: 'auth_item', label: 'Role', required: true, uppercase: true, options: this.state.listRoles},
                                {type:'component', size: 'col s12 m12 l12', name: 'action', required: true, uppercase: true,
                                    component: () => {
                                        return (
                                            <Chip
                                                id="id-endpoint"
                                                name="name-endpoint"
                                                setValue={set => {this.setValueChipEndpoint = set;}}
                                                getValue={get => {this.getValueChipEndpoint = get;}}
                                                cleanValue={clean => {this.cleanValueChipEndpoint = clean;}}
                                                readOnly={this.state.isView}
                                                options={{placeholder: "INSERT ENDPOINT", secondaryPlaceholder: "INSERT ENDPOINT"}}
                                                label={{t: "Endpoint", d: "{{'TAG'}}" }}
                                            />
                                        )
                                    }
                                },
                            ]
                        }]
                    },
                ]}
            />
        )
    }
}
