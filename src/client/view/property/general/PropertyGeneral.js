import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverAccordion, CleverRequest, MComponentes } from 'clever-component-library';
import Details from './details/Details';
import FormContact from './contacts/FormContact';
import ContentGalery from '../../../components/galery/ContentGalery';

export default class Main extends React.Component 
{  

    constructor(props){
        super(props);
        this.btnView1 = React.createRef();
        this.btnPrimaryContact = React.createRef();
        this.btnPrincipalContact = React.createRef();
        this.btnSaveContact = React.createRef();
        this.btnAddContact = React.createRef();
        this.btnSaveOrder = React.createRef();
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
            frmPrincipal:1,
            frmOthers:2
        }
    }

    componentDidMount(){
        
    }

    render() 
    {
        let {load,SelectedGalery,ItemsImages}= this.state;
        const containerControls = <div className="row">
            <div className="col l6 m6 s6">
                <button type='button' ref={this.btnSaveContact} id="SaveChangeContactExtra" className='btn' >SAVE CHANGES</button>
            </div>
            <div className="col l6 m6 s6">
                <button type='button' ref={this.btnAddContact} id="addContact" className='btn'>ADD CONTACT</button>
            </div>
        </div>

        if (this.state.hotelSelected === false) 
        {
            return <Redirect to="/" />
        }

        return (
            
            <div className='row'>
                
                <CleverAccordion 
                
                    id={'test-collapsible'}
                    accordion={{
                        head:[
                                {accordion:'facilityDetails',label:'ACCOMODATION FACILITY DETAILS',controls:[{control:<button type='button' ref={this.btnView1} id="btnView1" className='btn'>SAVE CHANGES</button>}]},
                                {accordion:'primaryContact',label:'PRIMARY CONTACT DETAILS',controls:[{control:<button type='button' ref={this.btnPrincipalContact} id="btnPrincipalContact" className='btn'>SAVE CHANGES</button>}]},
                                {accordion:'otherContactView',label:'OTHER CONTACT DETAILS',controls:[{control:containerControls}]},                              
                                {accordion:'orderImagesProperty',label:`IMAGES`,
                                    controls:[{control:<button type='button' ref={this.btnSaveOrder} id="btnOrderProperty" className='btn'>SAVE ORDER</button>}]},
                            ],
                        body:[
                            {
                                facilityDetails:<Details reference={this.btnView1}/>,
                                primaryContact:<FormContact
                                                    refSaveData ={this.btnPrincipalContact}
                                                    tipoFrm={this.state.frmPrincipal}
                                                />,
                                otherContactView:<FormContact 
                                                    refAddFrmContact={this.btnAddContact}
                                                    refSaveData={this.btnSaveContact} 
                                                    tipoFrm={this.state.frmOthers}
                                                />,
                                orderImagesProperty: <ContentGalery refSaveOrder={this.btnSaveOrder}/>
                            }
                        ],
                    }}
                />
            </div>
        );
    };
};