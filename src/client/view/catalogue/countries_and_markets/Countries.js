import React, { Component } from 'react'
import { CleverLoading, GridView, CleverRequest, Modal, MComponentes } from 'clever-component-library'
import CleverConfig from '../../../../../config/CleverConfig'
import NewCountryForm from './NewCountryForm'

export default class Countries extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load: false,
            dataCountries: [],
            title: {},
            defaultButton: {},
            toggleStatus: {},
        }
        this.tableCountries = React.createRef();
    }

    static getDerivedStateFromProps(props, state) {
        if (props.selectedMarket !== state.selectedMarket) {
            return {
                selectedMarket: props.selectedMarket
            }
        } else return null;
    }

    componentDidMount() {
        this.getCountries();
        this.props.btnAddCountry.current ? document.getElementById(this.props.btnAddCountry.current.id).addEventListener("click", e => this.openModalCountries(e)) : null;
    }

    reload = () => {
        this.getCountries();
        this.componentDidMount();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedMarket !== this.state.selectedMarket) {
            this.getCountries(this.state.selectedMarket);
        }
    }
    
    getCountries = async (selectedMarket) => {
        this.setState({ load: true});
        if (selectedMarket === undefined || selectedMarket == 0) {
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/country/get?all=1`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    this.setState({ dataCountries: response.data });
                    this.tableCountries.setDataProvider(this.state.dataCountries);
                    this.setState({ load: false});   
                }
            });
        } else {
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/country/get?market=${selectedMarket}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    this.setState({ dataCountries: response.data });
                    this.tableCountries.setDataProvider(this.state.dataCountries);
                    this.setState({ load: false});   
                }
            });
        }
    }

    getCountryByID(iddef_country, functionGetData = () => {}) {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/country/search/${iddef_country}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {      
                let data = response.data;
                data.idmarket_segment = String(data.idmarket_segment);                
                this.setState({
                    dataNewCountryForm: data
                }, functionGetData);                
            }
        });
    }

    getRequest(data){
        let requestCountry = {}; 
        if (data !== undefined) {
            requestCountry.iddef_country = data.iddef_country;
            requestCountry.name = data.name;
            requestCountry.alias = data.alias;
        }
        return requestCountry;
    }

    openModalCountries = (iddef_country) => {
        this.setState({dataNewCountryForm:null})
        if (typeof(iddef_country) === 'number') {
            this.getCountryByID(iddef_country, () => {
                this.setState({
                    title: {
                        text: "Currently updating: " + this.state.dataNewCountryForm.name,
                    },
                }, () => this.modalNewCountry.getInstance().open());
            });
        } else {
            this.setState({
                dataNewCountryForm:{
                    market: '',
                    country_code: '',
                    alias: '',
                    idmarket_segment: '',
                    name: '',
                    iddef_country: 0,
                    dialling_code:'',
                    data_langs: []
                },
                title: {
                    text: "Add country",
                },
            }, () => this.modalNewCountry.getInstance().open());
        }   
    }    

    toggleCountryStatus = (e, data) => {
        let toggleStatus = data;
        this.saveData(e,toggleStatus);
        toggleStatus = {};
    }
    
    saveData = (e,toggleStatus) => {
        if (toggleStatus != undefined) {
            //UPDATE STATUS ONLY
            this.getCountryByID(toggleStatus.iddef_country,()=>{
                let dataCountry = this.state.dataNewCountryForm;
                dataCountry[`estado`] = toggleStatus.estado == 0 ? 1 :0;
                let requestCountry = {
                    'name': dataCountry.name,
                    'country_code': dataCountry.country_code,
                    'alias': dataCountry.alias,
                    'idmarket_segment': dataCountry.idmarket_segment,
                    'dialling_code':dataCountry.dialling_code,
                    'estado': dataCountry.estado,
                    'data_langs' :dataCountry.data_langs
                }
                let iddef_country = parseInt(toggleStatus.iddef_country);  
                this.setState({ load: true});  
                CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/country/update/${iddef_country}`, requestCountry, (data, error) => {
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
                        } else {
                            notificationType = "error";
                            notificationMessage = "The data was no saved";
                        }
                        MComponentes.toast(notificationMessage);
                        this.setState({load: false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                    }else{
                        this.setState({load: false});
                    }
                });            
            });
        } else {
            //UPDATE DATA
            let data =  this.refModalCountry.getData();            
            let requestCountry = data.dataCountry;
            let iddef_country = parseInt(data.iddef_country);
            let isError = data.isError;        
            
             if(!isError){
                if(iddef_country !== 0){
                    this.setState({ load: true});  
                    CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/country/update/${iddef_country}`, requestCountry, (data, error) => {
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
                                    notificationMessage = data.Msg;
                                    this.reload();
                                    this.modalNewCountry.getInstance().close();
                                } else {
                                    notificationType = "error";
                                    notificationMessage = data.Msg;
                                }
                                MComponentes.toast(notificationMessage);
                                this.setState({load: false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                            }else{
                                this.setState({load: false});
                            }
                    });
                }else{
                    this.setState({ load: true});  
                    CleverRequest.post(CleverConfig.getApiUrl('bengine') +'/api/country/create', requestCountry, (data, error) => {
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
                                notificationMessage = data.Msg;
                                this.reload();
                                this.modalNewCountry.getInstance().close();
                            } else {
                                notificationType = "error";
                                notificationMessage = data.Msg;
                            }
                            MComponentes.toast(notificationMessage);
                            this.setState({load: false,hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
                        }else{
                            this.setState({load: false});
                        }
                    });
                }
             }
            
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
        let {dataNewCountryForm} = this.state;
        return (
            <>
            <CleverLoading show={this.state.load}/>
            <Modal title={this.state.title} isFull={true}
            onRef={ref => this.modalNewCountry = ref} 
            // defaultButton={this.state.defaultButton}
            addButtons={this.getConfigAddButtonsModal()}
            >
                
                {dataNewCountryForm ?
                    <NewCountryForm dataNewCountryForm={dataNewCountryForm} 
                        ref={ref => this.refModalCountry = ref}>                        
                    </NewCountryForm>
                :null} 
                
            </Modal>
            <GridView idTable='table-countries' floatHeader={true} onRef={ref => this.tableCountries = ref} pagination={10} serializeRows={false} filter={true}
                columns={[
                    { attribute : 'iddef_country', alias : 'Number Country'},
                    { attribute : 'market', alias : 'Market' },
                    { attribute : 'name', alias : 'Country' },
                    { attribute : 'country_code', alias : 'Country code' },
                    { attribute : 'alias', alias : 'Alias' },
                    { attribute: 'actions', alias: 'Actions', filter: false, value: (data) => {
                        return (
                            <>
                                <a onClick={(e) => this.openModalCountries(data.iddef_country)} title="Edit country"><i className="material-icons left">mode_edit</i></a>
                                {
                                    data.estado == 1 ?
                                    <a onClick={(e) => this.toggleCountryStatus(e, data)} title="Disable country"><i className="material-icons left teal-text">toggle_on</i></a>
                                    :
                                    <a onClick={(e) => this.toggleCountryStatus(e, data)} title="Enable country"><i className="material-icons left red-text">toggle_off</i></a>
                                }
                            </>
                        );
                    }}
                ]}
            />
            </>
        )
    }
}
