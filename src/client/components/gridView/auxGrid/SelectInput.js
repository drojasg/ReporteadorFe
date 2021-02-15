import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
const Util = require('./Util');
const CleverRequest = require('./CleverRequest');
const MComponentes = require('./MComponentes');

/**
* ======================================================= WIDGET SELECT ===================================================
* Funcion para crear un select
* @author Angel Solis <angesolis@palaceresorts.com>
*
* @version 1.6
*
* @return object. elemento DOM <SelectInput>
*/
class SelectInput extends Component {
    constructor(props) {
        super(props);
        this.props.onRef(this);
        this._isMounted = false;
        this.id = (this.props.id == "") ?  Util.uniqueID() : this.props.id;
        this.name = (this.props.name == "") ? Util.uniqueID() : this.props.name;
        this.url = this.props.url;
        this.async = this.props.async;
        this.selectClass = this.props.selectClass;
        this.label = this.props.label;
        this.useDefaultOption = this.props.useDefaultOption;
        this.defaultOption = this.props.defaultOption;
        this.entity = this.props.entity;
        this.options = this.props.options;
        this.children = this.props.children;
        this.disabled = this.props.disabled;
        this.required = this.props.required;
        this.isMultiple = this.props.isMultiple;
        this.useCheckAll = this.props.useCheckAll;
        this.textCheckAll = this.props.textCheckAll;
        this.isSearch = this.props.isSearch;
        this.onChange = this.props.onChange;
        this.autoInit = this.props.autoInit;
        this.orderBy = this.props.orderBy;
        this.disabledOptions = this.props.disabledOptions;
        this.itemOptions = this.props.itemOptions;
        this.loadOnceOptions = this.props.loadOnceOptions;
        this.defaultValue = (this.defaultOption.hasOwnProperty("key")) ? this.defaultOption.key : (this.isMultiple) ? [] : "";
        this.activeOptions = [];
        this.disableOptions = [];
        this.state = {
            itemOptions: [],
        }

        this.instance = false;
        this.dropdown = null;

        //render Html
        this.renderLabel = this.renderLabel.bind(this);
        this.renderDefaultOption = this.renderDefaultOption.bind(this);
        this.renderItemOptions = this.renderItemOptions.bind(this);

        //methods
        this.init = this.init.bind(this);
        this.getInstance = this.getInstance.bind(this);
        this.getDataApi = this.getDataApi.bind(this);
        this.handleChanged = this.handleChanged.bind(this);
        this.sortBy = this.sortBy.bind(this);
        this.setActiveOptions = this.setActiveOptions.bind(this);
        this.setDisabledOptions = this.setDisabledOptions.bind(this);
        this.setItemOptions = this.setItemOptions.bind(this);

        //Div contenedor para agregar los input adiccionales
        this.contentAdditionalInputs = document.createElement("div");
        this.contentAdditionalInputs.className ="row";
        this.contentAdditionalInputs.style.position="sticky";
        this.contentAdditionalInputs.style.top="0px";
        this.contentAdditionalInputs.style.zIndex="10";
        this.contentAdditionalInputs.style.marginBottom="0";
        this.contentAdditionalInputs.style.background="white";
        this.renderAdditionalInputs = this.renderAdditionalInputs.bind(this);

        //Search
        this.refInputSearch = React.createRef();
        this.parentModal=undefined;
        this.handleSearch = this.handleSearch.bind(this);
        this.onFocusSearch = this.onFocusSearch.bind(this);
        this.onBlurSearch = this.onBlurSearch.bind(this);

        //Checked All
        this.renderCheckAll = this.renderCheckAll.bind(this);
        this.handleCheckedAll = this.handleCheckedAll.bind(this);
    }

    /**
    * Funcion que se ejecuta al momento de desmontar el componente.
    */
    componentWillUnmount() {
        this._isMounted = false;
        if(this.getInstance()) {
            this.instance.destroy();
        }
    }

    /**
    * Funcion para despues de actualizar el select
    * @return mixed
    */
    componentDidUpdate()
    {
        if (this.autoInit) {
            this.autoInit = false;
            this.init();
        }
    }

    /**
    * Funcion para montar el select
    * @return mixed
    */
    componentDidMount()
    {
        this._isMounted = true;
        if(this.autoInit && !this.loadOnceOptions) {
            if (this.url != "") {
                this.getDataApi();
            }
            else {
                this.setItemOptions(this.itemOptions);
            }
        }
        else if(this.autoInit && this.loadOnceOptions) {
            this.init();
        }
    }

