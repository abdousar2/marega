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
                    element={<ProtectedRoute />}
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


export default App;