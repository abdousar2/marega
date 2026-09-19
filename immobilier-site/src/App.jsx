import { BrowserRouter, Routes, Route } from "react-router-dom";


// PUBLIC
import PublicHome from "./admin/pages/PublicHome";
import Solution from "./admin/pages/Solution";
import Features from "./admin/pages/Features";
import Reference from "./admin/pages/Reference";
import Contact from "./admin/pages/Contact";


// PLATFORM
import PlatformLogin from "./platform/pages/PlatformLogin";
import PlatformDashboard from "./platform/pages/PlatformDashboard";
import PlatformProtectedRoute from "./platform/routes/PlatformProtectedRoute";
import PlatformAgencyCreate from "./platform/pages/PlatformAgencyCreate";
import PlatformRequests from "./platform/pages/PlatformRequests";
import DocumentTemplates from "./platform/pages/DocumentTemplates";


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
import AgencyDocuments from "./admin/pages/AgencyDocuments";
import AgencySettings from "./admin/pages/AgencySettings";


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

import PlatformAgencies
    from "./platform/pages/PlatformAgencies";

import PlatformAgencyDetails
    from "./platform/pages/PlatformAgencyDetails";


function App() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =====================================================
                    SITE PUBLIC
                ===================================================== */}

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


                {/* =====================================================
                    CONNEXION AGENCE
                ===================================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =====================================================
                    ADMINISTRATION TECHTRADISPORT
                ===================================================== */}

                <Route
                    path="/platform/login"
                    element={<PlatformLogin />}
                />

                <Route
                    path="/platform/agencies/:id"
                    element={
                        <PlatformProtectedRoute>
                            <PlatformAgencyDetails />
                        </PlatformProtectedRoute>
                    }
                />


                <Route
                    path="/platform"
                    element={
                        <PlatformProtectedRoute>
                            <PlatformDashboard />
                        </PlatformProtectedRoute>
                    }
                />

                <Route
                    path="/platform/agencies"
                    element={
                        <PlatformProtectedRoute>
                            <PlatformAgencies />
                        </PlatformProtectedRoute>
                    }
                />

                <Route
                    path="/platform/agencies/new"
                    element={
                        <PlatformAgencyCreate />
                    }
                />

                <Route
                    path="/platform/requests"
                    element={
                        <PlatformProtectedRoute>
                            <PlatformRequests />
                        </PlatformProtectedRoute>
                    }
                />

                <Route
                    path="/platform/document-templates"
                    element={
                        <DocumentTemplates />
                    }
                />

                {/* =====================================================
                    ESPACE ADMIN MAREGA
                ===================================================== */}

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

                    <Route
                        path="/admin/agency-documents"
                        element={<AgencyDocuments />}
                    />

                    {/* =============================================
                        ADMIN UNIQUEMENT
                    ============================================= */}

                    <Route
                        element={<AdminRoute />}
                    >

                        <Route
                            path="/admin/agency-settings"
                            element={<AgencySettings />}
                        />

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