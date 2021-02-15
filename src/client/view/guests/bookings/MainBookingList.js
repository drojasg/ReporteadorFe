import React, { Component } from "react";
import CleverConfig from "../../../../../config/CleverConfig";
import {CleverRequest,MComponentes,ConfirmDialog,CleverLoading,GridView,Card,CleverForm,CleverButton,
  Modal,Dropdown,Table,Chip} from "clever-component-library";
import FrmDates from "./FrmDates";
import ShowInfo from "./showInfo";
import moment from "moment";
import MainModify from "./modifyBooking/MainModify";
import { saveAs } from "file-saver";
import "./styles.css";

export default class MainBookingList extends Component {
  constructor(props) {
    super(props);
    this.viewData = this.viewData.bind(this);
    this.viewDatatoExcell = this.viewDatatoExcell.bind(this);
    this.handlerChanges = this.handlerChanges.bind(this);
    this.confirmationSendMail = this.confirmationSendMail.bind(this);
    this.sendReservationOpera = this.sendReservationOpera.bind(this);
    this.sendConfirmationLetter = this.sendConfirmationLetter.bind(this);
    this.confirmationInterfaceOpera = this.confirmationInterfaceOpera.bind(
      this
    );

    const hotelSelected = localStorage.getItem("hotel");
    this.state = {
      hotelSelected: hotelSelected ? true : false,
      hotelData: JSON.parse(localStorage.getItem("hotel")),
      load: false,
      viewFrmSearch: true,
      isGridViewVisible: false,
      isReservationDetailVisible: false,
      isEditVisible: false,
      isGridViewVisible: true,
      logHistory: [],
      valueTextarea: "",
      valueCheck: false,
      dataFrmEmail:{
        sendGuest:false,
        textModalLetter:"SEND EMAIL",
        textEmails:"",
      },
      dataChipsEmails:[],
    };
    this.TableMain = React.createRef();
  }

  componentDidMount() {
    this.setState({ load: true });
    this.getProperty();
    this.getStatus();
  }

