import React, { Component } from 'react'
import { Card } from 'clever-component-library'
import Brands from './Brands'

export default class BrandsGeneral extends Component {
    constructor(props) {
        super(props);
        this.btnAddConfig = React.createRef();
        this.state={
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
    }

    render() {
        return (
            <>
            <Card id={'card-brands-configuration'} header={'Brands configuration'} control={
                    <button type='button' ref={this.btnAddConfig} id="btnAddConfig" className='btn btn-small'>
                        <i className={'material-icons right'}>add</i>
                        Add new
                    </button>
            }>
                <Brands btnAddConfig={this.btnAddConfig}></Brands>
            </Card>
            </>
        )
    }
}
