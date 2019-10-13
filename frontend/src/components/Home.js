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
    const request = require('request');
    request('http://localhost:3000/index/'+ this.state.index, (error, response, body) =>{
      console.error('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      this.setState({details:body,redirect:true});
    });
    // let mockRes = {
    //   "index":"10001",
    //  "sessionId":"1",
    //   "schedule":{"startTime":"152623456123",
    //                  "lateTime": "152623456999", 
    //                  "endTime": "152623460000"},
    //   "studentList": [{"id": "1",
    //      "name": "student1",
    //       },
    //   {"id": "x1x",
    //      "name": "student2",
    //       },
    //   {"id": "xxx",
    //      "name": "student3",
    //       },
    //   {"id": "2xxx",
    //     "name": "student4",
    //      }]
    //  };
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
          <Input type="index" placeholder="index#" style={{ fontSize: '23px' }} value={this.state.index} onChange={this.onChangeIndex}/>
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
