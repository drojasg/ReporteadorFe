import React from 'react';

import { CleverRequest, CleverMethodsApi, Modal, MComponentes} from 'clever-component-library'
import NewPropertyForm from './NewPropertyForm'
import Header from '../../components/header/Header'
import CleverConfig from "./../../../../config/CleverConfig";
import Thumbnail from '../../components/thumbnail/Thumbnail';

export default class MainSelectHotel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {};
    };

    componentDidMount() {
       this.getDataHotel();
    };

    reload = () => {
        this.getDataHotel();
        this.componentDidMount();
    }

    getDataHotel = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +"/api/property/get?all/", (response, error) => {
            if (!error) 
            {
                let data = [];

                response.data.map(object => {
                    data.push({
                        size:'col s12 m3 l3',
                        titleHeader:object.estado == 1 ? 
                            <div className="valign-wrapper teal-text"><i className='material-icons'>fiber_manual_record</i><span> Open</span></div> 
                        : 
                            <div className="valign-wrapper red-text"><i className='material-icons'>fiber_manual_record</i><span> Close</span></div>,
                        subtitleHeader: 'creation: 10 Sep, 2017',
                        titleBody: object.short_name,
                        subtitleBody: object.property_code,
                        body: object.brand,
                        image: object.image_url,
                        onClick: this.clickHotel.bind(this,object)
                    });
                });

                this.setState({ 
                    dataThumbnails : data,
                }); 
            }
            else
            {
                console.log(error)
            };
        });
    };


    clickHotel(hotel) {
        localStorage.setItem("hotel", JSON.stringify(hotel));
        window.location = "/property/general";
    };

    openModalNewProperty = () => {
        //NEW ROLE
        this.setState({
            dataNewPropertyForm:{
                short_name: '',
                trade_name: '',
                icon_logo_name: '',
                property_code: '',
                web_address: '',
                iddef_time_zone: '',
                iddef_brand: '',
                iddef_property_type: '',
                filters: '',
                property_lang: '',
                estado: '',
            },
            title: {
                text: "Add property",
            },
        }, () => this.modalNewProperty.getInstance().open());
    }

    saveData = () => {
        let data =  this.refModalProperty.getData();
        let filterArray = [];
        filterArray.push(parseInt(data.filters));
        let propertyLangArray = [];
        propertyLangArray.push(parseInt(data.property_lang));
        let dataSave = {
            'short_name': data.short_name,
            'trade_name': data.trade_name,
            'icon_logo_name': data.icon_logo_name,
            'property_code': data.property_code,
            'web_address': data.web_address,
            'iddef_time_zone': parseInt(data.iddef_time_zone),
            'iddef_brand': parseInt(data.iddef_brand),
            'iddef_property_type': parseInt(data.iddef_property_type),
            'filters': filterArray,
            'property_lang': propertyLangArray,
            'estado': parseInt(data.estado),
        }
        if (data.required > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/property/create', dataSave, (data, error) => {
                if (!error) {
                    let notificationType = "";
                    let notificationMessage = "";
                    if (!data.Error) {
                        notificationType = "success";
                        notificationMessage = "The data was saved";
                        this.reload();
                        this.modalNewProperty.getInstance().close();
                    } else {
                        notificationType = "error";
                        notificationMessage = "The data was no saved";
                    }
                    MComponentes.toast(notificationMessage);
                    this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                }
            });
        }
    }

    getConfigAddButtonsModal() {
        let buttons = [
            <button className="btn waves-effect waves-light" onClick={e => this.saveData(e)} >
                <i className="material-icons right">add</i><span data-i18n="{{'ADD'}}">Add</span>
            </button>
        ];
        return buttons;
    }

    render() {
        let {dataNewPropertyForm} = this.state;
        return (
            <div className="row">
                {
                dataNewPropertyForm ?
                <Modal title={this.state.title} isFull={true} autoOpen = {false} onRef={ref => this.modalNewProperty = ref} addButtons={this.getConfigAddButtonsModal()} >
                    <div className="row">
                        <NewPropertyForm dataNewPropertyForm={this.state.dataNewPropertyForm} ref={ref => this.refModalProperty = ref}></NewPropertyForm>
                    </div>
                </Modal>
                :
                null
                }
                <Header title="All properties" controls={[{control:<button type='button' id="btnAddProperty" className='btn' onClick={this.openModalNewProperty}>ADD PROPERTY</button>}]}/>
                <Thumbnail thumbnails={this.state.dataThumbnails}/>
            </div>
        );
    };
};