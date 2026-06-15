import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/auth/AuthPage";
import DashboardPage from "../pages/DashboardPage";

const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("@CInDatabase:token");
  return !!token;
};

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.JSX.Element }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
