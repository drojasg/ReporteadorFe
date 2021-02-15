import React, { Component } from "react";
import { CleverLoading, CleverEditor } from "clever-component-library";

export default class Comments extends Component {
    
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
        this.setData(this.props.dataComments);
        console.log('dataComments: ', this.props.dataComments);
        
    } 

    setData(dataComments){
        console.log('dataComments', dataComments);
        let data = [];
        data.push( <div className='row' key={1}>
            <div className="col s12 m1 l1">
                <label><b>#</b></label>
            </div>
            <div className="col s12 m1 l1">
                <label><b>Date Create</b></label>
            </div>
            <div className="col s12 m8 l8">
                <label><b>Message</b></label>
            </div>
            <div className="col s12 m1 l1">
                <label><b>Source Text</b></label>
            </div>
            <div className="col s12 m1 l1">
                <label><b>Creation User</b></label>
            </div>
        </div> );

        dataComments.comments.map((item, key) => {
            let html = '';
            
            Object.keys(item).map((i, j) => {
                html = <div className='row' key={key+2}>
                    <div className="col s12 m1 l1">
                        <label>{key}</label>
                    </div>
                    <div className="col s12 m1 l1">
                        <label>{item.fecha_creacion}</label>
                    </div>
                    <div className="col s12 m8 l8">
                        <label>{item.text}</label>
                    </div>
                    <div className="col s12 m1 l1">
                        <label>{item.source}</label>
                    </div>
                    <div className="col s12 m1 l1">
                        <label>{item.usuario_creacion}</label>
                    </div>
                </div>;
            });
            data.push(html);
        });
        this.setState({ load: false, Form: data });
    }
   
    render(){
        let { load, Form }= this.state;   

        return(
            <div className="row">
                <CleverLoading show={load}/>
                <div className="col s12 m12 l12">
                    <h5>COMMENTS</h5>
                    <hr style={{ width: "100%", float: "left", backgroundColor: "#cad8d5", height: "1px" }}></hr>
                    {Form}
                </div>
            </div>
        );
    }   
}

Comments.defaultProps = {
    dataComments: {}
}