import React, { Component } from 'react';
import { CleverRequest} from 'clever-component-library';
import CleverAsset from './CleverAsset'
import CleverConfig from './../../../../config/CleverConfig'

export default class Prueba extends Component {
    constructor(props){
        super(props);
        this.saveAsset = this.saveAsset.bind(this)
        this.saveGallery = this.saveGallery.bind(this)

        this.state = {
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
        }
    }

    saveGallery(data){
        console.log(data);
    }

    saveAsset(data){
        console.log(data)
        let sendData = {};
        let response = data.data;
        // let response = data;
        
        // console.log('respuesta: ', response);

        let name = response.nameFile.split("_").join(" ");
        name = name.split(".");        

        sendData.iddef_media_type = response.idasset_type;
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

        
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/media/create`, sendData, (response, error) => {
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
        </div>
        )
    }
}
