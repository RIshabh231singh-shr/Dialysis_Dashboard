const detectAnomalies = require("../src/utils/anomaly");
const CLINICAL_CONFIG = require("../src/config/clinicalConfig");

describe("Anomaly Detection Clinical Logic", () => {
    
    it("should return empty array if missing patient or session data", () => {
        expect(detectAnomalies(null, {})).toEqual([]);
        expect(detectAnomalies({}, null)).toEqual([]);
    });

    it("should detect HIGH weight gain anomaly", () => {
        const patient = { dryWeight: 60 };
        // Weight gain > 4.0kg (64.5 - 60 = 4.5kg)
        const session = { preWeight: 64.5, postWeight: 60 }; 
        const anomalies = detectAnomalies(patient, session);
        
        expect(anomalies).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: "WEIGHT", severity: "HIGH", message: expect.stringContaining("Very high weight gain") })
            ])
        );
    });

    it("should detect severe BP drop anomaly (>45 mmHg)", () => {
        const patient = { dryWeight: 70 };
        const session = {
            preWeight: 72, postWeight: 70,
            preBP: { systolic: 160 },
            postBP: { systolic: 110 } // Drop of 50
        };
        const anomalies = detectAnomalies(patient, session);

        expect(anomalies).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: "BP", severity: "HIGH", message: expect.stringContaining("Severe BP drop") })
            ])
        );
    });

    it("should detect critical short session duration (< 30 min)", () => {
        const patient = { dryWeight: 70 };
        const start = new Date();
        const end = new Date(start.getTime() + (20 * 60000)); // 20 minutes later

        const session = {
            startTime: start,
            endTime: end
        };
        const anomalies = detectAnomalies(patient, session);

        expect(anomalies).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ type: "DURATION", severity: "HIGH", message: expect.stringContaining("Critical short session") })
            ])
        );
    });

    it("should pass normal physiological values without anomalies", () => {
        const patient = { dryWeight: 70 };
        const start = new Date();
        const end = new Date(start.getTime() + (2.5 * 60 * 60000)); // 2.5 hours (normal duration)

        const session = {
            preWeight: 71.5, // 1.5kg gain (normal)
            postWeight: 70.0, // Back to dry weight
            preBP: { systolic: 130 },
            postBP: { systolic: 120 }, // 10 drop (normal)
            startTime: start,
            endTime: end
        };
        const anomalies = detectAnomalies(patient, session);

        expect(anomalies.length).toBe(0);
    });
});
