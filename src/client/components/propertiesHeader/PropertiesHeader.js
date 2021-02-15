import React, { Component } from 'react'
import PropertiesSidebar from '../propertiesSidebar/PropertiesSidebar'
import Header from '../header/Header'
import OutsideClickHandler from 'react-outside-click-handler'

export default class PropertiesHeader extends Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");    
        this.state = {
            propertySelected: JSON.parse(hotelSelected),
            isVisible: false,
        }
    }

    showSidebar = (e) => {
        this.setState({isVisible: true});
        this.props.isVisible;
    }

    hideSidebar = (e) => {
        this.setState({isVisible: false});
        this.props.isVisible;
    }
    
    render() {
        return (
            this.state.propertySelected && this.props.globalOption != true ? 
            <div className="row">
                <Header title={this.state.propertySelected.short_name} controls={[{control:<button type='button' id="btnChangeProperty" className='btn' onClick={this.showSidebar}>CHANGE PROPERTY</button>}]}/>
                { 
                this.state.isVisible && 
                (
                    <OutsideClickHandler onOutsideClick={this.hideSidebar}>
                        <PropertiesSidebar></PropertiesSidebar>
                    </OutsideClickHandler>
                ) 
                }
            </div>
            :
            <div className="row">
                <Header title="All properties"/>
            </div>
        )
    }
}
