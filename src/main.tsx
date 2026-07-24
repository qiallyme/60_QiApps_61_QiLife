import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createAppRoutes } from "./app/createAppRoutes";
import { AuthProvider } from "./features/qilife/auth/AuthProvider";
import "./features/qilife/styles/qilife.css";
import "./features/qilife/styles/cadence.css";
import "./features/qilife/styles/assistant.css";

const router = createBrowserRouter(createAppRoutes());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
