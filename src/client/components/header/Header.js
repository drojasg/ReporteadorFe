import React from "react";
import "./header.css";

export default class Header extends React.Component {
  render() {
    return (
      <div className={this.props.size}>
        <div className={"card header"}>
          <span>{this.props.title}</span>
          {this.props.controls.map((control, keyControl) => {
            return (
              <div className="header-controls" key={"control-" + keyControl}>
                {control.control}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

Header.defaultProps = {
  size: "col s12 m12 l12",
  title: "",
  controls: [],
};
