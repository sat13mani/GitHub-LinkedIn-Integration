import React, { Fragment, Component } from "react";
import axios from "axios";
import NavBar from "./Header";
import LinkedIn from "./LinkedIn";
import GitHubBasic from "./GitHubBasic";
import RepoList from "./RepoList";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Figure,
  Tab,
  Tabs,
  ListGroup
} from "react-bootstrap";

class Profile extends Component {
  state = {
    username: "",
    linkedin_data: {},
    is_linkedin_available: 0,
    is_git_available: 0,
    skills: [],
    hasLinked: 0,
    git_id: "",
    git_data: {},
  };

  componentDidMount() {
    this.setState({ username: this.props.location.username });
    axios
      .get(`http://localhost:5000/username/${this.props.location.username}`)
      .then((msg) => {
        this.setState({
          linkedin_data: msg.data,
          is_linkedin_available: 1,
        });

        let skills = [];
        let _ = msg.data.skills.map((item) => {
          skills.push(item.name);
        });
        this.setState({ skills: skills });
        let skill_list = this.state.skills.map((item, idx) => {
          return (
            <ListGroup.Item key={idx}>
                {item}
            </ListGroup.Item>
          );
        });
        this.setState({ skills: skill_list });
      });

    this.setState({ hasLinked: this.props.location.hasLinked });
    this.checkLink();
  }

  checkLink = () => {
    let username = this.props.location.username;
    let url = `http://localhost:5000/check/${username}`;
    axios.get(url).then((res) => {
      if (res.data !== 0) {
        let git_id = res.data;
        this.setState({ git_id: git_id, hasLinked: 1 });
        let gitDataUrl = `http://localhost:5000/getGitData/${git_id}`;
        axios.get(gitDataUrl).then((res) => {
          this.setState({ git_data: res.data, is_git_available: 1 });
        });
      } else {
        this.setState({
          hasLinked: 0,
        });
      }
    });
  };

  handleLink = (event) => {
    event.preventDefault();
    let base_url = `https://github.com/login/oauth/authorize`;
    let query = `?client_id=Iv1.6a23a85edae7274a&state=${this.state.username}`;
    let url = base_url + query;
    let windowObjectReference;
    let windowFeatures =
      "menubar=no,resizable=no,scrollbars=no,status=no, width=800, height=800";
    windowObjectReference = window.open(url, "Login", windowFeatures);
  };

  custom_sort = (a, b) => {
    return a.stars - b.stars;
  };

  render() {
    let button, repo_list;
    let git_div = <div> </div>;
    if (this.state.hasLinked === 0) {
      button = (
        <Button variant="success" onClick={this.handleLink}>
          {" "}
          Link GitHub{" "}
        </Button>
      );
    } else {
      button = <div> Loading ... </div>;
      git_div = (
        <div style={{ marginLeft: "300px" }}> Loading GitHub data ... </div>
      );
      if (this.state.is_git_available) {
        let url = `https://github.com/${this.state.git_id}`;
        button = (
          <div>
            {" "}
            GitHub - <a href={url}> {this.state.git_id} </a>{" "}
          </div>
        );
        git_div = <GitHubBasic git_data={this.state.git_data} />;
        repo_list = <RepoList repo_data={this.state.git_data.repo_data} />;
      }
    }

    let linkedin_div = <Fragment> Loading LinkedIn data ... </Fragment>;

    if (this.state.is_linkedin_available) {
      linkedin_div = (
        <LinkedIn
          linkedin_data={this.state.linkedin_data}
          skills={this.state.skills}
        />
      );
    }

    return (
      <Fragment>
        <NavBar loggedIn={true} />
        <div className="container-fluid" style={{ marginTop: "20px" }} />
        <Row>
          <Col className="text-center" xs={4}>
            <div className="container-fluid" style={{ marginTop: "40px" }} />
            <Figure className="text-center">
              <Figure.Image
                width={171}
                height={180}
                alt="avatar"
                src="https://picsum.photos/200/300/?blur=4"
              />
              <Figure.Caption>
                <br />
                <h4>{this.state.username}</h4>
                {button}
              </Figure.Caption>
            </Figure>
          </Col>
          <Col>
            <Tabs defaultActiveKey="linkData" id="uncontrolled-tab-example">
              <Tab eventKey="linkData" title="LinkedIn Data">
                <div
                  className="container-fluid"
                  style={{ marginTop: "20px" }}
                />
                <Fragment> {linkedin_div} </Fragment>
              </Tab>
              {this.state.is_git_available ? (
                <Tab eventKey="gitData" title="GitHub Data">
                  <div
                    className="container-fluid"
                    style={{ marginTop: "20px" }}
                  />
                  <Row>
                    <Col xs={12}>
                      <Fragment>{git_div}</Fragment>
                      <div style={{ height: "30px" }} />
                      <Fragment> {repo_list} </Fragment>
                    </Col>
                  </Row>
                </Tab>
              ) : (
                <Tab />
              )}
            </Tabs>
          </Col>
          <Col xs={1} />
        </Row>
        <Row>
          <div className="container-fluid" style={{ marginTop: "60px" }} />
        </Row>
      </Fragment>
    );
  }
}

export default Profile;
