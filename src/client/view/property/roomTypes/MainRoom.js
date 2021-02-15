import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { GridView, CleverAccordion, Panel, CleverRequest, MComponentes, CleverLoading, CleverEditor, ConfirmDialog } from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";
import Header from '../../../components/header/Header';
import GeneralInfo from './generalInfo/GeneralInfo';
import Occupancy from './occupancy/Occupancy';
import Amenities from './amenities/Amenities';
import SelectedGalery from '../../../components/galery/SelectedGalery';
import ReactDragListView from 'react-drag-listview/lib/index.js';

export default class MainRoom extends Component {
    constructor(props){
        super(props)
        const hotelSelected = localStorage.getItem("hotel")
        this.state={
            hotelSelected : hotelSelected ? true : false,
            bandera: false,
            success: false,
            banderaForm: true,
            load: false,
            dataUpdateGeneral: '',
            dataUpdateOcupacy: '',
            dataUpdateAmeniti: '',
            banderaRequest: false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
        this.request = new Array();
        this.datos = new Array();
        this.CleverForm = new Array();
        this.getForms = this.getForms.bind(this);
        this.load = this.load.bind(this);
        this.btnColap = this.btnColap.bind(this);
        this.handlerChange = this.handlerChange.bind(this);
        this.saveSelectedImg = this.saveSelectedImg.bind(this);
        this.saveImg = this.saveImg.bind(this);

    }
    btnSaveGeneralInfo = React.createRef();
    TableMain = React.createRef();

    createSelected(iddef_room_type_category, action, actionModal){
        let property = this.state.hotelData.iddef_property;
        
        this.setState({ selecredGallery: <div>
            <SelectedGalery label={'Manager Images'} callBack={(response) => this.saveSelectedImg(response, action, iddef_room_type_category)}
        url={`/api/media-room/search-by-roomtype/${iddef_room_type_category}/${property}`} system={ `bengine` } actionModal={actionModal} btnClose={false}/>
        </div>});
        this.getOrder(iddef_room_type_category);
    }

    getOrder(iddef_room_type_category){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/media-room/search-order-by-roomtype/${iddef_room_type_category}/1`, (response, error) => {
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
                            {title: <img id={item.iddef_media_room} style={{width:'10%'}} src={item.url} className="responsive-img" />},
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

    saveSelectedImg(data, action, id){
        this.setState({ SelectedGalery: '', load: true })
        let medias_id = [];

        if (action == 'POST') {
            // console.log('POST: ',data, action, id);            
            data.map((item, key) => {
                medias_id.push(
                    {"iddef_media": item.iddef_media, "order": item.order},
                );
            })
            
        }else if (action == 'PUT') {
            // console.log('PUT: ',data, action, id);
            data.map((item, key) => {
                medias_id.push(
                    {"iddef_media": item.iddef_media, "order": item.order},
                );
            })
        }

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
            "iddef_room_type_category": id,
            "medias_id": medias_id
        }

        // console.log('sendData: ', sendData);
        
        CleverRequest.post(CleverConfig.getApiUrl('bengine') + '/api/media-room/post-and-put-media', sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                MComponentes.toast(response.Msg);
                if (response.Error == false) {
                    this.getOrder(id);
                    this.componentDidMount();
                    this.setState({ dataUpdateGeneral: '', dataUpdateOcupacy: '', dataUpdateAmeniti: '', bandera: true });
                    this.btnColap();
                    this.setState({ success: true });
                }

            }
        });

    }


    handlerChange = async (data) => {
        this.createSelected(data.iddef_room_type_category, 'PUT', false);
        this.setState({ dataUpdateGeneral: data, dataUpdateOcupacy: data, dataUpdateAmeniti: data,
            bandera: true });
    
        data.description.map((item, key) => {
            this.state.referencesEdit.map((edit)=>{
                if (edit.name.toLowerCase() == item.lang_code.toLowerCase()) {
                    edit.setContent(item.text);                    
                }
            });
        });

        this.setState({ NameTitle: ' - '+data.room_description });

        document.getElementById("selected").style.display = "none";
        let acordion = document.getElementById("test-collapsible");

        acordion.querySelector("ul.collapsible li").className = ' ';
        acordion.querySelector("ul.collapsible li div.collapsible-body").style.display = 'none';
        document.getElementById("AddEdit").style.display = "block";
        window.location.href = "#AddEdit";
    }
    
    btnColap = async () => {
        let acordion = document.getElementById("test-collapsible");

        if (this.state.bandera == false) {
            this.setState({ NameTitle: ' ' });
            acordion.querySelector("ul.collapsible li").className = ' ';
            acordion.querySelector("ul.collapsible li div.collapsible-body").style.display = 'none';
            document.getElementById("AddEdit").style.display = "block";
            window.location.href = "#AddEdit";
            // this.createSelected(0, 'POST', false);
            this.setState({order: this.state.room_order,dataUpdateGeneral:{}},()=>{
                this.setState({ dataUpdateGeneral: {
                    area: '',
                    area_unit: '',
                    room_code: '',
                    order: this.state.order,
                    room_order:'',
                    estado: 0,
                    market_option:'',
                    market_targeting:''
                }, dataUpdateOcupacy: '', dataUpdateAmeniti: '', bandera: true, selecredGallery: '', ItemsImages: null });    
            });

            this.state.referencesEdit.map((edit)=>{
                edit.setContent('');                    
            });
        }else{
            acordion.querySelector("ul.collapsible li").className = 'active';
            acordion.querySelector("ul.collapsible li div.collapsible-body").style.display = 'block';
            document.getElementById("AddEdit").style.display = "none";
            this.setState({ dataUpdateGeneral: '', dataUpdateOcupacy: '', dataUpdateAmeniti: '', bandera: false, selecredGallery: '', ItemsImages: null });
            this.state.referencesEdit.map((edit)=>{
                edit.setContent('');                    
            });
        }
    }

    componentDidMount = async () => {
        // this.createSelected(0, 'POST', false);
        this.getAPI();
        let property = this.state.hotelData.iddef_property;
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/property-lang/get?property=`+ property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                this.setState({ languages: response.data }); 

                const editorList = [];
                const editorRefs = [];
                response.data.map((item, key) => {
                    // this.editorRef = editorRefs+key;
                    editorList.push(
                    <div style={{width:'45%', float:'left', paddingLeft:'5%'}}>
                        <label><b>{item.language}</b></label>

                        <CleverEditor name={item.language_code} width='100%' height='100%'
                        required={true} onRef={ref => editorRefs.push(ref)}/>

                    </div>);
                })
                this.setState({ Editors: editorList, referencesEdit: editorRefs });
            }
        });
        this.setState({ load: true});

    }

    getAPI = async () => {
        let property = this.state.hotelData.iddef_property;
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + '/api/room-type-category/get?all=1&property=' + property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                const respuesta = response.data;
                let dataTable = [];
                let room_order = 0;

                respuesta.map((item) => {
                    let roomDescription = item.room_description;
                    let tmpItem = item;
                    room_order = tmpItem.room_order;
                    tmpItem.description_new = item.room_description.find(langItem => {
                        if (item.room_description.length > 0) {
                            if (langItem.lang_code.toLowerCase() == "es" || langItem.lang_code.toLowerCase() == "en") {                                
                                return tmpItem.room_description = langItem.text;
                            }else {
                                return tmpItem.room_description = '';
                            }   
                        }else{
                            return tmpItem.room_description = '';
                        }
                    });
                    tmpItem.description_new = roomDescription;

                    dataTable.push(tmpItem);
                });                
                this.TableMain.setDataProvider(dataTable);
                // console.log(dataTable);
                this.setState({ room_order: room_order });
            }
        });
        this.setState({ load: false });
       
    }

    getForms = async (Forms) => {
        this.setState({ load: true });

        this.request.push(Forms);

        if (this.request.length == 3) {
            this.actionApi();
            // console.log("array: ",this.request);
            this.request = [];          
        }
    }

    actionApi(){
        let edits = [];
        this.state.referencesEdit.map((edit)=>{
            edits.push({
                "lang_code":edit.name,
                "text": edit.getContent()
            });
        });

        let sendData = {};
        let sendDataUpdate = {};
        this.request.map((itemReq, keyReq) =>{            
            Object.keys(itemReq).map((itemObj, keyObj) =>{
                sendData[itemObj] = itemReq[itemObj]
            })
        })
        sendData.iddef_property = this.state.hotelData.iddef_property;

        this.CleverForm = [];
        console.warn("sendData: ",sendData);

        Object.keys(sendData).map((item, key) => {
            if (item != 'idUpdate') {
                sendDataUpdate[item] = sendData[item];                    
            }
        })

        sendDataUpdate.description = edits;

        if (sendData.idUpdate != null) {
            console.warn("Request PUT: ",sendDataUpdate);
            this.putPeticion(sendData.idUpdate, sendDataUpdate);
            this.request = [];
        }else{
            console.warn("Request POST: ",sendDataUpdate);
            this.postPeticion(sendDataUpdate);
            this.request = [];
        }
    }

    postPeticion(sendData){
        CleverRequest.post(CleverConfig.getApiUrl('bengine') + `/api/room-type-category/create/room`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                let property = this.state.hotelData.iddef_property;

                this.setState({ selecredGallery: <div>
                    <SelectedGalery callBack={(data) => this.saveSelectedImg(data, 'POST', response.data.room.iddef_room_type_category)}
                url={`/api/media-room/search-by-roomtype/${response.data.room.iddef_room_type_category}/${property}`} system={ `bengine` }
                actionModal={true} btnClose={true} actionClose={(data) => this.closeAndReload(data, response.data.room.iddef_room_type_category)}/>
                </div> });
                console.warn("Response POST: ",response);
                this.CleverForm = [];
                MComponentes.toast('Save images from this room');
                this.setState({ load: false });
                document.getElementById("selected").style.display = "block";
                document.getElementById("selectedAcordion").style.display = "block";

            }else{
                let msg = (typeof(response.Msg) == 'object')? 'Se requiere llenar los datos' : response.Msg;

                MComponentes.toast(msg);
                console.warn("Response: ",response);
                this.CleverForm = [];
                this.setState({ load: false });
            }
        });
    }

    putPeticion(id, sendData){
        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/room-type-category/update/room/${id}`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
                if (response.Error==false) {
                    console.warn("Response: ",response);
                    this.CleverForm = [];
                    MComponentes.toast(response.Msg);
                    this.setState({ success: true});
                }else{
                    let msg = (typeof(response.Msg) == 'object')? 'Se requiere llenar los datos' : response.Msg;

                    MComponentes.toast(msg);
                    console.warn("Response: ",response);
                    this.CleverForm = [];
                    this.setState({ load: false });
                }
            }
        )
    }

    closeAndReload(data, id){
        if (data=='CLOSE') {
            // console.log('entro a CLOSE');
            this.getOrder(id);
            this.componentDidMount();
            this.setState({ dataUpdateGeneral: '', dataUpdateOcupacy: '', dataUpdateAmeniti: '', bandera: true });
            this.btnColap();
            this.setState({ SelectedGalery: '', load: true, success: true });
        }
    }

    load(state){
        this.setState({ load: state });
    }

    render() {
        const controlForms = <div className="row">
            <div className='col s12 m12 l6'>
                <button type='button' onClick={this.btnColap} id="btnColap" className='btn'>CANCEL</button>
            </div>
            <div className='col s12 m12 l6'>
                <button type='button' ref={this.btnSaveGeneralInfo} id="btnSaveGeneralInfo" className='btn'>SAVE</button>
            </div>
        </div>;

        var Edits = (this.state.Editors)? this.state.Editors : null;
        
        const containerControls = <div className="row">
            <div className='col s12 m12 l6'>
                <button type='button' onClick={this.btnColap} id="btnColap" className='btn'>CREATE ROOM</button>
            </div>
        </div>;

        var generalInfo = this.state.languages? <GeneralInfo reference={this.btnSaveGeneralInfo} language={this.state.languages} getForms={this.getForms} dataUpdateGeneral={this.state.dataUpdateGeneral} load={this.load}/> : null;
        var occupancy = this.state.languages? <Occupancy reference={this.btnSaveGeneralInfo} language={this.state.languages} getForms={this.getForms} dataUpdateOcupacy={this.state.dataUpdateOcupacy} load={this.load}/> : null;
        var amenities = this.state.languages? <Amenities reference={this.btnSaveGeneralInfo} language={this.state.languages} getForms={this.getForms} dataUpdateAmeniti={this.state.dataUpdateAmeniti} load={this.load}/> : null;
        var CleverFormsMain = (this.CleverForm != '')? this.CleverForm : null;
        var load = (this.state.load == true)? <CleverLoading show={true}/> : null;
        if (this.state.hotelSelected === false) { return <Redirect to="/" /> }
        if (this.state.success == true) { window.location = "/property/room"; }

        return (
            <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine">
                <CleverLoading show={this.state.load}/>
                <CleverAccordion 
                    id={'test-collapsible'}
                    accordion={
                        {
                            head:[
                                {accordion:'view1',label:'ROOM TYPES', controls:[{control: containerControls}]},
                            ],
                            body:[
                                {view1: <GridView
                                    idTable='table-contracts-manuales'
                                    floatHeader= {true}
                                    onRef={ref => this.TableMain = ref}
                                    pagination={1000}
                                    serializeRows={true}
                                    classTable={'clever-table responsive-table striped bordered'}
                                    filter={false}
                                    columns={[
                                        { attribute : 'iddef_room_type_category', visible : false },
                                        { attribute : 'room_description', alias : 'Room'},
                                        { attribute : 'room_code', alias : 'Room code' },
                                        { attribute : 'min_ocupancy', alias : 'Minimum' },
                                        { attribute : 'standar_ocupancy', alias : 'Standard' },
                                        { attribute : 'max_ocupancy', alias : 'Maximum' },
                                        { attribute : 'room_order', alias : 'Room order' },
                                        {attribute: 'actions',
                                        alias: 'Actions',
                                            value : (data) => {
                                                return (<div>
                                                    <a href="javascript:void(0)" onClick={e=>this.handlerChange(data)}>
                                                        <i className='material-icons left'>mode_edit</i>
                                                    </a>
                                                    {
                                                    data.estado == 1 ?
                                                    <a onClick={(e) => this.deleteRoom(0, data)} title='Disable RatePlan'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) => this.deleteRoom(1, data)} title='Enable RatePlan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                    }
                                                </div>);
                                            }
                                        }
                                    ]}
                                />}
                            ],
                        }
                    }
                />
                
                <div className='col s12 m4 l4' id='selected' style={{display:"none"}}>
                    {this.state.selecredGallery}
                </div>

                <div ref="AddEdit" id="AddEdit" style={{display:"none"}}>
                    <Header title={'ADD/EDIT ROOM TYPE'+this.state.NameTitle} controls={[{ control: controlForms }]}/>
                    <CleverAccordion 
                        id={'test-collapsible2'}
                        accordion={
                            {
                                head:[
                                    {accordion:'view1',label:'GENERAL ROOM INFO', controls:[]},
                                    {accordion:'view2',label:'OCCUPANCY & BEDS', controls:[]},
                                    {accordion:'view3',label:'AMENITIES', controls:[]},
                                    {accordion:'view4',label:'DESCRIPTIONS', controls:[]},
                                    {accordion:'view5',label:'IMAGES', controls:[]},
                                ],
                                body:[
                                    {
                                    view1: generalInfo,
                                    view2: occupancy,
                                    view3: amenities,
                                    view4: 
                                        <div className="row">
                                            <div className='col s12 m12 l12'>
                                                {Edits}
                                            </div>
                                        </div>,
                                    view5: 
                                        <div className="row">
                                            <div className='col s12 m6 l6' id='selectedAcordion' style={{display:"block"}}>
                                                {(this.state.selecredGallery)? this.state.selecredGallery : <h6>Save the room first</h6>}
                                            </div>

                                            {(this.state.ItemsImages)?
                                                <div>                                                
                                                    <div className='col s12 m6 l6'>
                                                        <a href="javascript:void(0)" onClick={e=>this.saveImg()}>
                                                            <i className='btn'>Save Order Image</i>
                                                        </a>
                                                    </div>

                                                    <div className='col s12 m12 l12'>
                                                        <div className="simple-inner" style={{paddingTop:'20px'}}>
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
                                                </div>
                                            : null}
                                        </div>,
                                    }
                                ],
                            }
                        }
                        
                    />
                </div>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteRoomConfirm() }}
                />
            </Panel>
        );
    }


    saveImg(){
        this.setState({ load: true })
        const sendData = [];
        this.state.ItemsImages.map((item, key) => {
            sendData.push(
                {iddef_media_room: item.title.props.id, order: (key+1)}
            );
        })

        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/media-room/update-order-media`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!response.Error) {
                MComponentes.toast(response.Msg);
                this.setState({ load: false })
            }else{
                console.log(response);
                MComponentes.toast('Error on save');
                this.setState({ load: false })
            }
        })
    }

    deleteRoom(newEstado, data){
        this.setState({ Update: {"sendData": {"estado": newEstado}, "idRoom": data.iddef_room_type_category } });
        this.refConfirm.getInstance().open()
    }

    deleteRoomConfirm(){
        let { Update } = this.state;
        this.setState({ load: true });
        
        CleverRequest.put(CleverConfig.getApiUrl('bengine') + `/api/room-type-category/update/${Update.idRoom}`, Update.sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!response.Error) {
                MComponentes.toast(response.Msg);
                this.getAPI();
            }
        })
    }

    
}
