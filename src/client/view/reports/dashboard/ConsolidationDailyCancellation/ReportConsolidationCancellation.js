import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {Panel,CleverRequest,MComponentes, CleverLoading,CleverForm, GridViewLigth,CleverButton } from 'clever-component-library';
import ContentReports from '../ContentReports';
import moment from 'moment';
import { saveAs } from 'file-saver';

export default class ReportConsolidationCancellation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load:false,
        }
        this.downloadfile = this.downloadfile.bind(this)
    }

    componentDidMount(){  
        this.setState({load:true});
        this.createHead();
    }

    createHead(){
        let {dataCancellation}=this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`consolidateCancel`}
                                ref={ref => this.refConsolidateCancel= ref}
                                data={dataCancellation}
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
        let {dailyCancellation}= this.state;

        let body = (<div className='row' style={{backgroundColor:'#e9e9e9'}}>
            <GridViewLigth 
                serializeRows={false}
                classTable={'clever-table responsive-table striped bordered'}
                columns = {[
                            {attribute : 'cancelation_date',  alias : 'Fecha de Cancelación' },
                            {attribute : 'fecha_creacion', alias : 'Fecha de Reserva'},
                            {attribute : 'bookings', alias : 'Número de Bookings'},
                            {attribute : 'total_room_nights',  alias : 'Cuartos Noches' }, 
                            {attribute : 'total_booking_value', alias : 'Ingresos Brutos'},
                            {attribute : 'avg_daily_rate', alias : 'Tarifa promedio'},
                            {attribute : 'avg_los', alias : 'Estancia promedio'},
                            {attribute : 'property_code', alias : 'Hotel'},
                            {attribute : 'code', alias : 'Mercado'},
                        ]}
                data ={dailyCancellation}
            />
        </div>);

        this.refReportCancellations.setBody(body,()=>{
            this.setState({load:false})
            this.refReportCancellations.setStatusBodyReports(true);
        });
    }

    generateReport(e){
        this.setState({load:true},()=>{this.refReportCancellations.setStatusBodyReports(false);});
        let dataFrm = this.refConsolidateCancel.getData();
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
            }
            let sendData = {"from_date": moment(dateFrom).format('YYYY-MM-DD 00:00:00'), "to_date": moment(dateTo).format('YYYY-MM-DD 23:59:59')}
            CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/get-daily-cancelations-consolidated-api`, sendData, (response, error) => {
                if (response != "") {
                    this.setState({dailyCancellation: response}), this.createBody(); 
                }else{
                    this.setState({load:false});
                }
            });            
        }
    }

    downloadfile(e,type){
    let dataFrm = this.refConsolidateCancel.getData();
    let valuesFrm = dataFrm.values;
    let dateFrom = valuesFrm.dateFrom;
    let dateTo = valuesFrm.dateTo;
    
    let sendData = {"from_date": moment(dateFrom).format('YYYY-MM-DD 00:00:00'), "to_date": moment(dateTo).format('YYYY-MM-DD 23:59:59')}
    if (type === 'excel') {
        type = 'excell'
    }

    const url =
      CleverConfig.getApiUrl("bengine") + "/api/reports/get-daily-cancelations-consolidated-"+type;
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
                    'Daily_Cancellation.pdf'
            );
        }else{            
            saveAs(
              new Blob([req.response], {
                type:
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              }),
              "Daily_Cancellation.xlsx"
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
                    title={'CONSOLIDADO CANCELACIONES DIARIAS'} 
                    nameIcon={'insert_drive_file'}
                    onRef = {ref => this.refReportCancellations = ref}
                    contentHead={headReports}
                    onDownload={this.downloadfile}
                    hiddenBtnExcel={'block'}
                    hiddenBtnpdf={'block'}
                />
                :null}
            </div>   
            
        )
    }
}