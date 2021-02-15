
import React, { Component } from "react";
import {Datepicker} from "clever-component-library";
import PropTypes from 'prop-types';

export default class FrmDates extends Component {
    
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.props.onRef(this);
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            isVisible:false,
            dateValue:''
        }
    }

    componentDidMount(){
        // console.log('PROPS DATES',this.props);
        this.setState({            
            dateValue:this.props.dateValue,
            titleDate:this.props.nameDate,
            sizeContent: this.props.sizeContent,
            idFrm: this.props.idFrm,
            placeholderText: this.props.placeholderText
        },()=>{
            this.setState({isVisible:true});            
        });
    }

    getValueDates(){
        let valDate="";
        let idForm = this.state.idFrm;        
        valDate = document.getElementById(`${idForm}`).value;        
        return valDate;
    }

    render(){  
        let {dateValue,titleDate,sizeContent,idFrm,placeholderText,isVisible} = this.state;
        
        return(
            <div className={sizeContent}>
                
                <div style={{fontSize:'10%'}}>
                {titleDate ? 
                    <h6 style={{fontSize:"12px", color:"#5b5b5b" ,marginTop:'0px',marginBottom:'0px'}}>
                        {titleDate}
                    </h6>
                :null} 
                </div>
                {isVisible == true? 
                    <div className="row" style={{marginTop:'0px',marginBottom:'0px'}}>
                        <Datepicker
                            defaultValue={dateValue}
                            colDate={'col s12 m12 l12'}
                            name={`${idFrm}`}
                            id={`${idFrm}`}
                            onChange={e=>this.props.changeDate(e,idFrm)}
                            placeholder={placeholderText}
                        />               
                    </div>
                :null}                 
                
            </div>
        );
    }
}

FrmDates.propTypes = {
    onRef: PropTypes.func,
    changeDate: PropTypes.func,
    nameDate: PropTypes.string,
    sizeContent: PropTypes.string,
    idFrm:PropTypes.string,
    placeholderText: PropTypes.string,
    dateValue: PropTypes.string
}

FrmDates.defaultProps = {
    onRef: () => {},
    changeDate:()=>{},
    nameDate:"",
    sizeContent:"col s12 m3 l3",
    idFrm:"Frm",
    placeholderText:"Select date",
    dateValue: ''
}