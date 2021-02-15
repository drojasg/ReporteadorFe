import React from 'react';
import { Redirect } from 'react-router-dom';
import { Panel, MComponentes, CleverLoading, CleverRequest } from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";
import moment from 'moment';

export default class Calendar extends React.Component 
{  

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.referencia = React.createRef();
        this.referenciaCrossout = React.createRef();
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            request: this.props.request,
            banderaCrossout: false,
            dates: this.props.dates,
        }
        this.handlerChange = this.handlerChange.bind(this);
        this.handlerChangeInput = this.handlerChangeInput.bind(this);
        this.changeMinMax = this.changeMinMax.bind(this);
        this.ChangesCrossout = this.ChangesCrossout.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
    }

    componentDidMount(){
        this.setState({ load: true });
        let request = this.state.request;
        // console.log('request ==> ',this.state.request);
        this.getPacks(request);       
        
        this.props.crossout.current.id ?
           document.getElementById(this.props.crossout.current.id).addEventListener("click", this.ChangesCrossout)
           : null
       this.referenciaCrossout.current;
        
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.saveChanges)
           : null
       this.referencia.current;
    }

    ChangesCrossout(){
        this.setState({ load: true, Boody: '' });
        let bandera = '';
        let panel = '';
        let labelPercent = '';
        if (!this.state.banderaCrossout) {
            bandera = true;
            panel = this.state.PanelBoodyTemp;
            labelPercent = this.state.listPercentTemp;
        }else if (this.state.banderaCrossout) {
            bandera = false;
            panel = this.state.PanelBoody;
            labelPercent = <div key={0} id={0} className="col s12 m1 l1">
                            <label key={0}> </label>
                        </div>;
        }

        var percentHTML = (
            <div className="row">
                <div className="col s12 m1 l1"></div>
                    <center>{ labelPercent }</center>
                <div className="col s12 m1 l1"></div>
            </div>
        );

        this.setState({ percent_discount: percentHTML, Boody: panel, banderaCrossout: bandera, load: false });
    }

    saveChanges(){
        this.setState({ load: true });
        let requestTmp = this.state.request;
        
        if (this.state.banderaCrossout == false) {
            let arrayTemp = [];
            this.idChange.map((i) => {
                if (i.estado == 1) {
                    arrayTemp.push({"date_start": i.start_date, "date_end": i.end_date, "id_pax": i.pax_id, "amount": i.amount});
                }
            })

            let request = {
                "id_property": requestTmp.property_code,
                "id_room": requestTmp.room_type_code,
                "id_rate_plan": requestTmp.rate_plan_code,
                "prices": arrayTemp
            }

            if(arrayTemp.length > 0){
                CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/calendar/update`, request, (response, error) => {
                    if (response.status == 403) {
                        MComponentes.toast('YOU ARE NOT AUTHORIZED');
                        this.setState({ load: false });
                        return
                    }
                    if (!error) {
                        if (response.Error == false) {
                            if (response.data.length > 0) {
                                MComponentes.toast('Success');
                                this.divDays = new Array();
                                // this.tmpdivDays = new Array();
                                this.divCeld = new Array();
                                this.tmpdivCeld = new Array();
                                this.idChange = new Array();
                                this.setState({ percent_discount: '', Boody: '', pakages: '', percentHTML: '', PanelBoodyTemp: '' })
                                this.componentDidMount();
                            }else{
                                MComponentes.toast('Data empty');
                                this.setState({ load: false });
                            }
                        }else{
                            MComponentes.toast(response.error);
                            this.setState({ load: false });
                        }
                    }else{
                        MComponentes.toast(error);
                        this.setState({ load: false });
                    }
                })
             }else{
                MComponentes.toast('Data empty');  
                this.setState({ load: false });
             } 
        }else{
            this.setState({ load: false });
        }
        
        this.saveMinMaxLos(requestTmp);     
    }

    saveMinMaxLos(requestTmp){
        this.setState({ load: true});
        let detailMin = [];
        let detailMax = [];    
        /*Min_Los = 2  
          Max_Los = 3 */
        let dataMinMax = this.idChangeMinMax.filter(minMax => minMax.estado == 1 );
        
        dataMinMax.map(data=>{
            if(data.id_restriction_type == 2){
                detailMin.push({
                    "date_start": data.start_date,
                    "date_end": data.end_date,
                    "value": data.minMax
                });
            }
  
            if(data.id_restriction_type == 3){
                detailMax.push({
                    "date_start": data.start_date,
                    "date_end": data.end_date,
                    "value": data.minMax
                });                
            }
        });
  
        let requestMinMax = {
            "id_property": requestTmp.property_code,
            "id_room": requestTmp.room_type_code,
            "id_rate_plan": requestTmp.rate_plan_code,
            "data": [
                {
                    "id_restriction_type":2,
                    "dates":detailMin
                },
                {
                    "id_restriction_type":3,
                    "dates":detailMax
                }
            ]
        }
  
        // console.log('requestMinMax: ', JSON.stringify(requestMinMax));
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/calendar/update-min-max`, requestMinMax, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }

            if(!error)
            {
                if(response.Error == false){
                    this.idChangeMinMax = new Array();
                    this.newArrayCeld = new Array();
                    this.newArrayCeldCrossout = new Array();
                    this.setState({ percent_discount: '', Boody: '', BoodyMinMax: '', pakages: '', percentHTML: '', PanelBoodyTemp: '' })
                    this.componentDidMount();
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
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.dates !== this.props.dates || prevProps.request !== this.props.request) {
            this.setState({ dates: this.props.dates, request: this.props.request, Boody: '',BoodyMinMax:'', PanelHeader: '' })
            this.setState({ load: true });
            let request = this.props.request;
            this.getPacks(request);
        }
    }

    getPacks = async (request) => {
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/rates/calendar`, request, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.error) {
                    if (response.data.length > 0) {
                        this.setState({ pakages: response.data });
                        this.titles = new Array();

                        response.data.map((i)=>{
                            let title = i.pax+' '+i.name;
                            this.titles.push( title );
                        })
                        this.getAvailability(request);
                    }else{
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                }else{
                    this.setState({ load: false });
                    MComponentes.toast(response.error);
                }
            }else{
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        })

    }

    getAvailability(request){
        let sendData = {
            "id_property": '',
            "id_room_type": '',
            "date_start": '',
            "date_end": '"2020-03-21"'
        };

        sendData.id_property = request.property_code;
        sendData.id_room_type = request.room_type_code;
        sendData.date_start = request.date_start;
        sendData.date_end = request.date_end;

        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/calendar/get_avail_rooms`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.Error && response.data.length > 0) {
                    let dates = [];
                    
                    response.data.map((i, k)=>{
                        if (i.exist) {
                            dates.push( i.avil_room );
                        }else if (!i.exist) {
                            dates.push( '-' );
                        }
                    })

                    dates.pop();
                    this.setState({ listAvialability: dates, Boody: '' });
                    this.getApiMinMax(request,()=>this.getMinMax());                   
                }else{
                    this.setState({ load: false });
                }
            }else{
                this.setState({ load: false });
            }
        });
    }

    getApiMinMax(request,functionGetMinMax){
        let sendData={
            "id_property": 0,
            "id_room": 0,
            "id_rate_plan": 0,
            "date_start": "1900-01-01",
            "date_end": "1900-10-15"
        }
        sendData.id_property = parseInt(request.property_code);
        sendData.id_room = parseInt(request.room_type_code);
        sendData.id_rate_plan = parseInt(request.rate_plan_code);
        sendData.date_start = request.date_start;
        sendData.date_end = request.date_end;

        // console.log(JSON.stringify(sendData));
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +`/api/calendar/get-min-max`, sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false },functionGetMinMax);
                return
            }
            if (!error) {
                if (!response.Error && response.data.length > 0) {
                    let dataMinMax = response.data;
                    this.setState({ responseMinMax: dataMinMax, load: false},functionGetMinMax)                    
                }else{
                    this.setState({responseMinMax:dataMinMax, load: false },functionGetMinMax);
                }
            }else{
                this.setState({responseMinMax: dataMinMax, load: false },functionGetMinMax);
            }
        });
    }

    getMinMax(){
        let { responseMinMax } = this.state;
        this.titlesMinMax = new Array();

        responseMinMax.map((i)=>{
            let title = i.name;
            this.titlesMinMax.push( title );
        })

        this.divDays = new Array();
        // this.tmpdivDays = new Array();
        this.divCeldMinMax = new Array();
        this.divCeld = new Array();
        this.tmpdivCeld = new Array();
        this.idChange = new Array();
        this.idChangeMinMax = new Array();
        this.newArrayCeld = new Array();
        this.newArrayCeldCrossout = new Array();
        this.getPanelHeader();
        this.getPanelBoddy();
    }

    getPanelBoddy(){
        let pakages = this.state.pakages
        let rango = this.state.dates
        let start = moment(rango.start);
        let end = moment(rango.end);

        let diferentDay = end.diff(start, 'days');
        let tmpMatriz = [];

        pakages.map((i, key)=>{
            let days = start;
            for (let j = 0; j < diferentDay; j++) {

                let Days = moment(days).format('YYYY-MM-DD');
                tmpMatriz.push( Days );
                days = moment(days).add(1, 'days').toDate();
            }
            if (key <= 1) {
                this.divCeldMinMax.push(tmpMatriz);
            }
            this.divCeld.push(tmpMatriz);
            tmpMatriz = [];
        })

        this.setDataArrayMinMax();
        this.setDataArray();
    }
    
    getPanelHeader(){
        let rango = this.state.dates
        let start = moment(rango.start);
        let end = moment(rango.end);

        let diferentDay = end.diff(start, 'days');
        let tmpDays = moment(end).format('MM') - moment(start).format('MM');
        tmpDays = tmpDays + 1;
        let countMonths = []; 
        let tmpMonths = ''; 
        let days = start; 
        let count = 0;

        for (let i = 0; i < diferentDay; i++) {
            let labelDays = moment(days).format('ddd D');
            let Month = moment(days).format('MMMM');
            
            if (Month != tmpMonths) {
                count = i;
            }
            countMonths.push(Month);
            tmpMonths = moment(days).format('MMMM');
            this.divDays.push(<div key={i} id={i} name={i} className="col s12 m1 l1">
                <label>{labelDays}</label>
            </div>);
            days = moment(days).add(1, 'days').toDate();    
        }

        let tmpItem = '';
        let months = [];
        countMonths.map((i, k)=>{
            if (tmpItem != i) {
                months.push(<div key={k} id={k} name={k} className={`col s12 m${count} l${count}`} style={{borderRight: "1px solid #00000059", borderLeft: "1px solid #00000059"}}>
                    <label style={{fontSize: 'inherit'}}><b>{ i }</b></label>
                </div>);

                count = 10 - count;   
            }
            tmpItem = i;
        })
        
        this.setState({ PanelHeader: ''});

        var PanelHTMLDay = (
            <div>
                <div className="row">
                    <div id="" className="col s12 m1 l1"> </div>
                        <center>{months}</center>
                    <div id="" className="col s12 m1 l1"> </div>
                </div>
                <div className="row">
                    <div id="" className="col s12 m1 l1">
                        <i className="material-icons" onClick={e=>this.handlerChange('REMOVE')}>keyboard_arrow_left</i>
                    </div>                
                        <center>{this.divDays}</center>
                    <div id="" className="col s12 m1 l1">
                        <i className="material-icons" onClick={e=>this.handlerChange('ADD')}>keyboard_arrow_right</i>
                    </div>

                    <div id="" className="col s12 m1 l1"><center>AVAILABILITY</center></div>
                        {this.state.listAvialability.map((i,key)=>{
                            return <div key={key} id="" className="col s12 m1 l1"><center>{i}</center></div>;
                        })}
                    <div id="" className="col s12 m1 l1"></div>
                </div>
            </div>
        );

        this.setState({ PanelHeader: PanelHTMLDay });
        
    }

    setDataArrayMinMax(){
        let { responseMinMax } = this.state;
        let listMinMax = [];

        responseMinMax.map((j, keyJ)=>{
            let nameValue = String(j.name).toLowerCase();
            j.dates.map((k, keyK)=>{
                listMinMax.push({ 
                    [keyJ]: k.efective_date, 
                    MinMax: k[`${nameValue}`], 
                    idMinMax: keyJ, 
                    id_restriction_type:j.id_restriction_type
                })
            })
        })

        // console.log('listMinMax: ', listMinMax);
        let newArrayCeldMinMax = [];

        this.divCeldMinMax.map((i, keyI) => {
            let tmpList = [];
            i.map((j, keyJ) => {
                let itemHtml = '', MinMaxValue = 0.0, idMinMax = '', id_restriction_type = 0;
                
                listMinMax.map((k, keyK) => {
                    if (k[keyI] == j) {
                        MinMaxValue = k.MinMax;
                        idMinMax = k.idMinMax;
                        id_restriction_type = k.id_restriction_type;
                    }
                })
                this.idChangeMinMax.push( {
                    "start_date": j,
                    "end_date": j,
                    "idMinMax": idMinMax,
                    "minMax": MinMaxValue,
                    "estado": 0,
                    "id_restriction_type":id_restriction_type
                });

                itemHtml = <div key={keyJ} id={j} className="col s12 m1 l1">
                        <input type='number' id={keyI} name={j} idMinMax={idMinMax} defaultValue={MinMaxValue} value={this.state[j]}
                            onChange={this.changeMinMax} style={{fontSize: 'small', width: '100px'}}></input>
                </div>;
                
                tmpList.push(itemHtml);
            })
            
            newArrayCeldMinMax.push(tmpList);
        })
        // console.log('newArrayCeldMinMax: ', newArrayCeldMinMax);
        this.divCeldMinMax = newArrayCeldMinMax;

        var PanelHTMLCledsMinMax = (<div>
            {newArrayCeldMinMax.map((i, keys)=>{
                let item = [];
                i.map((j)=>{
                    item.push(j);
                })
                return <div className="row" key={keys}>
                    <div id='title' name='title' className="col s12 m1 l1">
                        <label> {this.titlesMinMax[keys]} </label>
                    </div>
                        {item}
                    <div id='Days' name='Days' className="col s12 m1 l1"></div>
                </div>;
            }) }
        </div>);
        
        this.setState({ BoodyMinMax: PanelHTMLCledsMinMax });
    }

    setDataArray(){
        let { pakages } = this.state;
        let listPrices = [];
        let bandera = true;
        let listPercent = [];
        this.state.pakages.map((j, keyJ)=>{
            j.prices.map((k, keyK)=>{
                if (keyJ == 0) {
                    listPercent.push( <div key={keyJ} id={j} className="col s12 m1 l1">
                        <label>{k.percent_discount} %</label>
                    </div> );
                }
                if (!j.is_adult && (pakages.length-1) != keyJ) {
                    listPrices.push({[keyJ]: k.efective_date, amount: k.amount, amount_crossout: k.amount_crossout, pax_id: j.pax_id, is_adult: j.is_adult, firstChd:true});
                }else{
                    listPrices.push({[keyJ]: k.efective_date, amount: k.amount, amount_crossout: k.amount_crossout, pax_id: j.pax_id, is_adult: j.is_adult, firstChd:false});                   
                }
            })
            if (!j.is_adult) {
                bandera = false;
            }
        })

        let itemHtml = '';
        let itemHtmlCrossout = '';
        let amountValue = 0.0;
        let amountCrossout = 0.0;
        let idPack = '';
        let status = false;

        

        let tmpList = [];
        let tmpListCrossout = [];

        this.setState({ listPercentTemp: listPercent });
        this.newArrayCeld = [];
        this.newArrayCeldCrossout = [];

        this.divCeld.map((i, keyI) => {            
            tmpList = [];
            tmpListCrossout = [];
            i.map((j, keyJ) => {
                itemHtml = '';
                itemHtmlCrossout = '';
                amountValue = 0.0;
                amountCrossout = 0.0;
                idPack = '';
                status = false;

                listPrices.map((k, keyK) => {
                    if (k[keyI] == j) {
                        amountValue = k.amount;
                        amountCrossout = k.amount_crossout;
                        idPack = k.pax_id;
                        if (!k.is_adult && !k.firstChd) {
                            status = true;
                        }
                    }                    
                })
                this.idChange.push( {
                    "start_date": j,
                    "end_date": j,
                    "pax_id": idPack,
                    "amount": amountValue,
                    "estado": 0
                });


                itemHtmlCrossout = <div key={keyJ} id={j} className="col s12 m1 l1">
                    <center>
                        <input type='number' id={keyI} name={j} id_pack={idPack} defaultValue={amountCrossout} disabled={true}
                            style={{backgroundColor: "#dadada40", color: "black", fontSize: 'small', width: '100px'}}></input>
                    </center>
                </div>;

                itemHtml = <div key={keyJ} id={j} className="col s12 m1 l1">
                        <input type='number' id={keyI} name={j} id_pack={idPack} defaultValue={amountValue} value={this.state[j]}
                            onChange={this.handlerChangeInput} style={{fontSize: 'small', width: '100px'}} disabled={status}></input>
                </div>;
                
                tmpListCrossout.push(itemHtmlCrossout);
                tmpList.push(itemHtml);
            })
            
            this.newArrayCeldCrossout.push(tmpListCrossout);
            this.newArrayCeld.push(tmpList);
        })

        // console.log(this.newArrayCeld);

        this.divCeld = this.newArrayCeld;
        this.tmpdivCeld = this.newArrayCeldCrossout;
        
        this.setState({ Boody: ''});

        var PanelHTMLCleds = (<div>
            {this.divCeld.map((i, keys)=>{
                let item = [];
                i.map((j)=>{
                    item.push(j);
                })
                return <div className="row" key={keys}>
                    <div id='title' name='title' className="col s12 m1 l1">
                        <label> {this.titles[keys]} </label>
                    </div>
                        {item}
                    <div id='Days' name='Days' className="col s12 m1 l1"></div>
                </div>;
            }) }
        </div>);


        var PanelHTMLCledsCrossout = (<div>
            {this.tmpdivCeld.map((i, keys)=>{
                let item = [];    
                i.map((j)=>{
                    item.push(j);
                })
                return <div className="row" key={keys}>
                    <div id='title' name='title' className="col s12 m1 l1">
                        <label> {this.titles[keys]} </label>
                    </div>
                        {item}
                    <div id='Days' name='Days' className="col s12 m1 l1"></div>
                </div>;
            }) }
        </div>);
        
        
        let labelPercent = '';
        if (!this.state.banderaCrossout) {
            this.setState({ Boody: PanelHTMLCleds });
            labelPercent = <div key={0} id={0} className="col s12 m1 l1">
                <label key={0}> </label>
            </div>;
            // console.log('falso');
        }else if (this.state.banderaCrossout) {
            this.setState({ Boody: PanelHTMLCledsCrossout });
            document.getElementById(this.props.crossout.current.id).value = false;
            labelPercent = this.state.listPercentTemp;
            // this.ChangesCrossout();
            // console.log('verdadero ', this.props);
        }       

        var percentHTML = (
            <div className="row">
                <div className="col s12 m1 l1"></div>
                    <center>{ labelPercent }</center>
                <div className="col s12 m1 l1"></div>
            </div>
        );

        this.setState({ percent_discount: percentHTML, PanelBoody: PanelHTMLCleds, PanelBoodyTemp: PanelHTMLCledsCrossout, load: false });
    }

    handlerChangeInput(e){
        // this.setState({[e.target.name]: e.target.value},);
        this.divCeld.map((i, keys)=>{
            if (e.target.id == keys) {
                let tmpItem = [];

                i.map((j, keyJ) => {
                    let itemNew = '';
                    let itemName = j.props.children.props.name;
                    let itemPaxId = j.props.children.props.id_pack;
                    if (itemName == e.target.name) {
                        this.idChange.find(x => x.pax_id == itemPaxId && x.start_date == itemName).estado = 1;
                        this.idChange.find(x => x.pax_id == itemPaxId && x.start_date == itemName).amount = e.target.value;

                        itemNew = <div key={keyJ} id={itemName} className="col s12 m1 l1">
                            <input type='number' id={keys} name={itemName} id_pack={itemPaxId} defaultValue={e.target.value} value={this.state[j]}
                                onChange={this.handlerChangeInput} style={{fontSize: 'small', width: '100px', backgroundColor: "#ffe5e980"}}></input>
                        </div>;
                        
                        j = itemNew;
                    }
                    tmpItem.push(j);
                })
                this.divCeld[keys] = tmpItem;
                
            }
        })

        var PanelHTMLCleds = (<div>
            {this.divCeld.map((i, keys)=>{
                let item = [];    
                i.map((j)=>{
                    item.push(j);
                })
                return <div className="row" key={keys}>
                    <div id='Days' name='Days' className="col s12 m1 l1">
                        <label> {this.titles[keys]} </label>
                    </div>
                        {item}
                    <div id='Days' name='Days' className="col s12 m1 l1"></div>
                </div>;
            }) }
        </div>);

        this.setState({ Boody: PanelHTMLCleds });

    }

    changeMinMax(e){
        // this.setState({[e.target.name]: e.target.value},);
        this.divCeldMinMax.map((i, keys)=>{
            if (e.target.id == keys) {
                let tmpItem = [];

                i.map((j, keyJ) => {
                    let itemNew = '';
                    let itemName = j.props.children.props.name;
                    let itemMinMaxId = j.props.children.props.idMinMax;
                    if (itemName == e.target.name) {
                        this.idChangeMinMax.find(x => x.idMinMax == itemMinMaxId && x.start_date == itemName)['estado'] = 1;
                        this.idChangeMinMax.find(x => x.idMinMax == itemMinMaxId && x.start_date == itemName)['minMax'] = e.target.value;

                        itemNew = <div key={keyJ} id={itemName} className="col s12 m1 l1">
                            <input type='number' id={keys} name={itemName} idMinMax={itemMinMaxId} defaultValue={e.target.value} value={this.state[j]}
                                onChange={this.changeMinMax} style={{fontSize: 'small', width: '100px', backgroundColor: "#ffe5e980"}}></input>
                        </div>;
                        
                        j = itemNew;
                    }
                    tmpItem.push(j);
                })
                this.divCeldMinMax[keys] = tmpItem;
                
            }
        })

        var PanelHTMLCledsMinMax = (<div>
            {this.divCeldMinMax.map((i, keys)=>{
                let item = [];    
                i.map((j)=>{
                    item.push(j);
                })
                return <div className="row" key={keys}>
                    <div id='Days' name='Days' className="col s12 m1 l1">
                        <label> {this.titlesMinMax[keys]} </label>
                    </div>
                        {item}
                    <div id='Days' name='Days' className="col s12 m1 l1"></div>
                </div>;
            }) }
        </div>);

        this.setState({ BoodyMinMax: PanelHTMLCledsMinMax });
        let arrayTemp = [];
        this.idChangeMinMax.map((i) => {
            if (i.estado == 1) {
                arrayTemp.push( { "start_date": i.start_date, "end_date": i.end_date, "idMinMax": i.idMinMax, "minMax": i.minMax } );
            }
        })
        // console.log('arrayTemp: ',arrayTemp);
    }

    handlerChange(data){
        if (data == 'ADD') {
            
            let requestNew = this.state.request;
            let end_day = moment(this.state.request.date_end).add(10, 'days').toDate();
            let start_day = moment(this.state.request.date_start).add(10, 'days').toDate();
            
            requestNew.date_start = moment(start_day).format('YYYY-MM-DD');
            requestNew.date_end = moment(end_day).format('YYYY-MM-DD');
            this.setState({ request: requestNew, dates: { start: start_day, end: end_day}, Boody: '', BoodyMinMax: '', PanelHeader: ''  })

            this.componentDidMount();

        }else if (data == 'REMOVE') {

            let requestNew = this.state.request;
            let end_day = moment(this.state.request.date_end).subtract(10, 'days').toDate();
            let start_day = moment(this.state.request.date_start).subtract(10, 'days').toDate();
            
            requestNew.date_start = moment(start_day).format('YYYY-MM-DD');
            requestNew.date_end = moment(end_day).format('YYYY-MM-DD');
            this.setState({ request: requestNew, dates: { start: start_day, end: end_day}, Boody: '', BoodyMinMax: '', PanelHeader: ''  })
    
            this.componentDidMount();

        }
    }

    render(){
        let { Boody, percent_discount, PanelHeader, load, BoodyMinMax } = this.state;
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        return (
            <div>
                <CleverLoading show={load}/>
                {PanelHeader}
                
                <div id="division" className="col s12 m12 l12" style={{borderBottomStyle: 'groove'}}></div>
            
                {percent_discount}
            
                {BoodyMinMax}
                {Boody}
            </div>
        );
    };
};