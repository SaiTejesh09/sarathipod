# SarathiPOD — AI Proof of Delivery & Accelerated Billing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/pytest-9%20passed-success.svg)]()
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)]()
[![React](https://img.shields.io/badge/react-18.3-61dafb.svg)]()
[![Vite](https://img.shields.io/badge/vite-5.4-646cff.svg)]()
[![Tally Integration](https://img.shields.io/badge/tally-Prime%20XML-orange.svg)]()
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%202023-compliant-emerald.svg)]()

> Built for **Company A Logistics (Pvt Ltd)**, MIDC Waluj, Chhatrapati Sambhajinagar, Maharashtra.  
> Full-truckload (FTL) bulk transporter moving cement, steel, and packaged foods across 800+ km long-haul routes.

---

## 🎯 Executive Overview & Financial Impact

Company A loses **₹1.02 Crore every year** due to slow physical paper POD returns and unverified freight disputes. SarathiPOD solves this at the consignee gate in under 60 seconds.

| Metric | Before SarathiPOD | With SarathiPOD | Net Annual Value Created |
| :--- | :--- | :--- | :--- |
| **POD-to-Invoice Turnaround** | **18 Days** (Paper sent 800 km) | **4 Days** (Instant Gate Capture) | **14 Days Acceleration** |
| **Trapped Working Capital** | ₹4.16 Crore Trapped | **₹3.24 Crore Unlocked** | **₹3.24 Cr** freed across ₹84.48 Cr freight |
| **Working Capital Interest (12%)**| ₹49.9 Lakh / yr | ₹11.0 Lakh / yr | **₹38.9 Lakh / year Saved** |
| **Lost/Disputed POD Rate** | **1.5%** (396 trips/yr @ 50% penalty) | **&lt; 0.5%** (Gate-verified proof) | **₹63.36 Lakh / year Saved** |
| **Total Annual Financial Drain** | ₹1.02 Crore / year Loss | **Protected & Automated** | **₹1.02 Crore / year Saved** |
| **Budget & Payback** | ₹7.5 Lakh Project Budget | Full Capital Payback | **27 Days Payback (under 1 month!)** |

---

## 🚀 Key Features

### 1. 📱 Driver App (Designed for Low-Literacy Drivers)
- **One Big Button:** Large 96px touch target (`📸 POD फोटो काढा`). No forms, no typing.
- **Audio Voice Prompts:** Web Speech Synthesis guidance in **Marathi** (`mr-IN`) and **Hindi** (`hi-IN`).
- **Tamper-Evident Geotagging:** Watermarks photo with GPS Lat/Lng (±10m accuracy), UTC time, and Trip ID.
- **Edge Canvas Compression:** Automatically resizes and compresses photos to strictly **&lt; 300 KB** before sending.
- **Offline Highway Sync:** Uses **IndexedDB** to store captures in zero-connectivity dead zones, auto-syncing when 4G resumes.

### 2. 🔗 Zero-Install SMS Upload Link for Hired Drivers
- For the ~200 market truck drivers who refuse to install an application.
- A one-touch web link (`/p/:token`) opens directly in Chrome/Safari with camera and GPS access.

### 3. 🤖 AI POD Verification & Retake Engine
- **Consignee Rubber Stamp Detection:** Scans violet/blue ink pad saturation clusters typical of Indian industrial godowns (UltraTech, ACC, Jindal Steel).
- **Consignee Signature Detection:** Evaluates handwriting edge density gradients in the lower 35% acknowledgment box.
- **LR Number Match:** OCR token validation against expected trip manifest.
- **Shortage & Damage NLP Scanner:** Detects English, Hindi, and Marathi discrepancy keywords (`short by 6 cartons`, `कम मिला`, `तूट`).
- **Human-in-the-Loop Routing:** Any discrepancy immediately routes to the Billing Executive review queue.
- **Retake Capping:** Automatically prompts driver to retake (with exact defect explanation) at most **2 times**. If defects persist, it routes to manual review without trapping the driver at the gate.

### 4. ⚖️ Billing Executive Review Queue
- Split-screen comparison: High-resolution zoomable POD document on the left; AI diagnostics and editable override fields on the right.
- 1-click Approval, Retake Request, or Dispute Flagging.

### 5. 🧾 Billing & Tally Prime Integration
- Batching of verified trips by Client (Company B Cement, Company C Steel, Company D Foods) and billing cycle.
- **1-Click Tally Prime XML Export:** Produces valid Sales Voucher XML with Freight Income, Output CGST, Output SGST, and LR/Vehicle User-Defined Fields.
- **1-Click Tax Invoice PDF Generation:** Generates a formal 2-page invoice with client billing on Page 1 and the certified watermarked POD on Page 2.
- Excel reconciliation export.

### 6. 📊 Operations & MD Executive Dashboard
- Live POD-to-invoice turnaround ticker (current: 3.8 days vs target: 4 days).
- Missing-POD aging breakdown (&lt;24h, 24–48h, 48h–7d, &gt;7d Critical).
- Branch performance comparison (Chhatrapati Sambhajinagar, Pune, Nagpur, Indore, Raipur, Hyderabad).
- 1-click SMS reminder trigger to drivers.
- Self-service portal link for enterprise clients.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide Icons, Web Speech API, HTML5 Canvas 2D, IndexedDB.
- **Backend:** Python 3.11, FastAPI, Uvicorn, Pydantic v2, SQLite, Pillow (PIL), ReportLab, Pandas, XlsxWriter.
- **Testing:** Pytest (9 passing test cases).
- **Compliance:** Digital Personal Data Protection (DPDP) Act 2023.

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/SaiTejesh09/sarathipod.git
cd sarathipod

# 2. Install Python dependencies
pip install -r backend/requirements.txt

# 3. Run application (single unified command)
python run.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Run Automated Tests
```bash
cd backend
python -m pytest -v
```

---

## 👤 Reviewer Demo Logins

| Persona | Username | Password |
| :--- | :--- | :--- |
| **Driver (Fleet)** | `driver1` | `password123` |
| **Hired Driver** | *(Zero-Install link)* | `/p/sms-tok-66141` |
| **Billing Executive** | `billing` | `password123` |
| **Operations Head** | `opshead` | `password123` |
| **Managing Director** | `director` | `password123` |
| **Client Rep (Cement)** | `company_b` | `password123` |

---

## 📦 Submission Artifacts

The final evaluation zip file is located at the repository root:
- `SarathiPOD_Submission.zip` (containing `Technical_Design_Document.pdf`, `Technical_Design_Document.docx`, and `deployment.md`).

