import React, { Component } from 'react'
import CleverConfig from "./../../../../config/CleverConfig"
import { CleverRequest } from 'clever-component-library'
import Thumbnail from '../thumbnail/Thumbnail'
import './propertiesSidebar.css'
import 'animate.css'

export default class PropertiesSidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: !this.props.isVisible,
            slideIn: ' animated slideInRight faster',
            slideOut: ' animated slideOutRight faster',
        }
    }
    
    componentDidMount() {
        this.getDataHotel();
    };

    getDataHotel() {
        CleverRequest.get(CleverConfig.getApiUrl('bengine') +"/api/property/get?all/", (response, error) => {
            if (!error) {
                let data = [];
                response.data.map(object => {
                    data.push({
                        size:'col s12 m6 l6',
                        titleHeader:object.estado == 1 ? 
                        <div className="valign-wrapper teal-text"><i className='material-icons'>fiber_manual_record</i><span> Open</span></div> 
                        : 
                        <div className="valign-wrapper red-text"><i className='material-icons'>fiber_manual_record</i><span> Close</span></div>,
                        subtitleHeader:'creation: 10 Sep, 2017',
                        titleBody:object.short_name,
                        subtitleBody:object.property_code,
                        body: object.brand,
                        image:object.image_url,
                        onClick:this.clickHotel.bind(this,object)
                    });
                });
                this.setState({dataThumbnails : data});
            }
            else
                console.log(error);
        });
    }

    clickHotel(hotel) {
        localStorage.setItem("hotel", JSON.stringify(hotel));
        window.location.reload();
    }
    
    render() {
        return (
            <div className="row" style={{marginBottom: 0}}>
                <div id="propertiesSidebar" className={"col s6 m6 l6 offset-s6 offset-m6 offset-l6 z-depth-3" + (this.state.isVisible ? this.state.slideIn : this.state.slideOut)}>
                    <Thumbnail thumbnails={this.state.dataThumbnails}></Thumbnail>
                </div>
            </div>
        )
    }
}
