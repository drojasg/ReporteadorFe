import React, { Component } from 'react';
import { CleverForm, CleverRequest, MComponentes } from 'clever-component-library';
import CleverConfig from "./../../../../../../config/CleverConfig";
import {downloadSVG} from './../../../../components/SVG/MethodLoadSVG';
import IconsSVGByName from '../../../../components/SVG/IconSVGByName';

export default class Amenities extends Component {
   constructor(props) {
       super(props)
       this.handlerAddRoomType = this.handlerAddRoomType.bind(this);
       this.handlerBtnIcon = this.handlerBtnIcon.bind(this);
       this.refForm = React.createRef();
       this.state = {
            dataForm: {},
            hotelData: JSON.parse(localStorage.getItem('hotel')),
            update: null,
            itemBandera: false,
            iconStatus: false,
       }
       this.arryCheck = new Array();
       this.input = new Array();
       this.arrayDefault = new Array();
       this.dataResponse = new Array();
   }

   getAmenities = async (hotel, room) => {
        this.input = new Array();
        // parametro 1.- IdPropiedad || 2.- IdHabitacion
        CleverRequest.get(CleverConfig.getApiUrl('bengine') + `/api/room-amenity/get/`+hotel+'/'+room, (response, error) => {
            if (response.status == 403) {                
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (response.Error==false) {
                this.getFormByAmenities(response.data);
                this.setState({ response: response });
            }else{
                MComponentes.toast(response.Msg);
            }
        });
    }

    componentDidMount() {
        let hotel = this.state.hotelData.iddef_property;
        let room = 0;
        
        this.getUrlIcons(()=>{   
            this.getObjectSVG(()=>{
                this.getAmenities(hotel, room);
            });
        }); 
        this.props.reference.current.id ?
           document.getElementById(this.props.reference.current.id).addEventListener("click", this.handlerAddRoomType)
           : null;
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.dataUpdateAmeniti !== prevProps.dataUpdateAmeniti) {
            if (this.props.dataUpdateAmeniti == '') {
                // this.fetchCreate();
                this.setState({ update: null , response: ''});
                this.componentDidMount();
            }else{
                // this.fetchUpdate();
                // console.log(this.props.dataUpdateAmeniti);
                let room = this.props.dataUpdateAmeniti.iddef_room_type_category;
                let hotel = this.state.hotelData.iddef_property;
                this.getAmenities(hotel, room);
                this.setState({ update: room });
            }
        }
    }

    handlerBtnIcon(e, amenityStar){
        let response = this.state.response.data;
        let dataResponse = [];

        response.map((item, key) => {
            let tmpItem = item;
            if (item.group == amenityStar.seccion) {
                item.items.map( (amenityItem, keys) => {
                    if (amenityItem.iddef_amenity == amenityStar.idAmenity) {
                        let priority = (tmpItem.items[keys].is_priority == 1)? 0 : 1;

                        tmpItem.items[keys].is_priority = priority; 

                        this.dataResponse.push(amenityItem.name);
                    }
                });
            }
            dataResponse.push(tmpItem);
        });
        
        this.getFormByAmenities(dataResponse);    
    }
    
