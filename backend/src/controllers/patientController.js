const Patient = require("../models/Patient");
const { validatePatientData } = require("../utils/patientValidator");

const createPatient = async (req, res) => {
    try {
        const validation = validatePatientData(req.body);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const patient = await Patient.create(validation.formattedData);

        res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getPatientDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid Patient ID format" });
        }

        const patient = await Patient.findById(req.params.id).lean();
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        res.status(200).json({
            success: true,
            data: patient,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
    

module.exports = { createPatient , getPatientDetails };