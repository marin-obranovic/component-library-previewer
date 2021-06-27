import React from "react";
import { Layout } from "./components/Layout.jsx";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { LivePreview } from "./components/LivePreview";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Layout />
          </Route>
          <Route path="/live-preview">
            <LivePreview separateMode={true} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export { App };
