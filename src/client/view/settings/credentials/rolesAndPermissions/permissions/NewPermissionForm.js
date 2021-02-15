import React, { Component } from 'react'
import {CleverForm, MComponentes } from 'clever-component-library'

export default class NewPermissionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewPermissionForm: {},
        }
    }

    getData = () => {
        let data = this.refFormPermission.getData().values;
        let dataPermission = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            dataPermission.name = data.name;
            dataPermission.description = data.description;
            dataPermission.estado = data.estado;
        }
        return dataPermission;
    }

    render() {
        return (
            <CleverForm
                id={'formModalPermission'}
                ref={ref => this.refFormPermission = ref}
                data={this.props.dataNewPermissionForm}
                forms={[
                    {
                        inputs:[{
                            row: [
                                {type: 'text', size: 'col s12 m4 l4', name:'name', label:'Name', required: true, uppercase: true},
                                {type: 'text', size: 'col s12 m4 l4', name: 'description', label: 'Description', required: true, uppercase: true},
                                {type: 'select', size: 'col s12 m4 l4', name: 'estado', label: 'Status', required: true, uppercase: true, options: [
                                    {value: 0, option: 'Inactive'},
                                    {value: 1, option: 'Active'},
                                ]},
                            ]
                        }]
                    },
                ]}
            />
        )
    }
}
