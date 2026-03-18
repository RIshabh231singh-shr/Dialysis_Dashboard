const express = require("express");
const { createPatient, getPatientDetails } = require("../controllers/patientController");

const PatientRouter = express.Router();

PatientRouter.post("/create", createPatient);
PatientRouter.get("/:id", getPatientDetails);

module.exports = PatientRouter;
