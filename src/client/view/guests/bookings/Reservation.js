import React, { Component } from "react";
import { CleverLoading, CleverForm } from "clever-component-library";

export default class Reservation extends Component {
    
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
        this.setData(this.props.dataReservation);
    } 

    setData(dataReservation){
        console.log("dataReservation: ", dataReservation);
        
        var FormHTML = (
            <div className='row'>
                <fieldset style={{ margin: '12px', paddingTop: '12px', paddingBottom: '10px' }}>
                    <div className='col s12 m6 l6'>
                        <label><b>Status: </b></label>
                        <label>{dataReservation.status}</label>
                    </div>
                    <div className='col s12 m6 l6'>
                        <label><b>Promo Code: </b></label>
                        <label>{dataReservation.promo_code}</label>
                    </div>
                </fieldset>
                
                <fieldset style={{ margin: '12px', paddingTop: '12px', paddingBottom: '10px' }}>
                    <div className='col s12 m4 l4'>
                        <label><b>Market Code: </b></label>
                        <label>{dataReservation.market_code}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>Currency: </b></label>
                        <label>{dataReservation.currency_code}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>Lang Code: </b></label>
                        <label>{dataReservation.lang_code}</label>
                    </div>
                    <h6>&nbsp;</h6>

                
                    <div className='col s12 m4 l4'>
                        <label><b>Adults: </b></label>
                        <label>{dataReservation.adults}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>Child: </b></label>
                        <label>{dataReservation.child}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>Nights: </b></label>
                        <label>{dataReservation.nights}</label>
                    </div>
                </fieldset>

                <fieldset style={{ margin: '12px', paddingTop: '12px', paddingBottom: '10px' }}>
                    <div className='col s12 m4 l4'>
                        <label><b>Creation Date: </b></label>
                        <label>{dataReservation.fecha_creacion}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>From Date: </b></label>
                        <label>{dataReservation.from_date}</label>
                    </div>
                    <div className='col s12 m4 l4'>
                        <label><b>To Date: </b></label>
                        <label>{dataReservation.to_date}</label>
                    </div>
                </fieldset>

                <fieldset style={{ margin: '12px', paddingTop: '12px', paddingBottom: '10px' }}>
                    <legend>Payment</legend>
                    <div className='col s12 m6 l6'>
                        <label><b>Card Type: </b></label>
                        <label>{dataReservation.payment.card_type}</label>
                    </div>
                </fieldset>
            </div>
        );


        this.setState({ load: false, Form: FormHTML });
    }
   
    render(){
        let { load, Form }= this.state;   

        return(
            <div className="row">
                <CleverLoading show={load}/>
                <div className="col s12 m12 l12">
                    <p style={{ float: "left" }}>RESERVATION INFORMATION</p>
                    <h6>&nbsp;</h6> <hr style={{ width: "80%", float: "left", backgroundColor: "#018bb6", height: "1px" }}></hr>
                    <h2>&nbsp;</h2> 
                    {Form}
                </div>
            </div>
        );
    }   
}

Reservation.defaultProps = {
    dataReservation: {}
}