import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createAppRoutes } from "./app/createAppRoutes";
import { AuthProvider } from "./features/qilife/auth/AuthProvider";
import { AuthenticationBoundary } from "./features/qilife/auth/AuthenticationBoundary";
import "./features/qilife/styles/qilife.css";
import "./features/qilife/styles/cadence.css";
import "./features/qilife/styles/assistant.css";

const router = createBrowserRouter(createAppRoutes());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthenticationBoundary>
        <RouterProvider router={router} />
      </AuthenticationBoundary>
    </AuthProvider>
  </React.StrictMode>
);
