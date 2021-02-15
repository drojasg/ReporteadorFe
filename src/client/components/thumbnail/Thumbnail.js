import React from 'react';
import PropTypes from 'prop-types';

import { uniqueID } from 'clever-component-library/build/node/Util';

import './thumbnail.css';

export default class Thumbnail extends React.Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            thumbnails : [],
        };
    };

    componentDidMount()
    {
        if (this.props.thumbnails != '')
        {
            this.changeStateThumbnails(this.props.thumbnails);
        }
    };

    componentDidUpdate(prevProps,prevState)
    {
        if (prevProps.thumbnails != this.props.thumbnails)
        {
            this.changeStateThumbnails(this.props.thumbnails);
        }
    };

    changeStateThumbnails(thumbnails)
    {
        this.setState({
            thumbnails : thumbnails,
        });
    };

    render() 
    {
        return (
            <div id={this.props.id} className='thumbnail'>
                {
                    this.state.thumbnails.map((thumbnail,keyThumbnail) => {
                        return(
                            <div key={'thumbnail-'+keyThumbnail} className={thumbnail.size} onClick={this.props.reveal == true ? '' : thumbnail.onClick}>
                                <div className={this.props.reveal == true ? 'card sticky-action hoverable' : 'card hoverable'}>
                                    {
                                        this.props.reveal == true
                                        ?
                                        null
                                        : 
                                        <div className='card-header'>
                                            <span>{thumbnail.titleHeader}</span>
                                            <span>{thumbnail.subtitleHeader}</span>
                                        </div>
                                    }
                                    {
                                        thumbnail.image != undefined
                                        ?
                                        <div className={this.props.reveal == true ? 'card-image waves-effect waves-block waves-light' : 'card-image'}>
                                            <img className={this.props.reveal == true ?'activator' : ''} src={thumbnail.image}/>
                                        </div> 
                                        :
                                        <div className={this.props.reveal == true ? 'card-icon waves-effect waves-block waves-light activator' : 'card-icon'}>
                                            <i className={ 'material-icons large'}>{thumbnail.icon != undefined ? thumbnail.icon : 'image'}</i>
                                        </div>
                                    }
                                    {
                                        this.props.reveal == true
                                        ?
                                        <div className="card-reveal">
                                            <span className="card-title"><i className="material-icons right">close</i></span>
                                            <h5>{thumbnail.titleBody}</h5>
                                            <h6>{thumbnail.subtitleBody}</h6>
                                            <p>{thumbnail.body}</p>
                                            {thumbnail.actions}
                                        </div>
                                        :
                                        <div className="card-content center-align">
                                            <div style={{height:60}}>
                                                <h5>{thumbnail.titleBody}</h5>
                                                <h6>{thumbnail.subtitleBody}</h6>
                                            </div>
                                            <br/>
                                            <p>{thumbnail.body}</p>
                                        </div>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        );
    };
};

Thumbnail.propTypes = {
    id : PropTypes.string,
    reveal : PropTypes.bool,
    thumbnails : PropTypes.array,
    actions : PropTypes.array,
};

Thumbnail.defaultProps = {
    id : uniqueID(),
    reveal : false,
    thumbnails : [],
    actions : [],
};
