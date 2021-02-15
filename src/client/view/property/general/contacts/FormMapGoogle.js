import React, { Component } from 'react';
import CleverConfig from "../../../../../../config/CleverConfig";
import { compose, withProps, lifecycle, createEagerFactory } from 'recompose';
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

let urlMaps= CleverConfig.getApiUrl('apimaps');

const Containermap = compose(  
    withProps({
        googleMapURL: urlMaps,
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `600px`}} />,
        mapElement: <div style={{ height: `100%` }} />,
    }),
    lifecycle({
        componentDidMount() {
          this.iniMap();
        },
        
        iniMap(){
          const refs = {};          
          this.setState({
            positionMap: this.props.positionMap,
            onMarkerMounted: ref => {
              refs.marker = ref;
            },
    
            onPositionChanged: () => {
              let latitud = refs.marker.getPosition().lat();
              let longitud = refs.marker.getPosition().lng();
              this.props.onMakerPositionChanged(latitud,longitud);
            },
          });
        }
        ,
        componentDidUpdate(prevProps, prevState){
          let coordenadasNew ={}
          if (prevProps.positionMap.lat !== this.props.positionMap.lat || prevProps.positionMap.lng !== this.props.positionMap.lng) {
            coordenadasNew.lat= parseFloat(this.props.positionMap.lat);
            coordenadasNew.lng= parseFloat(this.props.positionMap.lng);

              this.setState({
                positionMap:coordenadasNew
              });    
          }
        }
    }),
    withScriptjs,
    withGoogleMap
)(props => (
  <GoogleMap defaultZoom={12}
         defaultCenter={props.positionMap}>
        {props.isMarkerShown && (
            <Marker
                position={props.positionMap}
                draggable={true}
                ref={props.onMarkerMounted}
                onPositionChanged={props.onPositionChanged}
                
            />
        )}
  </GoogleMap>   
));

export default class FormMapGoogle extends Component {
  constructor(props){
    super(props);
    this.handleOnchange = this.handleOnchange.bind(this);
    this.cargaMapa = this.cargaMapa.bind(this);
    this.onMakerPositionChanged = this.onMakerPositionChanged.bind(this);
    this.state ={
      positionMarket:{},  
      dataMaps:props.dataMaps,
      isMarkerShown: false
    }
    this.FormMap;
  }

  componentDidMount(){
    this.cargaMapa(this.props.dataMaps.latitud, this.props.dataMaps.longitud);
  }
  
  cargaMapa(latitud,longitud){
    let positionNew = {};
    positionNew.lat = latitud ? parseFloat(latitud) :0;
    positionNew.lng = longitud ? parseFloat(longitud) :0;

    this.setState({
      positionMarket:positionNew
    });
  }

  handleOnchange (event) {    
    const input = event.target
    const name = input.name;
    let value = input.value;

    this.setState( prev => {
      const coordenadas = Object.assign({}, prev.positionMarket);
      coordenadas[name] = value;
      return { positionMarket: coordenadas }
    });

  }

  onMakerPositionChanged(latitud,longitud) {
    this.cargaMapa(latitud,longitud);
  }

  render() {
    const { positionMarket } = this.state;
    return (
      positionMarket.lat !== undefined ?
      <div>
        <div className='row'>
          <Containermap 
            isMarkerShown={true} 
            onMakerPositionChanged={this.onMakerPositionChanged}
            positionMap={this.state.positionMarket}
          />
        </div>        
        <div className='row'>
          <div className='col s6 m6 l6'>
            <label >Latitud:</label>
            <input type='text' id='latitud' name='lat' value={positionMarket.lat} onChange={this.handleOnchange}></input>
          </div>
          <div className='col s6 m6 l6'>
            <label >Longitud:</label>
            <input type='text' id='longitud'  name='lng' value={positionMarket.lng} onChange={this.handleOnchange}></input>
          </div>
        </div>
      </div>       
      :null
    );
  }
}
