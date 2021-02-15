import React, { Component } from 'react';
import { Modal, MComponentes, CleverRequest } from 'clever-component-library';
import CleverConfig from "./../../../../config/CleverConfig";

class SelectedGalery extends Component {
   constructor(props) {
       super(props)
       this.state = {
            actionModal: false,
            response: [ 
                   { 
                        "iddef_media":217,
                        "name":"report_20200113.xlsx",
                        "url":"https://s3.amazonaws.com/webfiles_palace/books/pro/images/1984.jpeg",
                        "selected":0,
                        "tags":[ 
                            "Test",
                            "Preview",
                            "Python"
                        ]
                    },
                   { 
                      "iddef_media":218,
                      "name":"leBlanc.jpeg",
                      "url":"https://s3.amazonaws.com/webfiles_palace/books/pro/images/El_Hombre_Que_Fue_Jueves.jpeg",
                      "selected":1,
                      "tags":[ 
                         "playa",
                         "arena",
                         "leblanc",
                         "vista panoramica"
                       ]
                    }
                ]
       }
   }

    componentDidMount() {
        this.getImagesUrl();
    }

    componentDidUpdate(prevProps, prevState){
        if (this.props.actionModal !== prevProps.actionModal) {
            if (this.props.actionModal == true) {
                // console.log(this.props.actionModal);
                this.setState({ actionModal: true });       
                this.openModalEdit();
            }else if (this.props.actionModal == false) {
                // console.log(this.props.actionModal);
                this.setState({ actionModal: false });           
                this.closeModalEdit();
            }
        }
    }

