const mongoose = require("mongoose");
const Session = require("../models/Session");
const { validatePreSessionData, validatePostSessionData } = require("../utils/sessionValidator");

const createSession = async (req, res) => {
    try {
        const validation = validatePreSessionData(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const session = await Session.create(validation.formattedData);

        res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateSession = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid Session ID format" });
        }

        const validation = validatePostSessionData(req.body);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const session = await Session.findByIdAndUpdate(
            req.params.id, 
            validation.formattedData, 
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({
            success: true,
            message: "Session updated successfully",
            data: session,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


const startSession = async (req, res) => {
    try {
        const { id } = req.params;
        const currentSession = await Session.findOneAndUpdate(
            { _id: id, status: "SCHEDULED" },
            { startTime: new Date(), status: "IN_PROGRESS" },
            { new: true }
        );
        
        if (!currentSession) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({ success: true, message: "Session started", data: currentSession });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const endSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, status: "IN_PROGRESS" },
      {
        endTime: new Date(),
        status: "COMPLETED"
      },
      { new: true }
    );

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Session not found or not in progress"
      });
    }

    // Calculate duration
    if (session.startTime && session.endTime > session.startTime) {
      const durationMs = session.endTime - session.startTime;
      session.duration = Math.round(durationMs / 60000);
      await session.save(); // update duration separately
    }

    res.status(200).json({
      success: true,
      message: "Session ended",
      data: session
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = { createSession, startSession, endSession, updateSession };