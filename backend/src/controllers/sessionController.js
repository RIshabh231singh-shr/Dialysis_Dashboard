const mongoose = require("mongoose");
const Session = require("../models/Session");
const { validatePreSessionData, validatePostSessionData } = require("../utils/sessionValidator");
const Patient = require("../models/Patient");
const detectAnomalies = require("../utils/anomaly");
const redisClient = require("../config/redis");

//for date
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
// Initialize Plugins
dayjs.extend(utc);
dayjs.extend(timezone);


// Cache Invalidation Helper
const invalidateTodaySessionsCache = async () => {
    try {
        await redisClient.del("today_sessions");
        console.log("Redis cache invalidated: today_sessions");
    } catch (err) {
        console.error("Redis Cache Invalidation error:", err);
    }
};


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

        // Invalidate cache
        await invalidateTodaySessionsCache();

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
            { returnDocument: "after", runValidators: true }
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

        // Invalidate cache
        await invalidateTodaySessionsCache();

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
            { returnDocument: "after" }
        );
        
        if (!currentSession) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Invalidate cache
        await invalidateTodaySessionsCache();

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

        // Invalidate cache
        await invalidateTodaySessionsCache();

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
        }).populate("patientId", "name age gender hospitalUnit bloodGroup").select("-__v")
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

const getSessionsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ success: false, message: "Invalid Patient ID format" });
        }

        const sessions = await Session.find({ patientId })
            .sort({ sessionDate: -1 })
            .lean();

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all currently active (IN_PROGRESS) sessions purely to sync global state
// @route   GET /api/session/active
// @access  Public (for now)
const getActiveSessions = async (req, res) => {
    try {
        const activeSessions = await Session.find({ status: "IN_PROGRESS" })
            .select("patientId status startTime")
            .lean();
            
        res.status(200).json({
            success: true,
            count: activeSessions.length,
            data: activeSessions
        });
    } catch (error) {
        console.error("Error fetching active sessions:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// @desc    Get session by ID
// @route   GET /api/session/:id
// @access  Public
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid Session ID format" });
        }

        const session = await Session.findById(id).populate("patientId", "name age gender bloodGroup hospitalUnit");
        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateNursingNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        if (notes && notes.length > 500) {
            return res.status(400).json({ success: false, message: "Notes cannot exceed 500 characters" });
        }

        const session = await Session.findByIdAndUpdate(
            id,
            { notes: notes?.trim() },
            { returnDocument: "after" }
        ).populate("patientId", "name age gender hospitalUnit bloodGroup");

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        // Invalidate cache since notes are visible in today's sessions
        await invalidateTodaySessionsCache();

        res.status(200).json({ success: true, message: "Nursing notes updated", data: session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getTodaySessions = async (req, res) => {
    try {
        const cacheKey = "today_sessions";
        
        // Try to get from Redis
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Serving today's sessions from cache");
            return res.status(200).json({ success: true, fromCache: true, data: JSON.parse(cachedData) });
        }

        // Fetch from DB if not in cache (Today's IST range)
        const todayStr = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD");
        const startOfDay = dayjs.tz(todayStr, "Asia/Kolkata").startOf('day').toDate();
        const endOfDay = dayjs.tz(todayStr, "Asia/Kolkata").endOf('day').toDate();

        const sessions = await Session.find({
            sessionDate: { $gte: startOfDay, $lte: endOfDay }
        })
        .populate("patientId", "name age gender hospitalUnit bloodGroup")
        .select("-__v")
        .sort({ sessionDate: 1, startTime: 1 })
        .lean();

        // Store in Redis (expire in 1 hour)
        await redisClient.set(cacheKey, JSON.stringify(sessions), { EX: 3600 });
        console.log("Today's sessions cached in Redis");

        res.status(200).json({ success: true, fromCache: false, data: sessions });
    } catch (error) {
        console.error("Redis/DB Error in getTodaySessions:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    createSession, 
    startSession, 
    endSession, 
    updateSession, 
    getSessionsByDate, 
    getSessionsByHospitalUnit,
    getSessionsByPatient,
    getActiveSessions,
    getSessionById,
    getTodaySessions,
    updateNursingNotes
};