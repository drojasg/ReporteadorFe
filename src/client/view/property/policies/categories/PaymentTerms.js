import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { DatePicker, CleverLoading, CleverButton, GridView, CleverForm, ConfirmDialog, CleverEditor, CleverMethodsApi, CleverInputCheckBox, MComponentes,Chip, Panel } from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";
import { Card, CleverRequest} from 'clever-component-library'
import ShowFormPaymentsTerms from './ShowFormPaymentTerms';

export default class PaymentTerms extends Component {
    constructor(props) {
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.handlerAddBase = this.handlerAddBase.bind(this);
        this.handlerAdd = this.handlerAdd.bind(this);

        this.state = {
            hideForm: false,
            load: true,
            hiddenTablaForm: true,
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            hotelSelected : hotelSelected ? true : false,
            dataEdit: null,
        };
    }

    componentDidMount(){
        this.setState({ dataForms: {}, addEditStatus: 'ADD' });
        this.createTable();
        this.getCancellationBase();
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.handlerAdd)
           : null;
     }

     handlerAdd(){
        this.setState({hiddenTablaForm: false, dataEdit: null});
     }

     handlerAddBase(tipo){
        if (tipo == 'close'){
            this.setState({hiddenTablaForm: true});
            //Editar
            this.getCancellationBase();
        }else{
            this.setState({hiddenTablaForm: false});
        }
    }

    getCancellationBase(){
        this.setState({ load: true });
        //Editar, Get All
        
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+'/api/policy_payment/get?all',(response,error) => {
            
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    this.TablePaymentTerms.setDataProvider(response.data);
                    this.setState({ hiddenTablaForm: true, load: false, });
                } else {
                    this.setState({ load: false });
                    console.error(error);
                }
            } else {
                this.setState({ load: false });
                console.error(error);
            }
        });
    }

    openDetailsPolice(data){
        this.setState({hiddenTablaForm: false, dataEdit: data});
    }

    //Cambiar el status
    deleteCancellationPolicy(e,data) {
        this.refConfirm.getInstance().open();
        this.setState({ deletePolicy: data });
    }
    deletePolicyConfirm(e) {
        let iddef_policy_payment = Number(this.state.deletePolicy.iddef_policy_payment);
        
        let estado = this.state.deletePolicy.estado == 1 ? 0 : 1;
        
        CleverRequest.put(CleverConfig.getApiUrl('bengine')+'/api/policy_payment/change_status/'+iddef_policy_payment+'/'+estado,{},(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }

            if (!error) {
                this.getCancellationBase();
                this.refConfirm.getInstance().close();
            } else {
                console.log(error);
                MComponentes.toast("ERROR");
            }
        });
    }

    createTable(){
        var GridHtml = <GridView
            idTable={'table-payment-terms'}
            floatHeader= {true}
            onRef={ref => this.TablePaymentTerms = ref}
            serializeRows={false}
            filter={false}
            classTable={'clever-table responsive-table striped bordered'}
            columns={[
                { attribute : 'iddef_policy_payment', visible : false },
                { attribute : 'policy_code', alias : 'Policy code'},
                {
                    attribute: 'actions',
                    alias: 'Actions',
                    value: (data, index) => {
                        return (
                            <div> 
                                <a onClick={(e) => this.openDetailsPolice(data)} title='Edit'><i className='material-icons left'>mode_edit</i></a>
                                {data.estado == 1 ?
                                    <a onClick={(e) =>this.deleteCancellationPolicy(e, data)} 
                                        title='Disable Policy'><i className='material-icons left'  >toggle_on</i></a>
                                    :
                                    <a onClick={(e) =>this.deleteCancellationPolicy(e, data)} 
                                        title='Enable Policy'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                }
                            </div>)
                    }
                }
            ]}
        />

        this.setState({ grid: GridHtml, hiddenTablaForm: true });
    }

    render() {
        let { hotelSelected, load, hiddenTablaForm, grid, dataEdit }= this.state;
        //if (!hotelSelected){ return <Redirect to="/"/> }

        return (
            // <Panel icon=" " bold={true} capitalize={true} title="Base Cancellation Policies">
            <div className="row">
                <CleverLoading show={load}/>
                <ConfirmDialog
                    onRef={defaultconfirm => this.refDefaultConfirm = defaultconfirm}
                    yesButton={{click:(e) => this.setDefaultConfirm()}}
                />
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{click:(e) => this.deletePolicyConfirm()}}
                />

                <CleverForm
                    ref={ref => this.formFilters = ref}
                    id={'form-check'}
                    forms={[
                        {
                            inputs: [
                                hiddenTablaForm == true ?
                                    {row: [
                                        {
                                            type: 'component', component: () => {
                                                return (
                                                    <div /* className="row" */>
                                                        {grid}
                                                    </div>
                                                );
                                            }
                                        }
                                    ]}
                            :
                                {row:[
                                    {
                                        type: 'component', component: () => {
                                            return (
                                                <div className='col s12 m12 l12'>
                                                    <ShowFormPaymentsTerms onClose = {this.handlerAddBase} dataEdit={dataEdit}/>
                                                    {/* <label>hiokdkodkdek</label> */}
                                                </div>)
                                        }
                                    }
                                ]}  
                            ]
                        }
                    ]}
                />
            </div>
            // </Panel>
        );
    }





}