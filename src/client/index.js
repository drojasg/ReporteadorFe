import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRutas from './routes';
import { CleverLayout } from 'clever-component-library';

const sistema = "bengine";

render(
    <Router>
        <CleverLayout sistema={sistema}>
            <AppRutas sistema={sistema}/>
        </CleverLayout>
    </Router>
    ,
  document.getElementById('root')
);
