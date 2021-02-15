import React, { Component } from 'react';
import { CleverForm, CleverRequest,MComponentes,CleverLoading } from 'clever-component-library';
import CleverConfig from '../../../../../config/CleverConfig';
import '../../rates/access_restrictions/restrictions/css.css'
import moment from 'moment';


const MoneyFormat = (props) => {
    let fixDecimal = Number(props.cantidad).toFixed(4)
    let cadena = String(fixDecimal)
    let regresa = ""

    if (cadena.indexOf('.') !== -1) {
        let ss = cadena.split(".")
        let pesos = ss[0];
        let centavos = ss[1];

        regresa = "$ "+pesos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + centavos;

    } else {
        try {
            regresa = "$ "+cadena.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")+".0000"
        } catch (e) {
            regresa = "-"
        }
    }

    return regresa;

}

class ExChange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowsExchange: <></>,
            buttonDisable: false,
            loader: false,
            dataForm: {
                dateEx: moment().format("YYYY-MM-DD"),
            }
        }
    }

    componentDidMount() {
     
    }

    onChangeDate(e) {

        if(Date.parse(e.dateString + " 12:00") > Date.parse(moment().format("YYYY-MM-DD") + " 12:00")){
            MComponentes.toast("Date must be today or later");
            this.setState({ buttonDisable: true })
        }else{
            let form = JSON.parse(JSON.stringify(this.state.dataForm));
            form[e.id] = e.dateString
            this.setState({ dataForm: form, buttonDisable: false })
            
        }
        return;
        
    }

    pintarResponse(e) {
        let newForm = JSON.parse(JSON.stringify(this.state.dataForm));
        let arrayRows = []
        let request = {
            history_date: this.state.dataForm.dateEx
        }
        this.setState({ loader: true });

        CleverRequest.postJSON(CleverConfig.getApiUrl('bengine') + `/api/exchange-rate/load`, request, (response, error) => {
            if (response["Error"] == false) {

                for (var rates in response.data["rates"]) {
                    arrayRows.push(<tr><td>{moment.unix(response.data["timestamp"]).format("DD-MMM-YY")}</td><td>{rates}</td><td>{<MoneyFormat cantidad={response.data["rates"][rates]} /> }</td></tr>)
                }

                this.setState({ rowsExchange: arrayRows, dataForm: newForm, loader: false })

            }
            else {
                MComponentes.toast("Exchange rate service error");
                console.log(error)
                this.setState({ loader: false });
            };
        });


    }

    render() {
        return (
            <div className="row">
                <CleverForm
                    id={'form-test'}
                    ref={ref => this.refForm = ref}
                    data={this.state.dataForm}
                    forms={[
                        {
                            inputs: [
                                {
                                    row: [
                                        { type: 'date', onChange: e => this.onChangeDate(e), colDate: 'col s12 m4 l4', labelDate: 'Value', name: 'dateEx', id: 'dateEx' },
                                        { type: 'button', size: 'col s12 m4 l4', label: 'Update', onClick: e=>this.pintarResponse(e) , disabled: this.state.buttonDisable}
                                    ]
                                },
                                /* {
                                    row: this.state.rowsExchange
                                }, */
                                {
                                    row: [
                                        {
                                            type: 'component', component: () => {
                                                return (
                                                    <table>
                                                    <thead>
                                                      <tr>
                                                          <th>Date</th>
                                                          <th>Currency</th>
                                                          <th>Value</th>
                                                      </tr>
                                                    </thead>
                                            
                                                    <tbody>
                                                      {this.state.rowsExchange}
                                                    </tbody>
                                                  </table>
                                                )
                                            }
                                        }
                                    ],
                                },
                            ],
                        },
                    ]}
                />

                <CleverLoading show={this.state.loader} />

            </div>
        );
    }
}

export default ExChange;