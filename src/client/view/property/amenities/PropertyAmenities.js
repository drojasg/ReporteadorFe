import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { CleverAccordion, CleverRequest, MComponentes } from 'clever-component-library'
import GeneralAmenities from './GeneralAmenities/GeneralAmenities'
import CleverConfig from "../../../../../config/CleverConfig";
import {downloadSVG} from './../../../components/SVG/MethodLoadSVG';
//import { StackActions } from '@react-navigation/native';

export default class PropertyAmenities extends Component {
    constructor(props){
        super(props);
        this.getUrlIcons = this.getUrlIcons.bind(this);
        this.countChecked = this.countChecked.bind(this);
        const hotelSelected = localStorage.getItem("hotel")
        const arr = [];
       this.state ={
        hotelSelected : hotelSelected ? true : false,
        propertySelected: JSON.parse(localStorage.getItem("hotel")),
        head:[],
        body:[],
        contador:null,
        countCheck: [],
        dataHotel: [{id:"1",nombre:"general", codeAminitie:"gg"},{id:"2",nombre:"normal", codeAminitie:"nn"}]
       }
    }
    btnView1 = React.createRef();
    btnView2 = React.createRef();
    
    componentDidMount(){
        this.getUrlIcons(()=>{   
            this.getObjectSVG(()=>{
                this.getAmenitiesGroup();
            });
        });  
    }

    getUrlIcons(functionURLicons=()=>{}){
        let idResort = 0;/*this.state.propertySelected.iddef_property;*/
        let requestIcons = {
            search: "Svg_icons",
            type: 3,
            idproperty: idResort
        }

        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/media-general-search", requestIcons, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
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

    getAmenitiesGroup(){
        CleverRequest.get( CleverConfig.getApiUrl('bengine')+"/api/amenity-group/search-type/1", (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                console.log('response.data: ', response.data);
                this.setState({ dataHotel : response.data},()=>{this.createBtn();}); 
            }
            else{
                console.log(error)
            };
        });
    }

    createBtn(){
        const btnView=[]
        this.state.dataHotel.map((dataHotel,index) =>
        btnView[index] = React.createRef()
        )
        this.setState({btnView:btnView},()=>{
            this.createAcordion();
        }) 
    }
    //Se crea la lista de acordeones
    createAcordion(){
        const head2= []
        this.state.dataHotel.map((dataHotel,index) =>
        head2.push({accordion: 'view'+index,label:dataHotel.description,controls:[{control:<button type='button' ref={this.state.btnView[index]} id={"btnView"+index} className='btn'>SAVE CHANGES</button>}]})
        )

       this.setState({head:head2},() =>{
           this.createContent();
       })
    }
    //se crea el cntenido de cada colapsible
    createContent(){
        var jsonBody = {}
        for(var i=0 ; i < this.state.dataHotel.length ; i++ ){
            //General amenities contenido de cada colapsible
            jsonBody["view"+i] = <GeneralAmenities  funcion={this.countChecked} fileSvg={this.state.dataFileSvg} id={"group_"+i} idGroup={this.state.dataHotel[i].iddef_amenity_group } reference={this.state.btnView[i]} />
            //let checkboxes = document.getElementById(this.state.dataHotel[i].iddef_amenity_group).checkbox;

            //console.log("checkboxes", checkboxes)
        }
        this.setState({body:jsonBody})
    }    

    countChecked(F){
        console.log('F.value: ', F.value)
        var y = F.value;
        this.setState({
            contador: F.value.length
        })
        
       
    }

    render() {
        if (this.state.hotelSelected === false) {
            return <Redirect to="/" />
        }
        console.log("state",this.state.contador)
        return (

            this.state.btnView && this.state.head && this.state.body ? 
                <div className="row">
                    <label>{this.state.contador}</label>
                <CleverAccordion
                        id={'test-collapsible'}
                        accordion={
                            {
                                head:this.state.head,
                                body:[
                                   this.state.body
                                ],
                            }
                        }
                       
                    />
                </div>
                :null
        );
    }
}