import React from 'react';
import PropTypes from 'prop-types';

import { uniqueID } from 'clever-component-library/build/node/Util';

import { MComponentes } from 'clever-component-library';

import './modal.css';

export default class Modal extends React.Component 
{

    constructor(props)
    {
        super(props);
        this.state = {};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    };

    componentDidMount()
    {
        MComponentes.Modal('div[id='+this.props.id+'].modal',{
            dismissible:false,
            preventScrolling:false
        });
    };

    openModal()
    {
        MComponentes.Modal('div[id='+this.props.id+'].modal',{
            dismissible:false,
            preventScrolling:false
        })[0].open();
    };

    closeModal()
    {
        MComponentes.Modal('div[id='+this.props.id+'].modal',{
            dismissible:false,
            preventScrolling:false
        })[0].close();
    };

    render() 
    {
        let {children} = this.props;

        return (
            <div className='modal-action'>
                {
                    Object.keys(this.props.btnOpen).length > 0
                    ?
                    <div className={this.props.btnOpen.size}>
                        <div className='btn-field'>
                            <a 
                                href={'#'+this.props.id}
                                className={'modal-trigger btn btn-full-size'} 
                                onClick={this.props.btnOpen.onClick}
                            >
                                <i className='material-icons'>{this.props.btnOpen.icon} </i>
                                <span className={'btn-label'}>{this.props.btnOpen.label}</span>
                            </a>
                        </div>
                    </div>
                    : null
                }
                <div id={this.props.id} className={'modal modal-fixed-footer '+this.props.size}>
                    <div className="modal-header">
                        {this.props.title}
                        {
                            this.props.controls.length > 0
                            ? 
                            <div className="controls">
                                {
                                    this.props.controls.map(control => 
                                    {
                                        return(
                                            control
                                        );
                                    })
                                }
                            </div>
                            : null
                        }
                    </div>
                    <div className="modal-content">
                        {children}
                    </div>
                    <div className="modal-footer">
                        <div className={Object.keys(this.props.btnAction).length > 0 ? 'col s12 m3 l3 push-m6 push-l6' : 'col s12 m3 l3 push-m9 push-l9'}>
                            <div className='btn-field'>
                                <a className={'btn btn-warning btn-full-size'} onClick={this.closeModal}>
                                    <i className='material-icons'>clear</i>
                                    <span className='btn-label'>close</span> 
                                </a>
                            </div>
                        </div>
                        
                        {
                            Object.keys(this.props.btnAction).length > 0
                            ?
                            <div className='col s12 m3 l3 push-m6 push-l6'>
                                <div className='btn-field'>
                                    <a 
                                        className={'btn btn-full-size'}
                                        onClick={this.props.btnAction.onClick}
                                    >
                                        <i className='material-icons'>{this.props.btnAction.icon}</i>
                                        <span className='btn-label'>{this.props.btnAction.label}</span>
                                    </a>
                                </div>
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>
        );
    };
};

Modal.ropTypes = {
    id : PropTypes.string,
    size : PropTypes.string,
    title : PropTypes.string,
    controls : PropTypes.array,
    btnOpen : PropTypes.object,
    btnAction : PropTypes.object,
};

Modal.defaultProps = {
    id : uniqueID(),
    size : '',
    title : '',
    controls : [],
    btnOpen : {},
    btnAction : {},
};