    /**
    * Funcion para Inicializar el Componente
    */
    init()
    {
        if(typeof this.getInstance() == "object") {
            this.instance.destroy();
        }
        MComponentes.Select('#' + this.id,this.options);
        if(this.getInstance() && this.instance.hasOwnProperty("dropdown")) {
            this.dropdown = this.instance.dropdown;
            if (this.isSearch || this.useCheckAll) {
                let firstChild = this.dropdown.dropdownEl.childNodes[0];
                if (typeof firstChild == 'object' && firstChild.nodeName != "DIV" || firstChild == undefined) {
                    this.dropdown.dropdownEl.insertBefore(this.contentAdditionalInputs,firstChild);
                }
                if(this.isSearch) {
                    this.instance.dropdown.options.autoFocus= false;
                    this.dropdown.options.onOpenEnd = this.onOpenSearchEnd.bind(this);
                    this.dropdown.options.onCloseEnd = this.onCloseSearchEnd.bind(this);
                }
            }
        }
    }

    /**
    * Funcion para obtener la instancia del select
    * @return mixed
    */
    getInstance()
    {
        this.instance = MComponentes.getInstance("#" + this.id);
        return this.instance;
    }

    /**
    * Funcion para consumir el servicion del Api REST, para obtencion de los datos para poblar el select.
    * @return array
    */
    getDataApi()
    {
        return CleverRequest.get(this.url, (response) => {
            if (!response.error) {
                if(!this._isMounted) return;
                let data = response.hasOwnProperty('data') ? response.data : response;
                this.setItemOptions((this.entity != "") ? data[this.entity] : data);
            }
        }, this.async);
    }

    /**
    * Funcion del evento change del Select
    * @param {*} event
    */
    handleChanged(event)
    {
        if(typeof(this.onChange) == "function" && this.getInstance() && this.instance.dropdown.isOpen) {
            this.onChange(event);
        }
    }

    /**
    * Funcion para cambiar el value de la instancia del Select
    * @param {*} value
    */
    setValue(value)
    {
        if (this.getInstance()) {
            if(this.isMultiple && (Array.isArray(value) && value.length > 0)) {
                Object.keys(this.instance.el.options).map(key => {
                    let option= this.instance.el.options[key];
                    option.selected = (value.indexOf(option.value) !== -1);
                });
            }
            else {
                this.instance.el.value=value;
            }
        }
    }

    /**
    * Funcion para retornar el value de la instancia
    * @param {*} value
    * @return mixed
    */
    getValue()
    {
        if (this.getInstance()) {
            let selectedValues = this.instance.getSelectedValues();
            if(this.isMultiple) {
                return selectedValues;
            }
            return (selectedValues[0] && selectedValues[0] != null) ? selectedValues[0] : this.defaultValue;
        }
        return this.defaultValue;
    }

    /**
    * Funcion para cambiar el objecto del itemOptions
    * @param {*} itemOptions
    */
    setItemOptions(itemOptions)
    {  return new Promise((resolve,reject) => {
                    if(itemOptions && itemOptions != null && typeof itemOptions == "object") {
                        try {
                            this.autoInit= true;
                            this.setState({ itemOptions: itemOptions },resolve(true));
                        } catch (error) {
                            reject(error.message);
                        }
                    }
                    else {
                        reject(`The ItemOptions not Valid,for the Setting to the Select "${this.name}"`);
                    }
                });
    }

    /**
    * Funcion para retornar el objeto del itemOptions
    * @return mixed
    */
    getItemOptions()
    {
        return this.state.itemOptions;
    }

    /**
    * Funcion para habilidar y deshabilar las opciones del select
    */
    setStateOptions()
    {
        if (this.getInstance()) {
            Object.keys(this.instance.el.options).map(key => {
                let option= this.instance.el.options[key];
                if(this.useDefaultOption && option.value == this.defaultValue) {
                    option.disabled = (this.disabledOptions) ? true : (this.defaultOption.hasOwnProperty("disabled")) ? this.defaultOption.disabled : true;
                }
                else {
                    option.disabled = (this.disabledOptions) ? (this.activeOptions.indexOf(option.value) === -1) :
                                                               (this.disableOptions.indexOf(option.value) !== -1);
                }
            });
        }
    }

    /**
    * Funcion para asignar disabled al select
    * @param boolean disable
    */
    setDisabled(disable = true)
    {
        if (this.getInstance()) {
            this.instance.el.disabled = disable;
            this.init();
        }
    }

    /**
    * Funcion para asignar los item Options activos
    * @param ArrayString key de itemOptions
    */
    setActiveOptions(activeOptions)
    {
        if(!this.disabledOptions || !Array.isArray(activeOptions)) {
            return;
        }
        this.activeOptions= activeOptions;
        this.setStateOptions();
        this.init();
    }

    /**
    * Funcion para asignar los item Options deshabilidatos
    * @param ArrayString key de itemOptions
    */
    setDisabledOptions(disableOptions)
    {
        if(this.disabledOptions || !Array.isArray(disableOptions)) {
            return;
        }
        this.disableOptions= disableOptions;
        this.setStateOptions();
        this.init();
    }

