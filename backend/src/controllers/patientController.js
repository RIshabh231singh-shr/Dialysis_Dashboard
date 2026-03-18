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
        const patient = await Patient.findById(req.params.id);
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