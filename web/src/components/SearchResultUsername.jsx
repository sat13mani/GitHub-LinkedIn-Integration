import React, { Component, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Header";
import axios from "axios";
import LinkedIn from "./LinkedIn";
import GitHubBasic from "./GitHubBasic";
import RepoList from "./RepoList";
import HighlightCommit from "./HighlightCommit";
import HighlightIssues from "./HighlightIssues";
import HighlightPr from "./HighlightPr";
import {
  Row,
  Col,
  Figure,
  Tab,
  Tabs,
  ListGroup,
} from "react-bootstrap";

export default class SearchResultUsername extends Component {
  state = {
    l_username: "",
    linkedin_data: {},
    git_data: {},
    linkedin_div: <h4> Loading... </h4>,
    github_div: <h4> Loading... </h4>,
    repo_list: "",
    topCommit_div: <h4> Not Added </h4>,
    flag: 0,
    hasLinked: 0,
    skills: "",
    g_username: "",
  };

  componentDidMount() {
    let l_username = ((window.location.pathname).split("/"))[3];
    if (l_username) {
      this.setState({ l_username: l_username });
      this.checklink(l_username);
    }
  }

  handleUsernameSearch = (username) => {
    let path = `/search/username/${username}`;
    this.props.history.push({
      pathname: path,
      username: username,
    });
  };

  handleKeywordSearch = (keyword) => {
    let path = `/search/keyword/${keyword}`;
    this.props.history.push({
      pathname: path,
      keyword: keyword,
    });
  };

  checklink = (l_username) => {
    let url = `http://localhost:5000/check/${l_username}`;
    axios.get(url).then((res) => {
      let response = res.data;
      if (response !== 0) {
        let git_username = response;
        this.fetchGitHubData(git_username);
        this.setState({ g_username: git_username })
      }
      this.fetchLinkedinData(l_username);
    });
  };

  fetchGitHubData = (username) => {
    let url = `http://localhost:5000/getGitData/${username}`;
    axios.get(url).then((res) => {
      let git_data = res.data;
      this.setState({ git_data: git_data });
      let git_div = <GitHubBasic git_data={this.state.git_data} />;
      let repo_list = <RepoList repo_data={this.state.git_data.repo_data} />;
      this.setState({ git_div: git_div, repo_list: repo_list });
      this.setState({ hasLinked: 1 });
    });
    this.fetchTopCommits(username);
  };

  fetchLinkedinData = (username) => {
    let linkedin_url = `http://localhost:5000/username/${username}`;
    axios.get(linkedin_url).then((res) => {
      let linkedin_data = res.data;
      this.setState({ linkedin_data: linkedin_data });
      let skills = [];
      linkedin_data.skills.map((item) => {
        return skills.push(item.name);
      });
      this.setState({ skills: skills });
      let skill_list = this.state.skills.map((item, idx) => {
        return <ListGroup.Item key={idx}>{item}</ListGroup.Item>;
      });
      this.setState({ skills: skill_list });
      let linkedin_div = (
        <LinkedIn
          linkedin_data={this.state.linkedin_data}
          skills={this.state.skills}
        />
      );
      this.setState({ linkedin_div: linkedin_div, flag: 1 });
    });
  };

  fetchTopCommits = (g_username) => {
    let url = `http://localhost:5000/get/contribution/${g_username}`;
    axios
      .get(url)
      .then((res) => {
        let contributions = res.data.contributions;
        this.setState({ contribution: contributions });
        return contributions;
      })
      .then((contributions) => {
        if (contributions.length > 0) {
          let div = contributions.map((item, idx) => {
            if (item[1] !== "None") {
              return (
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <h5>
                        {" "}
                        {item[0]}. {item[1]}{" "}
                      </h5>
                      <h6> Message: {item[2]} </h6>
                      <hr className="my-4" />
                      {item[3]}
                    </Col>
                  </Row>
                </ListGroup.Item>
              );
            } else {
              return null;
            }
          });

          div = (
            <>
              <Row>
                <Col>
                  <ListGroup>{div}</ListGroup>
                </Col>
              </Row>
            </>
          );
          this.setState({ topCommit_div: div, flag: 2 });
        }
      });
  };

  render() {
    let git_div = (
      <Tab eventKey="gitData" title="GitHub Data">
        <div className="container-fluid" style={{ marginTop: "20px" }} />
        <Row>
          <Col xs={12}>
            <Fragment>{this.state.git_div} </Fragment>
            <div style={{ height: "30px" }} />
            <Fragment> {this.state.repo_list} </Fragment>
          </Col>
        </Row>
      </Tab>
    );

    let topCommit_div = (
      <Tab eventKey="hLightContri" title="Top Contributions">
        <Tabs>
          <Tab eventKey="hLightCommits" title="Top Commits">
            <HighlightCommit
              username={this.state.g_username}
              repo_data={this.state.git_data.repo_data}
              mode={0}
            />
          </Tab>
          <Tab eventKey="hLightIssues" title="Top Issues">
            <HighlightIssues g_username={this.state.g_username} mode={0} />
          </Tab>
          <Tab eventKey="hLightpr" title="Top PR">
            <HighlightPr g_username={this.state.g_username} mode={0} />
          </Tab>
        </Tabs>
      </Tab>
    );
    if (this.state.hasLinked !== 1) {
      git_div = <> </>;
      topCommit_div = <> </>
    }

    let l_username = localStorage.getItem("username");
    let loggedIn = false;
    if (l_username) {
      loggedIn = true;
    }

    let id_component = <> </>;
    if (this.state.g_username) {
      let url = `https://github.com/${this.state.g_username}`;
      id_component = <h6> GitHub - <a href={url}> {this.state.g_username}</a> </h6>
    }

    return (
      <div style={{ overflow: "hidden" }}>
        <NavBar
          loggedIn={loggedIn}
          l_username={l_username}
          handleUsernameSearch={this.handleUsernameSearch}
          handleKeywordSearch={this.handleKeywordSearch}
        />
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
              <Figure.Caption> {this.state.l_username} {id_component}</Figure.Caption>
            </Figure>
          </Col>
          <Col>
            <Tabs defaultActiveKey="linkData" id="uncontrolled-tab-example">
              <Tab eventKey="linkData" title="LinkedIn Data">
                <div
                  className="container-fluid"
                  style={{ marginTop: "20px" }}
                />
                <Fragment> {this.state.linkedin_div} </Fragment>
              </Tab>
              {git_div}
              {topCommit_div}
            </Tabs>
          </Col>
          <Col xs={1} />
        </Row>
        <Row>
          <div className="container-fluid" style={{ marginTop: "60px" }} />
        </Row>
      </div>
    );
  }
}
