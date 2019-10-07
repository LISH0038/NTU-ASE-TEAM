import React from "react";
import Webcam from "react-webcam";
import popUp from "./Popup";
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import "../css/MainScreen.css";


function MainScreen() {
  //API call reference
  const request = require('request');
  request('http://localhost:3000/index/10001', function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });
  
  const expectedStudents = ["expectedStudent1", "expectedStudent2", "expectedStudent3"] // references to components
  const recognizedStudents = ["recognizedStudent1", "recognizedStudent2", "recognizedStudent3"]



  return (
    <div>
      <div id="leftbox" >
        <h1>Absent List</h1>
        <List>
          {expectedStudents.map((comp, index) =>
            <ListItem>
              <ListItemText primary={index + 1 + '. ' + comp} />
            </ListItem>
          )
          }
        </List>
      </div>

      <div id="middlebox" style={{ textAlign: "center" }}>
        <h1>Main Camera</h1>
        <br></br>
        <Webcam
          audio={false}
          flex={1}
          width={900}
          height={700}
          screenshotFormat="image/jpeg" />
      </div>

      <div id="rightbox">
        <div id="signedlist" >
          <h1>Present List</h1>
          <List>
            {recognizedStudents.map((comp, index) =>
              <ListItem>
                <ListItemText primary={index + 1 + '. ' + comp} />
              </ListItem>
            )
            }
          </List>
        </div>

        <br></br>
        <div id="latelist" >
          <h1>Late List</h1>
          <List>
            {recognizedStudents.map((comp, index) =>
              <ListItem>
                <ListItemText primary={index + 1 + '. ' + comp} />
              </ListItem>
            )
            }
          </List>
        </div>

        <div>
          <button onClick={popUp.bind} > Unrecognised / Register</button>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;

