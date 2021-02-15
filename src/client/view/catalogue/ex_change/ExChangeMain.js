import React from 'react'
import { CleverAccordion } from 'clever-component-library'
import ExChange from './ExChange'

export default class ExChangeMain extends React.Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            hotelSelected: hotelSelected ? true : false,
        }
    }

    render() {
        return (
            <div className='row'>
                <CleverAccordion id={'test-collapsible'} accordion={{
                    head: [
                        {
                            accordion: 'rateplan', label: 'EXCHANGE RATE', controls: [{ control: 
                                <h3></h3>
                            }]
                        },
                    ],
                    body: [
                        {
                            rateplan: <ExChange />,
                        }
                    ],
                }}
                />
            </div>
              
        );
    };
};