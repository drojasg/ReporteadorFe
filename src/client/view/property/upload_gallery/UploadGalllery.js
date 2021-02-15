import React, { Component } from 'react';
import { CleverRequest, MComponentes,CleverLoading } from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";
import CleverAsset from "./../../../components/CleverAssets/CleverAsset";

export default class UploadGalllery extends Component {
    constructor(props){
        super(props);
        this.saveAsset = this.saveAsset.bind(this)
        this.saveGallery = this.saveGallery.bind(this)

        this.state = {
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
        }
    }

    componentDidMount(){
        let data = {
            data: {
                'ETag': "9294c05eec21bdd0b76bb8126cdfc059-1",
                'bucket': "webfiles_palace",
                'description': "prueba",
                'estado': 1,
                'id_gallery': 2,
                'idasset_type': 1,
                'idclv_propiedad': 0,
                'idfrm_sistema': 14,
                'mime': "image/jpeg",
                'nameFile': "section_girl.jpg",
                'objectURL': "https://s3.amazonaws.com/webfiles_palace/clever-qa/booking_engine/sectiongirl.jpg",
                'publico': 1,
                'segmento_mercado': 0,
                'size': "121.9 KB",
                'tag': {"tags": ["prueba", "marzo18"]},
            }
        }

        // this.saveAsset(data);
    }


    saveGallery(data){
        console.log(data);
    }

    saveAsset(data){
        this.setState({loader:true})
        if(data.success == true){
            let sendData = {};
            let response = data.data;
    
            let name = response.nameFile.split("_").join(" ");
            name = name.split(".");        
    
            sendData.iddef_media_type = 1;
            sendData.iddef_media_group = response.id_gallery;
            sendData.url = response.objectURL;
            sendData.description = response.description;
            sendData.nombre_bucket = response.bucket;
            sendData.bucket_type = response.publico;
            sendData.etag = response.ETag;
            sendData.show_icon = 0
            sendData.name = name[0];
            sendData.tags =  response.tag ;
            sendData.estado = 1;
    
            
            CleverRequest.post(CleverConfig.getApiUrl('bengine') + `/api/media/create`, sendData, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (response.Error == false) {
                    MComponentes.toast(response.Msg);
                    data.data.refupload.refreshForm();
                    data.data.formAsset.reset();
                    data.data.refChips.clean();
                    this.setState({ loader: false })
                } else {
                    MComponentes.toast(response.Msg);
                    this.setState({ loader: false })
                }
            });     

        }else{
            this.setState({loader: false})
            MComponentes.toast(data.message);
            return;
        }       
    }
    render() {
        return (
            <div className="row">
            <CleverAsset
                byMarket ={false}
                byResorts={false}
                gallery={true}
                idfrm_sistema={14}
                bucket={'booking_engine'}
                mode={'admin'}
                onBucketSave={this.saveAsset.bind(this)}
                onGallerySave = {this.saveGallery.bind(this)} 
                urlAssetTypes={CleverConfig.getApiUrl('bengine') +'/api/media-type/get-all-gallery'} // Puedo quitar user y el type lo toma
                urlAssetGallery={CleverConfig.getApiUrl('bengine') +'/api/media-group/get-all-gallery'} //""
                // urlCoreGallery ={CleverConfig.getApiUrl('core') +'/assetgallery/assetbytype/'}
                urlUpdateAsset ={CleverConfig.getApiUrl('bengine') +'/api/media/update-media-gallery-status/'}
                rowUpdate = {'id_asset_gallery'}
                urlUpdateGallery = {CleverConfig.getApiUrl('bengine') +'/api/media-group/update-media-gallery-status/'}
                rowUpdateGallery = {'iduser_gallery'}
                urlPaginador = {{
                    // urlTotalAssets: CleverConfig.getApiUrl('sales') +'/assets/gettotalassets/'+username, //NO***
                    urlTotalAssetByGallery: CleverConfig.getApiUrl('bengine') +'/api/media-group/get-count-group',
                    // urlSearchAssets: CleverConfig.getApiUrl('sales') +'/assets/searchasset/'+username, //NO***
                    urlSearchAssetsByGallery: CleverConfig.getApiUrl('bengine') +'/api/media-group/get-all-media-by-group', 
                    pageLimit: 12
                }}> 
            </CleverAsset>
            <CleverLoading show={this.state.loader} />
        </div>
        )
    }
}
