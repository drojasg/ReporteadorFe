import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverRequest, Panel, CleverForm, CleverLoading, MComponentes, GridView, CleverAccordion, Upload } from 'clever-component-library';
import Header from '../../../components/header/Header';
import CleverConfig from "./../../../../../config/CleverConfig";
//import Upload from './../../../components/upload/Upload';
import axiosRequest from './../../../axiosRequest';

export default class MainSvg extends React.Component 
{  

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            load: false,
            status: 'CREATE',
        }

        this.sendData = this.sendData.bind(this);
        this.openModal = this.openModal.bind(this);
        this.btnColap = this.btnColap.bind(this);
        this.crossout = false;
    }
    formFilters = React.createRef();

    componentDidMount(){
        this.getMediaType();
        this.getMediaGroup();
    }

    getMediaGroup(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/media-group/get`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    if (response.data.length > 0) {
                        let group = response.data.find(Item => Item.description == "All Properties");
                        this.setState({ load: false, idMediaGroup: group.iddef_media_group });
                    }else{
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                }else{
                    this.setState({ load: false });
                    MComponentes.toast(response.Error);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        });
    }

    getMediaType(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/media-group/get-all-media-by-group/0/0/0?type=3`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.error) {
                    if (response.data.length > 0) {
                        // var found = response.data.find(element => {
                        //     return element.estado == 1;
                        // });
                        this.TableMain.setDataProvider(response.data);
                    }else{
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                }else{
                    this.setState({ load: false });
                    MComponentes.toast(response.error);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        });
    }

    sendData = async (status, dataAmazone) => {
        let { dataEdit, idMediaGroup } = this.state;
        let InputData = this.formFilters.getData();
        let sendData = {};

        console.log(status, dataAmazone);
        console.log('MediaTypeSvg: ', );
        console.log('DataAmazone: ', dataAmazone);

        if (InputData.required.count == 0) {
            if (status == 'EDIT') {
                let ID = dataEdit.id_asset_gallery;

                sendData.url = dataAmazone.data.objectURL;
                sendData.etag = dataAmazone.data.ETag;
                sendData.name = InputData.values.name;
                sendData.nombre_bucket = dataAmazone.data.bucket;
                sendData.estado = 1;

                this.updateData(ID, sendData);
            }else if (status == 'CREATE') {
                sendData.iddef_media_type = 3;
                sendData.iddef_media_group = idMediaGroup;
                sendData.url = dataAmazone.data.objectURL;
                sendData.description = 'Archivo SVG';
                sendData.nombre_bucket = dataAmazone.data.bucket;
                sendData.bucket_type = 1;
                sendData.etag = dataAmazone.data.ETag;
                sendData.show_icon = 0;
                sendData.name = InputData.values.name;
                sendData.tags =  {"tags": [""]};
                sendData.estado = 1;

                this.createData(sendData);
            }
        } else{
            MComponentes.toast('Empty fields');
            this.setState({ load: false });
        }
    }

    render(){
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        const data = [
            { "value": "3", "text": "icons", acceptType: "Icon/*" }
        ];
        
        return (
            <div>
                <CleverLoading show={this.state.load}/>
                <Panel icon=" " bold={true} capitalize={true} title=" ">
                    <Header title={'UPLOAD SVG'} controls={[{ control: <div className='col s12 m12 l6'>
                                        <button type='button' onClick={this.btnColap} id="btnColap" className='btn'>CREATE</button>
                                    </div> }]}/>
                    <div className="row">
                        <div className="col s12 m6 l6">
                            <CleverForm
                                ref={ref => this.formFilters = ref}
                                data={this.state.dataForm}
                                id={'form-crossout'}
                                forms={[
                                    {
                                        fieldset: false,
                                        title: "",
                                        inputs: [
                                            {row: [
                                                {type:'component', 
                                                component:() =>{
                                                    return (
                                                        <div>
                                                            <label>Name file: </label>
                                                        </div>
                                                    );
                                                }   
                                            },
                                            ]},
                                            {row:[
                                                {type:'text',size:'col s12 m12 l12',name:'name',label:' ', required: true},
                                            ]}
                                        ]
                                    }
                                ]}
                            />
                        </div>
                        <div className="col s12 m6 l6">
                            <Upload
                                onRef={fileUpload => this.refupload = fileUpload}
                                bucket={'booking_engine'}
                                mode={'admin'}
                                pyApi={true}
                                acceptType={true}
                                urlServiceUploadBucket={CleverConfig.getApiUrl('apiAssetsPy') + '/s3upload'}
                                //functionBefore={this.beforeSave.bind(this, 'POST')}
                                functionBefore={() => {this.setState({load:true}); return true; }}
                                acceptTypeContent={data}
                                callBack={this.sendData.bind(this, this.state.status)}
                            />
                        </div>
                    </div>
                    <CleverAccordion 
                        id={'test-collapsible'}
                        accordion={
                            {
                                head:[
                                    {accordion:'view2',label:'SVG LIST', controls:[]},
                                ],
                                body:[{
                                    view2: <GridView
                                        idTable='table-contracts-manuales'
                                        floatHeader= {true}
                                        onRef={ref => this.TableMain = ref}
                                        pagination={1000}
                                        serializeRows={true}
                                        classTable={'clever-table responsive-table striped bordered'}
                                        filter={false}
                                        columns={[
                                            { attribute : 'id_asset_gallery', visible : false },
                                            { attribute : 'name', alias : 'Room'},
                                            {attribute: 'actions',
                                            alias: 'Actions',
                                                value : (data) => {
                                                    return (<div>
                                                        <a href="#" onClick={(e) => this.openModal(e, data)}>
                                                            <i className='material-icons left'>mode_edit</i>
                                                        </a>
                                                        {
                                                        data.estado == 1 ?
                                                        <a onClick={(e) => this.updateStatus(0, data)} title='Disable RatePlan'><i className='material-icons left'  >toggle_on</i></a>
                                                        :
                                                        <a onClick={(e) => this.updateStatus(1, data)} title='Enable RatePlan'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                        }
                                                    </div>);
                                                }
                                            }
                                        ]}
                                    />,
                                }],
                            }
                        }
                    />
                </Panel>
            </div>
        );
    };

    openModal(e, data){
        console.log(data);
        this.setState({ dataEdit: data, status: 'EDIT', dataForm: {name: String(data.name),} })
        let acordion = document.getElementById("test-collapsible");
        console.log(acordion);
        
        acordion.querySelector("ul.collapsible li").className = ' ';
        acordion.querySelector("ul.collapsible li div.collapsible-body").style.display = 'none';
        window.location.href = "#AddEdit";
    }

    btnColap(){
        this.setState({ status: 'CREATE', dataForm: {name: ''} })
    }

    updateStatus(status, data){
        this.setState({ load: true});
        let ID = data.id_asset_gallery;
        let sendData = {};

        sendData.url = data.url;
        sendData.etag = data.etag;
        sendData.name = data.name;
        sendData.nombre_bucket = data.nombre_bucket;
        sendData.estado = status;

        this.updateData(ID, sendData);
    }

    updateData(ID, sendData){
        console.log(ID, sendData);

        axiosRequest.put(CleverConfig.getApiUrl('bengine') + `/api/media/update-media-url/${ID}`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    if (Object.keys(response.data).length != 0) {
                        this.getMediaType();
                        console.log('UPDATE_realizado: ', response);
                        MComponentes.toast(response.Msg);
                        this.setState({ load: false });
                    }else{
                        MComponentes.toast("Data Empty");
                        this.setState({ load: false });
                    }
                }else{
                    MComponentes.toast("ERROR, try again");
                    this.setState({ load: false });
                }
            } else {
                console.log(error)
                MComponentes.toast("ERROR, try again");
            }
        });
    }

    createData(sendData){
        console.log(sendData);
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/media/create`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error) {
                    if (Object.keys(response.data).length != 0) {
                        this.getMediaType();
                        MComponentes.toast(response.Msg);
                        this.setState({ load: false });
                        console.warn(response);
                    }else{
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                }else{
                    this.setState({ load: false });
                    MComponentes.toast(response.Error);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        });
    }

};