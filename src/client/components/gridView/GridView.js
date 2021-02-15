import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
/* import { T } from '../i18n/index'; */
import SelectInput from './auxGrid/SelectInput';
const Util = require('./auxGrid/Util');
const CleverRequest = require('./auxGrid/CleverRequest');

/**
* ==================================== WIDGET GRID VIEW =======================================================
* @author Felipe Tun <ftun@palaceresorts.com>
* @version 5.2
*
* Clase para la implementacion del GridView como componente React
* !importante:
*                   validar que el metodo del Api REST reciva como parametros LIMIT, OFFSET, implemtacion en la clase BController->searchPagination($limit, $offset)
*
*/
class GridView extends Component {
    constructor(props) {
        super(props);
        this._isMounted = false;
        /**
        * Bloque para configurar los parametros limit y offset del grid  en base a la paginacion especificada
        */
        this.uniqueID = Util.uniqueID();
        this.limit = props.pagination > 0 ? props.pagination : false;
        this.offset = 0;
        this._data = 0;

        /**
        * Bloque para setaer las propiedades del GridView
        */
        this.idTable = props.idTable != '' ? props.idTable : Util.uniqueID();
        this.url = props.url;
        this.classTable = props.classTable;
        this.optionsRows = props.optionsRows;
        this.columns = props.columns;
        props.serializeRows ? this.getSerialize() : false;
        this.filter = props.filter;
        this.auxCountRows = 1;
        this.tempData = [];
        this.tempFilters = {};
        this.styleFloatTable = this.props.floatHeader ? { position: 'sticky', top : 0 } : {};
        this.styleFloatTheader = this.props.floatHeader ? { position: 'sticky', top : 0, zIndex : 10, backgroundColor : '#01536d'} : {};
        this.numberPage = 1;

        /**
        * Bloque para inicializar propiedades del componente react
        */
        this.props.onRef(this);
        this.state = {
            data : [],
            countRows : 1,
            interfazError : null,
        };

        this.getExpandRow = this.getExpandRow.bind(this);
        this.inputFilter = this.inputFilter.bind(this);
        this.getEnterFilter = this.getEnterFilter.bind(this);
        this.getEffectInfinity = this.getEffectInfinity.bind(this);

        this.refSelectFilter={};
    }

    /**
    * Funcionalidad del componente al montarse sobre el DOM
    * @return mixed
    */
    componentDidMount() {
        this._isMounted = true;
        this._isMounted && this.getDataProviderApiREST(true, true);
    }

    /**
    * se invoca inmediatamente antes de que un componente se desmonte y se destruya.
    */
    componentWillUnmount() {
        this._isMounted = false;
    }

    /**
    * Se realiza el set de los datos para renderizar en el GridView, ejecutando la funcion callBack 'afterMountData'
    * @param array
    * @param boolean
    * @return mixed
    */
    setDataState(data, concat) {
        return this.setState(state => {
            return concat ? { data: state.data.concat(data) } : { data: data };
        }, () => this.props.afterMountData());
    }

    /**
    * Funcion para consumir el servicion del Api REST, para obtencion de los datos para poblar el grid.
    * Se valida si se establece una paginacion, si es declarada como false, no se envian los parametros limit, offset en la url
    * @param boolean. tipo de pericion a realizar
    * @param boolean. para resetaer o no los datos del grid
    * @return array
    */
    getDataProviderApiREST(async, concatData) {
        if (this.url.trim() === '') return false;

        var url = this.url + (this.limit !== false ? `/${this.limit}/${this.offset}` : '');
        return CleverRequest.get(url, (response, error, code) => {
            if (response.error) {
                if (code == 404) {
                    this._data = 0;
                    return this._data;
                }

                if (this._isMounted) {
                    return this.setState({
                        interfazError : 'Error: ' + code + ' ' + (response.message || ''),
                    });
                }
            }

            if (this._isMounted) {
                var data = response.hasOwnProperty('data') ? response.data : response;
                this._data = data.length;
                this.offset = this.offset + this.limit;
                this.tempData = concatData ? this.tempData.concat(data) : data;
                data = this.getDataFilter(data);
                return this.setDataState(data, concatData);
            }
        }, async);
    }

