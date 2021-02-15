import React, { Component,} from "react";
import PropTypes from 'prop-types';
import './icons.css';
import IconSVGByName from './IconSVGByName';
import {CleverForm, MComponentes} from 'clever-component-library';
import {downloadSVG,getIDsSVG} from './MethodLoadSVG';

export default class ContentIconsSVG extends Component {
    constructor(props) {
        super(props);
        this.props.onRef(this);
        this.changeNameIcon = this.changeNameIcon.bind(this);
        this.OnclickIcon = this.OnclickIcon.bind(this);
        this.getNameIcon = this.getNameIcon.bind(this)
        this.state = {
            textIformation:'',
            colorSelected : ''
        }
    }

    componentDidMount(){
        // console.log('this.props ==> ',this.props);        
        let url = this.props.urlFile;
        let defaultSelect = this.props.valueSelected;
        let colorSVG = this.props.color;
        let fillSelected = this.props.colorIconSelect;
        
        this.setState({valueSelectedFill:defaultSelect,
                        color:colorSVG,
                        colorSelected:fillSelected
                    },()=>{this.loadIcons(url)});
       
    }

    loadIcons(url){
        if(url !== ''){   
            downloadSVG(url).then((dataSVG) =>{
                let error = dataSVG.isError == '' ? false :true;
                let textSVG = dataSVG.svg;
                let dataUri = dataSVG.svg64;
                
                if(error == false){
                    if(textSVG !== undefined){
                        let dataIDS = getIDsSVG(textSVG);
                        this.setState({objectFileSVG:dataUri,dataIcons:dataIDS,dataIconsOrig:dataIDS},()=>{
                            // valueDefault !== '' ?
                                this.OnclickIcon(this.state.valueSelectedFill);
                            // :null;
                        }); 
                    }
                }else{
                    this.setState({objectFileSVG:{},textIformation:'Icons not found'});
                }
            }
            );
            
        }else{this.setState({objectFileSVG:{},textIformation:'Icons not found'});}
    }

    changeNameIcon(e){
        /** Funcion de busqueda, repinta el contenedor de los iconos de acuerdo a lo escrito
         * en el input de busqueda */
        let {dataIconsOrig} = this.state;
        let valNameIcon = e.value;//e.target.value;
        let dataOrig = dataIconsOrig;
        let arrayNameIcons = dataOrig !== undefined ? dataOrig :[];
        let iconsFilter = arrayNameIcons.filter(namesIcons => namesIcons.name.toLowerCase().indexOf(valNameIcon.toLowerCase()) > -1);
        valNameIcon == '' ? iconsFilter = dataOrig : null;
        this.setState({dataIcons:iconsFilter});
    }

    OnclickIcon(valueName){
        let {dataIconsOrig,color,colorSelected} = this.state;
        let valueInput='';
        
        dataIconsOrig.map((dataName)=>{
            if(valueName == dataName.name){ 
                dataName.color = colorSelected;
                valueInput = valueName;
            }else{
                dataName.color = color;
            }
        });
        
        this.iconSelected(valueName);
    }

    iconSelected(valueInput){
        let {dataIconsOrig,search} = this.state;
        let iconsFilter = [];
        iconsFilter = dataIconsOrig.filter(namesIcons => namesIcons.name.toLowerCase().indexOf(valueInput.toLowerCase()) > -1);
        // document.querySelector('input[name=searchIcons]').value = valueInput;
        
        this.setState({dataIcons:iconsFilter, valueSelectedFill:valueInput,search:{searchIcons:valueInput}});
    }

    getNameIcon(){
        let valueName = '';        
        let dataSearch =  this.refFormSearch.getData();
        let dataSearchCount = dataSearch.required.count;
        let dataSearchValue = dataSearch.values;
        if (dataSearchCount > 0) {
            MComponentes.toast("Select an Icon");
            this.setState({ hiddeNotificationModal: false,
                notificationMessage: "Select an Icon", notificationType: "error"});

        } else {
            valueName = dataSearchValue.searchIcons;        
        }
        return valueName;
    }

    render(){
        let {objectFileSVG,dataIcons,textIformation,search} = this.state;
        return(
            objectFileSVG ?
                <div className="contentIcons">
                    {dataIcons ?(
                        <div className='dataIcons'>
                            {/* <div className="input-field inline"> */}
                            <CleverForm 
                                id={'frmSearch'}
                                ref={ref => this.refFormSearch = ref}
                                data={search}
                                forms={[
                                    {
                                        inputs: [
                                            {row:[
                                                {type: 'text', size: 'col s12 m6 l6',placeholder:'Search Icon',
                                                label: this.props.label,name: 'searchIcons',required: true,uppercase: false,
                                                characters:true,alphanumeric:true,onChange:e=>this.changeNameIcon(e)},
                                                {type: 'button', size: 'col s12 m3 l3', label: this.props.nameBtn, 
                                                icon:this.props.iconBtn,onClick: (e) => this.props.onSaveIcon(this.getNameIcon()),
                                                hidden:!this.props.viewBtnSave},
                                            ]}
                                        ]
                                    }
                                ]}
                            />

                            <div className='row'>
                            {dataIcons !== undefined ?
                                <ul >
                                    {
                                        dataIcons.map((dataElementSVG,key)=>{ 
                                            return ( 
                                                <li key={key} className={this.props.size} onClick={e=>this.OnclickIcon(dataElementSVG.name)}>  
                                                    <a className='contentSVG'>
                                                        <IconSVGByName 
                                                            width = {this.props.width}
                                                            height = {this.props.height}
                                                            fill = {dataElementSVG.color}
                                                            objectSVG = {objectFileSVG}
                                                            nameSVG = {dataElementSVG.name}
                                                        />
                                                        <div className="descriptionICON text-center">{dataElementSVG.name}</div>
                                                    </a> 
                                                </li>
                                            )
                                        })   
                                    }
                                </ul>
                            :null}
                            </div>
                        </div>
                    )
                    :
                    <div><h1>{textIformation}</h1></div>}
                </div>  
            :null            
        );
    }
}

ContentIconsSVG.propTypes = {
    onRef: PropTypes.func,
    onSaveIcon: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string,
    color: PropTypes.string,
    urlFile: PropTypes.string,
    size: PropTypes.string,
    valueSelected: PropTypes.string,
    label:PropTypes.string,
    viewBtnSave:PropTypes.bool,
    nameBtn:PropTypes.string,
    iconBtn:PropTypes.string,
}

ContentIconsSVG.defaultProps = {
    onRef: () => {},
    onSaveIcon: ()=>{},
    width:'50px',
    height:'50px',
    color:'#11ae92',
    colorSelected: '#01536d',
    urlFile:'',
    size:'col s2 m2 l2',
    valueSelected:'',
    label:'',
    viewBtnSave:false,
    nameBtn:'',
    iconBtn:''
}