import React, { Component } from 'react'
import { CleverRequest, CleverInputSelect, CleverButton, CleverAccordion, Modal, MComponentes } from 'clever-component-library'
import CleverConfig from '../../../../../../config/CleverConfig'

import Permissions from './permissions/Permissions'
import Roles from './roles/Roles'

export default class RolesAndPermissions extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.btnAddRole = React.createRef();
        this.btnAddPermission = React.createRef();
    }

    render() {
        return (
            <div className="row">
                <CleverAccordion id="id-cleverAccordion-rolesAndPermissions" accordion={{
                    head: [
                        { accordion:'roles', label:'Roles', controls:[{control: <button type="button" ref={this.btnAddRole} id="id-btn-AddRole" className="btn">Add new role</button>}]},
                        { accordion:'permissions', label:'Permissions', controls:[{control: <button type="button" ref={this.btnAddPermission} id="id-btn-AddPermission" className="btn">Add new permission</button>}]},
                    ],
                    body: [
                        { 
                            roles: <Roles btnAddRole={this.btnAddRole}/>, 
                            permissions: <Permissions btnAddPermission={this.btnAddPermission}/> 
                        }
                    ],
                }}/>
            </div>
        )
    }
}
