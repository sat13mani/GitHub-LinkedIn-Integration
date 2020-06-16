import React, {  Component } from "react";
import {  Row, Col, Card,  ListGroup } from "react-bootstrap";


export default class RepoList extends Component {
  custom_sort = (a, b) => {
    return a.stars - b.stars;
  };

  render() {
    var repo_list = this.props.repo_data;
    repo_list = repo_list.sort(this.custom_sort).reverse();
    var repo_div = repo_list.map((item, idx) => {
      if (!item.description) {
        item.description = "None";
      }
      return (
        <ListGroup.Item>
            <Row>
              <Col xs={8}><strong> {item.name} </strong> </Col>
              <Col> Forks - {item.forks_count}</Col>
              <Col>stars - {item.stars}</Col>
            </Row>
            <Row>
              <Col xs={8}>{item.description}</Col>
              <Col>{item.language}</Col>
            </Row>
        </ListGroup.Item>
      );
    });
    return (
        <Card variant="light"> 
        <ListGroup variant="flush">
            <ListGroup.Item variant="light"> Top 3 Repos </ListGroup.Item>
          </ListGroup>
        <ListGroup variant="flush" > {repo_div.slice(0, 3)} </ListGroup>
        </Card>);
  }
}
