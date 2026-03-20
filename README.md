# DialysisCare Dashboard
[![Watch the video](./frontend/src/assets/Dashboard-overview.png)](https://youtu.be/g2N-3fvIHq0?si=bWYtdHdH8Uk5NfD9)

Dashboard for dialysis Patient records and Sessions.

## 🚀 Features

* ⚡ **Instant Session Tracking** – Record comprehensive pre and post-dialysis vitals in seconds.
* 📊 **"Today's Sessions" Dashboard** – Tracking of all daily schedules with live "In Progress" indicators.
* 🔍 **Smart Anomaly Detection** – Auto-calculates risks like excessive fluid removal or hypotension and flags them instantly.
* 📈 **High Performance & Caching** – Powered by Redis cache to deliver today's schedule at lightning speed without overwhelming the database.
* 📝 **Standalone Nurse Notes** – Editable clinical observations that nurses can update on the fly without affecting core session metrics.
* 🔎 **Historical Archival Search** – Advanced date-picker filtering to review past treatments seamlessly.
* 👨‍💻 **Developer Friendly** – Strict MERN stack architecture, robust test coverage (Jest, Vitest), and clean code configurations.

---

## 📐 System Architecture
<img width="1800" height="900" alt="architecture-diagram" src="./frontend/src/assets/SystemArchitecture.png" />

## 📐 File Structure

<img width="1800" alt="folder-structure" src="./frontend/src/assets/Folerstructure.png" />

1. **Patient Intake**: User provides patient details → **Express Server** validates and stores in MongoDB.
2. **Session Lifecycle**: Nurses schedule, start, and end sessions. Pre/Post vitals are passed through the anomaly detection utility.
3. **Data Caching**: "Today's Sessions" are heavily cached in **Redis**. Any new update automatically invalidates and refreshes the cache.
4. **Dashboard View**: React frontend fetches the cached optimal data and visually highlights critical patient flags.

### Subsystems

* **Cache & Speed**: Redis for instantaneous reads of daily schedules.
* **Clinical Logic**: Centralized `clinicalConfig.js` for safe, dynamic medical thresholds.
* **Data Storage**: MongoDB (Mongoose ORM) for flexible document structuring.
* **Testing**: Comprehensive suites across Backend (Jest/Supertest) and Frontend (Vitest/RTL).

---


## 📊 Tech Stack

* **Frontend**: React (Vite) / Tailwind CSS / Framer Motion
* **Backend**: Node.js / Express.js
* **Primary DB**: MongoDB (Atlas/Local)
* **Cache**: Redis
* **Validation**: Zod (Frontend) / Validator utils (Backend)
* **Testing**: Jest, Supertest, Vitest, React Testing Library
* **Date Parsing**: Day.js
* **Icons**: Lucide React

---

## 🚀 Quick Start & Documentation

### 1. Environment Setup

Create a `.env` file in your `backend` directory:

```env
PORT=5000
DB_URL=mongodb+srv://username:password@cluster/dialysis
REDIS_USER=default
REDIS_PASS=your_redis_password
REDIS_HOST=your_redis_host_url
REDIS_PORT=your_redis_port
```

### 2. Install & Seed

Install dependencies and instantly populate your database with test patients and anomaly-flagged sessions:

```bash
# Install backend and seed database
cd backend
npm install
npm run seed

# Install frontend
cd ../frontend
npm install
```

### 3. Run the Application

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🔑 Clinical Assumptions & Trade-offs

<img width="1800" alt="anomaly-logic" src="./frontend/src/assets/Analomy%20logic.png" />

To explicitly avoid "magic numbers" in code, all thresholds are managed in `backend/src/config/clinicalConfig.js`.

* **Weight**: Gain > 4.0 kg (`HIGH`), > 3.0 kg (`MEDIUM`). Fluid removed > 4.0 kg (`HIGH`). Dehydration below dry weight (`LOW`).
* **Blood Pressure**: Post-dialysis systolic < 90 mmHg (`HIGH`). Severe pre-to-post drop > 45 mmHg (`HIGH`). Hypertension > 170 mmHg (`MEDIUM`).
* **Duration**: Sessions < 30 mins are critical (`HIGH`). Sessions exceeding 4 hours are flagged as excessive (`HIGH`).

---

## ✅ Testing Suite

```bash
# Backend (Jest)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test
```

---

## Screenshots

<img width="1800" height="900" alt="dashboard-overview" src="./frontend/src/assets/Dashboard-overview.png" />
<img width="1800" height="900" alt="today-sessions" src="./frontend/src/assets/Today-session.png" />
<img width="1800" height="900" alt="patient-list" src="./frontend/src/assets/PatientList.png" />
<img width="1800" height="900" alt="patient-info" src="./frontend/src/assets/Patientinfo.png" />
<img width="1800" height="900" alt="schedule-dialysis" src="./frontend/src/assets/Schedule-dialysis.png" />
<img width="1800" height="900" alt="session-tracker" src="./frontend/src/assets/Session-Tracker.png" />

## 🔮 Future Implementations

* ☁️ **Cloud Deployment**: Host the application on Vercel/Render (currently optimized for localhost).
* 🔐 **Role-Based Access Control (RBAC)**: Restrict data access securely so that only authorized personnel can view or modify specific records.
* 🛡️ **JWT Authentication**: Enhance API security by implementing JSON Web Tokens for stateful-less authentication.
* 🚪 **Secure Logout Mechanism**: Implement robust logout functionality utilizing Redis to blacklist active tokens until their strict expiry time.



