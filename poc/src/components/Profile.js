import React, { Fragment, Component } from "react";
import axios from "axios";
import NavBar from "./Header";
import { Card, Button } from "react-bootstrap";

class Profile extends Component {
  state = {
    username: "",
    linkedin_data: {},
    skills: [],
    hasLinked: 0,
    git_id: "",
    git_data: "",
  };

  componentDidMount() {
    this.setState({ username: this.props.location.username });
    axios
      .get(`http://localhost:5000/username/${this.props.location.username}`)
      .then((msg) => {
        this.setState({
          linkedin_data: msg.data,
        });
        let skills = [];

        let _ = msg.data.skills.map((item) => {
          skills.push(item.name);
        });
        this.setState({ skills: skills });
        let skill_list = this.state.skills.map((item, idx) => {
          return (
            <span key={idx}>
              <strong>{item}</strong> &nbsp; | &nbsp;
            </span>
          );
        });
        this.setState({ skills: skill_list });
      });
    this.setState({ hasLinked: this.props.location.hasLinked });
    this.checkLink();
  }

  checkLink = () => {
    let username = this.state.username;
    let url = `http://localhost:5000/check/${username}`;
    axios.get(url).then((res) => {
      console.log("checkLink", res.data);
      if (res.data !== "0") {
        this.setState({ git_id: res.data, hasLinked: 1 });
      } else {
        this.setState({
          hasLinked: 0,
        });
      }
    });
  };

  handleLink = (event) => {
    event.preventDefault();
    let url = `https://github.com/login/oauth/authorize?client_id=Iv1.6a23a85edae7274a&state=${this.state.username}`;
    var windowObjectReference;
    var windowFeatures =
      "menubar=no,resizable=no,scrollbars=no,status=no, width=800, height=800";
    windowObjectReference = window.open(url, "Login", windowFeatures);
  };

  render() {
    let button;
    if (this.state.hasLinked === 0) {
      button = (
        <Button variant="success" onClick={this.handleLink}>
          {" "}
          Link GitHub{" "}
        </Button>
      );
    } else {
      button = <div> {this.state.git_id} </div>;
    }
    return (
      <Fragment>
        <NavBar isloggedin={true} />
        <div className="container-fluid" style={{ marginTop: "40px" }} />

        <div className="container-fluid">
          <div className="row">
            <div className="col col-lg-2" />
            <div className="col col-lg-2">
              <img
                src="https://picsum.photos/200/300?image=1062"
                className="avatar"
                alt="avatar"
              />
              <hr className="my-4" />
              <div className="text-center">
                <h4>{this.state.username}</h4>
                <br />
                {button}
              </div>
            </div>
            <div className="col col-lg-8">
              <div style={{ marginLeft: "150px" }}>
                <Card
                  style={{
                    width: "30rem",
                    justifyContent: "center",
                  }}
                  border="dark"
                >
                  <Card.Body>
                    <Card.Title>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div>LinkedIn Data</div>
                      </div>
                    </Card.Title>
                    <Card.Text className="text-center">
                      {this.state.linkedin_data.firstName}{" "}
                      {this.state.linkedin_data.lastName}
                    </Card.Text>
                    <Card.Text>{this.state.linkedin_data.headline}</Card.Text>
                    <Card.Text>{this.state.linkedin_data.summary}</Card.Text>
                    <Card.Text className="text-center">
                      <strong> Skills</strong>
                    </Card.Text>
                    {this.state.skills}
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Profile;
