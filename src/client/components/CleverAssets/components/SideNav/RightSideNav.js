// sideRightNav
import React, { Component,Fragment } from 'react';
import PropTypes from 'prop-types';
import './sidenavgallery.css';

class RightSideNav extends Component {
    constructor(props) {

        super(props);
        this._isMounted = false;

        this.state ={
            open:false,
            error:false,
            errorInfo: null,
        }

        this.handleNavClose=this.handleNavClose.bind(this);

    }

    componentDidMount() {
        /*
        this.setDefaultValues();
        this.props.onRef(this);
        document.addEventListener('mousedown', this.handleClick, false);
        */
    }

    componentDidCatch(error, info) {
        this.setState({
            error: error,
            errorInfo: info
        });
    }

    componentDidUpdate(prevProps) {
        /* if (this.props.data !== prevProps.data) {
            // this.fetchData(this.props.userName);
            return this.setState({data: this.props.data});
        }*/
    }

    /**
     * Metodo que muestra el error cachado del componente
     * @return html element
     */
    getCatchError(){
        return (
            <React.StrictMode>
                <div className="col s12">
                    <h3>Oh-no! Something went wrong</h3>
                    <p className="red" style={{color:'white'}} >
                        {this.state.error && this.state.error.toString()}
                    </p>
                    <div>Component Stack Error Details:</div>
                    <p className="red" style={{color:'white'}}>
                        {this.state.errorInfo.componentStack}
                    </p>
                </div>
            </React.StrictMode>
    );
    }

    handleNavClose(e){
        document.getElementById(this.props.id).style.width = "0%";
    }

    render() {
        const {selected, open, error} = this.state;
        const {title, id} = this.props;


        if (error){
            return <React.StrictMode> (<this.getCatchError/>) </React.StrictMode>;
        }else{
            return (
                <React.StrictMode>
                    <div id={id} className="gallery-overlay">
                        <div className="gallery-overlay-content">
                            <a className="closebtn" onClick= {this.handleNavClose}>&times;</a>
                            <div className="section">
                                <h5 style={{paddingLeft: "10px"}}>{title}</h5>
                            </div>
                            <div className="divider side-divider-gallery "></div>
                            <div className="section content-assets-01">
                                <div className="col s12 m12 l12 xl12">
                                    {this.props.children}
                                </div>
                            </div>
                        </div>
                    </div>
                </React.StrictMode>
            );
        }
    }
}
RightSideNav.propTypes = {
    id    : PropTypes.string,
    title : PropTypes.string,
    open  : PropTypes.bool,
}


RightSideNav.defaultProps = {
    id    : "clv-side-right-nav",
    title : "Gallery Contente List",
    open  : false
}

export default RightSideNav;
