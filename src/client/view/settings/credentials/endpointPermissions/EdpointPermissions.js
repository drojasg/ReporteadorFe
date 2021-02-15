import React, { Component } from 'react'
import { Card } from 'clever-component-library'

import EndpointPermissionsTable from './EndpointPermissionsTable'

export default class EndpointPermissions extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.btnAddEndpointPermission = React.createRef();
    }

    render() {
        return (
            <div className="row">
                <Card id="card-endpointPermissions" header={'Endpoint permissions'} control={
                    <button type="button" ref={this.btnAddEndpointPermission} id="id-btn-AddEndpointPermission" className="btn btn-small">
                        <i className={'material-icons right'}>add</i>
                        add new
                    </button>
                }>
                    <EndpointPermissionsTable btnAddEndpointPermission={this.btnAddEndpointPermission}/>
                </Card>
            </div>
        )
    }
}
