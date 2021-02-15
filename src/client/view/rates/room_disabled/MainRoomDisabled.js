import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverRequest, Panel, CleverForm, CleverLoading, MComponentes, Modal, CleverAccordion, CleverInputCheckbox, CleverButton } from 'clever-component-library';//CleverAccordion
import CleverConfig from "../../../../../config/CleverConfig";
import CalendarRooms from './CalendarRooms'
import moment from 'moment';

export default class MainRoomDisabled extends React.Component 
{  
    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            load: true,
            listRoom: [],
            acordions: null,
            disabledSearch:true
        }
        this.handlerSelected = this.handlerSelected.bind(this);
        this.createCollapsible = this.createCollapsible.bind(this);
        this.crossout = false;
    }

    componentDidMount(){
        if(this.state.hotelSelected){
            this.setState({load: true});
            this.startPag();    
        }    
    }

    startPag(){
        let date = new Date();
        let dateNow = moment(date).format('YYYY-MM-DD');
        this.setState({frmSearch:{date_start:dateNow}});
        this.getRoomProperty();  
    }

    getRoomProperty(){       
        let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;
        
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + '/api/room-type-category/get?all=1&property=' + idProperty, (response, error) => {
            if (!error) {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ loader: false });
                    return
                }

                if (!response.error) {
                    let options = [];
                        response.data.map((roomCategory, k) => {
                            let nameRoom = roomCategory.room_description.find(x => x.lang_code.toLowerCase() == 'en');

                            options.push( {value: roomCategory.iddef_room_type_category, option: nameRoom.text} );
                        })

                        this.setState({ opRooms: options},()=>{
                            this.setState({load: false})
                        });                   
                } 
                else {
                    MComponentes.toast(response.Msg);
                    this.setState({ loader: false });
                }
            }else{
                this.setState({ loader: false });
            }
        });
    }

    createCollapsible(e){
        this.setState({heads:null,body:null,load: true},()=>{
            let {opRooms} = this.state;      
            let idProperty = JSON.parse(localStorage.getItem('hotel')).iddef_property;        
            let filtrosData = this.formFilters.getData();
            let valuesData= filtrosData.values;
            let validateDays = this.validateDays(valuesData.date_start);
            /**listRoom array de id's rooms seleccionados en el input
             * opRooms todos los rooms contenidos en el input select
             */
            let listRoom = valuesData.id_room.map(Number);        
            let headsContent = [];
            let bodyContent = {};
            
            if (listRoom.length > 0) {
                if (!validateDays.error) {
                    let findDataRates = [];                
                    findDataRates = opRooms.filter( rooms => listRoom.find(roomsSelected => rooms.value == roomsSelected) );  
                    
                    findDataRates.map((dataRoom, key) => {
                        let request = {
                            "property": String(idProperty),
                            "room": String(dataRoom.value),
                            "date_start": validateDays.data.start,
                            "date_end": validateDays.data.end };
                        
                        const collapsibleName = `room-${key}`;
                        const containerControls = <div className="row">
                            <div className="col s12 m6 l6">
                                <button type='button' ref={this[`refForm${key}`] = React.createRef()} id={`refForm${key}`} className='btn'>SAVE CHANGES</button>
                            </div>
                        </div>
                        
                        const head = {id: dataRoom.value, accordion: collapsibleName, label: dataRoom.option , controls: [{ control: containerControls }] };
                        headsContent.unshift(head);
                        bodyContent[collapsibleName] = <CalendarRooms reference={this[`refForm${key}`]} dates={validateDays.data} request={request} />;
                    });

                    this.setState({heads:headsContent,body:bodyContent},()=>{
                        this.setState({load: false});
                    });
                }
            }else{
                MComponentes.toast('Select room');
                this.setState({ load: false });
        }
        });  
        
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

    handlerSelected(e){
        e.values.length > 0 ? this.setState({disabledSearch:false}) : this.setState({disabledSearch:true});
    }

    render(){
        let {hotelSelected,frmSearch,opRooms,disabledSearch,heads,body}=this.state;
        if (hotelSelected === false) { return <Redirect to="/"/> }
        return (
            <div>
                <CleverLoading show={this.state.load}/>
                <Panel icon=" " bold={true} capitalize={true} title=" ">
                <div className="row">
                    <div className="col s12 m12 l12">
                        <CleverForm
                            data= {frmSearch}
                            ref={ref => this.formFilters = ref}
                            id={'form-crossout'}
                            forms={[
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {
                                            row:[
                                                {type:'select',size:'col s12 m4 l4',name:'id_room',label:'Room', multiple: true, 
                                                    options: opRooms,onChange: this.handlerSelected},
                                                { type: 'date', colDate: 'col s12 m2 l2', name: 'date_start',id: 'datepiker', required: true, placeholder: '', },
                                                { type: 'button', size: 'col s12 m2 l2', label: 'view rate', fullSize: true,
                                                    disabled:disabledSearch, onClick:e=>this.createCollapsible(e) },
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        />
                    </div>
                </div>
                </Panel>
                <div className="row">
                    {heads && body ? 
                        <CleverAccordion 
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
                        />
                    : null}
                </div>
            </div>
        );
    }
}