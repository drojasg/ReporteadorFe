import React, { Component } from "react";
import PropTypes from 'prop-types';
import {MComponentes, CleverLoading,CleverForm} from "clever-component-library";

export default class FrmComments extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        

        this.state = {
            load : false,  
        }
    }

    componentDidMount(){
        this.setState({dataComments:this.props.dataComments},()=>{this.createFrmComments()})
    }

    createFrmComments=()=>{
        let {dataComments} = this.state;
        let listFrmComment = [];
        dataComments.sort().map((dataComment,key)=>{
            listFrmComment.push(<CleverForm
                ref={ref => this[`refDataComments${key}`] = ref}
                id={`modifyComments${key}`}
                data={dataComment}
                forms={[
                    {
                        fieldset:true,
                        inputs: [
                            {row:[
                                {type: 'component', 
                                    component: () => {
                                        return (
                                            <>
                                                <div className='col s12 m10 l10'></div>
                                                <div className='col s12 m2 l2'>
                                                    <a onClick={e=>this.DeleteFrmComments(e,key)} title='Delete Comment'>
                                                        <i className='material-icons right'>delete</i>
                                                    </a>
                                                </div>
                                            </>   
                                        )
                                    }
                                },
                            ]},
                            {row:[
                                {type:'text-area',size:'col s12 m12 l12',name:'text',label:'Comment',characters:true,alphanumeric:true,required:true},
                            ]}, 
                            {row:[
                                {type: 'component', 
                                    component: () => {
                                        return (
                                            <>
                                                <div className='col s12 m6 l6'>
                                                    <h6 style={{fontSize:"12px", color:"#5b5b5b" ,marginTop:'0px',marginBottom:'0px'}}>
                                                        Comment visibility to the guest
                                                    </h6>
                                                </div>

                                                <div className='col s12 m2 l2'>
                                                    {dataComment.visible_to_guest == 1 ?
                                                        <a onClick={(e) => this.changeStatus(key)} title=''>
                                                            <i className='material-icons letf'  >toggle_on</i>
                                                        </a>
                                                    :
                                                        <a onClick={(e) => this.changeStatus(key)} title=''>
                                                            <i className='material-icons left' style={{ color: "#990303" }}>toggle_off</i>
                                                        </a>
                                                    }                                                    
                                                </div>
                                            </>
                                        )
                                    }
                                },
                            ]},
                        ]
                    }
                ]}
            /> )
        });
        this.setState({formsComments:listFrmComment})
    }

    AddFrmComments(e){
        let {dataComments}= this.state;
        dataComments.push({
            text:"",
            visible_to_guest:0
        });
        this.createFrmComments();
    }

    DeleteFrmComments(e,indexFrm){
        this.state.dataComments.splice(indexFrm,1);
        this.createFrmComments();
        MComponentes.toast("The form Comment was remove");
    }

    changeStatus(indexFrm){
        let valueComment = this.state.dataComments[indexFrm];
        let status =valueComment.visible_to_guest;
        this.state.dataComments[indexFrm].visible_to_guest= status == 0 ?1 :0;
        this.createFrmComments();
    }

    getValueComments=()=>{
        let {dataComments}= this.state;
        let responseComment = {};
        let comments= [];           
        
        if(dataComments.length >0){
            let validation = this.validateComments(); 
            let isError = validation.filter(val => val.error== true);        
            if(isError.length == 0){
                responseComment.error= false;
                validation.map(data=>{
                    comments.push({
                       "text":data.text,
                       "visible_to_guest": data.visible_to_guest 
                    }) 
                });
                responseComment.comments= comments;
            }else{
                let message= "";
                isError.map(error =>{
                    message = `${message} ${error.message},`
                });
    
                MComponentes.toast(`Add comment in the ${message}`);
                    this.setState({ hiddeNotificationModal: false, notificationType: "error", 
                        notificationMessage: `Add comment in the ${message}`});  
                responseComment.error= true; 
                responseComment.comments= []; 
            }
        }else{
            responseComment.error= false;
            responseComment.comments= []; 
        }
       
        return responseComment;
    }

    validateComments(){
        let {dataComments}= this.state;
        let responseValidation= [];
        dataComments.sort().map((data,key)=>{
            let dataCurrent= {};
            let dataComment = this[`refDataComments${key}`].getData();
            let requiredComments = dataComment.required.count;            
            if(requiredComments > 0){
                dataCurrent.error= true;
                dataCurrent.message = ` Form ${key+1}`;
                dataCurrent.text = "";
                dataCurrent.visible_to_guest = "";
            }else{
                dataCurrent.error= false;
                dataCurrent.message = "";
                let valuesComments = dataComment.values;
                dataCurrent.text = valuesComments.text;
                dataCurrent.visible_to_guest = data.visible_to_guest == 1 ? true :false;
            }
            responseValidation.push(dataCurrent);
        });

        return responseValidation
    }

    render(){  
        let {load,formsComments}= this.state;
        let lengthListComments = formsComments ? formsComments.length :0;
        return(
            <>
                <CleverLoading show={load}/> 
                <div className='row'>
                    <div className='col s12 m10 l10'></div>
                    <div className='col s12 m2 l2'>
                        <a onClick={e=>this.AddFrmComments(e)} title='Add Comments'>
                            <i className='small material-icons right'>add_box</i>
                        </a> 
                    </div>
                </div>
                {lengthListComments == 0 ?
                <div className='row' style={{paddingLeft:'10px'}}>
                    <p>No Comments</p>
                </div>
                :null}
                {
                    formsComments ?
                        formsComments.map((form,key) => (<div key={key}><div className='row'>{form}</div><div className='row'></div></div>))
                    :null
                } 
            </>
        );
    }
}

FrmComments.propTypes = {
    onRef: PropTypes.func,
    dataComments:PropTypes.array,
}

FrmComments.defaultProps = {
    onRef: () => {},
    dataComments: []
}