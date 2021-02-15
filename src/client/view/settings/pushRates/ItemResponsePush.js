import React, { Component }  from 'react';
import {GridView} from 'clever-component-library';
import WarningResponse from './WarningResponse';

export default class ItemResponsePush extends Component  {

    constructor(props) {
        super(props);
        
        this.refTableItemResponse = React.createRef();
        this.getDataItem = this.getDataItem.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
        }
    }

    componentDidMount() { 
        this.getDataItem(this.props.dataItem);
    }

    getDataItem(data){    
        let listData = [];  
        data.map((data)=>{
            let information={}; 
            information.msg    = data.msg;
            information.paxes  = data.paxes;
            information.group  = data.group;
            information.amount = data.amount;
            information.warning  = data.wrgs;
            information.status = String(data.status);
            listData.push(information);
        });
         
        this.refTableItemResponse.setDataProvider(listData);
    }

    render(){
        return(
            <div>
               <GridView 
                    idTable={'table-itemsPushRates'+this.props.indexItem}
                    serializeRows={true}
                    onRef={grid => this.refTableItemResponse = grid}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                                { attribute : 'msg', alias : 'Message Response' }, 
                                { attribute : 'paxes', alias : 'Paxes'},
                                { attribute : 'group', alias : 'Group' },
                                { attribute : 'amount', alias : 'Amount' },
                                { attribute : 'status', alias : 'Status' },
                                // {
                                //     alias : 'Warning',
                                //     expandCall : (data, index) => {
                                //         return <WarningResponse dataWrgs={data.warning} indexWrgs={index}/>;
                                //     }
                                // }
                                                              
                    ]}
               />
            </div>
        )
    }

}


ItemResponsePush.defaultProps = {
    dataItem:[]
}