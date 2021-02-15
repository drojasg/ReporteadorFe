import React, { Fragment, Component } from 'react';
import ReactDOM from 'react-dom';
import {AssetManager, Header, Body} from './ContentAsset';
import AssetsType from './AssetsType';
import PropTypes from 'prop-types';
import GalleryAssetsUser from './GalleryAssetsUser';

import CleverConfig from '../../../../config/CleverConfig'

class CleverAsset extends Component {
    constructor(props) {
        super(props);
        this.state ={
            error:false,
            errorInfo: null,
            response: []
        }
        this.getCatchError = this.getCatchError.bind(this);
    }

    componentDidMount(){

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
    getCatchError(){
        return (
            <React.StrictMode>
                <div className="col s12">
                    <h3>Oh-no! Something went wrong</h3>
                    <p className="red" style={{color:'white'}} >
                        {this.state.error && this.state.error.toString()}
                    </p>
                    <div>Component Stack Error Details:</div>
                    <p className="red" style={{color:'white'}}>
                        {this.state.errorInfo.componentStack}
                    </p>
                </div>
            </React.StrictMode>
    );
    }

    render() {
        const {error} = this.state;

        if (error){
            return <React.StrictMode> (<this.getCatchError/>) </React.StrictMode>;
        }

        return (
            <React.StrictMode>
                <AssetManager>
                    <Header>Clever Asset Management</Header>
                        <Body>
                            {
                                this.props.onlygallery ?
                                <GalleryAssetsUser
                                    onlygallery={this.props.onlygallery}
                                    byMarket={this.props.byMarket}
                                    byResorts={this.props.byResorts}
                                    gallery={this.props.gallery}
                                    onBucketSave={this.props.onBucketSave}
                                    onGallerySave={this.props.onGallerySave}
                                    updateGallery={this.props.updateGallery}
                                    idfrm_sistema={this.props.idfrm_sistema}
                                    saveGalleryAction={this.props.saveGalleryAction}
                                    mode = {this.props.mode}
                                    bucket = {this.props.bucket}
                                    urlAssetTypes = {this.props.urlAssetTypes}
                                    method = {this.props.method}
                                    urlAssetGallery = {this.props.urlAssetGallery}
                                    urlOnlyGallery = {this.props.urlOnlyGallery}
                                    urlUpdateAsset = {this.props.urlUpdateAsset}
                                    rowUpdate = {this.props.rowUpdate}
                                    urlUpdateGallery = {this.props.urlUpdateGallery}
                                    rowUpdateGallery = {this.props.rowUpdateGallery}
                                    urlCoreGallery = {this.props.urlCoreGallery}
                                    urlPaginador = {this.props.urlPaginador}
                                    onSelectGallery = {this.props.onSelectGallery}
                                    dataGallery = {this.state.response}
                                ></GalleryAssetsUser>
                                :
                                <AssetsType
                                    onlygallery={this.props.onlygallery}
                                    byMarket ={this.props.byMarket}
                                    byResorts={this.props.byResorts}
                                    gallery = {this.props.gallery}
                                    onBucketSave={this.props.onBucketSave}
                                    onGallerySave = {this.props.onGallerySave}
                                    updateGallery = {this.props.updateGallery}
                                    saveGalleryAction = {this.props.saveGalleryAction}
                                    mode = {this.props.mode}
                                    bucket = {this.props.bucket}
                                    urlAssetTypes = {this.props.urlAssetTypes}
                                    method = {this.props.method}
                                    urlAssetGallery = {this.props.urlAssetGallery}
                                    urlOnlyGallery = {this.props.urlOnlyGallery}
                                    urlUpdateAsset = {this.props.urlUpdateAsset}
                                    urlCoreGallery = {this.props.urlCoreGallery}
                                    rowUpdate = {this.props.rowUpdate}
                                    urlUpdateGallery = {this.props.urlUpdateGallery}
                                    rowUpdateGallery = {this.props.rowUpdateGallery}
                                    dataAssets = {this.props.dataAssets}
                                    urlPaginador = {this.props.urlPaginador}
                                    idfrm_sistema={this.props.idfrm_sistema}
                                    onSelectGallery={this.props.onSelectGallery}
                                >
                                </AssetsType>
                            }

                        </Body>
                </AssetManager>
            </React.StrictMode>
        );
    }
}

CleverAsset.propTypes = {
    onlygallery       : PropTypes.bool,
    byMarket          : PropTypes.bool,
    byResorts         : PropTypes.bool,
    gallery           : PropTypes.bool,
    onBucketSave      : PropTypes.func,
    onGallerySave     : PropTypes.func,
    updateGallery     : PropTypes.func,
    saveGalleryAction : PropTypes.func,
    onSelectGallery   : PropTypes.func,
    mode              : PropTypes.string,
    bucket            : PropTypes.string,
    urlAssetTypes     : PropTypes.string,
    method            : PropTypes.string,
    urlAssetGallery   : PropTypes.string,
    urlUpdateAsset    : PropTypes.string,
    rowUpdate         : PropTypes.string,
    urlUpdateGallery  : PropTypes.string,
    rowUpdateGallery  : PropTypes.string,
    urlOnlyGallery    : PropTypes.string,
    urlCoreGallery    : PropTypes.string,
    dataAssets        : PropTypes.object,
    urlPaginador      : PropTypes.object,
    dataGallery       : PropTypes.array,
    idfrm_sistema     : PropTypes.number,
};

CleverAsset.defaultProps = {
    onlygallery       : false,
    byMarket          : false,
    byResorts         : false,
    gallery           : false,
    onBucketSave      : (context) => {},
    onGallerySave     : (context) => {},
    updateGallery     : (context) => {},
    saveGalleryAction : (context) => {},
    onSelectGallery   : (context) => {},
    mode              : 'cliente',
    bucket            : 'core',
    urlAssetTypes     : CleverConfig.getApiUrl('core') +'/assettype/getassetstype',
    method            : 'get',
    urlAssetGallery   : "",
    urlUpdateAsset    : "",
    rowUpdate         : "",
    urlUpdateGallery  : "",
    rowUpdateGallery  : "",
    urlCoreGallery    : "",
    urlOnlyGallery    : "",
    dataAssets        : {},
    urlPaginador      : {},
    dataGallery       : [],
    idfrm_sistema     : 0,
};

export default CleverAsset;
