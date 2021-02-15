import React, { Component }  from 'react';
import {GridView} from 'clever-component-library';
import ItemResponsePush from './ItemResponsePush';

export default class DataResponsePush extends Component  {

    constructor(props) {
        super(props);
        
        this.refTableDataResponse = React.createRef();
        this.getData = this.getData.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
        }
    }

    componentDidMount() { 
        this.getData(this.props.data);
    }

    getData(data){        
        this.refTableDataResponse.setDataProvider(data);
    }

    render(){
        return(
            <div>
               <GridView 
                    idTable={'table-dataPushRates'+this.props.indexData}
                    serializeRows={true}
                    onRef={grid => this.refTableDataResponse = grid}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                                { attribute : 'Room_type_category', alias : 'Room type category'},
                                { attribute : 'Rate_Plan_Code', alias : 'Rate Plan Code' },
                                { attribute : 'Date_start', alias : 'Date Start' },
                                { attribute : 'Date_end', alias : 'Date End' },
                                { attribute : 'Msg', alias : 'Message Response' },
                                {
                                    alias : 'Items',
                                    expandCall : (data, index) => {
                                        return <ItemResponsePush dataItem={data.Items} indexItem={index}/>;
                                    }
                                }
                                
                    ]}
               />
            </div>
        )
    }

}