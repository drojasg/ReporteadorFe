import React, { Component } from "react";
import {
  CleverLoading,
  GridView,
  CleverRequest,
  MComponentes,
  CleverForm,
} from "clever-component-library";
import CleverConfig from "../../../../../config/CleverConfig";

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false,
      dataReports: [],
    };
    this.instanceGrid = React.createRef();
  }

  componentDidMount() {
    this.setState({ load: true });
    this.getReportsSettings();
  }

  getReportsSettings = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/reports-setting/get",
      (response, error) => {
        if (!error) {
          this.setState({ dataReports: response.data });
          this.instanceGrid.setDataProvider(this.state.dataReports);
          this.setState({ load: false });
        } else console.log(error);
      }
    );
  };

  toggleStatus = (e, data) => {
    this.setState({ load: true });
    let idreport_setting = data.idreport_setting,
      estado = data.estado == 1 ? 0 : data.estado == 0 && 1;
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") +
        `/api/reports-setting/delete/${idreport_setting}/${estado}`,
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
          idTable="table-reports"
          floatHeader={true}
          onRef={(ref) => (this.instanceGrid = ref)}
          serializeRows={false}
          classTable={"clever-table"}
          filter={false}
          columns={[
            { attribute: "idreport_setting", alias: "ID" },
            { attribute: "subject_letter", alias: "Subject" },
            { attribute: "time", alias: "Time" },
            {
              attribute: "actions",
              alias: "Actions",
              filter: false,
              value: (data, index) => {
                return (
                  <div className="row">
                    <a
                      onClick={(e) => this.toggleStatus(e, data)}
                      title={
                        data.estado == 1
                          ? "Disable report settings"
                          : "Enable report settings"
                      }
                    >
                      <i
                        className={
                          data.estado == 1
                            ? "material-icons teal-text"
                            : "material-icons red-text"
                        }
                      >
                        {data.estado == 1 ? "toggle_on" : "toggle_off"}
                      </i>
                    </a>
                    <a
                      onClick={
                        data.estado == 1
                          ? () => this.props.openModal("edit", data)
                          : () =>
                              MComponentes.toast(
                                "Disabled registers can not be edited"
                              )
                      }
                      title="Edit report settings"
                    >
                      <i
                        className={
                          data.estado == 1
                            ? "material-icons black-text"
                            : "material-icons disabled"
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
