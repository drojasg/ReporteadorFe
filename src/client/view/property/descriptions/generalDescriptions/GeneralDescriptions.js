import React, { Component } from 'react';
import { CleverForm, CleverRequest, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import Label from 'clever-component-library/build/react/label/Label';
import axiosRequest from '../../../../axiosRequest';
import { Input } from 'clever-component-library/build/react/input';
import { timingSafeEqual } from 'crypto';
import { runInThisContext } from 'vm';
import SelectedGalery from '../../../../components/galery/SelectedGalery';

export default class GeneralDescriptions extends Component {
    btnManageImages = React.createRef();
   constructor(props) {
       super(props)
       this.saveChanges = this.saveChanges.bind(this);
       this.getForms = this.getForms.bind(this);
       this.getData = this.getData.bind(this);
       this.saveSelectedImg = this.saveSelectedImg.bind(this);
       this.handlerArea = this.handlerArea.bind(this);
       //this.filterLenguaje = this.filterLenguaje.bind(this);
       this.referencia = React.createRef();
       this.state = {
           name_lenguaje: [],
           dataForm: {},
           inputs: [],
           counter: 1,
           refer: [],
           data: [],
           dataInput: [],
           hotelData: JSON.parse(localStorage.getItem('hotel')),
       }
       this.arrayInputs = new Array();
       this.arraySave = new Array();
       this.arrayReferences = new Array();
   }

    componentDidMount() {
        let id_property = this.state.hotelData.iddef_property;

        this.setState({ SelectedGalery: <div><SelectedGalery label={'Manager Images'} callBack={(response) => this.saveSelectedImg(response)}
            url={`/api/media-property-desc/search-all-by-property/${id_property}/${this.props.id_type}/1`} system={ `bengine` }/></div>, load: true })
       this.getData();   
       //se relaciona el boton del colapse con el evento guardar cambios
       this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.saveChanges)
           : null
       this.referencia.current;
    }

    saveChanges() {
        this.arraySave = [];
        for (let i = 0; i < this.state.data.length; i++) {
            let long_desc = "long_description" + i;
            let short_desc = "short_description" + i;
            let data = "data_" + i;
            const element_long = this.referencia.current.state.data[long_desc];
            const element_short = this.referencia.current.state.data[short_desc];
            
            this.arraySave.push(
                {
                    iddef_description_type: this.props.id_type,
                    iddef_property: this.state.hotelData.iddef_property,
                    lang_code: this.state.data[i].language_code,
                    title: element_short,
                    description: element_long,
                    estado: 1
                }
            );
        }

        this.arraySave.map((element,key) => {

            if (element.description == undefined || element.description == '' && element.title == undefined || element.title == '') {
                this.arraySave = []
                MComponentes.toast("Please fill in all fields")

            } else {

                let dataSent = {
                    "data": [element]
                }
                
                if (this.state.data[key].descriptions.length === 0 ){

                 axiosRequest.post(
                        CleverConfig.getApiUrl('bengine') + "/api/property-description/create/all", dataSent,
                        (response) => {
                            if (response.status == 403) {
                                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                this.setState({ load: false });
                                return
                            }
                            if (response.Error === false) {
                                MComponentes.toast("New record add");
                            }else{
                                MComponentes.toast("Record dont add, please check");
                            }
                        }
                    )
                    }else{
                        if (this.state.data[key].descriptions.length > 0){
                    const idProperty_description = this.state.data[key].descriptions[0].iddef_property_description               
                    let dataUpdate = {}
                    dataSent["data"].map(dataS => (
                         dataUpdate = dataS,
                         dataUpdate["iddef_property_description"] = idProperty_description
                     ))
                     let dataUpdateJSON = {
                         "data": [dataUpdate]
                     }

                    const url = `/api/property-description/update/all`
                    axiosRequest.put(
                        CleverConfig.getApiUrl('bengine') + url , dataUpdateJSON,
                        (response) => {
                            if (response.status == 403) {
                                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                                this.setState({ load: false });
                                return
                            }
                            if (response.Error === false) {
                                MComponentes.toast("Update Successfully");
                            }else{
                                MComponentes.toast("Data Dont Update Please Check");
                            }
                        }
                    )
                        }
                }
            }
        })
    }

    getForms() {  

        this.myref = [];
        this.state.data.map((item, key) => {
            
            this.arrayInputs.push(
                <CleverForm
                    ref={this.referencia}
                    id={item.lang_code}
                    data={this.state.dataForm}
                    forms={[{
                        size: 'col s12 ',
                        fieldset: true,
                        title: item.language,
                        inputs: [
                            {
                                row: [
                                    { id: 'short_description' + key, type: 'text', size: 'col s12 m12 l12', label: 'Short Description', name: 'short_description' + key, required: true, alphanumeric: true },
                                    {type:'component', component:() =>{
                                        return ( 
                                            <textarea name={'long_description' + key} id={'long_description' + key}
                                            defaultValue={this.state.dataForm['long_description'+key]}
                                            onChange={(e) => { this.handlerArea(e, 'long_description' + key) }}
                                            style={{height:'300px', width:'100%'}}/>
                                        );
                                    }},
                                ]
                            }
                        ]
                    }]}
                />
            );
            this.setState({
                counter: this.state.counter + key,
            });
        });
        this.setState({
            inputs: this.arrayInputs, load: false
        })
        this.props.load(false);
    }  


    handlerArea = async (e, label) => {
        this.state.data.map((item, key) => {
            if ('long_description' + key == label) {
                this.referencia.current.state.data[label] = e.target.value;
            }
        })
        // console.log('this.referencia: ', this.referencia.current.state.data[label]);
    }

   getData() {
       const idProperty = this.state.hotelData.iddef_property;
       const description_type = this.props.id_type;
       const url = `/api/property-lang/search/property/${idProperty}/${description_type}`;
       axiosRequest.get(
           CleverConfig.getApiUrl('bengine') + url,
           (response) => {
                if (response.status == 403) {
                    MComponentes.toast('YOU ARE NOT AUTHORIZED');
                    this.setState({ load: false });
                    return
                }
               if (response.Error === false) {
                   this.setState({
                       data : response.data
                   });                  
                                      
                   let JSONdata={};
                   for (let i = 0; i < this.state.data.length; i++) {
                       if (this.state.data[i].descriptions.length > 0){
                       JSONdata["short_description" + i] = this.state.data[i].descriptions[0].title;
                       JSONdata["long_description" +i] = this.state.data[i].descriptions[0].description;
                       }else{
                        JSONdata["short_description" + i] = "";
                        JSONdata["long_description" +i] = "";
                       }
                   }

                   this.setState({
                        dataForm: JSONdata
                   }, () => {this.getForms()})
                   
               }
           }
       )
   }

   saveSelectedImg(data){
        this.setState({ SelectedGalery: '', load: true })
        let medias_id = [];
        let id_property = this.state.hotelData.iddef_property;
        let id_desc_type = this.props.id_type;
        data.map((item, key) => {
            medias_id.push(item.iddef_media);
        })
        
        let sendData = { 
            "iddef_property": id_property,
            "iddef_description_type": id_desc_type,
            "medias_id": medias_id 
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') + '/api/media-property-desc/post-and-put-media', sendData, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    this.setState({ SelectedGalery: <div><SelectedGalery label={'Manager Images'} callBack={(response) => this.saveSelectedImg(response)}
                    url={`/api/media-property-desc/search-all-by-property/${id_property}/${id_desc_type}/1`} system={ `bengine` }/></div>, load: false })
                    return MComponentes.toast(response.Msg);
                }else if (response.Error == true) {
                    return MComponentes.toast(response.Msg);
                }
            }
        });
    }

   render() {
       return (
           <div className="row">
               <div className="col s12 m12 l12">
                   {/* {this.state.SelectedGalery}
                    *DESCOMENTAR CUANDO YA SE SUBAN IMAGENES */}
                
               </div>
               {this.state.dataForm ? 
                this.arrayInputs.map(input => (
                    <div className='col s12 m6 l6'>{input}</div>
                )) : null}
           </div>
       )
   }
}