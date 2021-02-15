import React, { Component } from "react";
import PropTypes from 'prop-types';
import {CleverLoading,} from "clever-component-library";

export default class FrmDetailPay extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        
        this.state = {
            load : false,  
            totalToPay:0.00
        }
    }

    componentDidMount(){
        // console.log('PROPS DETAIL PAY ==> ', this.props);
        this.setState({dataPaid: this.props.dataPaid,valueCurrency:this.props.valueCurrency},()=>{
            this.startViewPay();
        });
    }

    startViewPay(){
        let {dataPaid}= this.state;
        this.createDataPay();
        this.getSumTotal(()=>{
            dataPaid.totalToPay= this.state.totalToPay;
            this.props.validateViewFrmCard();
            this.createFoot();});
    }

    createDataPay(){
        let {dataPaid,valueCurrency} = this.state;
        let dataRooms = dataPaid !== undefined ? dataPaid.rooms !== undefined ?  dataPaid.rooms :[] :[];
        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);

        let rowsDetailPay= [];
        dataRooms.sort().map((rooms,key) =>{
            rowsDetailPay.push(
                <tr key={key}>
                    <td style={{textAlign:"center"}}>{rooms.roomCode}</td>
                    <td style={{textAlign:"right"}}>{numberFormat.format(rooms.totalByRoom)}</td>
                    <td style={{textAlign:"right"}}>{numberFormat.format(rooms.discountRoom)}</td>
                    <td style={{textAlign:"right"}}>{numberFormat.format(rooms.totalPaid)}</td>
                    <td >
                        <div className='col s9 m9 l9'>
                            <input className='validate' style={{color:"black", textAlign:"right"}} placeholder="Insert amount" 
                                type="text" name={`editInput${key}`} id={`editInput${key}`} 
                                value={rooms.totalToPay} onChange={e=> this.onChangePay(e,key)}                             
                            />
                        </div>
                        <div className='col s1 m1 l1'>{valueCurrency}</div>
                    </td>
                </tr>
            )
        });

        this.setState({bodyPay:rowsDetailPay})
    }

    getSumTotal(functionSuma=()=>{}){
        let {dataPaid}=this.state;

        let dataRooms = dataPaid !== undefined ? dataPaid.rooms !== undefined ?  dataPaid.rooms :[] :[];
        let totamSum=0;
        dataRooms.map(room=>{
            let amountCurrent = room.totalToPay !== '' ? room.totalToPay :0.00;
            totamSum= parseFloat(totamSum)+parseFloat(amountCurrent);
        });
        this.setState({totalToPay:totamSum},functionSuma);
    }

    createFoot(){
        let {dataPaid,valueCurrency} = this.state;
        let detailTotales={};
        let options = { style: 'currency', currency: String(valueCurrency), currencyDisplay: 'symbol'};
        let numberFormat = valueCurrency.toUpperCase() == "MXN" ? new Intl.NumberFormat('es-MX', options): new Intl.NumberFormat('en-US', options);
        
        detailTotales=(<tfoot>
                            <tr>                                
                                <td style={{backgroundColor:"#1e9198"}}>
                                    <h6 style={{textAlign:"right", fontSize:"14px", color:"black" , fontWeight:"bold"}}>Total</h6>
                                </td>
                                <td  style={{backgroundColor:"#1e9198"}}>
                                    <h6 style={{textAlign:"right", fontSize:"14px", color:"black" , fontWeight:"bold"}}>
                                        {dataPaid.totalPrice !== undefined ?
                                            valueCurrency !== undefined ? `${numberFormat.format(dataPaid.totalPrice)} ${valueCurrency}`
                                            :`${numberFormat.format(dataPaid.totalPrice)}`:""}
                                    </h6>
                                </td>
                                <td style={{backgroundColor:"#1e9198"}}>
                                    <h6 style={{textAlign:"right", fontSize:"14px", color:"black" ,fontWeight:"bold"}}>
                                        {dataPaid.discountPrice !== undefined ? 
                                            valueCurrency !== undefined ? `${numberFormat.format(dataPaid.discountPrice)} ${valueCurrency}`
                                            :`${numberFormat.format(dataPaid.discountPrice)}`:""}
                                    </h6>
                                </td>
                                <td style={{backgroundColor:"#1e9198"}}>
                                    <h6 style={{textAlign:"right", fontSize:"14px", color:"black" ,fontWeight:"bold"}}>
                                        {dataPaid.totalpaidResv !== undefined ? 
                                            valueCurrency !== undefined ? `${numberFormat.format(dataPaid.totalpaidResv)} ${valueCurrency}`
                                            :`${numberFormat.format(dataPaid.totalpaidResv)}`:""}
                                    </h6>
                                </td>
                                
                                <td  style={{backgroundColor:"#1e9198"}}>
                                    <div className='col s9 m9 l9'>
                                        <h6 style={{textAlign:"right", fontSize:"14px", color:"black" , fontWeight:"bold"}}>
                                            {`${numberFormat.format(this.state.totalToPay)}`}
                                        </h6>
                                    </div>
                                    <div className='col s1 m1 l1'>
                                        <h6 style={{textAlign:"right", fontSize:"14px", color:"black" , fontWeight:"bold"}}>
                                            {valueCurrency} </h6>
                                    </div>
                                </td>
                            </tr>  
                        </tfoot>                               
            )

        this.setState({footPay:detailTotales})
    }

    onChangePay=(e,key)=>{
        let {dataPaid} = this.state;
        let valueInsert= e.target.value;
        let onlyNumberInp= valueInsert.replace(/[^0-9.]/g,'');
        let valEndPoint= onlyNumberInp.split('.');

        if(valEndPoint.length> 1){
            valEndPoint[1] = valEndPoint[1].length > 2 ? valEndPoint[1].substring(0,2) : valEndPoint[1];
            onlyNumberInp = `${valEndPoint[0]}.${valEndPoint[1]}`
        }
        
        let nameFrm = dataPaid.rooms[key].nameFrm;
        dataPaid.rooms[key].totalToPay= onlyNumberInp;
        this.props.onChangeRoomRates('','updateTotalRoom',nameFrm,onlyNumberInp);
        this.startViewPay();
    }

    render(){  
        let {load,bodyPay,footPay}= this.state;
        
        return(
            <div>
                <CleverLoading show={load}/> 
                <div>
                    <div className='row'>
                        <table className='clever-table responsive-table striped bordered' style={{width:"100%"}}>
                            <thead>
                            <tr>
                                <th style={{width:"5%", textAlign:"center"}}>Room</th>
                                <th style={{width:"15%", textAlign:"center"}}>Total by Room</th>
                                <th style={{width:"15%", textAlign:"center"}}>Discount</th>
                                <th style={{width:"25%", textAlign:"center"}}>Total Paid</th>
                                <th style={{width:"40%", textAlign:"center"}}>Total to Pay</th>
                            </tr>
                            </thead>
                            {bodyPay ?
                            <tbody>
                                {bodyPay.map(rowsTbl => {return rowsTbl})}
                            </tbody>
                            :null}
                            {footPay?
                                footPay
                            :null}
                        </table>
                    </div>
                    <div className='row'></div>
                </div>               
            </div>
        );
    }
}

FrmDetailPay.propTypes = {
    onRef: PropTypes.func,
    validateViewFrmCard: PropTypes.func,
    onChangeRoomRates: PropTypes.func,
    dataPaid: PropTypes.object,
    valueCurrency: PropTypes.string
}

FrmDetailPay.defaultProps = {
    onRef: () => {},
    validateViewFrmCard: () => {},
    onChangeRoomRates: () => {},
    dataPaid:{
        totalToPay:0.00,
        roomPrice: "",
        totalPrice: "", 
        discountPrice: "", 
        rooms:[]
    },
    valueCurrency: ""
}