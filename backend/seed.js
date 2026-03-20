require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./src/models/Patient');
const Session = require('./src/models/Session');

// We use native Date or simple strings for dates to avoid dayjs dependency issues here if it fails
const MONGODB_URI = process.env.DB_URL;

const seedDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Note: Existing data is no longer cleared.

        // 1. Create Dummy Patients
        const patientsToCreate = [
            {
                name: "John Doe",
                fatherName: "Richard Doe",
                age: 45,
                gender: "MALE",
                dryWeight: 70.0,
                bloodGroup: "O+",
                hospitalUnit: "UNIT-A"
            },
            {
                name: "Jane Smith",
                fatherName: "William Smith",
                age: 62,
                gender: "FEMALE",
                dryWeight: 65.5,
                bloodGroup: "A-",
                hospitalUnit: "UNIT-B"
            },
            {
                name: "Alex Johnson",
                fatherName: "Mark Johnson",
                age: 50,
                gender: "MALE",
                dryWeight: 80.0,
                bloodGroup: "B+",
                hospitalUnit: "UNIT-A"
            }
        ];

        const createdPatients = await Patient.insertMany(patientsToCreate);
        console.log(`Created ${createdPatients.length} patients.`);

        // 2. Create Dummy Sessions
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - (2 * 60 * 60 * 1000));
        const fourHoursAgo = new Date(now.getTime() - (4 * 60 * 60 * 1000));
        const fourAndHalfHoursAgo = new Date(now.getTime() - (4.5 * 60 * 60 * 1000));

        const sessionsToCreate = [
            {
                patientId: createdPatients[0]._id,
                hospitalUnit: "UNIT-A",
                sessionDate: now,
                preWeight: 73.5, // 3.5kg weight gain (Moderate anomaly)
                preBP: { systolic: 140, diastolic: 90 },
                dialysisMachineId: "MAC-001",
                status: "SCHEDULED"
            },
            {
                patientId: createdPatients[1]._id,
                hospitalUnit: "UNIT-B",
                sessionDate: now,
                preWeight: 69.8, // 4.3kg weight gain (High anomaly)
                preBP: { systolic: 150, diastolic: 95 },
                dialysisMachineId: "MAC-002",
                startTime: twoHoursAgo,
                status: "IN_PROGRESS"
            },
            {
                patientId: createdPatients[2]._id,
                hospitalUnit: "UNIT-A",
                sessionDate: now,
                preWeight: 82.5, // 2.5kg weight gain 
                preBP: { systolic: 175, diastolic: 100 },
                postWeight: 79.5, // 3.0kg removed
                postBP: { systolic: 110, diastolic: 70 }, // 65 drop (High anomaly)
                dialysisMachineId: "MAC-003",
                startTime: fourAndHalfHoursAgo,
                endTime: now,
                duration: 270, // Excessive high duration anomaly
                status: "COMPLETED",
                notes: "Patient complained of mild cramping towards the end of session.",
                anomalies: [
                    { type: "BP", message: "Severe BP drop (>45mmHg)", severity: "HIGH" },
                    { type: "DURATION", message: "Excessive session time (>4h)", severity: "HIGH" }
                ]
            }
        ];

        const createdSessions = await Session.insertMany(sessionsToCreate);
        console.log(`Created ${createdSessions.length} sessions.`);

        console.log("Seeding complete! You can now test the API and UI.");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDB();
