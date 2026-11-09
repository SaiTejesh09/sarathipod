import os
import uuid
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from app.config import UPLOAD_DIR, SAMPLE_DIR
from app.database import get_db_connection

def create_synthetic_pod_image(
    filename: str,
    trip_id: str,
    lr_no: str,
    vehicle_no: str,
    client_name: str,
    destination: str,
    has_stamp: bool = True,
    has_signature: bool = True,
    has_shortage: bool = False,
    shortage_text: str = "",
    is_blurry: bool = False
) -> str:
    """
    Generates an authentic synthetic Lorry Receipt / POD image.
    Used for seed data and automated demonstrations.
    """
    width, height = 900, 1200
    img = Image.new("RGB", (width, height), color=(253, 251, 247))
    draw = ImageDraw.Draw(img)

    # Document Border
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(30, 41, 59), width=2)
    draw.rectangle([(25, 25), (width - 25, height - 25)], outline=(148, 163, 184), width=1)

    # Header Box
    draw.rectangle([(25, 25), (width - 25, 140)], fill=(241, 245, 249))
    draw.text((45, 38), "COMPANY A LOGISTICS (PVT LTD)", fill=(15, 23, 42))
    draw.text((45, 62), "FLEET & FTL TRANSPORT OPERATORS - CHHATRAPATI SAMBHAJINAGAR", fill=(71, 85, 105))
    draw.text((45, 82), "Regd. Off: Plot 42, MIDC Waluj, Chhatrapati Sambhajinagar - 431136 | Phone: 0240-2554100", fill=(100, 116, 139))
    draw.text((45, 105), "GSTIN: 27AABCC1234F1Z8 | Pan-India FTL Bulk Cargo Services", fill=(100, 116, 139))

    # LR & Date Header
    draw.rectangle([(25, 145), (width - 25, 220)], fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((45, 160), f"LORRY RECEIPT / CONSIGNMENT NOTE: {lr_no}", fill=(15, 23, 42))
    draw.text((45, 185), f"TRIP REF: {trip_id}  |  VEHICLE NO: {vehicle_no}", fill=(15, 23, 42))
    draw.text((580, 160), f"DATE: {datetime.now().strftime('%d-%b-%Y')}", fill=(15, 23, 42))
    draw.text((580, 185), "ORIGIN: Chh. Sambhajinagar", fill=(71, 85, 105))

    # Consignor & Consignee Box
    draw.rectangle([(25, 225), (450, 340)], outline=(203, 213, 225))
    draw.text((35, 235), "CONSIGNOR (Shipper):", fill=(71, 85, 105))
    draw.text((35, 260), "Company A Logistics Hub / Sender Plant", fill=(15, 23, 42))
    draw.text((35, 280), "MIDC Industrial Estate, Waluj", fill=(100, 116, 139))

    draw.rectangle([(450, 225), (width - 25, 340)], outline=(203, 213, 225))
    draw.text((465, 235), "CONSIGNEE (Receiver):", fill=(71, 85, 105))
    draw.text((465, 260), f"{client_name}", fill=(15, 23, 42))
    draw.text((465, 280), f"Destination Warehouse / Depot: {destination}", fill=(100, 116, 139))

    # Cargo Details Table
    draw.rectangle([(25, 350), (width - 25, 600)], outline=(30, 41, 59), width=1)
    draw.line([(25, 390), (width - 25, 390)], fill=(30, 41, 59), width=1)
    
    # Headers
    draw.text((40, 365), "Item", fill=(15, 23, 42))
    draw.text((120, 365), "Description of Goods", fill=(15, 23, 42))
    draw.text((460, 365), "Packages", fill=(15, 23, 42))
    draw.text((600, 365), "Weight (MT)", fill=(15, 23, 42))
    draw.text((740, 365), "Freight (Rs)", fill=(15, 23, 42))

    # Rows
    draw.text((40, 415), "1", fill=(15, 23, 42))
    desc = "PPC CEMENT 50KG BAGS" if "cement" in client_name.lower() else "TMT REBARS / STRUCTURAL STEEL" if "steel" in client_name.lower() else "FOOD PRODUCTS & BISCUITS (CARTONS)"
    draw.text((120, 415), desc, fill=(15, 23, 42))
    draw.text((460, 415), "650 Bags / Units", fill=(15, 23, 42))
    draw.text((600, 415), "32.50 MT", fill=(15, 23, 42))
    draw.text((740, 415), "Rs. 38,500.00", fill=(15, 23, 42))

    # Terms & Conditions
    draw.text((40, 540), "Terms: Goods received in apparent good order and condition unless otherwise stated.", fill=(148, 163, 184))
    draw.text((40, 560), "Carrier is not responsible for internal damage/leakage in sealed containers.", fill=(148, 163, 184))

    # Acknowledgment & Delivery Gate Section
    draw.rectangle([(25, 620), (width - 25, 960)], fill=(255, 255, 255), outline=(15, 23, 42), width=2)
    draw.text((45, 635), "CONSIGNEE DELIVERY ACKNOWLEDGMENT & GATE PASS STAMP:", fill=(15, 23, 42))

    # Consignee Stamp (Circular Blue/Violet Ink Stamp)
    if has_stamp:
        # Draw realistic circular double-ring rubber stamp with light ink tint
        stamp_x, stamp_y = 200, 780
        stamp_color = (41, 37, 138)  # Classic Indian office violet ink
        # Light ink tint background
        draw.ellipse([(stamp_x - 105, stamp_y - 105), (stamp_x + 105, stamp_y + 105)], fill=(240, 240, 255), outline=stamp_color, width=4)
        draw.ellipse([(stamp_x - 90, stamp_y - 90), (stamp_x + 90, stamp_y + 90)], outline=stamp_color, width=2)
        draw.text((stamp_x - 75, stamp_y - 45), "RECEIVED & VERIFIED", fill=stamp_color)
        draw.text((stamp_x - 85, stamp_y - 20), f"{destination.upper()} UNLOAD DEPOT", fill=stamp_color)
        draw.text((stamp_x - 70, stamp_y + 10), f"DATE: {datetime.now().strftime('%d/%m/%Y')}", fill=stamp_color)
        draw.text((stamp_x - 65, stamp_y + 35), "SECURITY GATE PASS", fill=stamp_color)
    else:
        # Stamp missing box
        draw.rectangle([(100, 700), (320, 880)], outline=(239, 68, 68), width=2)
        draw.text((120, 780), "[CONSIGNEE STAMP MISSING]", fill=(239, 68, 68))

    # Consignee Signature
    if has_signature:
        sig_x, sig_y = 650, 780
        # Draw cursive signature strokes
        draw.text((sig_x - 90, sig_y - 30), "Sunil S. Rao", fill=(15, 23, 42))
        draw.line([(sig_x - 100, sig_y + 10), (sig_x + 80, sig_y + 10)], fill=(30, 41, 59), width=1)
        draw.text((sig_x - 95, sig_y + 20), "Receiving Godown Supervisor", fill=(71, 85, 105))
        draw.text((sig_x - 95, sig_y + 40), f"Sign Time: {datetime.now().strftime('%I:%M %p')}", fill=(100, 116, 139))

    # Shortage or Damage Remark (Handwritten Red Ink simulation)
    if has_shortage:
        remark_box = [(45, 900), (width - 45, 950)]
        draw.rectangle(remark_box, fill=(254, 242, 242), outline=(220, 38, 38))
        draw.text((60, 915), f"REMARKS BY RECEIVER: {shortage_text}", fill=(185, 28, 28))

    # Driver & Trip Geotag Watermark footer
    banner_y = height - 60
    draw.rectangle([(0, banner_y), (width, height)], fill=(15, 23, 42))
    ts_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
    gps_tag = f"SARATHIPOD GEO-TAGGED | TRIP: {trip_id} | GPS: 19.8762°N, 75.3433°E | TS: {ts_now} | IMMUTABLE HASH"
    draw.text((30, banner_y + 20), gps_tag, fill=(241, 245, 249))

    # Save to file
    file_path = os.path.join(UPLOAD_DIR, filename)
    img.save(file_path, "JPEG", quality=85, optimize=True)
    return file_path

def seed_sample_database():
    """
    Seeds database with all trips from the prompt + additional realistic trips across branches.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Pre-generate synthetic sample POD images
    img1 = create_synthetic_pod_image(
        "TRP-66120_pod.jpg",
        "TRP-66120",
        "LR-45901",
        "MH20 EL 4521",
        "Company B (Cement)",
        "Nagpur",
        has_stamp=True,
        has_signature=True,
        has_shortage=False
    )
    img2 = create_synthetic_pod_image(
        "TRP-66134_pod_nostamp.jpg",
        "TRP-66134",
        "LR-45915",
        "MH20 GT 7718",
        "Company C (Steel)",
        "Pune",
        has_stamp=False,
        has_signature=True,
        has_shortage=False
    )
    img3 = create_synthetic_pod_image(
        "TRP-66141_pod_shortage.jpg",
        "TRP-66141",
        "LR-45928",
        "MH17 BY 3092",
        "Company D (Packaged Foods)",
        "Indore",
        has_stamp=True,
        has_signature=True,
        has_shortage=True,
        shortage_text="Short by 6 cartons received - 2 cartons torn"
    )

    now = datetime.utcnow()
    trips_data = [
        # 1. From problem statement: TRP-66120
        {
            "id": "TRP-66120",
            "client_id": "CLI-B-CEMENT",
            "client_name": "Company B (cement)",
            "vehicle_no": "MH20 EL 4521",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Nagpur",
            "freight_amount": 38500.0,
            "branch": "Nagpur",
            "driver_id": "USR-DRV-01",
            "driver_name": "Ramesh Pawar",
            "driver_phone": "+91 98220 12345",
            "lr_no": "LR-45901",
            "eway_bill_no": "241098451290",
            "dispatched_at": (now - timedelta(days=2)).isoformat(),
            "delivered_at": (now - timedelta(hours=6)).isoformat(),
            "pod_status": "VERIFIED",
            "remarks": "None",
            "retake_count": 0,
            "sms_token": "sms-tok-66120",
            "pod_image": "TRP-66120_pod.jpg",
            "pod_analysis": {
                "confidence": 0.96,
                "stamp": 1,
                "signature": 1,
                "shortage": 0
            }
        },
        # 2. From problem statement: TRP-66134
        {
            "id": "TRP-66134",
            "client_id": "CLI-C-STEEL",
            "client_name": "Company C (steel)",
            "vehicle_no": "MH20 GT 7718",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Pune",
            "freight_amount": 26000.0,
            "branch": "Pune",
            "driver_id": "USR-DRV-02",
            "driver_name": "Santosh Gaikwad",
            "driver_phone": "+91 98221 44556",
            "lr_no": "LR-45915",
            "eway_bill_no": "241098451334",
            "dispatched_at": (now - timedelta(days=1)).isoformat(),
            "delivered_at": (now - timedelta(hours=3)).isoformat(),
            "pod_status": "RETAKE_REQUESTED",
            "remarks": "Stamp not visible",
            "retake_count": 1,
            "sms_token": "sms-tok-66134",
            "pod_image": "TRP-66134_pod_nostamp.jpg",
            "pod_analysis": {
                "confidence": 0.42,
                "stamp": 0,
                "signature": 1,
                "shortage": 0
            }
        },
        # 3. From problem statement: TRP-66141
        {
            "id": "TRP-66141",
            "client_id": "CLI-D-FOODS",
            "client_name": "Company D (packaged foods)",
            "vehicle_no": "MH17 BY 3092 (hired)",
            "is_hired": 1,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Indore",
            "freight_amount": 41200.0,
            "branch": "Indore",
            "driver_id": None,
            "driver_name": "Balasaheb Shinde (Hired)",
            "driver_phone": "+91 94230 77112",
            "lr_no": "LR-45928",
            "eway_bill_no": "241098451402",
            "dispatched_at": (now - timedelta(days=2)).isoformat(),
            "delivered_at": (now - timedelta(hours=8)).isoformat(),
            "pod_status": "NEEDS_REVIEW",
            "remarks": "Short by 6 cartons",
            "retake_count": 0,
            "sms_token": "sms-tok-66141",
            "pod_image": "TRP-66141_pod_shortage.jpg",
            "pod_analysis": {
                "confidence": 0.78,
                "stamp": 1,
                "signature": 1,
                "shortage": 1
            }
        },
        # 4. Extra realistic trip: Pending capture (>24h warning)
        {
            "id": "TRP-66145",
            "client_id": "CLI-B-CEMENT",
            "client_name": "Company B (cement)",
            "vehicle_no": "MH20 FD 1190",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Raipur",
            "freight_amount": 54000.0,
            "branch": "Raipur",
            "driver_id": "USR-DRV-01",
            "driver_name": "Ramesh Pawar",
            "driver_phone": "+91 98220 12345",
            "lr_no": "LR-45942",
            "eway_bill_no": "241098451499",
            "dispatched_at": (now - timedelta(days=3)).isoformat(),
            "delivered_at": None,
            "pod_status": "PENDING_CAPTURE",
            "remarks": "In transit - 750 km",
            "retake_count": 0,
            "sms_token": "sms-tok-66145",
            "pod_image": None,
            "pod_analysis": None
        },
        # 5. Extra realistic trip: Pending capture (>7 days critical!)
        {
            "id": "TRP-66110",
            "client_id": "CLI-C-STEEL",
            "client_name": "Company C (steel)",
            "vehicle_no": "MH20 AA 9912",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Hyderabad",
            "freight_amount": 42000.0,
            "branch": "Hyderabad",
            "driver_id": "USR-DRV-03",
            "driver_name": "Anil Mane",
            "driver_phone": "+91 98224 88321",
            "lr_no": "LR-45880",
            "eway_bill_no": "241098450912",
            "dispatched_at": (now - timedelta(days=8)).isoformat(),
            "delivered_at": None,
            "pod_status": "PENDING_CAPTURE",
            "remarks": "Critical: >7 days without POD. Unbilled working capital ₹42,000",
            "retake_count": 0,
            "sms_token": "sms-tok-66110",
            "pod_image": None,
            "pod_analysis": None
        },
        # 6. Extra realistic trip: Verified and ready for billing
        {
            "id": "TRP-66148",
            "client_id": "CLI-B-CEMENT",
            "client_name": "Company B (cement)",
            "vehicle_no": "MH20 BH 4410",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Nagpur",
            "freight_amount": 38500.0,
            "branch": "Nagpur",
            "driver_id": "USR-DRV-01",
            "driver_name": "Ramesh Pawar",
            "driver_phone": "+91 98220 12345",
            "lr_no": "LR-45950",
            "eway_bill_no": "241098451550",
            "dispatched_at": (now - timedelta(days=2)).isoformat(),
            "delivered_at": (now - timedelta(hours=14)).isoformat(),
            "pod_status": "VERIFIED",
            "remarks": "Verified by AI",
            "retake_count": 0,
            "sms_token": "sms-tok-66148",
            "pod_image": "TRP-66120_pod.jpg",
            "pod_analysis": {
                "confidence": 0.94,
                "stamp": 1,
                "signature": 1,
                "shortage": 0
            }
        },
        # 7. Extra realistic trip: Invoiced
        {
            "id": "TRP-66115",
            "client_id": "CLI-C-STEEL",
            "client_name": "Company C (steel)",
            "vehicle_no": "MH20 EF 3320",
            "is_hired": 0,
            "origin": "Chhatrapati Sambhajinagar",
            "destination": "Pune",
            "freight_amount": 26000.0,
            "branch": "Pune",
            "driver_id": "USR-DRV-02",
            "driver_name": "Santosh Gaikwad",
            "driver_phone": "+91 98221 44556",
            "lr_no": "LR-45892",
            "eway_bill_no": "241098451001",
            "dispatched_at": (now - timedelta(days=6)).isoformat(),
            "delivered_at": (now - timedelta(days=5)).isoformat(),
            "pod_status": "INVOICED",
            "remarks": "Billed in INV-2024-001",
            "retake_count": 0,
            "sms_token": "sms-tok-66115",
            "invoice_id": "INV-2024-001",
            "pod_image": "TRP-66120_pod.jpg",
            "pod_analysis": {
                "confidence": 0.98,
                "stamp": 1,
                "signature": 1,
                "shortage": 0
            }
        }
    ]

    for t in trips_data:
        cursor.execute("SELECT id FROM trips WHERE id = ?", (t["id"],))
        if not cursor.fetchone():
            cursor.execute("""
            INSERT INTO trips (
                id, client_id, client_name, vehicle_no, is_hired, origin, destination,
                freight_amount, branch, driver_id, driver_name, driver_phone, lr_no,
                eway_bill_no, dispatched_at, delivered_at, pod_status, remarks,
                retake_count, sms_token, invoice_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t["id"], t["client_id"], t["client_name"], t["vehicle_no"], t["is_hired"],
                t["origin"], t["destination"], t["freight_amount"], t["branch"],
                t["driver_id"], t["driver_name"], t["driver_phone"], t["lr_no"],
                t["eway_bill_no"], t["dispatched_at"], t["delivered_at"], t["pod_status"],
                t["remarks"], t["retake_count"], t["sms_token"], t.get("invoice_id"),
                now.isoformat()
            ))

            if t["pod_image"]:
                pod_id = f"POD-{t['id']}"
                analysis = t["pod_analysis"]
                cursor.execute("""
                INSERT INTO pods (
                    id, trip_id, image_filename, file_size_kb, captured_at, gps_lat, gps_lng,
                    gps_accuracy, location_name, is_offline_synced, confidence_score,
                    extracted_lr_no, lr_match, stamp_detected, stamp_confidence,
                    signature_detected, signature_confidence, received_quantity,
                    shortage_damaged, shortage_damage_remarks, extracted_date,
                    ai_raw_response, status, verified_by, verified_at, billing_notes,
                    retake_reason, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pod_id, t["id"], t["pod_image"], 182.5,
                    (now - timedelta(hours=4)).isoformat(),
                    19.8762, 75.3433, 12.0, f"{t['destination']} Delivery Depot", 0,
                    analysis["confidence"], t["lr_no"], 1,
                    analysis["stamp"], 0.92 if analysis["stamp"] else 0.15,
                    analysis["signature"], 0.90 if analysis["signature"] else 0.20,
                    "650 Bags / 32.5 MT" if not analysis["shortage"] else "Short by 6 cartons",
                    analysis["shortage"],
                    t["remarks"] if analysis["shortage"] else "",
                    datetime.now().strftime("%d-%b-%Y"),
                    "{}",
                    t["pod_status"],
                    "AI Automated Engine" if t["pod_status"] == "VERIFIED" else None,
                    now.isoformat() if t["pod_status"] == "VERIFIED" else None,
                    t["remarks"],
                    "Stamp not visible on LR copy" if t["pod_status"] == "RETAKE_REQUESTED" else None,
                    now.isoformat()
                ))

    # Seed Sample Invoice INV-2024-001
    cursor.execute("SELECT id FROM invoices WHERE invoice_no = 'INV-2024-001'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO invoices (
            id, invoice_no, client_id, client_name, billing_cycle,
            total_freight, cgst, sgst, igst, total_amount, status, tally_guid, trip_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "INV-001", "INV-2024-001", "CLI-C-STEEL", "Company C (steel)", "Weekly (Nov W1)",
            26000.0, 1560.0, 1560.0, 0.0, 29120.0, "EXPORTED_TALLY", "TALLY-GUID-789021", 1, now.isoformat()
        ))

    conn.commit()
    conn.close()
    print("Database successfully seeded with realistic Maharashtra transport trips!")

if __name__ == "__main__":
    seed_sample_database()
