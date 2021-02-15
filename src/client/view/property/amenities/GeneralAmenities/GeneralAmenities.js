import React, { Component } from 'react';
import { CleverForm, CleverRequest, CleverLoading, MComponentes } from 'clever-component-library';
import CleverConfig from "../../../../../../config/CleverConfig";
import axiosRequest from '../../../../axiosRequest';
import IconsSVGByName from './../../../../components/SVG/IconSVGByName';

class GeneralAmenities extends Component {
    constructor(props) {
        super(props)
        this.refFormView = React.createRef();
        this.generico = this.generico.bind(this)
        this.handlerBtnIcon = this.handlerBtnIcon.bind(this);
        //this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            checked: [],
            load: false
        }
        this.dataResponse = new Array();
    }

    componentDidMount() {
        //se relaciona el boton del colapse con el evento
        let svg= this.props.fileSvg;
        this.setState({fileSvg:svg});
        this.props.reference.current.id ?
            document.getElementById(this.props.reference.current.id).addEventListener("click", this.generico)
            : null
        this.getAmenities();
    }
    generico() {
        this.setState({ load: true });
        let datosForm = this.refFormView.getData()
        let arraycheked = datosForm.values.services;

        let array = [];
        let priority = '';
        let estado = '';
        

        this.state.datos.map((datos, index) => {
            if (arraycheked.includes(datos.description)) {
                priority = datos.is_priority;
                estado = 1;
            }else{
                estado = 0;
                priority = (datos.is_priority == 1)? 0 : datos.is_priority;
            }
            
            array.push({ nombre: datos.description, is_priority: priority, estado: estado })
        })

        let datosHotel = JSON.parse(localStorage.getItem("hotel"));
        let data = {
            datos: array
        }

       
       /*  fetch(CleverConfig.getApiUrl('bengine')+`/api/property-amenity/update/property/${datosHotel.iddef_property}/${this.props.idGroup}`, {
            headers: new Headers({
                'Authorization': 'Bearer ' + localStorage.getItem('jwttoken'),
                'Content-Type': 'application/json; charset=utf-8'
            }),
            method: 'PUT',
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((datos) => {
               console.log(datos)
            })
            .catch((error) => {
                console.error(error);
            }); */

         axiosRequest.put(CleverConfig.getApiUrl('bengine')+`/api/property-amenity/update/property/${datosHotel.iddef_property}/${this.props.idGroup}`,  data, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (error) {
                console.error(response);
            }
            MComponentes.toast(response.Msg);            
            this.setState({ load: false }); 
        }); 
    }

    getAmenities() {
        let datosHotel = JSON.parse(localStorage.getItem("hotel"));
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/property-amenity/search/${datosHotel.iddef_property}/${this.props.idGroup}/1`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                // console.warn(response.data);
                
                this.setState({ datos: response.data }, () => { this.creaArrayChecked(); });
            }
            else {
                this.setState({ datos: [] }, () => { this.creaArrayChecked(); });
            };
        });
    }

    creaArrayChecked() {
        const arrayChecked = []
        //console.log("array->", this.state.datos.length + this.state.checked.length)
        //console.log("datos", this.state.datos)
        this.state.datos.map((datos, index) =>
            datos.estado == 1 ?
                arrayChecked.push(datos.description)
                : null
        )
        this.setState({ checked: arrayChecked }, () => { this.creaInputs(); })
    }

    onChangeCheck(e){
        //this.props.funcion(e)


        
        this.props.funcion(e)
        
        //console.log("checked->", this.state.checked.length + this.state.checked.length)
    }

    creaInputs = async () => {
        const inputsData = []
        this.state.datos.map((datos, index) => {
        let icon = (datos.is_priority == 1)? 'star' : 'star_border';
        let amenityStar = {idAmenity: datos.iddef_amenity};
        var colorI = '';
        var BtnStar = '';
        if (datos.html_icon == '') {
            colorI = '#ccc';
            BtnStar =  false;
        }else{
            BtnStar = true;
        }
    
        
            inputsData.push(
                {
                    row: [
                        { type:'component', component:() => {
                            return (
                                <div className='col s1 m1 l1' style={{marginBlockStart:'1em',marginBlockEnd:'1em'}}>
                                    <a href="javascript:void(0)" onClick={e=>(BtnStar)? this.handlerBtnIcon(e, amenityStar):console.log('accionStar')} id={datos.iddef_amenity}>
                                            <i className="material-icons" style={{color: colorI}}>{icon}</i>
                                        </a>
                                </div>
                            );
                        } },
                        { type: 'checkbox', size: 'col s5 m5 l5', label: '', name: 'services', checkboxs: [{value: datos.description, label: datos.description }], onChange:(e)=>this.onChangeCheck(e) },
                        {type:'component',
                            component:() =>{
                                return(
                                    <div className='col s1 m1 l1'>
                                        <IconsSVGByName
                                            width = {'30px'}
                                            height = {'30px'}
                                            color={'#11ae92'}
                                            nameSVG = {datos.html_icon}
                                            objectSVG={this.state.fileSvg}
                                        /> 
                                    </div>     
                                );
                            }
                        }
                    ]
                }
            )
        })
        this.setState({ inputs: inputsData })

    }

    handlerBtnIcon(e, amenityStar){
        let response = this.state.datos;
        let dataResponse = [];

        response.map((item, key) => {
            let tmpItem = item;
            if (item.iddef_amenity == amenityStar.idAmenity) {
                let priority = (tmpItem.is_priority == 1)? 0 : 1;
                tmpItem.is_priority = priority; 

                this.dataResponse.push(item.name);
            }
            dataResponse.push(tmpItem);
        });
        this.setState({ datos: dataResponse });
        this.creaInputs();
    }

    render() {
        return (
            this.state.inputs ?
                <div className="row">
                    <CleverLoading show={this.state.load}/>
                    <CleverForm
                        id={this.props.id}
                        ref={ref => this.refFormView = ref}
                        forms={[{inputs: this.state.inputs}]}
                        data={{services: this.state.checked}}
                    />
                </div>
                :
                null
        );
    }
}

export default GeneralAmenities;