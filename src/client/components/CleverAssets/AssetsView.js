import React,  { useState, useEffect, useRef } from 'react';
import { SwitchButton } from './components/switchbutton';
import Pagination from './components/pagination';
import {Chip,Modal,Card,CleverRequest } from 'clever-component-library' 
export function AssetsView(props) {
    return (
            <div className="col s12 m12 l12 xl12" >
                    {props.children}
            </div>
    )
}

export const HeaderAssetsView = ({ children }) => (
    <div className="col s12 m12 l12 xl12">
        <h5>{children}</h5>
    </div>
);

export const ComponentAsset = ({mimeType="", data={}, urlUpdateAsset ="", isGallery= false ,urlPaginationAssets = "", idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {
    let _component ={};

    switch (mimeType) {
        case "image/*" :
            _component = <ImagenAssets data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} urlPaginationAssets={urlPaginationAssets} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
          break;
        case "video/*":
            _component = <VideoAssets data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} urlPaginationAssets={urlPaginationAssets} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
            break;
        case "audio/*":
            _component = <AudioAssets data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} urlPaginationAssets={urlPaginationAssets} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
            break
        case "application/pdf":
            _component = <FilePDFAssets data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} urlPaginationAssets={urlPaginationAssets} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
            break
        default:
            _component =  <DefaultGallery data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} urlPaginationAssets={urlPaginationAssets} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>

    }
    return (_component)
};

