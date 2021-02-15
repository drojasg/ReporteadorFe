import React from 'react'
import { CleverAccordion } from 'clever-component-library'
import RatePlan from './ratePlan/RatePlan'
import "./ratePlan/css.css"

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.btnPrimaryContact = React.createRef();
        this.btnAddRatePlan = React.createRef();
        this.btnSearchRatePlan = React.createRef();
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
                            accordion: 'rateplan', label: 'LIST OF RATE PLANS', controls: [{ control: 
                                <></>
                            }]
                        },
                    ],
                    body: [
                        {
                            rateplan: <RatePlan refButton={this.btnAddRatePlan} refButtonSearch={this.btnSearchRatePlan} refEventSearch={this.getDataSearch}  refFormSearch={this.refFormSearch}/>,
                        }
                    ],
                }}
                />
            </div>
              
        );
    };
};