import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {Panel,CleverRequest,MComponentes, CleverLoading,CleverForm, GridViewLigth,CleverButton } from 'clever-component-library';
import ContentReports from '../ContentReports';
import moment from 'moment';
import { saveAs } from 'file-saver';

export default class ReportDailyReservations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load:false,
            viewGrid:false,
        }
        this.downloadfile = this.downloadfile.bind(this);
    }

    componentDidMount(){  
        this.setState({load:true});
        this.createHead();
    }

    createHead(){
        let {dataDailyReservation}=this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`dailyReservation`}
                                ref={ref => this.refDailyReservation= ref}
                                data={dataDailyReservation}
                                forms={[
                                    {
                                        inputs: [{
                                                    row:[
                                                        {type:'date', colDate:'col s12 m3 l3', labelDate:'Date from',placeholder:'Insert start date', name:'dateFrom', time:false, disabled:false},
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
        let {encabezadoReport,reservations}=this.state;
        let headBody = (<>
                            <div className='col l12 m12 s12'style={{textAlign:'center', fontWeight:'bold' }}>
                                <p>{encabezadoReport}</p>
                            </div>
                        </>)
        let body = (<>
                        <div className='row' style={{backgroundColor:'#e9e9e9'}}>
                            <GridViewLigth
                                serializeRows={false}
                                classTable={'clever-table responsive-table striped bordered'}
                                columns = {[
                                            {attribute : 'property_code',  alias : 'Hotel' },
                                            {attribute : 'book_status',  alias : 'Estatus' },
                                            {attribute : 'booking_date',  alias : 'Fecha de Reserva' },
                                            {attribute : 'code_reservation',  alias : 'Clave de Confirmación' },
                                            {attribute : 'guest_name',  alias : 'Nombre del Huésped' },
                                            {attribute : 'arrival_date',  alias : 'Fecha de Check-in' },
                                            {attribute : 'departure_date',  alias : 'Fecha de Check-out' },
                                            {attribute : 'bookings',  alias : 'Número de Habitaciones' },
                                            {attribute : 'room_code',  alias : 'Categoria de Habitación' },
                                            {attribute : 'total_guest',  alias : 'Numero de Personas' }, //nosta
                                            {attribute : 'rateplan_name',  alias : 'Rate Plan' },
                                            {attribute : 'rate_code',  alias : 'Rate Code' }, 
                                            {attribute : 'total_room_nights',  alias : 'Cuartos Noches' },
                                            {attribute : 'rate_amount',  alias : 'Ingreso Bruto sin Promo Code' },
                                            {attribute : 'promo_code',  alias : 'Promo Code' },
                                            {attribute : 'promo_code_amount',  alias : 'Valor del Promo Code' },
                                            {attribute : 'total_room_value',  alias : 'Ingreso Bruto Promo Code' },
                                            {attribute : 'avg_daily_rate',  alias : 'Tarifa Promedio' },
                                            {attribute : 'avg_los',  alias : 'Estancia Promedio' },
                                            {attribute : 'user_market',  alias : 'Mercado' },
                                            {attribute : 'guest_phone',  alias : 'Teléfono' },
                                            {attribute : 'guest_email',  alias : 'Email' },
                                            {attribute : 'channel',  alias : 'Canal' },
                                            { attribute: "user_device", alias: "User Device"},
                                            {attribute : 'services',  alias : 'Servicios Extra' },
                                            {attribute : 'is_repetitive_customer',  alias : 'Cliente Repetitivo' },
                                        ]}
                                data ={reservations}
                            />
                        </div>                        
                    </>);

        this.refReportReservations.setHeadBody(headBody,()=>{
            this.refReportReservations.setBody(body,()=>{
                this.setState({load:false})
                this.refReportReservations.setStatusBodyReports(true);
            });    
        });        
    }

    generateReport(e){   
       this.setState({load:true},()=>{this.refReportReservations.setStatusBodyReports(false);});
        let dataFrm = this.refDailyReservation.getData();
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
            if(dateFrom !== '' && dateTo !== ''){
                titleReport = `${dateFrom} - ${dateTo}`
            }else{
                titleReport = `${dateFrom}`
            }
            let sendData = {"from_date": moment(dateFrom).format('YYYY-MM-DD 00:00:00'), "to_date": moment(dateTo).format('YYYY-MM-DD 23:59:59')}
            CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/daily_reservations_list-api`, sendData, (response, error) => {
                if (response != "") {
                    this.setState({reservations: response, datesData: sendData}), this.createBody(); 
                }else{
                    this.setState({load:false});
                }
            });
        }
    }

    downloadfile(e,type){
    let dataFrm = this.refDailyReservation.getData();
    let valuesFrm = dataFrm.values;
    let dateFrom = valuesFrm.dateFrom;
    let dateTo = valuesFrm.dateTo;
    
    let sendData = {"from_date": moment(dateFrom).format('YYYY-MM-DD 00:00:00'), "to_date": moment(dateTo).format('YYYY-MM-DD 23:59:59')}
    if (type === 'excel') {
        type = 'excell'
    }

    const url =
      CleverConfig.getApiUrl("bengine") + "/api/reports/daily_reservations_list-"+type;
    const req = new XMLHttpRequest();
    const method = "POST";
    req.responseType = "arraybuffer";
    req.open(method, url);
    req.timeout = 120000;

    req.ontimeout = () => {
      M.toast({ html: `ERROR: Timeout!`, classes: "errorToast" });
      //submitRatesExcelRef.current.enable()
      reject(req.response);
    };

    req.onerror = () => {
      M.toast({ html: `ERROR: Something went wrong!`, classes: "errorToast" });
      submitRatesExcelRef.current.enable();
      reject(req.response);
    };


    req.send(JSON.stringify(sendData));
    req.addEventListener("load", (event) => {});

    req.onload = function () {
      //submitRatesExcelRef.current.enable()
      let status = req.status;
      if (status === 201) {
        fileRatesExcel.current.clean();
        M.toast({ html: `SUCCESS: download file` });
      } else if (status === 200) {
        M.toast({ html: `SUCCESS: download file` });
        if (type === "pdf") {
            saveAs(new Blob([req.response], {
                type:
                    "application/pdf.openxmlformats-officedocument.spreadsheetml.sheet",
                }),
                    'Daily_Reservations.pdf'
            );
        }else{            
            saveAs(
              new Blob([req.response], {
                type:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }),
              "Daily_Reservations.xlsx"
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
        M.toast({ html: `ERROR: ${msg}`, classes: "errorToast" });
      }
    };
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
                    title={'LISTADO DE RESERVACIONES DIARIAS '} 
                    nameIcon={'insert_drive_file'}
                    onRef = {ref => this.refReportReservations = ref}
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