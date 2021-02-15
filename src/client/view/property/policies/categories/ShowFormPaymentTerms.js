import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  CleverLoading,
  CleverForm,
  CleverEditor,
  CleverMethodsApi,
  MComponentes,
  CleverRequest,
} from "clever-component-library";
import CleverConfig from "../../../../../../config/CleverConfig";
import "./style.css";

export default class ShowFormPaymentTerms extends Component {
  constructor(props) {
    super(props);
    const hotelSelected = localStorage.getItem("hotel");

    this.state = {
      hideForm: false,
      load: true,
      opCancellation: [],
      markets: [],
      properties: [],
      dataForms: {},
      dataInput: {},
      hotelData: JSON.parse(localStorage.getItem("hotel")),
      hotelSelected: hotelSelected ? true : false,
      dataEdit: this.props.dataEdit != null ? this.props.dataEdit : null,
    };
  }

  componentDidMount() {
    let { dataEdit } = this.state;
    this.setState({ dataForms: {}, httpMethod: "POST" });
    this.getCancellation();
    this.getMarkets();
    this.getProperties();
    dataEdit != null
      ? this.getAllDetailPolice()
      : this.setState({ dataForms: {}, load: false });
  }

  getCancellation() {
    CleverMethodsApi._getData(
      CleverConfig.getApiUrl("bengine") + "/api/policy-cancellation-option/get",
      (response, error) => {
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!error) {
          if (response.data.length > 0) {
            let data = [];

            response.data.map((option) => {
              data.push({
                value: option.iddef_policy_cancellation_option,
                option: option.text,
              });
            });

            this.setState({ opCancellation: data });
          } else {
            this.setState({ load: false });
            console.error(error);
          }
        } else {
          this.setState({ load: false });
          console.error(error);
        }
      }
    );
  }

  getMarkets = () => {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/market/get?all=1`,
      (response, error) => {
        if (response.status === 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!error) {
          let markets = [{ value: 0, option: "ALL MARKETS" }];
          response.data.map((data) => {
            if (data.estado === 1) {
              markets.push({
                value: data.iddef_market_segment,
                option: data.code,
              });
            }
          });
          this.setState({
            markets: markets,
            resPenalty: response.data,
            load: false,
          });
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
            if (data.estado === 1) {
              properties.push({
                value: data.property_code,
                option: data.property_code,
              });
            }
          });
          this.setState({ properties: properties });
          this.setState({ load: false });
        }
      }
    );
  };

  getAllDetailPolice = () => {
    let { dataEdit } = this.state;
    CleverMethodsApi._getData(
      CleverConfig.getApiUrl("bengine") +
        `/api/policy_payment/get/${dataEdit.iddef_policy_payment}`,
      (response, error) => {
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!error) {
          if (Object.keys(response.data).length > 0) {
            let data = response.data;
            this.setState({
              dataForms: data,
              httpMethod: "PUT",
              arrayRefundable: [],
              arraySeasonal: [],
              IDCancellationPolicy: data.iddef_policy,
            });

            this.refEditorEnCancellationPolicy.setContent(data.description_en);
            this.refEditorEsCancellationPolicy.setContent(data.description_es);
          }
        } else {
          this.setState({ dataForms: {}, load: false });
          console.error(error);
        }
      }
    );
    this.setState({ load: false });
  };

  validateForm = (e) => {
    let requiredCount = this.refForm.getData().required.count,
      _dataInput = this.refForm.getData().values;

    if (
      requiredCount === 0 &&
      _dataInput.description_en !== "" &&
      _dataInput.description_es !== ""
    ) {
      this.setState({ dataInput: _dataInput }, () => this.callBack());
    } else {
      MComponentes.toast("Complete the data required");
    }
  };

  callBack = (e) => {
    let propertyList = [],
      data = {},
      { httpMethod, dataEdit, dataInput } = this.state;

    dataInput.property_list &&
      dataInput.property_list.forEach((element) => {
        propertyList.push(element);
      });

    switch (httpMethod) {
      case "POST":
        data = {
          policy_code: dataInput.policy_code,
          market_segment_list: dataInput.market_segment_list,
          property_list: propertyList,
          description_en: dataInput.description_en,
          description_es: dataInput.description_es,
          estado: 1,
        };
        this.saveData(data);
        break;
      case "PUT":
        data = {
          policy_code: dataInput.policy_code,
          market_segment_list: dataInput.market_segment_list,
          property_list: propertyList,
          description_en: this.refEditorEnCancellationPolicy.getContent(),
          description_es: this.refEditorEsCancellationPolicy.getContent(),
          estado: 1,
        };
        this.editData(data, dataEdit.iddef_policy_payment);
        break;
    }
  };

  saveData = (data) => {
    CleverMethodsApi._insertData(
      CleverConfig.getApiUrl("bengine") + "/api/policy_payment/post",
      data,
      (response, error) => {
        this.setState({ load: true });
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          return;
        }
        if (!error) {
          if (Object.keys(response.data).length > 0) {
            this.setState({
              httpMethod: "PUT",
            });
            MComponentes.toast(response.Msg);
          } else {
            MComponentes.toast("Error create");
          }
        } else {
          MComponentes.toast("Error api");
        }
        this.setState({ load: false });
        document.getElementById("form-filters-payment-terms-close").click();
      }
    );
  };

  editData = (data, iddef_policy_payment) => {
    CleverMethodsApi._updateData(
      CleverConfig.getApiUrl("bengine") +
        "/api/policy_payment/put/" +
        iddef_policy_payment,
      data,
      (response, error) => {
        this.setState({ load: true });
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          return;
        }
        if (!error) {
          if (Object.keys(response.data).length > 0) {
            this.getAllDetailPolice();
            MComponentes.toast(response.Msg);
          } else {
            MComponentes.toast("Error edit");
          }
        } else {
          MComponentes.toast("Error api");
        }
        this.setState({ load: false });
        document.getElementById("form-filters-payment-terms-close").click();
      }
    );
  };

  render() {
    let { load, markets, properties } = this.state;

    return (
      <div className="row">
        <CleverLoading show={load} />
        <CleverForm
          ref={(ref) => (this.refForm = ref)}
          id={"form-filters-payment-terms"}
          data={this.state.dataForms}
          forms={[
            {
              inputs: [
                {
                  row: [
                    {
                      type: "text",
                      size: "col s12 m4 l4",
                      name: "policy_code",
                      label: "Policy name *",
                      placeholder: "Insert policy name",
                      alphanumeric: true,
                      required: true,
                    },
                    {
                      type: "select",
                      size: "col s12 m4 l4",
                      name: "market_segment_list",
                      label: "Market *",
                      placeholder: "Insert market",
                      options: markets,
                      multiple: true,
                      required: true,
                    },
                    {
                      type: "select",
                      size: "col s12 m4 l4",
                      name: "property_list",
                      label: "Property",
                      placeholder: "Insert property",
                      options: properties,
                      multiple: true,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="row">
                            <div className="col s12 m12 l6">
                              <p style={{ color: "#01536d" }}>
                                {"English description *"}
                              </p>
                              <CleverEditor
                                name="description_en"
                                onRef={(editor) =>
                                  (this.refEditorEnCancellationPolicy = editor)
                                }
                              />
                            </div>
                            <div className="col s12 m12 l6">
                              <p style={{ color: "#01536d" }}>
                                {"Spanish description *"}
                              </p>
                              <CleverEditor
                                name="description_es"
                                onRef={(editor) =>
                                  (this.refEditorEsCancellationPolicy = editor)
                                }
                              />
                            </div>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "button",
                      size: "col offset-l8 s12 m6 l2 ",
                      label: "close",
                      icon: "close",
                      onClick: (e) => this.props.onClose("close"),
                    },
                    {
                      type: "button",
                      size: "col s12 m6 l2",
                      label: "save",
                      icon: "save",
                      onClick: () => this.validateForm(),
                    },
                  ],
                },
              ],
            },
          ]}
        />
      </div>
    );
  }
}
