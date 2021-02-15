import React, { Component } from 'react';
import { GridView, CleverRequest, Modal, CleverForm, Chip, ConfirmDialog, CleverButton, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import axiosRequest from './../../../../axiosRequest';



class Rooms extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loader:false,
            rooms:[]
        }
    }

    componentDidMount(){
        this.getRoomsList();
    }

    getRoomsList() {
        this.setState({loader:true})
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/room-type_category/get/list/property/${this.props.data.iddef_property}/${this.props.idRatePlan}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response != null) {
                    var rooms = []
                    var options = []
                    for (let index = 0; index < response.data.length; index++) {
                        if(response.data[index].estado == 1 ){
                             rooms.push(String(response.data[index].iddef_room_type_category))
                        }
                        options.push({ value: String(response.data[index].iddef_room_type_category), label: String(response.data[index].room_description) })
                    }
                    this.setState({ roomsByHotelSelect: options , rooms: rooms })
                }
                this.setState({ loader: false })
            }
            else {
                MComponentes.toast("ERROR room type");
                console.log(error)
                this.setState({ loader: false })
            };
        });
    }
    render() {
        return (
            <React.Fragment>
            {this.state.roomsByHotelSelect ?
                <CleverForm
                    data={this.state}
                    id={"refFormRoom"}
                    ref={ref => this.refFormRoom = ref}
                    
                    forms={[
                        {
                            inputs: [
                                {
                                    row: [
                                        { type: 'checkbox', size: 'col s12 m6 l6', label: 'Rooms', name: 'rooms',onChange:(e) => this.props.onChangeRooms(e, this.props.index, this.props.data.iddef_property ), checkboxs: this.state.roomsByHotelSelect }
                                    ],
                                },
                            ]
                        }
                    ]}
                />
                    :null  
                }
                   <CleverLoading show={this.state.loader} />
                </React.Fragment>
        );
    }
}

export default Rooms;