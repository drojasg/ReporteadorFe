import React, { useState, useRef, useEffect } from 'react';
// import PortalAsset from './PortalAsset';
import {Card} from 'clever-component-library'

export function AssetManager(props) {
    return (
            <div className="col s12 m12 l12 xl12" >
                    {props.children}
            </div>
    )
}

export const Header = ({ children }) => (
    <div className="col s12 m12 l12 xl12">
        <Card isPanel={false} header={children}></Card>
    </div>
);

export const Body = ({ children }) => (
    <div id="clever-assets-management-body" className="col s12 m12 l12 xl12">
        {children}
    </div>
)