    /**
    * Funcion para crear los Inputs addicionales
    * @return mixed
    */
    renderAdditionalInputs()
    {
        if (!this.isSearch && !this.useCheckAll) return null;
        let search= null;
        if(this.isSearch) {
            search = [
                <input
                    id={"input_search_"+this.id}
                    key={"input_search_"+this.id}
                    type="search"
                    placeholder="Search"
                    data_i18n={"{{'SEARCH'}}"}
                    ref={this.refInputSearch}
                    onKeyUp={this.handleSearch}
                    onFocus={this.onFocusSearch}
                    onBlur={this.onBlurSearch}
                />,
                <i className="material-icons" key={"icon_search_"+this.id}>search</i>
            ];
        }
        return  ReactDOM.createPortal(<div className="input-field col s12">
                                        {search}
                                        <this.renderCheckAll/>
                                    </div>, this.contentAdditionalInputs);
    }

    /**
    * Funcion para buscar
    * @param {event} event
    */
    handleSearch(event=null)
    {
        let li = this.instance.dropdownOptions.querySelectorAll('li>span');
        this.searchChildrens(li,'search',(event != null ) ? event.target.value.toLowerCase() : null);
        this.dropdown.recalculateDimensions();
    }

    /**
    * Funcion recursiva para validar los item en un arreglo
    * @param {array(objs)} childrens
    * @param {string} action accion a validar
    * @param {string} value valor
    * @param {obj} nodeParent nodo padre
    */
    searchChildrens(childrens,action,value,nodeParent=null)
    {
        for (let key in childrens) {
            let child = childrens[key];
            if(typeof child != 'object') { return; }
            let parent = (nodeParent == null) ? child.parentNode : nodeParent;
            if (child.nodeName == "SPAN") {
                parent.hidden = false;
                let nodesChild = child.childNodes[0];
                if(nodesChild && nodesChild.childNodes.length > 1) {
                    this.searchChildrens(nodesChild.childNodes, action, value, parent);
                }
                else if(action == "search" && value != null && nodesChild && nodesChild.nodeValue.toLowerCase().indexOf(value) === -1) {
                    parent.hidden = true;
                }
            }
            else if (action == 'checked' && child.nodeName == "INPUT" && child.type=="checkbox" && child.disabled == false && child.checked != value) {
                child.checked=value;
                child.click();
            }
        }
        return;
    }

    /**
    * Funcion que se dispara al momento de hacer focus en el input de busqueda
    */
    onFocusSearch()
    {
        this.parentModal = M.Modal._modalsOpen;
        M.Modal._modalsOpen=undefined;
        if(!this.instance.isMultiple) {
            this.dropdown.options.closeOnClick = false;
        }
    }

    /**
    * Funcion que se dispara al momento de perder focus en el input de busqueda
    */
    onBlurSearch()
    {
        M.Modal._modalsOpen = this.parentModal;
        if(!this.instance.isMultiple) {
            this.dropdown.options.closeOnClick = true;
        }
    }

    /**
     * Funcion que se dispara al momento terminar de abrir el dropdown
     */
    onOpenSearchEnd()
    {
        this.refInputSearch.current.focus();
    }

    /**
    * Funcion que se dispara al momento terminar de cerrar el dropdown
    */
    onCloseSearchEnd()
    {
        this.refInputSearch.current.value= "";
        this.handleSearch();
    }

    /**
    * Funcion que devuelve el render del checkbox
    * @return mixed
    */
    renderCheckAll()
    {
        return  (this.isMultiple && this.useCheckAll) ? <p>
                                                            <label htmlFor={'check_all_'+this.id} >
                                                                <input type='checkbox' id={'check_all_'+this.id} className='filled-in' onChange={this.handleCheckedAll}/>
                                                                <span>{this.textCheckAll}</span>
                                                            </label>
                                                        </p>
                                                        : null;
    }

    /**
    * Funcion para selecionar todas las opciones
    * @param {event} event
    */
    handleCheckedAll(event)
    {
        let li = this.instance.dropdownOptions.querySelectorAll('li>span');
        this.searchChildrens(li,"checked",event.target.checked);
    }

    /**
    * Funcion que devuelve el render del checkbox
    */
    renderDefaultOption()
    {
        return  (this.useDefaultOption) ? <option
                    value= { this.defaultValue }
                    disabled = {
                        (this.disabledOptions) ? true :
                        (this.defaultOption.hasOwnProperty("disabled")) ? this.defaultOption.disabled : true
                    }
                >
                    { (this.defaultOption.hasOwnProperty("value")) ? this.defaultOption.value : "Choose your Option" }
                </option> : null;
    }

