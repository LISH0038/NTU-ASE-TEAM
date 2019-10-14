import Popup from 'reactjs-popup';
import React, {Component} from "react";
import Webcam from "react-webcam";
import Card from '@material-ui/core/Card';
import "../css/MainScreen.css";
import ItemList from "./listcomponents/ItemsList/ItemsList";
import Grid from '@material-ui/core/Grid';
import { CardContent } from "@material-ui/core";

const styles = {
  root: {
    flexGrow: 1,
  },
  container: {
    padding: "10px",
    "justify-content": "center",
    display: "inline-flex",
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
  }

  componentDidMount() {
    let courseDetails = this.props.location.state.details;
    console.log(courseDetails.studentList);
    let tmp={};
    courseDetails.studentList.forEach(s =>{
      tmp[s.student_id]=s.name;
    });
    console.log(tmp);
    this.absentList.current.setState({items:tmp});
    this.timerID = setInterval(
      () => this.faceRecognition(),
      5000
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

  render(){
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
                <h1>Main Camera</h1>
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
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white"
              }}>Check in</button>
            {this.renderWait()}
            {this.renderSuccess()}
          </Grid>
          <Grid item xs={3}>
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
            <div className="App">
              <Popup modal trigger={<button className=" btn-lg  btn-block " style={{
                background: 'rgb(22, 77, 124)', fontSize: '23px', color: "white"
              }}>Unrecognised?</button>}>
                <br></br>
                <div>
                  <h3>Plesae rotate your head</h3>
                  <Webcam>
                    flex={1}
                    audio = {false}
                    width={300}
                    height={200}
                    screenshotFormat={"image/jpeg"}
                  </Webcam>
                </div>
              </Popup>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default MainScreen;

