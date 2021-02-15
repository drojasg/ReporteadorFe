import React, { Component } from 'react'
import CleverConfig from '../../../../../config/CleverConfig'
import {CleverForm, CleverRequest, MComponentes } from 'clever-component-library'

export default class NewMarketForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataNewMarketForm: {},
            listCurrencies: [],
        }
    }

    componentDidMount() {
        this.setState({dataNewMarketForm:this.props.dataNewMarketForm},()=>{
            this.getCurrencies();
        });
    }

    getCurrencies = () => {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/currency/get?all=1`, (response, error) => { 
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let currencies = [];
                response.data.map((data) => {
                    currencies.push({value: data.currency_code, option:data.currency_code});
                });
                this.setState({listCurrencies: currencies});
            }
        });
    }

    getData (){
        let data = this.refFormMarket.getData();
        let dataFrmValue = data.values;
        let dataMarket = {};
        let informationMarket = {};

        if (data.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
            informationMarket.isError = true;
        } else {
            
            dataMarket.description = dataFrmValue.description;
            dataMarket.code = dataFrmValue.code;
            dataMarket.currency_code = dataFrmValue.currency_code;
            dataMarket.pms_profile_id = dataFrmValue.pms_profile_id;
            dataMarket.estado = parseInt(dataFrmValue.status);
            dataFrmValue.iddef_market_segment !== '' ? dataMarket.iddef_market_segment = parseInt(dataFrmValue.iddef_market_segment) :null;

            informationMarket.iddef_market_segment = dataFrmValue.iddef_market_segment !== '' ? parseInt(dataFrmValue.iddef_market_segment) :0;
            informationMarket.dataMarket = dataMarket;
            informationMarket.isError = false;
        }
        return informationMarket;
    }
    
    render() {
        return (
            <CleverForm
                id={'formModalMarket'}
                ref={ref => this.refFormMarket = ref}
                data={this.state.dataNewMarketForm}
                forms={[
                    {
                        inputs:[{
                            row: [
                                {type: 'number', size:'col s6 m6 l3', name:'iddef_market_segment', label:'ID', hidden: true},
                                {type: 'text', size: 'col s6 m6 l3', name: 'description', label: 'Description', required: true},
                                {type: 'text', size: 'col s6 m6 l3', name: 'code', label: 'Code', required: true},
                                {type: 'select', size: 'col s6 m6 l3', name: 'currency_code', label: 'Currency', required: true, options: this.state.listCurrencies},
                                {type: 'text', size: 'col s6 m6 l3', name: 'pms_profile_id', label: 'PMS Profile ID', required: false, uppercase: false},
                                {type: 'select', size: 'col s6 m6 l3', name: 'status', label: 'Status', required: true, options: [
                                    {value: "0", option: 'Disabled'},
                                    {value: "1", option: 'Enabled'},
                                ]},
                            ]
                        }]
                    },
                ]}
            />
        )
    }
}
