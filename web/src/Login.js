import React, { Component } from "react";
import NavBar from "./components/Header";
import { Button } from "react-bootstrap";
import axios from "axios";


class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      password: "",
      loggedin: false,
      placeholder: "",
      git_id: "",
    };
  }

  componentDidMount() {
    localStorage.clear();
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
      .post("http://localhost:5000/login", {
        username: this.state.username,
        password: this.state.password,
      })
      .then((msg) => {
        if (msg.data !== "Login failed") {
          let username = this.state.username;
          localStorage.setItem("username", username)
          this.props.history.push({
            pathname: "/profile",
            username: this.state.username,
            hasLinked: msg.data,
          });
        } else {
          this.setState({ placeholder: msg.data });
        }
      });
  };

  handleSignup = (event) => {
    this.props.history.push("/signup");
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
                  <h5 className="card-title text-center">Log In</h5>
                  <form className="form-signin" onSubmit={this.handleSubmit}>
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
                    <div className="col text-center text-danger">
                      {this.state.placeholder}
                    </div>
                    <br />
                    <Button
                      variant="info"
                      type="submit"
                      onClick={this.handleSubmit}
                      disabled={this.state.logging_in}
                      size="lg"
                      block
                    >
                      {this.state.logging_in ? "Logging in" : "Log in"}
                    </Button>
                    <br />
                    <div className="col text-center">
                      Forgot Password? &nbsp;&nbsp;
                      <a href="/forgotpassword">Reset here </a>
                    </div>
                    <hr className="my-4" />
                    <div className="col text-center">
                      <button
                        className="btn btn-success"
                        type="submit"
                        onClick={this.handleSignup}
                      >
                        Sign Up
                      </button>
                    </div>
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

export default Login;
