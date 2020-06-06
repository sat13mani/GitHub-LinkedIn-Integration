import React, { Component, Fragment } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import { PlusSquareFill } from "react-bootstrap-icons";

export default class HighlightIssues extends Component {
    state = {
        rank: 1,
        repo_fullname: "",
        issue_number: "",
        description: "",
        component: <> </>,
        component_flag: 0,
        plus_square: 40,
        form_flag: 0,
    };

    componentDidMount() {
        this.fetchIssues();
    }

    fetchIssues = async () => {
        let g_username = this.props.g_username;
        let issues;
        let url = `http://localhost:5000/get/issues/${g_username}`;
        await axios.get(url).then((res) => {
            issues = res.data.issues;
        })
        console.log(issues);
        if (issues.length > 0) {
            let div = issues.map((item) => {
                if (item[2] !== "None") {
                    let url = `https://github.com/${item[2]}/issues/${item[3]}`;
                    return (
                        <ListGroup.Item>
                            <a href={url} style={{ color: "inherit", textDecoration: "None" }}>
                                <Row>
                                    <Col>
                                        <h6>
                                            {item[2]}
                                        </h6>
                                        <h6> Title: {item[5]} <br /> {item[6]} </h6>
                                        <h6> <a href={url}> Link to Issue </a> </h6>
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
            this.setState({ component: <> Not Added </> })
        }
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        // make a post request to backend
        // make one first
        let url = "http://localhost:5000/highlight/issue";
        axios.post(url, {
            rank: this.state.rank,
            repo_fullname: this.state.repo_fullname,
            issue_number: this.state.issue_number,
            description: this.state.description,
            g_username: this.props.g_username
        })
            .then((res) => {
                alert(res.data);
                
                this.setState({
                    form_flag: 0,
                    description: "",
                    repo_fullname: "",
                    issue_number: "",
                    plus_square: 40,
                    rank: 1,
                });
                this.fetchIssues();
            })
    }

    handleCreate = (event) => {
        this.setState({
            form_flag: 1,
            plus_square: 0,
        });
        if (!this.state.component_flag) {
            this.setState({ component: <> </> });
        }
    };

    render() {
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

        let form_component = (
            <Form onSubmit={this.handleSubmit}>
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
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Name of the Repo </Form.Label>
                    <Form.Control
                        name="repo_fullname"
                        value={this.state.repo_fullname}
                        onChange={this.handleChange}
                        placeholder="format: owner/repo-name"
                    />
                </Form.Group>
                <Form.Group controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Issue Number </Form.Label>
                    <Form.Control
                        name="issue_number"
                        value={this.state.issue_number}
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
                    Submit
                </Button>
            </Form>
        );

        if (this.state.form_flag !== 1) {
            form_component = <> </>;
        }

        if (this.props.mode === 0) {
            create_button = <> </>;
            form_component = <> </>;
        }

        console.log(this.props.mode)

        return (
            <>
                <div className="container-fluid" style={{ marginTop: "20px" }} />
                {this.state.component}
                <div className="container-fluid" style={{ marginTop: "20px" }} />
                <Row>
                    <Col className="text-center">{create_button}</Col>
                </Row>
                {form_component}
            </>
        )
    }
}