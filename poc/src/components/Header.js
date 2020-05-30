import React, { Component, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Form,
  FormControl,
  Button,
  Nav,
  NavDropdown,
} from "react-bootstrap";

class NavBar extends Component {
  render() {
    let extra = <Fragment />;
    if (this.props.loggedIn === true) {
      extra = (
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto"></Nav>
          <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-info">Search</Button>
          </Form>
        </Navbar.Collapse>
      );
    }
    return (
      <Navbar bg="dark" variant="dark" sticky="top">
        <Navbar.Brand>GitHub LinkedIn Integration</Navbar.Brand>
        {extra}
      </Navbar>
    );
  }
}
export default NavBar;
