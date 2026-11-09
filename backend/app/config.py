import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DIR = BASE_DIR / "sample_pods"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = BASE_DIR / "sarathipod.db"

# Security & Secrets
SECRET_KEY = os.getenv("JWT_SECRET", "sarathi-pod-in-production-chhatrapati-sambhajinagar-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days for mobile drivers

# DPDP Act 2023 Masking Settings
MASK_PII_LOGS = True

# Business Constants
COMPANY_NAME = "Company A Logistics (Pvt Ltd)"
COMPANY_BRANCH_HQ = "Chhatrapati Sambhajinagar"
BRANCHES = [
    "Chhatrapati Sambhajinagar",
    "Pune",
    "Nagpur",
    "Indore",
    "Raipur",
    "Hyderabad"
]

TARGET_POD_DAYS = 4
BASELINE_POD_DAYS = 18
ANNUAL_TRIPS = 26400  # 2,200 * 12
AVG_FREIGHT = 32000
WORKING_CAPITAL_INTEREST = 0.12
ANNUAL_FREIGHT_VALUE = 844800000  # 84.48 Cr
MAX_RETAKES_ALLOWED = 2

# Demo Users Credentials
DEMO_USERS = [
    {
        "id": "USR-DRV-01",
        "username": "driver1",
        "password": "password123",
        "full_name": "Ramesh Pawar (रमेश पवार)",
        "role": "driver",
        "phone": "+91 98220 12345",
        "branch": "Chhatrapati Sambhajinagar"
    },
    {
        "id": "USR-BIL-01",
        "username": "billing",
        "password": "password123",
        "full_name": "Sneha Kulkarni",
        "role": "billing",
        "phone": "+91 98230 45678",
        "branch": "Chhatrapati Sambhajinagar"
    },
    {
        "id": "USR-OPS-01",
        "username": "opshead",
        "password": "password123",
        "full_name": "Vikram Deshmukh",
        "role": "ops_head",
        "phone": "+91 98240 78901",
        "branch": "Chhatrapati Sambhajinagar"
    },
    {
        "id": "USR-DIR-01",
        "username": "director",
        "password": "password123",
        "full_name": "S. R. Jadhav (Managing Director)",
        "role": "director",
        "phone": "+91 98250 99999",
        "branch": "Chhatrapati Sambhajinagar"
    },
    {
        "id": "USR-CLI-01",
        "username": "company_b",
        "password": "password123",
        "full_name": "Company B (Cement Dispatch Rep)",
        "role": "client",
        "phone": "+91 98260 11223",
        "branch": "Nagpur"
    }
]

