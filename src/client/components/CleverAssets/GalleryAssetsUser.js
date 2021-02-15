import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import LocalContentAssets from './LocalContentAssets';
import { AssetsView, ComponentAsset, HeaderAssetsView } from './AssetsView';
import { SwitchButton } from './components/switchbutton';
import PropTypes from 'prop-types';
import {Modal, Card,CleverRequest} from 'clever-component-library'
import CleverConfig from '../../../../config/CleverConfig'


export default class GalleryAssetsUser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            assetGallery: [],
            assetFilter: [],
            idgallery: 0,
            dataUpdate: [],
            rule_name: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleShowAssets = this.handleShowAssets.bind(this);
        this.handleGetAssets = this.handleGetAssets.bind(this);
        this.AssetsRequest = this.AssetsRequest.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeForm = this.handleChangeForm.bind(this);
        this.handleCreate = this.handleCreate.bind(this);

    }

    componentDidMount() {
        if (this.props.onlygallery) {
            CleverRequest.get(this.props.urlOnlyGallery, (response) => {
                if (response.error == false) {
                    this.setState({
                        assetGallery: response.data,
                        assetFilter: response.data
                    })
                } else {
                    this.setState({
                        assetGallery: [],
                        assetFilter: []
                    });
                }
            });
        } else {
            this.setState({
                assetGallery: this.props.dataGallery,
                assetFilter: this.props.dataGallery,
            })
        }
    }

    handleChange(e) {
        let data = this.state.assetGallery;
        this.setState({ assetFilter: this.setFilterComponent(e, data) });
    }

    handleChangeForm(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSubmit() {
        let save_data = {};

        save_data['name'] = this.state.name;
        save_data['description'] = this.state.description;
        save_data['id'] = this.state.dataUpdate[this.props.rowUpdateGallery];
        return this.props.updateGallery(save_data);
    }

    setFilterComponent(e, data) {
        return data.filter(x => x.description.toLowerCase().includes(e.target.value.toLowerCase()))
    }

    handleShowAssets(id, mimeType, name) {

        const portal_Asset = document.getElementById('clever-assets-management-body');
        let data = this.handleGetAssets(id, this.props.urlPaginador, (err, response) => {
            return render(
                <LocalContentAssets
                    onlygallery={this.props.onlygallery}
                    assettype={this.props.assettype}
                    mimeType={mimeType}
                    idfrm_sistema={this.props.idfrm_sistema}
                    byMarket={this.props.byMarket}
                    byResorts={this.props.byResorts}
                    saveAsset={this.props.saveAsset}
                    typesActive={this.props.typesActive}
                    mode={this.props.mode}
                    bucket={this.props.bucket}
                    urlAssetTypes={this.props.urlAssetTypes}
                    method={this.props.method}
                    gallery={this.props.gallery}
                    urlAssetGallery={this.props.urlAssetGallery}
                    onGallerySave={this.props.onGallerySave}
                    dataGallery={this.state.assetGallery}
                    urlUpdateAsset={this.props.urlUpdateAsset}
                    urlCoreGallery={this.props.urlCoreGallery}
                    urlOnlyGallery={this.props.urlOnlyGallery}
                    position={3}
                    urlPaginador={this.props.urlPaginador}
                    rowUpdate={this.props.rowUpdate}
                    urlUpdateGallery={this.props.urlUpdateGallery}
                    rowUpdateGallery={this.props.rowUpdateGallery}
                    saveGalleryAction={this.props.saveGalleryAction}
                    idgallery={id}
                    onBucketSave={this.props.onBucketSave}
                    onSelectGallery={this.props.onSelectGallery}
                >
                    <React.StrictMode>
                        <AssetsView>
                            <HeaderAssetsView> {'Gallery ' + name + ' Content'} </HeaderAssetsView>
                            <ComponentAsset
                                mimeType={mimeType}
                                data={response}
                                urlUpdateAsset={this.props.urlUpdateAsset}
                                urlPaginationAssets={this.props.urlPaginador}
                                isGallery={true}
                                idgallery={id}
                                rowUpdate={this.props.rowUpdate}
                            />
                        </AssetsView>
                    </React.StrictMode>
                </LocalContentAssets>
                , portal_Asset
            );
        })
    }

    handleGetAssets(id_gallery, urlPaginador, callback) {

        let _url = urlPaginador.urlTotalAssetByGallery;
        let data = [];
        let url = _url + "/" + id_gallery;
        let request = this.AssetsRequest(url, 'get', data, callback);
    }

    AssetsRequest(url = "", _method = 'get', data = [], success) {

        let api_method = _method.toLowerCase();

        if (api_method == "get") {
            return CleverRequest.get(url, (response) => {
                if (!response.error) {
                    return (response.hasOwnProperty("data")) ? success(false, response.data[0].total) : success(false, response);

                }
                return success(turlUpdateAssetue, response);
                //return this.setState({galleryAssets:{error:true , message: 'An error has ocurred'}});
            }, false);
        }
    }

    handleCreate(data) {
        this.setState({
            dataUpdate: data,
            description: data.description,
            name: data.name
        }, () => {

            let content = <div>
                <form id="form-gallery-update">
                    <div className="row">
                        <div className="col s6 m6 l6">
                            <label>Name</label>
                            <input type='text' defaultValue={data.name} id="name" name='name' onChange={(e) => { this.handleChangeForm(e) }} />
                        </div>
                        <div className="col s6 m6 l6">
                            <label>Description</label>
                            <input type='text' defaultValue={data.description} id="description" name='description' onChange={(e) => { this.handleChangeForm(e) }} />
                        </div>
                    </div>
                </form>
            </div>;
            this.refModalGalleryUpdate.setContentModal(content);
            this.refModalGalleryUpdate.setHeaderModal(<span>Update Gallery</span>);
            return this.refModalGalleryUpdate.openModal();
        });
    }

    render() {

        return (
            <div className="col s12 m12 l12 xl12" >
                <h5>User Gallery Content</h5>
                <div className="col s12 m12 l12 xl12">
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="nameSearch" type="search" onChange={this.handleChange} className="validate" />
                            <i className="material-icons">search</i>
                        </div>
                        {
                            this.state.assetFilter.map((gallery, idx) =>
                                <div className="col s12 m4" key={idx}>
                                    <Card
                                        title={{ default: gallery.name, data_i18n: "{{'GOLF'}}" }}
                                        isPanel={false}
                                        classCard={ {card:"small"} }
                                        control={
                                            <React.Fragment>
                                                <SwitchButton
                                                    name="estado"
                                                    checked={(gallery.estado == 1) ? true : false}
                                                    id={gallery[this.props.rowUpdateGallery]}
                                                    url={this.props.urlUpdateGallery}
                                                    type='link'
                                                    style='white'
                                                />
                                                <a className="btn btn-icon btn-link" onClick={() => this.handleCreate(gallery)}>
                                                    <i className="material-icons">edit</i>
                                                </a>
                                            </React.Fragment>
                                        }
                                        action={
                                            <React.Fragment>
                                                <a onClick={(e) => this.handleShowAssets(gallery[this.props.rowUpdateGallery], this.props.mimeType, gallery.name)}><i className="material-icons left">visibility</i>View</a>
                                            </React.Fragment>
                                        }
                                    >
                                        <p>{gallery.description}</p>
                                    </Card>
                                </div>
                            )
                        }
                    </div>
                </div>
                <Modal
                    idModal="modal-gallery-edit"
                    modalClass="modal-fixed-footer"
                    onRef={modal => this.refModalGalleryUpdate = modal}
                    addButtons={[
                        <button className="btn waves-effect waves-light" form={this.idForm} type="submit" onClick={() => this.handleSubmit()}>
                            <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                        </button>
                    ]}
                />
            </div>
        );
    }
}


