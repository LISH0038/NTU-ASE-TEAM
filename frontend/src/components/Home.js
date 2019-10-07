import React from "react";
import { Button, FormGroup, Form, Label, Input } from "reactstrap"
import { Link } from "react-router-dom";

function Home() {
  return (
    <Form>
      <h1 className="text-center pt-3 ">  Welcome Teaching Assistant  </h1>

      <FormGroup className="loginForm mt-5 mb-3">
        <h4 style={{ color: 'white' }}> Enter Course Index</h4>
        <Label className="mt-5 labelLogin" style={{ color: 'white', fontWeight: 'bold' }}> Course Index</Label>
        <Input type="index" placeholder="index" className="mt -3" />
        <Label className="mt-4" style={{ color: 'white', fontWeight: 'bold' }}> Tutorial/Lab Index</Label>
        <Input type="index#" placeholder="index#" />
      </FormGroup>

      <Link to="/mainscreen">
        <Button className="btn-lg btn-dark btn-block mt-5 btnLogin"> View Attendance</Button>
      </Link>
    </Form >
  );
}

export default Home;
