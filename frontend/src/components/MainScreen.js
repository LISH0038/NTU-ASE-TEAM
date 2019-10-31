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
    //display: "inline-flex",
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

//TODO:
//2. stop sending request once time limit reached
//4. send report
class MainScreen extends Component{

  constructor(){
    super();
    this.absentList = React.createRef();
    this.presentList = React.createRef();
    this.lateList = React.createRef();
    this.webcam = React.createRef();
    this.popupWebcam = React.createRef();
    this.inputElement = React.createRef();
    this.mockRes = [
      {
          "id": "U1721882B",
          "name": "Rajasekara Pandian Akshaya Muthu"
      },
      {
        "id": "N1902163K",
        "name": "Simon El Nahas Christensen"
      },
      {
          "id": "U1721642E",
          "name": "MN Shaanmugam"
      },
      {
        "id": "U1620058E",
        "name": "Harry Cao"
      },
      {
          "id": "U1620575J",
          "name": "Zeng Jinpo"
      },
      {
          "id": "U1622186B",
          "name": "Li Shanlan"
      },
    ];
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
  }

  componentDidMount() {
    let courseDetails = this.props.location.state.details;
    if (courseDetails.sessionId != null)
      this.setState({sessionId:courseDetails.sessionId});
    if (courseDetails.index != null)
      this.setState({index:courseDetails.index});
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
      let tmp={};
      if (courseDetails.onTimeList.length >0) {
        console.log(courseDetails.onTimeList);
        courseDetails.onTimeList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("onTimeList: "+ tmp);
        this.presentList.current.setState({items:tmp});
      }
      if (courseDetails.lateList.length >0) {
        console.log(courseDetails.lateList);
        courseDetails.lateList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("onTimeList: "+ tmp);
        this.lateList.current.setState({items:tmp});
      }
      if (courseDetails.absentList.length >0) {
        console.log(courseDetails.absentList);
        courseDetails.absentList.forEach(s =>{
          tmp[s.id]=s.name;
        });
        console.log("onTimeList: "+ tmp);
        this.absentList.current.setState({items:tmp});
      }
    }
    
    // this.timerID = setInterval(
    //   () => this.faceRecognition(),
    //   5000
    // );

    this.timerID2 = setInterval(
      () => this.setState({currentTime: new Date()}),
      1000
    );

  }

  faceRecognition= async () => {
    if (!!this.webcam.current) {
        let img = this.webcam.current.getScreenshot();
        const axios = require('axios');
        axios({
          method:'post',
          url:     'http://10.27.80.18:3000/recognition',
          data:    {sessionId:"1", imageName:img}
        }).then(function (response) {
          console.log(response);
          JSON.parse(response).recognizedStudentIds.forEach(s=>{
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
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }

  mockResponse = ()=> {
    this.setState({reset:true});
    this.setState({wait:true,success:false});
    setTimeout(() => {
      let s = this.mockRes.pop();
    if (this.mockRes.length >3){
      //this.state.presentList.push(s);
      this.presentList.current.addItemHandler(s.id,s.name);
      this.absentList.current.onDeleteHandler(s.id);
    }
    else {
      this.lateList.current.addItemHandler(s.id, s.name);
      this.absentList.current.onDeleteHandler(s.id);
    }
    this.setState({wait:false,success:true});
    },3000);
    
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
  openModal=() =>{
    clearInterval(this.state.timerId);
    this.setState({ open: true});
    this.setState({timer:11});
    // setInterval(this.setState({reset:true}),2000);
  }
  closeModal=() =>{
    clearInterval(this.state.timerId);
    this.setState({ open: false});
  }

  showSummaryReport = () =>{
    this.setState({summaryReport: true});
  }

  closeSummaryReport = () =>{
    this.setState({summaryReport: false});
  }

  onInputId = (event)=> {
    this.setState({idToRegister: event.target.value});
  };

  callRegisterAPI = (images ) =>{
    let data = {sessionId:"1", studentId:this.state.idToRegister, images: images}
    console.log(data);

    require('axios')({
      method:'post',
      url:     'http://10.27.80.18:3000/register',
      data:   data 
    }).then(function (response) {
      console.log('statusCode:', response && response.statusCode);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  startRegister = () =>{
    let images = []
    let id = setInterval(()=>
    {
      if (!!this.popupWebcam.current) {
        images.push(this.popupWebcam.current.getScreenshot());
      }

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
      this.callRegisterAPI(images);
    }, 1000);
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
                <ItemList ref={this.absentList} initList={this.props.location.state.details.studentList} color="orangered"/>
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
            <button className=" btn-lg  btn-block " onClick={this.mockResponse} style={{
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white", margin: "10px 0"
              }}>Check in</button>
            {this.renderWait()}
            {this.renderSuccess()}
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
                  <h3>{this.state.timer>10 ? "Please input your matric number then click start button.":this.state.timer>1 ? "Please keep rotating your head. "+this.state.timer : "You may close the window now"}</h3>
                  <Webcam ref={this.popupWebcam}>
                    
                    flex={1}
                    audio = {false}
                    width={300}
                    height={200}
                    screenshotFormat={"image/jpeg"}
                  </Webcam>
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

