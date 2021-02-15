import React, { Component }  from 'react';
import {GridView,CleverForm} from 'clever-component-library';
import DataResponsePush from "./DataResponsePush";

export default class ResponsePushRate extends Component  {

    constructor(props) {
        super(props);
        this.refTableResponse = React.createRef();
        this.getDataResponsePush = this.getDataResponsePush.bind(this);
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false, 
            isViewTable:false,
            isViewTextError:false
        }
    }

    componentDidMount() {
        console.log(this.props);
        this.getDataResponsePush(this.props.dataResponse, 
                                this.props.errorResponse,
                                this.props.msgError);
    }

    getDataResponsePush(dataResponse, errorResponse,msgError){  
        dataResponse == null ? (errorResponse = true, msgError=true ):null;
        let dataError = {};
        let msgGenerico = 'Se produjo un error no controlado al realizar el push, favor de contactar al area de sistemas';
        dataError.detailError = msgError == true ? msgGenerico : JSON.stringify(msgError);
        
        if(errorResponse == true){
            this.setState({
                            isViewTable:false,
                            isViewTextError:true,
                            responseError:dataError
            });
        }else{

            if(dataResponse.length > 0){
                this.setState({
                    isViewTable:true,
                    isViewTextError:false
                },()=>{
                    this.refTableResponse.setDataProvider(dataResponse); 
                });  
            }else{
                let response=JSON.stringify(dataResponse)

                this.setState({
                    isViewTable:false,
                    isViewTextError:true,
                    responseError:response
    });
            }
                     
        } 
    }

    render(){
        let {isViewTable,isViewTextError}= this.state;
        return(
            <div >
                {isViewTable == true ? 
                    <GridView 
                        idTable='table-responsePushRates'
                        serializeRows={true}
                        onRef={grid => this.refTableResponse = grid}
                        classTable={'clever-table responsive-table striped bordered'}
                        filter={false}
                        columns={[
                                    //{ attribute : 'code', alias : 'Code Response'},
                                    //{ attribute : 'error', alias : 'Error' },
                                    { attribute : 'msg', alias : 'Message Response' },
                                    {
                                        alias : 'Data',
                                        expandCall : (data, index) => {
                                            // console.log('data detail ==>',data.data);
                                            return <DataResponsePush data={data.data} indexData={index}/>;
                                        }
                                    }
                        ]}
                    />                
                
                :null}

                {isViewTextError == true ? 
                    <CleverForm
                        id={'form-responseError'}
                        data={this.state.responseError}
                        ref={ref => this.refError = ref}
                        forms={[
                                {inputs:[
                                        {row:[
                                            {type:'text-area',size:'input-field col s12 m12 l12',name:'detailError',label:'ERROR: '}
                                        ]}
                                    ]
                                }
                        ]}
                    />
                :null}
            </div>
        )
    }

}

ResponsePushRate.defaultProps= {
    dataResponse:{},
    errorResponse:{},
    msgError:''

}