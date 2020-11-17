import React from "react";
import { Route, Redirect } from "react-router-dom";

import { useAuthState } from "../context/auth";

const DynamicRoute = ({ authenticated, guest, component, children }) => {
  const { user } = useAuthState();

  if (authenticated && !user) {
    return <Redirect to="/login" />;
  } else if (guest && user) {
    return <Redirect to="/" />;
  } else {
    return <Route component={component} {...children} />;
  }
};

export default DynamicRoute;
