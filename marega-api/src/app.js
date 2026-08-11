const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const buildingsRoutes = require("./routes/buildings.routes");
const apartmentsRoutes = require("./routes/apartments.routes");
const tenantsRoutes = require("./routes/tenants.routes");
const leasesRoutes = require("./routes/leases.routes");
const paymentsRoutes = require("./routes/payments.routes");
const rentsRoutes = require("./routes/rents.routes");
const expensesRoutes = require("./routes/expenses.routes");


const app = express();

console.log(
    "Express sert :",
    path.join(__dirname, "../contracts")
);
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
const contractsPath = path.resolve(process.cwd(), "contracts");

console.log("Serving contracts from:", contractsPath);

app.use("/contracts", express.static(contractsPath));

const receiptsPath = path.resolve(process.cwd(), "receipts");

console.log("Serving receipts from:", receiptsPath);

app.use("/receipts", express.static(receiptsPath));

app.use("/api/buildings", buildingsRoutes);
app.use("/api/apartments", apartmentsRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/leases", leasesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/rents", rentsRoutes);
app.use("/api/expenses", expensesRoutes);

app.get("/", (req, res) => {
    res.json({
        application: "MAREGA API",
        version: "1.0.0",
        status: "running"
    });
});

module.exports = app;