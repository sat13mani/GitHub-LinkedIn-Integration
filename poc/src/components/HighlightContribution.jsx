import React, { Component, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Form,
  Button,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import { PlusSquareFill } from "react-bootstrap-icons";

export default class HighlightContribution extends Component {
  state = {
    rank: 1,
    drp_dwn1: "",
    drp_dwn2: "",
    commit_list: [],
    description: "",
    sha: "",
    formFlag: 0,
    contribution: [],
    component: <></>,
    component_flag: 0,
    plus_square: 40,
    submit_placeholder: "submit",
    isSubmitting: false,
  };

  componentDidMount() {
    this.checkContribution();
  }

  checkContribution = () => {
    let username = this.props.username;
    let url = `http://localhost:5000/get/contribution/${username}`;
    axios
      .get(url)
      .then((res) => {
        let contributions = res.data.contributions;
        console.log("res", contributions);
        this.setState({ contribution: contributions });
        return contributions;
      })
      .then((contributions) => {
        if (contributions.length > 0) {
          let div = contributions.map((item, idx) => {

            if (item[2] !== "None") {
              let url = `https://github.com/${username}/${item[1]}/commit/${item[3]}`
              return (
                <ListGroup.Item>
                  <a href={url} style={{ color: "inherit", textDecoration: "None" }}>
                    <Row>
                      <Col>
                        <h5>
                          {" "}
                          {item[0]}. {item[1]}{" "}
                        </h5>
                        <h6> Message: {item[2]} </h6>
                        <h6> <a href={url}> Link to commit </a> </h6>
                        <hr className="my-4" />
                        {item[4]}
                      </Col>
                    </Row>
                  </a>
                </ListGroup.Item>
              );
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
          this.setState({
            component: div,
            component_flag: 1,
          });
        } else {
          this.setState({ component: <> Not Added</> });
        }
      });
  };

  handleCreate = (event) => {
    this.setState({
      formFlag: 1,
      plus_square: 0,
    });
    if (!this.state.component_flag) {
      this.setState({ component: <> </> });
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
    console.log(event.target.name, event.target.value);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ submit_placeholder: "submitting", isSubmitting: true });
    let url = "http://localhost:5000/highlight/contribution";
    axios
      .post(url, {
        g_username: this.props.username,
        rank: this.state.rank,
        repo: this.state.drp_dwn1,
        commit: this.state.sha,
        description: this.state.description,
      })
      .then((res) => {
        alert(res.data);
        this.setState({
          submit_placeholder: "submit",
          isSubmitting: false,
          plus_square: 40,
          formFlag: 0,
          rank: 1,
          drp_dwn1: "",
          drp_dwn2: "",
          description: "",
        });
        this.checkContribution();
      });
  };

  menu = "";

  render() {
    let repo_list = this.props.repo_data;
    let drpDwn1 = repo_list.map((item, idx) => {
      return <option key={idx}> {item.name} </option>;
    });
    let form_div = (
      <Form>
        <Form.Group
          controlId="exampleForm.ControlSelect0"
          name="rank"
          value={this.state.rank}
          onChange={this.handleChange}
        >
          <Form.Label>Rank Contribution</Form.Label>
          <Form.Control as="select" name="rank" value={this.state.rank}>
            <option> {"1"} </option>
            <option> {"2"} </option>
            <option> {"3"} </option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlSelect1">
          <Form.Label>Repo List(select from dropdown)</Form.Label>
          <Form.Control
            as="select"
            name="drp_dwn1"
            value={this.state.drp_dwn1}
            onChange={this.handleChange}
          >
            <option> {""} </option>
            {drpDwn1}
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Enter SHA for your commit </Form.Label>
          <Form.Control
            name="sha"
            value={this.state.sha}
            onChange={this.handleChange}
          />
        </Form.Group>
        <Form.Group controlId="exampleForm.ControlTextarea1">
          <Form.Label>Describe your Contribution </Form.Label>
          <Form.Control
            as="textarea"
            rows="3"
            name="description"
            value={this.state.description}
            onChange={this.handleChange}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={this.handleSubmit}
          disabled={this.state.isSubmitting}
        >
          {this.state.submit_placeholder}
        </Button>
      </Form>
    );

    if (this.state.formFlag !== 1) {
      form_div = <> </>;
    }

    let create_button = (
      <Fragment>
        {" "}
        <PlusSquareFill
          color="royalblue"
          size={this.state.plus_square}
          onClick={this.handleCreate}
        />
        <div className="container-fluid" style={{ marginTop: "10px" }} />
        <h6> Add / Edit Contribution </h6>{" "}
      </Fragment>
    );

    if (this.props.mode === 0) {
      create_button = <> </>;
      form_div = <> </>;
    }

    return (
      <>
        <div className="container-fluid" style={{ marginTop: "20px" }} />
        {this.state.component}
        <div className="container-fluid" style={{ marginTop: "20px" }} />
        <Row>
          <Col className="text-center">{create_button}</Col>
        </Row>
        {form_div}
      </>
    );
  }
}
