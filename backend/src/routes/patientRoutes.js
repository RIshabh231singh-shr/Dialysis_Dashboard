const express = require("express");
const { 
    createPatient, 
    getPatientDetails, 
    getAllPatients 
} = require("../controllers/patientController");

const PatientRouter = express.Router();

PatientRouter.post("/create", createPatient);
PatientRouter.get("/all", getAllPatients);
PatientRouter.get("/:id", getPatientDetails);

module.exports = PatientRouter;
