import React, { Component, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Navbar,
  Form,
  FormControl,
  Button,
  Nav,
  NavDropdown,
  ButtonGroup,
  DropdownButton,
  Dropdown,
} from "react-bootstrap";

class NavBar extends Component {
  state = {
    search: "",
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleUsernameSearch = (event) => {
    event.preventDefault();
    let l_username = this.state.search;
    this.props.handleUsernameSearch(l_username);
  };

  handleKeywordSearch = (event) => {
    event.preventDefault();
    let keyword = this.state.search;
    this.props.handleKeywordSearch(keyword);
  };

  render() {
    let extra = <Fragment />;
    if (this.props.loggedIn === true) {
      extra = (
        <>
          <Form inline>
            <FormControl
              type="text"
              placeholder="Search"
              name="search"
              value={this.state.search}
              onChange={this.handleChange}
              className="mr-sm-4"
            />
            <ButtonGroup>
              <DropdownButton
                as={ButtonGroup}
                title="Search"
                id="bg-nested-dropdown"
                variant="outline-info"
              >
                <Dropdown.Item eventKey="1" onClick={this.handleUsernameSearch}>
                  Search Username
                </Dropdown.Item>
                <Dropdown.Item eventKey="2" onClick={this.handleKeywordSearch}>
                  Search Keyword
                </Dropdown.Item>
              </DropdownButton>
            </ButtonGroup>
          </Form>
          <Nav>
            <Navbar.Text>
              {" "}
              <a href="/"> Sign Out </a>{" "}
            </Navbar.Text>
          </Nav>
        </>
      );
    }
    return (
      <Navbar bg="dark justify-content-between" variant="dark" sticky="top">
        <Navbar.Brand>GitHub LinkedIn Integration</Navbar.Brand>
        {extra}
      </Navbar>
    );
  }
}
export default NavBar;
