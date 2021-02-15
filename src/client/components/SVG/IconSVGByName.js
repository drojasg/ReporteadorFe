import React, { Component,} from "react";
import './icons.css';

export default class IconsSVGByName extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }
    }

    componentDidMount(){
        // console.log("icon: ", this.props);        
    }

    render(){
        return(
            <div className="text-center">
                <svg 
                    style={
                        {width: this.props.width, 
                        height: this.props.height, 
                        fill: `${this.props.fill}`,
                        fontSize:40
                    }}
                    className={'styleSvgIcon'}
                >
                    <use  xlinkHref={`${this.props.objectSVG}#${this.props.nameSVG}`}></use>
                </svg>
            </div>   
        );
    }
}

IconsSVGByName.defaultProps = {
    width:'50px',
    height:'50px',
    fill:'#11ae92',
    objectSVG:'',
    nameSVG: ''
}