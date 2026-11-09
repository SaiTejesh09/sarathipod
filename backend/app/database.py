import sqlite3
import json
import logging
from datetime import datetime
from app.config import DB_PATH, DEMO_USERS

logger = logging.getLogger("sarathipod.db")

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        branch TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Trips Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        vehicle_no TEXT NOT NULL,
        is_hired INTEGER DEFAULT 0,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        freight_amount REAL NOT NULL,
        branch TEXT NOT NULL,
        driver_id TEXT,
        driver_name TEXT,
        driver_phone TEXT,
        lr_no TEXT NOT NULL,
        eway_bill_no TEXT NOT NULL,
        dispatched_at TEXT NOT NULL,
        delivered_at TEXT,
        pod_status TEXT NOT NULL DEFAULT 'PENDING_CAPTURE',
        remarks TEXT,
        retake_count INTEGER DEFAULT 0,
        sms_token TEXT UNIQUE,
        invoice_id TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # PODs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pods (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        image_filename TEXT NOT NULL,
        file_size_kb REAL NOT NULL,
        captured_at TEXT NOT NULL,
        gps_lat REAL,
        gps_lng REAL,
        gps_accuracy REAL,
        location_name TEXT,
        is_offline_synced INTEGER DEFAULT 0,
        confidence_score REAL DEFAULT 0.0,
        extracted_lr_no TEXT,
        lr_match INTEGER DEFAULT 0,
        stamp_detected INTEGER DEFAULT 0,
        stamp_confidence REAL DEFAULT 0.0,
        signature_detected INTEGER DEFAULT 0,
        signature_confidence REAL DEFAULT 0.0,
        received_quantity TEXT,
        shortage_damaged INTEGER DEFAULT 0,
        shortage_damage_remarks TEXT,
        extracted_date TEXT,
        ai_raw_response TEXT,
        status TEXT NOT NULL,
        verified_by TEXT,
        verified_at TEXT,
        billing_notes TEXT,
        retake_reason TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips (id)
    );
    """)

    # Invoices Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_no TEXT UNIQUE NOT NULL,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        billing_cycle TEXT NOT NULL,
        total_freight REAL NOT NULL,
        cgst REAL NOT NULL,
        sgst REAL NOT NULL,
        igst REAL NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'DRAFT',
        tally_guid TEXT,
        trip_count INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
    );
    """)

    # Audit Logs Table (DPDP 2023 compliant access tracking)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id TEXT,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        role TEXT NOT NULL,
        details TEXT,
        client_ip TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # Seed demo users if not present
    for user in DEMO_USERS:
        cursor.execute("SELECT id FROM users WHERE username = ?", (user["username"],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO users (id, username, password, full_name, role, phone, branch, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user["id"],
                user["username"],
                user["password"],
                user["full_name"],
                user["role"],
                user["phone"],
                user["branch"],
                datetime.utcnow().isoformat()
            ))

    conn.commit()
    conn.close()
    logger.info("Database schema initialized and verified.")

def log_audit(trip_id: str, action: str, performed_by: str, role: str, details: str = "", client_ip: str = "127.0.0.1"):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO audit_logs (trip_id, action, performed_by, role, details, client_ip, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            trip_id,
            action,
            performed_by,
            role,
            details,
            client_ip,
            datetime.utcnow().isoformat()
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error logging audit trail: {e}")

