import React from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Panel, MComponentes, CleverLoading, CleverRequest } from 'clever-component-library';
import CleverConfig from "../../../../../config/CleverConfig";
import moment from 'moment';

export default class CalendarRooms extends React.Component {

    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.props.onRef(this);
        this.referencia = React.createRef();
        
        this.state = {
            hotelSelected: hotelSelected ? true : false,
            titles:[],
            dataStatusRates:[]         
        }

        this.saveChanges = this.saveChanges.bind(this);
    }

    componentDidMount() {
        this.props.reference.current.id ?
            document.getElementById(this.props.reference.current.id).addEventListener("click", this.saveChanges)
            : null
        this.referencia.current;

        this.setState({            
            request: this.props.request,
            dates: this.props.dates,
        },()=>{
            this.startPag();
        });

    }

    startPag(){
        this.setState({load:true,months:null,divDays:null,divCheck:null,datesCurrent:null,
            dataRates:null,bodyCalendar:null,bodyCalendar:null,dataStatusRates:[]},()=>{
            this.getPanelHeader();
            //Consulta api de rates por room, property y rango de dias
            this.getRatesByRangeDates(()=>{
                this.getPanelBoddy();
            });  
        });        
    }

    getPanelHeader() {
        let {dates,request}= this.state;
        let inputChecked=[];
        let divNameDays= [];
        let start = moment(dates.start);
        let end = moment(dates.end);

        let diferentDay = end.diff(start, 'days');
        let tmpDays = moment(end).format('MM') - moment(start).format('MM');
        tmpDays = tmpDays + 1;
        let countMonths = [];
        let tmpMonths = '';
        let days = start;
        let count = 0;
        let listDates = [];

        let property= request.property;
        let roomID= request.room;

        for (let i = 0; i < diferentDay; i++) {
            let labelDays = moment(days).format('ddd D');
            let Month = moment(days).format('MMMM');

            if (Month != tmpMonths) {
                count = i;
            }
            countMonths.push(Month);
            tmpMonths = moment(days).format('MMMM');
            divNameDays.push(<div key={i} id={i} name={i} className="col s12 m1 l1">
                <label>{labelDays}</label>
            </div>);

            let itemHtmlCheck = '';
            let Days = moment(days).format('YYYY-MM-DD');
            let dataCheck = { id: i, name: Days, status: 0 }

            itemHtmlCheck = <div key={`check${i}`} id={Days} className="col s12 m1 l1">
                <label>
                    <input type='checkbox' 
                    id={`checkRoomDay|${property}|${roomID}|${Days}`} 
                    name={`checkRoomDay|${property}|${roomID}|${Days}`}
                    className={'filled-in'} 
                    onChange={e=>this.ChangeAll(Days,`checkRoomDay|${property}|${roomID}|${Days}`)} 
                    /> 
                    <span></span>   
                </label>    
            </div>;

            inputChecked.push(itemHtmlCheck);
            listDates.push(Days);
            days = moment(days).add(1, 'days').toDate();
        }

        let tmpItem = '';
        let nameMonths = [];
        countMonths.map((i, k) => {
            if (tmpItem != i) {
                nameMonths.push(<div key={`month${k}`} id={k} name={k} className={`col s12 m${count} l${count}`} style={{ borderRight: "1px solid #00000059", borderLeft: "1px solid #00000059" }}>
                    <label style={{ fontSize: 'inherit' }}><b>{i}</b></label>
                </div>);

                count = 10 - count;
            }
            tmpItem = i;
        })

        this.setState({months:nameMonths,divDays:divNameDays,divCheck:inputChecked,datesCurrent:listDates});
    }

    getRatesByRangeDates(functionGetData=()=>{}){
        let {request}= this.state;
        // console.log('getRatesByRangeDates ==> ', JSON.stringify(request));
        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine') + '/api/restriction/opera-close-dates',request, (response, error) => {
            if (!error) {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!response.error) {
                    let countData = response.data.length;
                    let dataRates= response.data.length > 0 ? response.data : [];
                    let data = [];
                    dataRates.map(rate =>{
                        let value = {}
                        let valueDates = [];
                        let dataDates = rate.dates !== undefined ? rate.dates.length > 0 ? rate.dates :[] :[];
                        
                        value.id_rateplan = rate.id_rateplan;
                        value.name = rate.name;                        
                            dataDates.forEach(dates =>{
                                valueDates.push({
                                    efective_date: dates.efective_date, 
                                    close: dates.close,
                                    banCambio: false
                                });
                            }); 
                        value.dates = valueDates;
                        data.push(value);
                    });
                    this.setState({dataRates: data, countRates:countData},functionGetData);
                } 
                else {
                    MComponentes.toast(response.Msg);
                    this.setState({ dataRates:[], load: false },functionGetData);
                }
            }else{
                this.setState({dataRates:[], load: false },functionGetData);
            }
        });        
    }

    getPanelBoddy() {
        let {dataRates,datesCurrent,request}= this.state;
        let body= [];     
        let property= request.property;
        let roomID= request.room;
        dataRates.sort().map((dataRates, key) => {     
            //Genera cada celda con candado cerrado o abierto s
            let idRate= dataRates.id_rateplan;
            let listDatesResponse = dataRates.dates.sort();
            let listDatesCurrent = datesCurrent.sort();
            let celdas = [];

            listDatesCurrent.forEach((dates,keyDates)=>{
                let statusDate = false;
                let color = '#636363';
                let icon = 'lock_open';
                let indexDate = listDatesResponse.findIndex(dateCurrent => dateCurrent.efective_date == dates);
                let date = listDatesResponse[indexDate];

                let nameObj = `objClose|${property}|${roomID}|${idRate}|${dates}`;
                let dateNotRate = `|${property}|${roomID}|${dates}`;
                let objectClose = '';

                if(date !== undefined){
                    
                    statusDate = date.close;
                    color = statusDate == false ? '#636363' : '#d28989';
                    icon = statusDate == false ? 'lock_open' : 'lock';  
                    objectClose = (<a onClick={e=>this.changeObjDatesRate(nameObj,key,indexDate)} style={{ color: color }}>
                                                 <i style={{ color: color }} 
                                                className='material-icons' id={nameObj} name={nameObj} status={`${statusDate}`} >{icon}</i>
                                            </a>)
                }
                
                this.setState(prevState => ({
                    dataStatusRates: [...prevState.dataStatusRates, 
                        {name:nameObj,status:statusDate,nameAllRate:dateNotRate, dateRow:dates}]
                }));

                celdas.push(
                    <div key={`celda${idRate}|${keyDates}`} className="col s12 m1 l1">
                        <center>
                           {objectClose}
                        </center>    
                    </div>                    
                );
            });

            body.push(<div className="row" key={`body${key}`}>
                <div id='title' name='title' className="col s12 m1 l1" style={{ overflow: 'hidden', whiteSpace: 'pre' }}>
                <label >{dataRates.name}</label>
                </div>
                    {celdas}
                <div id="" className="col s12 m1 l1"></div>
                </div>) 
           
        });
        this.setState({bodyCalendar:body},()=>{
            this.validateAllDates();
            this.setState({load: false});
        });
    }
  
    handlerChange(data) {
        this.setState({load:true});
        let {request}= this.state;
        if (data == 'ADD') {
            let requestNew = request;
            let end_day = moment(request.date_end).add(10, 'days').toDate();
            let start_day = moment(request.date_start).add(10, 'days').toDate();

            requestNew.date_start = moment(start_day).format('YYYY-MM-DD');
            requestNew.date_end = moment(end_day).format('YYYY-MM-DD');
            this.setState({
                request: requestNew, 
                dates: { start: start_day, end: end_day }
                },()=>{
                    this.startPag();
                });            

        } else if (data == 'REMOVE') {

            let requestNew = request;
            let end_day = moment(request.date_end).subtract(10, 'days').toDate();
            let start_day = moment(request.date_start).subtract(10, 'days').toDate();

            requestNew.date_start = moment(start_day).format('YYYY-MM-DD');
            requestNew.date_end = moment(end_day).format('YYYY-MM-DD');
            this.setState({ 
                request: requestNew, 
                dates: { start: start_day, end: end_day }
            },()=>{
                this.startPag();
            }); 
        }
    }

    changeObjDatesRate(nameObj,keyRate,keyDate){        
        let {dataRates}= this.state;
        let dataRate = dataRates[keyRate];
        let dataDates = dataRate.dates[keyDate];
        
        dataDates.banCambio = dataDates.banCambio == undefined ? true : dataDates.banCambio == false ? true :false;
        dataDates.close = !dataDates.close;
        this.setState({dataStatusRates:[]},()=>{            
            this.getPanelBoddy(); 
        });
    }

    ChangeAll(dateChecked,name){
        let {dataRates}= this.state;
        let valueChecked = document.getElementById(`${name}`)!== null 
        ? document.getElementById(`${name}`).checked :false;
        
        let newDataRate = [];
        dataRates.sort().map((rates,key) =>{
            let dates = rates.dates.sort();
            let dataGeneral = {}
            let listDates = [];

            dataGeneral.id_rateplan = rates.id_rateplan;
            dataGeneral.name = rates.name;
            
            dates.map((dataDates)=>{
                let data= {};
                data.efective_date = dataDates.efective_date;
                data.close = dataDates.close;
                data.banCambio = dataDates.banCambio;

                if(dataDates.efective_date == dateChecked){  
                    if(dataDates.close !== valueChecked){
                        data.close = valueChecked;
                        data.banCambio = dataDates.banCambio == undefined ? true : dataDates.banCambio == false ? true :false;
                    } 
                }

                listDates.push(data);
            });

            dataGeneral.dates= listDates;            
            newDataRate.push(dataGeneral);
        });
        this.setState({dataStatusRates:[],dataRates:newDataRate},()=>{
            this.getPanelBoddy(()=>{
                this.setState({load: false});
            });
        });        
    }

    validateAllDates(){
        let {datesCurrent,dataStatusRates} = this.state;
        let listDatesCurrent = datesCurrent.sort();

        listDatesCurrent.forEach(date=>{
            let dataByDate = dataStatusRates.filter(dataRates => dataRates.dateRow == date);
            let isTrueCol = dataByDate.length > 0 ? dataByDate.filter(data => data.status == true) : 0;

            if(isTrueCol.length > 0){
                let name = isTrueCol[0].nameAllRate;
                //preguntar si la cantidad de true en cada columna es igual al total de filas existentes
                if(dataByDate.length  == isTrueCol.length){
                    //marcar check all
                    document.getElementById(`checkRoomDay${name}`).checked = true;
                }else{
                    //desmarcar check all
                    document.getElementById(`checkRoomDay${name}`).checked = false;
                }
            }
        });
    }

    saveChanges() {
        this.setState({ load: true });
        let {dataStatusRates,request,dataRates}= this.state;
        let requestDisableRoom = {};        
        
        if (dataRates.length > 0 ){
            requestDisableRoom.id_property = parseInt(request.property);
            requestDisableRoom.id_room_type = parseInt(request.room);
            let listRate = [];
            
            dataRates.sort().map((dataRates, key) => {
                let dataListRate = {};
                let listDates = [];
                let idRatePlan= dataRates.id_rateplan;
                let dataRatesOnlyMod = dataRates.dates.filter(dates => dates.banCambio == true);
                let listDatesRate = dataRatesOnlyMod.sort();
                
                dataListRate.rateplan_id = idRatePlan;

                listDatesRate.forEach((date)=>{
                    let nameObj = `objClose|${request.property}|${request.room}|${idRatePlan}|${date.efective_date}`;
                    let valueCurrent = dataStatusRates.find(current => current.name ==  nameObj);
                        
                    if(valueCurrent !== undefined){
                        listDates.push({
                            date_start: valueCurrent.dateRow,
                            date_end: valueCurrent.dateRow,
                            close: valueCurrent.status
                        })
                    }             
                });
                dataListRate.dates = listDates;

                listRate.push(dataListRate);
            });             
            requestDisableRoom.rateplans = listRate;

            this.saveDisabledRoom(requestDisableRoom);
        }else{
            this.setState({ load: false });
        }       
    }

    saveDisabledRoom(requestDisableRoom){
        // console.log('requestDisableRoom ==> ', JSON.stringify(requestDisableRoom));
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/calendar/disabled-room`, requestDisableRoom, (response, error) => {
            if(!error)
            {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }

                if(response.Error == false){
                    MComponentes.toast("Data Rooms Save");
                    this.startPag();
                }else{
                    MComponentes.toast("It was not saved the Min_Los and Max_Los");
                    this.setState({load: false})
                }                 
            }else{
                MComponentes.toast(error);
                this.setState({load: false});  
            }              
        });
    }
    
    render() {
        let {hotelSelected,load,months,divDays,divCheck,bodyCalendar}=this.state;
        if (hotelSelected === false) { return <Redirect to="/" /> }
        return (
            <div>
                <CleverLoading show={load} />
                <div>
                    <div className="row">
                        <div id="" className="col s12 m1 l1"> </div>
                        <center>{months}</center>
                        <div id="" className="col s12 m1 l1"> </div>
                    </div>
                    <div className="row">
                        <div id="" className="col s12 m1 l1">
                            <i className="material-icons" onClick={e => this.handlerChange('REMOVE')}>keyboard_arrow_left</i>
                        </div>
                        <center>{divDays}</center>
                        <div id="" className="col s12 m1 l1">
                            <i className="material-icons" onClick={e => this.handlerChange('ADD')}>keyboard_arrow_right</i>
                        </div>
                    </div>
                    <div className="row"><div id="division" className="col s12 m12 l12" style={{ borderBottomStyle: 'groove' }}></div></div>
                    <div className="row">
                        <div id="" className="col s12 m1 l1"></div>
                        <center>{divCheck}</center>
                        <div id="" className="col s12 m1 l1"></div>
                        <div id="division" className="col s12 m12 l12" style={{ borderBottomStyle: 'groove' }}></div>
                    </div>                    
                </div>
                <div className="row">
                    {bodyCalendar ? bodyCalendar: null}
                    <div id="" className="col s12 m1 l1"></div>
                </div>
                
            </div>
        );
    };
};

CalendarRooms.propTypes = {
    onRef: PropTypes.func,
    request: PropTypes.object,
    dates: PropTypes.object
}

CalendarRooms.defaultProps = {
    onRef: () => {},
    request: {date_start:"1900-01-01", date_end:"1900-01-01", property:0, room:0},
    dates: {start: "1900-01-01", end: "1900-01-01"}
}