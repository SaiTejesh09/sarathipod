import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import datetime
import io
import pandas as pd

def generate_tally_sales_xml(invoices: list[dict], trips_by_invoice: dict[str, list[dict]]) -> str:
    """
    Generates Tally Prime / Tally.ERP 9 compliant XML for Sales Vouchers.
    Maps Freight charges, Ledger names, CGST, SGST, IGST, E-Way Bill, and LR numbers.
    """
    root = ET.Element("ENVELOPE")
    
    header = ET.SubElement(root, "HEADER")
    tally_req = ET.SubElement(header, "TALLYREQUEST")
    tally_req.text = "Import Data"
    
    body = ET.SubElement(root, "BODY")
    import_data = ET.SubElement(body, "IMPORTDATA")
    
    req_desc = ET.SubElement(import_data, "REQUESTDESC")
    report_name = ET.SubElement(req_desc, "REPORTNAME")
    report_name.text = "Vouchers"
    
    req_data = ET.SubElement(import_data, "REQUESTDATA")
    
    for inv in invoices:
        tally_msg = ET.SubElement(req_data, "TALLYMESSAGE")
        tally_msg.set("xmlns:UDF", "TallyUDF")
        
        voucher = ET.SubElement(tally_msg, "VOUCHER")
        voucher.set("VCHTYPE", "Sales")
        voucher.set("ACTION", "Create")
        voucher.set("OBJVIEW", "Invoice Voucher View")
        
        date_str = datetime.now().strftime("%Y%m%d")
        ET.SubElement(voucher, "DATE").text = date_str
        ET.SubElement(voucher, "VOUCHERTYPENAME").text = "Sales"
        ET.SubElement(voucher, "VOUCHERNUMBER").text = inv.get("invoice_no", "INV-001")
        ET.SubElement(voucher, "PARTYLEDGERNAME").text = inv.get("client_name", "Sundry Debtors")
        ET.SubElement(voucher, "BASICBUYERNAME").text = inv.get("client_name", "Sundry Debtors")
        ET.SubElement(voucher, "NARRATION").text = f"Freight charges for {inv.get('trip_count', 1)} verified POD trips. Cycle: {inv.get('billing_cycle', 'Weekly')}."
        
        # Debtor Entry (Positive Amount)
        debtor_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(debtor_entry, "LEDGERNAME").text = inv.get("client_name", "Sundry Debtors")
        ET.SubElement(debtor_entry, "ISDEEMEDPOSITIVE").text = "Yes"
        ET.SubElement(debtor_entry, "AMOUNT").text = f"-{inv.get('total_amount', 0.0):.2f}"
        
        # Freight Income Ledger (Negative Amount in Tally double-entry)
        freight_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(freight_entry, "LEDGERNAME").text = "Freight Income Account"
        ET.SubElement(freight_entry, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(freight_entry, "AMOUNT").text = f"{inv.get('total_freight', 0.0):.2f}"
        
        # GST Entries
        cgst = inv.get("cgst", 0.0)
        sgst = inv.get("sgst", 0.0)
        igst = inv.get("igst", 0.0)
        
        if cgst > 0:
            cgst_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(cgst_entry, "LEDGERNAME").text = "Output CGST @ 6%"
            ET.SubElement(cgst_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(cgst_entry, "AMOUNT").text = f"{cgst:.2f}"
            
        if sgst > 0:
            sgst_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(sgst_entry, "LEDGERNAME").text = "Output SGST @ 6%"
            ET.SubElement(sgst_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(sgst_entry, "AMOUNT").text = f"{sgst:.2f}"
            
        if igst > 0:
            igst_entry = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(igst_entry, "LEDGERNAME").text = "Output IGST @ 12%"
            ET.SubElement(igst_entry, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(igst_entry, "AMOUNT").text = f"{igst:.2f}"
            
        # Attach trip references / LR details in UDF (User Defined Fields)
        trips = trips_by_invoice.get(inv["id"], [])
        for trip in trips:
            lr_entry = ET.SubElement(voucher, "UDF:LRDETAILS.LIST")
            ET.SubElement(lr_entry, "UDF:LRNUMBER").text = trip.get("lr_no", "")
            ET.SubElement(lr_entry, "UDF:VEHICLENO").text = trip.get("vehicle_no", "")
            ET.SubElement(lr_entry, "UDF:EWAYBILL").text = trip.get("eway_bill_no", "")
            ET.SubElement(lr_entry, "UDF:DESTINATION").text = trip.get("destination", "")
            ET.SubElement(lr_entry, "UDF:TRIPFREIGHT").text = f"{trip.get('freight_amount', 0):.2f}"

    raw_xml = ET.tostring(root, encoding="utf-8")
    parsed = minidom.parseString(raw_xml)
    return parsed.toprettyxml(indent="  ")

def generate_billing_excel(invoices: list[dict], trips: list[dict]) -> bytes:
    """
    Generates an Excel workbook with Summary and Trip Breakdown sheets for billing reconciliation.
    """
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df_inv = pd.DataFrame(invoices)
        df_inv.to_excel(writer, sheet_name="Invoices Summary", index=False)
        
        df_trips = pd.DataFrame(trips)
        df_trips.to_excel(writer, sheet_name="Trip Details & LRs", index=False)
        
    return output.getvalue()

