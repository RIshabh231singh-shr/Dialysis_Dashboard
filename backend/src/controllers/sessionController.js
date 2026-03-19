const mongoose = require("mongoose");
const Session = require("../models/Session");
const { validatePreSessionData, validatePostSessionData } = require("../utils/sessionValidator");
const Patient = require("../models/Patient");
const detectAnomalies = require("../utils/anomaly");

//for date
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
// Initialize Plugins
dayjs.extend(utc);
dayjs.extend(timezone);


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
            return res.status(400).json({ success: false, message: validation.message });
        }

        // Update post-dialysis data using findByIdAndUpdate
        // We populate patientId so we can run anomalies immediately after
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            validation.formattedData,
            { new: true, runValidators: true }
        ).populate("patientId");

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Calculate Anomalies now that we have updated state
        const patient = session.patientId;
        const anomalies = detectAnomalies(patient, session);
        session.anomalies = anomalies;

        // Save anomalies (This is safe as we just got the latest 'session' from DB)
        await session.save();

        res.status(200).json({
            success: true,
            message: "Session updated and anomalies calculated successfully",
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
        const session = await Session.findOne({ _id: req.params.id, status: "IN_PROGRESS" });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found or not in progress"
            });
        }

        session.endTime = new Date();
        session.status = "COMPLETED";

        // Calculate duration if startTime exists
        if (session.startTime) {
            const durationMs = session.endTime - session.startTime;
            session.duration = Math.round(durationMs / 60000);
        }

        await session.save();

        res.status(200).json({
            success: true,
            message: "Session ended. Now proceed to update post-dialysis data.",
            data: session
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getSessionsByDate = async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ success: false, message: "Date is required" });

        // Using IST (+05:30) timezone for dialysis tracking
        const startOfDay = dayjs.tz(date, "Asia/Kolkata").startOf('day').toDate();
        const endOfDay = dayjs.tz(date, "Asia/Kolkata").endOf('day').toDate();

        const sessions = await Session.find({
            sessionDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate("patientId", "name age gender hospitalUnit").select("-__v")
        .lean();

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSessionsByHospitalUnit = async (req, res) => {
    try {
        const { unit } = req.params;
        const sessions = await Session.find({ hospitalUnit: unit.toUpperCase() })
            .populate("patientId", "name age gender hospitalUnit")
            .select("-__v")
            .sort({ sessionDate: -1 });

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    createSession, 
    startSession, 
    endSession, 
    updateSession, 
    getSessionsByDate, 
    getSessionsByHospitalUnit 
};