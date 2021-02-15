import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { CleverRequest, Dropdown } from 'clever-component-library'
import CleverConfig from '../../../../config/CleverConfig'
const Util = require('../../components/gridView/auxGrid/Util');

const DATA = {
    dataDropdown: [],
    dataResult: []
};


/**
* Clase para la CARGA DE ARCHIVOS
* @author Avnel Santos <avsantos@palaceresorts.com>
*/
class Upload extends Component {

    constructor(props) {
        super(props);
        /**
        * @property string. Url base del modulo del widget
        this.urlBase = CleverConfig.getApiUrl('frm') + '/bucket/uploadfile';
        @property string. Url de la interfaz para subir archivos al bucket
        this.urlServiceUploadBucket =  props.urlMaskBucket || this.urlBase + '/bucket/uploadfile';
        <Upload acceptType={true} onRef={fileUpload => this.refupload = fileUpload}  bucket="contracts" urlServiceUploadBucket="/api/bucket/upload" urlAssocRecord= "/api/archivo/loadsupport" />}
        parametros que recibe el componente.
        props.idrecord;          Id a relacionar con el bucket , se usa si el guardado esa una tabla de tipo contr_soporte
        props.bucket    bucket a insertar,
        props.urlAssocRecord url del modulo a insrtar la respuesta del bucket,
        props.urlServiceUploadBucket  mask url del bucket a insertar,
        props.isMasck  si se esta usando una urlAssocRecord de tipo /modulo/endpoint se declara true si se usa una urlAssocRecord de tipo CleverConfig.getApiUrl('supplier')+'/proveedor/loadsupport se pone false(es el default)
        props.callBack: funcion calback recive los datos insertados en el bucket y el tipo seleccionado
        isMasck recibe un bool si la url esta enmascarada
        acceptTypeContent recibe un array de este tipo
            [{"value":"1","text":"imagenes", acceptType:"image/",icon:"image"},
            {"value":"2","text":"videos", acceptType:"video/",icon:"music_video"},
            {"value":"3", "text":"pdf", acceptType:"application/pdf", icon:"insert_drive_file"},
            {"value":"4","text":"audio", acceptType:"audio/*" ,icon:'music_note'}]
        */

        this.state = {
            responseApiPy: {},
        }

        this.sendFormBucket = this.sendFormBucket.bind(this);
        this.props.onRef(this);
        this.refSelectTypeAccept = "";
        this.idRecord = this.props.idRecord;
        this.getdataselectTypeAccept = this.getdataselectTypeAccept.bind(this);
        this.handleUploadImagePy = this.handleUploadImagePy.bind(this);
        this.createOptionsdrop = this.createOptionsdrop.bind(this);
        this.validateTypeAccept = this.validateTypeAccept.bind(this);
        this.inputaccept = null;
        this.idupld = Util.uniqueID();
        this.typeAccept = "";
        this.typeId = "";

        this.dropdownRef = React.createRef();
    }

    componentDidMount() {
        // se recupera el formulario
        this.inputaccept = document.getElementById(this.idupld);

    }

    /**
    * Funcion que se encarga de crear  un objeto con id y values que seran reutilizadon en el onchange del dropdown
    * @param
    */
    createOptionsdrop() {

        if (this.props.acceptTypeContent && this.props.acceptTypeContent.length > 0) {
            for (var option in this.props.acceptTypeContent) {
                var op = this.props.acceptTypeContent[option];
                var res2 = {
                    value: op.value,
                    acceptType: op.acceptType,
                }

                DATA.dataResult.push(res2);

            }
        }
        return this.props.acceptTypeContent;
    }

