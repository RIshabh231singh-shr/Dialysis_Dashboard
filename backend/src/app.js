const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const PatientRouter = require("./routes/patientRoutes");
const SessionRouter = require("./routes/sessionRoutes");

// Mount Routes
app.use("/api/patient", PatientRouter);
app.use("/api/session", SessionRouter);

module.exports = app;
