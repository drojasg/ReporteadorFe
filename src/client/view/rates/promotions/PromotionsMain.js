import React, { Component } from 'react'
import { CleverAccordion } from 'clever-component-library'
import PromotionGeneral from './promotion_general/PromotionGeneral'

class PromotionsMain extends Component {
    constructor(props) {
        super(props);
        this.btnAddPromotion = React.createRef();
        const hotelSelected = JSON.parse(localStorage.getItem("hotel"));
        this.state = {
            hotelSelected : hotelSelected ? true : false,
        }
    }
    
    render() {
        return (
            <div className='row'>
                <CleverAccordion id={'test-collapsible'} accordion={{
                        head:[ 
                            { 
                                accordion: 'view1', label: 'Promotions', controls: [{ control: 
                                    <button type="button" ref={this.btnAddPromotion} id={this.btnAddPromotion} to={'/rates/promotions/0'} className='btn'>Add Promotion</button>
                                }]
                            },
                        ],
                        body:[
                            {
                                view1: <PromotionGeneral btnAddPromotion={this.btnAddPromotion} />,
                             
                            }
                        ],
                    }}
                />
            </div>
        );
    }
}

export default PromotionsMain;