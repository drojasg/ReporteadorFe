import React, { Component } from "react";
import "clever-component-library";
import { Card } from "clever-component-library";
import Table from "./Table";
import Form from "./Form";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFormVisible: false,
      httpMethod: "",
      idreport_setting: 0,
    };
  }

  formHandler = (formType, data) => {
    switch (formType) {
      case "close":
        this.setState({
          isFormVisible: false,
          httpMethod: "",
          idreport_setting: 0,
        });
        break;
      case "new":
        this.setState({
          httpMethod: "POST",
          isFormVisible: true,
        });
        break;
      case "edit":
        this.setState({
          httpMethod: "PUT",
          isFormVisible: true,
          idreport_setting: data.idreport_setting,
        });
        break;
    }
  };

  render() {
    let { isFormVisible, httpMethod } = this.state;
    return (
      <div>
        <Card
          id={"card-reports"}
          header={httpMethod == "PUT" ? "Edit report" : "Reports"}
          control={
            isFormVisible ? (
              <div className="row">
                <a
                  className="col btn btn-small red"
                  onClick={() => this.formHandler("close")}
                >
                  cancel
                  <i className="material-icons right">close</i>
                </a>
              </div>
            ) : (
              <a
                className="btn btn-small"
                onClick={() => this.formHandler("new")}
              >
                add report
                <i className="material-icons right">add</i>
              </a>
            )
          }
        >
          {isFormVisible ? (
            <Form
              httpMethod={this.state.httpMethod}
              idreport_setting={this.state.idreport_setting}
              formHandler={this.formHandler}
            />
          ) : (
            <Table openModal={this.formHandler} />
          )}
        </Card>
      </div>
    );
  }
}
