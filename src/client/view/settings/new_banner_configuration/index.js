import React, { Component } from "react";
import "clever-component-library";
import { Card } from "clever-component-library";
import Form from "./Form";
import Table from "./Table";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFormVisible: false,
      httpMethod: "",
      iddef_media_banners: 0,
    };
  }

  formHandler = (formType, data) => {
    switch (formType) {
      case "close":
        this.setState({
          isFormVisible: false,
          httpMethod: "",
          iddef_media_banners: 0,
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
          iddef_media_banners: data.iddef_media_banners,
        });
        break;
    }
  };

  render() {
    var { isFormVisible, httpMethod } = this.state;
    return (
      <>
        <Card
          id={"card-Form"}
          header={httpMethod == "PUT" ? "Edit banner" : "Banner configuration"}
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
                add banner
                <i className="material-icons right">add</i>
              </a>
            )
          }
        >
          {isFormVisible ? (
            <Form
              httpMethod={this.state.httpMethod}
              iddef_media_banners={this.state.iddef_media_banners}
              formHandler={this.formHandler}
            />
          ) : (
            <Table openModal={this.formHandler} />
          )}
        </Card>
      </>
    );
  }
}
