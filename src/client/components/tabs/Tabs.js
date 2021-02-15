import React from 'react';
import PropTypes from 'prop-types';

import { uniqueID } from 'clever-component-library/build/node/Util';

import { MComponentes } from 'clever-component-library';

import './tabs.css';

export default class Tabs extends React.Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            tabs : {
                head : [],
                body : {}
            },
        };
    };

    componentDidMount()
    {
        this.changeStateTabs(this.props.tabs);
    };

    componentDidUpdate(prevProps,prevstate)
    {
        if (prevProps.tabs != this.props.tabs)
        {
            this.changeStateTabs(this.props.tabs);
        }
    };

    changeStateTabs(tabs)
    {
        this.setState({
            tabs : tabs,
        },() => {
            MComponentes.Tabs('ul[id='+this.props.id+'].tabs',{
                swipeable:true});
        });
    };

    render() 
    {
        return (
            <div>
                <ul id={this.props.id} className='tabs tabs-fixed-width'>
                    {
                        this.state.tabs.head.map((head,keyHead) => {
                            return(
                                <li key={'tab-'+keyHead} className='tab'>
                                    <a href={'#tab-'+head.tab} className={keyHead == 0 ? 'active' : ''} >{head.label}</a>
                                </li>
                            );
                        })
                    }
                </ul>
                {
                    Object.keys(this.state.tabs.body).map((body,keyBody) => {
                        return(
                            <div id={'tab-'+body} key={'content-'+keyBody}>
                                {this.state.tabs.body[body]}
                            </div>
                        );
                    })
                }
            </div> 
        );
    };
};

Tabs.propTypes = {
    id : PropTypes.string,
    tabs : PropTypes.object,
};

Tabs.defaultProps = {
    id : uniqueID(),
    tabs : {
        head : [],
        body : {}
    },
};