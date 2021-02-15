import React, { Component } from 'react';
import { CleverForm, MComponentes } from 'clever-component-library';


class Rooms extends Component {
    constructor(props) {
        super(props)
        this.state={
            rooms : []
        }
        

    }

    componentDidMount() {
        this.getRatePlanActive(this.props.ratePlans, this.props.idHotel, this.props.idRateplan)
    }

    getRatePlanActive(rateplans, idproperty, idRateplan) {
        for (let index = 0; index < rateplans.length; index++) {
            if (String(rateplans[index].iddef_property) == String(idproperty)) {

                for (let i = 0; i < rateplans[index].rate_plans.length; i++) {
                    if (String(rateplans[index].rate_plans[i].idop_rateplan) == String(idRateplan)) {
                        this.setState({ rooms: this.castArrayStringToNumber(rateplans[index].rate_plans[i].rate_plan_rooms, "USER") } )

                    }
                }
            }
        }
        this.getRoomsList()
    }

    getRoomsList() {
        var rooms = []
        var options = []
        for (let index = 0; index < this.props.data.length; index++) {
            if (this.props.data[index].estado == 1) {
                rooms.push(String(this.props.data[index].id_room))
            }
            options.push({ value: String(this.props.data[index].id_room), label: String(this.props.data[index].room_description) })
        }
        this.setState({ roomsByHotelSelect:  options} )
    }
    castArrayStringToNumber(arraytocast, type) {
        let newFormat = []
        //[1,2] -> ["1","2"]
        if (type == "USER") {
            arraytocast.map((arraytocast) =>
                newFormat.push(String(arraytocast))
            )
        }
        //["1","2"] -> [1,2]
        else if (type == "SYSTEM") {
            arraytocast.map((arraytocast) =>
                newFormat.push(Number(arraytocast))
            )
        }


        return newFormat
    }

    render() {

        return (
            <React.Fragment>
                {this.state.roomsByHotelSelect ?
                    <CleverForm
                        data={this.state}
                        id={`refFormRoom-${this.props.codeHotel}-${this.props.idRateplan}-${this.props.index}`}
                        ref={ref => this.refFormRoom = ref}
                        forms={[
                            {
                                inputs: [
                                    {
                                        row: [
                                            {
                                                type: 'checkbox', size: 'col s12 m6 l6', label: 'Rooms', name: 'rooms',
                                                onChange: (e) => this.props.onChangeDataGrid(e, this.props.idHotel,  this.props.idRateplan, this.props.indexAcordion), checkboxs: this.state.roomsByHotelSelect
                                            }
                                        ],
                                    },
                                ]
                            }
                        ]}
                    /> : null}
            </React.Fragment>
        );
    }
}

export default Rooms;