    getImagesUrl = async () => {
        /*consumo api*/
        CleverRequest.get(CleverConfig.getApiUrl(this.props.system) + this.props.url, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    this.setState({ response: response.data });
                    this.getImagenAssets(response.data);
                }else{
                    return MComponentes.toast(response.Msg);
                }
            }
        });
    }

    openModalEdit() {
        return this.refModal.getInstance().open();
    }

    closeModalEdit() {
        return this.refModal.getInstance().close();
    }
    
    
    getImagenAssets = async (response) => {
        if (response.length > 0) {
            let Items = this.state.response.filter(i => i.selected == 1);
            let media_type_img = Items.filter(i => (i.iddef_media_type)? i.iddef_media_type == 1 : i.selected == 1).length;
            let media_type_tour = Items.filter(i => i.iddef_media_type == 4).length;

            let ItemSelected = (media_type_tour > 0)?
                <div className='col s12 m12 l12'>
                    <h6>Selected Images: {media_type_img} - Virtual Tour: {media_type_tour}</h6>
                </div> : 
                <div className='col s12 m12 l12'>
                    <h6>Selected Images: {media_type_img}</h6>
                </div>;

            this.setState({ ImgAssets: <div className="col s12 m12 l12 xl12">
                <div className="row">
                    <div className='row'>
                        <div className='col s12 m8 l8'>
                            <input type='text' placeholder="Search..." id="nameSearch" name='nameSearch' onChange={(e) => {this.handleChange(e)}}/>                    
                        </div>
                        <div className='col s12 m4 l4'>
                            <button type='button' onClick={(e) => this.saveImages(e)} id="saveImages" className="btn">SAVE IMAGES</button>                    
                        </div>
                        
                        {ItemSelected}                    
                    </div>
                    
                    <div className="row mx-0"> 
                        {response.map((image, key) => {
                            let urlImage = (!image.iddef_media_type)? image.url :
                            (image.iddef_media_type==4)? 'https://s3.amazonaws.com/webfiles_palace/clever-qa/booking_engine/virtual_tour.png' : image.url;
                            let colorChange = (image.selected == 1)? '#f78f20' : '#ffffff';
                            return(<div className="col s12 m4 l4" key={key}>
                                <a href="javascript:void(0)" key={key} onClick={(e) => {this.handlerBtnIcon(e, response)}} id={image.iddef_media}>
                                    <div className="contenedor" id={image.iddef_media} style={{width:'100%', height:'250px', margin:'5px 5px 10px', boxShadow:'0 0 12px #a2a2a2d9', borderRadius:'5px', backgroundColor: colorChange}}>
                                        <img src={urlImage} style={{width:'100%', height:'80%'}} id={image.iddef_media}></img>
                                        
                                        <div className="center" id={image.iddef_media} style={{width:'100%', height:"auto"}} id={image.iddef_media}>
                                            <span className="title" id={image.iddef_media} style={{color:'#333837',width:'100%',height:'100%'}}>{image.hasOwnProperty('descripcion') ? image.descripcion : image.name}</span>
                                            {image.hasOwnProperty('tags') && setCustomTags(image)}
                                        </div>
                                    </div>
                                </a>
                            </div>);
                        })}
                    </div>                

                </div>
            </div>});
        }else{
            this.setState({ 
                ImgAssets: <div className='row'>
                    <div className='col s12 m12 l12'>
                        <h6>Selected Images: {count}</h6>                    
                    </div>

                    <div className='col s12 m8 l8'>
                        <h6>Resultado sin elementos</h6>                 
                    </div>
                </div>
            });
        }

    }

    handlerBtnIcon(e, datos){        
        //changeStatusImage ----
        let data = [];
        this.state.response.map((item, key) => {
            let tmpItem = item;
            if(item.iddef_media == e.target.id){
                let status = (item.selected==1)? 0 : 1;
                tmpItem.selected = status;
                data.push(tmpItem);
            }else{
                data.push(item);
            }
        })

        /**
         * Guardamos en State de toda la lista existente los datos actualizados
         */
        this.setState({ response: data })

        /*
        *Buscamos dentro de todos los elementos existentes cuales estan en pantalla para cambiar los datos y reflejarlos en pantalla
        */
        let newResponse = [];
        datos.map((i, k) => {            
            const found = data.find(element => element.iddef_media == i.iddef_media);
            newResponse.push(found);
        })
        
        /**Retornamos la nueva lista actuallizada de lo mostrado en pantalla  */
        return this.getImagenAssets(newResponse);
    }

    saveImages(e){
        // Funcion para agregar listado de imagenes
        let {response} = this.state;
        //saveImageAsset ----
        let dataFilter = response.filter(item  => item.selected == 1);

        // this.setState({ response: dataFilter })

        if (this.props.callBack != null){
            if (dataFilter.length > 0) {
                return this.props.callBack(dataFilter);                
            }else{
                return MComponentes.toast("Please selected a option");
            }
        }else{
            return MComponentes.toast("Please use a function callBack");
        }
    }

    render() {
        var ImgAssets = (this.state.ImgAssets)? this.state.ImgAssets : null;
        var BtnClose = (this.props.btnClose)? {click: e => this.props.actionClose('CLOSE'), buttonClass: "red", text:"CLOSE"} :
        {click: e => console.log('action'), buttonClass: "red", text:"CLOSE"} ;
        return (
            <Modal
                isFull={true}
                autoOpen = {this.props.actionModal}
                openButton={{icon : this.props.icon, iconClass : "left", buttonClass : "waves-effect waves-light btn",
                text : this.props.label, click : this.openChangeTitle}} onRef={modal => this.refModal = modal}
                defaultButton={BtnClose}
                >
                <div className="row">
                    {ImgAssets}
                </div>
            </Modal>
        )
    }

    
    /**
     * Inicio de funciones ejecutadas por cada constante del componente
    */
    handleChange(e){
        let dataSearch = [];
        this.state.response.map((item, key) => {
            let tag = item['tags']['tags'].filter(x => x.toLowerCase().includes(e.target.value.toLowerCase()))
            if (tag.length > 0) {
                dataSearch.push(item);
            }
        })

        return this.getImagenAssets(dataSearch);
        /*
            // En caso de que se requira un filtro mas completo (rompase en caso de incendios)
            let filter = [];
            if(data.hasOwnProperty('descripcion')){
                filter = data.filter(x => x.descripcion.toLowerCase().includes(e.target.value.toLowerCase()))
            }else{
                console.log('filter =>', data);
                filter = data.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase()))
            }

            return filter
        */
    }

}

SelectedGalery.defaultProps = {
    callBack    : null, //(context) => {},
    id          : 1,
    label       : '',
    url         : '',
    system      : 'bengine',
    icon        : 'burst_mode'
};
export default SelectedGalery;

function setCustomTags (i) {

    return ( <div>
        {(i.tags)? ( i.tags.tags.map((tag, idx) =>
            <p key={idx} style={customTagStyle}> {tag} </p>) ) : ( null )}
    </div>);
}

/**
 * Estilos para los componentes del Assets View
*/
const customTagStyle = {
    // fondo = #22272d, letra = #fffffff
    color: 'white',
    wordWrap: "break-word",
    display: "inline-block",
    backgroundColor: "#22272d",
    height: "auto",
    fontSize: "80%",
    fontWeight: "400",
    lineHeight: "1",
    padding: ".2em .6em .3em",
    borderRadius: ".25em",
    verticalAlign: "baseline",
    margin: "2px",
};

const centerCardStyle = {
    // fondoCard = #eafeff;
    borderRadius: '4px',
    boxShadow: '0 0 4px',
    display: 'inherit',
};