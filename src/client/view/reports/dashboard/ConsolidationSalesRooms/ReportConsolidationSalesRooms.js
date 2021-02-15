import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {Panel,CleverRequest,MComponentes, CleverLoading,CleverForm, GridViewLigth,CleverButton } from 'clever-component-library';
import ContentReports from '../ContentReports';
import moment from 'moment';

export default class ReportConsolidationSalesRooms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            load:false,
            salesRooms: [],
            requestSearch: {},
            consolidationSalesRoom: {"dateTo": moment().format('YYYY-MM-DD 23:59:59'), "dateFrom": moment().format('YYYY-MM-DD 00:00:00')},
        }
        this.downloadfile = this.downloadfile.bind(this);
    }

    componentDidMount(){  
        this.setState({load:true});
        this.getProperty();
    }

    getProperty(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/property/get?all/", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }

            if(!error){
                if (!response.Error) {
                    let data = response.data;
                    let dataProperties = [];
                    data.map((dataProperty)=>{
                        if(dataProperty.estado ==1){  
                            dataProperties.push({value:`${dataProperty.iddef_property}`,option:dataProperty.short_name});
                        }
                    });
                    this.setState({ dataProperties: dataProperties},()=>{
                        this.createHead();
                    });
                }
                else {
                    MComponentes.toast("ERROR in propreties");
                    this.setState({load: false })
                }
            }else{
                this.setState({load: false })
            }
            
        });
    }

    createHead(){
        let {consolidationSalesRoom,dataProperties}=this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`consolidationSalesRoom`}
                                ref={ref => this.refSalesRoom= ref}
                                data={consolidationSalesRoom}
                                forms={[
                                    {
                                        inputs: [{
                                                    row:[
                                                        {type:'select',size:'col s12 m4 l4', name:'property',autocomplete:true,multiple:true,
                                                        label:'* Properties', placeholder:`Select one Property`,options:dataProperties, required:true},
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

    createBody(){
        let {salesRooms}= this.state;

        let body = (<div className='row' style={{backgroundColor:'#e9e9e9'}}>
            <GridViewLigth
                floatHeader={true}
                serializeRows={false}
                classTable={'clever-table responsive-table striped bordered'}
                columns = {[
                    {attribute : 'code', alias : 'Mercado'},
                    {attribute : 'property_code',  alias : 'Propiedad' },
                    {attribute : 'room_code', alias : 'Categoria de habitación'},
                    {attribute : 'canceled', alias : 'Estatus'},
                    {attribute : 'cancelation_rate',  alias : 'Tasa de cancelación' },
                    {attribute : 'bookings', alias : 'Número de Bookings'},
                    {attribute : 'total_room_nights', alias : 'Cuartos Noches'},
                    {attribute : 'avg_daily_rate', alias : 'Ingresos brutos'},
                    {attribute : 'avg_los', alias : 'Tarifa promedio'},
                    {attribute : 'reserved', alias : 'Estancia promedio'},
                ]}
                data ={salesRooms}
            />
        </div>);

        this.refReportSalesRoom.setBody(body,()=>{
            this.setState({load:false})
            this.refReportSalesRoom.setStatusBodyReports(true);
        });
    }

    generateReport(e){
        this.setState({load:true},()=>{this.refReportSalesRoom.setStatusBodyReports(false);});
        let dataFrm = this.refSalesRoom.getData();
        let requiredFrm = dataFrm.required.count;
        let valuesFrm = dataFrm.values;

        let idProperty = valuesFrm.property

        if(requiredFrm > 0){
            MComponentes.toast("Selected a property");
            this.setState({ hiddeNotificationModal: false, 
                notificationMessage: "Selected a property", 
                notificationType: "error",
                load:false
            });  
        }else{
            let request = {
                "from_date": moment(valuesFrm.dateFrom).format('YYYY-MM-DD 00:00:00'),
                "to_date": moment(valuesFrm.dateTo).format('YYYY-MM-DD 23:59:59'),
                "iddef_property": valuesFrm.property
            }

            this.setState({ requestSearch: request })

            this.getDataGridReport(request);
        }
    }

    getDataGridReport(data){
        CleverRequest.post(CleverConfig.getApiUrl('bengine')+`/api/reports/get-sales-by-room-category-api`, data, (response, error) => {

            if(!error){
                if (response.length > 0) {
                    this.setState({ salesRooms: response });
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
        const url = CleverConfig.getApiUrl("bengine") + "/api/reports/get-sales-by-room-category-"+typeDownload;
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
                    title={'Consolidation Sales Room'} 
                    nameIcon={'insert_drive_file'}
                    onRef = {ref => this.refReportSalesRoom = ref}
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