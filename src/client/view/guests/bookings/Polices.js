import React, { Component } from "react";
import { CleverLoading } from "clever-component-library";

export default class Polices extends Component {
    
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : true,
        }
        this.contentDiv = new Array();
    }

    componentDidMount(){
        this.setData(this.props.dataPolices);
    } 

    setData(dataPolices){
        let _title = '';
        let _text = '';
        
        dataPolices.map((item, index) => {
            _title = item.policy_category;
            _text = item.texts;
        });

        this.setState({
            load: false,
            title: _title,
            text: _text
        });
    }
   
    render() {
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <h6>{this.state.title}</h6>
                <hr style={{ width: "100%", backgroundColor: "#018bb6", height: "1px" }}></hr>
                <div className="row" style={{marginTop: '2rem'}}>
                    <div className="col" dangerouslySetInnerHTML={{__html: this.state.text ? this.state.text : ""}}></div>
                </div>
            </>
        );
    }   
}

Polices.defaultProps = {
    dataPolices: {}
}