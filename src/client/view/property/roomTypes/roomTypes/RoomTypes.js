import React, { Component } from 'react';
import { GridView, Fragment, CleverRequest } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";

export default class RoomTypes extends Component {
    btnManageImages = React.createRef();
   constructor(props) {
       super(props)
       this.handlerChange = this.handlerChange.bind(this);
       this.referencia = React.createRef();
       this.state = {
           dataTable: '',
       }
   }

    componentDidMount() {
        this.getRooms();
        this.props.getRoom(this.request);

    }

    getRooms(){
        let property = 1;
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/room-type-category/get?property=`+ property, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                this.setState({ dataTable: response.data });
                console.warn(response.data);
            }
        });
    }

    handlerChange(data){
        console.warn("registro tabla: ",data);
    }


   render() {
        var instanceGrid = null;
       return (
        <div className="row">
            <GridView
                idTable='table-contracts-manuales'
                url={CleverConfig.getApiUrl('bengine') + '/api/room-type-category/get?property='+1}
                pagination={200}
                serializeRows={true}
                classTable={'responsive-table striped bordered'}
                filter={false}
                columns={[
                    { attribute : 'iddef_room_type_category', visible : false },
                    { attribute : 'room_description', alias : 'Room'},
                    { attribute : 'room_code', alias : 'Room code' },
                    { attribute : 'min_ocupancy', alias : 'Minimum' },
                    { attribute : 'standar_ocupancy', alias : 'Standard' },
                    { attribute : 'max_ocupancy', alias : 'Maximum' },
                    {attribute: 'actions',
                    alias: 'Actions',
                        value : (data) => {
                            return (<a href="javascript:void(0)" class="btn btn-primary" onClick={e=>this.handlerChange(data)}>
                                <i className="material-icons">mode_edit</i>
                            </a>);
                        }
                    }
                ]}
                onRef={grid => instanceGrid = grid}
            />
        </div>
       )
   }
}