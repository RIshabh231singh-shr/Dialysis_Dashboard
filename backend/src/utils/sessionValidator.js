const mongoose = require("mongoose");

// Helper for BP
const validateBP = (bp, name) => {
    if (typeof bp !== "object") return `${name} must be an object containing systolic and diastolic`;
    
    if (bp.systolic !== undefined) {
        bp.systolic = Number(bp.systolic);
        if (isNaN(bp.systolic) || bp.systolic < 50 || bp.systolic > 250) {
            return `${name} systolic must be between 50 and 250`;
        }
    }
    if (bp.diastolic !== undefined) {
        bp.diastolic = Number(bp.diastolic);
        if (isNaN(bp.diastolic) || bp.diastolic < 30 || bp.diastolic > 150) {
            return `${name} diastolic must be between 30 and 150`;
        }
    }
    return null;
};

// 1. Validator for PRE-SESSION (Create Form before Dialysis)
const validatePreSessionData = (data) => {
    let {
        patientId,
        hospitalUnit,
        sessionDate,
        preWeight,
        preBP,
        dialysisMachineId
    } = data;

    if (
        !patientId ||
        !hospitalUnit?.trim() ||
        !sessionDate ||
        preWeight === undefined ||
        preWeight === null ||
        !dialysisMachineId?.trim()
    ) {
        return { isValid: false, message: "patientId, hospitalUnit, sessionDate, preWeight, and dialysisMachineId are totally required." };
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return { isValid: false, message: "Invalid patientId format" };
    }

    hospitalUnit = hospitalUnit.trim().toUpperCase();
    dialysisMachineId = dialysisMachineId.trim();

    sessionDate = new Date(sessionDate);
    if (isNaN(sessionDate.getTime())) {
        return { isValid: false, message: "Invalid sessionDate" };
    }

    preWeight = Number(preWeight);
    if (isNaN(preWeight) || preWeight < 0) {
        return { isValid: false, message: "preWeight must be a valid non-negative number" };
    }

    if (preBP) {
        const err = validateBP(preBP, "preBP");
        if (err) return { isValid: false, message: err };
    }

    const formattedData = {
        patientId,
        hospitalUnit,
        sessionDate,
        preWeight,
        dialysisMachineId,
        ...(preBP !== undefined && { preBP }),
        status: "SCHEDULED" // Explicit default for creation
    };

    return { isValid: true, formattedData };
};

// 2. Validator for POST-SESSION (Update Form after Dialysis Ends)
const validatePostSessionData = (data) => {
    let {
        postWeight,
        postBP,
        notes
    } = data;

    // After session, postWeight becomes mandatory to calculate fluid removal!
    if (postWeight === undefined || postWeight === null) {
        return { isValid: false, message: "postWeight is required to finalize the session" };
    }

    postWeight = Number(postWeight);
    if (isNaN(postWeight) || postWeight < 0) {
        return { isValid: false, message: "postWeight must be a valid non-negative number" };
    }

    if (postBP) {
        const err = validateBP(postBP, "postBP");
        if (err) return { isValid: false, message: err };
    }

    if (notes) {
        notes = notes.trim();
        if (notes.length > 500) {
            return { isValid: false, message: "Notes cannot exceed 500 characters" };
        }
    }

    const formattedData = {
        postWeight,
        ...(postBP !== undefined && { postBP }),
        ...(notes !== undefined && { notes })
    };

    //anomalies are intentionally excluded here because they are auto-calculated by the backend controller.

    return { isValid: true, formattedData };
};

module.exports = { validatePreSessionData, validatePostSessionData };