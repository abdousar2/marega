import { BrowserRouter, Routes, Route } from "react-router-dom";


// PUBLIC
import PublicHome from "./admin/pages/PublicHome";
import Solution from "./admin/pages/Solution";
import Features from "./admin/pages/Features";
import Reference from "./admin/pages/Reference";
import Contact from "./admin/pages/Contact";


// ADMIN
import Dashboard from "./admin/Dashboard";
import Buildings from "./admin/pages/Buildings";
import Apartments from "./admin/pages/Apartments";
import Tenants from "./admin/pages/Tenants";
import Payments from "./admin/pages/Payments";
import Messages from "./admin/pages/Messages";
import ApartmentDetails from "./admin/pages/ApartmentDetails";
import Contracts from "./admin/pages/Contracts";
import Rents from "./admin/pages/Rents";
import Expenses from "./admin/pages/Expenses";
import Audit from "./admin/pages/Audit";
import Finance from "./admin/pages/Finance";
import PaymentDetails from "./admin/pages/PaymentDetails";
import Login from "./admin/pages/Login";
import ProtectedRoute from "./admin/ProtectedRoute";
import Users from "./admin/pages/Users";
import AdminRoute from "./admin/AdminRoute";
import Connexion from "./admin/pages/Connexion";


// Providers
import ApartmentsProvider
    from "./context/ApartmentsContext";

import ProjectsProvider
    from "./context/ProjectsContext";

import BuildingsProvider
    from "./context/BuildingsContext";

import TenantsProvider
    from "./context/TenantsContext";

import PaymentsProvider
    from "./context/PaymentsContext";

import ContractsProvider
    from "./context/ContractsContext";

import RentsProvider
    from "./context/RentsContext";

import { ExpensesProvider }
    from "./context/ExpensesContext";

import { AuthProvider }
    from "./context/AuthContext";


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =========================================
                    SITE PUBLIC
                ========================================= */}

                <Route
                    path="/"
                    element={<PublicHome />}
                />

                <Route
                    path="/solution"
                    element={<Solution />}
                />

                <Route
                    path="/fonctionnalites"
                    element={<Features />}
                />

                <Route
                    path="/reference"
                    element={<Reference />}
                />

                <Route
                    path="/contact"
                    element={<Contact />}
                />

                <Route
                    path="/connexion"
                    element={<Connexion />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />                


                {/* =========================================
                    CONNEXION
                ========================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================================
                    ESPACE ADMIN
                ========================================= */}

                <Route
                    element={
                        <AdminProviders>
                            <ProtectedRoute />
                        </AdminProviders>
                    }
                >

                    <Route
                        path="/admin"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin/users"
                        element={<Users />}
                    />

                    <Route
                        path="/admin/buildings"
                        element={<Buildings />}
                    />

                    <Route
                        path="/admin/apartments"
                        element={<Apartments />}
                    />

                    <Route
                        path="/admin/apartments/:id"
                        element={<ApartmentDetails />}
                    />

                    <Route
                        path="/admin/tenants"
                        element={<Tenants />}
                    />

                    <Route
                        path="/admin/payments"
                        element={<Payments />}
                    />

                    <Route
                        path="/admin/payments/:id"
                        element={<PaymentDetails />}
                    />

                    <Route
                        path="/admin/messages"
                        element={<Messages />}
                    />

                    <Route
                        path="/admin/contracts"
                        element={<Contracts />}
                    />

                    <Route
                        path="/admin/rents"
                        element={<Rents />}
                    />

                    <Route
                        path="/admin/expenses"
                        element={<Expenses />}
                    />

                    <Route
                        path="/admin/finance"
                        element={<Finance />}
                    />


                    {/* =====================================
                        ADMIN UNIQUEMENT
                    ===================================== */}

                    <Route
                        element={<AdminRoute />}
                    >

                        <Route
                            path="/admin/audit"
                            element={<Audit />}
                        />

                    </Route>

                </Route>


            </Routes>

        </BrowserRouter>

    );

}

function AdminProviders({ children }) {

    return (

        <AuthProvider>

            <ProjectsProvider>

                <BuildingsProvider>

                    <ApartmentsProvider>

                        <TenantsProvider>

                            <PaymentsProvider>

                                <ContractsProvider>

                                    <RentsProvider>

                                        <ExpensesProvider>

                                            {children}

                                        </ExpensesProvider>

                                    </RentsProvider>

                                </ContractsProvider>

                            </PaymentsProvider>

                        </TenantsProvider>

                    </ApartmentsProvider>

                </BuildingsProvider>

            </ProjectsProvider>

        </AuthProvider>

    );

}


export default App;