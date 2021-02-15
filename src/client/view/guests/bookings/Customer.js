import React, { Component } from "react";
import { CleverLoading, CleverForm } from "clever-component-library";

export default class Customer extends Component {
    
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : true,
        }
    }

    componentDidMount(){
        this.setData(this.props.dataCustomer);
    } 

    setData(dataCustomer){
        var FormHTML = (
            <fieldset style={{ margin: '12px', paddingTop: '12px', paddingBottom: '10px' }}>
                <div className='row'>
                    <div className='col s12 m6 l6'>
                        <label><b>Name: </b></label>
                        <label>{dataCustomer.title +' '+ dataCustomer.first_name +' '+ dataCustomer.last_name}</label>
                    </div>

                    <div className='col s12 m6 l6'>
                        <label><b>Birthdate: </b></label>
                        <label>{dataCustomer.birthdate}</label>
                    </div>
                    <h6>&nbsp;</h6>
                    <div className='col s12 m6 l6'>
                        <label><b>Phone: </b></label>
                        <label>{dataCustomer.phone_number}</label>
                    </div>

                    <div className='col s12 m6 l6'>
                        <label><b>Email: </b></label>
                        <label>{dataCustomer.email}</label>
                    </div>
                    <h6>&nbsp;</h6>
                    <div className='col s12 m6 l6'>
                        <label><b>Country: </b></label>
                        <label>{dataCustomer.address.country_code}</label>
                    </div>

                    <div className='col s12 m6 l6'>
                        <label><b>State: </b></label>
                        <label>{dataCustomer.address.state}</label>
                    </div>
                    <h6>&nbsp;</h6>
                    <div className='col s12 m6 l6'>
                        <label><b>City: </b></label>
                        <label>{dataCustomer.address.city}</label>
                    </div>

                    <div className='col s12 m6 l6'>
                        <label><b>Address: </b></label>
                        <label>{dataCustomer.address.address}</label>
                    </div>
                    <h6>&nbsp;</h6>
                    <div className='col s12 m6 l6'>
                        <label><b>Zip Code: </b></label>
                        <label>{dataCustomer.address.zip_code}</label>
                    </div>

                    <div className='col s12 m6 l6'>
                        <label><b>Street: </b></label>
                        <label>{dataCustomer.address.street}</label>
                    </div>
                </div>
            </fieldset>
        );


        this.setState({ load: false, Form: FormHTML });
    }
   
    render(){
        let { load, Form }= this.state;   

        return(
            <div className="row">
                <CleverLoading show={load}/>
                <div className="col s12 m12 l12">
                    <p style={{ float: "left" }}>CUSTOMER INFORMATION</p>
                    <h6>&nbsp;</h6> <hr style={{ width: "80%", float: "left", backgroundColor: "#018bb6", height: "1px" }}></hr>
                    <h2>&nbsp;</h2> 
                    {Form}
                </div>
            </div>
        );
    }   
}

Customer.defaultProps = {
    dataCustomer: {}
}