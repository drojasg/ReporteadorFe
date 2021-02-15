import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverRequest, Panel, CleverForm, CleverLoading, MComponentes, Modal, CleverAccordion, CleverInputCheckbox, GridView } from 'clever-component-library';//CleverAccordion
import CleverConfig from "./../../../../../config/CleverConfig";
import Calendar from './Calendar';
import moment from 'moment';

export default class MainRateCalendar extends React.Component 
{  

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            load: true,
            roomTypes: null,
            allRoom: null,
            Acordions: null,
            sw: false,
            currencyCode: '',
            idCurrency: '',
            idCountry: '',
            idMarket: 0,
            requiredRate:true,
            arrayChecked : [],
            arrayRoomsByRate:[],
            resultSaveMinMax:[],
            isDisableViewRate:true
        }
        this.handlerSelectedCurrency = this.handlerSelectedCurrency.bind(this);
        this.handlerSelectedCountry = this.handlerSelectedCountry.bind(this);
        this.handlerSelectedMarket = this.handlerSelectedMarket.bind(this);
        this.handlerSelected = this.handlerSelected.bind(this);
        this.closeModalEdit = this.closeModalEdit.bind(this);
        this.ChangeSwitch = this.ChangeSwitch.bind(this);
        this.sendData = this.sendData.bind(this);
        this.openModalMinMax = this.openModalMinMax.bind(this);
        this.clearModalMinMax = this.clearModalMinMax.bind(this);
        this.crossout = false;
    }
    formFilters = React.createRef();
    formCheck = React.createRef();

    componentDidMount(){
        if(this.state.hotelSelected){
            this.setState({ dataForm: {date_start: new Date()},requiredRate:true })
            this.getRates();
            this.getMarkets();
            this.getCurrency();
            this.getCountry();
        }
    }

    getCountry(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/country/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                if (response != null) {
                    let country = [];
                            
                    country.push( {value: "", option: 'Select country'} );
                    response.data.map((i, key) => {
                        country.push( {value: i.country_code, option: i.name} );
                    })
                    this.setState({ idCountry: "", responseCountry: response.data, Country: country, load: false });
                }
                this.setState({loader: false})
            }
            else {
                this.setState({loader:false})
                MComponentes.toast("ERROR in country");
            };
        });
    }

    getCurrency(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/currency/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.error) {
                    if (response.data.length > 0) {
                        let currency = [];
                            
                        currency.push( {value: "", option: 'Select currency'} );
                        response.data.map((i, key) => {
                            currency.push( {value: i.currency_code, option: i.currency_code} );
                        })
                        this.setState({ responseCurrency: response.data, Currency: currency, load: false });

                    } else {
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                } else {
                    this.setState({ load: false });
                    MComponentes.toast(response.error);
                }
            } else {
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        });
    }

    getMarkets(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + "/api/market/get", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.error) {
                    if (response.data.length > 0) {
                        
                        let market = [];
                            
                        market.push( {value: 0, option: 'Select market'} );
                        response.data.map((i, key) => {
                            market.push( {value: i.iddef_market_segment, option: i.code} );
                        })
                        this.setState({ responseMarket: response.data, Market: market, load: false });

                    } else {
                        this.setState({ load: false });
                        MComponentes.toast('Data empty');
                    }
                } else {
                    this.setState({ load: false });
                    MComponentes.toast(response.error);
                }
            } else {
                this.setState({ load: false });
                MComponentes.toast(error);
            }
        });
    }

    getRates(){
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> } else {
            let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;
            CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/rate-plan/get?property=${idProperty}&all=1`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (!response.error) {
                        if (response.data.length > 0) {
                            let rate_plans = [];
                            
                            response.data.map((i, key) => {
                                rate_plans.push( {value: i.idop_rateplan, option: i.code} );
                            })
                            this.setState({ responseRate: response.data, ratePlans: rate_plans, load: false },
                                ()=>{
                                    this.createAcordRatesMinMax(idProperty);
                                });
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
            });
        }
    }

    createAcordRatesMinMax(idProperty){
        this.createContentAcordMinMax(idProperty,()=>{  
            this.createChecksRooms();          
        });
    }

    createContentAcordMinMax(idProperty,functionAcord=()=>{}){
        let {responseRate}=this.state;
        let headAcordionMinMax = [];
        let bodyAcordionMinMax = {};        

        responseRate.sort().forEach((ratePlans,keyRate) => {
            let idRates = parseInt(ratePlans.idop_rateplan);  
            let descriptionRate = ratePlans.code; 
            let dataRooms = ratePlans.rooms;

            headAcordionMinMax.push(
                {key:keyRate, accordion: `rate${idRates}`, label: `${descriptionRate}`, controls: []}
            );  
            
            bodyAcordionMinMax[`rate${idRates}`] = 
            <div className='row' >
                {/* <label>
                    <input type='checkbox' 
                        id = {`checkRoomAll|${idProperty}|${idRates}`}
                        name = {`checkRoomAll|${idProperty}|${idRates}`}
                        className = {'filled-in'} 
                        onChange = {e=>this.changeDataRoom(e,'ALL',idProperty,idRates,dataRooms,'')} 
                    /> 
                    <span> Select All Rooms</span>   
                </label>    */}
                <GridView 
                        idTable={`tableRatePlans${idRates}`}
                        onRef={ref => this[`tblRatePlan${idRates}`] = ref}
                        serializeRows={false}
                        classTable={'clever-table responsive-table striped bordered'}
                        filter={false}
                        columns={[
                            {
                                attribute: 'actions',
                                alias: '',
                                filter: false,
                                value: (dataRate, index) => {
                                    let idRoom = dataRate.iddef_room_type_category
                                    let code = dataRate.room_code;
                                    return (
                                        <label>
                                            <input type='checkbox' 
                                            id={`checkRoom|${idProperty}|${idRates}|${code}`}
                                            name={`checkRoom|${idProperty}|${idRates}|${code}`}
                                            className={'filled-in'} 
                                            onChange={e=>this.changeDataRoom(e,'',idProperty,idRates,code,idRoom)} 
                                            /> 
                                            <span></span>   
                                        </label>                 
                                    )
                                }
                            },
                            { attribute : 'room_description', alias : ''},
                            { attribute : 'room_code', alias : ''},
                        ]}  
                />    
            </div>            
        
        
        });

        this.setState({headMinMax: headAcordionMinMax, bodyMinMax:bodyAcordionMinMax},functionAcord);
    }

    createChecksRooms (){
        let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;
        let {ratePlans} = this.state;

        ratePlans.sort().forEach(ratePlans => {
            let idRates = parseInt(ratePlans.value);                 
            
            CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/room-type-category/rate-plan/get/${idProperty}/${idRates}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                
                if (!error) {
                    if (!response.error) {
                        let dataRooms = response.data.filter(data => data.estado == 1);
                        
                        this.setState(prevState => ({
                            arrayRoomsByRate: [...prevState.arrayRoomsByRate, {[`Rate${idRates}`]:dataRooms}]
                        }))
                        this[`tblRatePlan${idRates}`].setDataProvider(dataRooms); 
                    }else{
                        MComponentes.toast(response.error);
                    }
                }else{
                    MComponentes.toast(error);
                }
            });
            
        });
    }

    changeDataRoom(e,type,idResort,idRate,dataRooms,idRoom){
        let valueChecked = document.getElementById(`checkRoomAll|${idResort}|${idRate}`)!== null 
                         ? document.getElementById(`checkRoomAll|${idResort}|${idRate}`).checked :false;
        let {codeRoom,nameChecked,idChecked} = '';
        let {arrayChecked,arrayRoomsByRate}= this.state;

        if(type == 'ALL'){
            // console.log('arrayRoomsByRate==> ',this.state.arrayRoomsByRate);
            if(valueChecked){                
                dataRooms.map((rooms)=>{
                    codeRoom = rooms;
                    nameChecked = `checkRoom|${idResort}|${idRate}|${codeRoom}`;
                    idChecked = document.getElementById(`${nameChecked}`);  
                    //Si existe se marca
                    if(idChecked !== null){
                        idChecked.checked = true;
                        // let dataRoomCheck = arrayRoomsByRate.filter(data=>console.log('filter',data)/*[`Rate${idRate}`]*/);
                        // console.log('dataRoomCheck',dataRoomCheck);
                    }   
                });
            }else{
                dataRooms.map((rooms)=>{
                    codeRoom = rooms;
                    nameChecked = `checkRoom|${idResort}|${idRate}|${codeRoom}`;
                    idChecked = document.getElementById(`${nameChecked}`);       
                    //Si existe se desmarca
                    idChecked !== null ? idChecked.checked = false : null;    
                });
            }
        }else{
            let existCheck = document.getElementById(`checkRoom|${idResort}|${idRate}|${dataRooms}`) !== null ? true :false;
            
            //`checkRoom|${idResort}|${idRate}|${dataRooms}|${idRoom}`
            // this.funcionRefRooms(params);
            if(existCheck){
                let valueCheckRoom = document.getElementById(`checkRoom|${idResort}|${idRate}|${dataRooms}`).checked; 
                let nameCheckRoom = `checkRoom|${idResort}|${idRate}|${dataRooms}_${idRoom}`
                //Si esta marcado agregar al array
                if(valueCheckRoom){                    
                    //Verificar si ya existen datos en el array
                    if(arrayChecked.length == 0){
                        // this.setState({arrayChecked:`checkRoom|${idResort}|${idRate}|${dataRooms}|${idRoom}`});
                        this.setState(prevState => ({
                            arrayChecked: [...prevState.arrayChecked, nameCheckRoom]
                        }))
                    }else{
                        let existRoom = arrayChecked.find(data => data == nameCheckRoom);
                        !existRoom ?
                        this.setState(prevState => ({
                            arrayChecked: [...prevState.arrayChecked, nameCheckRoom]
                        }))
                        :null;

                    }
                }else{
                    // Si desmarcado eliminar del array
                    if(arrayChecked.length > 0){
                        let existRoom = arrayChecked.find(data => data == nameCheckRoom);
                        if(existRoom){
                            let copyArrayChecked = [...this.state.arrayChecked];
                            let indexCheck = copyArrayChecked.indexOf(nameCheckRoom);
                            if (indexCheck !== -1) {
                                copyArrayChecked.splice(indexCheck, 1);
                                this.setState({arrayChecked: copyArrayChecked});
                            }
                        }
                    }
                }
            }
        }
    }

    validateDays(start){
        let response = {error: true, data: {}};

        if (start != '') {
            let startDay = moment(start).format('YYYY-MM-DD');
            let endDay = moment(start).add(10, 'days').toDate();
            endDay = moment(endDay).format('YYYY-MM-DD');

            response.error = false;
            response.data = { start: startDay, end: endDay};
        }else{
            let startDay = moment().format('YYYY-MM-DD');
            let endDay = moment(startDay).add(10, 'days').toDate();
            endDay = moment(endDay).format('YYYY-MM-DD');

            response.error = false;
            response.data = { start: startDay, end: endDay};
        }
        
        return response;
    }

    sendData = async (type) => {
        let {idCurrency, idCountry, idMarket} = this.state;

        this.setState({ load: true, Acordions: '', requiredRate:true});
        let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;
        let filtrosData = this.formFilters.getData();
        let validateDays = this.validateDays(filtrosData.values.date_start);
        let {roomTypes, allRoom} = this.state;
        // console.log(allRoom);
        // console.log(dataFormChecks);

        if (this.state.idRatePlan != undefined && filtrosData.required.count == 0) {
            let dataFormChecks = this.formCheck.getData().values.roomChecks;
            if (!validateDays.error) {
                let heads = [], body = {};
                let find = [];
                if (dataFormChecks.length > 0) {
                    find = allRoom.filter( x => dataFormChecks.find(z => x.room_code == z) );                
                }else if (dataFormChecks.length == 0) {
                    find = allRoom;                
                }
                
                find.map((i, key) => {
                    let request = {
                        "property_code": idProperty,
                        "rate_plan_code": this.state.idRatePlan,
                        "room_type_code": i.iddef_room_type_category,
                        "date_start": validateDays.data.start,
                        "date_end": validateDays.data.end,
                        "currency_code": idCurrency,
                        "country_code": idCountry,
                        "market_id":  idMarket 
                    };

                
                    const collapsibleName = `room-${key}`;
                    const containerControls = 
                        <div className="row">
                            <div className="switch col" style={{marginTop: "0.5rem"}}>
                                <span style={{color: 'white'}}>Show crossout</span>
                            </div>
                            <div className="switch col" style={{marginTop: "0.5rem"}}>
                                <label>
                                    <input name={'sw'} type="checkbox" required={true} value={this.state.sw} ref={this[`switch${key}`] = React.createRef()} id={`switch${key}`}/>
                                    <span className='lever'></span>
                                </label>
                            </div>
                            <div className="col">
                                <button type='button' ref={this[`refForm${key}`] = React.createRef()} id={`refForm${key}`} className='btn'>SAVE CHANGES</button>
                            </div>
                        </div>
                    ;
                    //if i.room_description response is an empty string, a blank space is displayed to maintain the header height
                    const head = {id: i.iddef_room_type_category, accordion: collapsibleName, label: i.room_description == "" ? "\u00A0": i.room_description + ' ( '+ i.room_code + ' )' , controls: [{ control: containerControls }] };
                    heads.unshift(head);
                    body[collapsibleName] = <Calendar reference={this[`refForm${key}`]} dates={validateDays.data} crossout={this[`switch${key}`]} request={request} />;
                })

                return this.setState({ Acordions: <CleverAccordion 
                    id={'test-collapsible'}
                    accordion={
                        {
                            head: heads.sort(function (a, b) {
                                if (a.id > b.id) {
                                return 1;
                                }
                                if (a.id < b.id) {
                                return -1;
                                }
                                // a must be equal to b
                                return 0;
                            }),
                            body: [body],
                        }
                    }
                
                />, load: false});
            }
        }else{
            if(type !== 'reload'){
                MComponentes.toast('Empty fields');
            }
            this.setState({ load: false });
        }
    }

    saveMinMaxLos(e){
        this.setState({requiredRate:false,load:true},()=>{            
            let {arrayChecked} =  this.state;
            let dataFrmMinMax = this.formMinMax.getData();
            let valueFrmMinMax  = dataFrmMinMax.values;  
            let frmMinMaxRequired = dataFrmMinMax.required.count;              
            //Se traen los ChecksMarcados
            let roomsRates = arrayChecked;

            let dateBegin = valueFrmMinMax.dateBegin;
            let dateEnd = valueFrmMinMax.dateEnd;
            let valueMin = String(valueFrmMinMax.min);
            let valueMax = String(valueFrmMinMax.max);

            frmMinMaxRequired = (dateBegin == "" || dateEnd == "" || valueMin == "" || valueMax == "") ?  1: 0;
            // console.log('frmMinMaxRequired ==> ', frmMinMaxRequired);
            //vALIDA SI EL FORMULARIO ESTA LLENO Y SI SE TIENE MARCADO AL MENOS UN CHECK
            if (frmMinMaxRequired > 0 || roomsRates.length == 0) {
                frmMinMaxRequired > 0 ? MComponentes.toast("Complete the data required") : null; 
                roomsRates.length == 0 ? MComponentes.toast("Select the rooms for rate plan") : null;                
                this.setState({ load:false,hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
    
            } else {
                dateBegin = valueFrmMinMax.dateBegin;
                dateEnd = valueFrmMinMax.dateEnd;
                valueMin = parseInt(valueMin);
                valueMax = parseInt(valueMax);
                //Se generan los request para dar de alta cada rate

                roomsRates.forEach((dataChecks)=>{
                    let splitIdRoom = dataChecks.split('_');
                    let idRoom = splitIdRoom[1];
                    let splitDataRate = splitIdRoom[0].split('|');                    
                    let idProperty = splitDataRate[1];
                    let idRate = splitDataRate[2];

                    let requestMinMax={};
                    
                    requestMinMax.id_property = idProperty;
                    requestMinMax.id_room = idRoom;
                    requestMinMax.id_rate_plan = idRate;
                    //MIN_LOS = 2 Y MAX_LOS=3
                    requestMinMax.data = [
                        {
                            id_restriction_type:2,
                            dates:[{
                                date_start:dateBegin,
                                date_end:dateEnd,
                                value:valueMin
                            }]
                        },
                        {
                            id_restriction_type:3,
                            dates:[{
                                date_start:dateBegin,
                                date_end:dateEnd,
                                value:valueMax
                            }]
                        }
                    ];
                    let notificationType = "";
                    let notificationMessage = "";
                    this.postMinMaxLos(requestMinMax,()=>{
                        let notifytype = this.state.notificationType;
                        if (notifytype == 'success') {
                            this.clearModalMinMax(()=>{
                                this.refModalMinMax.getInstance().close();
                                this.sendData('reload');
                                this.setState({load:false})
                            });
                            notificationType = notifytype;
                            notificationMessage = "The data was saved";
        
                        } else {       
                            this.setState({load:false});                         
                            notificationType = notifytype;
                            notificationMessage = "It was not saved the Min_Los and Max_Los";
                        } 
                        MComponentes.toast(notificationMessage);
        
                        this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType }); 
                    });  
                });
            }
        });
    }

    postMinMaxLos(requestMinMax,functionSaveMinMax=()=>{}){
        // this.setState({load: true});
        let type = {}
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
                    // this.starPag(tipForm);
                    type = "success";
                    this.setState({notificationType:type},functionSaveMinMax);
                }else{
                    type = "error";
                    this.setState({notificationType:type},functionSaveMinMax);
                }                 
            }else{
                type = "error";
                this.setState({notificationType:type},functionSaveMinMax);
            }              
        });
    }

    getConfigAddButtonsModal(){
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.saveMinMaxLos(e)} >
                <i className="material-icons right">save</i><span data-i18n="{{'SUBMIT'}}">SAVE</span>
            </button>
        ];
        return buttons;
    }

    render(){
        let {requiredRate,dataMinMax,headMinMax, bodyMinMax,isDisableViewRate} = this.state;
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        var currency_code = (this.state.currencyCode)? this.state.currencyCode : null;
        var accordion = (this.state.Acordions)? this.state.Acordions : null;
        var CheckBox = (this.state.CheckBox)? 
            <Modal
                openButton={{ icon : "settings", iconClass : "center",
                buttonClass : "btn waves-effect waves-light"}} 
                defaultButton={{click: e => this.closeModalEdit, buttonClass: "waves-effect waves-light btn btn-warning hollow", text:"CLOSE"}}
                //showFooter={true}
                onRef={modal => this.refModal = modal}
            >
                <div className="row">
                    <div className='col s12 m12 l12'>
                        <h5 >Room types: </h5>
                    </div>
                    <CleverForm
                        ref={ref => this.formCheck = ref}
                        id={'form-check'}
                        data={{ roomChecks: this.state.defaultChecks, }}
                        forms={[
                            {
                                fieldset: false,
                                title: "",
                                inputs: [
                                    {row: this.state.CheckBox },
                                    /* {row:[
                                        {type:'component', component:() =>{
                                            return ( <CleverButton size={'col s12 m3 l3'} label={'Aceptar'} fullSize={true} onClick={this.closeModalEdit}/> );
                                        }},
                                    ]} */
                                ]
                            }
                        ]}
                    />
                </div>
            </Modal> : <i className="material-icons">settings</i>

        return (
            <div>
                <CleverLoading show={this.state.load}/>
                <Panel icon=" " bold={true} capitalize={true} title=" ">
                    <div className="row">
                        <div className="col s12 m12 l12">
                            <CleverForm
                                ref={ref => this.formFilters = ref}
                                id={'form-crossout'}
                                data={this.state.dataForm}
                                forms={[
                                    {
                                        fieldset: false,
                                        title: "",
                                        inputs: [
                                            {row:[
                                                {type:'select', autocomplete:true, options: this.state.ratePlans, onChange: this.handlerSelected, size:'col s12 m4 l4',name:'rate_plan',label:'* Current Rate Plan', placeholder:'Select Rate Plan', required: requiredRate},
                                                {type:'component', component:() =>{
                                                    return ( <div className='col s12 m2 l2' style={{padding:"18px"}}>
                                                        <label style={{fontSize: 'inherit'}} name='currency_code'>Rate Plan Currency: { currency_code }</label>
                                                    </div> );
                                                }},
                                                { type: 'date', colDate: 'col s12 m2 l2', id: 'datepiker', placeholder: '', name: 'date_start', labelDate: 'Date from'},
                                                {type:'select', autocomplete:true, options: this.state.Market, onChange: this.handlerSelectedMarket, size:'col s12 m4 l4',name:'market',label:'Market' },
                                            ]},
                                            {row:[
                                                {type:'select', autocomplete:true, options: this.state.Country, onChange: this.handlerSelectedCountry, size:'col s12 m3 l3',name:'country',label:'Country'},
                                                {type:'select', autocomplete:true, options: this.state.Currency, onChange: this.handlerSelectedCurrency, size:'col s12 m3 l3',name:'currency',label:'Convert to Currency'},
                                                {type:'component', component:() =>{
                                                    return ( <div className='col s12 m1 l1' style={{padding:"18px"}}>
                                                        {CheckBox}
                                                    </div> );
                                                }},
                                                { type: 'button', size: 'col s12 m2 l2', label: 'view rate', fullSize: true, onClick: e=>this.sendData('') ,disabled:isDisableViewRate},
                                                {type:'component', component:() =>{
                                                    return ( <div className='col s12 m1 l1' style={{marginLeft: '10px', marginTop: '16px'}}>
                                                        <label name='min_max'>Min LOS and Max LOS</label>
                                                    </div> );
                                                }},
                                                { type: 'button', size: 'col s12 m1 l1', label: '',
                                                icon:'arrow_circle_up', fullSize: true, onClick: this.openModalMinMax }
                                            ]}
                                        ]
                                    }
                                ]}
                            />
                        </div>
                        <div className='col s12 m1 l1' style={{marginTop: '16px'}}>
                                {/* {ModalMinMax} */}
                                <Modal 
                                    addButtons={this.getConfigAddButtonsModal()}
                                    idModal="minMaxLos"
                                    isFull={true}
                                    onRef={modal => this.refModalMinMax = modal}
                                >
                                    <div className="row">
                                        <div className='col s12 m12 l12'>
                                            <h5>Min and Max LOS Override</h5>
                                        </div>
                                        <CleverForm
                                            ref={ref => this.formMinMax = ref}
                                            id={'form-min-max'}
                                            data={dataMinMax}
                                            forms={[
                                                {
                                                    fieldset: false,
                                                    title: "",
                                                    inputs: [
                                                        {row: [
                                                            {type:'number', size:'col s12 m5 l5', name:'min', label:'Min los', placeholder:'* Min los'},
                                                            {type:'number', size:'col s12 m5 l5', name:'max', label:'Max los', placeholder:'* Max los'},
                                                            { type: 'date', colDate: 'col s12 m5 l5', name: 'dateBegin', labelDate: 'Date from', placeholder:'Date from'},
                                                            { type: 'date', colDate: 'col s12 m5 l5', name: 'dateEnd', labelDate: 'Date end', placeholder:'Date end'},
                                                        ] },
                                                    ]
                                                }
                                            ]}
                                        />

                                        <h4>&nbsp;</h4>
                                        {headMinMax && bodyMinMax ?
                                            <div className="row">
                                                <CleverAccordion
                                                    id={'collapsible-min-max'}
                                                    accordion={
                                                        {
                                                            head: headMinMax,
                                                            body: [bodyMinMax]
                                                        }
                                                    }

                                                />
                                            </div> 
                                        :null
                                        }
                                    </div>
                                </Modal>
                            </div>                           
                    </div>
                </Panel>
                <div className="row">
                    {accordion}
                </div>
            </div>
        );
    };

    handlerSelected(e){
        this.setState({isDisableViewRate:true});
        let { responseRate } = this.state;
        let currency_code = '';

        responseRate.map((i, k)=>{
            if (i.idop_rateplan == e.value) {
                currency_code = <b style={{color: "#739698"}}>{i.currency_code}</b>;
            }
        })
        this.setState({ CheckBox: '', roomTypes: null, allRoom: null, idRatePlan: e.value, currencyCode: currency_code });
        let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;

        CleverRequest.get(CleverConfig.getApiUrl('bengine') +`/api/room-type-category/rate-plan/get/${idProperty}/${e.value}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!response.error) {
                    if (response.data.length > 0) {
                        let Room_types_Check = [];
                        let Default_Check = [];
                        
                        response.data.map((i, key) => {
                            Room_types_Check.push( {type:'checkbox',size:'col s12 m4 l4',name:'roomChecks',
                            checkboxs:[ {value:String(i.room_code), label:i.room_description + ' ( '+ i.room_code + ' )'},]} );

                            Default_Check.push( String(i.room_code) );
                        })

                        this.setState({
                            allRoom: response.data, 
                            CheckBox:  Room_types_Check,
                            defaultChecks: Default_Check,
                        },()=>{ this.setState({isDisableViewRate:false})});
                    }else{
                        MComponentes.toast('Data empty');
                    }
                }else{
                    MComponentes.toast(response.error);
                }
            }else{
                MComponentes.toast(error);
            }
        });
    }

    handlerSelectedMarket(e){
        this.setState({ load: true, idMarket: e.value });
        let URL = (e.value == 0)? "/api/country/get" : "/api/country/get?market=" + e.value;
        
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + URL, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ loader: false });
                return
            }
            if (!response.Error) {
                if (response != null) {
                    let country = [];
                            
                    country.push( {value: "", option: 'Select country'} );
                    response.data.map((i, key) => {
                        country.push( {value: i.country_code, option: i.name} );
                    })
                    this.setState({ idCountry: "", responseCountry: response.data, Country: country, load: false });
                }
                this.setState({loader: false})
            }
            else {
                this.setState({loader:false})
                MComponentes.toast("ERROR in country");
            };
        });
    }

    handlerSelectedCountry(e){
        // console.log('Country: ', e);
        this.setState({ idCountry: e.value });
    }

    handlerSelectedCurrency(e){
        // console.log('Currency: ', e);
        this.setState({ idCurrency: e.value });
    }

    ChangeSwitch(e){
        let status = '';
        let name = this.state[e.target.name];
        if (name == true) {
            status = false;
        } else if (name == false) {
            status = true;
        }
        this.crossout = status;
        this.setState({ [e.target.name]: status })
    }

    openModalMinMax(){
        this.setState({load:true},()=>{
            this.clearModalMinMax(()=>{
                this.refModalMinMax.getInstance().open();
                this.setState({load:false})
            });
        });
    }

    clearModalMinMax(functionClearMinMax=()=>{}){
        let {arrayChecked}=this.state;
        let date = new Date();
        let dateNow = moment(date).format('YYYY-MM-DD');

        arrayChecked.forEach((dataChecks)=>{
            let splitIdRoom = dataChecks.split('_');
            let nameChecked = splitIdRoom[0];
            document.getElementById(`${nameChecked}`).checked = false;
        });

        document.getElementById(`form-min-max-dateBegin`).value = dateNow;
        document.getElementById(`form-min-max-dateEnd`).value = dateNow;
        this.setState({
            dataMinMax:{
                min:"", max:"", dateBegin:dateNow, dateEnd:dateNow
            },
            arrayChecked:[]
        },functionClearMinMax);
    }

    closeModalEdit() {
        return this.refModal.getInstance().close();
    }
};