import React, { Component }  from 'react';
import CleverConfig from '../../../../../config/CleverConfig';
import {CleverRequest,CleverAccordion,ConfirmDialog,Modal,CleverForm,MComponentes,CleverLoading, CleverInputSelect } from 'clever-component-library';
import ViewsFilters from './viewFilters';

export default class FilterMain extends Component  {
    constructor(props) {
        super(props);
        this.openModalFilter = this.openModalFilter.bind(this);
        this.onDeleteFilter = this.onDeleteFilter.bind(this);
        this.changeOptionFrmByLang = this.changeOptionFrmByLang.bind(this);

        this.state = {
            hotelData: JSON.parse(localStorage.getItem('hotel')),            
            load : false,
            listDataByLanguaje:[],
            valuesHiddenTab:{isActive:['Activate','',''], 
                             isHidden:[false,true,true],
                             styleTabSelected:[{border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' },
                                                {border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' }]
                            },
            isVisible: false
        }

        this.refFormFilter = React.createRef();
    }

    componentDidMount() {   
        this.startFilter(); 
    }

    getLanguages(){
        this.setState({ load: true});
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/language/get`, (response, error) => {           
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let language = [];
                response.data.map((data) => {
                    let infoInput = {};
                    infoInput.value = `${data.lang_code}`;
                    infoInput.option = data.description
                    language.push(infoInput);
                });
                this.setState({ listsLang:language,load: false});
            }else{
                this.setState({ load: false});
            }
        });
    }

    startFilter(){
        this.setState({load: true});
        this.getDataFilters(()=>{
            this.setState({isVisible:true,load : false,});    
        });
    }

    getDataFilters(functionGetFilter=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/filters/get?all`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let dataAll = [];
                    let dataEnable = [];
                    let dataDisable = [];
                    response.data.map((itemFilter, key) => {                   
                        let tmpItem = itemFilter;
                        dataAll.push(tmpItem);

                        itemFilter.estado == 0 
                        ?
                            dataDisable.push(tmpItem)
                        :
                            dataEnable.push(tmpItem);
                    });

                    this.setState({ 
                        listFilterAll:dataAll,
                        listFilterEnable:dataEnable,
                        listFilterDisable:dataDisable,
                    },functionGetFilter);
                }else{
                    this.setState({ load: false},functionGetFilter);
                }                               
            } else{
                this.setState({ load: false},functionGetFilter);
            }                      
        });             
    }

    getFilterByID(idFilter,functionFilterByID=()=>{}){
        CleverRequest.get(CleverConfig.getApiUrl('bengine')+`/api/filters/search/${idFilter}`, (response, error) => {
            if (response.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                if (response.Error == false) {
                    let data = response.data;
                    let dataRequest={};
                    let listDataLang = [];
                    dataRequest.iddef_filters = data.iddef_filters;
                    dataRequest.estado = String(data.estado);
                    dataRequest.name = data.name;

                    data.info_filters_by_lang.map((infoByLang)=>{
                        let info =[];                       
                        info.lang_code = `${infoByLang.lang_code}`;
                        info.description = infoByLang.description;
                        info.idLangDescription = infoByLang.iddef_text_lang_description;
                        dataRequest[info.lang_code+'_name']=infoByLang.description;
                        listDataLang.push(info)
                    });

                    dataRequest.infoAmenityByLang = listDataLang;
                    this.setState({dataFilter:dataRequest,},functionFilterByID);                    
                }else{
                    this.setState({dataFilter:{iddef_filters:0,name:'',estado:''}, load: false},functionFilterByID);
                }                               
            } else{
                this.setState({dataFilter:{iddef_filters:0,name:'',estado:''},load: false},functionFilterByID);
            }                      
        });    
    }

    OnclickOptionTab(optionSelect){
        let valIsActivateTab = this.state.valuesHiddenTab.isActive;
        let valIsHiddenTab = this.state.valuesHiddenTab.isHidden;
        let valueStylesTabs = this.state.valuesHiddenTab.styleTabSelected;
        let newArrayActivate = [];
        let newArrayHidden = [];
        let newStyles = [];

        valIsActivateTab.map((activate,key)=>{
            let valActive = optionSelect == key ? 'Activate' : '';
            newArrayActivate.push(valActive)
        });
        valIsHiddenTab.map((hiddenTab,key)=>{
            let valIsHidden= optionSelect == key ? false: true;
            newArrayHidden.push(valIsHidden)
        });
        valueStylesTabs.map((stylesTabs,key)=>{
            let valStyles= optionSelect == key ? {border:'1px solid #01536d', backgroundColor: '#01536d',color: 'white' }:{border:'1px solid #01536d', backgroundColor: 'white',color: '#01536d' };
            newStyles.push(valStyles)
        });
        
        this.setState({valuesHiddenTab:{
                                        isActive:newArrayActivate,
                                        isHidden:newArrayHidden,
                                        styleTabSelected:newStyles
                                    }
                    });
    }

    openModalFilter(idFilter){
        this.getLanguages();
        this.setState({load: true,dataFilter:null});        
        if(idFilter !== 0){
            this.getFilterByID(idFilter,()=>{
                this.optionsLang(()=>{
                    this.createFrmByLang(()=>{
                        this.setState({isVisibleFrm:true, load: false});
                        this.refModalAddFilter.getInstance().open();
                    });
                });
            })
        }else{
            this.setState({ options:[], dataFilter:{iddef_filters:0, name:'', estado:''}, listDataByLanguaje:[], isVisibleFrm:false, load: false}); 
            this.refModalAddFilter.getInstance().open();
        } 
    }

    optionsLang(functionByLang=()=>{}){
        let listInfoByLang = this.state.dataFilter.infoAmenityByLang;
        let listValLang = this.state.listsLang;
        let defaultOptionLang = [];
        
        listInfoByLang.map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                dataRow.lang_code == lang.value?
                    defaultOptionLang.push(lang.value)
                :null;
            });
        });

        this.setState({options:defaultOptionLang},functionByLang);
    }

    onDeleteFilter(e,data){
        if(data !== undefined){
            let id = data.iddef_filters;
            this.getFilterByID(id,()=>{
                let requestFilter = {};
                let dataCurrent = this.state.dataFilter;

                if(dataCurrent.iddef_filters !== 0){
                    requestFilter.name = dataCurrent.name;
                    requestFilter.estado = data.estado == 1 ? 0 : 1

                    this.setState({ idFilter:id, deleteFilter: requestFilter });
                    this.refConfirmDeleteFilter.getInstance().open();  
                }
               
            });
        }
    }

    confirmDeleteFilter(){
        let idFilter = this.state.idFilter;
        let requestFilter = this.state.deleteFilter;
        this.setState({ load: true});
        idFilter !== undefined && requestFilter !==undefined ?
            this.updateDelateAPI(idFilter,requestFilter)
        :null                
    }

    clearGrids(functionClear=()=>{}){
        this.setState({isVisible:false,listFilterAll:null,
            listFilterEnable:null,
            listFilterDisable:null},functionClear); 
    }

    getConfigAddButtonsModal(){
        let buttons = [

            <button className="btn waves-effect waves-light" onClick={e => this.saveFilter(e)} >
                <i className="material-icons right">send</i><span data-i18n="{{'SUBMIT'}}">Submit</span>
            </button>
        ];
        return buttons;
    }

    getListAttribByLang(listLangAct,dataFrmValue){
        let arrayOrigLang = this.state.dataFilter.infoAmenityByLang;
        let dataLang =[];
        let valuesBaja = [];
        let valuesAltaOnlyNew = [];
        let valuesAltaOnlyOrig = [];
        let arrayOrigFin = [];

        arrayOrigLang !== undefined ?
            arrayOrigLang.map((dataOrig)=>{
                arrayOrigFin.push(dataOrig.lang_code)
            })
        : null;
        
        //valores de estatus baja
        valuesBaja = arrayOrigFin.filter(x => !listLangAct.includes(x));
        //valores de alta
        valuesAltaOnlyOrig = listLangAct.filter(x => arrayOrigFin.includes(x));
        valuesAltaOnlyNew = listLangAct.filter(x => !arrayOrigFin.includes(x));

        //se arma el response de attributos por idioma de las bajas
        valuesBaja.map((valueLanB)=>{
            arrayOrigLang.map((dataOrig)=>{
                let nameByLang = {};

                if(valueLanB == dataOrig.lang_code){
                    nameByLang.lang_code = valueLanB;
                    nameByLang.text = dataOrig.description;
                    nameByLang.attribute ='description';
                    nameByLang.estado = 0;
                    nameByLang.iddef_text_lang= dataOrig.idLangDescription;
    
                    dataLang.push(nameByLang);
                }
            });
        });
        //se arma el response de las altas por idioma de los atributos
        valuesAltaOnlyOrig.map((dataByLang)=>{
            arrayOrigLang.map((dataOrig)=>{
                let nameByLang = {};

                if(dataByLang == dataOrig.lang_code){
                    nameByLang.lang_code = dataByLang;
                    nameByLang.text = dataFrmValue[dataByLang+'_name'];
                    nameByLang.attribute ='description';
                    nameByLang.estado = 1;
                    nameByLang.iddef_text_lang = dataOrig.idLangDescription;

                    dataLang.push(nameByLang);
                }
            });
        });

        valuesAltaOnlyNew.map((dataOnlyNew)=>{
            let nameByLang = {};
            
            nameByLang.lang_code = dataOnlyNew;
            nameByLang.text = dataFrmValue[dataOnlyNew+'_name'];
            nameByLang.attribute ='description';
            nameByLang.estado = 1;
            nameByLang.iddef_text_lang = 0;

            dataLang.push(nameByLang);
        });

        return dataLang;
    }

    saveFilter(e){
        let dataFrm = this.refFormFilter.getData();
        let dataFrmValue = dataFrm.values;
        let listLangAct = this.state.options;
        listLangAct = listLangAct.sort();

        if (dataFrm.required.count > 0) {
            MComponentes.toast("Complete the data required");
            this.setState({ hiddeNotificationModal: false, notificationMessage: "Complete the data required", notificationType: "error"});
        } else {
            this.setState({load: true});
            let requestFilter = {};
            let idFilter = dataFrmValue.iddef_filters !== '' ? dataFrmValue.iddef_filters : 0;
            let generalname = listLangAct.length >0 ? dataFrmValue[listLangAct[0]+'_name'] : '';

            requestFilter.name = generalname;
            requestFilter.estado = parseInt(dataFrmValue.estado);
            requestFilter.info_filters_by_lang = this.getListAttribByLang(listLangAct,dataFrmValue);

            // console.log('requestFilter: ', requestFilter);


            // console.log('requestFilter == ',JSON.stringify(requestFilter));
            if(idFilter !== 0){
                this.updateAPI(idFilter,requestFilter);
            }else{
                let newRequest = [];
                requestFilter.info_filters_by_lang.map((dataOnlyNew)=>{
                    let newData = {};

                    newData.attribute = dataOnlyNew.attribute;
                    newData.estado = dataOnlyNew.estado;
                    newData.lang_code = dataOnlyNew.lang_code;
                    newData.text = dataOnlyNew.text;
                    
                    newRequest.push(newData);
                });

                requestFilter.info_filters_by_lang = newRequest;
                this.createAPI(requestFilter);
            }
        }
    }
    
    createAPI(requestFilter){
        CleverRequest.post(CleverConfig.getApiUrl('bengine') +"/api/filters/create", requestFilter, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let notificationType = "";
                let notificationMessage = "";

                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was saved";
                    this.refModalAddFilter.getInstance().close();
                    this.clearGrids(()=>{this.startFilter()}); 

                } else {                          
                    notificationType = "error";
                    notificationMessage = "The data was no saved";
                    this.setState({load: false});
                }

                MComponentes.toast(notificationMessage);
                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
            }else{
                this.setState({ load: false});
            }   
        });
    }

    updateAPI(idFilter,requestFilter){
        CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/filters/update/${idFilter}`, requestFilter, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let notificationType = "";
                let notificationMessage = "";

                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was saved";
                    this.refModalAddFilter.getInstance().close();
                    this.clearGrids(()=>{this.startFilter()}); 

                } else {
                    notificationType = "error";
                    notificationMessage = "The data was no saved";
                    this.setState({load: false});
                }

                MComponentes.toast(notificationMessage);
                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
            }else{
                this.setState({load: false});
            }   
        });
    }

    updateDelateAPI(idFilter,requestFilter){
        CleverRequest.put(CleverConfig.getApiUrl('bengine') +`/api/filters/update-status/${idFilter}`, requestFilter, (data, error) => {
            if (data.status == 403) {
                MComponentes.toast('YOU ARE NOT AUTHORIZED');
                this.setState({ load: false });
                return
            }
            if (!error) {
                let notificationType = "";
                let notificationMessage = "";

                if (!data.Error) {
                    notificationType = "success";
                    notificationMessage = "The data was saved";
                    this.refModalAddFilter.getInstance().close();
                    this.clearGrids(()=>{this.startFilter()}); 

                } else {
                    notificationType = "error";
                    notificationMessage = "The data was no saved";
                    this.setState({load: false});
                }

                MComponentes.toast(notificationMessage);
                this.setState({hiddeNotificationModal: false, notificationMessage: notificationMessage, notificationType: notificationType });
            }else{
                this.setState({load: false});
            }   
        });
    }

    changeOptionFrmByLang(e){
        let langSelected = e.values; 
        this.state.dataFilter == undefined ? this.setState({dataFilter:{}}):null
        this.setState({options:langSelected},()=>{
            this.createFrmByLang(()=>{
                this.setState({isVisibleFrm:true});             
            });
        });
    }

    createFrmByLang(functionByLang=()=>{}){
        let listInfoByLang = this.state.options;
        let listValLang = this.state.listsLang;
        let arrayLang =[];
        
        listInfoByLang.sort().map((dataRow,key)=>{
            let row = {};
            //Obtener el valor de la descripcion
            listValLang.map((lang)=>{
                if(dataRow == lang.value){ 
                    row ={row: [
                        {type: 'text',size: 'col s12 m9 l9', placeholder:`Insert Filter in ${lang.option}`, 
                        label: `* ${lang.option}`, name: lang.value+'_name',
                        required: true,alphanumeric:true,characters:true},
                    ]}
                }else{
                    row={row:[]}
                }
            arrayLang.push(row);
            });                
        });

        this.setState({listDataByLanguaje:arrayLang},functionByLang);
    }

    render(){  
        let {load,dataFilter,valuesHiddenTab,listFilterAll,listFilterEnable,listFilterDisable,isVisible, listsLang, listDataByLanguaje, options, isVisibleFrm} =this.state;
        return(
            <div className='row'>
                <CleverLoading show={load}/> 
                <CleverAccordion 
                    id={'collapsibleFilter'}
                    accordion={{
                            head: [{
                                    accordion:'filter',
                                    label:'FILTER',
                                    controls:[{control:<button type='button' id="btnAddFilter" 
                                    onClick={()=>this.openModalFilter(0)} 
                                    className='btn'>ADD FILTER</button>}]
                                }],
                            body:[{
                                    filter:isVisible == true ? <div>
                                        <ul id="tabs-swipe-demo" className="tabs" >
                                            <li className="tab col s4" onClick={()=>this.OnclickOptionTab(0)}>
                                                <a style={valuesHiddenTab.styleTabSelected[0]} href="#allFilter" className={valuesHiddenTab.isActive[0]} >ALL FILTER</a>
                                            </li>
                                            <li className="tab col s4" onClick={()=>this.OnclickOptionTab(1)}>
                                                <a style={valuesHiddenTab.styleTabSelected[1]} href="#enableFilter" className={valuesHiddenTab.isActive[1]}>ENABLE FILTER</a>
                                            </li>
                                            <li className="tab col s4" onClick={()=>this.OnclickOptionTab(2)}>
                                                <a style={valuesHiddenTab.styleTabSelected[2]} href="#desableFilter" className={valuesHiddenTab.isActive[2]}>DISABLE FILTER</a>
                                            </li>
                                        </ul>
                                        <div id="allFilter" hidden={valuesHiddenTab.isHidden[0]}>
                                            <ViewsFilters 
                                                type = {'ALL'}
                                                dataFilter = {listFilterAll}   
                                                onDelete = {this.onDeleteFilter}
                                                openModal = {this.openModalFilter}
                                            />  
                                        </div>
                                        <div id="enableFilter" hidden={valuesHiddenTab.isHidden[1]}>
                                            <ViewsFilters 
                                                type = {'ENABLE'}
                                                dataFilter = {listFilterEnable}   
                                                onDelete = {this.onDeleteFilter}
                                                openModal = {this.openModalFilter}
                                            />       
                                        </div>
                                        <div id="desableFilter"hidden={valuesHiddenTab.isHidden[2]}>
                                            <ViewsFilters 
                                                type = {'DISABLED'}
                                                dataFilter = {listFilterDisable}   
                                                onDelete = {this.onDeleteFilter}
                                                openModal = {this.openModalFilter}
                                            />
                                        </div>
                                    </div>:null
                                }],
                        }}
                /> 

                <ConfirmDialog
                            onRef={confirm => this.refConfirmDeleteFilter = confirm}
                            yesButton={{ click: () => this.confirmDeleteFilter() }}
                />  

                <Modal
                    addButtons={this.getConfigAddButtonsModal()}
                    idModal="addAmenity"
                    isFull={true}
                    onRef={modal => this.refModalAddFilter = modal} 
                >
                    <div className="row">
                    <h5>{'FILTER'}</h5>
                        <div>
                            <CleverInputSelect
                                id={'input-amount'}
                                size={'input-field col s12 m3 l3'}
                                label={'Properties'}
                                name={'hotel'}
                                multiple={true}
                                options={listsLang}
                                defaultValues={options}
                                onChange = {this.changeOptionFrmByLang}
                            />
                            {dataFilter && listDataByLanguaje && isVisibleFrm == true?
                            <CleverForm  
                                id={'formFilter'}
                                data={dataFilter}
                                ref={ref => this.refFormFilter = ref}
                                forms={[
                                        {
                                            inputs: [{row: [
                                                        {type: 'number',size: 'col s12 m6 l6',label: '',name: 'iddef_filters',required: false, hidden:true},
                                                    ]},
                                                    ].concat(
                                                        listDataByLanguaje
                                                    )
                                                    .concat(
                                                        [{row: [
                                                            {type:'select',size:'col s12 m3 l3',label:'* Estado', name:'estado', placeholder:'Select Estado', required:true,
                                                            options:[{value:'0',option:'Disable'},{value:'1',option:'Enable'}]},
                                                        ]}],
                                                    )
                                        },
                                ]}
                            /> : null}
                        </div>
                    </div>
                </Modal>
            </div>            
        );

    }
}