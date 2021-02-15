import React, { Component } from 'react'
import CleverConfig from '../../../../../config/CleverConfig'
import {CleverLoading,CleverRequest, CleverInputSelect, CleverButton, CleverAccordion, Modal, MComponentes } from 'clever-component-library'
import Countries from './Countries'
import NewMarketForm from './NewMarketForm'

export default class CountriesAndMarkets extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            dataMarkets: [],
            selectedMarket: 0,
            title: {},
            defaultButton: {},
        }
        this.btnAddCountry = React.createRef();
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        this.setState({load: true});
        this.getMarkets();
    }

    getMarkets() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/market/get?all=1`, (response, error) => { 
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let markets = [{"value": 0, "option": "ALL MARKETS"}];
                response.data.map((data) => {
                    if(data.estado == 1) {
                        markets.push({value: data.iddef_market_segment, option:data.code});
                    }
                });
                this.setState({dataMarkets: markets,load: false});
            }
        });
    }

    getMarketID(idMarket,functionMarketID=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/market/search/${idMarket}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            let dataMarketByID;
            if (!error) {
                dataMarketByID = response.data;
                console.log("dataMarket", dataMarketByID)
                this.setState({
                    dataNewMarketForm: {
                        iddef_market_segment: dataMarketByID.iddef_market_segment,
                        description: dataMarketByID.description,
                        code: dataMarketByID.code,
                        currency_code: dataMarketByID.currency_code,
                        pms_profile_id: dataMarketByID.pms_profile_id,
                        status: String(dataMarketByID.estado),
                    }
                },functionMarketID);
            }else{
                this.setState({
                    dataNewMarketForm: {}
                },functionMarketID);
            }
        });
    }

    handleInputSelectMarkets = (_optionSelected) => {
        this.setState({selectedMarket: _optionSelected.value});
    }

    openModalMarket(e,tipo){
        this.setState({dataNewMarketForm:null},()=>{

            let id = 0;        

            switch(tipo){
                case 'ADD':
                            this.setState({
                                            dataNewMarketForm: {
                                                iddef_market_segment: '0',
                                                description: '',
                                                code: '',
                                                currency_code: '',
                                                pms_profile_id: '',
                                                status: '',
                                            },
                                            title: {
                                                text: "Add market",
                                            }
                            },()=>{
                                this.modalNewMarket.getInstance().open();
                            });
                    break;
                case 'UPDATE':
                                this.state.dataMarkets.map((item, key)=>{
                                    if (item.value == this.state.selectedMarket) {
                                        id = item.value;
                                    };
                                });

                                id !== 0 ?
                                    this.getMarketID(id,()=>{
                                        let code = this.state.dataNewMarketForm.code !== undefined ? this.state.dataNewMarketForm.code :null
                                        this.setState({
                                            title: {
                                                text: "Currently updating: " + code,
                                            }
                                        });
                                        this.modalNewMarket.getInstance().open();
                                    })
                                :null;
                    break;
                default:
                    break;
            }

        });
    }

    saveData(e){
        let data =  this.refModalMarket.getData();
        let iddef_market_segment = parseInt(data.iddef_market_segment);
        let requestMarket = data.dataMarket;
        let isError = data.isError;
        
        this.setState({ load: true}); 
        if(!isError){
            if(requestMarket !== undefined){
                //aplica PUT
                if(iddef_market_segment !== 0){
                    CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/market/update/${iddef_market_segment}`, requestMarket, (data, error) => {
                        if (data.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
                            return
                        }
                        if (!error) {
                            let notificationType = "";
                            let notificationMessage = "";
                            if (!data.Error) {
                                notificationType = "success";
                                notificationMessage = "The data was saved";
                                this.reload();
                                this.modalNewMarket.getInstance().close();
                            } else {
                                notificationType = "error";
                                notificationMessage = "The data was no saved";
                            }
                            MComponentes.toast(notificationMessage);
                            this.setState({load: false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                        }
                    });
                }
                //aplica POST
                else{
                        CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/market/create', requestMarket, (data, error) => {
                            if (data.status == 403) {
                                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                this.setState({ load: false });
                                return
                            }
                            if (!error) {
                                let notificationType = "";
                                let notificationMessage = "";
                                if (!data.Error) {
                                    notificationType = "success";
                                    notificationMessage = "The data was saved";
                                    this.reload();
                                    this.modalNewMarket.getInstance().close();
                                } else {
                                    notificationType = "error";
                                    notificationMessage = "The data was no saved";
                                }
                                MComponentes.toast(notificationMessage);
                                this.setState({load: false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                            }
                        });

                }
            }
        }else{
            this.setState({ load: false}); 
        }
    }

    getConfigAddButtonsModal(){
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.saveData(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SAVE'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    render() {
        let {load,dataMarkets,selectedMarket,dataNewMarketForm,title}= this.state;

        return (
            <div className="row">
                <CleverLoading show={load}/>
                {/* Markets */}
                <CleverInputSelect id="id-inputSelect-market" size="col s12 m6 l6" label="Market" 
                    uppercase={true} name="name-inputSelect-market" 
                    options={dataMarkets} defaultValue={"0"} 
                    onChange={this.handleInputSelectMarkets}
                />
                <CleverButton label="Add market" icon="add" 
                    onClick={e=>this.openModalMarket(e,'ADD')} size="col s12 m3 l3" fullSize={true}/> 
                <CleverButton label="Edit current market" icon="edit" 
                onClick={e=>this.openModalMarket(e,'UPDATE')} size="col s12 m3 l3" 
                fullSize={true} disabled={selectedMarket == 0 ? true : false}/>
                
                <Modal title={title} isFull={true} autoOpen = {false} 
                    ref={ref => this.modalNewMarket = ref} 
                    // defaultButton={this.state.defaultButton} 
                    addButtons={this.getConfigAddButtonsModal()}
                    selectedMarket={selectedMarket}>
                    {dataNewMarketForm ?
                        <div className="row">
                            <NewMarketForm dataNewMarketForm={dataNewMarketForm} ref={ref => this.refModalMarket = ref}></NewMarketForm>
                        </div>                    
                    :null}
                </Modal>
                
                <CleverAccordion id="id-cleverAccordion-countriesAndMarkets" accordion={{
                    head: [{
                        accordion:'countries',
                        label:'Countries',
                        controls:[{control: <button type="button" ref={this.btnAddCountry} id="id-btn-AddCountry" className="btn">Add country</button>}]
                    }],
                    body: [{
                        countries: <Countries btnAddCountry={this.btnAddCountry} 
                        selectedMarket={selectedMarket}></Countries>
                    }],
                }}/>
            </div>
        )
    }
}