    /**
    * Funcionalidad para setear de forma manual los datos a renderizar en el GridView.
    * @param array
    * @return array
    */
    setDataProvider(data) {
        if (data) {
            if (!Array.isArray(data)) data = [];
            // this.auxCountRows = 1;
            this.getHideColumnsExpand();
            this.tempData = data;
            data = this.getDataFilter(data);
            this._data = data.length;
            this.setDataState(data);
        }

        return data;
    }

    /**
    * Funcion para actualizacion de los resgistros del grid
    * @return mixed
    */
    update() {
        this.getHideColumnsExpand();
        // this.auxCountRows = 1;
        this.offset = 0;
        return this.getDataProviderApiREST(true, false);
    }

    /**
    * Funcionamiento para ocultar las columas expandidad del gridview al refrescar los datos del mismo
    * @return mixed
    */
    getHideColumnsExpand() {
        let table = document.getElementById(this.idTable),
            rows = table ? table.querySelectorAll('tbody tr[expand="expand"]:not([class="hide"])') : null
        ;

        if (rows && rows.length > 0) {
            [].forEach.call(rows, function(tr) {
                tr.classList.add('hide');
                ReactDOM.unmountComponentAtNode(tr.querySelector('td'));
            });
            return true;
        }
        return false;
    }

    /**
    * Funcionalidad para actualizar un row del GridView en base a una url especificada y el index el registro
    * @param string
    * @param index. Valor del callback especificado en la configuracion del grid
    * @return mixed
    */
    updateRow(url, index) {
        return CleverRequest.get(url, (response, error, code) => {
            if (error) return Util.getMsnDialog('danger', code + ' ' + (response.message || ''));

            var data = response.hasOwnProperty('data') ? response.data : response;
            return this.updateRowByIndex(data, index);
        }, false);
    }

    /**
    * Funcionalidad para actualizar un row de la data del GridView en base al index del resgistro, pasando un objecto con los valores nuevos
    * El objecto debe contener los mismo atributos declarados en la configuracion de columnas del componente !importante
    * @param array. Datos nuevo para actualizar el row
    * @param index. Valor del callback especificado en la configuracion del grid
    * @return mixed
    */
    updateRowByIndex(dataRow, index) {
        var cloneData = this.state.data.slice();
        if (cloneData[index]) {
            var id = this.tempData.findIndex(row => { return JSON.stringify(row) == JSON.stringify(cloneData[index]); });
            cloneData[index] = dataRow;
            if (this.tempData[id]) this.tempData[id] = dataRow;
            return this.setDataState(cloneData);
        }

        return false;
    }

    /**
    * Funcionalidad para eliminar de vista un Row del GridView mediante el index
    * @param integer
    * @return array
    */
    deleteRow(index) {
        var cloneData = this.state.data.slice();
        if (cloneData[index]) {
            var id = this.tempData.findIndex(row => { return JSON.stringify(row) == JSON.stringify(cloneData[index]); });
            delete cloneData[index];
            if (this.tempData[id]) delete this.tempData[id];

            let table = document.getElementById(this.idTable);
            let row = table ? table.querySelector(`tr[data-key="${index}-expand"][data-identity="${this.idTable}"]`) : null;
            if (row) row.classList.add('hide');
        }

        return this.setDataState(cloneData);
    }

    /**
    * Funcion para ejecutar la funcion de scroll infinito en base a la paginacion establecida
    * @return mixed
    */
    pagination() {
        // this.auxCountRows = 1;
        if (this.limit !== false && this._data >= this.limit) return this.getDataProviderApiREST(false, true);
        return false;
    }

    /**
    * Funcion para serializar las columnas del grid view
    * @return integer
    */
    getSerialize() {
        var found = this.columns.find(element => {
            return element.alias == '#' && element.defaultColumn == true;
        });

        if (found) return this.columns;

        return this.columns.unshift({
            alias : '#',
            attribute : this.uniqueID,
            defaultColumn : true,
            filter : false,
        });
    }

