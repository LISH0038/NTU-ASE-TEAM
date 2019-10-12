import React, { useState } from "react";
import Webcam from "react-webcam";
import Popup from 'reactjs-popup';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import "../css/MainScreen.css";



function MainScreen() {
  const expectedStudents = ["expectedStudent1", "expectedStudent2", "expectedStudent3"] // references to components
  const recognizedStudents = ["recognizedStudent1", "recognizedStudent2", "recognizedStudent3"]


  return (
    <div>
      <div id="leftbox" >
        <h1 >Absent List</h1>
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
        <h1>Webcam</h1>
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
              <ListItem style={{ color: 'black' }}>
                <ListItemText primary={index + 1 + '. ' + comp} />
              </ListItem>
            )
            }
          </List>
        </div>


        <div className="App">

          <Popup modal trigger={<button>Click Me</button>}>
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










      </div>
    </div >
  );
}

export default MainScreen;

