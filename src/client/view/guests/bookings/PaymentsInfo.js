import React, { Component } from "react";
import PropTypes from 'prop-types';
import {CleverForm,CreditCard,MComponentes} from "clever-component-library";

export default class PaymentsInfo extends Component {

    constructor(props) {
        super(props);
        this.props.onRef(this);        
        this.state = {
        }
    }

    componentDidMount(){
        // console.log('PROPS PAY ==> ', this.props);
        this.setState({dataCardPayment: this.props.dataCardPayment});
    }

    onChangeNumCard=(e)=>{
        let dataFrmPay = JSON.parse(JSON.stringify(this.state.dataCardPayment));         
        let nameInput = e.name;
        let valueText= e.value;
        let onlyNumberInp= valueText.replace(/[^0-9]/g,'');
        let dataCard= this.refPayment.getData().values;
        switch(nameInput){
            case "firstNameCard":
                    dataFrmPay["firstNameCard"] = e.value;
                    dataFrmPay["nameCard"] = `${e.value} ${dataCard.lastNameCard} `;
                break;
            case "lastNameCard":
                    dataFrmPay["lastNameCard"] = `${e.value}`;
                    dataFrmPay["nameCard"] = `${dataCard.firstNameCard} ${e.value}`;
                break;
            case "numberCard":
                    dataFrmPay["numberCard"]= String(onlyNumberInp);
                break;
            case "expiration":
                    onlyNumberInp = onlyNumberInp.slice(0,6);
                    let month = onlyNumberInp.slice(0, 2);  
                    if(month.slice(0, 1) > 1 && month.slice(0, 1) <= 9) month = `0${month.slice(0, 1)}`;
                    if(month.slice(0, 1) == 1) month = month.slice(1, 2) < 3 ?  `${month.slice(0, 1)}${month.slice(1, 2)}` : `${month.slice(0, 1)}`;
                    let year = onlyNumberInp.slice(2, 6);
                    if (year.slice(0, 1) < 2) year= "";
                    onlyNumberInp = year !== "" ? `${month}/${year}` : `${month}`;
                    dataFrmPay["expiration"]= String(onlyNumberInp);
                    dataFrmPay["yy"]= String(year);
                    dataFrmPay["mm"]= String(month);
                break;
            case "cvvCard":
                    onlyNumberInp = onlyNumberInp.substring(0,4);
                    dataFrmPay["cvvCard"]= String(onlyNumberInp);
                break;
            default :
                break;
        }
        this.setState({ dataCardPayment: dataFrmPay })
    }

    getDataCard=()=>{
        let dataCard = this.refPayment.getData();
        let requiredFrm = dataCard.required;
        let countRequired = requiredFrm.count;
        let dataCardPayment = {};

        if(countRequired > 0){
            MComponentes.toast("Complete the Card data");
            dataCardPayment.error= true;
            dataCardPayment.data= {};
        }else{
            let valueCard = dataCard.values;
            let dateFull = valueCard.expiration;
            let splitDate = dateFull.split("/");
            dataCardPayment.error= false;
            dataCardPayment.data = {
                                    "card_number": valueCard.numberCard,
                                    "firstName": valueCard.firstNameCard,
                                    "last_name": valueCard.lastNameCard,
                                    "expMM": splitDate[0],
                                    "expYY": splitDate[1],
                                    "cvv": valueCard.cvvCard   
                                } 
        }

        return dataCardPayment;
    }

    render(){  
        let {dataCardPayment}= this.state;
        
        return(
            <div> 
                {dataCardPayment ?
                <>
                    <div className="col s12 m6 l6">
                        <CleverForm
                            ref={ref => this.refPayment = ref}
                            id={'cardPay'}
                            data={dataCardPayment}
                            forms={[
                                {inputs: [
                                    {row:[
                                        {type:'text',size:'col s12 m12 l12',name:'firstNameCard',label:'* First Name', placeholder:'Insert First Name',
                                            characters:true,alphanumeric:true,required:true,onChange:e=>this.onChangeNumCard(e)},
                                        {type:'text',size:'col s12 m12 l12',name:'lastNameCard',label:'* Last Name', placeholder:'Insert Last Name',
                                            characters:true,alphanumeric:true,required:true,onChange:e=>this.onChangeNumCard(e)},
                                        {type:'text',size:'col s12 m12 l12',name:'numberCard',label:'* Number card', 
                                            placeholder:'Insert Number card',characters:true,alphanumeric:true,required:true,
                                            onChange:e=>this.onChangeNumCard(e)},
                                    ]},
                                    {row:[
                                        {type:'text',size:'col s12 m6 l6',name:'expiration',label:'* Expiration Date', 
                                            placeholder:'MM/YYYY',characters:true,alphanumeric:true,required:true,
                                            onChange:e=>this.onChangeNumCard(e)},
                                        {type:'text',size:'col s12 m6 l6',name:'cvvCard',label:'* CVV', 
                                            placeholder:' ',characters:true,alphanumeric:true,required:true,
                                            onChange:e=>this.onChangeNumCard(e)},
                                    ]},
                                ]}
                            ]}
                        />  
                    </div>                
                    <div className="col s12 m6 l6">
                    <CreditCard
                        onRef= {ref=> this.refCard =ref}
                        type= {""}
                        cardNumber= {dataCardPayment.numberCard}
                        fullName= {dataCardPayment.nameCard}
                        expiryMM= {dataCardPayment.mm}
                        expiryYY= {dataCardPayment.yy}
                        cvc= {dataCardPayment.cvvCard}
                    /> 
                </div>            
                </>
                :null}
            </div>
        );
    }
}

PaymentsInfo.propTypes = {
    onRef: PropTypes.func,
    dataCardPayment: PropTypes.object,
}

PaymentsInfo.defaultProps = {
    onRef: () => {},
    dataCardPayment:{
        nameCard:"",
        numberCard:"",
        expiration:"",
        cvvCard:"",
        mm:"",
        yy:","
    }
}