  getProperty() {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/property/get?all/`,
      (response, error) => {
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!response.Error) {
          if (response.data.length > 0) {
            let propertyOptions = [];

            propertyOptions.push({ value: 0, option: "Select property" });
            response.data.map((i, key) => {
              propertyOptions.push({
                value: i.iddef_property,
                option: i.trade_name,
              });
            });
            this.setState({
              responseProperty: response.data,
              propertySelect: propertyOptions,
            });
          } else {
            this.setState({ load: false });
            MComponentes.toast("Empty Property");
          }
        } else {
          this.setState({ load: false });
          MComponentes.toast("ERROR Property");
          console.log(error);
        }
      }
    );
  }

  getStatus() {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/book-status/search-all`,
      (response, error) => {
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        if (!response.Error) {
          if (response.data.length > 0) {
            let statusOptions = [];

            statusOptions.push({ value: String(0), option: "Select status" });
            response.data.map((i, key) => {
              statusOptions.push({
                value: String(i.idbook_status),
                option: i.name,
              });
            });
            this.setState({
              responseStatus: response.data,
              statusSelect: statusOptions,
              load: false,
            });
          } else {
            this.setState({ load: false });
            MComponentes.toast("Empty Status");
          }
        } else {
          this.setState({ load: false });
          MComponentes.toast("ERROR Status");
          console.log(error);
        }

        if (!error) {
          if (response.Error == false) {
            let responseData = response.data;
            let responseStatus = [];

            responseStatus.push({ value: "0", option: "All" });

            responseData.map((dataStatus) => {
              if (dataStatus.estado == 1) {
                responseStatus.push({
                  value: String(dataStatus.idbook_status),
                  option: dataStatus.name,
                });
              }
            });
            this.setState({
              dataStatusBooking: responseStatus,
              load: false,
            });
          } else {
            this.setState({ load: false });
          }
        } else {
          this.setState({ load: false });
        }
      }
    );
  }

  confirmationSendMail(idReserv,dataEmail,title) {
    /** Agregar opcion de envio a cliente y opciones de uno o mas correos */
    let emails=[];
    emails.push(dataEmail)
    this.setState({ idReservation: idReserv, textModalLetter: title,dataChipsEmails:emails,
      dataFrmEmail:{
        sendGuest:false,
        textModalLetter:"SEND EMAIL",
        textEmails:"",
      }
    }, () => {
      this.refSendMail.getInstance().open();
    });
  }

  sendConfirmationLetter() {    
    let dataEmail = JSON.parse(JSON.stringify(this.state.dataFrmEmail));
    let statusCurrent = dataEmail[`sendGuest`];
    let dataEmailsGuest = this.state.dataFrmEmail.sendGuest == true ? this.getValueChipEmails() : [];
    /** Validar que existan correos en el chip si esta marcado el check*/
    if(statusCurrent && dataEmailsGuest.length == 0){
      // this.refConfirmSendMail.getInstance().open();
      MComponentes.toast("The email guest list is empty")
      dataEmail[`sendGuest`]= false;
      this.setState({dataFrmEmail:dataEmail});
    }else{
      this.setState({ load: true });
      let requestSendLetter = {
        "is_forward": this.state.dataFrmEmail.sendGuest == true ? 1: 0,
        "email_list": dataEmailsGuest
      };
      let idReserv = this.state.idReservation;
      
      CleverRequest.post(
        CleverConfig.getApiUrl("bengine") +
          `/api/booking/send-confirmation/${idReserv}`,
        requestSendLetter,
        (response, error) => {
          if (response.status == 403) {
            MComponentes.toast("YOU ARE NOT AUTHORIZED");
            this.setState({ load: false });
            return;
          }
          let notificationType = "";
          let notificationMessage = "";
          let statusHidde = true;

          if (!error) {
            if (response.Error == false) {
              let responseSendConfirmation = response.data;
              statusHidde = false;
              notificationType = "success";
              notificationMessage = "Confirmation letter was sent";
              this.setState({ load: false, idReservation: null },()=>{
                this.refSendMail.getInstance().close()}
              );
            } else {
              statusHidde = false;
              notificationType = "error";
              notificationMessage = "Confirmation letter wasn't sent";
              this.setState({ load: false, idReservation: null });
            }
          } else {
            statusHidde = false;
            notificationType = "error";
            notificationMessage = "Confirmation letter wasn't sent";
            this.setState({ load: false, idReservation: null });
          }

          statusHidde == false ? MComponentes.toast(notificationMessage) : null;
          this.setState({
            hiddeNotificationModal: statusHidde,
            notificationMessage: notificationMessage,
            notificationType: notificationType,
          });
        }
    );
    }
  }

  confirmationInterfaceOpera(idReserv) {
    this.setState({ idReservation: idReserv }, () => {
      this.refConfirmInterfaceOpera.getInstance().open();
    });
  }

  sendReservationOpera() {
    this.setState({ load: true });
    let requestSendLetter = {};
    let idReserv = this.state.idReservation;

    CleverRequest.post(
      CleverConfig.getApiUrl("bengine") + `/api/booking/send-pms/${idReserv}`,
      requestSendLetter,
      (response, error) => {
        if (response.status == 403) {
          MComponentes.toast("YOU ARE NOT AUTHORIZED");
          this.setState({ load: false });
          return;
        }
        let notificationType = "";
        let notificationMessage = "";
        let statusHidde = true;

        if (!error) {
          if (response.error == false) {
            let responseInterface = response.data;
            statusHidde = false;
            notificationType = "success";
            notificationMessage = "interface to Opera was sent";
            this.setState({ load: false, idReservation: null });
            // this.refInterfaceOpera.setDataProvider(responseInterface);
            // this.setState({
            //             load: false,
            //             idReservation:null
            //         },()=>{
            //             this.refModalInterfaceOpera.getInstance().open();
            //         });
          } else {
            statusHidde = false;
            notificationType = "error";
            notificationMessage = "It wasn't possible interface to Opera";
            this.setState({ load: false, idReservation: null });
          }
        } else {
          statusHidde = false;
          notificationType = "error";
          notificationMessage = "It wasn't possible interface to Opera";
          this.setState({ load: false, idReservation: null });
        }
        statusHidde == false ? MComponentes.toast(notificationMessage) : null;

        this.setState({
          hiddeNotificationModal: statusHidde,
          notificationMessage: notificationMessage,
          notificationType: notificationType,
        });
      }
    );
  }

  handlerChanges(e, tipo, idReservation, code_reservation, property_code) {
    let findProperty = this.state.responseProperty.find(
      (property) => property.property_code == property_code
    );
    let idProperty =
      findProperty !== undefined ? findProperty.iddef_property : 0;

    switch (tipo) {
      case "show":
        this.setState(
          {
            idReservation: idReservation,
            idProperty: idProperty,
            propertyCode: property_code,
            isGridViewVisible: false,
            isEditVisible: false,
            reservationDetail: (
              <ShowInfo
                idReservation={idReservation}
                onClose={this.handlerChanges}
                ref={(ref) => (this.refDetailVoucher = ref)}
              />
            ),
          },
          () => {
            this.setState({ isReservationDetailVisible: true });
          }
        );
        break;
      case "close":
        this.setState(
          {
            isEditVisible: false,
            isReservationDetailVisible: false,
            viewFrmSearch: true,
          },
          () => {
            this.setState({ isGridViewVisible: true });
          }
        );
        break;
      case "edit":
        this.setState(
          {
            idReservation: idReservation,
            idProperty: idProperty,
            propertyCode: property_code,
            viewFrmSearch: false,
            isGridViewVisible: false,
            isReservationDetailVisible: false,
            edit: (
              <MainModify
                idBookHotel={idReservation}
                propertyCode={property_code}
                idProperty={idProperty}
                onClose={this.handlerChanges}
              />
            ),
          },
          () => {
            this.setState({ isEditVisible: true });
          }
        );
        break;
      case "cancel":
        this.setState(
          {
            idReservation: idReservation,
            idProperty: idProperty,
            propertyCode: property_code,
            codeReservation: code_reservation,
          },
          () => {
            this.refConfirmCancelReserv.getInstance().open();
          }
        );
        break;
      default:
        break;
    }
  }

  handleChangeTextarea = (event) => {
    if(event.target.name == "valueTextarea"){
      this.setState({ [event.target.name] : event.target.value });
    }
    else{
      this.setState({ [event.target.name] : event.target.checked });
    }
    
  };

  confirmCancelResv() {
    this.setState({ load: true });
    let { idReservation, codeReservation, idProperty } = this.state;
    let requestCancel = {
      idbook_hotel: idReservation,
      iddef_property: idProperty,
      reason_cancellation: this.state.valueTextarea,
      visible_reason_cancellation: this.state.valueCheck ? 1 : 0
    };
    let valuesFrm = this.formFilters.getData().values;
    this.setState({ roomChecks: valuesFrm !== undefined ? valuesFrm : {} });

    idReservation !== undefined
      ? CleverRequest.postJSON(
          CleverConfig.getApiUrl("bengine") +
            `/api/booking/cancel-confirmation`,
          requestCancel,
          (response, error) => {
            if (response.status == 403) {
              MComponentes.toast("YOU ARE NOT AUTHORIZED");
              this.setState({ load: false });
              return;
            }

            if (!error) {
              let notificationType = "";
              let notificationMessage = "";
              if (!response.Error) {
                notificationType = "success";
                notificationMessage = `The reservation ${codeReservation} was cancelled`;

                this.viewData();
                MComponentes.toast(notificationMessage);
                this.refConfirmCancelReserv.getInstance().close();
                this.setState({
                  load: false,
                  hiddeNotificationModal: false,
                  notificationMessage: notificationMessage,
                  notificationType: notificationType,
                  valueCheck: false,
                  valueTextarea:""
                });
              } else {
                notificationType = "error";
                notificationMessage = response.Msg;
                this.setState({ load: false });
                MComponentes.toast(notificationMessage);
                this.setState({
                  hiddeNotificationModal: false,
                  notificationMessage: notificationMessage,
                  notificationType: notificationType,
                });
              }
            } else {
              this.setState({ load: false });
            }
          }
        )
      : this.setState({ load: false });
  }

  viewData = async () => {
    let valuesFrm = this.formFilters.getData().values;
    let valBookingStart = this.refDateBookingStart.getValueDates();
    let valBookingEnd = this.refDateBookingEnd.getValueDates();
    let valTravelStart = this.refTravelStart.getValueDates();
    let valTravelEnd = this.refTravelEnd.getValueDates();
    let countInputs = 0;

    if (valuesFrm.property == "") countInputs = countInputs + 1;
    if (valuesFrm.status == "") countInputs = countInputs + 1;
    if (valuesFrm.codeReservation == "") countInputs = countInputs + 1;
    if (valBookingStart == "") countInputs = countInputs + 1;
    if (valBookingEnd == "") countInputs = countInputs + 1;
    if (valTravelStart == "") countInputs = countInputs + 1;
    if (valTravelEnd == "") countInputs = countInputs + 1;

    if (countInputs == 7) {
      MComponentes.toast("Select a search option");
      this.setState({
        hiddeNotificationModal: false,
        notificationMessage: "Select a search option",
        notificationType: "error",
      });
    } else {
      let property_id = valuesFrm.property != "" ? valuesFrm.property : 0;
      let status = valuesFrm.status != "" ? valuesFrm.status : 0;
      let codeBookHotel =
        valuesFrm.codeReservation != "" ? valuesFrm.codeReservation : "None";
      let fromDateBookig =
        valBookingStart != "" ? valBookingStart : "1900-01-01";
      let toDateBookig = valBookingEnd != "" ? valBookingEnd : "1900-01-01";
      let fromTravelDate = valTravelStart != "" ? valTravelStart : "1900-01-01";
      let toTravelDate = valTravelEnd != "" ? valTravelEnd : "1900-01-01";

      this.setState({ gridView: null, load: true }, () => {
        this.createUrlAPIReservation(
          status,
          property_id,
          codeBookHotel,
          fromDateBookig,
          toDateBookig,
          fromTravelDate,
          toTravelDate
        );
      });
    }
  };

  createUrlAPIReservation(
    status,
    property_id,
    codeBookHotel,
    fromDateBookig,
    toDateBookig,
    fromTravelDate,
    toTravelDate
  ) {
    fromDateBookig = moment(fromDateBookig).format("YYYY-MM-DD");
    toDateBookig = moment(toDateBookig).format("YYYY-MM-DD");
    fromTravelDate = moment(fromTravelDate).format("YYYY-MM-DD");
    toTravelDate = moment(toTravelDate).format("YYYY-MM-DD");

    let url =
      CleverConfig.getApiUrl("bengine") +
      `/api/booking/get/${property_id}/${status}/${codeBookHotel}/${fromTravelDate}/${toTravelDate}/${fromDateBookig}/${toDateBookig}`;

    var GridHtml = (
      <GridView
        idTable={"table-booking"}
        floatHeader={true}
        url={url}
        pagination={10}
        effectInfinity={false}
        serializeRows={false}
        afterMountData={this.afterCreateGridResv}
        classTable={"clever-table responsive-table"}
        filter={false}
        columns={[
          { attribute: "idbook_hotel", visible: false },
          { attribute: "code_reservation", alias: "Reservation Code" },
          { attribute: "pms_confirm_numbers", alias: "PMS-Folio" },
          {
            alias: "Status",
            value: (data, index) => {
              var style = {
                color: "#ffffff",
                fontWeight: "bold",
                width: "max-content",
                padding: "0.5rem",
              };
              switch (data.idbook_status) {
                case 2:
                case 6:
                  style.backgroundColor = "#d32f2f"; //red
                  break;
                case 1:
                case 4:
                case 7:
                  style.backgroundColor = "#388e3c"; //green
                  break;
                case 3:
                  style.backgroundColor = "#0097a7"; //cyan
                  break;
                case 5:
                  style.backgroundColor = "#f57c00"; //orange
                  break;
                default:
                  style.color = "#000000"; //black
                  break;
              }
              return <div style={style}>{data.status}</div>;
            },
          },
          { attribute: "email", alias: "Email" },
          { attribute: "guest_name", alias: "Name" },
          { attribute: "fecha_creacion", alias: "Date create" },
          {
            attribute: "",
            alias: "Range Date",
            value: (data, index) => {
              let range = `${data.from_date} - ${data.to_date}`;
              return range;
            },
          },
          {
            attribute: "",
            alias: "Room Code",
            value: (data, index) => {
              let rooms = String(data.codes_rooms);
              return rooms;
            },
          },
          {
            attribute: "",
            alias: "Paxs",
            value: (data, index) => {
              let paxs = `${data.adults}.${data.child}`;
              return paxs;
            },
          },
          { attribute: "nights", alias: "Nights" },
          {
            attribute: "actions",
            alias: "Actions",
            filter: false,
            value: (data, index) => {
              const datos = [];
              switch (data.idbook_status) {
                case 4:
                case 5:
                case 8:
                  datos.push({
                    value: "interfaceOpera",
                    text: "Interface Opera",
                    icon: "send",
                  });
                case 7:
                  datos.push(
                    {
                      value: "cancel",
                      text: "Cancel",
                      icon: "cancel",
                    },
                    {
                      value: "sendEmail",
                      text: "SEND CONFIRMATION LETTER",
                      icon: "email",
                    }
                  );
                  break;
                case 2:
                    datos.push(
                      {
                        value: "sendEmail",
                        text: "SEND CANCELATION LETTER",
                        icon: "email",
                      }
                    );
                  break;
                default:
                  break;
              }

              return (
                <div className="row" style={{ width: "max-content" }}>
                  <a
                    onClick={(e) =>
                      this.handlerChanges(
                        "",
                        "show",
                        data.idbook_hotel,
                        data.code_reservation,
                        data.property_code
                      )
                    }
                    title="Show reservation"
                  >
                    <i className="material-icons left black-text">visibility</i>
                  </a>
                  {data.idbook_status == 3 ||
                  data.idbook_status == 4 ||
                  data.idbook_status == 5 ||
                  data.idbook_status == 7 ||
                  data.idbook_status == 8 ? (
                    <a
                      onClick={(e) =>
                        this.handlerChanges(
                          "",
                          "edit",
                          data.idbook_hotel,
                          data.code_reservation,
                          data.property_code
                        )
                      }
                      title="Edit reservation"
                    >
                      <i className="material-icons left black-text">edit</i>
                    </a>
                  ) : null}
                  {data.idbook_status == 2 ||data.idbook_status == 4 ||data.idbook_status == 5 ||data.idbook_status == 7 ||data.idbook_status == 8 
                  ? (
                    <Dropdown
                      data={datos}
                      type="icon"
                      hover={true}
                      onChange={(e) => this.moreOptionsTbl(e, data)}
                    />  
                  )
                  :null}                  
                </div>
              );
            },
          },
          {
            alias: "Log",
            expandCall: (data) => this.handleExpand(data),
          },
        ]}
      />
    );
    this.setState({
      gridView: GridHtml,
      isGridViewVisible: true,
      load: false,
    });
  }

  handleExpand = (param) => {
    this.setState({ load: true });
    var response = [];
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") +
        `/api/log-changes/booking/${param.code_reservation}`,
      (_response, error) => {
        if (!error) {
          response = _response.data;
          response.fecha_creacion = _response.fecha_creacion;
          this.tableChild.setData(response);
          this.setState({ load: false });
        } else {
          MComponentes.toast(error);
          this.setState({ load: false });
        }
      }
    );
    return (
      <div>
        <Table
          onRef={(ref) => (this.tableChild = ref)}
          options={{ manual: true, filter: false }}
          columns={[
            { key: "code_reservation", label: "Reservation code" },
            { key: "property_code", label: "Property" },
            { key: "status", label: "Status" },
            { key: "email", label: "Email" },
            { key: "guest_name", label: "Name" },
            { key: "fecha_creacion", label: "Date create" },
            {
              key: "",
              label: "Range Date",
              value: (data, index) => {
                let range = `${data.from_date} - ${data.to_date}`;
                return range;
              },
            },
            { key: "from_date", label: "Travel date from" },
            { key: "to_date", label: "Travel date to" },
            { key: "codes_rooms", label: "Room code" },
            { key: "child", label: "Childs" },
            { key: "adults", label: "Adults" },
            { key: "nights", label: "Nights" },
            { key: "currency_code", label: "Currency" },
          ]}
        />
      </div>
    );
  };

  viewDatatoExcell = async () => {
    let valuesFrm = this.formFilters.getData().values;
    let valBookingStart = this.refDateBookingStart.getValueDates();
    let valBookingEnd = this.refDateBookingEnd.getValueDates();
    let valTravelStart = this.refTravelStart.getValueDates();
    let valTravelEnd = this.refTravelEnd.getValueDates();
    let countInputs = 0;

    if (valuesFrm.property == "") countInputs = countInputs + 1;
    if (valuesFrm.status == "") countInputs = countInputs + 1;
    if (valuesFrm.codeReservation == "") countInputs = countInputs + 1;
    if (valBookingStart == "") countInputs = countInputs + 1;
    if (valBookingEnd == "") countInputs = countInputs + 1;
    if (valTravelStart == "") countInputs = countInputs + 1;
    if (valTravelEnd == "") countInputs = countInputs + 1;

    if (countInputs == 7) {
      MComponentes.toast("Select a search option");
      this.setState({
        hiddeNotificationModal: false,
        notificationMessage: "Select a search option",
        notificationType: "error",
      });
    } else {
      let property_id = valuesFrm.property != "" ? valuesFrm.property : 0;
      let status = valuesFrm.status != "" ? valuesFrm.status : 0;
      let codeBookHotel =
        valuesFrm.codeReservation != "" ? valuesFrm.codeReservation : "None";
      let fromDateBookig =
        valBookingStart != "" ? valBookingStart : "1900-01-01";
      let toDateBookig = valBookingEnd != "" ? valBookingEnd : "1900-01-01";
      let fromTravelDate = valTravelStart != "" ? valTravelStart : "1900-01-01";
      let toTravelDate = valTravelEnd != "" ? valTravelEnd : "1900-01-01";

      this.setState({ load: true }, () => {
        this.createReportBooking(
          status,
          property_id,
          codeBookHotel,
          fromDateBookig,
          toDateBookig,
          fromTravelDate,
          toTravelDate
        );
      });
    }
  };

  createReportBooking(
    status,
    property_id,
    codeBookHotel,
    fromDateBookig,
    toDateBookig,
    fromTravelDate,
    toTravelDate
  ) {
    fromDateBookig = moment(fromDateBookig).format("YYYY-MM-DD");
    toDateBookig = moment(toDateBookig).format("YYYY-MM-DD");
    fromTravelDate = moment(fromTravelDate).format("YYYY-MM-DD");
    toTravelDate = moment(toTravelDate).format("YYYY-MM-DD");
    var dataSend = {};
    const url =
      CleverConfig.getApiUrl("bengine") + "/api/reports/get-booking-report";
    const req = new XMLHttpRequest();
    const method = "POST";
    req.responseType = "arraybuffer";
    req.open(method, url);
    req.timeout = 120000;

    req.ontimeout = () => {
      M.toast({ html: `ERROR: Timeout!`, classes: "errorToast" });
      //submitRatesExcelRef.current.enable()
      reject(req.response);
    };

    req.onerror = () => {
      M.toast({ html: `ERROR: Something went wrong!`, classes: "errorToast" });
      submitRatesExcelRef.current.enable();
      reject(req.response);
    };

    dataSend = {
      iddef_property: property_id,
      idbook_status: status,
      from_date_travel: fromTravelDate,
      to_date_travel: toTravelDate,
      from_date_booking: fromDateBookig,
      to_date_booking: toDateBookig,
      code_book_hotel: codeBookHotel,
    };

    req.send(JSON.stringify(dataSend));
    req.addEventListener("load", (event) => {});

    req.onload = function () {
      //submitRatesExcelRef.current.enable()
      let status = req.status;
      if (status === 201) {
        fileRatesExcel.current.clean();
        M.toast({ html: `SUCCESS: download excell` });
      } else if (status === 200) {
        M.toast({ html: `SUCCESS: download excell` });
        saveAs(
          new Blob([req.response], {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          "Bookings_report.xlsx"
        );
      } else {
        var decodedString = String.fromCharCode.apply(
          null,
          new Uint8Array(this.response)
        );
        var obj = JSON.parse(decodedString);
        var msg = ((obj.errors || {}).rates || [
          obj.message || "Something went wrong!",
        ])[0];
        M.toast({ html: `ERROR: ${msg}`, classes: "errorToast" });
      }
    };
    this.setState({
      load: false,
    });
  }

  getLog = (data) => {
    this.setState({ load: true });
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") +
        `/api/log-changes/search/book_hotel/${data}`,
      (response, error) => {
        if (!error) {
          var logHistory = response.data;
          var htmlBody = [];
          var [htmlTD, htmlTH] = "";
          var prevIDLogChange = 0;
          logHistory.map((data, index) => {
            let _data = data.data;
            Object.keys(_data).map((key, index) => {
              let thisIDLogChanges = data.idlog_changes;
              htmlTH =
                prevIDLogChange != thisIDLogChanges
                  ? `<tr key="tr-${thisIDLogChanges}">
                                <th colspan="2" className="text-center gray lighten-5">
                                    Log ID: ${thisIDLogChanges}
                                </th>
                            </tr>`
                  : "";
              htmlBody += htmlTH;
              htmlTD = `<tr key="tr-${thisIDLogChanges}-${index}">
                                <td>${key}</td>
                                <td>${_data[key]}</td>
                            </tr>`;
              htmlBody += htmlTD;
              prevIDLogChange = thisIDLogChanges;
            });
          });
          this.setState({
            logHistory: htmlBody,
            load: false,
          });
        } else {
          MComponentes.toast(error);
          this.setState({ load: false });
        }
      }
    );
    this.refModal.getInstance().open();
  };

  moreOptionsTbl = (e, param) => {
    let option = e.selectedOption.value;
    switch (option) {
      case "cancel":
        this.handlerChanges(
          "",
          "cancel",
          param.idbook_hotel,
          param.code_reservation,
          param.property_code
        );
        break;
      case "log":
        this.getLog(param.idbook_hotel);
        break;
      case "sendEmail":        
        this.confirmationSendMail(param.idbook_hotel,param.email,e.selectedOption.text);
        break;
      case "interfaceOpera":
        this.confirmationInterfaceOpera(param.idbook_hotel);
        break;
      default:
        break;
    }
  };

  getConfigAddButtonsModal(type) {
    let buttons = [];
    switch(type){
      case "cancel":
              buttons = [
                <button
                  className="btn waves-effect waves-light"
                  form={this.idForm}
                  type="submit"
                  onClick={() => this.confirmCancelResv()} //this.handleSubmit()} /* ARREGLAR ESTO, BAJAR DE RAMA DE PACO. INVESTIGAR CÓMO ENVIAR EL DATO EN LA FUNCION confirmCancelResv */
                >
                  <i className="material-icons right">send</i>
                  <span data-i18n="{{'SUBMIT'}}">Submit</span>
                </button>,
              ];
        break;
      case "sendLetter":
              buttons = [
                <button
                  className="btn waves-effect waves-light"
                  form={this.idForm}
                  type="submit"
                  onClick={() => this.sendConfirmationLetter()}
                >
                  <i className="material-icons right">send</i>
                  <span data-i18n="{{'SUBMIT'}}">Send letter</span>
                </button>,
              ];
        break;
      default:
        break;
    }
    
    return buttons;
  }

  switchHandler(e){
    let name = e.target.name !== undefined ? e.target.name : "";
    let dataEmail = JSON.parse(JSON.stringify(this.state.dataFrmEmail));
    let statusCurrent = dataEmail[`sendGuest`];
    dataEmail[`sendGuest`] = !statusCurrent;
    this.setState({dataFrmEmail:dataEmail});
  }

  addChip(){
    let emails= this.refEmails.getData();
    let validador= emails.required.count;
    let data = emails.values;  
    if(validador !== 0){
      MComponentes.toast("Add a valid email");
    }else{
      let dataEmail = JSON.parse(JSON.stringify(this.state.dataFrmEmail));
      let tag = data[`textEmails`];
      dataEmail[`textEmails`]= '';
      this.setValueChipEmails(tag);
      this.setState({dataFrmEmail:dataEmail});
    }
  }

  render() {
    console.log( this.state);
    let {
      load,
      viewFrmSearch,
      isGridViewVisible,
      isReservationDetailVisible,
      isEditVisible,
      propertySelect,
      statusSelect,
      roomChecks,
      gridView,
      reservationDetail,
      edit,
      textModalLetter,dataFrmEmail,dataChipsEmails
    } = this.state;

    return (
      <Card id={"card-Bookings"} header={"Bookings"}>
        <CleverLoading show={load} />
        <Modal
          title={{ text: "Log history" }}
          onRef={(modal) => (this.refModal = modal)}
        >
          <div className="row">
            <table
              id="logTable"
              dangerouslySetInnerHTML={{ __html: this.state.logHistory }}
            ></table>
          </div>
        </Modal>
        <Modal
          title={{ text: textModalLetter }}
          onRef={(confirm) => (this.refSendMail = confirm)}
          addButtons={this.getConfigAddButtonsModal('sendLetter')}
        >
          <div className="row">
            <div className="col s12 m3 l3">
              <p>
                <label>
                  <input className="filled-in" type="checkbox" name="sendGuest"
                  checked={dataFrmEmail.sendGuest}
                  onChange={(e) => this.switchHandler(e)}/>
                  <span>Send email guest</span>
                </label>
              </p>
            </div>
            <div className="col s12 m9 l9">
              <CleverForm
                id={'FrmEmails'}
                ref={ref => this.refEmails = ref}
                data={dataFrmEmail}
                forms={[
                  { 
                    inputs:[
                      dataFrmEmail.sendGuest == true ?
                      {row:[
                        {type:'email',size:'col s12 m10 l10',label:'E-mail: ',name:'textEmails',placeholder:'Insert Email',required:true},
                        {type:'button',label:'',icon:'add',onClick:e=>this.addChip()} 
                      ]}
                      : {row:[]},
                    ]
                  }
                ]}
              />
            </div>            
          </div>
          <div className='row'>
            {dataFrmEmail.sendGuest == true ?
              <div>
                <Chip
                  id='chipsEmails'
                  setValue={ set => {this.setValueChipEmails = set;
                                this.setValueChipEmails(dataChipsEmails)} 
                            }
                  getValue={ get => {this.getValueChipEmails = get;} }
                  cleanValue={ clean => {this.cleanValueChipEmails = clean;} }
                  readOnly={true}
                />
              </div>
            :null}
          </div>
         
          {/* <Modal
            onRef={modal => this.refConfirmSendMail = modal}
          >
            <h5 className="text-center">The email guest list is empty</h5>
          </Modal> */}
        </Modal>
        <ConfirmDialog
          onRef={(confirm) => (this.refConfirmInterfaceOpera = confirm)}
          yesButton={{ load: true, click: () => this.sendReservationOpera() }}
          modalTitle={{ text: "SEND RESERVATION TO OPERA" }}
          title={{
            text: "Do you want to continue with the interface reservation?",
          }}
        />
        <div className="row">
          {viewFrmSearch == true ? (
            <CleverForm
              ref={(ref) => (this.formFilters = ref)}
              id={"form-check"}
              data={roomChecks}
              forms={[
                {
                  fieldset: false,
                  title: "",
                  inputs: [
                    {
                      row: [
                        {
                          type: "select",
                          options: propertySelect,
                          size: "col s12 m4 l4",
                          name: "property",
                          label: "Property",
                          placeholder: "Select Property",
                          autocomplete: true,
                        },
                        {
                          type: "select",
                          options: statusSelect,
                          size: "col s12 m4 l4",
                          name: "status",
                          label: "Status",
                          placeholder: "Select Status",
                          autocomplete: true,
                        },
                        {
                          type: "text",
                          size: "col s12 m4 l4",
                          name: "codeReservation",
                          label: "Reservation Code",
                          placeholder: "Insert Reservation Code",
                        },
                      ],
                    },
                    {
                      row: [
                        {
                          type: "component",
                          component: () => {
                            return (
                              <FrmDates
                                nameDate="Booking Date Start"
                                onRef={(ref) =>
                                  (this.refDateBookingStart = ref)
                                }
                                idFrm={"frmBookingStart"}
                              />
                            );
                          },
                        },
                        {
                          type: "component",
                          component: () => {
                            return (
                              <FrmDates
                                nameDate="Booking Date End"
                                onRef={(ref) => (this.refDateBookingEnd = ref)}
                                idFrm={"frmBookingEnd"}
                              />
                            );
                          },
                        },
                        {
                          type: "component",
                          component: () => {
                            return (
                              <FrmDates
                                nameDate="Travel Date Start"
                                onRef={(ref) => (this.refTravelStart = ref)}
                                idFrm={"frmTravelStart"}
                              />
                            );
                          },
                        },
                        {
                          type: "component",
                          component: () => {
                            return (
                              <FrmDates
                                nameDate="Travel Date End"
                                onRef={(ref) => (this.refTravelEnd = ref)}
                                idFrm={"frmTravelEnd"}
                              />
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
                              <div className="row">
                                <CleverButton
                                  size={"col s12 m3 l3"}
                                  label={"Excel"}
                                  icon={"save_alt"}
                                  fullSize={true}
                                  onClick={this.viewDatatoExcell}
                                />
                                <CleverButton
                                  size={"col s12 m3 l3"}
                                  label={"Search"}
                                  icon={"search"}
                                  fullSize={true}
                                  onClick={this.viewData}
                                />
                              </div>
                            );
                            // return ( <CleverButton size={'col s12 m3 l3 offset-m9 offset-l9'} label={'View Booking'} fullSize={true} onClick={this.viewData}/> )
                          },
                        },
                      ],
                    },
                  ],
                },
              ]}
            />
          ) : null}
        </div>

        {isGridViewVisible == true ? gridView : null}

        {isReservationDetailVisible == true ? reservationDetail : null}

        {isEditVisible == true ? edit : null}

        <Modal
          onRef={(confirm) => (this.refConfirmCancelReserv = confirm)}
          addButtons={this.getConfigAddButtonsModal('cancel')}
          title={{
            text: "Reservation cancellation",
          }}
        >
          <label
            id="cancel-reservation-label"
            className="row"
            htmlFor="valueTextarea"
          >
            Please write the cancellation reason (Optional).
          </label>
          <textarea
            name="valueTextarea"
            id="cancel-reservation-textarea"
            className="row"
            cols="30"
            rows="10"
            value={this.state.valueTextarea}
            onChange={(e) => this.handleChangeTextarea(e)}
          ></textarea>
          <p>
            <label>
              <input 
              id="cancel-reservation-check"
              name="valueCheck"
              type="checkbox" 
              checked={this.state.valueCheck ? "checked" : ""} 
              onChange={(e) => this.handleChangeTextarea(e) } />
              <span>Do you want to make the reason for the cancellation visible in the letter?</span>
            </label>
          </p>
        </Modal>
      </Card>
    );
  }
}