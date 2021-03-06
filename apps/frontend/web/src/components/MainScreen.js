import Popup from 'reactjs-popup';
import React, {Component} from "react";
import { Input } from "reactstrap"
import Webcam from "react-webcam";
import Card from '@material-ui/core/Card';
import "../css/MainScreen.css";
import ItemList from "./listcomponents/ItemsList/ItemsList";
import Grid from '@material-ui/core/Grid';
import { CardContent } from "@material-ui/core";
import Table from "./SummaryReport";

const styles = {
  root: {
    flexGrow: 1,
  },
  container: {
    padding: "10px",
    "justify-content": "center",
    "max-height": "100vh",
  },
  list: {
    margin: "20px",
    width: "80%",
  },
  mainCamera: {
    margin: "20px",
  }
};

class MainScreen extends Component{

  constructor(){
    super();
    this.absentList = React.createRef();
    this.presentList = React.createRef();
    this.lateList = React.createRef();
    this.webcam = React.createRef();
    this.popupWebcam = React.createRef();
    this.inputElement = React.createRef();
    this.mockResCount =0;

    console.log(this.state);
    }

  state = {
    wait:false,
    success:false,
    open:false,
    reset:false,
    timer:10,
    timerId:null,
    idToRegister:null,
    index:0,
    sessionId: "1",
    currentTime: new Date(),
    summaryReport: false,
    unrecog: false,
    courseDetails: null,
    toggle:false,
  }

  componentDidMount() {
    this.getCourseInfo();
    this.timerID2 = setInterval(
      () => this.setState({currentTime: new Date()}),
      1000
    );
  }

  getCourseInfo() {
    let details = this.props.location.state.details;

    const request = require('request');
    if (details.sessionId != null){
      request('http://localhost:3000/record/'+ details.sessionId, (error, response, body) =>{
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        let courseDetails = JSON.parse(body);
        this.setState({courseDetails: courseDetails}, () =>{
          this.initList(courseDetails);
          if (courseDetails.sessionId != null)
          this.setState({sessionId:courseDetails.sessionId});
          if (courseDetails.index != null)
          this.setState({index:courseDetails.index});

        });

      });
    }
    else {
      request('http://localhost:3000/index/'+ details.index, (error, response, body) => {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        let courseDetails = JSON.parse(body);
        this.setState({courseDetails: courseDetails}, () =>{
          this.initList(courseDetails);
          if (courseDetails.sessionId != null)
          this.setState({sessionId:courseDetails.sessionId});
          if (courseDetails.index != null)
          this.setState({index:courseDetails.index});
        });
      });
    }
    // let courseDetails = {
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
    // this.setState({courseDetails: courseDetails});
    // this.initList(courseDetails);
    // let courseDetails = {
    //   "index": 10001,
    //   "sessionId": 1,
    //   "schedule": {
    //       "startTime": 1570176000,
    //       "lateTime": 1570176600,
    //       "endTime": 1570177200
    //   },
    //   "studentList": [
    //       {
    //           "id": "U1620058E",
    //           "name": "Harry Cao"
    //       },
    //       {
    //           "id": "U1620575J",
    //           "name": "Zeng Jinpo"
    //       },
    //       {
    //           "id": "U1721882B",
    //           "name": "Rajasekara Pandian Akshaya Muthu"
    //       },
    //       {
    //           "id": "U1721642E",
    //           "name": "MN Shaanmugam"
    //       },
    //       {
    //           "id": "U1622186B",
    //           "name": "Li Shanlan"
    //       },
    //       {
    //           "id": "N1902163K",
    //           "name": "Simon El Nahas Christensen"
    //       }
    //     ]};
    // if (courseDetails.sessionId != null)
    //   this.setState({sessionId:courseDetails.sessionId});
    // if (courseDetails.index != null)
    //   this.setState({index:courseDetails.index});
  }

  componentDidUpdate(){
    if (!this.state.summaryReport && this.state.toggle)
      this.getCourseInfo();
    if (this.state.toggle)
      this.setState({toggle:false});
  }

  initList = (courseDetails) =>{
    if (courseDetails.studentList !=null){
      console.log(courseDetails.studentList);
      let tmp={};
      courseDetails.studentList.forEach(s =>{
        tmp[s.id]=s.name;
      });
      console.log(tmp);
      this.absentList.current.setState({items:tmp});
    }
    else if (courseDetails.onTimeList !=null){

      if (courseDetails.onTimeList.length >0) {
        let tmp={};
        console.log(courseDetails.onTimeList);
        courseDetails.onTimeList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("onTimeList: "+ tmp);
        this.presentList.current.setState({items:tmp});
      }
      if (courseDetails.lateList.length >0) {
        let tmp={};
        console.log(courseDetails.lateList);
        courseDetails.lateList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("lateList: "+ tmp);
        this.lateList.current.setState({items:tmp});
      }
      if (courseDetails.absentList.length >0) {
        let tmp={};
        console.log(courseDetails.absentList);
        courseDetails.absentList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("absentList: "+ tmp);
        this.absentList.current.setState({items:tmp});
      }
    }
  }

