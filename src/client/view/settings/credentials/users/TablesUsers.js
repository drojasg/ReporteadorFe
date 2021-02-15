import React, { Component } from 'react';
import { Dropdown } from 'clever-component-library';

export const columnsTableAuthItem = [
    {
        label: 'Item Name',
        key: 'item_name'
    },{
        label: 'Status',
        key: 'estado',
        value: (data) => 
        {
            return (data.estado == 1 ? 'Active' : 'Inactive');
        } 
    },{

        key: '',   
        label: 'Actions',   
            value: (data, event, posicion) => {
       
            const datos = [
                { "value": "", "text":"Edit", icon:"mode_edit"}
            ]

            return (
                <div>
                    {/* <a onClick={(e) => getCollapsible('CONTRACTS', data, index)}><i className='material-icons left'>folder</i></a>
                    <Dropdown  type='icon' data={datos} onChange={(e)=> {event(e,data)}}/> */}
                    {/*
                    <a data-position="top" data-tooltip="Edit" onClick={(e) => {event(e, data, posicion)}}>
                        <i className="material-icons">mode_edit</i>
                    </a>*/
                    }
                    {data.estado == 1 ?
                        <a onClick={(e) =>{event(e, data, posicion)}} 
                        title='Disable Permission'><i className='material-icons left'  >toggle_on</i></a>
                        :
                        <a onClick={(e) =>{event(e, data, posicion)}} 
                        title='Enable Permission'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                    }
                </div>
                );
            },  
        filter: false    
    }
];



columnsTableAuthItem.defaultProps = {
    onDeleteChild: () => {},
}