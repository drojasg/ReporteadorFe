
import React, { Component } from 'react';
import {MComponentes, CleverRequest,CleverAccordion,CleverForm, CleverButton,CleverLoading} from 'clever-component-library';
import CleverConfig from "./../../../../config/CleverConfig";
import SelectedGalery from './SelectedGalery';
import ReactDragListView from 'react-drag-listview/lib/index.js';

export default class ContentGalery extends Component {
   constructor(props) {
       super(props);
       this.startPag = this.startPag.bind(this);
       this.saveOrderImg = this.saveOrderImg.bind(this);

       this.state = {
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
            actionModal: false,
            load : false,
       }
   }

    componentDidMount() {
        // console.log('componente content imag ==> ',this.props);
        this.props.refSaveOrder !== null ? document.getElementById(this.props.refSaveOrder.current.id).addEventListener("click", this.saveOrderImg) : null; 
        this.state.propertySelected ? this.startPag() : MComponentes.toast('You must selct a property first.');    
    }

    startPag(){
        this.setState({ load: true });        
        this.createManagerImg(()=>{
            this.getOrderImg();
            this.setState({ load: false }); 
        });
    }

    createManagerImg(functionCreate=()=>{}){
        let id_property= this.state.propertySelected.iddef_property;
        this.setState({SelectedGalery: <div><SelectedGalery label={'Manage Images'} callBack={(response) => this.saveSelectedImg(response)}
        url={`/api/media-property/search-all-by-property/${id_property}/1`} system={ `bengine` }/></div> },functionCreate)
    }

    saveSelectedImg(data){
        // console.log('data: ', data);

        this.setState({ SelectedGalery: '', load: true,ItemsImages:'' });
        let medias_id = [];
        let id_property = this.state.propertySelected.iddef_property;
        data.map((item, key) => {
            medias_id.push(
                {"iddef_media": item.iddef_media, "order": item.order}
                // item.iddef_media
            );
        })
        
        medias_id = medias_id.sort(function (a, b) {
            if (a.order > b.order) {
            return 1;
            }
            if (a.order < b.order) {
            return -1;
            }
            // a must be equal to b
            return 0;
        });

        let cont = 1;
        for (let i = 0; i < medias_id.length; i++) {
            const element = medias_id[i];
            
            if (element.order == null) {
                element.order = medias_id[medias_id.length - 1].order + cont;
                cont = cont + 1;
            }
        }

        let sendData = { 
            "iddef_property": id_property,
            "medias_id": medias_id 
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') + '/api/media-property/post-and-put-media', sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    this.startPag();
                    return MComponentes.toast(response.Msg);
                }else if (response.Error == true) {
                    this.startPag();
                    this.setState({load: false})
                    return MComponentes.toast(response.Msg);
                }
            }else{
                this.startPag();
                this.setState({load: false})
            }
        });
    }

    getOrderImg(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/media-property/search-order-by-property/${this.state.propertySelected.iddef_property}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!response.Error) {
                if (response.data.length > 0) {
                    let newData = [];
                    const ItemData = [];

                    newData = response.data.sort(function (a, b) {
                        if (a.order > b.order) {
                        return 1;
                        }
                        if (a.order < b.order) {
                        return -1;
                        }
                        // a must be equal to b
                        return 0;
                    });

                    // console.log("newData: ", newData);
                    
                    newData.map((item, key)=>{
                        ItemData.push(
                            {title: <img id={item.iddef_media_property} style={{width:'10%'}} src={item.url} className="responsive-img" />},
                        );
                    })

                    this.setState({ ItemsImages: ItemData });
                    this.getItemDrag();
                }
            }
        });
    }

    getItemDrag(){
        // console.error('this.state.ItemsImages: ', this.state.ItemsImages);
        const that = this;  
        const dragProps = {
            onDragEnd(fromIndex, toIndex) {
                const { ItemsImages } = that.state;
                const item = ItemsImages.splice(fromIndex, 1)[0];
                ItemsImages.splice(toIndex, 0, item);
                that.setState({ ItemsImages });
                // console.log(data);
            },
            nodeSelector: 'li',
            handleSelector: 'a'
        };

        return dragProps;
    }

    saveOrderImg(){
        this.setState({ load: true });
        const sendData = [];
        this.state.ItemsImages.map((item, key) => {
            sendData.push(
                {iddef_media_property: item.title.props.id, order: (key+1)}
            );
        })

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/media-property/update-order-media`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if(!error){
                if (!response.Error) {
                    MComponentes.toast(response.Msg);
                    // this.setState({ load: false });
                    this.startPag();
                }else{
                    this.startPag();
                    console.log(response);
                    MComponentes.toast('Error on save');
                    this.setState({ load: false })
                }
            }else{
                this.startPag();
                this.setState({load: false})
            }
        })
    }

    render() {
        let {load,SelectedGalery,ItemsImages}= this.state;
        return (
            <div> 
                <CleverLoading show={load}/> 
                <div className="row">{SelectedGalery}</div>
                <div className="row">
                    {(ItemsImages)?
                        <div className="row">
                            <div className="simple-inner" >
                                <ReactDragListView.DragColumn {...this.getItemDrag()}>
                                    <ol style={{ width: '100%' }}>
                                        {this.state.ItemsImages.map((item, index) => (
                                            <li key={index} style={{display:'inline', paddingLeft:'10px'}}>
                                                <a href="#">{item.title}</a>
                                            </li>
                                        ))}
                                    </ol>
                                </ReactDragListView.DragColumn>
                            </div>
                        </div>
                    : load !== true ?<h6>Save images first</h6>:null}                                           
                </div>
            </div>
        )
    }
}

ContentGalery.defaultProps = {
    refSaveOrder: null
}

    
    