import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TiendaCartProvider } from "./context/TiendaCartContext";
import "./styles/global.css";
import "./styles/layout.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TiendaCartProvider>
        <App />
      </TiendaCartProvider>
    </BrowserRouter>
  </StrictMode>,
);
