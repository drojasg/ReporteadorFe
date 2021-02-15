import React, { Component } from "react";
import CleverConfig from "../../../../../config/CleverConfig";
import {
  CleverRequest,
  CleverLoading,
  Card,
  MComponentes,
} from "clever-component-library";
import Header from "../../../components/header/Header";
import OutsideClickHandler from "react-outside-click-handler";
import Customer from "./Customer";
import Reservation from "./Reservation";
import Polices from "./Polices";
import Service from "./Service";
import Comments from "./Comments";

export default class showInfo extends Component {
  constructor(props) {
    super(props);
    this.changeTab = this.changeTab.bind(this);
    this.showSidebar = this.showSidebar.bind(this);

    const hotelSelected = localStorage.getItem("hotel");
    this.state = {
      hotelSelected: hotelSelected ? true : false,
      hotelData: JSON.parse(localStorage.getItem("hotel")),
      load: true,
      hiddenRoomRate: true,
      isVisible: false,
      slideIn: " animated slideInRight faster",
      slideOut: " animated slideOutRight faster",
    };
    this.TableMain = React.createRef();
    this.arrayCodes = new Array();
  }

  componentDidMount() {
    this.getReservationByID(this.props.idReservation);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.idReservation !== state.idReservation) {
      return {
        idReservation: props.idReservation,
      };
    } else return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.idReservation !== this.state.idReservation) {
      this.getReservationByID(this.state.idReservation);
    }
  }

  getReservationByID(idReservation, functionByID) {
    CleverRequest.get(
      CleverConfig.getApiUrl("bengine") + `/api/booking/get/${idReservation}`,
      (response, error) => {
        if (!error) {
          if (response.Error == false) {
            this.setState(
              { load: false, responseReservation: response.data },
              this.setFormUser(response.data),
              this.setRooms(response.data)
            );
          } else {
            this.setState({ load: false }, functionByID);
          }
        } else {
          this.setState({ load: false }, functionByID);
        }
      }
    );
  }

  changeTab(idRoom) {
    this.arrayCodes.map((item, key) => {
      document.getElementById(`${item}`).style.display = "none";
      document.getElementById(`tab${item}`).style.borderRight = "";
      document.getElementById(`${item}_price`).style.display = "none";
      document.getElementById(`${item}_police`).style.display = "none";
    });

    document.getElementById(idRoom).style.display = "block";
    document.getElementById(`${idRoom}_price`).style.display = "block";
    document.getElementById(`${idRoom}_police`).style.display = "block";
    document.getElementById(`tab${idRoom}`).style.borderRight =
      "3px solid #35b194a9";
  }

  showSidebar = (e, section, dataPolice) => {
    switch (section) {
      case "CUSTOMER":
        var dataCustomer = this.state.responseReservation.customer;
        this.setState({ dataByCustomer: dataCustomer, isVisible: true });
        break;

      case "RESERVATION":
        var dataReservation = this.state.responseReservation;
        this.setState({ dataByReservation: dataReservation, isVisible: true });
        break;

      case "POLICIES":
        var dataPolicies = dataPolice;
        this.setState({ dataByPolices: dataPolicies, isVisible: true });
        break;

      case "COMMENTS":
        var dataComments = this.state.responseReservation;
        this.setState({ dataByComments: dataComments, isVisible: true });
        break;

      case "SERVICE":
        var dataService = this.state.responseReservation;
        this.setState({ dataByService: dataService, isVisible: true });
        break;

      default:
        break;
    }
  };

  hideSidebar = (e) => {
    this.setState({
      isVisible: false,
      dataByReservation: "",
      dataByCustomer: "",
      dataByPolices: "",
      dataByComments: "",
      dataByService: "",
    });
  };

  updateNoShow = (roomNumber, noShow) => {
    let dataToSave = [];

    dataToSave.push({
      idbook_hotel_room: roomNumber,
      no_show: noShow === 0 ? true : noShow === 1 ? false : undefined,
    });

    CleverRequest.put(
      CleverConfig.getApiUrl("bengine") + "/api/book-hotel-room/update-no-show",
      dataToSave,
      (data, error) => {
        if (!error) {
          let notificationType = "",
            notificationMessage = "";
          if (!data.Error) {
            notificationType = "success";
            notificationMessage = "The data was saved";
            this.componentDidMount();
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

  render() {
    let {
      load,
      isVisible,
      customerInformation,
      reservationInformation,
      dataByCustomer,
      dataByReservation,
      contentData,
      tabs,
      policesData,
      dataByPolices,
      pricesData,
      dataByService,
      dataByComments,
      TitleName,
    } = this.state;

    return (
      <div>
        <CleverLoading show={load} />
        {isVisible && (
          <OutsideClickHandler onOutsideClick={this.hideSidebar}>
            <div className="row" style={{ marginBottom: 0 }}>
              <div
                id="propertiesSidebar"
                className={
                  "col s6 m6 l6 offset-s6 offset-m6 offset-l6 z-depth-3" +
                  [
                    this.state.isVisible
                      ? this.state.slideIn
                      : this.state.slideOut,
                  ]
                }
              >
                {dataByCustomer && <Customer dataCustomer={dataByCustomer} />}
                {dataByReservation && (
                  <Reservation dataReservation={dataByReservation} />
                )}
                {dataByPolices && <Polices dataPolices={dataByPolices} />}
                {dataByComments && <Comments dataComments={dataByComments} />}
                {dataByService && <Service dataService={dataByService} />}
              </div>
            </div>
          </OutsideClickHandler>
        )}
        <Card
          classCard={{
            card: "card-booking-information m-0",
          }}
          header={`Reservation for ${TitleName}`}
          control={
            <span>
              <a
                onClick={(e) => this.showSidebar(e, "COMMENTS", "")}
                title="Comments"
                className="btn btn-link"
              >
                <i className="material-icons">comment</i>
              </a>
              <a
                onClick={(e) => this.showSidebar(e, "SERVICE", "")}
                title="Service information"
                className="btn btn-link"
              >
                <i className="material-icons">info</i>
              </a>
              <button
                type="button"
                onClick={(e) => this.props.onClose(e, "close", "")}
                ref={this.btnCloseGeneralInfo}
                id="btnCloseGeneralInfo"
                className="btn red"
              >
                <i className="material-icons right">close</i>
                CLOSE
              </button>
            </span>
          }
        >
          <div className="row">
            <div className="col s12 m6 l6">{customerInformation}</div>
            <div className="col s12 m6 l6">{reservationInformation}</div>
          </div>

          <div className="row">
            <div className="col s12 m12 l12">
              <h5>ROOMS</h5>
            </div>

            <div className="col s12 m2 l2">
              <div className="tabs-vertical">
                <ul className="tabs" style={{ height: "auto" }}>
                  {tabs}
                </ul>
              </div>
            </div>

            <div className="col s12 m10 l10">
              {contentData}
              {policesData}
              <h5>PRICES</h5>
              {pricesData}
            </div>
          </div>
        </Card>
      </div>
    );
  }
  setFormUser(data) {
    var dataCustomer = data.customer;
    var nameTitle = dataCustomer.title + " " + dataCustomer.last_name;
    this.setState(
      {
        customerInformation: (
          <table className="reservation-details">
            <tbody>
              <tr>
                <th colSpan="2" className="font-size-1">
                  <i className="material-icons left">face</i>
                  CUSTOMER INFORMATION
                  <a
                    onClick={(e) => this.showSidebar(e, "CUSTOMER", "")}
                    title="Show customer information"
                  >
                    <i className="material-icons right">visibility</i>
                  </a>
                </th>
              </tr>
              <tr>
                <th>Name</th>
                <td>{`${dataCustomer.title} ${dataCustomer.first_name} ${dataCustomer.last_name}`}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{dataCustomer.email}</td>
              </tr>
              <tr>
                <th>Country</th>
                <td>{dataCustomer.address.country_code}</td>
              </tr>
            </tbody>
          </table>
        ),
        TitleName: nameTitle,
      },
      this.setFormReservation(data)
    );
  }

  setFormReservation(data) {
    var dataReservation = data;
    this.setState({
      load: false,
      reservationInformation: (
        <table className="reservation-details">
          <tbody>
            <tr>
              <th colSpan="4" className="font-size-1">
                <i className="material-icons left">book</i>
                RESERVATION INFORMATION
                <a
                  onClick={(e) => this.showSidebar(e, "RESERVATION", "")}
                  title="Show reservation information"
                >
                  <i className="material-icons right">visibility</i>
                </a>
              </th>
            </tr>
            <tr>
              <th>Market code</th>
              <td colSpan="3">{dataReservation.market_code}</td>
            </tr>
            <tr>
              <th>From date</th>
              <td>{dataReservation.from_date}</td>
              <th>To date</th>
              <td>{dataReservation.to_date}</td>
            </tr>
            <tr>
              <th>Status</th>
              <td colSpan="3">{dataReservation.status}</td>
            </tr>
          </tbody>
        </table>
      ),
    });
  }

  setRooms = async (data) => {
    let arrayContent = [];
    let tabs = [];
    let currencyCode = data.currency_code;

    data.rooms.map((item, index) => {
      let statusDisplay = index == 0 ? "block" : "none";
      let statusBorder = index == 0 ? "3px solid #35b194a9" : "";
      let idRoom = `room ${index + 1}`;

      arrayContent.push(
        <div
          id={idRoom}
          key={index}
          className="tab-content"
          style={{
            display: statusDisplay,
            margin: "12px",
            paddingBottom: "10px",
          }}
        >
          <div className="row">
            <div className="col s12 m6 l6">
              <h4 style={{ color: "#70b5a5" }}>{item.trade_name_room}</h4>
            </div>
            <div className="col s12 m6 l6">
              <a
                onClick={(data) =>
                  this.updateNoShow(item.room_number, item.no_show)
                }
                title="Update no-show"
                className="black-text"
              >
                Update no-show
                <i
                  className={
                    item.no_show == 0
                      ? "material-icons left teal-text"
                      : "material-icons left red-text"
                  }
                >
                  {item.no_show == 0 ? "toggle_on" : "toggle_off"}
                </i>
              </a>
            </div>
          </div>
          <div className="row">
            <div
              className="col s12 m6 l6"
              style={{ border: "thin dotted #70b5a5", margin: "12px" }}
            >
              <div className="col s12 m6 l6">
                <p
                  style={{
                    textAlign: "right",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  PMS Confirmation Number:
                </p>
              </div>
              <div className="col s12 m6 l6">
                {item.pms_confirm_number !== "" ? (
                  <p
                    style={{
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#01536d",
                      fontWeight: "bold",
                    }}
                  >
                    {item.pms_confirm_number}
                  </p>
                ) : (
                  <p
                    style={{
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#01536d",
                      fontWeight: "bold",
                    }}
                  >
                    Not Confirmation Number
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col s12 m6 l6">
              <div className="col s12 m4 l4">
                <label>
                  <b>Total Gross: </b>
                </label>
                <br></br>
                <label>$ {item.total_crossout}</label>
              </div>
              <div className="col s12 m4 l4">
                <label>
                  <b>Discount Amount: </b>
                </label>
                <br></br>
                <label>$ {item.discount_amount}</label>
              </div>
              <div className="col s12 m4 l4">
                <label>
                  <b>Discount Percent: </b>
                </label>
                <br></br>
                <label>{item.discount_percent} %</label>
              </div>
              <h5>&nbsp;</h5>

              <div className="col s12 m12 l12">
                <label style={{ fontSize: "17px" }}>
                  <b>Total: </b>$
                </label>
                <label style={{ color: "#478279", fontSize: "19px" }}>
                  {" "}
                  {item.total + " "}
                </label>
                <label style={{ fontSize: "17px" }}> {currencyCode}</label>
              </div>
            </div>

            <div className="col s12 m6 l6">
              <label>
                <b>PAX</b>
              </label>{" "}
              <i className="material-icons left" style={{ padding: "10px" }}>
                supervisor_account
              </i>
              <hr
                style={{
                  width: "80%",
                  backgroundColor: "#cad8d5",
                  height: "1px",
                }}
              ></hr>
              <div className="col s12 m12 l12"></div>
              {Object.keys(item.pax).map((i, k) => {
                return (
                  <div className="col s12 m4 l4" key={k}>
                    <label>
                      <b>{i}: </b>
                    </label>
                    <label>{item.pax[i]}</label>
                  </div>
                );
              })}
            </div>

            <h5>&nbsp;</h5>
          </div>
        </div>
      );
      tabs.push(
        <li
          className="tab"
          key={index}
          id={`tab${idRoom}`}
          style={{ borderRight: statusBorder, display: "block" }}
        >
          <a onClick={(e) => this.changeTab(idRoom)}>{idRoom}</a>
        </li>
      );
      this.arrayCodes.push(idRoom);
    });

    this.setState(
      { contentData: arrayContent, tabs: tabs },
      this.setPolicesPrice(data)
    );
  };

  setPolicesPrice(data) {
    let dataPolices = [];
    let dataPrice = [];

    data.rooms.map((item, index) => {
      let statusDisplay = index == 0 ? "block" : "none";
      let idRoom = "room " + (index + 1);
      let dataPolice = item.polices;

      item.polices.map((police, k) => {
        dataPolices.push(
          <div
            id={idRoom + "_police"}
            key={index}
            className="col l12"
            style={{ display: statusDisplay }}
          >
            <button
              type="button"
              className="btn"
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
              }}
              onClick={(e) => this.showSidebar(e, "POLICIES", dataPolice)}
            >
              {police.policy_category}
              <span className="material-icons" style={{ paddingLeft: "1rem" }}>
                rule
              </span>
            </button>
          </div>
        );
      });
      let data = [];
      item.prices.map((price, k) => {
        let html = "";

        Object.keys(price).map((i, j) => {
          html = (
            <tr key={k + j}>
              <td>{k}</td>
              <td>{price.date}</td>
              <td>$ {price.price}</td>
              <td>$ {price.discount_amount}</td>
              <td>{price.discount_percent} %</td>
              <td>$ {price.total}</td>
            </tr>
          );
        });
        data.push(html);
      });
      dataPrice.push(
        <table
          id={idRoom + "_price"}
          className={"clever-table responsive-table"}
          key={index}
          style={{ display: statusDisplay !== "block" && "none" }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Price</th>
              <th>Discount ammount</th>
              <th>Discount percent</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>{data}</tbody>
        </table>
      );
    });

    this.setState({ policesData: dataPolices, pricesData: dataPrice });
  }
}

showInfo.defaultProps = {
  onClose: () => {},
  idReservation: 0,
};
