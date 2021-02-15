import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverRequest, CleverLoading,CleverForm, MComponentes,GridViewLigth, Modal} from 'clever-component-library';
import ContentReports from '../ContentReports';
import DetailSalesMarket from './DetailSalesMarket';
import moment from 'moment';

export default class ReportSalesByMarket extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load:false,
            dataDetails: [],
            dataMarketSales: {"dateTo": moment().format('YYYY-MM-DD 23:59:59'), "dateFrom": moment().format('YYYY-MM-DD 00:00:00')},
            startDay: moment().format('YYYY-MM-DD 00:00:00'),
            endDay: moment().format('YYYY-MM-DD 23:59:59'),
        }
        this.instanceGrid = [];
        this.downloadfile = this.downloadfile.bind(this);
    }

    componentDidMount(){  
        this.setState({load:true});
        this.getMarket();
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.instanceGrid) {
            this.setState({ load: true });
        }
    }

    getMarket(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/market/get`, (response, error) => {          
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if(!response.Error){
                    let responseData = response.data;
                    let market = [];
                    
                    responseData.map((data) => {
                        data.estado == 1 ?
                            market.push({value: String(data.iddef_market_segment), option: data.description})
                        :null;            
                    });

                    this.setState({ dataMarket:market},()=>{
                        this.createHead();
                    });
                }else{
                    this.setState({load:false});
                }
            }else{
                this.setState({load:false});
            }
        });
    }

    createHead(){
        let {dataMarketSales,dataMarket}= this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`markets`}
                                ref={ref => this.refMarkets= ref}
                                data={dataMarketSales}
                                forms={[
                                    {
                                        inputs: [{
                                                    row:[
                                                        // {type:'select',size:'col s12 m4 l4', name:'market',autocomplete:true,multiple:true,
                                                        //     label:'* Market', placeholder:`Select one Market`,options:dataMarket, required:true},
                                                        {type:'date', colDate:'col s12 m3 l3', labelDate:'Date from',placeholder:'Insert start date',name:'dateFrom', time:false, disabled:false},
                                                        {type:'component', 
                                                                        component:() =>{
                                                                            return(<div className='col s12 m1 l1 text-center' style={{marginTop: "18px"}}><h6> to </h6></div>);
                                                                        }
                                                                        },
                                                        {type:'date', colDate:'col s12 m3 l3',labelDate:'Date To',name:'dateTo', placeholder:'Insert end date',time:false, disabled:false,},
                                                        {type:'button',size:'col s12 m1 l1', label:'',icon:'search',onClick:e=>this.generateReport(e)}
                                                    ]
                                                },]
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )
        this.setState({headReports:head},()=>{this.setState({load: false})})
    }

    createBody = async () => {
        let {dataGridSalesMarket} = this.state;
        let body=(
            <div className='row' style={{backgroundColor:'#e9e9e9'}}>
                <GridViewLigth
                    floatHeader={true}
                    serializeRows={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    columns = {[
                                {attribute : 'iddef_market_segment', visible : false },
                                {attribute : 'code',  alias : 'Market' },
                                {attribute : 'bookings',  alias : 'Total en número de bookings' },
                                {attribute : 'total_room_nights', alias : 'Cuartos noches'},
                                {attribute : 'total_booking_value', alias : 'Ingresos brutos'},
                                {attribute : 'avg_daily_rate', alias : 'Tarifa promedio'},
                                {attribute : 'avg_los',  alias : 'Conversion rate' },
                                {attribute : "Expand", alias: "Expand", expand : (data) => {
                                        this.getDataDetails(data);
                                        return <div>
                                            <h3>Detallado de Ventas Diarias - {data.code}</h3>
                                            <GridViewLigth
                                                floatHeader={true}
                                                serializeRows={false}
                                                classTable={'clever-table responsive-table striped bordered'}
                                                columns = {[
                                                    {attribute : 'iddef_property', visible : false },
                                                    {attribute : 'property_code',  alias : 'Código propiedad' },
                                                    {attribute : 'trade_name',  alias : 'Propiedad' },
                                                    {attribute : 'avg_daily_rate', alias : 'Tarifa promedio'},
                                                    {attribute : 'total_room_nights', alias : 'Cuartos noches'},
                                                    {attribute : 'bookings', alias : 'Reservas'},
                                                    {attribute : 'channel_name',  alias : 'Canal Venta' },
                                                    {attribute : 'total_booking_value',  alias : 'Ingresos' },
                                                    {attribute : 'avg_los',  alias : 'Estancia promedio' },
                                                ]}
                                                data = {this.state.dataDetails}
                                            />
                                        </div>
                                    }
                                },
                            ]}
                    data ={dataGridSalesMarket}
                />
            </div>   
        );
        
            this.refReportSalesMarket.setBody(body,()=>{
            this.setState({load:false});
            this.refReportSalesMarket.setStatusBodyReports(true);
        });
    }

    getDataDetails = async (data) => {
        let {startDay, endDay} = this.state;
        this.setState({load:true});
        let request = { "from_date": moment(startDay).format('YYYY-MM-DD 00:00:00'), "to_date": moment(endDay).format('YYYY-MM-DD 23:59:59'), "iddef_market_segment": data.iddef_market_segment }
        await CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/get-daily-sales-detailed-report-api`, request, (response, error) => {
            if (response) {
                this.instanceGrid = response;
                this.setState({ dataDetails: response })
            }
        }, this.setState({ load: false }))
    }

    generateReport(e){     
        this.setState({load:true},()=>{this.refReportSalesMarket.setStatusBodyReports(false);});   
        let dataFrm = this.refMarkets.getData();
        let requiredFrm = dataFrm.required.count;
        let valuesFrm = dataFrm.values;

        let idMarket = parseInt(valuesFrm.market);
        let dateFrom = valuesFrm.dateFrom;
        let dateTo = valuesFrm.dateTo;
        let message = '';

        dateFrom == '' && dateTo !== '' ? message = 'Add start date' :null;
        dateFrom !== '' && dateTo == '' ? message = 'Add end date' :null;

        if(requiredFrm > 0 || message !== ''){
            let msgToast = message == '' ? 'Selected Market' :message;
            MComponentes.toast(msgToast);
            this.setState({ hiddeNotificationModal: false, 
                            notificationMessage: msgToast, 
                            notificationType: "error",
                            load:false
                        });  
        }else{
            this.setState({ startDay: valuesFrm.dateFrom, endDay: valuesFrm.dateTo })
            this.getDataGridReport(valuesFrm.dateFrom, valuesFrm.dateTo);
        }
    }

    getDataGridReport(dateFrom, dateTo){
        this.setState({ load: true })
        let sendData = {"from_date": moment(dateFrom).format('YYYY-MM-DD 00:00:00'), "to_date": moment(dateTo).format('YYYY-MM-DD 23:59:59')}
        CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/get-daily-sales-by-market-date-report-api`, sendData, (response, error) => {
            console.log('response: ', response);
            this.setState({dataGridSalesMarket: response}), this.createBody();
        }, this.setState({ load: false }));
    }

    openDetailSales(idMarket){
        this.setState({idMarket:idMarket,hiddenModal:true},()=>{
            this.setState({hiddenModal:false},()=>{
            this.refModalDetailSales.getInstance().open();     
            });       
        })
        
    }

    downloadfile(e, type){
        let typeDownload = (type == 'pdf')? 'pdf' : 'excell';
        this.getDownload(typeDownload);
    }

    getDownload(typeDownload){
        this.setState({ load: true })
        let {startDay, endDay} = this.state;
        let request = {"from_date": moment(startDay).format('YYYY-MM-DD 00:00:00'), "to_date": moment(endDay).format('YYYY-MM-DD 23:59:59')}

        const url = CleverConfig.getApiUrl("bengine") + "/api/reports/get-daily-sales-by-market-date-report-"+typeDownload;
        const req = new XMLHttpRequest();
        const method = "POST";
        req.responseType = "arraybuffer";
        req.open(method, url);
        req.timeout = 120000;

        req.ontimeout = () => {
        //submitRatesExcelRef.current.enable()
        reject(req.response);
        };

        req.onerror = () => {
        submitRatesExcelRef.current.enable();
        reject(req.response);
        };


        req.send(JSON.stringify(request));
        req.addEventListener("load", (event) => {});

        console.log('typeDownload: ', typeDownload);
        req.onload = function () {
            //submitRatesExcelRef.current.enable()
            let status = req.status;
            if (status === 201) {
                fileRatesExcel.current.clean();
            } else if (status === 200) {
                if (typeDownload == 'pdf') {
                    saveAs(new Blob([req.response], {
                        type:
                            "application/pdf.openxmlformats-officedocument.spreadsheetml.sheet",
                        }),
                            'DailySalesMarket.pdf'
                    );
                } else {
                    saveAs(new Blob([req.response], {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        }),
                            'DailySalesMarket.xlsx'
                    );
                }
            } else {
                var decodedString = String.fromCharCode.apply(
                null,
                new Uint8Array(this.response)
                );
                var obj = JSON.parse(decodedString);
                var msg = ((obj.errors || {}).rates || [
                obj.message || "Something went wrong!",
                ])[0];
            }
        };
        this.setState({ load: false });
    }

    render() {
        let {load,headReports,idMarket,hiddenModal}=this.state;     
        /* if (this.state.dataDetails.length > 0) {
            this.setState({ load: false })
        } */
        return (
                <div>
                    <CleverLoading show={load}/> 
                    {headReports?
                    <ContentReports
                        isVisibleReturnMenu = {true}
                        urlMenu = {'/reports'}
                        title={'Consolidated Daily Sales by Market'} 
                        nameIcon={'insert_drive_file'}
                        onRef = {ref => this.refReportSalesMarket = ref}
                        contentHead={headReports}
                        onDownload={this.downloadfile}
                        hiddenBtnExcel={'block'}
                        hiddenBtnpdf={'block'}
                        activateScroll={true}
                    />
                    :null}
                    
                    <Modal
                        // addButtons={this.getConfigAddButtonsModal()}
                        idModal="detailSales"
                        isFull={true}
                        onRef={modal => this.refModalDetailSales = modal} 
                    >
                        {hiddenModal == false? 
                            <div className="row">  
                                <DetailSalesMarket idMarket={idMarket}/>
                            </div>
                        :null
                        }
                    </Modal>
                                    
                </div>   
        )
    }
}