const detectAnomalies = (patient, session) => {
  const anomalies = [];

  if (!patient || !session) return anomalies;

  // --- 1. WEIGHT ANOMALIES ---
  if (session.preWeight && session.postWeight && patient.dryWeight) {
    // fluidRemoved cannot be negative
    const diff = session.preWeight - session.postWeight;
    const fluidRemoved = diff < 0 ? 0 : Number(diff.toFixed(2));
    
    const weightGain = Number((session.preWeight - patient.dryWeight).toFixed(2));

    // Excessive Weight Gain (Pre-dialysis check)
    if (weightGain > 4.0) {
      anomalies.push({ type: "WEIGHT", message: "Very high weight gain (>4kg)", severity: "HIGH" });
    } else if (weightGain > 3.0) {
      anomalies.push({ type: "WEIGHT", message: "Moderate weight gain (>3kg)", severity: "MEDIUM" });
    } else if (weightGain > 2.0) {
      anomalies.push({ type: "WEIGHT", message: "Slight weight gain (>2kg)", severity: "LOW" });
    }

    // High Fluid Removal during session
    if (fluidRemoved > 4.0) {
      anomalies.push({ type: "WEIGHT", message: "Excessive fluid removed (>4kg)", severity: "HIGH" });
    } else if (fluidRemoved > 3.0) {
      anomalies.push({ type: "WEIGHT", message: "High fluid removed (>3kg)", severity: "MEDIUM" });
    }
    
    // Below Dry Weight (Dehydration Risk)
    if (session.postWeight < patient.dryWeight - 0.5) {
      anomalies.push({ type: "WEIGHT", message: "Patient dialyzed below dry weight", severity: "LOW" });
    }
  }

  // --- 2. BLOOD PRESSURE ANOMALIES ---
  if (session.preBP?.systolic && session.postBP?.systolic) {
    const preSys = session.preBP.systolic;
    const postSys = session.postBP.systolic;
    const drop = preSys - postSys;

    if (postSys < 90) {
      anomalies.push({ type: "BP", message: "Post-dialysis hypotension (<90mmHg)", severity: "HIGH" });
    } else if (drop > 45) {
      anomalies.push({ type: "BP", message: "Severe BP drop (>45mmHg)", severity: "HIGH" });
    } else if (drop > 30) {
      anomalies.push({ type: "BP", message: "Moderate BP drop (>30mmHg)", severity: "MEDIUM" });
    } else if (drop > 20) {
      anomalies.push({ type: "BP", message: "Slight BP drop (>20mmHg)", severity: "LOW" });
    }

    if (postSys > 170) {
       anomalies.push({ type: "BP", message: "High post-dialysis BP (>170mmHg)", severity: "MEDIUM" });
    }
  }

  // --- 3. DURATION ANOMALIES ---
  if (session.startTime && session.endTime) {
    const durationMin = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);

    if (durationMin < 30) {
      anomalies.push({ type: "DURATION", message: "Critical short session (<30 min)", severity: "HIGH" });
    } else if (durationMin < 45) {
      anomalies.push({ type: "DURATION", message: "Short session (<45 min)", severity: "MEDIUM" });
    } else if (durationMin < 60) {
      anomalies.push({ type: "DURATION", message: "Incomplete target time (<1h)", severity: "LOW" });
    }

    if(durationMin > 240){
      anomalies.push({ type: "DURATION", message: "Excessive session time (>4h)", severity: "HIGH" });
    }else if(durationMin > 210){
      anomalies.push({ type: "DURATION", message: "Excessive session time (>3.5h)", severity: "MEDIUM" });
    }else if(durationMin > 180){
      anomalies.push({ type: "DURATION", message: "Excessive session time (>3h)", severity: "LOW" });
    }
  }

  return anomalies;
};

module.exports = detectAnomalies;