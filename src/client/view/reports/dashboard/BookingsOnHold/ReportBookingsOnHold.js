import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {Panel,CleverRequest,MComponentes, CleverLoading,CleverForm, GridViewLigth,CleverButton } from 'clever-component-library';
import ContentReports from '../ContentReports';
import moment from 'moment';

export default class ReportBookingsOnHold extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load:false,
            viewGrid:false,
            bookingsOnHold: [],
            requestSearch: {},
            dataBookingOnHold: {"dateTo": moment().format('YYYY-MM-DD 23:59:59'), "dateFrom": moment().format('YYYY-MM-DD 00:00:00')},
        }
        this.downloadfile = this.downloadfile.bind(this);
    }

    componentDidMount(){  
        this.setState({load:true});
        this.createHead();
    }

    createHead(){
        let {dataBookingOnHold}=this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`bookingOnHold`}
                                ref={ref => this.refBookingOnHold= ref}
                                data={dataBookingOnHold}
                                forms={[
                                    {
                                        inputs: [{
                                                    row:[
                                                        {type:'date', colDate:'col s12 m3 l3', labelDate:'Date from',placeholder:'Insert start date',
                                                                            name:'dateFrom', time:false, disabled:false},
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
        this.setState({headReports:head},()=>{this.setState({load: false})});
    }

    createBody(){
        let {bookingsOnHold}=this.state;
        
        let body = (<>
                    <div className='row' style={{backgroundColor:'#e9e9e9'}}>
                        <GridViewLigth
                            floatHeader={true}
                            serializeRows={false}
                            classTable={'clever-table responsive-table striped bordered'}
                            columns = {[
                                        {attribute : 'bookings',  alias : 'Total de booking convertidos' },
                                        {attribute : 'avg_los',  alias : 'Estancias promedio' },
                                        {attribute : 'avg_daily_rate',  alias : 'Tarifa promedio' },
                                        {attribute : 'bookings_onhold',  alias : 'Número de Bookings Onhold' },
                                        {attribute : 'total_room_nights',  alias : 'Total de Cuartos Noches' },
                                        {attribute : 'code',  alias : 'Mercado / Pais' },
                                        {attribute : 'convert_rate',  alias : 'Tasa de Bookings convertidos' },
                                        {attribute : 'total_booking_value',  alias : 'Total de ingresos brutos' },
                                        {attribute : 'property_code',  alias : 'Propiedad / Hotel' },
                                    ]}
                            data ={bookingsOnHold}
                            />
                        </div>                        
                    </>);

        
        this.refReportBookingOnHold.setBody(body,()=>{
            this.setState({load:false})
            this.refReportBookingOnHold.setStatusBodyReports(true);
        }); 
    }

    generateReport(e){        
        this.setState({load:true},()=>{this.refReportBookingOnHold.setStatusBodyReports(false);});
        let dataFrm = this.refBookingOnHold.getData();
        let requiredFrm = dataFrm.required.count;
        let valuesFrm = dataFrm.values;

        let dateFrom = valuesFrm.dateFrom;
        let dateTo = valuesFrm.dateTo;
        let message = '';
        let titleReport = '';

        //Validacion para que no pueda ir vacio el date from
        dateFrom == '' && dateTo !== '' ? message = 'Add start date' :null;
        dateFrom == '' && dateTo == '' ? message = 'Add start date and end date' :null;

        if(requiredFrm > 0 || message !== ''){
            MComponentes.toast(message);
            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: message, 
                notificationType: "error",
                load:false
            });  
        }else{
            
            let request = {
                "from_date": moment(valuesFrm.dateFrom).format('YYYY-MM-DD 00:00:00'),
                "to_date": moment(valuesFrm.dateTo).format('YYYY-MM-DD 23:59:59'),
            }

            this.setState({ requestSearch: request })

            this.getDataGridReport(request);
        }
    }

    getDataGridReport(data){
        CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/booking_on_hold_consolidated-api`, data, (response, error) => {

            if(!error){
                if (response.length > 0) {
                    this.setState({ bookingsOnHold: response });
                    this.createBody()
                }
            }else{
                this.setState({load: false })
            }
            
        }, this.setState({load: false }) );
    }

    downloadfile(e,type){
        console.log('type DOWNLOAD => ', type);
        let typeDownload = (type == 'excel')? 'excell' : type;

        this.setState({ load: true })
        let { requestSearch } = this.state;
        const url = CleverConfig.getApiUrl("bengine") + "/api/reports/booking_on_hold_consolidated-"+typeDownload;
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


        req.send(JSON.stringify(requestSearch));
        req.addEventListener("load", (event) => {});

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
                            'ConsolidationSalesRoom.pdf'
                    );
                } else {
                    saveAs(new Blob([req.response], {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        }),
                            'ConsolidationSalesRoom.xlsx'
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

    returnMenuReports(e,url){
        window.location = url;
    }

    render() {
        let {load,headReports}=this.state;   
        return (
            <div>
                <CleverLoading show={load}/> 
                {headReports?
                <ContentReports
                    isVisibleReturnMenu = {true}
                    urlMenu = {'/reports'}
                    title={'Consolidation Bookings OnHold'} 
                    nameIcon={'insert_drive_file'}
                    onRef = {ref => this.refReportBookingOnHold = ref}
                    contentHead={headReports}
                    onDownload={this.downloadfile}
                    hiddenBtnExcel={'block'}
                    hiddenBtnpdf={'block'}
                    activateScroll={true}
                />
                :null}
            </div>   
            
        )
    }
}