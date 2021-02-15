import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverRequest, Panel, CleverLoading, CleverForm, GridView, Modal, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";

export default class MainBooking extends React.Component 
{  

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
        }
        this.sendData = this.sendData.bind(this);
    }
    formFilters = React.createRef();
    formModal = React.createRef();
    TableMain = React.createRef();

    componentDidMount(){
        this.setState({ load: true });
        this.getAllProperty();
    }
    
    getAllProperty(){
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +"/api/property/get?all/", (response, error) => {
            if (!error) {
                if (!response.Error && response.data.length > 0) {
                    let optionProperty = [];

                    response.data.map((i, k)=>{
                        optionProperty.push( {"value":i.iddef_property, "option":i.short_name} );
                    })

                    this.setState({ optionProper: optionProperty, load: false })
                }
            }
        });
    }
    
    sendData(){
        this.setState({ load: true });
        let filtrosData = this.formFilters.getData();
        filtrosData = filtrosData.values;
        console.log(filtrosData);

        this.getDataTable(filtrosData.types);
    }

    getDataTable(data){
        //Consimo API para optener datos que pinten el GridView
        // this.TableMain.setDataProvider(dataTable);
        this.setState({ load: false});

        this.refModalAdd.getInstance().open()
    }

    getButtonsModal() {
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.getDataForm(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    render(){
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        
        return (
            <React.Fragment>
                <CleverLoading show={this.state.load}/>
                <Panel icon=" " bold={true} capitalize={true} title=" ">
                    <div className='row'>
                        <CleverForm
                            ref={ref => this.formFilters = ref}
                            id={'form-filter'}
                            forms={[
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {
                                            row:[
                                                {type:'select', size:'col s12 m3 l3', name:'iddef_property', label:'Property',
                                                options: this.state.optionProper},
                                                {type:'select', size:'col s12 m3 l3', name:'iddef_status', label:'Status',
                                                options: this.state.optionProper},
                                                
                                                { type: 'button', size: 'col s12 m2 l2', label: 'view booking', fullSize: true, onClick: this.sendData },
                                            ]
                                        }
                                    ]
                                }
                            ]}
                        />
                    </div>
                    <GridView
                        idTable='table-booking'
                        pagination={50}
                        serializeRows={true}
                        columns={[
                            { attribute : 'idcontr_contrato_vario', visible : false },
                            { attribute : '', alias : 'ID'},
                            { attribute : '', alias : 'Guest Name'},
                            { attribute : '', alias : 'Email'},
                            { attribute : '', alias : 'Booking Date'},
                            { attribute : '', alias : 'Travel Window'},
                            { attribute : '', alias : 'Nights'},
                            { attribute : '', alias : 'Pax'},
                            { attribute : '', alias : 'Guest Country'},
                            { attribute : '', alias : 'Total Amount'},
                            { attribute: 'actions',
                                alias: 'Actions',
                                filter: false,
                                value : (data) => {
                                    return (<div>
                                        <a href="javascript:void(0)" onClick={e=>this.handlerChange(data)}>
                                            <i className='material-icons left'>visibility</i>
                                        </a>
                                        <a href="javascript:void(0)" onClick={e=>this.handlerChange(data)}>
                                            <i className='material-icons left'>mode_edit</i>
                                        </a>
                                    </div>);
                                }
                            }
                        ]}
                        onRef={ref => this.TableMain = ref}
                    />

                </Panel>

                <Modal
                    addButtons={this.getButtonsModal()}
                    idModal="addRestriction"
                    isFull={true}
                    onRef={modal => this.refModalAdd = modal} >
                        <CleverForm
                            ref={ref => this.formModal = ref}
                            id={'form-modal'}
                            forms={[{
                                inputs: [
                                    {
                                        row: [
                                            { type: 'button', disabled: true, size: 'col s12 m1 l1', label: 'status', fullSize: true },
                                            {type: 'component', component: () => {
                                                return (
                                                    <h5 className="col s12 m6 l6">{'CODE'}</h5>
                                                )
                                            }
                                        }],
                                    },
                                    {
                                        row: [
                                            {
                                                type: 'component', component: () => {
                                                    return (
                                                        <hr style={{ backgroundColor: "#018bb6", height: "1px" }}></hr>
                                                    )
                                                }
                                            }
                                        ],
                                    },
                                    {
                                        row:[
                                            {type:'select', size:'col s12 m4 l4', name:'types', label:'',
                                            options:[
                                                {value:'ZHSP',option:'sun palace'},
                                                {value:'ZMGR',option:'the grand at mooon palace'},
                                                {value:'ZMNI',option:'moon palace cancun nizuc'},
                                                {value:'ZMSU',option:'moon palace cancun sunrise'},
                                                {value:'ZHBP',option:'beach palace'},
                                            ]},
                                        ]
                                    }
                                ]
                            }]}
                        />
                </Modal>
            </React.Fragment>
        );
    };
};