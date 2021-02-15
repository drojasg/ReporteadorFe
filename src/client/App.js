import React, { Component, Fragment } from 'react';
import { T } from 'clever-component-library';

class App extends Component {
    render() {
        return (
            <div className="row">
                <div className="col s12 m12">
                    <blockquote>
                        <h1><T t={'Welcome To Clever'} d={"{{'WELCOME_TO_CLEVER'}}"}/></h1>
                    </blockquote>
                </div>
            </div>
        );
    }
}

export default App;
