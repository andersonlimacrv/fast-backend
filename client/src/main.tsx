import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

// Dev-only WCAG console audit (never bundled to production).
if (import.meta.env.DEV) {
  void import("@axe-core/react").then(({ default: axe }) => {
    void import("react-dom").then((ReactDOM) => {
      axe(React, ReactDOM, 1000);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
