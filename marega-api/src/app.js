const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const buildingsRoutes = require("./routes/buildings.routes");
const apartmentsRoutes = require("./routes/apartments.routes");
const tenantsRoutes = require("./routes/tenants.routes");
const leasesRoutes = require("./routes/leases.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use("/api/buildings", buildingsRoutes);
app.use("/api/apartments", apartmentsRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/leases", leasesRoutes);

app.get("/", (req, res) => {
    res.json({
        application: "MAREGA API",
        version: "1.0.0",
        status: "running"
    });
});

module.exports = app;