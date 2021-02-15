import React, { Component } from 'react'
import {CleverForm, CleverRequest, MComponentes } from 'clever-component-library'
import CleverConfig from '../../../../../../../config/CleverConfig'

export default class AddPermissionToRole extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataAddPermissionToRole: {},
            listPermissions: []
        }
    }

    getPermissions = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/auth-item/get?type=2', (response, error) => { 
            if (!error) {
                let permissions = [];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        permissions.push({value: data.name, option: data.description});
                    }
                });
                this.setState({listPermissions: permissions});
            }
        });
    }

    getData = () => {
        let data = this.refFormAddPermissionToRole.getData().values;
        let dataRole = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            dataRole.name = data.name;
            dataRole.description = data.description;
        }
        return dataRole;
    }

    componentDidMount() {
        this.getPermissions();
    }

    render() {
        return (
            <CleverForm
                id={'formModalAddPermissionToRole'}
                ref={ref => this.refFormAddPermissionToRole = ref}
                data={this.props.dataAddPermissionToRole}
                forms={[
                    {
                        inputs:[{
                            row: [
                                {type: 'select', size: 'col s12 m12 l12', name: 'name', label: 'Name', required: true, uppercase: true, options: this.state.listPermissions},
                            ]
                        }]
                    },
                ]}
            />
        )
    }
}
