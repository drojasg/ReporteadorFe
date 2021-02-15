import React, { Component } from 'react'
import {CleverForm, MComponentes } from 'clever-component-library'

export default class NewRoleForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewRoleForm: {},
        }
    }

    getData = () => {
        let data = this.refFormRole.getData().values;
        let dataRole = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            dataRole.name = data.name;
            dataRole.description = data.description;
            dataRole.estado = data.estado;
        }
        return dataRole;
    }

    render() {
        return (
            <CleverForm
                id={'formModalRole'}
                ref={ref => this.refFormRole = ref}
                data={this.props.dataNewRoleForm}
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
