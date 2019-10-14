import React, { useState } from "react";
import { Link } from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import React from "react";
import { Link } from "react-router-dom";

//navigation bar 

function Nav() {

  const [time, setTime] = useState(new Date());

  const navStyle1 = {
    color: "white",
    fontSize: "35px",
    textAlign: "start",
    textDecoration: "none",
    marginTop: "15px",

  };

  const navStyle = {
    color: "white",
    fontSize: "25px",
    textAlign: "center",
    textDecoration: "none",
    marginTop: "10px",
    position: "absolute",
    marginTop: "25px",
  };

  return (
    <nav >
       <Grid container spacing= {3}>
         <Grid item xs={3}>
          <Link style={navStyle1} to="/home">
            NTU E-tendance System
          </Link>
         </Grid>
          <Grid item xs={5}>

          </Grid>
          <Grid item xs={1}>
            <Link style={navStyle} to="/home">
              Home
            </Link>
          </Grid>
        <Grid item xs={2}>
        <Link style={navStyle} to="summaryReport">
          Summary Report
        </Link>
        </Grid>
      </Grid>
    </nav >
  );
}

export default Nav;