    /**
    * Funcion que se encarga de validar si el arreglo solo contiene un elementeo y asi ponerlo como default en el accepttype
    * @param string. Nombre del id del formulario
    */
    getAcceptType() {

        if (this.props.acceptTypeContent.length == 1) {
            for (var option in this.props.acceptTypeContent) {
                var dataArray = this.props.acceptTypeContent[option];
                this.typeAccept = dataArray.acceptType;
                this.typeId = typeof (dataArray.value) == "undefined" ? dataArray.value : ""
            }
        }

        return this.typeAccept;
    }

    /**
    * Funcion que se encarga de validar si esa seleccionado un type accept
    * @param
    */
    validateTypeAccept(e) {
        if (this.typeAccept == "") {
            e.preventDefault();
            Util.getMsnDialog('warning', "Select Type File");
            return;
        }
    }

    /**
    * Funcion que se encarga de validar en envio del formulario
    * @param string. Nombre del id del formulario
    */
    sendFormBucket(event) {
        event.preventDefault();
        var form = event.target;

        form.status = 0;
        form.segments = [];
        /**
        * Se valida que los nombres no contengan caracteres especiales
        */

        if (!this.validateExpression(form)) {
            // si existe una funcion berofe se ejecuta
            if (this.props.functionBefore()) {
                if (this.props.pyApi) {
                    this.handleUploadImagePy()
                } else {
                    this.getDataSend(form);
                }
            }

        }

        return;
    }


    changeName(value) {
        var contentType = value.type;
        var res = false;
        const nombre = value.name.split(".");
        const ext = nombre.pop();
        var str = nombre.join(" ");
        str = str.replace("á", "a");
        str = str.replace("Á", "A");
        str = str.replace("é", "e");
        str = str.replace("É", "E");
        str = str.replace("í", "i");
        str = str.replace("Í", "I");
        str = str.replace("ó", "o");
        str = str.replace("Ó", "O");
        str = str.replace("ú", "u");
        str = str.replace("Ú", "U");
        str = str.replace("]", "-");
        var patt = new RegExp("[_!¡/?¿#$%&[()=*+^]");
        for (var i = 0; i < str.length; i++) {
            res = patt.test(str[i]);
            if (res) {
                str = str.replace(str[i], "-");
            }
        }
        return [str + "." + ext, contentType];
    }

