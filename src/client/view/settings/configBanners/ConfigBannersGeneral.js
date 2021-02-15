import React from 'react';
import { Redirect } from 'react-router-dom';
import { CleverAccordion, CleverRequest, MComponentes } from 'clever-component-library';
import Details from './details/Details';
import FormContact from './contacts/FormContact';
import ContentGalery from '../../../components/galery/ContentGalery';

export default class Main extends React.Component 
{  
    constructor(props){
        super(props);
        this.btnSaveOrder = React.createRef();
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            propertySelected: JSON.parse(localStorage.getItem("hotel")),
            frmPrincipal:1,
            frmOthers:2
        }
    }

    componentDidMount(){
        
    }

    render() 
    {
        let {load,SelectedGalery,ItemsImages}= this.state;
        if (this.state.hotelSelected === false) 
        {
            return <Redirect to="/" />
        }

        return (
            
            <div className='row'>
                
                <CleverAccordion 
                
                    id={'banner-collapsible'}
                    accordion={{
                        head:[
                                {accordion:'orderImagesbanners',label:`Manage Banners`,
                                    controls:[{control:<button type='button' ref={this.btnSaveOrder} id="btnOrderProperty" className='btn'>SAVE ORDER</button>}]},
                            ],
                        body:[
                            {
                                orderImagesProperty: <ContentGalery refSaveOrder={this.btnSaveOrder}/>
                            }
                        ],
                    }}
                />
            </div>
        );
    };
};