    /**
    * Funcion que devuelve el render del label
    * @return mixed
    */
    renderLabel()
    {
        return (this.label.hasOwnProperty("text") && this.label.text != "") ?
                <label htmlFor={this.id} className={(this.label.class||"")}  data-success={(this.label.success||"")} data-error={(this.label.error||"")}>
                   HOLA OTRA VEZ
                </label>
                : null;
    }

    /**
    * Funcion que ordena las opciones
    * @param {arrayString} itemOptions opciones a ordenar
    * @param {string} by en la que se van a ordenar las opciones
    */
    sortBy(itemOptions,by)
    {
        let ordered =(itemOptions != null) ? Object.keys(itemOptions) : [];
        switch (by) {
            case "key":
                ordered = ordered.sort(function(a, b) {
                    if (a > b) {
                      return 1;
                    }
                    if (a < b) {
                      return -1;
                    }
                    return 0;
                });
            break;
            case "value":
                ordered = ordered.sort(function(a, b) {
                    if (itemOptions[a] > itemOptions[b]) {
                      return 1;
                    }
                    if (itemOptions[a] < itemOptions[b]) {
                      return -1;
                    }
                    return 0;
                });
            break;
        }
        return ordered;
    }

    /**
    * Funcion que devuelve las options
    * @return mixed
    */
    renderItemOptions()
    {
        let options = (this.loadOnceOptions) ? this.itemOptions : this.state.itemOptions;

        let items = (this.orderBy == null) ? Object.keys(options) : this.sortBy(options,this.orderBy);
        return  items.map(key => {
                    return  <option
                                key={key}
                                value={key}
                                disabled={(this.disabledOptions) ?
                                    (this.activeOptions.indexOf(key) === -1) :
                                    (this.disableOptions.indexOf(key) !== -1)}
                            >
                                {options[key]}
                            </option>;
                });
    }

    render() {
        return  <Fragment>
                    <this.renderAdditionalInputs/>
                    <select
                        id={this.id} name={this.name} className={this.selectClass} defaultValue={this.defaultValue}
                        multiple={this.isMultiple} disabled={this.disabled} required={this.required} onChange={this.handleChanged}
                    >
                        <this.renderDefaultOption/>
                        { this.children }
                        <this.renderItemOptions/>
                    </select>
                    <this.renderLabel/>
                </Fragment>;
    }
};

SelectInput.propTypes = {
    id  : PropTypes.string,
    name    : PropTypes.string,
    selectClass : PropTypes.string,
    label : PropTypes.object,
    useDefaultOption : PropTypes.bool,
    defaultOption : PropTypes.object,
    itemOptions : PropTypes.object,
    url    : PropTypes.string,
    async : PropTypes.bool,
    entity : PropTypes.string,
    disabled : PropTypes.bool,
    required : PropTypes.bool,
    autoInit : PropTypes.bool,
    isSearch : PropTypes.bool,
    container : PropTypes.object,
    isMultiple : PropTypes.bool,
    useCheckAll : PropTypes.bool,
    textCheckAll : PropTypes.string,
    disabledOptions : PropTypes.bool,
    loadOnceOptions : PropTypes.bool,
    orderBy : PropTypes.string,
    options: PropTypes.shape({
        classes: PropTypes.string,
        dropdownOptions: PropTypes.shape({
            alignment: PropTypes.oneOf(['left', 'right']),
            autoTrigger: PropTypes.bool,
            constrainWidth: PropTypes.bool,
            container: PropTypes.string,
            coverTrigger: PropTypes.bool,
            closeOnClick: PropTypes.bool,
            hover: PropTypes.bool,
            inDuration: PropTypes.number,
            outDuration: PropTypes.number,
            onOpenStart: PropTypes.func,
            onOpenEnd: PropTypes.func,
            onCloseStart: PropTypes.func,
            onCloseEnd: PropTypes.func
        })
    }),
    onChange: PropTypes.func,
    onRef: PropTypes.func
};

SelectInput.defaultProps = {
    id : "",
    label : {},
    useDefaultOption : true,
    defaultOption : {},
    selectClass : "",
    itemOptions : {},
    url : "",
    entity : "",
    async : true,
    disabled : false,
    required : false,
    isSearch : true,
    isMultiple : false,
    useCheckAll:false,
    textCheckAll : "Choose All Options",
    disabledOptions : false,
    loadOnceOptions : false,
    autoInit : true,
    orderBy : null,
    options: {
        classes: '',
        dropdownOptions: {
            alignment: 'left',
            autoTrigger: true,
            constrainWidth: true,
            container: "body",
            coverTrigger: true,
            closeOnClick: true,
            hover: false,
            inDuration: 150,
            outDuration: 250,
            onOpenStart: null,
            onOpenEnd: null,
            onCloseStart: null,
            onCloseEnd: null
        }
    },
    onChange : null,
    onRef: (context) => {}
};

export default SelectInput;
