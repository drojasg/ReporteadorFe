import React from 'react';
import { Redirect } from 'react-router-dom';
import { Panel, CleverForm, CleverLoading, MComponentes, GridView, CleverMethodsApi, CleverButton, ConfirmDialog } from 'clever-component-library';
import CleverConfig from "../../../../../config/CleverConfig";
import Modal from '../../../components/modal/Modal';

export default class MainSystem extends React.Component {

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            load: false,
            status: 'CREATE',
        }
        this.openCreateModalSystem = this.openCreateModalSystem.bind(this);
        this.openModalSystem = this.openModalSystem.bind(this);
        this.addEditSystems = this.addEditSystems.bind(this);
        this.deleteSystem = this.deleteSystem.bind(this);
    }

    componentDidMount(){
        this.getSystems();
    }

    getSystems(){
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/sistems/get?all',(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    this.TableSystems.setDataProvider(response.data);
                    this.setState({ load: false });
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
 
    addEditSystems(status, dataForm){
        let formValues = this.formSystem.getData().values
        if (status == 'ADD') {
            let data = { "nombre": formValues.nombre, "estado": 1 };

            this.createSystem(data);
        } else if (status == 'EDIT') {
            let data = { "nombre": formValues.nombre };
            
            this.updateSystem(data, dataForm.idop_sistemas);
        }
    }

    deleteConfigConfirm(){
        let { changeSystem } = this.state;
        let newState = (changeSystem.estado == 1)? 0 : 1;
        let data = {"estado": newState, "nombre": changeSystem.nombre};

        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/sistems/update-status/"+changeSystem.idop_sistemas, data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getSystems();
                    MComponentes.toast(response.Msg);
                } else{
                    MComponentes.toast('Error update');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
    }

    createSystem(data){
        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/sistems/create", data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getSystems();
                    MComponentes.toast(response.Msg);
                } else{
                    MComponentes.toast('Error create');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
        this.modalAddEdit.closeModal();
    }

    updateSystem(data, id){
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/sistems/update/"+id, data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getSystems();
                    MComponentes.toast(response.Msg);
                } else{
                    MComponentes.toast('Error update');
                    this.setState({ load: false });
                }
            } else{
                MComponentes.toast('Error api');
                this.setState({ load: false });
            }
        });
        this.modalAddEdit.closeModal();
    }

    render(){
        let { btnModalSystems } = this.state;
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        return (
            <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine">
                <CleverLoading show={this.state.load}/>
                <div className='row'>
                    <CleverButton size={'col s12 m2 l2'} label={'Add new'} fullSize={true} onClick={this.openCreateModalSystem}/>
                </div>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteConfigConfirm()}}
                />
                <GridView
                    idTable={'table-Systems'}
                    floatHeader= {true}
                    onRef={ref => this.TableSystems = ref}
                    serializeRows={false}
                    filter={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    columns={[
                        { attribute : 'idop_sistemas', alias : 'Id sistemas'},
                        { attribute : 'nombre', alias : 'Nombre'},
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            value: (data, index) => {
                                return (
                                    <div> 
                                        <a onClick={(e) => this.openModalSystem(data)} title='Edit Group'><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a onClick={(e) =>this.deleteSystem(e, data)} 
                                                title='Disable Group'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a onClick={(e) =>this.deleteSystem(e, data)} 
                                                title='Enable Group'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }
                                    </div>)
                            }
                        }
                    ]}
                />
                <div className="row">
                    <Modal id={"modalEditAdd"} title={'Systems'} ref={ref => this.modalAddEdit = ref} btnAction={btnModalSystems}>
                        <CleverForm
                            ref={ref => this.formSystem = ref}
                            id={'form-refundable'}
                            data={ this.state.dataSystem }
                            forms={[
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {row:[
                                            {type:'text', size:'col s12 m4 l4', name:'nombre', label:'* Name', placeholder:'Insert name', required:true},
                                        ]},
                                    ]
                                },
                            ]}
                        />
                    </Modal>
                </div>
            </Panel>
        );
    };

    openModalSystem(data){
        this.setState({ dataSystem: data, btnModalSystems: { label:"Edit", icon:"edit", onClick:() => {this.addEditSystems('EDIT', data)} } })
        this.modalAddEdit.openModal();
    }
    openCreateModalSystem(){
        this.setState({ dataSystem: {nombre: ''}, btnModalSystems: { label:"Add", icon:"edit", onClick:() => {this.addEditSystems('ADD', '')} } })
        this.modalAddEdit.openModal();
    }

    deleteSystem(e,data){
        this.refConfirm.getInstance().open()
        this.setState({ changeSystem: data})
    }
};