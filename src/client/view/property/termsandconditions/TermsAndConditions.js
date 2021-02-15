import React, { Component } from 'react';
import GeneralTermsAndConditions from './generalTermsAndConditions/GeneralTermsAndConditions';
import { Redirect } from 'react-router-dom'
import {CleverAccordion, Panel } from 'clever-component-library';

export default class Main extends Component {
    constructor(props){
        super(props)
        const hotelSelected = localStorage.getItem("hotel")
        this.state={
            hotelSelected : hotelSelected ? true : false,
        }
    }
    btnSaveChangesGeneralTerms = React.createRef();

    render() {
        if (this.state.hotelSelected === false) {
            return <Redirect to="/" />
        }
        return (
            <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine">
            <CleverAccordion 
                        id={'test-collapsible'}
                        accordion={
                            {
                                head:[
                                    {accordion:'view1',label:'GENERAL TERMS AND CONDITIONS', controls:[{control:<button type='button' ref={this.btnSaveChangesGeneralTerms} id="btnSaveChangesGeneralTerms" className='btn'>SAVE CHANGES</button>}]}
                                    
                                ],
                                body:[
                                    {
                                    view1:<GeneralTermsAndConditions reference={this.btnSaveChangesGeneralTerms}/>,
                                    //view2:<MarketingDescriptions reference={this.btnSaveChangesForPackageTravel}/>,
                                    //view3:<AttractionsDescriptions reference={this.btnSaveChangesPrivacyPolicy}/>,
                                    }
                                ],
                            }
                        }
                       
                    />
                    </Panel>
        );
    }
}
