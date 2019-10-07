import React from "react";
import { Link } from "react-router-dom";

//navigation bar 

function Nav() {

  const navStyle1 = {
    color: "white",
    fontSize: "35px",
    textAlign: "start",
    textDecoration: "none",

  };

  const navStyle = {
    color: "white",
    fontSize: "25px",
    textAlign: "center",
    textDecoration: "none",
  };

  return (
    <nav>
      <u1 className="Nav-Links">
        <Link style={navStyle1} to="/home">
          <li>NTU E-tendance System</li>
        </Link>
        <Link style={navStyle} to="/mainscreen">
          <li>Main Screen </li>
        </Link>
        <Link style={navStyle} to="summaryReport">
          <li>Summary Report</li>
        </Link>
      </u1>
    </nav>
  );
}

export default Nav;