export const ImagenAssets = ({ data =[], urlUpdateAsset = "", urlPaginationAssets="", isGallery=false, idgallery = 0, idasset_type=0, rowUpdate=""}) =>{

    const [assetImage, setAsset] = useState([]);
    const [assetFilter, setFilter] = useState([]);
    const [totalAssets, setAssets] = useState(data);

    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const refModal = useRef();
    const refChips = useRef();
    const refChipsSearch = useRef();

    function handleChange(e){
        let data = assetImage;
        setFilter(setFilterComponent(e,data));
    }

    function searchByTag(){
        let tags = refChipsSearch.current.getValue();
        let data = assetImage;

        setFilter(setFilterByTags(data, tags));

    }

    function getvalid(){
        console.warn("Get Value",refChipsSearch.current.getValue());
        let data = refChipsSearch.current.getValue(); 
        if( data.length > 0){
            console.warn("Aun tiene valores jajajatl");
        }else{
            console.warn("Ya no cuenta con ningún valor por ende aqui deberia regresar todo el asset");
            setFilter(assetImage);
        }
    }

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    function onPageChanged(data){
        const range = data.pageLimit;
        const offset = (data.currentPage - 1) * data.pageLimit;
        const url = (isGallery) ? urlPaginationAssets.urlSearchAssetsByGallery+'/'+idgallery+'/' : urlPaginationAssets.urlSearchAssets+'/'+idasset_type+'/';

        CleverRequest.get(url + range  + '/' + offset, (response) => {
                setFilter(response.data);
                setAsset(response.data);
            }
        )
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    if (data === 0 || data.error) {
        return (
            <div className="row">
                <div className="col s12 m12 l122 xl12">
                    <div style={alertWarning}>
                         <strong>Message!</strong> You don't have images in you gallery :(.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col s12 m12 l12 xl12">
            <div className="row">
            <div className="input-field col s12 m6 xl6 l6">
                <input id="nameSearch" type="search" onChange={handleChange} className="validate"/>
                  <i className="material-icons">search</i>
            </div>
            <div className="input-field col s12 m6 xl6 l6">
                <div className="col s8 m8">
                    <Chip
                        ref={refChipsSearch}
                        label={{ t: "Tags", d: "{{'TAGS'}}" }}
                        options={{ secondaryPlaceholder: "+ Tag" }}
                        onBlur={getvalid} 
                    />
                </div>
                <div className="col s4 m4">
                    <a className="btn btn-success" onClick={searchByTag}>
                        <i className="material-icons left">image_search</i>
                        <span>Submit</span>
                    </a>
                </div>
            </div>

                {
                    assetFilter.map((image, key) =>
                    <div className="col s10 offset-s1 m4 l4" key={key}>
                        <Card
                            isPanel = {false}
                            classCard={ {card:"small"} }
                            image={ {
                                        title:{default: image.hasOwnProperty('descripcion') ? image.descripcion : image.nombre_archivo,
                                        data_i18n:"{{'CLEVER_CARD'}}"},
                                        src : (image.idasset_type==4)? 'https://s3.amazonaws.com/webfiles_palace/clever-qa/booking_engine/virtual_tour.png':image.url
                                    }
                                }

                            control={
                               <React.Fragment>
                                    <SwitchButton
                                        name="estado"
                                        checked={(image.estado == 1) ? true : false}
                                        id={image[rowUpdate]}
                                        url={urlUpdateAsset}
                                        type='link'
                                        style='white'
                                    />
                                    <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(image)}>
                                        <i className="material-icons">edit</i>
                                    </a>
                               </React.Fragment>
                           }
                           >
                           {image.hasOwnProperty('tags') && setCustomTags(image)}
                        </Card>
                    </div>
                )}
                <div className="col s12 m12 xl12 ">
                    <Pagination
                    totalRecords={parseInt(data)}
                    pageLimit={urlPaginationAssets.pageLimit}
                    pageNeighbours={2}
                    onPageChanged={onPageChanged}
                    />
                </div>
                <Modal
                    ref={refModal}
                    addButtons={[
                        <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                            <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                        </button>
                    ]}
                />
            </div>
        </div>
    )
};

export const VideoAssets = ({ data =[], urlUpdateAsset = "", urlPaginationAssets="", isGallery=false, idgallery = 0, idasset_type=0, rowUpdate=""}) => {

    const [videoPreview, setVideo] = useState([]);
    const [assetFilter, setFilter] = useState([]);
    const [state, setState] = useState([]);
    const [loadMore, setLoadMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const refModal = useRef();
    const refChips = useRef();

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    useEffect(() => {
      getData(loadMore);
      setLoadMore(false);
    }, [loadMore]);

    useEffect(() => {
        const list = document.getElementById('list')
        list.addEventListener('scroll', (e) => {
            const el = e.target;
                if(el.scrollTop + el.clientHeight >= el.scrollHeight) {
                    setLoadMore(true);
                }
            });
    }, []);

    useEffect(() => {
      const list = document.getElementById('list');
      if(list.clientHeight <= window.innerHeight && list.clientHeight) {
          setLoadMore(true);
      }
    }, [state]);

    function handleChange(e){
        let data = state;
        setFilter(setFilterComponent(e,data));
    }

    const getData = (load) => {

        const limit = urlPaginationAssets.pageLimit;
        const url = (isGallery) ? urlPaginationAssets.urlSearchAssetsByGallery+'/'+idgallery+'/' : urlPaginationAssets.urlSearchAssets+'/'+idasset_type+'/';

        if (load) {
            CleverRequest.get(url+limit +'/'+offset, (response) => {
                if(response.error === false){
                        setFilter([...assetFilter,...response.data]);
                        setState(response.data);
                        setOffset(offset + urlPaginationAssets.pageLimit);
                    }else{
                        setOffset(offset + urlPaginationAssets.pageLimit);
                    }
                }
            )
        }
    };

    if (data === 0 || data.error) {
        return (
            <div className="row">
                <div className="col s12 m12 l12 xl12">
                    <div style={alertWarning}>
                         <strong>Message!</strong> You don't have videos in you gallery :(.
                    </div>
                </div>
                <div className="col s12 m8 l8 xl8">
                    <video  src="" type='mp4' key={0} width='100%' controls autostart="false" autoPlay={false}></video>
                </div>
                <div className="col s12 m4 l4 xl4" >
                    <ul className="collection with-header" id='list' style={{overflowY: 'scroll', height:'650px'}}>
                        <li className="collection-header"><h4>No Videos Found</h4></li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="col s12 m12 l12 xl12">
            <div className="row">
                <div className="col s12 m12 l12 xl 12">
                    <label>Search</label>
                    <input type='text' id="nameSearch" name='nameSearch' onChange={handleChange}/>
                </div>
                <div className="col s12 m8 l8 xl8">
                    <div className="col s6 m6 l6 xl6">
                        <SwitchButton
                            name="estado"
                            checked={(videoPreview.estado == 1) ? true : false}
                            id={videoPreview[rowUpdate]}
                            url={urlUpdateAsset}
                        />
                    </div>
                    <div className="col s6 m2 l2 xl2">
                        <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(videoPreview)}>
                            <i className="material-icons">edit</i>
                        </a>
                    </div>
                    <video  src={ videoPreview.url } type={getFileExtension(videoPreview.nombre_archivo)} key={videoPreview.idasset_type} width='100%' controls autostart="true" autoPlay={true}></video>
                        <div key={videoPreview.idasset_type + 1}>
                            <div>{videoPreview.descripcion}</div>
                                {videoPreview.hasOwnProperty('tags') && setCustomTags(videoPreview)}
                        </div>
                </div>
                <div className="col s12 m4 l4 xl4" >
                    <ul className="collection with-header" id='list' style={{overflowY: 'scroll', height:'650px'}}>
                        <li className="collection-header"><h4>Availables</h4></li>
                            {
                            assetFilter.map((video, idx) =>
                                <div key={idx}>
                                    <video  src={ video.url} type={getFileExtension(video.nombre_archivo)} key={idx} width='100%' autostart="false" autoPlay={false} preload="metadata" onClick={() => setVideo(video)}>
                                    </video>
                                    <a className="btn btn-icon btn-link" onClick={() => setVideo(video)}>
                                        {video.nombre_archivo}
                                    </a>
                                </div>
                                )
                            }
                    </ul>
                </div>
            </div>
            <Modal
                ref={refModal}
                addButtons={[
                    <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                        <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                    </button>
                ]}
            />
        </div>
    );
};

export const FilePDFAssets = ({ data =[], urlUpdateAsset = "", urlPaginationAssets="", isGallery=false, idgallery = 0, idasset_type=0, rowUpdate=""}) => {

    const [pdfPreview, setPDF] = useState([]);
    const [assetFilter, setFilter] = useState([]);
    const [state, setState] = useState([]);
    const [loadMore, setLoadMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const refModal = useRef();
    const refChips = useRef();

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    useEffect(() => {
      getData(loadMore);
      setLoadMore(false);
    }, [loadMore]);

    useEffect(() => {
     const list = document.getElementById('list')

      list.addEventListener('scroll', (e) => {
          const el = e.target;
          if(el.scrollTop + el.clientHeight >= el.scrollHeight) {
              setLoadMore(true);
          }
      });
    }, []);

    useEffect(() => {
      const list = document.getElementById('list');
      if(list.clientHeight <= window.innerHeight && list.clientHeight) {
          setLoadMore(true);
      }
    }, [state]);

    const getData = (load) => {

        const limit = urlPaginationAssets.pageLimit;
        const url = (isGallery) ? urlPaginationAssets.urlSearchAssetsByGallery+'/'+idgallery+'/' : urlPaginationAssets.urlSearchAssets+'/'+idasset_type+'/';

        if (load) {
            CleverRequest.get(url+limit +'/'+offset, (response) => {
                if(response.error === false){
                        setFilter([...assetFilter,...response.data]);
                        setState(response.data);
                        setOffset(offset + urlPaginationAssets.pageLimit);
                    }else{
                        setOffset(offset + urlPaginationAssets.pageLimit);
                    }
                }
            )
        }
    };

    function handleChange(e){
        let data = state;
        setFilter(setFilterComponent(e,data));
    }

    if (data === 0 || data.error) {
        return (
            <div className="row">
                <div className="col s12 m12 l12 xl12">
                    <div style={alertWarning}>
                         <strong>Message!</strong> You don't have files in you gallery :(.
                    </div>
                </div>
                <div className="col s12 m8 l8 xl8">

                </div>
                <div className="col s12 m4 l4 xl4" >
                    <ul className="collection with-header" id='list' style={{overflowY: 'scroll', height:'650px'}}>
                        <li className="collection-header"><h4>No Files Found</h4></li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="col s12 m12 l12 xl12">
        <div className="row">
            <div className="col s12 m12 l12 xl 12">
                <label>Search</label>
                <input type='text' id="nameSearch" name='nameSearch' onChange={handleChange}/>
            </div>
            <div className="col s12 m8 l8 xl8">
                <div className="col s6 m6 l6 xl6">
                    <SwitchButton
                        name="estado"
                        checked={(pdfPreview.estado == 1) ? true : false}
                        id={pdfPreview[rowUpdate]}
                        url={urlUpdateAsset}
                    />
                </div>
                <div className="col s6 m2 l2 xl2">
                    <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(pdfPreview)}>
                        <i className="material-icons">edit</i>
                    </a>
                </div>
                <embed type="application/pdf" src={`http://docs.google.com/gview?url=${pdfPreview.url}&embedded=true`} width="100%" height="500px" />
                <div>
                    {pdfPreview.hasOwnProperty('descripcion') ? pdfPreview.descripcion : pdfPreview.nombre_archivo}
                </div>
                    {pdfPreview.hasOwnProperty('tags') && setCustomTags(pdfPreview)}
            </div>
                <div className="col s12 m4 l4 xl4">
                    <ul className="collection with-header" id='list' style={{overflowY: 'scroll', height:'650px'}}>
                        <li className="collection-header"><h4>Availables</h4></li>
                        { assetFilter.map((pdf, i) =>
                            <div key={i}>
                                <li className="collection-item" >
                                    <a className="btn btn-icon btn-link" onClick={() => setPDF(pdf)}>
                                        <span>
                                            <i className="material-icons left">picture_as_pdf</i>
                                            {pdf.nombre_archivo}
                                        </span>
                                    </a>
                                    <span>
                                        {pdf.hasOwnProperty('descripcion') ?  pdf.descripcion : ''}
                                    </span>
                                </li>
                                <br/>
                            </div>
                        )}
                    </ul>
                </div>
        </div>
        <Modal
            ref={refModal}
            addButtons={[
                <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                    <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                </button>
            ]}
        />
        </div>
    );
};

export const AudioAssets = ({ data ={} }) => {

    const [audioPreview, setAudio] = useState(data[0]);
    const [assetAudio, setAsset] = useState(data);
    const [assetFilter, setFilter] = useState(data);

    function handleChange(e){
        let data = assetAudio;
        setFilter(setFilterComponent(e,data));
    }

    if (data === 0 || data.error) {
        return (
            <div className="row">
                <div className="col s12 m12 l122 xl12">
                    <div style={alertWarning}>
                         <strong>Message!</strong> You don't have records in you gallery :(.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col s12 m12 l12 xl12">
        <div className="row">
            <div className="col s12 m12 l12 xl 12">
                <label>Search</label>
                <input type='text' id="nameSearch" name='nameSearch' onChange={handleChange}/>
            </div>
            <div className="col s12 m12 l12 xl 12">
                {/* <SwitchButton
                    name="estado"
                    key={pdfPreview.idasset_type + 1}
                    checked={(pdfPreview.estado == 1) ? true : false}
                    id={pdfPreview.idasset_user_gallery}
                    url={urlUpdateAsset}
                /> */}
                Aqui va el audio
            </div>
        </div>
        </div>
    );


};

export const DefaultGallery = ({ data = {}, urlUpdateAsset = "", urlPaginationAssets="", isGallery=false, idgallery = 0, idasset_type = 0, rowUpdate=""}) => {

    const [assetPreview, setAsset] = useState([]);
    const [assetFilter, setFilter] = useState([]);
    const [state, setState] = useState([]);
    const [loadMore, setLoadMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const [records, setRecord] = useState([]);

    useEffect(() => {
        getData(loadMore);
        setLoadMore(false);
    }, [loadMore]);
  
    useEffect(() => {
        const list = document.getElementById('list')
        
        list.addEventListener('scroll', (e) => {

            const el = e.target;
                if(el.scrollTop + el.clientHeight >= el.scrollHeight) {

                    setLoadMore(true);
                }
            });
    }, []);
  
    useEffect(() => {
        const list = document.getElementById('list');
        if(list.clientHeight <= window.innerHeight && list.clientHeight) {
            setLoadMore(true);
        }
    }, [state]);
  
    function handleChange(e){
        let data = state;
        setFilter(setFilterComponent(e,data));
    }
  
    const getData = (load) => {

        const limit = urlPaginationAssets.pageLimit;
        const url = (isGallery) ? urlPaginationAssets.urlSearchAssetsByGallery+'/'+idgallery+'/' : urlPaginationAssets.urlSearchAssets+'/'+idasset_type+'/';

        if (load) {
            CleverRequest.get(url+limit +'/'+offset, (response) => {
                if(response.error === false){
                      setFilter([...assetFilter,...response.data]);
                      setState(response.data);
                      setOffset(offset + urlPaginationAssets.pageLimit);
                    }else{
                        const list = document.getElementById('list');
                        setLoadMore(false);
                        list.removeEventListener('scroll',(e) => {},false);
                    }
                }
            )
        }
    };

    function returnicon(type){
        switch (type){
            case 1:
                return(
                    <span>
                        <i className="material-icons left">
                            photo
                        </i> 
                    </span>                
                );
            break;
            case 2:
                return(
                    <span>
                        <i className="material-icons left">
                            video_library
                        </i>
                    </span>
                );
            break;
            case 3:
                return(
                    <span>
                        <i className="material-icons left">
                            picture_as_pdf
                        </i>
                    </span>
                );
            break;
            case 4:
                return(
                    <span>
                        <i className="material-icons left">
                            audiotrack
                        </i>                    
                    </span>
                );
            break;
        }
    }

    return(
        <div className="col s12 m12 l12 xl12">
            <div className="row">                
                <div className="col s12 m8 l8 xl8">
                    <ComponentAssetType data={assetPreview} urlUpdateAsset={urlUpdateAsset} idgallery={idgallery} idasset_type={data.idasset_type} rowUpdate={rowUpdate}></ComponentAssetType>
                </div>
                <div className="col s12 m4 l4 xl4 input-field">
                    <label>Search</label>
                        <input type='text' id="nameSearch" name='nameSearch' onChange={handleChange}/>
                    <ul className="collection with-header" id='list' style={{overflowY: 'scroll', height:'650px'}}>
                        <li className="collection-header"><h4>Availables</h4></li>
                            { assetFilter.map((asset, i) =>
                                <div key={i}>
                                    <li className="collection-item" >
                                        <a className="btn btn-icon btn-link" onClick={() => setAsset(asset)}>
                                            { returnicon(asset.idasset_type)}
                                        <span>
                                            {asset.hasOwnProperty('descripcion') ?  asset.descripcion : ''}
                                        </span>
                                        </a>
                                    </li>
                                    <br/>
                                </div>
                            )}
                    </ul>
                </div>
            </div>
        </div>
    )

}

export const ComponentAssetType = ({data={}, urlUpdateAsset ="", isGallery= false , idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {

    let _component = {};

    switch (data.idasset_type) {
        case 1 :
            _component = <Imagen data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
        break;
        case 2 :
            _component = <Video data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
        break;
        case 3 :
            _component = <Documents data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
        break;
        case 4 :
            _component = <Audio data={data} urlUpdateAsset={urlUpdateAsset} isGallery={isGallery} idgallery={idgallery} idasset_type={idasset_type} rowUpdate={rowUpdate}/>
        break;
        default :
            _component = <h6>No Found</h6>
        break;
    }

    return (_component)
}

export const Imagen = ({data={}, urlUpdateAsset ="", isGallery= false , idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {

    const [description, setDescription] = useState("");
    const refModal = useRef();
    const refChips = useRef();

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    return(
        <div>
            <Card
                isPanel = {false}
                //classCard={ {card:"small"} }
                image={ {
                            title:{default: data.hasOwnProperty('descripcion') ? data.descripcion : data.nombre_archivo,
                            data_i18n:"{{'CLEVER_CARD'}}"},
                            src : data.url
                        }
                    }
                control={
                <React.Fragment>
                        <SwitchButton
                            name="estado"
                            checked={(data.estado == 1) ? true : false}
                            id={data[rowUpdate]}
                            url={urlUpdateAsset}
                            type='link'
                            style='white'
                        />
                    <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(data)}>
                        <i className="material-icons">edit</i>
                    </a>
                </React.Fragment>
                }
                >
            {data.hasOwnProperty('tags') && setCustomTags(data)}
            </Card>
            <Modal
                ref={refModal}
                addButtons={[
                    <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                        <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                    </button>
                ]}
            />   
        </div>

    )
}

export const Video = ({data={}, urlUpdateAsset ="", isGallery= false , idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {

    const [description, setDescription] = useState("");
    const refModal = useRef();
    const refChips = useRef();

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    return(
        <div>
            <div className="col s6 m6 l6 xl6">
                <SwitchButton
                    name="estado"
                    checked={(data.estado == 1) ? true : false}
                    id={data[rowUpdate]}
                    url={urlUpdateAsset}
                />
            </div>
            <div className="col s6 m2 l2 xl2">
                <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(data)}>
                    <i className="material-icons">edit</i>
                </a>
            </div>
            <video  src={ data.url } type={getFileExtension(data.nombre_archivo)} key={data.idasset_type} width='100%' controls autostart="true" autoPlay={true}></video>
                <div key={data.idasset_type + 1}>
                    <div>{data.descripcion}</div>
                        {data.hasOwnProperty('tags') && setCustomTags(data)}
                </div>
            <Modal
                ref={refModal}
                addButtons={[
                    <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                        <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                    </button>
                ]}
            />  
        </div>
    )
}

export const Documents = ({data={}, urlUpdateAsset ="", isGallery= false , idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {

    const [description, setDescription] = useState("");
    const refModal = useRef();
    const refChips = useRef();

    function handleChangeForm(e){
        setDescription(e.target.value);
    }

    function handleSubmit(){
        console.warn("Chips =>>>>", refChips.current.getValue());
        refChips.current.getValue();
    }

    function handleUpdateRow(data){

        let content=<div className="row">
                <form className="col s12 m12">
                    <input id="id" name="id" type="hidden" value={data[rowUpdate]}/>
                    <div className="row">
                        <div className="input-field col s12 m12">
                            <input id="descripcion" name="descripcion" type="text" className="validate" required defaultValue={data.descripcion} onChange={(e) => { handleChangeForm(e) }}/>
                            <label htmlFor="descripcion" data-error="wrong" data-success="right" data-i18n="{{'DESCRIPTION'}}">Description</label>
                        </div>
                        <Chip
                            ref={refChips}
                            label={{ t: "Tags", d: "{{'TAGS'}}" }}
                            options={{ secondaryPlaceholder: "+ Tag" }} 
                        />
                    </div>
                </form>
            </div>
            ;
        //the modal reference is obtained and access the method of the instance example of setContentModal
        refModal.current.setContentModal(content);
        refModal.current.setHeaderModal(<span>Update Asset</span>);
        refChips.current.setValue(data.tags);
        return refModal.current.openModal();
    }

    return(
        <div>
            <div className="col s6 m6 l6 xl6">
                <SwitchButton
                    name="estado"
                    checked={(data.estado == 1) ? true : false}
                    id={data[rowUpdate]}
                    url={urlUpdateAsset}
                />
            </div>
            <div className="col s6 m2 l2 xl2">
                <a className="btn btn-icon btn-link" onClick = {()=>handleUpdateRow(data)}>
                    <i className="material-icons">edit</i>
                </a>
            </div>
            <embed type="application/pdf" src={`http://docs.google.com/gview?url=${data.url}&embedded=true`} width="100%" height="500px" />
            <div>
                {data.hasOwnProperty('descripcion') ? data.descripcion : data.nombre_archivo}
            </div>
                {data.hasOwnProperty('tags') && setCustomTags(data)}
            <Modal
                ref={refModal}
                addButtons={[
                    <button className="btn waves-effect waves-light" type="submit" onClick={() => handleSubmit()}>
                        <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
                    </button>
                ]}
            />  
        </div>
    )
}

export const Audio = ({data={}, urlUpdateAsset ="", isGallery= false , idgallery = 0, idasset_type=0, rowUpdate=""}) =>  {
}


/**
 * Inicio de funciones ejecutadas por cada constante del componente
*/
function setFilterComponent(e, data){

    return data.filter(x => x.descripcion.toLowerCase().includes(e.target.value.toLowerCase()))

    /*
         // En caso de que se requira un filtro mas completo (rompase en caso de incendios)
         let filter = [];
        if(data.hasOwnProperty('descripcion')){
            filter = data.filter(x => x.descripcion.toLowerCase().includes(e.target.value.toLowerCase()))
        }else{
            console.log('filter =>', data);
            filter = data.filter(x => x.nombre_archivo.toLowerCase().includes(e.target.value.toLowerCase()))
        }

        return filter
    */

}

function setFilterByTags(data, tags){
    let results = [];

    tags.forEach(function(word){
        results = data.filter(e => e.tags.includes(word));
    })

    return results;
}

function getFileExtension(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
}

function setCustomTags (i) {

    return (
     <div>
       { (i.tags)? (
          i.tags.map((tag, idx) =>
          <div key={idx} style={customTagStyle}> {tag} </div>
          )
       ) : (
         null
       )}
     </div>
    );
}

/**
 * Estilos para los componentes del Assets View
*/
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
const alertSuccess = {
    padding:'20px',
    backgroundColor: '#f44336',
    color:'white',
    opacity: 1,
    transition: 'opacity 0.6s',
    marginBottom: '15px',
    backgroundColor: '#4CAF50'
};
const alertInfo    = {
    padding:'20px',
    backgroundColor: '#f44336',
    color:'white',
    opacity: 1,
    transition: 'opacity 0.6s',
    marginBottom: '15px',
    backgroundColor: '#2196F3'
};
const alertWarning = {
    padding:'20px',
    backgroundColor: '#f44336',
    color:'white',
    opacity: 1,
    transition: 'opacity 0.6s',
    marginBottom: '15px',
    backgroundColor: '#ff9800'
};
