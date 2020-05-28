import React, { Component } from "react";
import NavBar from "./components/Header";
import { Button } from "react-bootstrap";
import axios from 'axios';

class Signup extends Component {
  constructor() {
    super();
    this.state = {
      name: "",
      username: "",
      password: "",
      loggedin: false,
      placeholder: "",
      logging_in: "",
    };
  }
  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:5000/signup", {
        name: this.state.name,
        username: this.state.username,
        password: this.state.password,
      })
      .then((msg) => {
        console.log(msg);
        this.props.history.push("/")
        // if (msg.data.message === "success") {
        //   this.props.history.push("/dashboard");
        //   this.setState({ loggedin: true });
        // } else {
        //   this.setState({ placeholder: msg.data.message });
        // }
      });
  };

  render() {
    return (
      <div>
        <NavBar />
        <div className="container">
          <div className="row">
            <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
              <div className="card card-signin my-5">
                <div className="card-body">
                  <h5 className="card-title text-center">Sign Up</h5>
                  <form className="form-signin" onSubmit={this.handleSubmit}>
                  <div className="form-label-group">  
                      <label>Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Name"
                        name="name"
                        value={this.state.name}
                        onChange={this.handleChange}
                      />
                    </div>
                    <br />
                    <div className="form-label-group">
                      <label>LinkedIn Username</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="LinkedIn Username"
                        name="username"
                        value={this.state.username}
                        onChange={this.handleChange}
                      />
                    </div>
                    <br />
                    <label>Password</label>
                    <div className="form-label-group">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        name="password"
                        value={this.state.password}
                        onChange={this.handleChange}
                      />
                    </div>
                    <br />
                    <Button
                      variant="info"
                      type="submit"
                      onClick={this.handleLogin}
                      disabled={this.state.logging_in}
                      size="lg"
                      block
                    >
                      {this.state.logging_in ? "Registering" : "Sign Up"}
                    </Button>
                    <br />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Signup;
