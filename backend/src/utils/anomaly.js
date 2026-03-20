const CLINICAL_CONFIG = require("../config/clinicalConfig");

const detectAnomalies = (patient, session) => {
  const anomalies = [];

  if (!patient || !session) return anomalies;

  // --- 1. WEIGHT ANOMALIES ---
  if (session.preWeight && session.postWeight && patient.dryWeight) {
    const diff = session.preWeight - session.postWeight;
    const fluidRemoved = diff < 0 ? 0 : Number(diff.toFixed(2));
    const weightGain = Number((session.preWeight - patient.dryWeight).toFixed(2));

    if (weightGain > CLINICAL_CONFIG.WEIGHT.HIGH_GAIN) {
      anomalies.push({ type: "WEIGHT", message: `Very high weight gain (>${CLINICAL_CONFIG.WEIGHT.HIGH_GAIN}kg)`, severity: "HIGH" });
    } else if (weightGain > CLINICAL_CONFIG.WEIGHT.MEDIUM_GAIN) {
      anomalies.push({ type: "WEIGHT", message: `Moderate weight gain (>${CLINICAL_CONFIG.WEIGHT.MEDIUM_GAIN}kg)`, severity: "MEDIUM" });
    } else if (weightGain > CLINICAL_CONFIG.WEIGHT.LOW_GAIN) {
      anomalies.push({ type: "WEIGHT", message: `Slight weight gain (>${CLINICAL_CONFIG.WEIGHT.LOW_GAIN}kg)`, severity: "LOW" });
    }

    if (fluidRemoved > CLINICAL_CONFIG.WEIGHT.HIGH_REMOVAL) {
      anomalies.push({ type: "WEIGHT", message: `Excessive fluid removed (>${CLINICAL_CONFIG.WEIGHT.HIGH_REMOVAL}kg)`, severity: "HIGH" });
    } else if (fluidRemoved > CLINICAL_CONFIG.WEIGHT.MEDIUM_REMOVAL) {
      anomalies.push({ type: "WEIGHT", message: `High fluid removed (>${CLINICAL_CONFIG.WEIGHT.MEDIUM_REMOVAL}kg)`, severity: "MEDIUM" });
    }
    
    if (session.postWeight < patient.dryWeight - CLINICAL_CONFIG.WEIGHT.DEHYDRATION_MARGIN) {
      anomalies.push({ type: "WEIGHT", message: "Patient dialyzed below dry weight", severity: "LOW" });
    }
  }

  // --- 2. BLOOD PRESSURE ANOMALIES ---
  if (session.preBP?.systolic && session.postBP?.systolic) {
    const preSys = session.preBP.systolic;
    const postSys = session.postBP.systolic;
    const drop = preSys - postSys;

    if (postSys < CLINICAL_CONFIG.BP.HYPOTENSION) {
      anomalies.push({ type: "BP", message: `Post-dialysis hypotension (<${CLINICAL_CONFIG.BP.HYPOTENSION}mmHg)`, severity: "HIGH" });
    } else if (drop > CLINICAL_CONFIG.BP.SEVERE_DROP) {
      anomalies.push({ type: "BP", message: `Severe BP drop (>${CLINICAL_CONFIG.BP.SEVERE_DROP}mmHg)`, severity: "HIGH" });
    } else if (drop > CLINICAL_CONFIG.BP.MODERATE_DROP) {
      anomalies.push({ type: "BP", message: `Moderate BP drop (>${CLINICAL_CONFIG.BP.MODERATE_DROP}mmHg)`, severity: "MEDIUM" });
    } else if (drop > CLINICAL_CONFIG.BP.SLIGHT_DROP) {
      anomalies.push({ type: "BP", message: `Slight BP drop (>${CLINICAL_CONFIG.BP.SLIGHT_DROP}mmHg)`, severity: "LOW" });
    }

    if (postSys > CLINICAL_CONFIG.BP.HYPERTENSION) {
       anomalies.push({ type: "BP", message: `High post-dialysis BP (>${CLINICAL_CONFIG.BP.HYPERTENSION}mmHg)`, severity: "MEDIUM" });
    }
  }

  // --- 3. DURATION ANOMALIES ---
  if (session.startTime && session.endTime) {
    const durationMin = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);

    if (durationMin < CLINICAL_CONFIG.DURATION.CRITICAL_SHORT) {
      anomalies.push({ type: "DURATION", message: `Critical short session (<${CLINICAL_CONFIG.DURATION.CRITICAL_SHORT} min)`, severity: "HIGH" });
    } else if (durationMin < CLINICAL_CONFIG.DURATION.SHORT) {
      anomalies.push({ type: "DURATION", message: `Short session (<${CLINICAL_CONFIG.DURATION.SHORT} min)`, severity: "MEDIUM" });
    } else if (durationMin < CLINICAL_CONFIG.DURATION.INCOMPLETE) {
      anomalies.push({ type: "DURATION", message: `Incomplete target time (<${CLINICAL_CONFIG.DURATION.INCOMPLETE} min)`, severity: "LOW" });
    }

    if(durationMin > CLINICAL_CONFIG.DURATION.EXCESSIVE_HIGH){
      anomalies.push({ type: "DURATION", message: `Excessive session time (>${CLINICAL_CONFIG.DURATION.EXCESSIVE_HIGH / 60}h)`, severity: "HIGH" });
    }else if(durationMin > CLINICAL_CONFIG.DURATION.EXCESSIVE_MEDIUM){
      anomalies.push({ type: "DURATION", message: `Excessive session time (>${CLINICAL_CONFIG.DURATION.EXCESSIVE_MEDIUM / 60}h)`, severity: "MEDIUM" });
    }else if(durationMin > CLINICAL_CONFIG.DURATION.EXCESSIVE_LOW){
      anomalies.push({ type: "DURATION", message: `Excessive session time (>${CLINICAL_CONFIG.DURATION.EXCESSIVE_LOW / 60}h)`, severity: "LOW" });
    }
  }

  return anomalies;
};

module.exports = detectAnomalies;