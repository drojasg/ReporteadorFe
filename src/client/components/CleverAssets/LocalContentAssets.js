/**
 *  this.props.position : 0
 *  Marca la posición en la que se encuentra el usuario relativo a la vista
 *  position : 1 -> Vista de Tipos de Assets
 *  position : 2 -> Vista de Galerias
 *  position : 3 -> Vista de Assets
 */

//LocalContentAssets
import React, { Component } from 'react';
import { render, createPortal } from 'react-dom';
import AssetsType from './AssetsType';
import Upload from './../upload/Upload';
import PropTypes from 'prop-types';
import CleverAsset from './CleverAsset';
import RightSideNav from './components/SideNav/RightSideNav';
import Pagination from './components/pagination';
import ListImg from './components/listimg';

import {CleverRequest, Chip, Modal,SelectInput,Dropdown, Card, CleverLoading, MComponentes} from 'clever-component-library'
import CleverConfig from '../../../../config/CleverConfig'
const Util = require('../../components/gridView/auxGrid/Util');


class LocalContentAssets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader:false,
            error: false,
            errorInfo: null,
            typesActive: [],
            assetscore: [],
            totalRecords: 500,
            pageLimit: 50,
            value: "",
            valueTextArea: "",
            list: [],
            pasting: false,
            descripcion:"",
            clearlist:true,
            isChecked: false,
            disabledInput: false,
        };
        this.formAsset = "";
        this.formGallery = "";
        this.getCatchError = this.getCatchError.bind(this);
        this.handleBackToAssetsType = this.handleBackToAssetsType.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleCreateGallery = this.handleCreateGallery.bind(this);
        this.handleNavClik = this.handleNavClik.bind(this);
        this.setCustomTags = this.setCustomTags.bind(this);
        this.getFileExtension = this.getFileExtension.bind(this);
        this.onPageChanged = this.onPageChanged.bind(this);
        this.saveFromCore = this.saveFromCore.bind(this);

        this.handleChangeText = this.handleChangeText.bind(this);
        this.paste = this.paste.bind(this);
        this.isLink = this.isLink.bind(this);
        this.onLinkSave = this.onLinkSave.bind(this);
        this.typeId= 1;
        this.handlepropiedad = this.handlepropiedad.bind(this);
        // this.getdataselectTypeAccept=this.getdataselectTypeAccept.bind(this);

    }

    componentDidMount() {
        const init = () => {
            this.formAsset = document.getElementById('form-assets-manager');
            this.formGallery = document.getElementById('form-gallery-manager');
        };

        this._isMounted = true;
        init();
    }

    isLink(){
        this.setState( { isChecked: !this.state.isChecked } );
    }   

    componentWillUnmount() { this._isMounted = false; }

    handleBackToAssetsType() {
        const portal_Asset = document.getElementById('clever-assets-management-body');

        return render(
            <div>
                {
                    this.props.onlygallery ?
                        <CleverAsset
                            onlygallery={this.props.onlygallery}
                            byMarket={this.props.byMarket}
                            byResorts={this.props.byResorts}
                            gallery={this.props.gallery}
                            idfrm_sistema={this.props.idfrm_sistema}
                            mode={this.props.mode}
                            onBucketSave={this.props.onBucketSave}
                            updateGallery={this.props.updateGallery}
                            onGallerySave={this.props.onGallerySave}
                            urlAssetTypes={this.props.urlAssetTypes}
                            urlAssetGallery={this.props.urlAssetGallery}
                            urlCoreGallery={this.props.urlCoreGallery}
                            urlUpdateAsset={this.props.urlUpdateAsset}
                            rowUpdate={this.props.rowUpdate}
                            urlUpdateGallery={this.props.urlUpdateGallery}
                            rowUpdateGallery={this.props.rowUpdateGallery}
                            urlPaginador={this.props.urlPaginador}
                            idgallery={this.props.idgallery}
                            onSelectGallery={this.props.onSelectGallery}
                            urlOnlyGallery={this.props.urlOnlyGallery}
                        ></CleverAsset>
                        :
                        <AssetsType
                            onlygallery={this.props.onlygallery}
                            idfrm_sistema={this.props.idfrm_sistema}
                            byMarket={this.props.byMarket}
                            byResorts={this.props.byResorts}
                            onBucketSave={this.props.onBucketSave}
                            updateGallery={this.props.updateGallery}
                            bucket={this.props.bucket}
                            mode={this.props.mode}
                            urlAssetTypes={this.props.urlAssetTypes}
                            gallery={this.props.gallery}
                            urlAssetGallery={this.props.urlAssetGallery}
                            onGallerySave={this.props.onGallerySave}
                            urlUpdateAsset={this.props.urlUpdateAsset}
                            urlCoreGallery={this.props.urlCoreGallery}
                            dataGallery={this.props.dataGallery}
                            position={this.props.position}
                            urlPaginador={this.props.urlPaginador}
                            rowUpdate={this.props.rowUpdate}
                            urlUpdateGallery={this.props.urlUpdateGallery}
                            rowUpdateGallery={this.props.rowUpdateGallery}
                            saveGalleryAction={this.props.saveGalleryAction}// Revisar si aún se usa
                            idgallery={this.props.idgallery}
                            onSelectGallery={this.props.onSelectGallery}
                            urlOnlyGallery={this.props.urlOnlyGallery}
                        />
                }
            </div>
            , portal_Asset);
    }

    /**
     * @name beforeSave
     * @description Función que valida el formulario para insertar o actualizar un registro
     * del catálogo y guardado para su uso posteriormente.
     * @param method Tipo que se esta validando POST | PUT (string)
     * @return boolean
    **/
    beforeSave(method) {
        const data = Util.getValidateDataForm(this.formAsset, method);
        if (data.error) return false;
        if (this.typeId == 0) return false;
        return true;
    }

    /**
     * @name onBucketSave
     * @description Función que guarda la informacion del Asset
     * @param data Response del Asset guardado (json)
    **/
    onBucketSave(data = {}) {
        const dataForm = Util.getValidateDataForm(this.formAsset);

        if(dataForm.error){
            this.setState({loader: false})
            return false
        }else{
        data.data.tag = { "tags": this.refChips.getValue() };
        data.data.segmento_mercado = (this.props.byMarket) ? dataForm.data.market_segment : 0;
        data.data.idclv_propiedad = (this.props.byResorts) ? dataForm.data.id_resort : 0;
        data.data.idfrm_sistema = (this.props.idfrm_sistema > 0) ? this.props.idfrm_sistema : dataForm.data.idfrm_sistema;
        data.data.id_gallery = (this.props.gallery) ? this.props.idgallery : 0;
        data.data.estado = 1;
        data.data.publico = 1;
        data.data.description = dataForm.data.descripcion;
        data.data.refupload = this.refupload;
        data.data.formAsset = this.formAsset;
        data.data.refChips = this.refChips;
        this.setState({loader: false})
        return this.props.onBucketSave(data);
        }
    }

    /**
     *  @name onLinkSave
     *  @description Función que guarda la información del Asset por Link
     */
    onLinkSave(){

        const dataForm = Util.getValidateDataForm(this.formAsset);
        console.log('dataForm_onLinkSave: ', dataForm);
        
        /**
         * guardar en bucket imagen de preview
         * en el callback guardar el URL del Tour
         * https://my.matterport.com/show/?m=MXXESu2BVze
         */

        if(dataForm.error) return false;
        let sendData = {};
        
        sendData.iddef_media_type = 4;
        sendData.iddef_media_group = (this.props.gallery) ? this.props.idgallery : 0;
        sendData.url = this.state.valueTextArea;
        sendData.description = dataForm.data.descripcion;
        sendData.nombre_bucket = 'webfiles_palace';
        sendData.bucket_type = 1;
        sendData.etag = 'et';
        sendData.show_icon = 0;
        sendData.name = dataForm.data.nameFile;
        sendData.tags = JSON.stringify({ "tags": this.refChips.getValue() });
        sendData.estado = 1;
        
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/media/create`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    MComponentes.toast(response.Msg);
                    console.warn(response);
                }else{
                    MComponentes.toast(response.error);
                }
            }else{
                MComponentes.toast(error);
            }
        }); 

        // return this.props.onBucketSave(response);

    }

    /**
     * @name handleCreate
     * @description Función que guarda la información temporalmente para posteriormente ser guardada
    **/
    handleCreate() {
        this.method = "POST";
        this.url = this.urlBase + "/post";
        this.setState({isChecked: false},() => this.setState({isChecked: false}));
        this.formAsset.reset();
        this.refChips.clean();

        document.getElementById('upload-container').style.display = "inline";
        document.getElementById('buttonUpdate-container').style.display = "none";

        this.refModalForm.setHeaderModal(<span>Upload Asset</span>);
        this.refModalForm.openModal();
    }

    /**
     * @name handleCreateGallery
     * @description Funcion que guarda una nueva galeria
    */
    handleCreateGallery() {

        this.method = "POST";
        this.url = this.urlBase + "/post";
        this.formGallery.reset();
        this.refChips.clean();
        this.refModalGallery.setHeaderModal(<span>Add New Gallery</span>);
        this.refModalGallery.openModal();
    }

    /**
     * @name beforeSaveGallery
     * @description Función que valida el formulario para insertar o actualizar un registro
     * del catálogo y guardado para su uso posteriormente.
     * @param method Tipo que se esta validando POST | PUT (string)
     * @return boolean
    **/
    beforeSaveGallery(method) {
        const data = Util.getValidateDataForm(this.formGallery, method);
        if (data.error) return false;
        this.data = data.data;
        this.data.estado = 1;
        return true;
    }

    /**
     * @name saveGallery
     * @description Función que guarda la informacion del Asset
     * @param data Response del Asset guardado (json)
    **/
    saveGallery(data = {}) {
        const dataForm = Util.getValidateDataForm(this.formGallery);
        if (dataForm.error) return false;
        data.description = dataForm.data.description;
        data.name = dataForm.data.name;
        data.idasset_type = this.props.assettype;
        data.segmento_mercado = (this.props.byMarket) ? dataForm.data.segmento_group : 0;
        data.idclv_propiedad = (this.props.byResorts) ? dataForm.data.idclv_propiedad : 0;

        return this.props.onGallerySave(data);

    }

    componentDidCatch(error, info) {
        this.setState({
            error: error,
            errorInfo: info
        });
    }

    /**
     * Metodo que muestra el error cachado del componente
     * @return html element
     */
    getCatchError() {
        return (
            <React.StrictMode>
                <div className="col s12">
                    <h3>Oh-no! Something went wrong</h3>
                    <p className="red" style={{ color: 'white' }} >
                        {this.state.error && this.state.error.toString()}
                    </p>
                    <div>Component Stack Error Details:</div>
                    <p className="red" style={{ color: 'white' }}>
                        {this.state.errorInfo.componentStack}
                    </p>
                </div>
            </React.StrictMode>
        );
    }

    AssetsRequest(url = "", _method = 'get', data = [], success) {
        let api_method = _method.toLowerCase();
        if (api_method == "get") {
            return CleverRequest.get(url, (response) => {
                if (!response.error) {
                    return (response.hasOwnProperty("data")) ? success(false, response.data) : success(false, response);

                }
                return success(false, response);

            }, false);
        }
    }

    handleNavClik(e) {
        document.getElementById("clv-side-right-nav").style.width = "100%";
    }

    getFileExtension(filename) {
        return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
    }

    setCustomTags(data) {

        let tags = {};

        if (data.tags) {
            tags = (typeof (data.tags) === "string") ? JSON.parse(data.tags) : data.tags;
        }
        return (
            <div>
                {
                    (tags.tags) ? (
                        tags.tags.map((tag, idx) =>
                            <div key={idx} style={customTagStyle}> {tag} </div>
                        )
                    ) : (null)
                }
            </div>
        );
    }

    onPageChanged(data) {
        const range = data.pageLimit;
        const offset = (data.currentPage - 1) * data.pageLimit;
        const url = this.props.urlCoreGallery;

        CleverRequest.get(`${url}/${range}/${offset}`, (response) => {
            let assetCore = response;

            CleverRequest.get(`${this.props.urlPaginador.urlSearchAssetsByGallery}/${this.props.idgallery}`, (response) => {
                let assetgallery = response.data;

                let AssetList = assetCore.map((assets, id) => {

                    // let tags = (typeof(assets.tags) === "string") ? JSON.parse(assets.tags) : assets.tags;

                    let find = assets.idasset_gallery;
                    let found = this.search_gallery(assetgallery, find);

                    assets.available = true;
                    // assets.tags = tags;

                    if (found.length > 0) {
                        assets.available = false;
                    }

                    delete (assets.usuario_creacion);
                    delete (assets.fecha_creacion);
                    delete (assets.usuario_ultima_modificacion);
                    delete (assets.fecha_ultima_modificacion);

                    return assets;
                });

                this.setState({
                    assetscore: AssetList,
                })
            }, true);
        }, true
        )
    }

    search_gallery(data, find) {

        if (data) {
            return data.filter(
                function (data) { return data.id_asset_gallery == find }
            );
        }
        return true;
    }

    saveFromCore(data = {}) {
        data.gallery = true;
        data.idgallery = this.props.idgallery;
        data.segmento_mercado = 0;
        data.idfrm_sistema = this.props.idfrm_sistema;
        data.sidecontenteid = ''
        return this.props.onSelectGallery({ 'data': data });
    }

    handleChangeText(e) {
        console.log('URL_Change: ', e.target.value);
        this.setState({valueTextArea : e.target.value});
    }

    paste(e){
        let list = this.state.list;
        list.push({
            file: e.clipboardData.getData('Text'),
            type: this.typeId
        });
        this.setState({ list });
        this.setState({pasting: true, beforePasting: e.target.value, list});
    }

    handlepropiedad(fin){
        let array=this.state.list;
        array.splice(fin, 1);
        this.setState({ list:array });
        this.setState({valueTextArea : ""});
    }

        /**
    * Funcion para seleccionar el tipo de archivo a subir
    *
    */
   /*  getdataselectTypeAccept(e){
        this.typeId = e.selectedOption.value;
        this.setState({disabledInput : false});
    } */

    render() {
        let user = localStorage.username;

        const data = [
            { "value": "1", "text": "imagenes", acceptType: "image/*" }
        ];

        return (
            <React.StrictMode>
                <div className="row" >
                    <div className="col s6 m6 l6 xl6 right-left">
                        <a className="waves-effect waves-light btn" onClick={(e) => this.handleBackToAssetsType()}>
                            <i className="material-icons left">reply</i> Back
                        </a>
                    </div>
                    <div className="col s6 m6 l6 xl6 right-align">
                        {
                            (this.props.mode == 'admin' && this.props.position == 3 || this.props.mode == 'admin' && this.props.gallery == false) ?
                                <a className="waves-effect waves-light btn" onClick={this.handleCreate}>
                                    <i className="material-icons left">file_upload</i> Upload
                                </a> :
                                <div>
                                </div>
                        }

                        {
                            (this.props.position == 0 && this.props.gallery == true || this.props.onlygallery) ?
                                <a className="waves-effect waves-light btn" onClick={this.handleCreateGallery}>
                                    <i className="material-icons left">add_to_photos</i> Gallery
                                </a> :
                                <div>
                                </div>
                        }

                        {
                            (this.props.position == 3 && this.props.mode != 'admin' || this.props.gallery == false && this.props.mode != 'admin') ?
                                <a className="waves-effect waves-light btn" onClick={this.handleNavClik}>
                                    <i className="material-icons left">add_circle</i> Add
                                </a> :
                                <div>
                                </div>
                        }

                    </div>
                </div>
                <div className="divider report-divider" ></div>
                <div className="row" >
                    <div className="col s12 m12 l12 xl12 left">
                        {
                            this.props.children
                        }
                    </div>
                </div>

                <Modal onRef={modal => this.refModalForm = modal} showFooter={false}>
                    <form id="form-assets-manager">
                        <div className="row">
                            {
                                (this.props.byMarket) ?
                                    <div className=" file-field input-field col s12 m4">
                                        <SelectInput
                                            name="market_segment"
                                            required={true}
                                            label={{ text: "Market segment", i18n: "{{'GROUP SEGMENT'}}" }}
                                            url={CleverConfig.getApiUrl('core') + `/agrupadorcomercial/dropdown/idclv_agrupador_comercial/descripcion`}
                                            entity="dropdownDataActive"
                                            onRef={select => this.segmentGroup = select}
                                            disabled={false}
                                        />
                                    </div> : null
                            }

                            {(this.props.byResorts) ?
                                <div className=" file-field input-field col s12 m4">
                                    <SelectInput
                                        name="id_resort"
                                        required={true}
                                        label={{ text: "Resort", i18n: "{{'RESORT'}}" }}
                                        url={CleverConfig.getApiUrl('core') + `/propiedad/dropdown/idclv_propiedad/descripcion`}
                                        entity="dropdownDataActive"
                                        onRef={select => this.resortsRef = select}
                                        disabled={false}
                                    />
                                </div> : null
                            }

                            {
                                (this.props.idfrm_sistema === 0) ?
                                    <div className=" file-field input-field col s12 m4">
                                        <SelectInput
                                            name="idfrm_sistema"
                                            required={true}
                                            label={{ text: "System", i18n: "{{'SYSTEM'}}" }}
                                            url={CleverConfig.getApiUrl('frm') + `/sistema/dropdown/idfrm_sistema/nombre`}
                                            entity="dropdownDataActive"
                                            onRef={select => this.SystemRef = select}
                                            disabled={false}
                                        />
                                    </div> : null
                            }
                            {
                                (this.state.isChecked) ?
                                <div className="input-field col s12 m12">
                                    <input id="nameFile" type="text" name="nameFile" className="validate" autoComplete="off" required />
                                    <label htmlFor="nameFile" data-error="wrong" data-success="right"><span>name</span></label>
                                </div> :
                                null
                            }

                            <div className="input-field col s12 m12">
                                <input id="descripcion" type="text" name="descripcion" className="validate" autoComplete="off" required />
                                <label htmlFor="descripcion" data-error="wrong" data-success="right"><span>Description</span></label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col s12 m12">
                                <Chip
                                    onRef={ref => this.refChips = ref}
                                    label={{ t: "Tags", d: "{{'TAGS'}}" }}
                                    options={{ secondaryPlaceholder: "+ Tag" }} />
                            </div>
                        </div>
                    </form>
                    
                    <div className="row">
                        <div className="switch">
                            <label className="text-white">
                                <b>Images</b>
                                <input type="checkbox" name='isLink' checked={this.state.isChecked} onChange={this.isLink} />
                                <span className="lever"></span>
                                <b>Virtual Tour</b>
                            </label>
                        </div>
                    </div>
                    {
                        (this.state.isChecked) ? 
                        <div className="row">
                            <div style={contentFile}>
                                <div className="col s12 m12 xl12">
                                    <div className="input-field col s12 m8 l8 xl8">
                                        <input
                                            className="materialize-textarea"
                                            id="pasteArea"
                                            value={this.state.valueTextArea}
                                            // onPaste={this.paste}
                                            onChange={this.handleChangeText}
                                            // disabled={this.state.disabledInput}
                                        ></input>
                                    </div>
                                    {/* <div className="input-field col s12 m4 l4 xl4">
                                        <Dropdown ref = {this.dropdownRefLink} data={data} onChange={this.getdataselectTypeAccept} title="SELECT ACEPT TYPE" iconcolor='#1e9198'/>
                                    </div>
                                    <ListImg _state_list={this.state.list} sendArray={x => { this.handlepropiedad(x); }} /> */}
                                </div>
                                <div className="input-field col s12 m12 right-align">
                                    <a className="btn btn-success2" onClick={() => this.onLinkSave(this)}>
                                        <i className="material-icons left">send</i>
                                        <span>Submit</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        :
                        <div className="row">
                            <div className="row" id="upload-container">
                                <div className="col s12 m12">
                                    <Upload
                                        onRef={fileUpload => this.refupload = fileUpload}
                                        bucket={this.props.bucket}
                                        mode={this.props.mode}
                                        pyApi={true}
                                        acceptType={true}
                                        urlServiceUploadBucket={CleverConfig.getApiUrl('bengine') + '/api/compressImg'}
                                        //functionBefore={this.beforeSave.bind(this, 'POST')}
                                        functionBefore={() => {this.setState({loader:true}); return true; }}
                                        acceptTypeContent={data}
                                        callBack={this.onBucketSave.bind(this)}
                                    />
                                </div>
                            </div>
                            {/* <div className="row" id="buttonUpdate-container2">
                                <div className="input-field col s12 m12 right-align">
                                    <a className="btn btn-success" onClick={() => (!this.beforeSave('PUT')) ? null :  this.onBucketSave(this) }>
                                        <i className="material-icons left">send</i>
                                        <span>Submit</span>
                                    </a>
                                </div>
                            </div> */}
                        </div>
                    }
                    
                </Modal>

                <Modal onRef={modal => this.refModalGallery = modal} showFooter={false}>
                    <form id="form-gallery-manager">
                        <div className="row">
                            {
                                (this.props.byMarket) ?
                                    <div className=" file-field input-field col s12 m6">
                                        <SelectInput
                                            name="segmento_group"
                                            required={true}
                                            label={{ text: "Group Segment", i18n: "{{'GROUP SEGMENT'}}" }}
                                            url={CleverConfig.getApiUrl('core') + `/segmentogrupo/dropdown/idgroup_segmento_grupo/descripcion`}
                                            entity="dropdownDataActive"
                                            onRef={select => this.segmentGroups = select}
                                            disabled={false}
                                        />
                                    </div> : null
                            }

                            {(this.props.byResorts) ?
                                <div className=" file-field input-field col s12 m6">
                                    <SelectInput
                                        name="idclv_propiedad"
                                        required={true}
                                        label={{ text: "Resort", i18n: "{{'RESORT'}}" }}
                                        url={CleverConfig.getApiUrl('core') + `/propiedad/dropdown/idclv_propiedad/descripcion`}
                                        entity="dropdownDataActive"
                                        onRef={select => this.resortsRef = select}
                                        disabled={false}
                                    />
                                </div> : null
                            }

                            <div className="input-field col s12 m6">
                                <input id="name" type="text" name="name" className="validate" autoComplete="off" required />
                                <label htmlFor="name" data-error="wrong" data-success="right"><span>Name</span></label>
                            </div>
                            <div className="input-field col s12 m6">
                                <input id="description" type="text" name="description" className="validate" autoComplete="off" required />
                                <label htmlFor="description" data-error="wrong" data-success="right"><span>Description</span></label>
                            </div>
                        </div>
                    </form>
                    <div className="row" id="buttonUpdate-container">
                        <div className="input-field col s12 m12 right-align">
                            <a className="btn btn-success" onClick={() => (!this.beforeSaveGallery('POST')) ? null : this.saveGallery()}>
                                <i className="material-icons left">send</i>
                                <span>Submit</span>
                            </a>
                        </div>
                    </div>
                </Modal>

                <RightSideNav>
                    <div className="row">
                        <div className="col s12 m12 12 xl12">
                            {
                                this.state.assetscore.map((Assets, idx) => {
                                    let el_id = Util.uniqueID();
                                    Assets.htmlEntity = el_id;
                                    let available_item = (Assets.available) ? <input id={el_id} type="checkbox" className="filled-in" onClick={() => this.saveFromCore(Assets)} /> : <input id={el_id} type="checkbox" className="filled-in" checked="checked" disabled="disabled" />;

                                    switch (Assets.idasset_type) {
                                        case "1":
                                            return (
                                                <div className="col s13 m3 l3" key={Util.uniqueID()}>
                                                    <Card
                                                        isPanel={false}
                                                        classCard={{ card: "small" }}
                                                        image={{
                                                            title: {
                                                                default: Assets.hasOwnProperty('descripcion') ? Assets.descripcion : Assets.nombre_archivo,
                                                                data_i18n: "{{'CLEVER_CARD'}}"
                                                            },
                                                            src: Assets.url
                                                        }
                                                        }
                                                        action={
                                                            <label>
                                                                {available_item}
                                                                <span>Add to gallery</span>
                                                            </label>
                                                        }
                                                    >
                                                        {Assets.hasOwnProperty('tags') && this.setCustomTags(Assets)}
                                                    </Card>
                                                </div>
                                            );
                                            break;
                                        case "2":
                                            return (
                                                <div className="col s13 m3 l3" key={Util.uniqueID()}>
                                                    <Card
                                                        isPanel={false}
                                                        classCard={{ card: "small" }}
                                                        action={
                                                            <label>
                                                                {available_item}
                                                                <span>Add to gallery</span>
                                                            </label>
                                                        }
                                                    >
                                                        <video src={Assets.url} type={this.getFileExtension(Assets.nombre_archivo)} key={Util.uniqueID()} width='100%' controls autostart="true" autoPlay={false}></video>
                                                        <div key={Util.uniqueID()}>
                                                            <div>{Assets.descripcion}</div>
                                                            {Assets.hasOwnProperty('tags') && this.setCustomTags(Assets)}
                                                        </div>
                                                    </Card>
                                                </div>
                                            );
                                            break;
                                        case "3":
                                            return (
                                                <div className="col s13 m3 l3" key={Util.uniqueID()}>
                                                    <Card
                                                        isPanel={false}
                                                        classCard={{ card: "small" }}
                                                        action={
                                                            <label>
                                                                {available_item}
                                                                <span>Add to gallery</span>
                                                            </label>
                                                        }
                                                    >
                                                        <div className="col s12 center-align">
                                                            <i className="material-icons large">picture_as_pdf</i><br />
                                                        </div>
                                                        <div key={Util.uniqueID()}>
                                                            <div>{Assets.descripcion}</div>
                                                            {Assets.hasOwnProperty('tags') && this.setCustomTags(Assets)}
                                                        </div>
                                                    </Card>
                                                </div>
                                            );
                                            break;
                                        case "4":
                                            console.log(4);
                                            break;
                                        default:
                                            console.log('default');
                                    }
                                })
                            }
                        </div>
                        <div className="col s12 m12 xl12 ">
                            <Pagination
                                totalRecords={100}
                                pageLimit={10}
                                pageNeighbours={2}
                                onPageChanged={this.onPageChanged}
                            />
                        </div>
                    </div>
                </RightSideNav>
                <CleverLoading show={this.state.loader}/>
            </React.StrictMode>
        );
    }
}

const customTagStyle = {
    wordWrap: "break-word",
    display: "inline-block",
    backgroundColor: "#c4c4c4",
    height: "auto",
    fontSize: "80%",
    fontWeight: "600",
    lineHeight: "1",
    padding: ".2em .6em .3em",
    borderRadius: ".25em",
    color: "black",
    verticalAlign: "baseline",
    margin: "2px",
};

const contentFile = {
    position: "relative",
    height: "2rem"
};

LocalContentAssets.propTypes = {
    onlygallery: PropTypes.bool,
    byMarket: PropTypes.bool,
    byResorts: PropTypes.bool,
    gallery: PropTypes.bool,
    onBucketSave: PropTypes.func,
    onGallerySave: PropTypes.func,
    updateGallery: PropTypes.func,
    saveGalleryAction: PropTypes.func,
    onSelectGallery: PropTypes.func,
    mode: PropTypes.string,
    bucket: PropTypes.string,
    urlAssetTypes: PropTypes.string,
    urlAssetGallery: PropTypes.string,
    urlUpdateAsset: PropTypes.string,
    rowUpdate: PropTypes.string,
    urlUpdateGallery: PropTypes.string,
    rowUpdateGallery: PropTypes.string,
    urlCoreGallery: PropTypes.string,
    mimeType: PropTypes.string,
    urlOnlyGallery: PropTypes.string,
    urlPaginador: PropTypes.object,
    typesActive: PropTypes.array,
    dataGallery: PropTypes.array,
    assettype: PropTypes.number,
    position: PropTypes.number,
    idgallery: PropTypes.number,
    idfrm_sistema: PropTypes.number,
};

LocalContentAssets.defaultProps = {
    onlygallery: false,
    byMarket: false,
    byResorts: false,
    gallery: true,
    onBucketSave: (context) => { },
    onGallerySave: (context) => { },
    updateGallery: (context) => { },
    saveGalleryAction: (context) => { },
    onSelectGallery: (context) => { },
    mode: 'cliente', // cliente / admin
    bucket: 'core',
    urlAssetTypes: CleverConfig.getApiUrl('core') + '/assettype/getassetstype',
    urlAssetGallery: "",
    urlUpdateAsset: "",
    rowUpdate: "",
    urlUpdateGallery: "",
    rowUpdateGallery: "",
    urlCoreGallery: "",
    mimeType: "",
    urlOnlyGallery: "",
    urlPaginador: {},
    typesActive: [],
    dataGallery: [],
    assettype: 0,
    position: 0,
    idgallery: 0,
    idfrm_sistema: 0,
};

export default LocalContentAssets;
