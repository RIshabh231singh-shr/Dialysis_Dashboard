const validatePatientData = (data) => {
    let { name, fatherName, age, gender, dryWeight, bloodGroup, hospitalUnit } = data;

    if (!name?.trim() || !fatherName?.trim() || !age || !gender || !dryWeight || !bloodGroup || !hospitalUnit?.trim()) {
        return { isValid: false, message: "All fields are required" };
    }

    name = name.trim();
    fatherName = fatherName.trim();
    hospitalUnit = hospitalUnit.trim().toUpperCase();
    bloodGroup = bloodGroup.toUpperCase();
    gender = gender.toUpperCase();
    age = Number(age);
    dryWeight = Number(dryWeight);

    if (name.length < 2) {
        return { isValid: false, message: "Name must be at least 2 characters" };
    }
    
    if (fatherName.length < 2) {
        return { isValid: false, message: "Father Name must be at least 2 characters" };
    }

    if (isNaN(age) || age <= 0 || age > 150) {
        return { isValid: false, message: "Invalid age" };
    }

    if (isNaN(dryWeight) || dryWeight <= 0) {
        return { isValid: false, message: "Invalid dry weight" };
    }

    const validGenders = ["MALE", "FEMALE", "OTHER"];
    if (!validGenders.includes(gender)) {
        return { isValid: false, message: "Invalid gender" };
    }

    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodGroups.includes(bloodGroup)) {
        return { isValid: false, message: "Invalid blood group" };
    }

    return { 
        isValid: true, 
        formattedData: { name, fatherName, age, gender, dryWeight, bloodGroup, hospitalUnit } 
    };
};

module.exports = { validatePatientData };
