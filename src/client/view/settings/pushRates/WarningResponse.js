import React, { Component }  from 'react';
import {GridView} from 'clever-component-library';

export default class WarningResponse extends Component  {

    constructor(props) {
        super(props);
        
        this.refWarning = React.createRef();
        this.getWarnings = this.getWarnings.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
            warning:{}
        }
    }

    componentDidMount() { 
        this.getWarnings(this.props.dataWrgs);
    }

    getWarnings(dataWarning){        
        let warnings=[];
            dataWarning.map((data)=>{
                let info={};
                info.information = data;
                warnings.push(info);
            });
            this.refWarning.setDataProvider(warnings); 
    }

    render(){
        return(
            <div>
               <GridView 
                    idTable={'table-itemsWarning'+this.props.indexWrgs}
                    serializeRows={true}
                    onRef={grid => this.refWarning = grid}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                                { attribute : 'information', alias : 'Information' },                              
                    ]}
                />
            </div>
        )
    }

}

WarningResponse.defaultProps = {
    dataWrgs:[]
}