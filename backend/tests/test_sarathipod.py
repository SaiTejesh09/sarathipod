import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import UPLOAD_DIR
from app.ai_verifier import verify_pod_document, watermark_and_optimize_image
from app.tally_export import generate_tally_sales_xml
from app.invoice_service import generate_invoice_with_pod_pdf
from app.seed_data import create_synthetic_pod_image

client = TestClient(app)

@pytest.fixture(scope="module")
def sample_test_images():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    img_clean = create_synthetic_pod_image(
        "test_clean.jpg", "TRP-TEST-01", "LR-1001", "MH20 AA 1111",
        "Company B (Cement)", "Nagpur", has_stamp=True, has_signature=True
    )
    img_nostamp = create_synthetic_pod_image(
        "test_nostamp.jpg", "TRP-TEST-02", "LR-1002", "MH20 BB 2222",
        "Company C (Steel)", "Pune", has_stamp=False, has_signature=True
    )
    img_shortage = create_synthetic_pod_image(
        "test_shortage.jpg", "TRP-TEST-03", "LR-1003", "MH17 CC 3333",
        "Company D (Packaged Foods)", "Indore", has_stamp=True, has_signature=True,
        has_shortage=True, shortage_text="Short by 6 cartons"
    )
    return {
        "clean": img_clean,
        "nostamp": img_nostamp,
        "shortage": img_shortage
    }

def test_ai_verifier_verified_flow(sample_test_images):
    res = verify_pod_document(
        image_path=sample_test_images["clean"],
        expected_lr_no="LR-1001",
        current_retakes=0
    )
    assert res.status == "VERIFIED"
    assert res.confidence_score >= 0.85
    assert res.stamp_detected is True
    assert res.signature_detected is True
    assert res.shortage_damaged is False

def test_ai_verifier_retake_on_missing_stamp(sample_test_images):
    res = verify_pod_document(
        image_path=sample_test_images["nostamp"],
        expected_lr_no="LR-1002",
        current_retakes=0,
        filename_hint="no_stamp"
    )
    assert res.status == "RETAKE_REQUESTED"
    assert "stamp" in res.retake_reason.lower()
    assert "शिक्का" in res.retake_prompt_marathi
    assert "मोहर" in res.retake_prompt_hindi

def test_ai_verifier_capped_at_two_retakes(sample_test_images):
    # When already retaken 2 times (current_retakes=2), a defect should route to NEEDS_REVIEW
    res = verify_pod_document(
        image_path=sample_test_images["nostamp"],
        expected_lr_no="LR-1002",
        current_retakes=2,
        filename_hint="no_stamp"
    )
    assert res.status == "NEEDS_REVIEW"
    assert "maximum retakes" in res.retake_reason.lower()

def test_ai_verifier_shortage_remark_routing(sample_test_images):
    # Shortage remarks must ALWAYS route to human billing review
    res = verify_pod_document(
        image_path=sample_test_images["shortage"],
        expected_lr_no="LR-1003",
        driver_remarks_input="Short by 6 cartons",
        filename_hint="shortage"
    )
    assert res.status == "NEEDS_REVIEW"
    assert res.shortage_damaged is True
    assert "short by 6" in res.shortage_damage_remarks.lower()

def test_watermark_and_compression(sample_test_images):
    opt_path, size_kb = watermark_and_optimize_image(
        sample_test_images["clean"],
        gps_lat=19.8762,
        gps_lng=75.3433,
        gps_accuracy=8.5,
        trip_id="TRP-TEST-01"
    )
    assert os.path.exists(opt_path)
    assert size_kb < 300.0  # Constraint from problem statement: under 300 KB

def test_tally_sales_xml_schema():
    invoices = [{
        "id": "INV-TEST",
        "invoice_no": "INV-2024-TEST",
        "client_name": "Company B (Cement)",
        "total_freight": 38500.0,
        "cgst": 2310.0,
        "sgst": 2310.0,
        "igst": 0.0,
        "total_amount": 43120.0,
        "billing_cycle": "Weekly"
    }]
    trips_by_inv = {
        "INV-TEST": [{
            "lr_no": "LR-45901",
            "vehicle_no": "MH20 EL 4521",
            "eway_bill_no": "241098451290",
            "destination": "Nagpur",
            "freight_amount": 38500.0
        }]
    }
    xml_str = generate_tally_sales_xml(invoices, trips_by_inv)
    assert "<ENVELOPE>" in xml_str
    assert 'VCHTYPE="Sales"' in xml_str
    assert 'ACTION="Create"' in xml_str
    assert "Freight Income Account" in xml_str
    assert "Output CGST @ 6%" in xml_str
    assert "LR-45901" in xml_str
    assert "MH20 EL 4521" in xml_str

def test_invoice_pdf_with_pod():
    inv_data = {
        "invoice_no": "INV-TEST-PDF",
        "client_name": "Company B (cement)",
        "billing_cycle": "Weekly",
        "total_freight": 38500.0,
        "cgst": 2310.0,
        "sgst": 2310.0,
        "igst": 0.0,
        "total_amount": 43120.0
    }
    trips = [{
        "id": "TRP-66120",
        "lr_no": "LR-45901",
        "vehicle_no": "MH20 EL 4521",
        "destination": "Nagpur",
        "eway_bill_no": "241098451290",
        "freight_amount": 38500.0
    }]
    pdf_path = generate_invoice_with_pod_pdf(inv_data, trips)
    assert os.path.exists(pdf_path)
    assert os.path.getsize(pdf_path) > 1000

def test_api_trips_list():
    response = client.get("/api/trips")
    assert response.status_code == 200
    data = response.json()
    assert "trips" in data
    assert len(data["trips"]) >= 3

def test_api_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "economics" in data
    assert data["economics"]["working_capital_freed_cr"] == 3.24
    assert data["economics"]["total_annual_value_cr"] == 1.02
    assert "aging_buckets" in data
    assert "branch_stats" in data
