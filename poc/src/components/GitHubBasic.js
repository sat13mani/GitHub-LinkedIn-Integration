import React, { Fragment, Component } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import RepoList from "./RepoList";

export default class GitHubBasic extends Component {
  render() {
    var language_list = this.props.git_data.languages;
    language_list = this.props.git_data.languages.map((item, idx) => {
      return (
        <ListGroup.Item key={idx} variant="flush">
          {" "}
          {item}{" "}
        </ListGroup.Item>
      );
    });

    let git_div = (
      <Fragment>
        <Row>
          <Col className="mr-auto">
              <ListGroup>
              <ListGroup.Item variant="light"> Overview </ListGroup.Item>
              <ListGroup.Item variant="flush">
                Name - {this.props.git_data.id}
              </ListGroup.Item>
              <ListGroup.Item variant="flush">
                Pulic Repos - {this.props.git_data.public_repos}
              </ListGroup.Item>
              <ListGroup.Item variant="flush">
                Followers - {this.props.git_data.followers}
              </ListGroup.Item>
              <ListGroup.Item variant="flush">
                Repo Stars - {this.props.git_data.stars}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col>
            <ListGroup> 
            <ListGroup.Item variant="light">Top 4 languages </ListGroup.Item>
            {language_list.slice(0,4)} 
            </ListGroup>
          </Col>
        </Row>
      </Fragment>
    );
    return git_div;
  }
}
