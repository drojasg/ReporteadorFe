import React, { Component } from 'react'
import { CleverAccordion } from 'clever-component-library'
import Currency from './Currency'

export default class CurrencyGeneral extends Component {
    constructor(props) {
        super(props);
        this.btnAddCurrency = React.createRef();
        this.state={
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
    }

    render(){
        return(
            <>
            <CleverAccordion
                id={'accordion-currency-configuration'}
                accordion={{
                    head:[
                        {accordion:'currencyconfig', label:'Config Currency', controls:[{control:<button type='button' ref={this.btnAddCurrency} id="btnAddCurrency" className='btn'>Add new</button>}]}
                    ],
                    body:[
                        {
                            currencyconfig:<Currency btnAddCurrency={this.btnAddCurrency}></Currency>,
                        }
                    ],
                }}
            />
            </>
        )
    }
}

