/**
 * @class Copy and paste
 * @version 0.0.1
 * @author Erick Daniel Sanchez Dzul
 * @summary Componente de la página de inicio
 */

import React from "react";
// import Imgpaste from "../../component/copypaste/Imgpaste";
// import {Loading,Modal,Form,Util,CleverConfig,CleverMethodsApi} from 'clever-component-library';

export default class ListImg extends React.Component {
    constructor(props) {
        React.createRef();
        super(props);
        this.state = {
            _state_list:[],
        };
        this._handleDelete = this._handleDelete.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.previewAsset = this.previewAsset.bind(this);
    }

    _handleDelete(e, algo){
        this.props.sendArray(algo);
    }

    handleChange(event, position) {
        const input = event.target;

        let list = this.props._state_list;
        list[position].descripcion = input.value;
        if (input.type == "text") {
            // input.checked ? this.setState({ [input.name]: true }) : this.setState({ [input.name]: false });
            this.setState({ [input.name]: input.value, _state_list:list});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps._state_list !== this.state._state_list) {
            let _state_list = this.props._state_list;
            this.setState({
                _state_list,
            });
        }
    }

    previewAsset(a){
        switch (a.type){
            case "1":
                return(
                    <img src={a.file} className="responsive-img" />
                );
            break;
            case "2":
                return(
                    <video  src={ a.file } width='100%' controls autostart="true" autoPlay={true}></video>
                );
            break;
            case "3":
                return(
                    <embed type="application/pdf" src={`http://docs.google.com/gview?url=${a.file}&embedded=true`} width="100%" height="100%" />
                )
            break;
            default:
            return <div> Not files found </div>
        }
    }

    render() {
        return (
            <div className="row">
                {this.props._state_list.map((a, b) => {
                    return (
                        <div key={b} className="col s12 l6">
                            <ul className="collection">
                                <li className="collection-item avatar">
                                    {this.previewAsset(a)}
                                    <span className="title">{a.titulo}</span>
                                    <a href="#!" className="secondary-content" onClick={(e)=> {this._handleDelete(e,b)}} >
                                        <i className="material-icons" style={{ color: "#E70808" }}>
                                            delete_forever
                                        </i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    );
                })}
            </div>
        );
    }
}

ListImg.defaultProps = {
    _state_list: [],
    description: false,
    sendArray: ((algo) => { }),
};