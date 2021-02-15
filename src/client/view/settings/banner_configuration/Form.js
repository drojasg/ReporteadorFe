import React, { Component } from "react";
import {
  CleverForm,
  Upload,
  CleverRequest,
  MComponentes,
} from "clever-component-library";
import CleverConfig from "../../../../../config/CleverConfig";
import "./style.css";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataInput: {},
      listBrands: [],
      listProperties: [],
      listLanguages: [],
      restrictionParameter: "",
      isEdit: false,
      dataForm: {},
    };
  }

  refForm = React.createRef();
  refSelectBrand = React.createRef();
  refSelectProperty = React.createRef();
  refSelectLanguage = React.createRef();

  componentDidMount() {
    this.getBrands();
    this.getProperties();
    this.getLanguages();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isEdit !== state.isEdit) {
      return {
        isEdit: props.isEdit,
      };
    }
    if (props.iddef_media_headers !== state.iddef_media_headers) {
      return {
        iddef_media_headers: props.iddef_media_headers,
      };
    } else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isEdit !== this.state.isEdit) {
      this.setState({ isEdit: this.props.isEdit });
    }
    if (prevState.iddef_media_headers !== this.state.iddef_media_headers) {
      this.getBannerByID(this.state.iddef_media_headers);
    }
  }

  getBannerByID = async (iddef_media_headers) => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") +
        `/api/media-headers/get/${iddef_media_headers}`,
      (response, error) => {
        if (!error) {
          console.log(response.data);
          let _dataForm = {
            /* LO QUE DEVUELVE LA API
            "code": null,
            "media_name": "MPB-10012020",
            "iddef_media": 511,
            "order": 1,
            "brand_name": null,
            "property_name": "Moon Palace Nizuc Cancun",
            "property_code": "ZMNI",
            "estado": 1,
            "iddef_media_headers": 16,
            "url" 
            */
            code: response.data.code,
            media_name: response.data.media_name,
            iddef_media: response.data.iddef_media,
            order: response.data.order,
            brand_name: response.data.code != null ? response.data.code : "",
            lang_code_list: response.data.lang_code_list,
            property_name:
              response.data.property_code != null
                ? response.data.property_code
                : "", //[response.data.property_code] : "",
            property_code: response.data.property_code,
            estado: response.data.estado,
            iddef_media_headers: response.data.iddef_media_headers,
            url: response.data.url,
          };
          if (_dataForm.code != null) {
            _dataForm.restriction = "brand";
          } //brand_code
          if (_dataForm.property_code != "") {
            _dataForm.restriction = "property";
          }
          if (_dataForm.code == null && _dataForm.property_code == "") {
            _dataForm.restriction = "consolidado";
          }
          console.log(_dataForm);

          this.setState({ dataForm: _dataForm });
          this.setState({ load: false });
        }
      }
    );
  };

  getBrands = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/brand/get",
      (response, error) => {
        if (!error) {
          let brands = [];
          response.data.map((data) => {
            if (data.estado == 1) {
              brands.push({ value: data.code, option: data.name });
            }
          });
          this.setState({ listBrands: brands });
          this.setState({ load: false });
        }
      }
    );
  };

  getProperties = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/property/get?all/",
      (response, error) => {
        if (!error) {
          let properties = [];
          response.data.map((data) => {
            if (data.estado == 1) {
              properties.push({
                value: data.property_code,
                option: data.short_name,
              });
            }
          });
          this.setState({ listProperties: properties });
          this.setState({ load: false });
        }
      }
    );
  };

  getLanguages = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/language/get",
      (response, error) => {
        if (!error) {
          let languages = [];
          response.data.map((data) => {
            languages.push({ value: data.lang_code, option: data.description });
          });
          this.setState({ listLanguages: languages });
          this.setState({ load: false });
        }
      }
    );
  };

  validateForm = (e) => {
    let requiredCount = this.refForm.getData().required.count;
    let _dataInput = this.refForm.getData().values;
    if (requiredCount == 0) {
      this.setState({ dataInput: _dataInput });
      return true;
    } else MComponentes.toast("Complete the data required");
  };

  callBack = async (dataBucket) => {
    let dataToSave = {};
    var _restriction = this.state.restrictionParameter;
    if (this.state.isEdit) {
      //PUT
      dataToSave = {
        iddef_media: this.props.iddef_media,
        iddef_media_headers: this.state.iddef_media_headers,
        iddef_media_type: 1,
        iddef_media_group: 10,
        url: dataBucket.data.objectURL,
        description: "Banner",
        nombre_bucket: dataBucket.data.bucket,
        bucket_type: 1,
        etag: dataBucket.data.ETag,
        show_icon: 0,
        name: this.state.dataInput.media_name,
        tags: {
          tags: [""],
        },
        estado: 1,
        brand_code:
          _restriction == "brand"
            ? this.state.dataInput.brand_name.toString()
            : _restriction == "consolidado"
            ? "consolidado"
            : _restriction == null
            ? ""
            : "",
        property_code:
          _restriction == "property"
            ? this.state.dataInput.property_name.toString()
            : _restriction == null
            ? ""
            : "",
        all_lang: this.state.dataInput.lang_code_list.length == 3 ? 1 : 0,
        lang_code_list: { lang_code_list: this.state.dataInput.lang_code_list },
        order: this.state.dataInput.order,
      };
      this.editData(dataToSave);
    } else {
      //CREATE
      dataToSave = {
        iddef_media_type: 1,
        iddef_media_group: 10,
        url: dataBucket.data.objectURL,
        description: "Banner",
        nombre_bucket: dataBucket.data.bucket,
        bucket_type: 1,
        etag: dataBucket.data.ETag,
        show_icon: 0,
        name: this.state.dataInput.media_name,
        tags: {
          tags: [""],
        },
        estado: 1,
        brand_code:
          _restriction == "brand"
            ? this.state.dataInput.brand_name.toString()
            : _restriction == "consolidado"
            ? "consolidado"
            : _restriction == null
            ? ""
            : "",
        property_code:
          _restriction == "property"
            ? this.state.dataInput.property_name.toString()
            : _restriction == null
            ? ""
            : "",
        all_lang: this.state.dataInput.lang_code_list.length == 3 ? 1 : 0,
        lang_code_list: { lang_code_list: this.state.dataInput.lang_code_list },
        order: this.state.dataInput.order,
      };
      this.saveData(dataToSave);
    }
  };

  editData = (dataToSave) => {
    let arrayDataToSave = [dataToSave];
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") + "/api/media-headers/update",
      arrayDataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "";
          let notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "The data was saved";
            this.props.closeModal();
          } else {
            notificationType = "error";
            notificationMessage = "The data was no saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            hiddeNotificationModal: false,
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  saveData = (dataToSave) => {
    let arrayDataToSave = [dataToSave];
    CleverRequest.post(
      CleverConfig.getApiUrl("bengine") + "/api/media-headers/create",
      arrayDataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "";
          let notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "The data was saved";
            this.props.closeModal();
          } else {
            notificationType = "error";
            notificationMessage = "The data was no saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            hiddeNotificationModal: false,
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  restrictionHandler = (data) => {
    switch (data.value) {
      case "brand":
        this.setState({ restrictionParameter: data.value });
        break;
      case "property":
        this.setState({ restrictionParameter: data.value });
        break;
      case "consolidado":
        this.setState({ restrictionParameter: data.value });
        break;
      default:
        this.setState({ restrictionParameter: null });
        break;
    }
  };

  render() {
    return (
      <div className="row">
        <CleverForm
          id="form-bannerConfiguration"
          ref={(ref) => (this.refForm = ref)}
          data={this.state.dataForm}
          forms={[
            {
              inputs: [
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <span className="col s12 m12 l12 form-section-title">
                            General
                          </span>
                        );
                      },
                    },
                    {
                      type: "text",
                      size: "col s12 m6 l6",
                      name: "media_name",
                      label: "name",
                      alphanumeric: true,
                      characters: true,
                      required: true,
                    },
                    {
                      type: "number",
                      size: "col s12 m6 l3",
                      name: "order",
                      label: "Slider position",
                      required: true,
                    },
                    {
                      type: "select",
                      multiple: true,
                      size: "col s6 m6 l3",
                      name: "lang_code_list",
                      label: "language",
                      required: true,
                      uppercase: false,
                      options: this.state.listLanguages,
                    },
                    {
                      type: "component",
                      component: () => {
                        return (
                          <span className="col s12 m12 l12 form-section-title">
                            Channels
                          </span>
                        );
                      },
                    },
                    {
                      type: "radio",
                      id: "radio-buttons",
                      size: "col s12 m12 l12 channel-radiobuttons",
                      name: "restriction",
                      onChange: (data) => this.restrictionHandler(data),
                      radios: [
                        { value: "brand", label: "Brand" },
                        { value: "property", label: "Property" },
                        { value: "consolidado", label: "Consolidado" },
                      ],
                    },
                    {
                      type: "select",
                      multiple: false,
                      size: "col s6 m6 l6",
                      name: "brand_name",
                      label: "brand",
                      disabled:
                        this.state.restrictionParameter == "brand"
                          ? false
                          : true,
                      required:
                        this.state.restrictionParameter == "brand"
                          ? true
                          : false,
                      uppercase: false,
                      options: this.state.listBrands,
                    },
                    {
                      type: "select",
                      multiple: false,
                      size: "col s6 m6 l6",
                      name: "property_name",
                      label: "property",
                      disabled:
                        this.state.restrictionParameter == "property"
                          ? false
                          : true,
                      required:
                        this.state.restrictionParameter == "property"
                          ? true
                          : false,
                      uppercase: false,
                      options: this.state.listProperties,
                    },
                  ],
                },
              ],
            },
          ]}
        />
        <span className="col s12 m12 l12 form-section-title">Media</span>
        <Upload
          acceptType={true}
          onRef={(fileUpload) => (this.refupload = fileUpload)}
          bucket="booking_engine"
          mode="admin"
          pyApi={true}
          urlServiceUploadBucket={
            CleverConfig.getApiUrl("apiAssetsPy") + "/s3upload"
          }
          acceptTypeContent={["1"]}
          functionBefore={this.validateForm}
          callBack={this.callBack.bind(this)}
        />
      </div>
    );
  }
}
