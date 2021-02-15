import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { CleverAccordion, Panel, CleverRequest, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../config/CleverConfig";
import GeneralDescriptions from './generalDescriptions/GeneralDescriptions';

export default class Main extends Component {
    constructor(props){
        super(props)
        const hotelSelected = localStorage.getItem("hotel")
        this.state={
            hotelSelected : hotelSelected ? true : false,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
        }
       this.load = this.load.bind(this);
    }

    componentDidMount(){
        this.setState({ load: true });
        this.getItemsAcordion();
    }


    getItemsAcordion(){
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> } else {
            let property = this.state.hotelData.iddef_property;
            CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/property-desc-type/get?all=${property}`, (response, error) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (!error) {
                    if (response.Error == false) {
                        let heads = [], body = {};
        
                        response.data.map((item, index) => {
                            if (item.estado == 1) {
                                const collapsibleName = `description-${index}`;
                                const containerControls = <div className="row">
                                    <button type='button' ref={this[`refForm${index}`] = React.createRef()} id={`refForm${index}`} className='btn'>SAVE CHANGES</button>
                                </div>
                                
                                const head = {id: item.iddef_description_type, accordion: collapsibleName, label: item.description , controls: [{ control: containerControls }] };
                                heads.unshift(head);
                                body[collapsibleName] = <GeneralDescriptions reference={this[`refForm${index}`]} id_type={item.iddef_description_type} load={this.load}/>;
                            }
                        });

                        this.setState({ Acordions: <CleverAccordion 
                            id={'test-collapsible'}
                            accordion={
                                {
                                    head: heads.sort(function (a, b) {
                                        if (a.id > b.id) {
                                        return 1;
                                        }
                                        if (a.id < b.id) {
                                        return -1;
                                        }
                                        // a must be equal to b
                                        return 0;
                                    }),
                                    body: [body],
                                }
                            }
                        
                        /> });
                    }
                }
            });
        }
    }

    load(estado){
        this.setState({ load: estado });
    }

    render() {
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        return (
            <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine">
            <CleverLoading show={this.state.load}/>
                {this.state.Acordions}
            </Panel>
        );
    }
}
