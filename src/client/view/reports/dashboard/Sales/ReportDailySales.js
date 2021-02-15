import React, { Component } from "react";
import CleverConfig from "../../../../../../config/CleverConfig";
import {
  CleverRequest,
  MComponentes,
  CleverLoading,
  CleverForm,
  GridViewLigth,
} from "clever-component-library";
import ContentReports from "../ContentReports";
import "./style.css";

export default class ReportDailySales extends Component {
  constructor(props) {
    super(props);
    const hotelSelected = JSON.parse(localStorage.getItem("hotel"));
    this.state = {
      load: false,
      viewGrid: false,
      bodyReports: <div></div>,
      dataInput: {},
      dataGeneral: {},
      dataItems: [],
      requestBody: {},
    };
  }

  componentDidMount() {
    this.createForm();
  }

  createForm = () => {
    let head = (
      <div className="row">
        <div className="col s12 m12 l12 ">
          <CleverForm
            id={`dates`}
            ref={(ref) => (this.formDates = ref)}
            data={this.state.dataDates}
            forms={[
              {
                inputs: [
                  {
                    row: [
                      {
                        type: "date",
                        colDate: "col s12 m5 l5",
                        name: "fromDate",
                        placeholder: "start date *",
                        required: true,
                      },
                      {
                        type: "date",
                        colDate: "col s12 m5 l5",
                        name: "toDate",
                        placeholder: "end date *",
                        required: true,
                      },
                      {
                        type: "button",
                        size: "col s12 m2 l2",
                        label: "search",
                        icon: "search",
                        fullSize: true,
                        onClick: (e) => this.validateForm(e), //postConsolidatedDailySales(e),
                      },
                    ],
                  },
                ],
              },
            ]}
          />
        </div>
      </div>
    );
    this.setState({ headReports: head, load: false });
  };

  validateForm = (e) => {
    let requiredCount = this.formDates.getData().required.count,
      dataInput = this.formDates.getData().values;
    if (
      requiredCount == 0 ||
      (dataInput.fromDate !== "" && dataInput.toDate !== "")
    ) {
      this.setState({ dataInput: dataInput }, () =>
        this.postConsolidatedDailySales()
      );
      return true;
    } else MComponentes.toast("Complete the data required");
  };

  postConsolidatedDailySales = () => {
    let body = {
      from_date: `${this.state.dataInput.fromDate} 00:00:00`, //"2020-10-10 00:00:00",
      to_date: `${this.state.dataInput.toDate} 00:00:00`, //"2020-12-17 00:00:00",
    };

    this.setState({ requestBody: body, load: true });

    CleverRequest.post(
      CleverConfig.getApiUrl("bengine") +
        `/api/reports/consolidated-daily-sales-api`,
      body,
      (response, error) => {
        if (response != "") {
          this.setState({
            dataGeneral: [response.data_general],
            dataItems: response.data_items,
            load: false,
          });
          this.createTables();
        } else {
          MComponentes.toast(error);
          this.setState({ load: false });
        }
      }
    );
  };

  createTables = () => {
    let body = (
      <>
        <GridViewLigth
          idTable="gridView-dataGeneral"
          data={this.state.dataGeneral}
          floatHeader={true}
          serializeRows={false}
          classTable={"clever-table teal-header responsive-table striped mb-2"}
          columns={[
            {
              attribute: "average_daily_rate_on_total_room",
              alias: "Average daily rate on total rooms",
            },
            {
              attribute: "avg_los",
              alias: "Average LOS",
            },
            {
              attribute: "bookings",
              alias: "Bookings",
            },
            {
              attribute: "total_booking_value",
              alias: "Total booking value (room only)",
            },
            {
              attribute: "total_room_nights",
              alias: "Total room nights",
            },
          ]}
        />
        <GridViewLigth
          idTable="gridView-dataItems"
          data={this.state.dataItems}
          floatHeader={true}
          serializeRows={false}
          classTable={"clever-table teal-header responsive-table striped"}
          columns={[
            {
              attribute: "hotel_name",
              alias: "Resort",
            },
            {
              attribute: "total_booking_value",
              alias: "Total booking value (room only)",
            },
            {
              attribute: "bookings",
              alias: "Bookings",
            },
            {
              attribute: "total_room_nights",
              alias: "Total room nights",
            },
            {
              attribute: "avg_daily_rate",
              alias: "Average daily date",
            },
            {
              attribute: "avg_los",
              alias: "Average LOS",
            },
          ]}
        />
      </>
    );

    this.referenceReport.setBody(body, () => {
      this.referenceReport.setStatusBodyReports(true);
    });
  };

  downloadfile = (e, type) => {
    let request = {},
      typeDownload = "";
    request = this.state.requestBody;
    typeDownload = type === "pdf" ? "pdf" : "excell";

    this.setState({ load: true });

    const url =
      CleverConfig.getApiUrl("bengine") +
      "/api/reports/consolidated-daily-sales-" +
      typeDownload;
    const req = new XMLHttpRequest();
    const method = "POST";
    req.responseType = "arraybuffer";
    req.open(method, url);
    req.timeout = 120000;

    req.ontimeout = () => {
      //submitRatesExcelRef.current.enable()
      reject(req.response);
    };

    req.onerror = () => {
      submitRatesExcelRef.current.enable();
      reject(req.response);
    };

    req.send(JSON.stringify(request));
    req.addEventListener("load", (event) => {});

    //console.log("typeDownload: ", typeDownload);
    req.onload = function () {
      //submitRatesExcelRef.current.enable()
      let status = req.status;
      if (status === 201) {
        fileRatesExcel.current.clean();
      } else if (status === 200) {
        if (typeDownload == "pdf") {
          saveAs(
            new Blob([req.response], {
              type:
                "application/pdf.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "ReportDailySales.pdf"
          );
        } else {
          saveAs(
            new Blob([req.response], {
              type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            "ReportDailySales.xlsx"
          );
        }
      } else {
        var decodedString = String.fromCharCode.apply(
          null,
          new Uint8Array(this.response)
        );
        var obj = JSON.parse(decodedString);
        var msg = ((obj.errors || {}).rates || [
          obj.message || "Something went wrong!",
        ])[0];
      }
    };
    this.setState({ load: false });
    /* switch (type) {
      case "excel":
        CleverRequest.post(
          CleverConfig.getApiUrl("bengine") +
            `http://localhost:5000/api/reports/consolidated-daily-sales-excell`,
          body,
          (response, error) => {
            if (response != "") {
            } else {
            }
          }
        );
        break;
      case "pdf":
        CleverRequest.post(
          CleverConfig.getApiUrl("bengine") +
            `http://localhost:5000/api/reports/consolidated-daily-sales-pdf`,
          body,
          (response, error) => {
            if (response != "") {
              saveAs(
                new Blob([response], {
                  type:
                    "application/pdf.openxmlformats-officedocument.spreadsheetml.sheet",
                }),
                "DailySales.pdf"
              );
            } else {
            }
          }
        );
        break;
    } */
  };

  render() {
    let { load, headReports } = this.state;
    return (
      <>
        <CleverLoading show={load} />
        {headReports && (
          <ContentReports
            isVisibleReturnMenu={true}
            urlMenu={"/reports"}
            title={"Consolidated Daily Sales"}
            nameIcon={"insert_drive_file"}
            onRef={(ref) => (this.referenceReport = ref)}
            contentHead={headReports}
            onDownload={this.downloadfile}
            hiddenBtnExcel={"block"}
            hiddenBtnpdf={"block"}
            activateScroll={true}
          />
        )}
      </>
    );
  }
}
