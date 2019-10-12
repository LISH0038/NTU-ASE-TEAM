import React from "react";
import { Button, FormGroup, Form, Label, Input } from "reactstrap"
import { Link } from "react-router-dom";

function Home() {
  return (
    <Form>
      <h1 className="text-center pt-3 " style={{ color: 'black' }}>  Welcome Teaching Assistant  </h1>

      <FormGroup className="loginForm mt-5 mb-3">
        <h4 className="mt-2" style={{ color: 'white', fontSize: '25px', fontWeight: 'bold' }}> Enter Course Index</h4>
        <Label className="mt-5 labelLogin" style={{ color: 'white', fontSize: '23px' }}> Course Index</Label>
        <Input type="index" placeholder="index" className="mt -3" style={{ fontSize: '23px' }} />
        <Label className="mt-4" style={{ color: 'white', fontSize: '23px' }}> Tutorial/Lab Index</Label>
        <Input type="index" placeholder="index#" style={{ fontSize: '23px' }} />
      </FormGroup>

      <Link to="/mainscreen">
        <Button className=" btn-lg  btn-block " style={{
          background: 'rgb(22, 77, 124)',
          width: '407px',
          position: 'absolute', left: '50%', top: '70%',
          transform: 'translate(-50%, -50%)',
          fontSize: '23px'
        }}> View Attendance</Button>
      </Link>
    </Form >
  );
}

export default Home;
