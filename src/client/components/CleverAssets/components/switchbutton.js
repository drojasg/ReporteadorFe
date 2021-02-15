import React,{ Fragment } from 'react';
import PropTypes from 'prop-types';
import {CleverRequest} from 'clever-component-library'
const Util = require('../../../components/gridView/auxGrid/Util');

/**
* Funcion que genera un control tipo switch para el manejo de los estados de un registro.
*/
export const SwitchButton = (props) => {

    const handleOnChange = (e) => {

        e.persist();

        let data = {
            estado: e.target.checked ? 1 : 0,
            usuario_ultima_modificacion : localStorage.username
        }

        CleverRequest.put(props.url+props.id,data,(response) => {
            if (response==null) {
                Util.getMsnDialog('info', 'Asset updated');
                e.target.checked = (data.estado == 1) ? true : false;
            } else {
                if(response.hasOwnProperty('error')){
                    if(response.error === false) {
                        Util.getMsnDialog('info', 'Asset updated');
                        e.target.checked = (data.estado == 1) ? true : false;
                    }else{
                        Util.getMsnDialog('warning', 'There was a error');
                        e.target.checked = !e.target.checked;
                    }
                }else {
                    Util.getMsnDialog('info', 'Asset updated');
                    e.target.checked = !e.target.checked;
                }

            }
        });

    }
    return  (
        props.type =='link' ?
            <a className="switch">
                <label style={{ color: props.style }}>
                    <b>Inactive</b>
                    <input type="checkbox" name={props.name} checked={props.checked} onChange={handleOnChange}/>
                    <span className="lever"></span>
                    <b>Active</b>
                </label>
            </a> :
            <div className="switch">
                <label style={{ color: props.style }}>
                    <b>Inactive</b>
                    <input type="checkbox" name={props.name} checked={props.checked} onChange={handleOnChange} />
                    <span className="lever"></span>
                    <b>Active</b>
                </label>
            </div>
    );
}

SwitchButton.propTypes = {
    name : PropTypes.string.isRequired,
    checked : PropTypes.bool,
    url : PropTypes.string,
    type : PropTypes.string,
    change: PropTypes.func,
    style: PropTypes.string,
};

SwitchButton.defaultProps = {
    name : '',
    checked : false,
    url : '',
    change: () => {},
    type : 'content',
    style: 'black'
};
