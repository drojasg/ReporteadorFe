import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { CleverForm, CleverRequest, CleverNotification, MComponentes, CleverInputSelect} from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import { Item } from 'clever-component-library/build/react/tab';

export default class Add extends Component {
    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");    
        this.refFormView = React.createRef();
        this.getAgeRange = this.getAgeRange.bind(this);
        this.getDefaultPriceTypeList = this.getDefaultPriceTypeList.bind(this);
        
        this.state = {
            propertySelected: JSON.parse(hotelSelected),
            formAgeRange:[],
            dataForm:{},
            selectPriceType:[]
    
        }
    }
    
    componentDidMount() {
        //se relaciona el boton del colapse con el evento
        this.getAgeRange();
        this.getDefaultPriceTypeList();
    }

    getAgeRange() {
        const property_id = this.state.propertySelected.iddef_property;
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/age-range-propety/search/${property_id}/ES`, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let AgeRange = data.data;
                    console.log('getAgeRange '+AgeRange);
                }
            }
        });
    }

    getDefaultPriceTypeList() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+"/api/price-type/get", (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (!data.Error) {
                    let array = new Array();
                    data.data.map((item) => {
                        let value=item.iddef_default_price_type;
                        let option= item.description;
                        let op = {value:value, option:option}
                        array.push(op);
                    });
                    this.setState({ selectPriceType: array  });
                    console.log('getDefaultPriceTypeList '+ array);
                }
            }
        });
    }

    render() {
        return (
            <div className="row">
                <CleverForm 
                    id={'form-age-range'}
                    ref={ref => this.refFormView = ref}
                    data={this.state.dataForm}
                    forms={[
                        {
                            inputs: [
                                {
                                    row: [
                                        {
                                            type:'component', 
                                            component:() =>{
                                                return(
                                                    <div>
                                                        <div className='row'>
                                                            <div className='col s12 m6 l6'>
                                                                <label >Age-group name (english):</label>
                                                                <div >
                                                                    <div >
                                                                        <input type='number' name ='agegroupAdd' placeholder='Age-group name' ></input>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='col s12 m6 l6'>
                                                                <label >Age Range:</label>
                                                                <div>
                                                                    <div className='col s12 m3 l3'>
                                                                        <input type='number' name ='agefronAdd' placeholder='age from' ></input>
                                                                    </div>
                                                                    <div className='col s12 m1 l1 text-center'>
                                                                        <span> to </span>
                                                                    </div>
                                                                    <div className='col s12 m3 l3'>
                                                                        <input type='number' name ='agetoAdd' placeholder='age to' ></input>
                                                                    </div>
                                                                </div> 
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className='col s12 m6 l6'>
                                                                <label >Categoria de edad(español):</label>
                                                                <div >
                                                                    <div >
                                                                        <input type='number' name ='categoriaedadAdd' placeholder='Categoria de edad' ></input>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className='col s12 m6 l6'>
                                                                <div className='row'>
                                                                    <div className='col s12 m6 l6'>
                                                                        <div>
                                                                            <CleverInputSelect
                                                                                id={'input-amount'}
                                                                                label={'Default price:'}
                                                                                name={'selectdefault'}
                                                                                options={this.state.selectPriceType}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className='col s12 m3 l3'>
                                                                        <div >
                                                                            <input type='number' name ='pricevalueAdd' placeholder='Default price value' ></input>
                                                                        </div>
                                                                    </div>
                                                                    <div className='col s12 m3 l3'>
                                                                        <div >
                                                                            <span> % </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]}                    
                />
            </div>
        );
    }
}
