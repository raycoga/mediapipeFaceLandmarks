import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../views/Auth/Login/Login";
import ChangePassword from "../views/Auth/ChangePassword/ChangePassword";
import ForgotPwd from "../views/Auth/ForgotPwd/ForgotPwd";
import CheckEmail from "../views/Auth/CheckEmail/CheckEmail";

const Router = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/change-password/:token" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPwd />} />
      <Route path="/email-send" element={<CheckEmail />} />
    </Routes>
  );
});

export default Router;
