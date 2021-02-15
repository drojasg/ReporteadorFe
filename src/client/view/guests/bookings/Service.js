import React, { Component } from "react";
import { CleverLoading, CleverEditor } from "clever-component-library";

export default class Service extends Component {
    
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state = {
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            load : true,
        }
        this.refEditor = React.createRef();
    }

    componentDidMount(){
        this.setData(this.props.dataService);        
    } 

    setData(dataService){
        let data = [];
        data.push( <div className='row' key={1}>
            <div className="col s12 m1 l1">
                <label><b>#</b></label>
            </div>
            <div className="col s12 m2 l2">
                <label><b>Name</b></label>
            </div>
            <div className="col s12 m9 l9">
                <label><b>Description</b></label>
            </div>
        </div> );
        dataService.services_info.map((item, key) => {
            data.push( <div className='row' key={key+2}>
                <div className="col s12 m1 l1">
                    <label>{item.iddef_service}</label>
                </div>
                <div className="col s12 m2 l2">
                    <label>{item.name}</label>
                </div>
                <div className="col s12 m9 l9">
                    <label dangerouslySetInnerHTML={{__html: item.description ? item.description : ""}}></label>
                </div>
            </div> );
        });
        this.setState({ load: false, form: data });
    }
   
    render() {
        return (
            <>
                <CleverLoading show={this.state.load}/>
                <h6>SERVICE INFORMATION</h6>
                <hr style={{ width: "100%", backgroundColor: "#018bb6", height: "1px" }}></hr>
                <div className="row" style={{marginTop: '2rem'}}>
                    <div className="col">
                        {this.state.form}
                    </div>
                </div>

            </>
        );
    }   
}

Service.defaultProps = {
    dataService: {}
}