    getFormByAmenities = async (response) => {
        this.input = [];
        this.arrayDefault = [];
        this.arryCheck = [];
        response.map((itemGroup, keyGroup) =>{
            const respItems = itemGroup.items;
            this.input.push({ row: [
                {type:'component', component:() =>{
                return (<div><div className='col s12 m12 l12' key={keyGroup}><label>{itemGroup.group}</label></div></div>);}},
            ]});
            
            respItems.map((itemAmeniti, keyAmeniti) =>{
                var icon = '';
                var colorI = '';
                var BtnStar = '';

                if (itemAmeniti.estado == 1) {
                    this.arrayDefault.push(itemAmeniti.name);
                }

                if (itemAmeniti.is_priority == 0) {
                    icon = 'star_border';
                }else if (itemAmeniti.is_priority == 1){
                    icon = 'star';
                }

                if (itemAmeniti.html_icon == '') {
                    colorI = '#ccc';
                    BtnStar =  false;
                }else{
                    BtnStar = true;
                }

                let amenityStar = {seccion: itemGroup.group, idAmenity: itemAmeniti.iddef_amenity};

                this.input.push({ row: [
                    {type:'component', component:() =>{
                        return (
                            <div className='col s12 m1 l1' id={itemAmeniti.iddef_amenity} style={{marginBlockStart:'1em',marginBlockEnd:'1em'}}>
                                <a href="javascript:void(0)" onClick={e=> (BtnStar)? this.handlerBtnIcon(e, amenityStar) : console.log('accionStar')} id={itemAmeniti.iddef_amenity}>
                                    <i className="material-icons" id={itemAmeniti.iddef_amenity} style={{color: colorI}}>{icon}</i>
                                </a>
                            </div>);}},
                    {type:'checkbox', id:itemAmeniti.iddef_amenity, size:'col s13 m3 l3',name:'itemAmeniti', checkboxs:[{value:itemAmeniti.name, label:itemAmeniti.name}]},
                    {type:'component',component:() =>{
                        return(<div className='col s12 m2 l2'>
                            <IconsSVGByName
                                width = {'35px'}
                                height = {'35px'}
                                color={'#11ae92'}
                                nameSVG = {itemAmeniti.html_icon}
                                objectSVG={this.state.dataFileSvg}
                            /> 
                        </div>);
                    }}
                ]});


            })
        })
        this.props.load(false);
        
    }

    handlerAddRoomType(){
        let amenitiesForm = this.AmenitiesForm.getData();   

        this.request = {};
        let amenities = [];
        let arrayItems = [];
        let ItemAmenities = amenitiesForm.values.itemAmeniti;
        this.state.response.data.map((item, key) =>{
            item.items.find(Items => {
                arrayItems.push(Items);
            })
        })

        let array = [];
        let priority = '';
        let estado = '';

        arrayItems.map((datos, index) => {
            if (ItemAmenities.includes(datos.name)) {
                priority = datos.is_priority;
                estado = 1;
            }else{
                estado = 0;
                priority = (datos.is_priority == 1)? 0 : datos.is_priority;
            }
            
            if (estado == 1) {
                array.push({ nombre: datos.name, is_priority: priority, estado: estado })                
            }
        })

        this.request.amenities = array;

        if (this.state.update != null) {
            this.request.idUpdate = this.state.update;
        }else{
            this.request.idUpdate = null;            
        }

        

        this.props.getForms(this.request);
    }


    getUrlIcons(functionURLicons=()=>{}){
        let idResort = 0;/*this.state.propertySelected.iddef_property;*/
        let requestIcons = {
            search: "Svg_icons",
            type: 3,
            idproperty: idResort
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/media-general-search", requestIcons, (response, error) => {
            /* if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            } */
            if (!error) {
                if (!response.Error) {
                    if(response.data.length > 0){
                        let dataMedia = response.data[0];
                        let valueURL = dataMedia.url;                    
                        this.setState({urlIcons:valueURL,load: false},functionURLicons); 
                    }else{
                        this.setState({urlIcons:'',load: false},functionURLicons);  
                    }
                } else {
                    this.setState({urlIcons:'',load: false},functionURLicons);                    
                }                
            }else{
                this.setState({urlIcons:'',load: false},functionURLicons); 
            }
        });
    }

    getObjectSVG(loadFileSVG=()=>{}){ 
        let urlIcons = this.state.urlIcons;
        console.log(urlIcons);
        downloadSVG(urlIcons).then((dataSVG) =>{
            let error = dataSVG.isError == '' ? false :true;
            let dataUri = dataSVG.svg64;            
            if(error == false){
                this.setState({dataFileSvg:dataUri},loadFileSVG);
            }else{
                this.setState({dataFileSvg:''},loadFileSVG);
            }
        });   
    }

    render() {
        return (
            <CleverForm
                id={'AmenitiesForm'}
                ref={ref => this.AmenitiesForm = ref}
                forms={[
                    { inputs: this.input }, 
                ]}
                data={{
                    itemAmeniti: this.arrayDefault,
                }}
            />
        )
    }
}