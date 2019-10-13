import React, {Component} from "react";
import Webcam from "react-webcam";
import PopUp from "./Popup";
import Card from '@material-ui/core/Card';
import "../css/MainScreen.css";
import ItemList from "./listcomponents/ItemsList/ItemsList";
import Grid from '@material-ui/core/Grid';
import { CardContent } from "@material-ui/core";
import {getFullFaceDescription} from '../api/face';

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
    "background-color": "lightyellow",
  },
  mainCamera: {
    margin: "20px",
    "background-color": "lightyellow",
  }
};

//TODO:
//1. duplicate list items
//2. stop sending request once time limit reached
//3. initialize absent list
//4. send report
class MainScreen extends Component{
  //API call reference
  // const request = require('request');
  // request('http://localhost:3000/index/10001', function (error, response, body) {
  //   console.error('error:', error); // Print the error if one occurred
  //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //   console.log('body:', body); // Print the HTML for the Google homepage.
  // });
  
  // const expectedStudents = ["expectedStudent1", "expectedStudent2", "expectedStudent3"] // references to components
  // const recognizedStudents = ["recognizedStudent1", "recognizedStudent2", "recognizedStudent3"]
  constructor(){
    super();
    this.absentList = React.createRef();
    this.presentList = React.createRef();
    this.lateList = React.createRef();
    this.webcam = React.createRef();
  }
  
  state = {
    absentList :[],
    presentList : [],
    lateList : []
  }

  componentDidMount() {
    // let courseDetails = this.props.location.state.details;
    // console.log(courseDetails.studentList);
    // courseDetails.studentList.forEach(s =>{
    //   this.absentList.current.addItemHandler(s.id,s.name);
    // });
    this.timerID = setInterval(
      () => this.faceRecognition(),
      5000
    );
  }

  faceRecognition= async () => {
    if (!!this.webcam.current) {
        let img = this.webcam.current.getScreenshot();
        const request = require('request');
        request.post({
          headers: {'content-type' : 'application/json'},
          url:     'http://localhost:3000/recognition',
          body:    {rawImage:img}
        },function (error, response, body) {
          console.error('error:', error); // Print the error if one occurred
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.
        });
    }
    var timeStamp = new Date().getTime();
    let mockRes = [{"id": "xxxxxx","name": timeStamp%10, "status":"on-time"}];
    mockRes.forEach(s=>{
      // if (!this.state.presentList.includes(s)){

      // }
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
          </Grid>
        </Grid>     
      </div>
    );
  }  
}

export default MainScreen;

