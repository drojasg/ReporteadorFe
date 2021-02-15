import React from 'react';
import { Redirect } from 'react-router-dom';
import { Panel, CleverForm, CleverLoading, MComponentes, GridView, CleverMethodsApi, CleverButton, ConfirmDialog } from 'clever-component-library';
import CleverConfig from "../../../../../config/CleverConfig";
import Modal from '../../../components/modal/Modal';

export default class MainChannelsType extends React.Component {

    constructor(props){
        super(props);
        const hotelSelected = localStorage.getItem("hotel");
        this.state ={
            hotelSelected : hotelSelected ? true : false,
            load: false,
            status: 'CREATE',
        }
        this.openCreateModalChannelType = this.openCreateModalChannelType.bind(this);
        this.openModalChannelType = this.openModalChannelType.bind(this);
        this.addEditChannelType = this.addEditChannelType.bind(this);
        this.deleteChannelType = this.deleteChannelType.bind(this);
    }

    componentDidMount(){
        this.getChannelType();
    }

    getChannelType(){
        CleverMethodsApi._getData(CleverConfig.getApiUrl('bengine')+'/api/channel-type/get?all',(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.data.length > 0) {
                    this.TableChannelType.setDataProvider(response.data);
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
 
    addEditChannelType(status, dataForm){
        console.log(dataForm);
        
        let formValues = this.formChannelType.getData().values
        if (status == 'ADD') {
            let data = { "name": formValues.name, "description": formValues.description, "estado": 1 };

            this.createChannelType(data);
        } else if (status == 'EDIT') {
            let data = { "name": formValues.name, "description": formValues.description, "estado": dataForm.estado };
            
            this.updateChannelType(data, dataForm.iddef_channel_type);
        }
    }

    deleteConfigConfirm(){
        let { changeChannelType } = this.state;
        let newState = (changeChannelType.estado == 1)? 0 : 1;
        let data = {"estado": newState, "name": changeChannelType.name, "description": changeChannelType.description};
        
        this.updateChannelType(data, changeChannelType.iddef_channel_type)
    }

    createChannelType(data){
        CleverMethodsApi._insertData(CleverConfig.getApiUrl('bengine')+"/api/channel-type/create", data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getChannelType();
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

    updateChannelType(data, id){
        CleverMethodsApi._updateData(CleverConfig.getApiUrl('bengine')+"/api/channel-type/update/"+id, data,(response,error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (Object.keys(response.data).length > 0) {
                    this.getChannelType();
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
        let { btnModalChannelType } = this.state;
        if (this.state.hotelSelected === false) { return <Redirect to="/"/> }
        return (
            <Panel icon="hotel" bold={true} capitalize={true} title="Booking Engine">
                <CleverLoading show={this.state.load}/>
                <div className='row'>
                    <CleverButton size={'col s12 m2 l2'} label={'Add new'} fullSize={true} onClick={this.openCreateModalChannelType}/>
                </div>
                <ConfirmDialog
                    onRef={confirm => this.refConfirm = confirm}
                    yesButton={{ click: () => this.deleteConfigConfirm()}}
                />
                <GridView
                    idTable={'table-channel-type'}
                    floatHeader= {true}
                    onRef={ref => this.TableChannelType = ref}
                    serializeRows={false}
                    filter={false}
                    classTable={'clever-table responsive-table striped bordered'}
                    columns={[
                        { attribute : 'iddef_channel_type', alias : 'Id channel type'},
                        { attribute : 'name', alias : 'Nombre'},
                        { attribute : 'description', alias : 'Descripcion'},
                        {
                            attribute: 'actions',
                            alias: 'Actions',
                            value: (data, index) => {
                                return (
                                    <div> 
                                        <a onClick={(e) => this.openModalChannelType(data)} title='Edit Group'><i className='material-icons left'>mode_edit</i></a>
                                        {data.estado == 1 ?
                                            <a onClick={(e) =>this.deleteChannelType(e, data)} 
                                                title='Disable Group'><i className='material-icons left'  >toggle_on</i></a>
                                            :
                                            <a onClick={(e) =>this.deleteChannelType(e, data)} 
                                                title='Enable Group'><i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i></a>
                                        }
                                    </div>)
                            }
                        }
                    ]}
                />
                <div className="row">
                    <Modal id={"modalEditAdd"} title={'ChannelType'} ref={ref => this.modalAddEdit = ref} btnAction={btnModalChannelType}>
                        <CleverForm
                            ref={ref => this.formChannelType = ref}
                            id={'form-refundable'}
                            data={ this.state.dataChannelType }
                            forms={[
                                {
                                    fieldset: false,
                                    title: "",
                                    inputs: [
                                        {row:[
                                            {type:'text', size:'col s12 m4 l4', name:'name', label:'* Name', placeholder:'Insert name', required:true},
                                            {type:'text', size:'col s12 m4 l4', name:'description', label:'* Description', placeholder:'Insert description', required:true},
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

    openModalChannelType(data){
        this.setState({ dataChannelType: data, btnModalChannelType: { label:"Edit", icon:"edit", onClick:() => {this.addEditChannelType('EDIT', data)} } })
        this.modalAddEdit.openModal();
    }
    openCreateModalChannelType(){
        this.setState({ dataChannelType: {name: '', description: ''}, btnModalChannelType: { label:"Add", icon:"edit", onClick:() => {this.addEditChannelType('ADD', '')} } })
        this.modalAddEdit.openModal();
    }

    deleteChannelType(e,data){
        this.refConfirm.getInstance().open()
        this.setState({ changeChannelType: data})
    }
};