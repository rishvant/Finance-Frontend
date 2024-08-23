import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";
import "../public/css/tailwind.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MaterialTailwindControllerProvider>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        </MaterialTailwindControllerProvider>
      </ThemeProvider>
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>
);
