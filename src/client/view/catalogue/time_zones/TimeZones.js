import React, { Component } from 'react'
import { Card } from 'clever-component-library'
import TimeZonesTable from './TimeZonesTable'

export default class TimeZones extends Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.btnAddTimeZone = React.createRef();
    }

    render() {
        return (
            <div className="row">                
                <Card id="id-card-timeZones" header={'Time zones'} control={
                    <button type="button" ref={this.btnAddTimeZone} id="id-btnAddTimeZone" className="btn btn-small">
                        <i className={'material-icons right'}>add</i>
                        add new
                    </button>
                }>
                    <TimeZonesTable btnAddTimeZone={this.btnAddTimeZone}></TimeZonesTable>
                </Card>
            </div>
        )
    }
}
