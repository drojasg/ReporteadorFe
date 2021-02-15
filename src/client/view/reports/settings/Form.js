import React, { Component } from "react";
import {
  CleverLoading,
  CleverRequest,
  MComponentes,
  CleverForm,
  Chip,
} from "clever-component-library";
import CleverConfig from "../../../../../config/CleverConfig";
import "./style.css";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      httpMethod: "",
      dataReports: [],
      recipientInput: "",
      switchStatus: false,
      dataWindowType: 0,
      restrictionType: 0,
      timeOfDay: [
        { value: "24:00:00", option: "12:00 AM" },
        { value: "01:00:00", option: "1:00 AM" },
        { value: "02:00:00", option: "2:00 AM" },
        { value: "03:00:00", option: "3:00 AM" },
        { value: "04:00:00", option: "4:00 AM" },
        { value: "05:00:00", option: "5:00 AM" },
        { value: "06:00:00", option: "6:00 AM" },
        { value: "07:00:00", option: "7:00 AM" },
        { value: "08:00:00", option: "8:00 AM" },
        { value: "09:00:00", option: "9:00 AM" },
        { value: "10:00:00", option: "10:00 AM" },
        { value: "11:00:00", option: "11:00 AM" },
        { value: "12:00:00", option: "12:00 PM" },
        { value: "13:00:00", option: "1:00 PM" },
        { value: "14:00:00", option: "2:00 PM" },
        { value: "15:00:00", option: "3:00 PM" },
        { value: "16:00:00", option: "4:00 PM" },
        { value: "17:00:00", option: "5:00 PM" },
        { value: "18:00:00", option: "6:00 PM" },
        { value: "19:00:00", option: "7:00 PM" },
        { value: "20:00:00", option: "8:00 PM" },
        { value: "21:00:00", option: "9:00 PM" },
        { value: "22:00:00", option: "10:00 PM" },
        { value: "23:00:00", option: "11:00 PM" },
      ],
      dataWindowOptions: [
        { value: 1, option: "Today" },
        { value: 2, option: "Yesterday" },
        { value: 3, option: "Tomorrow" },
        { value: 4, option: "Week up to date" },
        { value: 5, option: "Last week" },
        { value: 6, option: "Month up to date" },
        { value: 7, option: "Last 30 days" },
        { value: 8, option: "Next 30 days" },
        { value: 9, option: "Last month" },
        { value: 10, option: "Year up to date" },
        { value: 11, option: "Custom range" },
      ],
      firstDayOfTheWeek: [
        { value: 0, label: "Monday" },
        { value: 5, label: "Saturday" },
        { value: 6, label: "Sunday" },
      ],
      recurrence: [
        { value: 0, label: "Daily" },
        { value: 1, label: "Weekly" },
        { value: 2, label: "Mothly" },
      ],
      daysOfWeek: [
        { value: 0, option: "Monday" },
        { value: 1, option: "Tuesday" },
        { value: 2, option: "Wednesday" },
        { value: 3, option: "Thursday" },
        { value: 4, option: "Friday" },
        { value: 5, option: "Saturday" },
        { value: 6, option: "Sunday" },
      ],
      daysOfMoth: [
        { value: 1, option: "1" },
        { value: 2, option: "2" },
        { value: 3, option: "3" },
        { value: 4, option: "4" },
        { value: 5, option: "5" },
        { value: 6, option: "6" },
        { value: 7, option: "7" },
        { value: 8, option: "8" },
        { value: 9, option: "9" },
        { value: 10, option: "10" },
        { value: 11, option: "11" },
        { value: 12, option: "12" },
        { value: 13, option: "13" },
        { value: 14, option: "14" },
        { value: 15, option: "15" },
        { value: 16, option: "16" },
        { value: 17, option: "17" },
        { value: 18, option: "18" },
        { value: 19, option: "19" },
        { value: 20, option: "20" },
        { value: 21, option: "21" },
        { value: 22, option: "22" },
        { value: 23, option: "23" },
        { value: 24, option: "24" },
        { value: 25, option: "25" },
        { value: 26, option: "26" },
        { value: 27, option: "27" },
        { value: 28, option: "28" },
        { value: 29, option: "29" },
        { value: 30, option: "30" },
        { value: 31, option: "31" },
      ],
    };
  }

  componentDidMount() {
    this.getReports();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.httpMethod !== state.httpMethod) {
      return { httpMethod: props.httpMethod };
    }
    if (props.idreport_setting !== state.idreport_setting) {
      return { idreport_setting: props.idreport_setting };
    } else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.httpMethod !== this.state.httpMethod) {
      this.setState({ httpMethod: this.props.httpMethod });
    }
    if (
      prevState.idreport_setting !== this.state.idreport_setting &&
      prevState.idreport_setting != undefined
    ) {
      this.getByID(this.state.idreport_setting);
    }
  }

  getByID = async (idreport_setting) => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") +
        `/api/reports-setting/search/${idreport_setting}`,
      (response, error) => {
        if (!error) {
          this.setState({
            dataForm: {
              idreport_setting: response.data.idreport_setting, //id
              subject_letter: response.data.subject_letter, //name
              reports: response.data.reports[0], //report type
              date_window: response.data.date_window, //date window
              subscription: response.data.subscription, //subscription
              type_recurrence: response.data.type_recurrence, //recurrence
              time: response.data.time.toString(), //time of day
              emails: response.data.emails, //recipients
            },
            load: false,
          });
          this.setState({
            switchStatus: response.data.subscription === 1 ? true : false,
          });
          this.setValueChip(response.data.emails);
        }
      }
    );
  };

  getReports = () => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + "/api/reports/get",
      (response, error) => {
        if (!error) {
          let _dataReports = [];
          response.data.map((data) => {
            _dataReports.push({
              value: data.idreports,
              option: data.name,
            });
          });
          this.setState({ dataReports: _dataReports, load: false });
        } else console.log(error);
      }
    );
  };

  switchHandler = () => {
    this.setState({ switchStatus: !this.state.switchStatus });
  };

  recipientHandler = (email) => {
    this.setState({ recipientInput: email.value });
  };

  addRecipient = () => {
    this.setValueChip(this.state.recipientInput);
  };

  validateForm = (e) => {
    let requiredCount = this.refForm.getData().required.count,
      _dataInput = this.refForm.getData().values;
    if (requiredCount == 0) {
      this.setState({ dataInput: _dataInput }, () => this.httpMethodHandler());
      return true;
    } else MComponentes.toast("Complete the data required");
  };

  httpMethodHandler = () => {
    let dataInput = this.state.dataInput;
    let dataToSave;
    let d = new Date();
    let [hours, minutes] = dataInput.time.split(":");
    d.setHours(+hours);
    d.setMinutes(minutes);
    d.setSeconds("00");

    switch (this.state.httpMethod) {
      case "POST":
        dataToSave = {
          subject_letter: dataInput.subject_letter,
          reports: [parseInt(dataInput.reports)],
          date_window: 1,
          date_window_custom: {}, 
          subscription: this.state.switchStatus ? 1 : 0,
          type_recurrence: dataInput.type_recurrence,
          recurrence: [],
          time: d.toTimeString(),
          emails: this.getValueChip(),
        };
        this.saveData(dataToSave);
        break;
      case "PUT":
        dataToSave = {
          idreport_setting: this.state.idreport_setting,
          subject_letter: dataInput.subject_letter,
          reports: [parseInt(dataInput.reports)],
          date_window: 1,
          date_window_custom: {},
          subscription: this.state.switchStatus ? 1 : 0,
          type_recurrence: dataInput.type_recurrence,
          recurrence: [],
          time: d.toTimeString(),
          emails: this.getValueChip(),
        };
        this.editData(dataToSave);
        break;
    }
  };

  saveData = (dataToSave) => {
    CleverRequest.post(
      CleverConfig.getApiUrl("bengine") + "/api/reports-setting/create",
      dataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
          if (!data.Error) {
            notificationMessage = "The data was saved";
            notificationType = "success";
            this.props.formHandler("close");
          } else {
            notificationType = "error";
            notificationMessage = "The data was not saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  editData = (dataToSave) => {
    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") +
        `/api/reports-setting/update/${dataToSave.idreport_setting}`,
      dataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "The data was saved";
            this.props.formHandler("close");
          } else {
            notificationType = "error";
            notificationMessage = "The data was not saved";
          }
          MComponentes.toast(notificationMessage);
          this.setState({
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        } else console.log(error);
      }
    );
  };

  onChangeDataWindow = (dataWindowType) => {
    this.setState({ dataWindowType: dataWindowType.value });
  };

  /* onChangeRestriction = (restrictionType) => {
    console.log("onChangeRestriction");
  }; */

  render() {
    return (
      <div className="row">
        <CleverForm
          id={"form-test"}
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
                          <div className="col s12 m12 l12">
                            <h6 className="text-bold">Configuration</h6>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "text",
                      size: "col s12 m6 l6",
                      name: "subject_letter",
                      label: "name",
                      alphanumeric: true,
                      characters: true,
                      required: true,
                    },
                    {
                      type: "select",
                      size: "col s12 m6 l6",
                      name: "reports",
                      label: "report type",
                      uppercase: false,
                      required: true,
                      options: this.state.dataReports,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "select",
                      size: "col s12 m6 l6",
                      name: "date_window",
                      label: "data window",
                      uppercase: false,
                      onChange: (dataWindowType) =>
                        this.onChangeDataWindow(dataWindowType),
                      options: this.state.dataWindowOptions,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div
                            className={
                              this.state.dataWindowType == 4 ||
                              this.state.dataWindowType == 5
                                ? "col s12 m12 l12"
                                : "d-none"
                            }
                          >
                            <label htmlFor="restriction" className="active">
                              First day of the week
                            </label>
                          </div>
                        );
                      },
                    },

                    {
                      type: "radio",
                      size:
                        this.state.dataWindowType == 4 ||
                        this.state.dataWindowType == 5
                          ? "col s12 m12 l12 reports-radiobuttons"
                          : "d-none",
                      name: "week",
                      //onChange: (data) => this.onChangeRestriction(data),
                      //required: false,
                      radios: this.state.firstDayOfTheWeek,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="col s12 m2 l2">
                            <h6 className="text-bold">Subscription</h6>
                          </div>
                        );
                      },
                    },
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div
                            className="col s12 m10 l10"
                            style={{ marginTop: "0.55rem" }}
                          >
                            <a className="switch pl-1">
                              <label>
                                Inactive
                                <input
                                  type="checkbox"
                                  name="subscription"
                                  checked={this.state.switchStatus}
                                  onChange={() => this.switchHandler()}
                                />
                                <span className="lever"></span>
                                Active
                              </label>
                            </a>
                          </div>
                        );
                      },
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="col s12 m12 l12">
                            <label htmlFor="restriction" className="active">
                              Recurrence
                            </label>
                          </div>
                        );
                      },
                    },
                    {
                      type: "radio",
                      size: "col s12 m12 l12 reports-radiobuttons",
                      name: "type_recurrence",
                      //onChange: (restriction) => this.onChangeRestriction(restriction),
                      required: true,
                      radios: this.state.recurrence,
                    },
                  ],
                },
                {
                  row: [
                    {
                      hidden:
                        this.state.dataWindowType == 1 ||
                        this.state.dataWindowType == 2 ||
                        this.state.dataWindowType == 3 ||
                        this.state.dataWindowType == 4 ||
                        this.state.dataWindowType == 6 ||
                        this.state.dataWindowType == 7 ||
                        this.state.dataWindowType == 8 ||
                        this.state.dataWindowType == 11
                          ? false
                          : true,
                      type: "select",
                      size: "col s12 m4 l4",
                      name: "time",
                      label: "time of day",
                      uppercase: false,
                      required: true,
                      options: this.state.timeOfDay,
                    },
                    {
                      hidden:
                        this.state.dataWindowType == 4 ||
                        this.state.dataWindowType == 5 ||
                        this.state.dataWindowType == 6 ||
                        this.state.dataWindowType == 7 ||
                        this.state.dataWindowType == 8 ||
                        this.state.dataWindowType == 10 ||
                        this.state.dataWindowType == 11
                          ? false
                          : true,
                      type: "select",
                      size: "col s12 m4 l4",
                      name: "day_of_week",
                      label: "day of week",
                      options: this.state.daysOfWeek,
                    },
                    {
                      hidden:
                        this.state.dataWindowType == 6 ||
                        this.state.dataWindowType == 8 ||
                        this.state.dataWindowType == 9 ||
                        this.state.dataWindowType == 10 ||
                        this.state.dataWindowType == 11
                          ? false
                          : true,
                      type: "select",
                      size: "col s12 m4 l4",
                      name: "day_of_month",
                      label: "day of month",
                      options: this.state.daysOfMoth,
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "email",
                      size: "col s12 m6 l10",
                      name: "recipient",
                      label: "recipient",
                      onChange: (email) => this.recipientHandler(email),
                    },
                    {
                      type: "button",
                      label: "add",
                      size: "col s12 m2 l2",
                      fullSize: true,
                      onClick: () => this.addRecipient(),
                      icon: "add",
                    },
                  ],
                },
                {
                  row: [
                    {
                      type: "component",
                      component: () => {
                        return (
                          <div className="col s12 m12 l12">
                            <Chip
                              id="reports-settings-chip"
                              readOnly={true}
                              setValue={(set) => {
                                this.setValueChip = set;
                              }}
                              getValue={(get) => {
                                this.getValueChip = get;
                              }}
                              cleanValue={(clean) => {
                                this.cleanValueChip = clean;
                              }}
                              label={{ t: "recipients", d: "{{'RECIPIENTS'}}" }}
                            />
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
                      label: "save",
                      size: "col s12 m2 l2 offset-m10 offset-l10",
                      fullSize: true,
                      onClick: () => this.validateForm(),
                      icon: "save",
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
