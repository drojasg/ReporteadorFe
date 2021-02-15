import React, { Component } from 'react';
import {GridView} from 'clever-component-library';


export default class ViewsFilters extends Component  {
    constructor(props) {
        super(props);
        
        this.state = {           
            load : false,
        }
    }

    componentDidMount() {    
        this.TableFilter.setDataProvider(this.props.dataFilter);
    }

    render(){ 
        return(
            <div >
                <GridView
                    idTable={`tableCatalogueFilter${this.props.type}`}
                    floatHeader= {true}
                    onRef={ref => this.TableFilter = ref}
                    serializeRows={true}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={false}
                    columns={[
                                { attribute : 'iddef_filters', visible : false },
                                { attribute : 'name', alias : 'Filter name'},                                                        
                                {
                                    attribute: 'actions',
                                    alias: 'Actions',
                                    filter: false,
                                    value: (data, index) => {
                                        return (
                                            <div> 
                                                <a onClick={(e) => this.props.openModal(data.iddef_filters)} title='Edit Filter'><i className='material-icons left'>mode_edit</i></a>
                                                
                                                {data.estado == 1 ?
                                                    <a onClick={(e) =>this.props.onDelete(e, data)} 
                                                        title='Disable Filter'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) =>this.props.onDelete(e, data)} 
                                                        title='Enable Filter'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                }        
                                            </div>)
                                    }
                                }
                            ]}                  
                    />                                                     
            </div>
        );
    }

}

ViewsFilters.defaultProps = {
    onDelete: () => {},
    openModal: () => {}
}