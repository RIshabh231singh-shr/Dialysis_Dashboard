const express = require("express");
const { 
    createSession, 
    startSession, 
    endSession, 
    updateSession, 
    getSessionsByDate, 
    getSessionsByHospitalUnit,
    getSessionsByPatient,
    getActiveSessions,
    getSessionById
} = require("../controllers/sessionController");

const SessionRouter = express.Router();

SessionRouter.post("/create", createSession);
SessionRouter.patch("/:id/start", startSession);
SessionRouter.patch("/:id/end", endSession);
SessionRouter.patch("/:id/update", updateSession);

// Fetch Active Sessions Globally
SessionRouter.get("/active", getActiveSessions);

// Search Routes
SessionRouter.get("/search/date", getSessionsByDate);
SessionRouter.get("/search/unit/:unit", getSessionsByHospitalUnit);
SessionRouter.get("/patient/:patientId", getSessionsByPatient);
SessionRouter.get("/:id", getSessionById);

module.exports = SessionRouter;