    /**
    * Funcion que crea el elemento DOM <thead>, dinamicamente con los header especificados para el grid en la configuracion
    * @return object
    */
    getHeadGrid() {
        const head = this.columns.map((row, index) => {
            let alias = row.alias !== undefined ? row.alias : row.attribute.replace('_', ' ');
            let i18n  = row.data_i18n !== undefined ? row.data_i18n : '';
            let classTh = row.visible === undefined || row.visible ? null : 'hide';
        return (<th className={classTh} key={index} style={this.styleFloatTheader}>{alias}</th>);
        });

        return <tr>{head}</tr>;
    }

    /**
    * Funcionalidad para setear los filtros al atribibuto definido como un filtro lista
    * @param string
    * @param object
    * @return mixed
    */
    setDataFilter(attr, dataFilter) {
        if (Object.keys(dataFilter).length == 0) return null;
        if (this.refSelectFilter.hasOwnProperty(attr)) {
            this.refSelectFilter[attr].setItemOptions(dataFilter);
        }

        return null;
    }

    /**
    * Funcion para crear los filtros de las columnas del grid
    * @return object
    */
    getFiltersGrid() {
        const filters = this.columns.map((row, index) => {
            let alias = row.alias !== undefined ? row.alias : row.attribute.replace('_', ' ');
            let classTh = row.visible === undefined || row.visible ? null : 'hide';
            if (row.attribute !== undefined && (row.filter == undefined || row.filter)) {
                var filterGrid = null;
                if (row.filterList !== undefined && row.filterList) {
                    filterGrid =<SelectInput
                                    isSearch={row.filterListSearch||false}
                                    name={row.attribute}
                                    itemOptions={row.dataFilter}
                                    onChange={this.inputFilter}
                                    defaultOption={{key:"",value:"All",disabled:false}}
                                    onRef={select => this.refSelectFilter[row.attribute] = select}
                                />;
                } else {
                    filterGrid = <input
                                    key={index}
                                    type="text"
                                    name={row.attribute}
                                    className={classTh ? 'filter-grid' : null}
                                    placeholder={alias}
                                    data-filter={row.attribute}
                                    onBlur={this.inputFilter}
                                    onKeyDown={this.getEnterFilter}
                                />;
                }
                return (<th className={classTh} key={index}>{filterGrid}</th>);
            }
            return <th key={index}></th>;
        });

        return <tr className="white hide-on-med-and-down">{filters}</tr>;
    }

    /**
    * Funcion para renderizar los elementos en el grid
    * @return object
    */
    getBodyGrid() {
        if (Object.keys(this.state.data).length == 0) return null;

        this.auxCountRows = this.state.countRows;
        const body = this.state.data.map((data, index) => {
            const rows = this.columns.map((row, inx) => {
                let value = row.defaultColumn != undefined ? <b>{this.auxCountRows++}&nbsp;</b> :
                            row.value !== undefined && typeof row.value === 'function' ? row.value(data, index) :
                            row.value !== undefined && typeof row.value !== 'function' ? row.value :
                            data[row.attribute];

                let classTd = row.visible === undefined || row.visible ? null : 'hide';
                if (row.expandCall != undefined && typeof row.expandCall === 'function') {
                    this.getExpandRow(index, data, row.expandCall, (row.alias || 'expand'))
                    this.getExpandRow(index, data, row.expandCall, (row.alias || 'expand'))
                    value = <a
                                title="Expand Row"
                                key={'a-' + inx}
                                className="btn btn-icon btn-link"
                                onClick={() => this.getExpandRow(index, data, row.expandCall, (row.alias || 'expand'))}>
                                <i className="material-icons">{row.icon ? row.icon : 'expand_more'}</i>
                            </a>;
                }
                return (<td key={inx} className={classTd}>{value}</td>);
            });

            let tr = <tr key={index} data-key={index} data-identity={this.idTable}>{rows}</tr>;
            return <Fragment key={index + '-frg'}>
                        {this.getOptionsRows(tr, data)}
                        <tr key={index + '-tr'} data-key={index + '-expand'} expand="expand" data-identity={this.idTable} className="hide debug">
                            <td colSpan={this.columns.length} className="table-collapsible"></td>
                        </tr>
                    </Fragment>;
        });

        return body;
    }