  faceRecognition= async () => {
    if (!!this.webcam.current) {
        let img = this.webcam.current.getScreenshot();
        const axios = require('axios');
        axios({
          method:'post',
          url:     'http://localhost:3000/recognition',
          data:    {sessionId:"1", imageName:img}
        }).then((response)=> {
          console.log("response: ");
          console.log(response);
          let recogList = response.data.recognizedStudentIds;
          console.log("recogList: ");
          console.log(recogList);
          if (recogList){
            console.log(this.presentList.current.state.items);
            recogList.forEach(s=>{
              if (s.status ==="on-time" && !Object.keys(this.presentList.current.state.items).includes(s)){
                //this.state.presentList.push(s);
                this.presentList.current.addItemHandler(s.id,s.name);
                this.absentList.current.onDeleteHandler(s.id);
              }
              else if (s.status ==="late" && !Object.keys(this.lateList.current.state.items).includes(s)){
                this.lateList.current.addItemHandler(s.id, s.name);
                this.absentList.current.onDeleteHandler(s.id);
              }
            });
            this.setState({wait:false,success:true, unrecog: false});
          }
          else{
            this.setState({wait:false,success:false, unrecog: true});
          }

        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  takeAttendance = ()=> {
      this.setState({reset:true});
      this.setState({wait:true,success:false, unrecog: false});
      this.faceRecognition();
  }

  renderWait() {
    if(this.state.wait){
      return <h3>Please Wait...</h3>
    }
  }

  renderSuccess() {
    if(this.state.success){
      return <h3>Successfully checked in!</h3>
    }
  }

  renderUnrecog() {
    if(this.state.unrecog){
      return <h3>Unrecognised Student!</h3>
    }
  }

  openModal=() =>{
    clearInterval(this.state.timerId);
    this.setState({ open: true});
    this.setState({timer:4});
  }
  closeModal=() =>{
    clearInterval(this.state.timerId);
    this.setState({ open: false});
  }

  showSummaryReport = () =>{
    this.setState({summaryReport: true});
  }

  closeSummaryReport = () =>{
    this.setState({summaryReport: false, toggle:true});
  }

  onInputId = (event)=> {
    this.setState({idToRegister: event.target.value});
  };

  callRegisterAPI = () =>{
    if (!!this.popupWebcam.current) {
      let data = {sessionId:"1", studentId:this.state.idToRegister, images: this.popupWebcam.current.getScreenshot()}
      console.log(data);

      require('axios')({
        method:'post',
        url:     'http://localhost:3000/register',
        data:   data
      }).then((response)=> {
        console.log(response);
        let body = response.data;

        if (body.status === "late"){
          this.lateList.current.addItemHandler(body.id,body.name);
          this.absentList.current.onDeleteHandler(body.id);
        }
        else {
          this.presentList.current.addItemHandler(body.id, body.name);
          this.absentList.current.onDeleteHandler(body.id);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  startRegister = () =>{
    this.callRegisterAPI();
    let id = setInterval(()=>
    {
      console.log(this.state.timer);
      if (this.state.timer===1){
        this.setState({timer:"You may close this window now."});
      }
      else{
        this.setState({timer:this.state.timer-1});
      }
    },1000);
    this.setState({timerId:id});

    setTimeout(() => {
      clearInterval(id);
      //console.log(images);
    }, 5000);

  }

  render(){

    if (!this.state.summaryReport){
    return (
      <div>
        <Grid container style={styles.root} spacing= {3}>
          <Grid style={styles.container} item xs={3}>
            <Card style={styles.list}>
              <CardContent>
                <h5>Absent List</h5>
                <ItemList ref={this.absentList} color="orangered"/>
              </CardContent>
              </Card>
          </Grid>
          <Grid item xs={6}>

            <Card style={styles.mainCamera}>
              <CardContent>
              <h3>---- Current Time: {this.state.currentTime.toLocaleTimeString()}  ----  Session ID: {this.state.sessionId}  ----</h3>
                {/* <h1>Main Camera</h1> */}
                <Webcam
                  ref={this.webcam}
                  audio={false}
                  flex={1}
                  width={900}
                  height={700}
                  screenshotFormat="image/jpeg" />
              </CardContent>
            </Card>
            <button className=" btn-lg  btn-block " onClick={this.takeAttendance} style={{
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 0"
              }}>Check in</button>
            {this.renderWait()}
            {this.renderSuccess()}
            {this.renderUnrecog()}
          </Grid>
          <Grid style={styles.container} item xs={3}>
            <Card style={styles.list}>
              <CardContent>
                <h5>Present List</h5>
                <ItemList ref={this.presentList} color="darkgreen"/>
              </CardContent>
            </Card>
            <Card style={styles.list}>
              <CardContent>
                <h5>Late List</h5>
                <ItemList ref={this.lateList} color="orange"/>
              </CardContent>
            </Card>

            {/* <div className="App"> */}
            <button onClick={this.openModal} className=" btn-lg  btn-block " style={{
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white"
              }} >Unrecognised?</button>
              <Popup
                  open={this.state.open}
                  closeOnDocumentClick
                  onClose={this.closeModal}>
                <br></br>
                <div>
                  <h3>{this.state.timer>3 ? "Please input your matric number then click start button.":this.state.timer>0 ? "Taking photo now... "+this.state.timer : "You may close the window now"}</h3>
                  <Webcam
                    ref={this.popupWebcam}
                    audio = {false}
                    flex={1}
                    width={300}
                    height={200}
                    screenshotFormat={"image/jpeg"} />
                  <Input placeholder="Matric No." style={{ fontSize: '23px' }} onChange={this.onInputId}/>
                  <button onClick={this.startRegister} className=" btn-lg  btn-block " style={{
                    background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white"
                  }} >Start Recording Face</button>
                </div>
              </Popup>
            {/* </div> */}

            <button onClick={this.showSummaryReport} className=" btn-lg  btn-block " style={{
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 0"
              }} >View Summary Report</button>
          </Grid>
        </Grid>
      </div>
    );}
    else
    return (
      <div style={{textAlign:"center",display: "inline-block"}}>
        <Table
        style={{display:"inline-block"}}
        backFunction={this.closeSummaryReport}
        index={this.state.index}
        sessionId={this.state.sessionId}
        ></Table>
      </div>

    );
  }
}

export default MainScreen;

