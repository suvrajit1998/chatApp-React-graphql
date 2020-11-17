import React from "react";
import "./App.scss";

import { Container } from "react-bootstrap";

import { BrowserRouter, Route, Switch } from "react-router-dom";

import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Apolloprovider from "./apolloProvider";

import { AuthProvider } from "./context/auth";
import { MessageProvider } from "./context/message";
import DynamicRoute from "./util/dynamicRoute";

function App() {
  return (
    <Apolloprovider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Container className="pt-5">
              <Switch>
                <DynamicRoute exact path="/" component={Home} authenticated />
                <DynamicRoute path="/register" component={Register} guest />
                <DynamicRoute path="/login" component={Login} guest />
              </Switch>
            </Container>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </Apolloprovider>
  );
}

export default App;
