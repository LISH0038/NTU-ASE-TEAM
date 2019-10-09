import React, {Component} from "react";
import Webcam from "react-webcam";
import popUp from "./Popup";
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
    "background-color": "lightyellow",
  },
  mainCamera: {
    margin: "20px",
    "background-color": "lightyellow",
  }
};

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
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.faceRecognition(),
      5000
    );
  }

  faceRecognition(){
    var timeStamp = new Date().getTime();
    let mockRes = [{"id": "xxxxxx","name": timeStamp%10, "status":"on-time"}];
    mockRes.forEach(s=>{
      if (s.status ==="on-time"){
        this.presentList.current.addItemHandler(s.name);
        this.absentList.current.onDeleteHandler(s.name);
      }
      else if (s.status ==="late"){
        this.lateList.current.addItemHandler(s.name);
        this.absentList.current.onDeleteHandler(s.name);
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
                <ItemList ref={this.absentList} color="orangered"/>
              </CardContent>
              </Card>
          </Grid>
          <Grid item xs={6}>
            <Card style={styles.mainCamera}>
              <CardContent>
                <h1>Main Camera</h1>
                <Webcam
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

