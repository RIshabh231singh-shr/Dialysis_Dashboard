const express = require("express");
const { createSession, startSession, endSession, updateSession } = require("../controllers/sessionController");

const SessionRouter = express.Router();

SessionRouter.post("/create", createSession);
SessionRouter.patch("/:id/start", startSession);
SessionRouter.patch("/:id/end", endSession);
SessionRouter.patch("/:id/update", updateSession);

module.exports = SessionRouter;
