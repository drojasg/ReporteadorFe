import React, { Component } from 'react'
import { CleverAccordion } from 'clever-component-library'
import ConfigBooking from './ConfigBooking'

export default class ConfigBookingGeneral extends Component {
    constructor(props) {
        super(props);
        this.btnAddConfig = React.createRef();
        this.state={
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
    }

    render(){
        return(
            <>
            <CleverAccordion
                id={'accordion-booking-configuration'}
                accordion={{
                    head:[
                        {accordion:'configbooking', label:'Config Booking', controls:[{control:<button type='button' ref={this.btnAddConfig} id="btnAddConfig" className='btn'>Add new</button>}]}
                    ],
                    body:[
                        {
                            configbooking:<ConfigBooking btnAddConfig={this.btnAddConfig}></ConfigBooking>,
                        }
                    ],
                }}
            />
            </>
        )
    }
}

