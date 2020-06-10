import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Header";
import axios from "axios";
import {
    Row,
    Col,
    Figure,
    ListGroup,
    Form,
    Button,
    Modal,
} from "react-bootstrap";

export default class SearchResultKeyword extends Component {
    state = {
        search_result: <h1> Loading, Please be patient </h1>,
        raw_result: [],
        modal_data: <h1> Loading .. </h1>,
        linked_users: [],
        repo_filter: "",
        stars_filter: "",
        languages: "",
    };

    async componentDidMount() {
        let keyword = (window.location.pathname).split("/")[3]
        let url = `http://localhost:5000/search/${keyword}`;
        axios
            .get(url)
            .then(async (res) => {
                let lst = res.data.result;
                let linked_users = [];
                for (var i = 0; i < lst.length; i++) {
                    let idx = i,
                        item = lst[i];
                    let obj = {};
                    let l_username = item.publicIdentifier;
                    let hasLinked = 0,
                        g_username = "";

                    // check if user has linked account or not

                    let chk_url = `http://localhost:5000/check/${l_username}`;
                    await axios
                        .get(chk_url)
                        .then((res) => {
                            if (res.data !== 0) {
                                g_username = res.data;
                                hasLinked = 1;
                                linked_users.push(g_username);
                            }
                        })
                        .then(() => {
                            obj["l_username"] = l_username;
                            obj["hasLinked"] = hasLinked;
                            obj["g_username"] = g_username;
                            obj["linkedin_data"] = item;
                            let temp = this.state.raw_result;
                            temp.push(obj);
                            this.setState({ raw_result: temp });
                        });
                }
                this.setState({ linked_users: linked_users })
                console.log(linked_users)
            })
            .then(async () => {
                let temp = await this.cardFormation(this.state.raw_result);
                return temp;
            })
            .then((temp) => {
                temp = <ListGroup> {temp} </ListGroup>;
                console.log(temp);
                this.setState({ search_result: temp });
            });
    }

    cardFormation = async (raw_result) => {
        var temp = await raw_result.map((item, idx) => {
            let l_data = item.linkedin_data;
            let g_username = item.g_username;
            let git_data;
            let chk_url = `http://localhost:5000/getGitData/${g_username}`;

            axios.get(chk_url).then((res) => {
                git_data = res.data;
                let div = (
                    <p>
                        Public Repos - {git_data.public_repos} <br />
                        Followers - {git_data.followers} <br />
                        Repo Stars - {git_data.stars} <br />
                    </p>
                );
                this.setState({ modal_data: div });
            });
            const self = this;
            function MyVerticallyCenteredModal(props) {
                return (
                    <Modal
                        {...props}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-vcenter">
                                {g_username}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{self.state.modal_data}</Modal.Body>
                        <Modal.Footer>
                            <Button onClick={props.onHide}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                );
            }

            function App() {
                const [modalShow, setModalShow] = React.useState(false);

                return (
                    <>
                        <Figure>
                            <Figure.Image
                                width={30}
                                height={30}
                                alt="git logo"
                                src="https://image.flaticon.com/icons/svg/25/25231.svg"
                                onClick={() => setModalShow(true)}
                            />
                        </Figure>

                        <MyVerticallyCenteredModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                        />
                    </>
                );
            }
            return (
                <ListGroup.Item key={idx}>
                    <div>
                        <Row>
                            <span>
                                {" "}
                                <h4> {l_data.title.text} </h4>{" "}
                            </span>
                            &nbsp;&nbsp;
                            <span>{item.hasLinked ? <App /> : <> </>}</span>
                        </Row>
                        <h6> {l_data.headline.text} </h6>
                        <p>
                            Link -{" "}
                            <a href={l_data.navigationUrl}>
                                {" "}
                                {l_data.navigationUrl}{" "}
                            </a>
                        </p>
                    </div>
                </ListGroup.Item>
            );
        });

        console.log("temp", temp);
        console.log("executed");
        return temp;
    };

    handleUsernameSearch = (username) => {
        let path = `/search/username/${username}`;
        this.props.history.push({
            pathname: path,
            username: username,
        });
    };

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleKeywordSearch = (keyword) => {
        let path = `/search/keyword/${keyword}`;
        this.props.history.push({
            pathname: path,
            keyword: keyword,
        });
    };

    handleFilter = (event) => {
        event.preventDefault();
        let url = `http://localhost:5000/filter`;
        axios.post(url, {
            'list': this.state.linked_users,
            'repo_filter': this.state.repo_filter,
            'stars_filter': this.state.stars_filter,
            'languages': this.state.languages
        }).then(async (res) => {
            const {result} = res.data;
            let set = new Set();
            for (var i = 0; i < result.length; i++) {
                set.add(result[i])
            }
            console.log(set)
            let rr = this.state.raw_result;
            let lst = [];
            for (i = 0; i < rr.length; i++) {
                if (rr[i].hasLinked) {
                    if (set.has(rr[i].g_username)) {
                        lst.push(rr[i])
                    }
                }
            }
            let temp = await this.cardFormation(lst);
            temp = <ListGroup> {temp} </ListGroup>;
            console.log(temp);
            this.setState({ search_result: temp });
        })
    }

    render() {
        return (
            <div>
                <NavBar
                    loggedIn={true}
                    handleUsernameSearch={this.handleUsernameSearch}
                    handleKeywordSearch={this.handleKeywordSearch}
                />
                <div
                    className="container-fluid"
                    style={{ marginTop: "20px" }}
                />
                <Row>
                    <Col xs={1}></Col>
                    <Col xs={7}>{this.state.search_result}</Col>
                    <Col xs={3} className="text-center">
                        <h4>GitHub Filters </h4>
                        gt: greater than eq: equals
                        <div
                            className="container-fluid"
                            style={{ marginTop: "20px" }}
                        />
                        <div className="text-center">
                            <Form>
                                <div
                                    className="container-fluid"
                                    style={{ marginTop: "20px" }}
                                />
                                <Form.Row>
                                    Public Repos &nbsp; &nbsp;&nbsp; &nbsp;
                                    <Form.Group
                                        as={Col}
                                        controlId="formGridEmail"
                                    >
                                        <Form.Control
                                            name="repo_filter"
                                            value={this.state.repo_filter}
                                            type="text"
                                            placeholder="gt10, lt10, bt10 20"
                                            onChange={this.handleChange}
                                        />
                                    </Form.Group>
                                </Form.Row>

                                <div
                                    className="container-fluid"
                                    style={{ marginTop: "20px" }}
                                />
                                <Form.Row>
                                    Repo Stars &nbsp; &nbsp;&nbsp; &nbsp;
                                    <Form.Group
                                        as={Col}
                                        controlId="formGridEmail"
                                    >
                                        <Form.Control
                                            name="stars_filter"
                                            value={this.state.stars_filter}
                                            type="text"
                                            placeholder="gt10, lt10, bt10 20"
                                            onChange={this.handleChange}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Form.Row>
                                    Languages &nbsp; &nbsp;&nbsp; &nbsp;
                                    <Form.Group
                                        as={Col}
                                        controlId="formGridEmail"
                                    >
                                        <Form.Control
                                            name="languages"
                                            value={this.state.languages}
                                            type="text"
                                            placeholder="gt10, lt10, bt10 20"
                                            onChange={this.handleChange}
                                        />
                                    </Form.Group>
                                </Form.Row>
                                <Button variant="primary" type="submit" onClick={this.handleFilter}>
                                    Apply
                                </Button>
                            </Form>
                        </div>
                    </Col>
                    <Col xs={1}></Col>
                </Row>
            </div>
        );
    }
}
