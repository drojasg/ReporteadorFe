import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverAccordion } from 'clever-component-library';
import Services from './servicesDetail/Services';

export default class ServiveGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.btnAddService = React.createRef();
        const hotelSelected = JSON.parse(localStorage.getItem("hotel"));
        this.state = {
            hotelSelected : hotelSelected ? true : false,
        }
    }
    
    render() {
        if (this.state.hotelSelected === false) {
            return <Redirect to="/" />
        }
        return (
            <div className='row'>
                <CleverAccordion 
                    id={'test-collapsible'}
                    accordion={{
                        head:[
                            { accordion: 'view1', label: 'Services', controls:[{control:<button type='button' ref={this.btnAddService} id="btnAddService" className='btn'>Add Service</button>}] },
                        ],
                        body:[
                            {
                                view1: <Services btnAddService={this.btnAddService} />,
                             
                            }
                        ],
                    }}
                />
            </div>
        )
    }
}