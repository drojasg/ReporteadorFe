import React, { Component } from 'react'
import { Card } from 'clever-component-library'
import Channels from './Channels'

export default class ChannelsGeneral extends Component {
    constructor(props) {
        super(props);
        this.btnAddConfig = React.createRef();
        this.state={
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
    }

    render(){
        return(
            <Card
                id={'card-channel-configuration'}
                header={'Channel configuration'}
                control={
                    <button type={'button'} ref={this.btnAddConfig} id={'btnAddConfig'} className={'btn btn-small'}>
                        <i className={'material-icons right'}>add</i>
                        add new
                    </button>
                }
            >
                <Channels btnAddConfig={this.btnAddConfig}></Channels>
            </Card>
        )
    }
}

