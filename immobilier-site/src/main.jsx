import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ApartmentsProvider from "./context/ApartmentsContext";

import ProjectsProvider from "./context/ProjectsContext";
import BuildingsProvider from "./context/BuildingsContext";
import TenantsProvider from "./context/TenantsContext";
import PaymentsProvider from "./context/PaymentsContext";
import ContractsProvider from "./context/ContractsContext";
import RentsProvider from "./context/RentsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProjectsProvider>
      <BuildingsProvider>
        <ApartmentsProvider>
          <TenantsProvider>
            <PaymentsProvider>
              <ContractsProvider>
                <RentsProvider>
                  <App />
                </RentsProvider>
              </ContractsProvider>
            </PaymentsProvider>
          </TenantsProvider>
        </ApartmentsProvider>
      </BuildingsProvider>
    </ProjectsProvider>
  </React.StrictMode>
);