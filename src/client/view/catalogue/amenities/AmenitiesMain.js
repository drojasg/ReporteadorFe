import React, { Component }  from 'react';
import { CleverAccordion,CleverInputSelect } from 'clever-component-library';
import CatalogueAmenities from './amenity/CatalogueAmenities';
import CatalogueGroupAmenities from './groupAmenitie/CatalogueGroupAmenitie';
import CatalogueTypeAmenities from './typeAmenitie/CatalogueTypeAmenity';

export default class AmenitiesMain extends Component  {
    constructor(props) {
        super(props);
        this.ChangeOptionAmenitie = this.ChangeOptionAmenitie.bind(this);
        this.btnAddAmenities = React.createRef();
        this.btnAddGroupAmenities = React.createRef();
        this.btnAddTypeAmenities = React.createRef();

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
            listHead:[],
            isVisibleAmenitie:false,
            isVisibleGroup:false,
            isVisibleTYpe:false,
        }
    }

    componentDidMount() {    
        let optionInitial = ['1'];
        this.getAccordion(optionInitial);
    }

    getAccordion(valuesOption){
        let amenitieshead= {accordion:'amenities',label:'AMENITY',controls:[{control:<button type='button' 
                                            ref={this.btnAddAmenities} id="btnAddAmenities" className='btn'>ADD AMENITY</button>}]};
        let grouphead = {accordion:'groupAmenities',label:'GROUP AMENITY',controls:[{control:<button type='button' 
                                            ref={this.btnAddGroupAmenities} id="btnAddGroupAmenities" className='btn'>ADD GROUP</button>}]};
        let typehead = {accordion:'typeAmenities',label:'TYPE AMENITY',controls:[{control:<button type='button' 
                                            ref={this.btnAddTypeAmenities} id="btnAddTypeAmenities" className='btn'>ADD TYPE</button>}]};
                                                    
        let listAmenitiHead = [];        
        valuesOption = valuesOption.sort();
        valuesOption.map((option)=>{ 
            switch(option){
                case '1':
                        listAmenitiHead.push(amenitieshead); 
                    break;
                case '2':
                        listAmenitiHead.push(grouphead);
                    break;
                case '3':
                        listAmenitiHead.push(typehead);
                    break;
            }
        });

        this.setState({
                        listHead:listAmenitiHead,                        
                    },()=>{this.setState({options:valuesOption})});
    }

    ChangeOptionAmenitie(e){
        let valuesOption = e.values;
        
        this.setState({
            listHead:null,
        });

        this.getAccordion(valuesOption);
    }

    render(){  
        let {options,listHead} =this.state;
        return(
            <div className='row'>
                <div >
                    <CleverInputSelect
                        id = {'ViewsAmenities'}
                        size = {'input-field col s12 m6 l6'}
                        label = {'Options'}
                        name = {'tipViewAmenitie'}
                        options = {[
                            {value:'1',option:'AMENITY'},
                            {value:'2',option:'GROUP AMENITY'},
                            {value:'3',option:'TYPE AMENITY'}
                        ]}
                        defaultValues={options}
                        multiple={true}
                        onChange = {this.ChangeOptionAmenitie}
                    />
                </div>
                {listHead ? 
                    <div >
                    <CleverAccordion 
                        id={'collapsible-Amenities'}
                        accordion={{
                        head:listHead,
                        body:[
                            {
                                amenities:<CatalogueAmenities refButtonAddAmenity={this.btnAddAmenities}/>,
                                groupAmenities:<CatalogueGroupAmenities refButtonAddGroup={this.btnAddGroupAmenities}/>,
                                typeAmenities:<CatalogueTypeAmenities refButtonAddType={this.btnAddTypeAmenities}/>,
                            }
                            ],
                        }}
                    />   
                                                     
                </div>
                :null}
            </div>            
        );

    }
}