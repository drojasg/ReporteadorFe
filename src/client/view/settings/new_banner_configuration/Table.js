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
      CleverConfig.getApiUrl("bengine") + "/api/media-banners/get?all",
      (response, error) => {
        if (!error) {
          this.setState({ dataBanners: response.data });
          this.instanceGrid.setDataProvider(this.state.dataBanners);
          this.setState({ load: false });
        } else console.log(error);
      }
    );
  };

  toggleStatus = (e, data) => {
    this.setState({ load: true });
    let iddef_media_banners = data.iddef_media_banners,
      estado = data.estado == 1 ? 0 : data.estado == 0 && 1;
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") +
        `/api/media-banners/update-status/${iddef_media_banners}/${estado}`,
      {},
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
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
            { attribute: "iddef_media_banners", alias: "ID", filter: false },
            { attribute: "name", alias: "Name" },
            {
              attribute: "brand_codes",
              alias: "Brand",
              filter: false,
              value: (data, index) => {
                return <span>{data.brand_codes.join(", ")}</span>;
              },
            },
            {
              attribute: "property_codes",
              alias: "Property",
              filter: false,
              value: (data, index) => {
                return <span>{data.property_codes.join(", ")}</span>;
              },
            },
            {
              attribute: "lang_codes",
              alias: "Language",
              filter: false,
              value: (data, index) => {
                return (
                  <span className="text-uppercase">
                    {data.lang_codes.join(", ")}
                  </span>
                );
              },
            },
            {
              attribute: "actions",
              alias: "Actions",
              filter: false,
              value: (data, index) => {
                return (
                  <div className="row">
                    <a
                      onClick={() => this.props.openModal("edit", data)}
                      title="Edit banner"
                    >
                      <i
                        className={"material-icons black-text"}
                        style={{ paddingRight: "0.5rem" }}
                      >
                        mode_edit
                      </i>
                    </a>
                    <a
                      onClick={(e) => this.toggleStatus(e, data)}
                      title={
                        data.estado === 1 ? "Disable banner" : "Enable banner"
                      }
                    >
                      <i
                        className={
                          data.estado === 1
                            ? "material-icons teal-text"
                            : "material-icons red-text"
                        }
                      >
                        {data.estado === 1 ? "toggle_on" : "toggle_off"}
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
