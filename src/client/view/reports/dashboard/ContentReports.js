import React, { Component } from "react";
import PropTypes from "prop-types";
import { Card, Panel, CleverButton } from "clever-component-library";

export default class ContentReports extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      load: false,
      viewGrid: false,
    };
  }

  componentDidMount() {
    this.setState({
      contentBody: this.props.contentBody,
      headBody: this.props.headBody,
      footBody: this.props.footBody,
      contentHead: this.props.contentHead,
      hiddenBtnExcel: this.props.hiddenBtnExcel,
      hiddenBtnpdf: this.props.hiddenBtnpdf,
      activateScroll: this.props.activateScroll,
    });
  }

  returnMenuReports(e, url) {
    window.location = url;
  }

  setStatusBodyReports(status) {
    this.setState({ viewGrid: status });
  }

  getStatusBodyReports() {
    let statusBody = this.state.viewGrid;
    return statusBody;
  }

  setHead(contentHead, functionSetHead = () => {}) {
    this.setState({ contentHead: contentHead }, functionSetHead);
  }

  setBody(contentBody, functionSetBody = () => {}) {
    this.setState({ contentBody: contentBody }, functionSetBody);
  }

  setHeadBody(contentHeadBody, functionHeadBody = () => {}) {
    this.setState({ headBody: contentHeadBody }, functionHeadBody);
  }

  setFoodBody(contentFootBody, functionFoot = () => {}) {
    this.setState({ footBody: contentFootBody }, functionFoot);
  }

  getStyle() {
    let { activateScroll } = this.state;

    if (activateScroll == true) {
      return {
        overflowY: "scroll",
        height: Math.round(screen.width / 2) + "px",
      };
    }
    return {};
  }

  render() {
    let {
      viewGrid,
      contentBody,
      headBody,
      footBody,
      contentHead,
      hiddenBtnExcel,
      hiddenBtnpdf,
    } = this.state;
    return (
      //Card contenedor de todo el Reporte
      <Card
        id={"card-Form"}
        header={this.props.title}
        control={
          this.props.isVisibleReturnMenu && (
            //Sección de icono para regresar al MenuPrincipal
            <div className="row">
              <a
                className="col btn btn-small red"
                onClick={(e) => this.returnMenuReports(e, this.props.urlMenu)}
              >
                close
                <i className="material-icons right">close</i>
              </a>
            </div>
          )
        }
      >
        {/* Contenedor del Reporte */}
        <div className="row">
          <div className="row">{contentHead}</div>
          {viewGrid && (
            <>
              <div className="row">
                <div className="col s12 m4 l4 offset-m8 offset-l8">
                  {hiddenBtnExcel && (
                    <CleverButton
                      name="btnDownloadExcel"
                      size={hiddenBtnpdf ? "col s6 m6 l6" : "col s12 m12 l12"}
                      icon="download"
                      label="excel"
                      fullSize={true}
                      onClick={(e) => this.props.onDownload(e, "excel")}
                    />
                  )}
                  {hiddenBtnpdf && (
                    <CleverButton
                      name="btnDownloadPdf"
                      size={hiddenBtnExcel ? "col s6 m6 l6" : "col s12 m12 l12"}
                      icon="download"
                      label="pdf"
                      fullSize={true}
                      onClick={(e) => this.props.onDownload(e, "pdf")}
                    />
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col s12 m12 l12">{headBody}</div>
              </div>
              <div className="row">
                <div className="col s12 m12 l12" style={this.getStyle()}>
                  {contentBody}
                </div>
              </div>
              <div className="row">
                <div className="col s12 m12 l12">{footBody}</div>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  }
}

ContentReports.propTypes = {
  onRef: PropTypes.func,
  onDownload: PropTypes.func,
  title: PropTypes.string,
  urlMenu: PropTypes.string,
  nameIcon: PropTypes.string,
  hiddenBtnExcel: PropTypes.string,
  hiddenBtnpdf: PropTypes.string,
  isVisibleReturnMenu: PropTypes.bool,
  activateScroll: PropTypes.bool,
};

ContentReports.defaultProps = {
  onRef: () => {},
  onDownload: () => {},
  title: "",
  urlMenu: "/reports",
  nameIcon: "",
  hiddenBtnExcel: "block",
  hiddenBtnpdf: "block",
  contentHead: <span></span>,
  contentBody: <span></span>,
  headBody: <></>,
  footBody: <></>,
  activateScroll: false,
  isVisibleReturnMenu: false,
};
