import React, { Component} from 'react';
import {render} from 'react-dom';
import LocalContentAssets from './LocalContentAssets';
import PropTypes from 'prop-types';
import { ComponentAsset, AssetsView, HeaderAssetsView} from './AssetsView';
import GalleryAssetsUser from './GalleryAssetsUser';
import { Card, CleverRequest} from 'clever-component-library'
import CleverConfig from '../../../../config/CleverConfig'

class AssetsType extends Component {

    constructor(props) {
        super(props);
        this.state = {
            error : false,
            errorInfo : null,
            assetType : [],
            activeAssets : [],
            galleryAssets : [],
            dataGallery:[]
        };

        this.handleAssetsType = this.handleAssetsType.bind(this);
        this.getCatchError = this.getCatchError.bind(this);
        this.handleShowCoreGallery = this.handleShowCoreGallery.bind(this);
        this.handleGetAssets = this.handleGetAssets.bind(this);
        this.AssetsRequest = this.AssetsRequest.bind(this);
    }

    componentDidMount() {
        this.handleAssetsType();
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

    handleAssetsType(){
        CleverRequest.get(this.props.urlAssetTypes, (response) => {
            if(!response.error){
                let typesActive=[];
                response.data.forEach(element => {
                        typesActive.push({"value":element.idasset_type,"text":element.descripcion,"acceptType":element.tipo, icon:element.icon});

                });
                return this.setState({assetType:response.data, activeAssets:typesActive});
            }
        },false);
    }

    handleGetAssets(idasset_type, callback) {
        let username = localStorage.username;
        if(this.props.gallery){
            let _url = this.props.urlAssetGallery;
            let data = [];
            let url  = _url+"/"+idasset_type;
            let request = this.AssetsRequest(url, 'get', data, callback);

        }else{

            let _url = this.props.urlPaginador.urlTotalAssets;
            let data = [];
            let url = _url+"/"+idasset_type;
            let request = this.AssetsRequest(url, 'get', data, callback);
        }
    }

    AssetsRequest(url="", _method='get', data=[], success){

        let api_method = _method.toLowerCase();

        if(api_method=="get"){
            return CleverRequest.get(url, (response) => {
                if(!response.error){
                    if(this.props.gallery){
                        return success(false, response.data)
                    }else{
                        return (response.hasOwnProperty("data")) ? success(false, response.data[0].total) : success(false, response);
                    }
                    // return this.setState({galleryAssets:response});
                    // return response;
                }
                return success(true, response);
                //return this.setState({galleryAssets:{error:true , message: 'An error has ocurred'}});
            },false);

        }

    }

    handleShowCoreGallery(idasset_type, mimeType, descripcion){

        const portal_Asset = document.getElementById('clever-assets-management-body');
        let data = this.handleGetAssets(idasset_type, (err, response) => {
            this.setState({dataGallery:response});
                return render(<LocalContentAssets
                                onlygallery={this.props.onlygallery}
                                byMarket ={this.props.byMarket}
                                byResorts={this.props.byResorts}
                                gallery = {this.props.gallery}
                                onBucketSave = {this.props.onBucketSave}
                                onGallerySave = {this.props.onGallerySave}
                                updateGallery={this.props.updateGallery}
                                mode = {this.props.mode}
                                bucket = {this.props.bucket}
                                urlAssetTypes = {this.props.urlAssetTypes}
                                method = {this.props.method}
                                urlAssetGallery = {this.props.urlAssetGallery}
                                urlUpdateAsset = {this.props.urlUpdateAsset}
                                rowUpdate = {this.props.rowUpdate}
                                urlUpdateGallery = {this.props.urlUpdateGallery}
                                rowUpdateGallery = {this.props.rowUpdateGallery}
                                urlCoreGallery = {this.props.urlCoreGallery}
                                urlOnlyGallery = {this.props.urlOnlyGallery}
                                mimeType={mimeType}
                                urlPaginador = {this.props.urlPaginador}
                                typesActive={this.state.activeAssets}
                                dataGallery = {this.state.dataGallery}
                                assettype={parseInt(idasset_type)}
                                idfrm_sistema={this.props.idfrm_sistema}
                                onSelectGallery={this.props.onSelectGallery}
                                >
                                {/* <React.StrictMode> */}
                                  {this.props.gallery ?
                                      /**
                                       *  Aqui ira la galeria
                                       * */
                                        <GalleryAssetsUser
                                            onlygallery={this.props.onlygallery}
                                            onBucketSave={this.props.onBucketSave}
                                            onGallerySave = {this.props.onGallerySave}
                                            updateGallery = {this.props.updateGallery}
                                            idfrm_sistema={this.props.idfrm_sistema}
                                            byMarket ={this.props.byMarket}
                                            byResorts={this.props.byResorts}
                                            mode = {this.props.mode}
                                            bucket = {this.props.bucket}
                                            urlAssetTypes = {this.props.urlAssetTypes}
                                            method = {this.props.method}
                                            gallery = {this.props.gallery}
                                            urlAssetGallery = {this.props.urlAssetGallery}
                                            urlUpdateAsset = {this.props.urlUpdateAsset}
                                            urlCoreGallery = {this.props.urlCoreGallery}
                                            urlOnlyGallery={this.props.urlOnlyGallery}
                                            dataGallery ={response}
                                            urlPaginador = {this.props.urlPaginador}
                                            rowUpdate = {this.props.rowUpdate}
                                            urlUpdateGallery = {this.props.urlUpdateGallery}
                                            rowUpdateGallery = {this.props.rowUpdateGallery}
                                            assettype={parseInt(idasset_type)}
                                            mimeType={mimeType}
                                            typesActive={this.state.activeAssets}
                                            onSelectGallery={this.props.onSelectGallery}
                                        ></GalleryAssetsUser>
                                      :
                                        <AssetsView>
                                            <HeaderAssetsView> {'Gallery ' + descripcion + ' Content'} </HeaderAssetsView>
                                              <ComponentAsset
                                                    onlygallery={this.props.onlygallery}
                                                    mimeType = {mimeType}
                                                    data ={response}
                                                    urlUpdateAsset={this.props.urlUpdateAsset}
                                                    urlPaginationAssets={this.props.urlPaginador}
                                                    isGallery={false}
                                                    idgallery={0}
                                                    idasset_type={parseInt(idasset_type)}
                                                    rowUpdate = {this.props.rowUpdate}
                                              />
                                        </AssetsView>
                                }
                                {/* </React.StrictMode> */}
                            </LocalContentAssets>
                            , portal_Asset
                        );

        });
    }

    render() {
        const {error, assetType} = this.state;
        if (error){
            return <React.StrictMode> (<this.getCatchError/>) </React.StrictMode>;
        }

        return(
            <React.StrictMode>
                { assetType.map((asset, idx) =>{
                    let rows = (asset.rows) ?  <span className="badge">{ asset.rows}</span> : null;
                    let icon = (asset.icon) ?  <i className="material-icons">{asset.icon}</i> : null;
                    return (<div className="col s12 m3 xl3 l3" key={idx}>
                        <Card
                            title ={{ default:asset.descripcion, data_i18n:"{{''}}"}}
                            isPanel = {false}
                            image={ {title:{default:"", data_i18n:"{{''}}"}, src : "https://materializecss.com/images/sample-1.jpg"} }
                            control={
                                <React.Fragment>
                                    <a className="btn btn-icon btn-link">
                                        {rows}{icon}
                                    </a>
                                </React.Fragment>
                            }
                            action={
                                <div className="row">
                                        <a className="btn-icon btn-light" >
                                            <i className="material-icons" title='Upload from my gallery' onClick={(e) => this.handleShowCoreGallery(asset.idasset_type, asset.tipo, asset.descripcion)}>
                                                file_upload
                                            </i>
                                        </a>
                                </div>
                            }
                        >
                        Select an Option:
                        </Card>
                    </div>);
                }

                )
            }
            </React.StrictMode>
        )
    }
}

AssetsType.propTypes = {
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
    urlCoreGallery    : PropTypes.string,
    urlOnlyGallery    : PropTypes.string,
    dataAssets        : PropTypes.object,
    urlPaginador      : PropTypes.object,
    dataGallery       : PropTypes.array,
    position          : PropTypes.number,
    idgallery         : PropTypes.number,
    idfrm_sistema     : PropTypes.number,
};

AssetsType.defaultProps = {
    onlygallery       : false,
    byMarket          : false,
    byResorts         : false,
    gallery           : false,
    onBucketSave      : (context) => {},
    onGallerySave     : (context) => {},
    updateGallery     : (context) => {},
    saveGalleryAction : (context) => {},
    onSelectGallery : (context) => {},
    mode              : 'cliente',
    bucket            : 'core',
    urlAssetTypes     : CleverConfig.getApiUrl('core') +'/assettype/getassetstype',
    method            : 'get',
    urlAssetGallery   : "",
    urlUpdateAsset    : "",
    urlCoreGallery    : "",
    rowUpdate         : "",
    urlUpdateGallery  : "",
    rowUpdateGallery  : "",
    urlOnlyGallery    : "",
    dataAssets        : {},
    urlPaginador      : {},
    dataGallery       : [],
    idfrm_sistema     : 0,
    position          : 1,
    idgallery         : 0,
};

export default AssetsType;
