/**
 * Clinical Assumptions & Configurations
 * 
 * This file centralizes the clinical thresholds used for anomaly detection 
 * during and post dialysis sessions. These thresholds define what is classified
 * as LOW, MEDIUM, or HIGH severity anomalies, ensuring no "magic numbers" exist
 * in the core logic.
 */

const CLINICAL_CONFIG = {
  WEIGHT: {
    HIGH_GAIN: 4.0,        // > 4.0 kg interdialytic weight gain
    MEDIUM_GAIN: 3.0,      // > 3.0 kg
    LOW_GAIN: 2.0,         // > 2.0 kg
    HIGH_REMOVAL: 4.0,     // > 4.0 kg fluid removed during a single session
    MEDIUM_REMOVAL: 3.0,   // > 3.0 kg fluid removed
    DEHYDRATION_MARGIN: 0.5// Session ends < (dry weight - 0.5 kg)
  },
  BP: {
    HYPOTENSION: 90,       // Post-session systolic BP < 90 mmHg
    HYPERTENSION: 170,     // Post-session systolic BP > 170 mmHg
    SEVERE_DROP: 45,       // Pre to Post systolic drop > 45 mmHg
    MODERATE_DROP: 30,     // Drop > 30 mmHg
    SLIGHT_DROP: 20        // Drop > 20 mmHg
  },
  DURATION: {
    CRITICAL_SHORT: 30,    // Session duration < 30 minutes
    SHORT: 45,             // Session duration < 45 minutes
    INCOMPLETE: 60,        // Session duration < 60 minutes
    EXCESSIVE_HIGH: 240,   // Session duration > 4 hours (240 mins)
    EXCESSIVE_MEDIUM: 210, // Session duration > 3.5 hours
    EXCESSIVE_LOW: 180     // Session duration > 3 hours
  }
};

module.exports = CLINICAL_CONFIG;
