import React, { Component } from 'react'
import 'clever-component-library'
import { Card, Modal } from 'clever-component-library'
import Form from './Form'
import Table from './Table'

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEdit: false,
            iddef_media_headers: undefined,
            iddef_media: undefined,
        };
    }

    /* getConfigAddButtonsModal = () => {
        let buttons = [
            <button className="btn btn-success waves-effect waves-light" form={this.idForm} type="submit" onClick={() => this.saveData()}>
                <i className="material-icons right">save</i><span data-i18n="{{'SAVE'}}">save</span>
            </button>
        ];
        return buttons;
    } */

    closeModal = (data) => {
        this.refModal.getInstance().close();
    }
    
    openModal = (data) => {
        if (data.iddef_media_headers){
            this.setState({
                isEdit: true,
                iddef_media_headers: data.iddef_media_headers,
                iddef_media: data.iddef_media,
            });
        } else this.setState({isEdit: false});
        this.refModal.getInstance().open();
    }

    render() {
        return (
            <>
                <Modal idModal={'id-modalBannerForm'} isFull={true} title={this.state.isEdit ? {text: 'Edit banner'} : {text: 'New banner'}} onRef={modal => this.refModal = modal} defaultButton={{buttonClass: 'd-none'}}> {/* addButtons={this.getConfigAddButtonsModal()} */}
                    <Form closeModal={this.closeModal} isEdit={this.state.isEdit} iddef_media_headers={this.state.iddef_media_headers} iddef_media={this.state.iddef_media}/>
                </Modal>
                <Card 
                    id={'card-Form'}
                    header={'Banner configuration'}
                    control={
                        <a className={'btn btn-small'} onClick={this.openModal}>
                            <i className={'material-icons right'}>add</i>
                            add banner
                        </a>
                    }
                >
                    <Table openModal={this.openModal} />
                </Card>
            </>
        )
    }
}
