import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Form, FormControl, Button } from "react-bootstrap";

class NavBar extends Component {
	render() {
		var searchBar = (
			<Form inline>
				<FormControl
					type="text"
					placeholder="Search"
					className="mr-sm-2"
				/>
				<Button variant="outline-info">Search</Button>
			</Form>
		);
		return (
			<Navbar bg="dark" variant="dark">
				<Navbar.Brand href="#home">
					GitHub LinkedIn Integration
				</Navbar.Brand>
				<div style={{ width: "915px" }}> </div>
				{this.props.isloggedin ? searchBar: <div />}
			</Navbar>
		);
	}
}
export default NavBar;
