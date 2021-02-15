import React, { Component } from "react";
import { CleverLoading, Card, CleverForm } from "clever-component-library";

var Helper = require("./HelperReports");

export default class ReportsMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      load: false,
      viewReports: false,
      reports: [],
    };
  }

  componentDidMount() {
    this.setState({ load: true }, () => {
      let listReports = Helper.Reports;
      this.setState({ reportsOrig: listReports }, () => {
        this.loadReports(listReports);
      });
    });
  }

  loadReports(listReports) {
    let contentReport = [];
    listReports.map((dataReport) => {
      let title = dataReport.title;
      let urlReport = dataReport.url;
      contentReport.push(
        <Card
          isPanel={false}
          action={
            <a onClick={(e) => this.openReport(e, urlReport)}>
              <i className="material-icons left">open_in_new</i>
              {title}
            </a>
          }
        >
          <i className="large material-icons text-success" style={{ color: "#1e9198" }}>
            insert_drive_file
          </i>
        </Card>
      );
    });
    this.setState({ reports: contentReport }, () => {
      this.setState({ load: false, viewReports: true });
    });
  }

  openReport(e, url) {
    window.location = url;
  }

  changeNameReport(e) {
    /** Funcion de busqueda, repinta el contenedor de los reportes de acuerdo a lo escrito
     * en el input de busqueda */
    let { reportsOrig } = this.state;
    let nameReportInsert = e.value; //e.target.value;
    let arrayNameReports = reportsOrig !== undefined ? reportsOrig : [];
    let reportsFilter = arrayNameReports.filter(
      (namesReports) =>
        namesReports.title
          .toLowerCase()
          .indexOf(nameReportInsert.toLowerCase()) > -1
    );
    nameReportInsert == "" ? (reportsFilter = reportsOrig) : null;
    this.loadReports(reportsFilter);
  }

  render() {
    let { load, reports, viewReports, dataFrmSearch } = this.state;
    return (
      <>
        <CleverLoading show={load} />
        <Card id={"card-reports"} header={"Reports"}>
          <div className="row">
            <div className="col l12 m12 s12">
              <CleverForm
                id={`dates`}
                ref={(ref) => (this.refForm = ref)}
                data={dataFrmSearch}
                forms={[
                  {
                    inputs: [
                      {
                        row: [
                          {
                            type: "text",
                            size: "col s12 m12 l12",
                            placeholder: "Search report by name",
                            label: "Report name",
                            name: "searchReport",
                            characters: true,
                            alphanumeric: true,
                            onChange: (e) => this.changeNameReport(e),
                          },
                        ],
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>
          <div className="row">
            {viewReports &&
              reports.map((report, key) => {
                return (
                  <div key={key} className="col s12 m3 l3 text-center">
                    {report}
                  </div>
                );
              })}
          </div>
        </Card>
      </>
    );
  }
}
