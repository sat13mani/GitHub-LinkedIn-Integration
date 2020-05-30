import React, { Fragment, Component } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";

export default class LinkedIn extends Component {
  render() {
    let skills = <ListGroup>
            <ListGroup.Item variant="light"> No Skills added </ListGroup.Item>
          </ListGroup>;
    if (this.props.skills.length) {
      skills = (
        <Card variant="light">
          <ListGroup variant="flush">
            <ListGroup.Item variant="light"> Skills </ListGroup.Item>
          </ListGroup>
          <ListGroup
            style={{
              height: "210px",
              overflowY: "scroll",
            }}
            variant="flush"
          >
            {this.props.skills}
          </ListGroup>
        </Card>
      );
    }
    return (
      <Fragment>
        <Card

          style={{
            padding: "0.5rem",
            justifyContent: "center",
            boxShadow: 2
          }}
          bg="light"
        >
          <Card.Body>
            <Card.Title>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div>
                  {this.props.linkedin_data.firstName}{" "}
                  {this.props.linkedin_data.lastName}
                </div>
              </div>
            </Card.Title>
            <hr className="my-2" />
            <Card.Text>{this.props.linkedin_data.headline}</Card.Text>
            <Card.Text>{this.props.linkedin_data.summary}</Card.Text>
          </Card.Body>
        </Card>

        <div className="container-fluid" style={{ marginTop: "20px" }} />
        {skills}
      </Fragment>
    );
  }
}
