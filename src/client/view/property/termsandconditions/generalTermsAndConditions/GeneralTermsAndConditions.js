import React, { Component } from 'react';
import { CleverForm, CleverRequest, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import Label from 'clever-component-library/build/react/label/Label';
import axiosRequest from '../../../../axiosRequest';
import { Input } from 'clever-component-library/build/react/input';
import { timingSafeEqual } from 'crypto';
import { runInThisContext } from 'vm';

export default class GeneralTermsAndConditions extends Component {
    constructor(props) {
        super(props)
        this.refFormView = React.createRef();
        this.SaveData = this.SaveData.bind(this)
        this.getData = this.getData.bind(this)
        this.state = {
            dataForm: {},
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            data: [],
            isEdit : false,
        }
    }
    componentDidMount(){
        //cargamos los datos
        this.getData();
        //se relaciona el boton del colapse con el evento guardar cambios
       this.props.reference.current.id ?
       document.getElementById(this.props.reference.current.id).addEventListener("click", this.SaveData)
       : null
    }

    SaveData(){
        //this.getData()
        // return

        if(this.state.isEdit){
            //PUT
            console.warn("PUT? =>" , this.state.isEdit);
            let datosFormUp = this.refFormView.getData()
            const idTermRecord = this.state.dataForm.iddef_terms_and_conditions
            console.warn("ID=>",  this.state.dataForm)
            const url = `/api/terms-and-conditions/update/`
            let dataUpdate = datosFormUp
            dataUpdate.values["iddef_brand"] = this.state.hotelData.iddef_brand
            
                axiosRequest.put(
                    CleverConfig.getApiUrl('bengine') + url + this.state.dataForm.iddef_terms_and_conditions,dataUpdate.values,
                    (response) => {
                        if (response.status == 403) {
                            MComponentes.toast('YOU ARE NOT AUTHORIZED');
                            this.setState({ load: false });
                            return
                        }
                        if (response.Error === false) {
                            this.setState({isEdit : true})
                            MComponentes.toast("Update Successfully");
                        }else{
                            this.setState({isEdit : true})
                        }
                    }
                )
                
        }else{
            //POST
            console.warn("POST? =>" , this.state.isEdit);

            let datosForm = this.refFormView.getData()
            //console.log("dform",datosForm)
            if (datosForm.values.link_en === undefined || datosForm.values.link_en === "" || datosForm.values.link_es === undefined || datosForm.values.link_es === ""){
                MComponentes.toast("Please fill in all fields")
            }else{
                let dataSave = datosForm
                dataSave.values["iddef_brand"] = this.state.hotelData.iddef_brand
                console.warn("k?",dataSave.values)
                axiosRequest.post(
                    CleverConfig.getApiUrl('bengine') + "/api/terms-and-conditions/create", dataSave.values,
                        (response) => {
                            if (response.status == 403) {
                                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                this.setState({ load: false });
                                return
                            }
                            if (response.Error === false) {
                                this.setState({isEdit : true, data: response.data})
                                MComponentes.toast("New record add");
                            }else{
                                this.setState({isEdit : false})
                        }
                    }
                )
            }

        }
        

    }

    getData(){
        const url = '/api/terms-and-conditions/get-by-brand'
        axiosRequest.get(
            CleverConfig.getApiUrl('bengine') + url +'/'+this.state.hotelData.iddef_brand,
            (response) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
                if (response.data.length != 0) {
                    this.setState({
                        data: response.data,
                        isEdit : true,
                    });


                   let JSONdata={};
                   for (let i = 0; i < this.state.data.length; i++) {
                       console.warn(this.state.data[i])
                       JSONdata["link_es"] = this.state.data[i].link_es;
                       JSONdata["link_en"] = this.state.data[i].link_en;
                       JSONdata["iddef_terms_and_conditions"] = this.state.data[i].iddef_terms_and_conditions
                   }

                   this.setState({
                    dataForm: JSONdata
                   }) 



                }else{
                    console.log("error");
                    this.setState({isEdit : false})
                }
            }
        )
    }
    
    render() {
        return(
        <div className="row">
            <CleverForm
                               ref={ref => this.refFormView = ref}
                               id={"Form-TermsAndConditions"}
                               data={this.state.dataForm}
                               forms={[{
                                   size: 'col s12 ',
                                   fieldset: false,
                                   title: "",
                                   inputs: [
                                       {
                                           row: [
                                                { id: 'link_es', type: 'text', size: 'col s12 m12 l12', label: 'Spanish', name: 'link_es', placeholder:'INSERT TERM & CONDITIONS IN SPANISH', required: false, uppercase: false, alphanumeric: true, characters:true },
                                                { id: 'link_en',  type: 'text', size: 'col s12 m12 l12', label: 'English', name: 'link_en', placeholder:'INSERT TERM & CONDITIONS IN ENGLISH', required: false, uppercase: false, alphanumeric: true, characters:true },
                                           ]
                                       }
                                   ]
                               }]}
                           /> 
        </div>
        )
    }
}