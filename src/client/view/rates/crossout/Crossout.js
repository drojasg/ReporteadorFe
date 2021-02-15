import React from 'react';
import { CleverAccordion } from 'clever-component-library';
import DetailCrossout from './DetailCrossout';

export default class Crossout extends React.Component {
    constructor(props) {
        super(props);
        this.btnAddCrossout = React.createRef();
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
        }
    }

    render() {
        return (
            <div className='row'>
                <CleverAccordion  id={'test-collapsible'} accordion={{
                    head: [
                            {
                                accordion: 'crossout', label: 'CROSSOUT', controls: [{ control: 
                                <button type='button' ref={this.btnAddCrossout} id="btnAddCrossout" className='btn'>ADD CROSSOUT</button> }]
                            },
                        ],
                    body: [
                        {
                            crossout: <DetailCrossout refButtonAdd={this.btnAddCrossout}/>,
                        }
                    ],
                }}
                />
            </div>
        );
    };
};