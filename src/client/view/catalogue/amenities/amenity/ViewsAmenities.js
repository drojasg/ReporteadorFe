import React, { Component } from 'react';
import {GridView} from 'clever-component-library';


export default class ViewsAmenities extends Component  {
    constructor(props) {
        super(props);
        this.getDataTableAmenitie = this.getDataTableAmenitie.bind(this);
        this.getGridAmenity = this.getGridAmenity.bind(this);
        this.getGridType = this.getGridType.bind(this);
        this.getGridGroup = this.getGridGroup.bind(this);

        this.state = {           
            load : false,
        }
        this.TableAmenities = React.createRef();
        this.TableTypeAmenities = React.createRef();
        this.TableGroupAmenities = React.createRef();
    }

    componentDidMount() {    
        let valStatusAmenitie = this.props.dataGrid;  
        let tipGrid= this.props.tipGrid;      
        this.getDataTableAmenitie(valStatusAmenitie,tipGrid);
    }

    getDataTableAmenitie(dataGrid,tipGrid){         
        let grid={}; 
        switch(tipGrid){
            case 'amenity': 
                            grid=this.getGridAmenity();
                            this.setState({gridview:grid},()=>{
                                this.TableAmenities.setDataProvider(dataGrid);
                            });   
                break;

            case 'type': 
                            grid=this.getGridType();
                            this.setState({gridview:grid},()=>{
                                this.TableTypeAmenities.setDataProvider(dataGrid);
                            });   
                break;

            case 'group':
                            grid=this.getGridGroup();
                            this.setState({gridview:grid},()=>{
                                this.TableGroupAmenities.setDataProvider(dataGrid);
                            });     
                break;
        }
    }

    getGridAmenity(){
        return(
            <GridView
                    idTable={'table-ConfigAmenities'}
                    floatHeader= {true}
                    onRef={ref => this.TableAmenities = ref}
                    serializeRows={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={true}
                    columns={[
                                { attribute : 'iddef_amenity', alias : '#', visible : true },
                                { attribute : 'name', alias : 'Amenity name'},
                                { attribute : 'description', alias : 'Amenity Description' },                               
                                { attribute : 'amenity_group_name', alias : 'Amenity Group' },
                                { attribute : 'amenity_type_description', alias : 'Amenity Type' },
                                {
                                    attribute: 'actions',
                                    alias: 'Actions',
                                    filter: false,
                                    value: (data, index) => {
                                        return (
                                            <div> 
                                                {data.estado == 1 ?
                                                    <a onClick={(e) => this.props.openModalAmenitie(data.iddef_amenity)} title='Edit Amenity'><i className='material-icons left'>mode_edit</i></a>
                                                    :
                                                null
                                                }
                                                {data.estado == 1 ?
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data)} 
                                                    title='Disable Amenitie'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data)} 
                                                    title='Enable Amenitie'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                }        
                                            </div>)
                                    }
                                }
                            ]}                  
                />         
        );

    }

    getGridType(){
        return(
            <GridView
                    idTable={'table-ConfigType'}
                    floatHeader= {true}
                    onRef={ref => this.TableTypeAmenities = ref}
                    serializeRows={true}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={true}
                    columns={[
                                { attribute : 'iddef_amenity_type', visible : false },
                                { attribute : 'descripcion', alias : 'Type Amenity Description' },
                                {
                                    attribute: 'actions',
                                    alias: 'Actions',
                                    filter: false,
                                    value: (data, index) => {
                                        return (
                                            <div> 
                                                {data.estado == 1 ?
                                                    <a onClick={(e) => this.props.openModalAmenitie(data.iddef_amenity_type)} 
                                                    title='Edit Type'><i className='material-icons left'>mode_edit</i></a>
                                                    :
                                                null
                                                }
                                                {data.estado == 1 ?
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data,)} 
                                                    title='Disable Type'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data,)} 
                                                    title='Enable Type'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                }        
                                            </div>)
                                    }
                                }
                            ]}                  
                />         
        );

    }

    getGridGroup(){
        return(
            <GridView
                    idTable={'table-ConfigGroup'}
                    floatHeader= {true}
                    onRef={ref => this.TableGroupAmenities = ref}
                    serializeRows={true}
                    classTable={'clever-table responsive-table striped bordered'}
                    filter={true}
                    columns={[
                                { attribute : 'iddef_amenity_group', visible : false },
                                { attribute : 'name', alias : 'Group name'},
                                { attribute : 'description', alias : 'Group Description' },  
                                {
                                    attribute: 'actions',
                                    alias: 'Actions',
                                    filter: false,
                                    value: (data, index) => {
                                        return (
                                            <div> 
                                                {data.estado == 1 ?
                                                    <a onClick={(e) => this.props.openModalAmenitie(data.iddef_amenity_group)} title='Edit Group'><i className='material-icons left'>mode_edit</i></a>
                                                    :
                                                null
                                                }
                                                {data.estado == 1 ?
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data)} 
                                                        title='Disable Group'><i className='material-icons left'  >toggle_on</i></a>
                                                    :
                                                    <a onClick={(e) =>this.props.onDeleteAmenitie(e, data)} 
                                                        title='Enable Group'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                                }        
                                            </div>)
                                    }
                                }
                            ]}                  
                />         
        );

    }

    render(){ 
        return(
            <div >
                {this.state.gridview}  
            </div>
        );
    }

}

ViewsAmenities.defaultProps = {
    onDeleteAmenitie: () => {},
    openModalAmenitie: () => {}
}