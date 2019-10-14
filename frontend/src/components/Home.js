import React from "react";
import { Button, FormGroup, Form, Label, Input } from "reactstrap"
import { withRouter, Redirect} from "react-router-dom";

class Home extends React.Component {

  state ={
    index:"10001",
    details:null,
    redirect:false
  };

  onChangeIndex = (event)=> {
    this.setState({index: event.target.value});
  };

  submitAndRedirect = ()=>{
    // const request = require('request');
    // request('http://10.27.80.18:3000/index/'+ this.state.index, (error, response, body) =>{
    //   console.error('error:', error); // Print the error if one occurred
    //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //   console.log('body:', body); // Print the HTML for the Google homepage.
    //   this.setState({details:JSON.parse(body),redirect:true});
    // });
    let mockRes = {
      "index": 10001,
      "sessionId": 1,
      "schedule": {
          "startTime": 1570176000,
          "lateTime": 1570176600,
          "endTime": 1570177200
      },
      "studentList": [
          {
              "id": "U1620058E",
              "name": "Harry Cao"
          },
          {
              "id": "U1620575J",
              "name": "Zeng Jinpo"
          },
          {
              "id": "U1721882B",
              "name": "Rajasekara Pandian Akshaya Muthu"
          },
          {
              "id": "U1721642E",
              "name": "MN Shaanmugam"
          },
          {
              "id": "U1622186B",
              "name": "Li Shanlan"
          },
          {
              "id": "N1902163K",
              "name": "Simon El Nahas Christensen"
          }
        ]};
     this.setState({details:mockRes,redirect:true});
  };

  renderMainscreen = (details)=> {
    if (this.state.redirect){
      return <Redirect to={{
        pathname:"/mainscreen",
        state:{details: this.state.details},
      }}></Redirect>;
    }
  };

  render(){
    return (
      <div>
      {this.renderMainscreen()}
      <Form>
        <h1 className="text-center pt-3 " style={{ color: 'black' }}>  Welcome Teaching Assistant  </h1>

        <FormGroup className="loginForm mt-5 mb-3">
          <h4 className="mt-2" style={{ color: 'white', fontSize: '25px', fontWeight: 'bold' }}> Enter Course Index</h4>
          <Label className="mt-5 labelLogin" style={{ color: 'white', fontSize: '23px' }}> Course Index</Label>
          <Input type="index" placeholder="index" className="mt -3" style={{ fontSize: '23px' }} />
          <Label className="mt-4" style={{ color: 'white', fontSize: '23px' }}> Tutorial/Lab Index</Label>
          <Input type="index" placeholder="index#" style={{ fontSize: '23px' }} onChange={this.onChangeIndex}/>
        </FormGroup>
        <Button className=" btn-lg  btn-block " onClick={this.submitAndRedirect} style={{
            background: 'rgb(22, 77, 124)',
            width: '407px',
            position: 'absolute', left: '50%', top: '70%',
            transform: 'translate(-50%, -50%)',
            fontSize: '23px'
          }}> View Attendance</Button>
      </Form >
      </div>
    );
  }
}

export default withRouter(Home);
