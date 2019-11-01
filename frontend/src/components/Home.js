import React from "react";
import { Button, FormGroup, Form, Label, Input } from "reactstrap"
import { withRouter, Redirect} from "react-router-dom";

class Home extends React.Component {

  state ={
    index:"10001",
    sessionId:null,
    details:null,
    redirect:false
  };

  onChangeIndex = (event)=> {
    this.setState({index: event.target.value});
  };

  onChangeSessionId = (event)=> {
    this.setState({sessionId: event.target.value});
  };

  submitAndRedirect = ()=>{
    const request = require('request');
    if (this.state.sessionId != null){
      request('http://localhost:3000/record/'+ this.state.sessionId, (error, response, body) =>{
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        this.setState({details:JSON.parse(body),redirect:true});
      });
    }
    else{
      request('http://localhost:3000/index/'+ this.state.index, (error, response, body) =>{
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        this.setState({details:JSON.parse(body),redirect:true});
      });
    }

    // let mockRes = {
    //   "index": 10001,
    //   "sessionId": 1,
    //   "schedule": {
    //       "startTime": 1570176000,
    //       "lateTime": 1570176600,
    //       "endTime": 1570177200
    //   },
    //   "absentList": [
    //       {
    //           "id": "U1620058E",
    //           "name": "Harry Cao"
    //       },
    //       {
    //           "id": "U1721642E",
    //           "name": "MN Shaanmugam"
    //       },

    //       {
    //           "id": "N1902163K",
    //           "name": "Simon El Nahas Christensen"
    //       }
    //     ],
    //   "onTimeList":[          {
    //     "id": "U1622186B",
    //     "name": "Li Shanlan"
    //       },          {
    //         "id": "U1620575J",
    //         "name": "Zeng Jinpo"
    //     }],
    //   "lateList":[          {
    //     "id": "U1721882B",
    //     "name": "Rajasekara Pandian Akshaya Muthu"
    // }]};

    //   let Mock2 = {
    //     "index":"xxx",
    //     "schedule":{"startTime":"152623456123",
    //                   "lateTime": "152623456999",
    //                   "endTime": "152623460000"},
    //     "onTimeList": [{"id": "xxxxxx",
    //       "name": "xxx",
    //         },
    //     {"id": "xxxxxx",
    //       "name": "xxx",
    //         },
    //     {"id": "xxxxxx",
    //       "name": "xxx",
    //         },
    //     {"id": "xxxxxx",
    //       "name": "xxx",
    //       }],
    //     "lateList":[],
    //     "absentList":[]
    //     };
    //  this.setState({details:mockRes,redirect:true});
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
          <h4 className="mt-2" style={{ color: 'white', fontSize: '25px', fontWeight: 'bold' }}>Choose one to start</h4>
          <Label className="mt-5 labelLogin" style={{ color: 'white', fontSize: '23px' }}> Enter Course Index:</Label>
          <Input type="index" placeholder="index" className="mt -3" style={{ fontSize: '23px' }} onChange={this.onChangeIndex}/>
          <Label className="mt-4" style={{ color: 'white', fontSize: '23px' }}> Or Enter Session ID:</Label>
          <Input type="sessionId" placeholder="Session ID" style={{ fontSize: '23px' }} onChange={this.onChangeSessionId} />
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
