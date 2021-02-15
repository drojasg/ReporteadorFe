import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {CleverRequest, CleverLoading,CleverForm, MComponentes,GridViewLigth } from 'clever-component-library';
import ContentReports from '../ContentReports';

export default class DetailSalesMarket extends Component {
    constructor(props) {
        super(props);
        this.createHead = this.createHead.bind(this);
        this.state = {
            load:false
        }
    }

    componentDidMount(){  
        console.log(this.props.idMarket);
        this.setState({
                        load:true,
                        frmProperty:{},
                        dataProperties:{},
                        headReports:null,
                        idMarket:this.props.idMarket,
                    });
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
        let {frmProperty,dataProperties}= this.state;
        let head = ( <div className='row'>
                        <div className='col s12 m12 l12 '>  
                            <CleverForm
                                id={`detailSalesMarket`}
                                ref={ref => this.refMarketProperties= ref}
                                data={frmProperty}
                                forms={[
                                    {
                                        inputs: [{
                                                    row:[
                                                        {type:'select',size:'col s12 m4 l4', name:'property',autocomplete:true,multiple:true,
                                                            label:'* Properties', placeholder:`Select one Property`,options:dataProperties, required:true},  
                                                        {type:'date', colDate:'col s12 m3 l3', labelDate:'Date from',placeholder:'Insert start date',
                                                            name:'dateFrom', time:false, disabled:false},
                                                        {type:'component', 
                                                                        component:() =>{
                                                                            return(<div className='col s12 m1 l1 text-center'><h6> to </h6></div>);
                                                                        }
                                                                        },
                                                        {type:'date', colDate:'col s12 m3 l3',labelDate:'Date To',placeholder:'Insert end date',
                                                            name:'dateTo', time:false, disabled:false,},                                                      
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
        let {dataGridResumen,titleGrid,rangReportGrid} = this.state;
        let encabezado = {};
        let body = {};
        let foot = {};
        
        encabezado = (<>{/** Encabezado del reporte (Si lleva por daily o Monthly) */
                titleGrid !== '' ?
                <div className='row' style={{textAlign:'center', fontWeight:'bold' }}>
                    <p>{titleGrid}</p>
                </div>
            :null
            }
            {/** Encabezado del reporte (Si lleva el rango de fechas) */
            rangReportGrid !== '' ?
                <div className='row' style={{textAlign:'center', fontWeight:'bold' }}>
                    <p>{rangReportGrid}</p>
                </div>
            :null
            }</>
        );        

        body= this.createGridsByProperty();
        
        /** Pie del reporte */
        foot = (
                <div className='col l12 m6 s6'>
                    <CleverForm
                        id={`resumSalesMArket`}
                        ref={ref => this.refSalesMarket= ref}
                        data={dataGridResumen}
                        forms={[
                            {
                                inputs: [
                                        {row:[
                                            {type: 'number', size: 'col s12 m3 l3',label: 'Total Revenue',name: 'total_revenue',characters:true,alphanumeric:true,disabled:true},
                                        ]},      
                                        {row:[
                                            {type: 'number', size: 'col s12 m3 l3',label: 'Total Room Night',name: 'total_room_night',characters:true,alphanumeric:true,disabled:true},
                                        ]}, 
                                        {row:[
                                            {type: 'number', size: 'col s12 m3 l3',label: 'Total Bookings',name: 'total_bookings',characters:true,alphanumeric:true,disabled:true},
                                        ]},                                             
                                ]
                            }
                        ]}
                    /> 
                </div> 
        )

        this.refDetailSalesMarket.setHeadBody(encabezado,()=>{
            this.refDetailSalesMarket.setBody(body,()=>{
                this.refDetailSalesMarket.setFoodBody(foot,()=>{
                  this.refDetailSalesMarket.setStatusBodyReports(true);
                  this.setState({load:false})  
                })                
            });   
        });


        
    }

    createGridsByProperty(){
        let {dataGridPrincipal} = this.state;
        let gridsByResort = [];
        
        dataGridPrincipal.map((dataPrincipal)=>{
            let dataGridProduction = dataPrincipal.detailProduction;
            let body=(
                <div className='row' key={dataPrincipal.iddf_resort} >
                    <div className='row' style={{textAlign:'center', fontWeight:'bold' }}> 
                        <p>{dataPrincipal.nameResort}</p>
                    </div>
                    <div style={{backgroundColor:'#e9e9e9'}}>
                        <GridViewLigth
                            serializeRows={false}
                            classTable={'clever-table responsive-table striped bordered'}
                            columns = {[
                                        {attribute : 'source',  alias : 'Source' },
                                        {attribute : 'Bookins', alias : 'Bookins'},
                                        {attribute : 'r/n', alias : 'R/N '},
                                        {attribute : 'adr',  alias : 'ADR' },
                                        {attribute : 'alos', alias : 'ALOS'},
                                        {attribute : 'revenue', alias : 'Revenue'},
                                    ]}
                            data ={dataGridProduction}
                        />    
                    </div>
                    
                    <div className='row'></div>
                    <div className='row'></div>
                </div>   
            );
            gridsByResort.push(body);                                
        });

        return gridsByResort;
    }

    generateReport(e){ 
        this.setState({load:true},()=>{this.refDetailSalesMarket.setStatusBodyReports(false);});
             
        let dataFrm = this.refMarketProperties.getData();
        let requiredFrm = dataFrm.required.count;
        let valuesFrm = dataFrm.values;

        let idProperty= parseInt(valuesFrm.property);
        let dateFrom = valuesFrm.dateFrom;
        let dateTo = valuesFrm.dateTo;
        let nameTitle = '';
        let datesReport = '';
        let message = '';

        //Validacion para que no pueda ir vacio el date from
        dateFrom == '' && dateTo !== '' ? message = 'Add start date' :null;

        if(dateFrom !== '' && dateTo == ''){
            nameTitle = 'Daily Production Report';
            datesReport = dateFrom;
        }

        if(dateFrom !== '' && dateTo !== ''){
            if(dateFrom == dateTo ){
                nameTitle = 'Daily Production Report';
                datesReport = dateFrom;
            }else{
                nameTitle = 'Monthly Production Report';
                datesReport = `${dateFrom} - ${dateTo}`;    
            }
            
        }


        if(requiredFrm > 0 || message !== ''){
            let msgToast = message == '' ? 'Selected Property' :message;
            MComponentes.toast(msgToast);
            this.setState({ hiddeNotificationModal: false, notificationMessage: msgToast, notificationType: "error",load:false});  
        }else{
            this.getDataGridReport(()=>{
                let {dataDetail} = this.state;
                let gridDetailByResort={};
                let gridResum = [];                
                gridResum.total_revenue = dataDetail.total_revenue;
                gridResum.total_room_night = dataDetail.total_room_night;
                gridResum.total_bookings = dataDetail.total_bookings;
                gridDetailByResort = dataDetail.detailByResort !== undefined ? dataDetail.detailByResort : [];
                this.setState({dataGridPrincipal:gridDetailByResort, 
                                dataGridResumen:gridResum,
                                titleGrid:nameTitle,
                                rangReportGrid:datesReport
                            },()=>{
                                this.createBody();
                            });                
            });
        }
    }

    getDataGridReport(functionGetSales=()=>{}){        
        this.setState({dataDetail:{
            "total_revenue":9499.32,
            "total_room_night":18,
            "total_bookings":178,
            "detailByResort":[
                {
                    "iddf_resort":1,
                    "nameResort":"Le Blanc Spa Resort Be",
                    "detailProduction":[
                        {
                            "source":"Booking Eng. Air+Hotel",
                            "Bookins":1,
                            "r/n":5,
                            "adr":700,
                            "alos":5,
                            "revenue":3500
                        }
                    ]
                },
                {
                    "iddf_resort":2,
                    "nameResort":"Moon Palace Cancun Be",
                    "detailProduction":[
                        {
                            "source":"Booking Eng. Air+Hotel",
                            "Bookins":1,
                            "r/n":3,
                            "adr":313.16,
                            "alos":6,
                            "revenue":1878.98
                        }
                    ]
                },
                {
                    "iddf_resort":3,
                    "nameResort":"Beach Palace Be",
                    "detailProduction":[
                        {
                            "source":"Booking Eng. Air+Hotel",
                            "Bookins":3,
                            "r/n":28,
                            "adr":376.21,
                            "alos":9.33,
                            "revenue":10589.99
                        },
                        {
                            "source":"Mobile Air Booking",
                            "Bookins":1,
                            "r/n":5,
                            "adr":550.80,
                            "alos":5.00,
                            "revenue":2536.59
                        }
                    ]
                }
            ]
        }
            // {
            // "total_revenue":642375.48,
            // "total_room_night":1110,
            // "total_bookings":178,
            // "detailByResort":[
            //     {
            //         "iddf_resort":25,
            //         "nameResort":"The Grand At Moon Palace Cancun Be",
            //         "detailProduction":[
            //             {
            //                 "source":"Booking Eng. Air+Hotel",
            //                 "Bookins":20,
            //                 "r/n":128,
            //                 "adr":649.88,
            //                 "alos":6.40,
            //                 "revenue":83184.71
            //             },
            //             {
            //                 "source":"Call Center (External) Pkg",
            //                 "Bookins":4,
            //                 "r/n":16,
            //                 "adr":979.23,
            //                 "alos":4.00,
            //                 "revenue":15667.62
            //             },
            //             {
            //                 "source":"Call Center Packages",
            //                 "Bookins":1,
            //                 "r/n":7,
            //                 "adr":659.70,
            //                 "alos":7.00,
            //                 "revenue":4617.90
            //             },
            //             {
            //                 "source":"Mobile AIr Booking",
            //                 "Bookins":4,
            //                 "r/n":25,
            //                 "adr":539.05,
            //                 "alos":6.25,
            //                 "revenue":13476.21
            //             }
            //         ]
            //     },
            // ]
            // }1
        },functionGetSales);
    }

    downloadfile(e){        
        console.log(e);
    }

    render() {
        let {load,headReports}=this.state;     
        console.log('headReports ==> ', headReports);
        return (
                <div>
                    <CleverLoading show={load}/> 
                    {headReports?
                    <ContentReports
                        isVisibleReturnMenu = {false}
                        urlMenu = {'/reports'}
                        title={'Detail Consolidated Daily Sales by Market'} 
                        nameIcon={'insert_drive_file'}
                        onRef = {ref => this.refDetailSalesMarket = ref}
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

DetailSalesMarket.defaultProps = {
    idMarket:0,
}