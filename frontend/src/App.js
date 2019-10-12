import React from "react";
import "./css/App.css";
import Nav from "./components/Nav";
import MainScreen from "./components/MainScreen";
import Home from "./components/Home";
import SummaryReport from "./components/SummaryReport";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Nav />
        <Switch>
          <Route path="/home" exact component={Home} />
          <Route path="/mainscreen" component={MainScreen} />
          <Route path="/summaryReport" component={SummaryReport} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
