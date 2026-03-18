const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Import Routes
const PatientRouter = require("./routes/patientRoutes");

// Mount Routes
app.use("/patients", PatientRouter);

module.exports = app;
