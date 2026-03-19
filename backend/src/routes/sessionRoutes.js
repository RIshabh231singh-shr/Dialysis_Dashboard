const express = require("express");
const { 
    createSession, 
    startSession, 
    endSession, 
    updateSession, 
    getSessionsByDate, 
    getSessionsByHospitalUnit,
    getSessionsByPatient
} = require("../controllers/sessionController");

const SessionRouter = express.Router();

SessionRouter.post("/create", createSession);
SessionRouter.patch("/:id/start", startSession);
SessionRouter.patch("/:id/end", endSession);
SessionRouter.patch("/:id/update", updateSession);

// Search Routes
SessionRouter.get("/search/date", getSessionsByDate);
SessionRouter.get("/search/unit/:unit", getSessionsByHospitalUnit);
SessionRouter.get("/patient/:patientId", getSessionsByPatient);

module.exports = SessionRouter;
