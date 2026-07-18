import React from "react";
import ReactDOM from "react-dom/client";
import { QiLifeShell } from "./features/qilife/components/QiLifeShell";
import { AuthProvider } from "./features/qilife/auth/AuthProvider";
import "./features/qilife/styles/qilife.css";
import "./features/qilife/styles/cadence.css";
import "./features/qilife/styles/assistant.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <QiLifeShell />
    </AuthProvider>
  </React.StrictMode>
);
