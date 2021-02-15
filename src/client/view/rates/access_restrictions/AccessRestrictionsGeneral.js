import React from 'react';
import { CleverAccordion } from 'clever-component-library';
import Restrictions from './restrictions/Restrictions';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.btnPrimaryContact = React.createRef();
        this.btnAddRestriction = React.createRef();
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
        }
    }

    render() {
        return (
            <div className='row'>
                <CleverAccordion id={'test-collapsible'} accordion={{
                    head:[
                            { 
                                accordion: 'accessrestrictions', label: 'LIST RESTRICTIONS', controls: [{ control:
                                    <button type='button' ref={this.btnAddRestriction} id="btnAddRestriction" className='btn'>ADD RESTRICTION</button>
                                }]
                            },
                        ],
                    body:[
                        {
                            accessrestrictions: <Restrictions refButton={this.btnAddRestriction}/>,
                        }
                    ],
                }}
                />
            </div>
        );
    };
};