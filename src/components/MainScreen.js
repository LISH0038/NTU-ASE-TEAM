import React from "react";
import Webcam from "react-webcam";
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import "../css/MainScreen.css";
import { textAlign } from "@material-ui/system";

function MainScreen() {
  const expectedStudents = ["expectedStudent1", "expectedStudent2", "expectedStudent3"] // references to components
  const recognizedStudents = ["recognizedStudent1", "recognizedStudent2", "recognizedStudent3"]
  return (
    <div>    
      <div id="leftbox" >
      <h1>Unsigned List</h1>
      <List> 
        {expectedStudents.map((comp) =>  
          <ListItem>
            <ListItemText primary = {comp}/>
          </ListItem>
          )
        }
        </List>
      </div>

      <div id="middlebox" style={{textAlign:"center"}}>
      <h1>Main Screen</h1>
        <Webcam
          audio={false}
          flex ={1}
          screenshotFormat="image/jpeg" />
      </div>

      <div id="rightbox" >  
      <h1>Signed List</h1>    
      <List> 
        {recognizedStudents.map((comp) =>  
          <ListItem>
            <ListItemText primary = {comp}/>
          </ListItem>
          )
        }
        </List>
      </div>
    </div>
  );
}

export default MainScreen;
