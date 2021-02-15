import React, { Component } from 'react'
import {CleverForm} from 'clever-component-library'

export default class NewTimeZone extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewTimeZoneForm: {},
        }
    }

    getData = () => {
        let data = this.refFormTimeZone.getData().values;
        let dataTimeZone = {};
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            dataTimeZone.iddef_time_zone = data.iddef_time_zone;
            dataTimeZone.name = data.name;
            dataTimeZone.code = data.code;
            dataTimeZone.estado = data.estado;
        }
        return dataTimeZone;
    }

    render() {
        return (
            <CleverForm
                id={'formModalTimeZone'}
                ref={ref => this.refFormTimeZone = ref}
                data={this.props.dataNewTimeZoneForm}
                forms={[
                    {
                        inputs:[{
                            row: [
                                {type: 'number', size: 'col s12 m4 l4', name:'iddef_time_zone', label:'ID', hidden:true},
                                {type: 'text', size: 'col s12 m4 l4', name:'name', label:'*Name', placeholder: 'Insert name', required: true },
                                {type: 'text', size: 'col s12 m4 l4', name: 'code', label: '*Code', placeholder: 'Insert code', required: true},
                                {type: 'select', size: 'col s12 m4 l4', name: 'estado', label: '* Status', placeholder: 'Select status', required: true, options: [
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
