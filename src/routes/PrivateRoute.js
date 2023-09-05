import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
import { useSessionActions } from "../redux/actions/useSessionActions";
import getTokenData from "utilities/getTokenData";

function PrivateRoute() {
  const route = useLocation()
  const { setUserData } = useSessionActions();
  const token = getTokenData();
  const session = useSelector((state) => state.session.user_data);
  useEffect(() => {
    if (!session && token) {
      const decoded = jwt_decode(token);
      setUserData(decoded);
    }
  }, [session, token]);

  const conectedUser = getTokenData();
  if(!route.pathname.includes('encuestas') && jwt_decode(token).roles[0].id !== 1) return <Navigate to="/404" />;
  if(conectedUser) return <Outlet />
  return <Navigate to="/" />;
}

export default PrivateRoute;