    /**
    * Funcion para agregarle atributos a los row con una funcion anonima
    * @return object
    */
    getOptionsRows(element, data)
    {
        let attrRow = this.optionsRows(data);
        return React.cloneElement(
            element,
            attrRow
        );
    }

    /**
    * Funcionalidad para el evento expand del GridView
    * @param integer
    * @param array
    * @param function
    * @return mixed
    */
    getExpandRow(index, data, callBack, alias) {
        let table = document.getElementById(this.idTable),
            row = table ? table.querySelector(`tr[data-key="${index}-expand"][data-identity="${this.idTable}"]`) : null,
			td = row ? row.querySelector(`td`) : null,
            newContent = true
        ;

        if (row === null) return false;
        if (td === null) return false;

		if(td.getAttribute('alias') == alias && !row.classList.contains('hide')) {
            //ReactDOM.unmountComponentAtNode(td);
            newContent = false;
		}

		if (newContent) {
            let content = callBack(data, index);
            td.setAttribute('alias', alias);
            row.classList.remove('hide');
            return ReactDOM.render(content, td);
		}

        row.classList.add('hide');
        return row;
    }

    /**
    * Funcionalidad para realizar en expand de un row de la tabla en base al metodo de la instancia del grid
    * @param integer
    * @param object <element>
    * @param string
    * @retunr mixed
    */
    getCollapsibleRow(index, content, alias) {
        return this.getExpandRow(index, {}, () => content, alias);
    }

    /**
    * Funcion para crear el elemnto DOM <tfoot>
    * @return object
    */
    getFootGrid() {

        if (this.state.interfazError) {
            return <tr className="red-text">
                        <td colSpan={this.columns.length}><b>{this.state.interfazError}</b></td>
                    </tr>;
        }

        if (this._data < this.limit && this.props.effectInfinity) {
            return <tr>
                        <td colSpan={this.columns.length} className="blue lighten-5">
                            <b data-i18n={"{{'TOTAL_RECORDS_FOUND'}}"}>No More Records Were Found, Total Records Found: </b>
                            <strong>{this.auxCountRows - 1}</strong>
                        </td>
                    </tr>;
        }

        if (this.props.effectInfinity) return null;

        return <tr>
            <td colSpan={this.columns.length} className="center blue lighten-5">
                <div className="col s12 m12">
                    <ul className="pagination text-center">
                        <li className="waves-effect navigate"><a onClick={() => this.getPageManual('before')}><i className="material-icons">chevron_left</i></a></li>
                        <li className="active"><a>Page {this.numberPage}</a></li>
                        <li className="waves-effect navigate"><a onClick={() => this.getPageManual('next')}><i className="material-icons">chevron_right</i></a></li>
                    </ul>
                </div>
            </td>
        </tr>;
    }

    /**
    * Funcionalidad para la paginacion manual del gridview, cuando effectInfinity = false
    * @param string
    * @return mixed
    */
    getPageManual(action) {
        if (action === 'before') {
            if (this.offset > this.limit) {
                this.offset = (this.offset - (this.limit * 2));
                this.auxCountRows = this.offset + 1;
                this.getDataProviderApiREST(false, false);
                return this.numberPage--;
            }

            return Util.getMsnDialog('info', 'Firts Page');
        }

        if (action === 'next') {
            if (this.limit !== false && this._data >= this.limit) {
                this.getDataProviderApiREST(false, false);
                return this.numberPage++;
            }

            return Util.getMsnDialog('info', 'No More Records Were Found');
        }
    }

