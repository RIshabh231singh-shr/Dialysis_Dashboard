const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Import Routes
const PatientRouter = require("./routes/patientRoutes");
const SessionRouter = require("./routes/sessionRoutes");

// Mount Routes
app.use("/api/patient", PatientRouter);
app.use("/api/session", SessionRouter);

module.exports = app;