GalleryAssetsUser.propTypes = {
    onlygallery: PropTypes.bool,
    onBucketSave: PropTypes.func,
    onGallerySave: PropTypes.func,
    updateGallery: PropTypes.func,
    idfrm_sistema: PropTypes.number,
    assettype: PropTypes.number,
    byMarket: PropTypes.bool,
    byResorts: PropTypes.bool,
    mode: PropTypes.string,
    bucket: PropTypes.string,
    dataAssets: PropTypes.object, //Aqui esto parece que no se usa
    urlAssetTypes: PropTypes.string,
    method: PropTypes.string,
    gallery: PropTypes.bool,
    urlAssetGallery: PropTypes.string,
    urlUpdateAsset: PropTypes.string,
    urlCoreGallery: PropTypes.string,
    urlOnlyGallery: PropTypes.string,
    dataGallery: PropTypes.array,
    typesActive: PropTypes.array,
    urlPaginador: PropTypes.object,
    rowUpdate: PropTypes.string,
    urlUpdateGallery: PropTypes.string,
    rowUpdateGallery: PropTypes.string,
    saveGalleryAction: PropTypes.func,
    onSelectGallery: PropTypes.func,
};

GalleryAssetsUser.defaultProps = {
    onlygallery: false,
    onBucketSave: (context) => { },
    onGallerySave: (context) => { },
    updateGallery: (context) => { },
    onSelectGallery: (context) => { },
    byMarket: false,
    idfrm_sistema: 0,
    assettype: 0,
    byResorts: false,
    mode: 'cliente', // cliente / admin
    bucket: 'core',
    dataAssets: {}, //Hay que revisar si se usa o nel
    method: 'get',
    urlAssetTypes: CleverConfig.getApiUrl('core') + '/assettype/getassetstype',
    gallery: false,
    urlAssetGallery: "",
    urlUpdateAsset: "",
    urlCoreGallery: "",
    urlOnlyGallery: "",
    dataGallery: [],
    typesActive: [],
    urlPaginador: {},
    rowUpdate: "",
    urlUpdateGallery: "",
    rowUpdateGallery: "",
    saveGalleryAction: (context) => { },
};

const alertWarning = {
    padding: '20px',
    backgroundColor: '#f44336',
    color: 'white',
    opacity: 1,
    transition: 'opacity 0.6s',
    marginBottom: '15px',
    backgroundColor: '#ff9800'
};