    handleUploadImagePy() {

        var formData = new FormData();
        var fileField = document.querySelector("input[type='file']");
        var newDatas = this.changeName(fileField.files[0])

        //solo imagenes mayores a 1 mega se comprimen
        if (true) {
            //const fileName = e.target.files[0].name;
            const reader = new FileReader();
            reader.readAsDataURL(fileField.files[0]);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const elem = document.createElement('canvas');

                    const width = 768;
                    const scaleFactor = width / img.width;


                    elem.width = width;
                    elem.height = img.height * scaleFactor;

                    const ctx = elem.getContext('2d');
                    // img.width and img.height will contain the original dimensions
                    ctx.drawImage(img, 0, 0, width, (img.height * scaleFactor));
                    ctx.canvas.toBlob((blob) => {
                        var file = null
                        file = new File([blob], newDatas[0], {
                            type: newDatas[1],
                            lastModified: Date.now()
                        })

                        //volvemos a crear el input file conla intencion de renombrar el archivo sin caracteres especiales
                        /* let file = fileField.files[0]  //this.changeName(fileField.files[0].name);
                        var blob = file.slice(0, file.size, newDatas[1]);
                        var newFile = new File([blob], newDatas[0], { type: newDatas[1] }); */

                        formData.append('filename', file);


                        fetch(this.props.urlServiceUploadBucket + "/" + this.props.bucket, {
                            method: 'POST',
                            body: formData
                        })
                            .then(response => response.json())
                            .catch(error => console.error('Error:', error))
                            .then((response) => {
                                if (typeof this.props.callBack == "function") {
                                    // si existe una funcion callback se manda a ejecutar
                                    response.data.idasset_type = parseInt(this.typeId);
                                    return this.props.callBack(response);
                                }
                                console.log('Success:', response);
                            });


                    }, 'image/jpeg', 1);

                },
                    reader.onerror = error => console.log(error);
            };
        } else {
            let file = fileField.files[0]  //this.changeName(fileField.files[0].name);
            var blob = file.slice(0, file.size, newDatas[1]);
            var newFile = new File([blob], newDatas[0], { type: newDatas[1] });
            formData.append('filename', newFile);

            fetch(this.props.urlServiceUploadBucket + "/" + this.props.bucket, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .catch(error => console.error('Error:', error))
                .then((response) => {
                    if (typeof this.props.callBack == "function") {
                        // si existe una funcion callback se manda a ejecutar
                        response.data.idasset_type = parseInt(this.typeId);
                        return this.props.callBack(response);
                    }
                    console.log('Success:', response);
                });

        }
        return;



    }
    /**
    * Funcion para setear un valor desde una referencia
    * @param string. Instancia del formulario
    */
    setIdUploadFile(data) {
        this.idRecord = data;
    }
    /**
    * Funcion para realizar la carga y tratamiento en binario de los archivos a enviar
    * @param object. Instancia del formulario
    */
    getDataSend(form) {
        form.segments = [];
        var reader, header, file;
        var inputs = form.querySelectorAll('input');

        for (var k = 0; k < inputs.length; k++) {
            var input = inputs[k];
            if (input.type !== 'file') {
                header = "Content-Disposition: form-data; name=\"" + "name-bucket" + "\"\r\n\r\n" + this.props.bucket + "\r\n";
                form.segments.push(header);
            } else {
                var files = input.files;
                for (var i = 0; i < files.length; i++) {
                    file = files[i];
                    reader = new FileReader();
                    reader.segmentIdx = form.segments.length;
                    reader.owner = form;
                    reader.onerror = () => {
                        this.errorHandler(reader);
                    };
                    // se almacena el binario en la posicion del archivo existente
                    reader.onload = (e) => {
                        reader.owner.segments[e.target.segmentIdx] += e.target.result + "\r\n";
                        reader.owner.status--;
                        this.processStatus(reader.owner);

                    };

                    header = "Content-Disposition: form-data; name=\"" + file.name;
                    header += "\"; filename=\"" + file.name;
                    header += "\"\r\nContent-Type: " + file.type + "\r\n\r\n";
                    form.segments.push(header);
                    form.status++;
                    reader.readAsBinaryString(file);

                }
            }
        }

        return this.processStatus(form);
    }

    /**
    * Funcion para validar que no se este introduciendo caracteres no validos en el nombre del pdf
    * retorna un falso o verdadero segun sea el caso.
    */

    validateExpression(form) {
        var inputs = form.querySelectorAll('input');
        var res = false;
        for (var k = 0; k < inputs.length; k++) {
            var input = inputs[k];

            if (input.value.trim() == "") {
                Util.getMsnDialog('warning', 'File Not Found ');
                res = true;
                return res
            }
            if (input.type !== 'file') {
                var str = input.value


                str = str.replace("á", "a");
                str = str.replace("Á", "A");
                str = str.replace("é", "e");
                str = str.replace("É", "E");
                str = str.replace("í", "i");
                str = str.replace("Í", "I");
                str = str.replace("ó", "o");
                str = str.replace("Ó", "O");
                str = str.replace("ú", "u");
                str = str.replace("Ú", "U");
                str = str.replace("]", "-");


                var patt = new RegExp("[_!¡/?¿#$%&[()=*+^]");
                for (var i = 0; i < str.length; i++) {
                    res = patt.test(str[i]);
                    if (res) {
                        str = str.replace(str[i], "-");
                    }
                }
                var patt = new RegExp("[áéíóúÁÉÍÓÚ!¡/?¿#$%&[()=*+^]");
                res = patt.test(str);

                if (res) {
                    Util.getMsnDialog('warning', 'Please check your syntax, it can not contain special characters');
                }
                return res;
            }
        }
    }

    /**
    * Funcion para validar si el formulario a enviar se encuentra serializado
    * @param object. instancia del formulario a enviar
    */
    processStatus(oData) {

        if (oData.status > 0) { return; }
        return this.sendData(oData);
    }

    /**
    * Funcion para realizar en envio por ajax
    * @param object. instancia del formulario a enviar
    */
    sendData(oData) {

        var http = Util.createXMLHttpObject();
        var resContent = [];
        http.submittedData = oData;
        http.onreadystatechange = () => {
            if (http.readyState === 4) {
                if (Util.getCodesSuccessOK(http.status)) {
                    var response = JSON.parse(http.responseText);
                    if (!response.error) {
                        // se envia el responce a guardar en la tabla (contr_soporte supplier/contr)
                        this.getSupportLoadingService(response);

                        //se valida si existe una funcion callback
                        if (typeof this.props.callBack == "function") {
                            for (var filedt in response.responseContent) {
                                var file = response.responseContent[filedt];
                                var res = {
                                    bucket: file.bucket,
                                    eTag: file.eTag,
                                    error: file.error,
                                    nameFile: file.nameFile,
                                    objectURL: file.objectURL,
                                    type: this.typeId,
                                    is_publico: file.is_publico
                                };
                                resContent.push(res)
                            }
                            // si existe una funcion callback se manda a ejecutar
                            this.props.callBack(resContent);
                        }

                        oData.reset();

                    } else {
                        Util.getMsnDialog('warning', response.message)
                    }
                } else {

                    if (http.status != 404) {
                        Util.getMsnDialog('danger', 'error: ' + http.statusText);
                    } else {
                        var res = JSON.parse(http.response);
                        Util.getMsnDialog('warning', res.message);
                    }

                }
            }
        };
        http.open('POST', this.props.urlServiceUploadBucket, true);
        var sBoundary = "---------------------------" + Date.now().toString(16);
        http.setRequestHeader("Content-Type", "multipart\/form-data; boundary=" + sBoundary);
        http.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("jwttoken"));
        http.send(this.getBinar("--" + sBoundary + "\r\n" + oData.segments.join("--" + sBoundary + "\r\n") + "--" + sBoundary + "--\r\n"));

        return http;
    }

    /**
    * Funcion para validar si ocurre un error al momento de la carga de archivos
    * @param object
    */
    errorHandler(evt) {
        switch (evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                Util.getMsnDialog('danger', 'File Not Found!');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                Util.getMsnDialog('danger', 'File is not readable');
                break;
            case evt.target.error.ABORT_ERR:
                break;
            default:
                Util.getMsnDialog('danger', 'An error occurred reading this file.');
        };
        return;
    }

    getBinar(sData) {

        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
        }
        return ui8Data;
    }

    /**
    * Funcion que inserta el response del bucket
    * @param object
    */
    getSupportLoadingService(response) {

        Util.getMsnDialog('info', 'Files Uploaded!');
        if (this.props.urlAssocRecord.length > 0) {

            for (var dataFile in response.responseContent) {
                if (response.responseContent.hasOwnProperty(dataFile)) {
                    var file = response.responseContent[dataFile];
                    if (file.error) {
                        Util.getMsnDialog('danger', 'Error: ' + file.message);
                    } else {
                        // se crea estructura de la tabla a instertar
                        let data = Object.assign({}, {
                            id_referencia_soporte: this.idRecord,
                            nombre_bucket: file.bucket,
                            nombre_archivo: file.nameFile,
                            url: file.objectURL,
                            etag: file.eTag,
                            estado: 1,
                            usuario_creacion: localStorage.getItem('username')
                        });
                        // validacion para saber si la url esta enmascarada
                        if (this.props.isMasck) {
                            CleverRequest.postJSON(this.props.urlAssocRecord, data, (response, error) => {
                                if (!response.error) {
                                    Util.getMsnDialog('success', 'Files Saved! ' + data.nombre_archivo);
                                } else {
                                    Util.getMsnDialog('danger', error.message);
                                }
                            });
                        } else {
                            CleverRequest.post(this.props.urlAssocRecord, data, (response, error) => {
                                if (!response.error) {
                                    Util.getMsnDialog('success', 'Files Saved! ' + data.nombre_archivo);
                                } else {
                                    Util.getMsnDialog('danger', error.message);
                                }
                            });
                        }
                    }
                }
            }

        }

    }

    /**
    * Funcion para seleccionar el tipo de archivo a subir
    *
    */
    getdataselectTypeAccept(e) {
        var positionArray = "";
        this.typeAccept = "";

        if ((e.selectedOption.value).trim() != "") {
            var typ = this.props.acceptTypeContent.find(index => index.value == e.selectedOption.value);
            if (typeof (typ) != "undefined") {
                positionArray = typ["acceptType"];
            }
            this.typeAccept = positionArray;
        }
        this.inputaccept.accept = this.typeAccept;
        this.typeId = e.selectedOption.value;
    }

    refreshForm() {
        var form = document.getElementById("form-upload");
        if (this.props.acceptTypeContent.length > 1) {
            document.getElementById(this.idupld).accept = "";
            this.typeAccept = "";
            this.dropdownRef.current.clear();
        }
        form.reset();

    }
    render() {
        return (

            <form id="form-upload" className="col s12 m12 form-widget-bucket" method="" onSubmit={this.sendFormBucket} action="" encType="multipart/form-data" >
                <label>
                    <span>Upload Files</span>
                </label>
                <div className="row">
                    <div className={(this.props.acceptTypeContent.length > 1) ? "file-field input-field col s12 m7" : "file-field input-field col s12 m12"} onClick={this.validateTypeAccept} >
                        <div className="btn btn-success">
                            <span>File</span>
                            <i className="material-icons right">attach_file</i>
                            <input id={this.idupld} type="file" accept={this.getAcceptType()} multiple />
                        </div>
                        <div className="file-path-wrapper">
                            <input className="file-path validate" type="text" placeholder="Select File" />
                        </div>

                    </div>
                    {
                        (this.props.acceptTypeContent.length > 1) ?
                            <div className=" file-field input-field col s12 m5">
                                <Dropdown ref={this.dropdownRef} data={this.createOptionsdrop()} title=" Select Acept Type " onChange={this.getdataselectTypeAccept} />
                            </div> : null
                    }
                </div>
                <div className="row right-align">
                    <div className="input-field col s6 m2 offset-m8">
                        <button onClick={(e) => this.refreshForm()} type="reset" className="btn btn-warning" ><span>Reset</span>
                            <i className="material-icons right" >refresh</i>
                        </button>
                    </div>
                    <div className="input-field col s6 m2">
                        <button type="submit" className="btn btn-success" ><span>Submit</span>
                            <i className="material-icons right">send</i>
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}

Upload.propTypes = {

    bucket: PropTypes.string,
    idRecord: PropTypes.string,
    urlAssocRecord: PropTypes.string,
    urlServiceUploadBucket: PropTypes.string,
    functionBefore: PropTypes.func,
    onRef: PropTypes.func,
    callBack: PropTypes.func,
    acceptType: PropTypes.bool,
    isMasck: PropTypes.bool,
    acceptTypeContent: PropTypes.array,
    pyApi: PropTypes.bool,

};

Upload.defaultProps = {

    urlServiceUploadBucket: CleverConfig.getApiUrl('frm') + '/bucket/uploadfile',
    functionBefore: () => {
        var val = true;
        return val;
    },
    onRef: (context) => { },
    idRecord: ' ',
    acceptType: false,
    urlAssocRecord: '',
    callBack: (context) => { },
    isMasck: false,
    acceptTypeContent: [],
    pyApi: false,
};
export default Upload;