import React, { Component } from "react";
import {
  CleverLoading,
  GridView,
  CleverRequest,
  MComponentes,
} from "clever-component-library";
import CleverConfig from "../../../../../config/CleverConfig";

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false,
      dataBanners: [],
    };
    this.instanceGrid = React.createRef();
  }

  componentDidMount() {
    this.setState({ load: true });
    this.getBanners();
  }

  getBanners = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/media-headers/get-all?order=estado&desc=1",
      (response, error) => {
        if (!error) {          
          let data = response.data !== undefined ? response.data :[];

          data.map(dataMedia =>{
            dataMedia.textESTADO= dataMedia.estado == 0 ? "DISABLE" :"ENABLE";
          });
          
          this.setState({ dataBanners: data });
          this.instanceGrid.setDataProvider(this.state.dataBanners);
          this.setState({ load: false });
        } else console.log(error);
      }
    );
  };

  toggleStatus = (e, data) => {
    this.setState({ load: true });
    let _data = [
      {
        iddef_media: data.iddef_media,
        iddef_media_headers: data.iddef_media_headers,
        estado: data.estado == 1 ? 0 : data.estado == 0 ? 1 : undefined,
      },
    ];
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") + "/api/media-headers/update-status",
      _data,
      (data, error) => {
        if (!error) {
          let notificationType = "";
          let notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "Status was modified succesfully";
            this.setState({ load: false });
            this.componentDidMount();
          } else {
            notificationType = "error";
            notificationMessage = "Status was not modified";
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

  render() {
    return (
      <>
        <CleverLoading show={this.state.load} />
        <GridView
          idTable="gridView-Table"
          floatHeader={true}
          onRef={(ref) => (this.instanceGrid = ref)}
          serializeRows={false}
          filter={true}
          columns={[
            { attribute: "code", alias: "Brand code", visible: false }, //TO PRINT BRAND NAME IN EDIT MODAL
            {
              attribute: "property_code",
              alias: "Property code",
              visible: false,
            }, //TO PRINT PROPERTY NAME IN EDIT MODAL
            { attribute: "iddef_media_headers", alias: "ID" },
            { attribute: "media_name", alias: "Name" },
            { attribute: "order", alias: "Slider position" },
            { attribute: "brand_name", alias: "Brand" },
            { attribute: "property_name", alias: "Property" },
            {
              attribute: "consolidado",
              alias: "Consolidado",
              filter: false,
              value: (data, index) => {
                return (
                  <i className="material-icons left black-text">
                    {data.brand_name != null
                      ? ""
                      : data.property_name != null
                      ? ""
                      : "check"}
                  </i>
                );
              },
            },
            {
              attribute: "lang_code_list",
              alias: "Language",
              filter: false,
              value: (data, index) => {
                return (
                  <span className="text-uppercase">
                    {data.lang_code_list.join(", ")}
                  </span>
                );
              },
            },
            { attribute: "textESTADO", alias: "Status" },
            {
              attribute: "actions",
              alias: "Actions",
              filter: false,
              value: (data, index) => {
                return (
                  <div className="row">
                    {/* <a className="col s4 m4 l4" title="View banner"><i className="material-icons left black-text">visibility</i></a> */}
                    <a
                      onClick={(e) => this.toggleStatus(e, data)}
                      title={
                        data.estado == 1 ? "Disable banner" : "Enable banner"
                      }
                    >
                      <i
                        className={
                          data.estado == 1
                            ? "material-icons left teal-text"
                            : "material-icons left red-text"
                        }
                      >
                        {data.estado == 1 ? "toggle_on" : "toggle_off"}
                      </i>
                    </a>
                    <a
                      onClick={
                        data.estado == 1
                          ? () => this.props.openModal(data)
                          : () =>
                              MComponentes.toast(
                                "Disabled registers can not be edited"
                              )
                      }
                      title="Edit banner"
                    >
                      <i
                        className={
                          data.estado == 1
                            ? "material-icons left black-text"
                            : "material-icons left disabled"
                        }
                        style={{ paddingLeft: "0.5rem" }}
                      >
                        mode_edit
                      </i>
                    </a>
                  </div>
                );
              },
            },
          ]}
        />
      </>
    );
  }
}
