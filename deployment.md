# SarathiPOD — Deployment & Local Run Guide
**Automated Proof of Delivery (POD) & Fast Billing Platform**  
*Client: Company A Logistics, Chhatrapati Sambhajinagar, Maharashtra*

---

## 1. Quick Local Setup (Under 3 Minutes)

SarathiPOD is engineered to run locally with zero cloud dependencies using standard Python 3.11+ and Node.js 20+.

### Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 20.x or higher (with `npm`)
- **Git**: Installed on your path

---

### Step-by-Step Instructions

#### Option A: Unified Full-Stack Run (Single Command)
The frontend has been pre-compiled into static distribution bundles served directly by the FastAPI backend.
```bash
# 1. Clone repository
git clone https://github.com/SaiTejesh09/sarathipod.git
cd sarathipod

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Launch unified server
python run.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

#### Option B: Developer Mode (Live Hot Reloading)
For active development with instant code reloading:

**Terminal 1 — Backend API Server:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser (Vite automatically proxies API requests to port 8000).

---

## 2. Reviewer Demo Login Accounts

SarathiPOD includes pre-seeded demo accounts tailored for every persona specified in the client brief. You can instantly toggle between roles via the top-bar role selector or sign in manually:

| Role | Username | Password | Persona & Responsibility |
| :--- | :--- | :--- | :--- |
| **Driver (Fleet)** | `driver1` | `password123` | **Ramesh Pawar** (Own Truck `MH20 EL 4521`). Tests 1-button capture, Marathi/Hindi voice prompts, offline sync, compression. |
| **Hired Driver** | *(Zero-Install)* | *(No Password)* | **Balasaheb Shinde** (`MH17 BY 3092`, Hired). Accessed via instant SMS link: `/p/sms-tok-66141`. |
| **Billing Executive** | `billing` | `password123` | **Sneha Kulkarni**. Review queue for shortage/damage remarks, split-screen inspection, Tally export. |
| **Operations Head** | `opshead` | `password123` | **Vikram Deshmukh**. Missing POD aging by branch, 1-click SMS triggers, turnaround monitoring. |
| **Managing Director** | `director` | `password123` | **S. R. Jadhav**. Working capital ROI ticker (₹3.24 Cr unlocked, ₹1.02 Cr annual value). |
| **Client Rep (Cement)**| `company_b` | `password123` | **Company B Representative**. Self-service portal to view and download verified POD receipts. |

---

## 3. Running Automated Tests

SarathiPOD includes a comprehensive unit and integration test suite covering the AI vision verifier, retake capping, shortage routing, image compression, Tally XML generation, and PDF generation.

```bash
cd backend
python -m pytest -v
```

Expected output:
```text
tests/test_sarathipod.py::test_ai_verifier_verified_flow PASSED
tests/test_sarathipod.py::test_ai_verifier_retake_on_missing_stamp PASSED
tests/test_sarathipod.py::test_ai_verifier_capped_at_two_retakes PASSED
tests/test_sarathipod.py::test_ai_verifier_shortage_remark_routing PASSED
tests/test_sarathipod.py::test_watermark_and_compression PASSED
tests/test_sarathipod.py::test_tally_sales_xml_schema PASSED
tests/test_invoice_pdf_with_pod PASSED
tests/test_api_trips_list PASSED
tests/test_api_dashboard_stats PASSED
============================== 9 passed in 4.92s ==============================
```

---

## 4. Production Deployment Guide

### Cloud Architecture Overview
SarathiPOD is packaged as a standard containerized application suitable for Railway, Render, AWS ECS, Google Cloud Run, or a standard Linux VPS (Ubuntu 22.04 LTS).

### Environment Variables
*(Provide variable names only; never commit real secrets or values to the repository)*

- `ENVIRONMENT` (e.g. `production` / `staging` / `development`)
- `PORT` (Application HTTP port, default: `8000`)
- `HOST` (Host binding, default: `0.0.0.0`)
- `JWT_SECRET` (Cryptographic secret for auth session tokens)
- `DATABASE_URL` (Path to SQLite file or PostgreSQL connection string)
- `STORAGE_DIR` (Absolute path for persistent document/POD storage)
- `LOG_LEVEL` (Logging granularity: `INFO` / `DEBUG` / `WARNING`)
- `CORS_ORIGINS` (Allowed origins for web requests)

---

### Docker Deployment (Dockerfile)

A production `Dockerfile` is provided below:

```dockerfile
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY run.py ./
EXPOSE 8000
CMD ["python", "run.py"]
```

To build and run with Docker:
```bash
docker build -t sarathipod:latest .
docker run -p 8000:8000 -e JWT_SECRET=your_secret_here sarathipod:latest
```

---

## 5. Security & DPDP Act 2023 Compliance
- **Zero Secrets in Repo**: All session tokens and credentials derive from environment variables or mock seeds.
- **PII Masking**: Consignee contact numbers and driver phone numbers are masked in audit logs and client portal views (`+91 98220 XXX45`).
- **Validated Inputs**: All endpoints use Pydantic models with strict type checking and range validation.
- **Audit Logging**: Every document view, AI decision, and manual billing override is written to an immutable `audit_logs` table with timestamp and client IP.