    /**
    * Funcionalidad para aplicacion de la busqueda en base a los filtros al capturar 'enter' del teclado
    * @param object <element>
    * @return mixed
    */
    getEnterFilter(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            return this.inputFilter(e);
        }
    }

    /**
    * Funcion que se ejecuta en el evento onBlur de input filter de la columna asociada.
    * la cual recorre la tabla en busca de coincidencias ingresadas en el input, validando los filtros aplicados
    * @param object
    * @return
    */
    inputFilter(e) {
        e.preventDefault();
        var obj = e.target,
            data = this.tempData,
            dataFilter = [],
            valueFilter = (typeof obj.value == 'string' ? obj.value.trim() : obj.value)
        ;

        this.tempFilters[obj.name] = { modeStrict : e.target.nodeName == 'SELECT', value : valueFilter};
        if (valueFilter == '') delete this.tempFilters[obj.name];

        dataFilter = this.getDataFilter(data);
        if (dataFilter.length == 0 && this.props.effectInfinity) {
            this.pagination();
            if (this.limit !== false && this._data >= this.limit) return this.inputFilter(e);
        }

        this.getHideColumnsExpand();
        // this.auxCountRows = 1;
        return this.setDataState(dataFilter);
    }

    /**
    * Funcionalidd para la aplicacion de los filtros, buscando el el valor solictado en el atributo del array de los datos del grid
    * @param array
    * @return array
    */
    getDataFilter(data) {
        if (Object.keys(this.tempFilters).length == 0) return data;

        var dataFilter = [];
        for (var rf in this.tempFilters) {
            dataFilter = [];
            dataFilter = data.filter(row => {
                if (this.tempFilters[rf].modeStrict) {
                    return row[rf] && row[rf].toLowerCase() == this.tempFilters[rf].value.toLowerCase();
                }
                return row[rf] && row[rf].toLowerCase().includes(this.tempFilters[rf].value.toLowerCase());
            });
            data = dataFilter;
        }

        return dataFilter;
    }

    /**
    * Se agrega el stylo para el scroll si se activa la paginacion en base a un limit
    * @return object
    */
    getStyle() {
        if (this.limit !== false) {
            return {
                'overflowY' : 'scroll',
                'height' : (Math.round(screen.width / 2) + 80) + 'px',
            };
        }

        return {};
    }

    /**
    * Se obtienen la paginacion con el efecto infinity scroll
    * @param object
    * @return mixed
    */
    getEffectInfinity(event) {
        try {
            event.preventDefault();
            event.stopPropagation();

            if (!this.props.effectInfinity) return null;
            if (this.limit === false) return this.limit;

            let divContainer = document.getElementById(this.uniqueID);
            if (divContainer.offsetHeight + divContainer.scrollTop >= divContainer.scrollHeight) {
                if (this._data >= this.limit && Object.keys(this.tempFilters).length == 0) return this.pagination();
            }
            return null;
        } catch (e) {
            return Util.getMsnDialog('warning', e.message);
        }
    }

    /**
    * Se renderiza el componente
    * @return mixed
    */
    render() {
        return (
            <div className="row">
                <div className="col s12 m12" id={this.uniqueID} style={this.getStyle()} onMouseOver={this.getEffectInfinity}>
                    <table id={this.idTable} className={this.classTable} style={this.styleFloatTable}>
                        <thead>
                            {this.getHeadGrid()}
                            {this.filter ? this.getFiltersGrid() : null}
                        </thead>
                        <tbody>
                            {this.getBodyGrid()}
                        </tbody>
                        <tfoot>
                            {this.getFootGrid()}
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    }
}

GridView.propTypes = {
    onRef: PropTypes.func,
    optionsRows: PropTypes.func,
    url : PropTypes.string,
    pagination : PropTypes.number,
    serializeRows : PropTypes.bool,
    classTable : PropTypes.string,
    filter : PropTypes.bool,
    columns : PropTypes.array,
    effectInfinity : PropTypes.bool,
    idTable : PropTypes.string,
    afterMountData : PropTypes.func,
    floatHeader : PropTypes.bool,
};

GridView.defaultProps = {
    onRef : (context) => {},
    optionsRows : (context) => {},
    pagination : 0,
    filter : true,
    serializeRows : true,
    classTable: 'clever-table responsive-table',
    effectInfinity : true,
    idTable : '',
    url : '',
    afterMountData : () => {},
    floatHeader : false,
};

export default GridView;
