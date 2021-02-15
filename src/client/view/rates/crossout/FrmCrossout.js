import React, { Component } from 'react'
import CleverConfig from '../../../../../config/CleverConfig'
import {CleverForm, CleverRequest, MComponentes } from 'clever-component-library'
import './crossout.css'

export default class FrmCrossout extends Component {
    constructor(props) {
        super(props);
        this.getSystems = this.getSystems.bind(this);
        this.getDataCrossout = this.getDataCrossout.bind(this);
        this.getRestrictions = this.getRestrictions.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            listSystem:[],
            listRestriction:[],
            dataFrmCross:{}
        }
        this.TableMainCrossout = React.createRef();
    }

    componentDidMount() {        
        this.getSystems();
        this.getRestrictions();
    }

    getSystems= async () =>{
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/sistems/get`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let systems = [];                
                response.data.map((data) => {                   
                    let infoInput = {};
                    if(data.estado == 1){
                        infoInput.value = String(data.idop_sistemas);
                        infoInput.option = data.nombre
                        systems.push(infoInput);
                    } 
                                    
                });
                this.setState({ listSystem:systems});
            }
        });
    }
    
    getRestrictions= async () =>{
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/restriction/get`, (response, error) => {        
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let restrictions = [];                
                response.data.map((data) => { 
                    let infoInput = {};
                    if(data.estado == 1){
                        infoInput.value = String(data.iddef_restriction);
                        infoInput.option = data.name
                        restrictions.push(infoInput);
                    }                                    
                });
                this.setState({ listRestriction:restrictions});
            }
        });
    }
    
    getDataCrossout(){
        let dataRest = this.refFormCrossout.getData();
        let data = dataRest.values;
        let dataCross = {};  
        if (dataRest.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});

        } else {
            let listRestriction = [];
            dataCross.idop_cross_out_config = data.idop_cross_out_config !== ""  ? data.idop_cross_out_config : 0;
            dataCross.cross_out_name = data.cross_out_name;
            dataCross.id_sistema = parseInt(data.id_sistema);
            dataCross.percent = data.percent;

            if(data.restriction.length > 0){
                data.restriction.map((restricion)=>{ 
                    let data={};
                    data.iddef_restriction =parseInt(restricion);               
                    listRestriction.push(data);
                });
            }

            dataCross.restrictions = listRestriction;
        }

        return dataCross;
    }
   
    render() {
        return (
            <CleverForm
                id={'formModalCrossout'}
                ref={ref => this.refFormCrossout = ref}
                data={this.props.dataFrmCross}
                forms={[
                        { 
                        inputs:[                                  
                            {
                                row: [
                                        {type:'number',size:'col s16 m6 l6',name:'idop_cross_out_config',label:'', hidden:true},
                                        {type: 'select', size: 'col s6 m6 l6', placeholder:'Select System Name', label: '* System Name', name: 'id_sistema', options: this.state.listSystem,required: true,autocomplete:true},
                                        {type:'text',size:'col s6 m6 l6', placeholder:'Insert Crossout Name',label:'* Crossout Name',name:'cross_out_name',characters:true,alphanumeric:true,required: true},
                                    ]
                            },
                            {
                                row: [
                                        {type:'number',size:'col s16 m6 l6',name:'percent',label:'* Discount percentage', placeholder:'Insert Discount percentage', required: true},
                                        {type: 'select', size: 'col s12 m6 l6', name: 'restriction', label: '* Restriction', placeholder:'Select Restriction', 
                                            options: this.state.listRestriction, multiple:true,autocomplete:true,required: true }                                                        
                                ]
                            }
                        ]
                    }, 
                ]}                                        
            />
        )
    }
}
