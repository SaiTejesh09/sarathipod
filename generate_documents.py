import os
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

DOCS_DIR = Path(__file__).resolve().parent / "docs"
DOCS_DIR.mkdir(parents=True, exist_ok=True)

def generate_docx():
    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.85)
        section.right_margin = Inches(0.85)

    # Title
    p_title = doc.add_paragraph()
    run_title = p_title.add_run("TECHNICAL DESIGN DOCUMENT (TDD)")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p_sub = doc.add_paragraph()
    run_sub = p_sub.add_run("SarathiPOD: AI-Powered Proof of Delivery & Accelerated Billing Platform")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(2, 132, 199)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

    p_meta = doc.add_paragraph()
    r_meta = p_meta.add_run("Client: Company A Logistics (Pvt Ltd), MIDC Waluj, Chhatrapati Sambhajinagar, Maharashtra\n"
                           "GitHub: https://github.com/SaiTejesh09/sarathipod\n"
                           "Live App: https://sarathipod-production.up.railway.app | Version: 1.0.0 (Production Release)")
    r_meta.font.size = Pt(9.5)
    r_meta.font.color.rgb = RGBColor(100, 116, 139)
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph("―" * 55).alignment = WD_ALIGN_PARAGRAPH.CENTER

    def add_sec_heading(title):
        h = doc.add_paragraph()
        r = h.add_run(title)
        r.font.name = 'Arial'
        r.font.size = Pt(14)
        r.font.bold = True
        r.font.color.rgb = RGBColor(15, 23, 42)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)

    def add_sub_heading(title):
        h = doc.add_paragraph()
        r = h.add_run(title)
        r.font.name = 'Arial'
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = RGBColor(2, 132, 199)
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)

    def add_body_text(text):
        p = doc.add_paragraph()
        r = p.add_run(text)
        r.font.name = 'Calibri'
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(51, 65, 85)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        return p

    # Section 1
    add_sec_heading("1. Executive Summary & Problem Formulation")
    add_body_text("Company A is a leading full-truckload (FTL) transporter operating from Chhatrapati Sambhajinagar (Aurangabad), Maharashtra. The firm moves heavy industrial bulk freight—principally cement, steel, and packaged foods—across long-haul inter-state corridors spanning 800+ km (Nagpur, Pune, Indore, Raipur, Hyderabad).")
    add_body_text("• Fleet Strength: 140 company-owned multi-axle trucks + ~200 hired market trucks.\n"
                  "• Annual Turnover: ₹75–90 Crore (modeled at ₹84.48 Crore/year).\n"
                  "• Trip Volume: ~2,200 trips per month (26,400 trips per year) at ₹32,000 average freight.")

    add_sub_heading("Quantified Financial Drain (From Brief)")
    add_body_text("1. Working Capital Delay: Cutting POD-to-invoice from 18 days to 4 days accelerates billing by 14 days, unlocking ₹3.24 Crore of trapped working capital (₹84.48 Cr × 14 / 365). At 12% working capital borrowing interest, this delivers ₹38.9 Lakh/year in pure interest savings.\n"
                  "2. Lost & Disputed POD Penalty: 1.5% of trips (396 trips/year) lose physical paper PODs, incurring a 50% freight deduction: 396 × ₹16,000 = ₹63.36 Lakh/year.\n"
                  "3. Total Annual Value: ₹38.9 Lakh + ₹63.36 Lakh = ₹1.02 Crore/year.\n"
                  "4. Budget & ROI: Project budget ₹7.5 Lakh yields a full capital payback in just 27 Days (under 1 month)!")

    add_sub_heading("Assumptions Register (Labeled as per submission rules)")
    add_body_text("[ASSUMPTION-01: Connectivity Dead Zones] Drivers operate across highway dead zones. Offline-first capture in IndexedDB and client-side canvas compression under 300 KB are mandatory.\n"
                  "[ASSUMPTION-02: Low-Literacy Drivers] Drivers require big visual buttons, green/amber status colors, Marathi/Hindi audio voice prompts, and zero form typing.\n"
                  "[ASSUMPTION-03: Hired Driver Reluctance] 200 hired market drivers will not install an app; an instant zero-install SMS upload link (/p/:token) is provided.\n"
                  "[ASSUMPTION-04: DPDP Act 2023] Consignee names, gate signatures, and driver phone numbers are masked in audit logs and client portal views.\n"
                  "[ASSUMPTION-05: Tally Integration] Freight billing in Tally Prime requires standard XML sales vouchers with User Defined Fields (UDF) for LR and Vehicle references.")

    # Section 2
    add_sec_heading("2. System Architecture & Tech Selection")
    add_body_text("• Frontend: React 18 + Vite + Tailwind CSS. Fast, responsive, lightweight (gzip 66 KB).\n"
                  "• Audio Prompts: Web Speech Synthesis API with Marathi (mr-IN) and Hindi (hi-IN) regional voice prompts.\n"
                  "• Edge Compression: HTML5 Canvas 2D engine resizes and iteratively encodes photos strictly under 300 KB.\n"
                  "• Offline Sync: IndexedDB stores captures locally during highway disconnects and auto-syncs when online.\n"
                  "• Backend: Python 3.11 + FastAPI with asynchronous endpoints, Pydantic type validation, and SQLite persistence.\n"
                  "• Document Processing: Pillow (PIL) for stamp color clustering, signature density, and GPS watermarking; ReportLab for 2-page Tax Invoices with embedded PODs.\n"
                  "• Accounting: Tally Prime compliant XML generator.")

    # Section 3
    add_sec_heading("3. AI Verification Engine & Retake Logic")
    add_body_text("1. Consignee Stamp Detection: Scans color saturation ratios for violet/blue ink pads typical of Indian industrial receiving depots. Threshold ratio >= 0.001 confirms seal presence.\n"
                  "2. Consignee Signature Detection: Evaluates edge density gradients in the lower 35% of the document. Stroke density > 3.0 confirms handwriting presence.\n"
                  "3. LR Number Match: Validates extracted document tokens against expected trip LR.\n"
                  "4. Shortage & Damage NLP: Multilingual scanner checks for shortage keywords ('short by 6 cartons', 'कम मिला', 'तूट'). Any discrepancy immediately routes to NEEDS_REVIEW for human billing executive assessment.\n"
                  "5. Retake Capping: Drivers are allowed at most 2 retakes. If defects persist after 2 attempts, the POD automatically routes to human review.")

    # Section 4
    add_sec_heading("4. Billing Review Queue & Tally Export")
    add_body_text("• Split-Screen Review: High-res zoomable POD image on the left; AI findings and editable override fields on the right.\n"
                  "• Batch Invoicing: Groups verified trips by Client (Company B Cement, Company C Steel, Company D Foods) and billing cycle.\n"
                  "• Tally Prime XML Export: Fully formed Sales Voucher XML with Freight Income, CGST 6%, SGST 6%, and LR UDFs.\n"
                  "• Tax Invoice PDF: Professional 2-page PDF including client tax breakdown on Page 1 and certified watermarked POD on Page 2.")

    # Section 5
    add_sec_heading("5. Scope Decisions & Future Roadmap")
    add_body_text("• Cut Scope (As per Brief): Live GPS breadcrumb tracking, route planning, driver fuel accounting.\n"
                  "• Next Steps: WhatsApp Cloud API bot for hired drivers, direct Tally ODBC Windows sync service, edge TensorRT on in-cab tablets.")

    # Section 6
    add_sec_heading("6. Automated Test Suite")
    add_body_text("9 comprehensive unit and integration tests passing in 4.92s:\n"
                  "1. test_ai_verifier_verified_flow (Clean pass)\n"
                  "2. test_ai_verifier_retake_on_missing_stamp (Retake triggered, Marathi prompt verified)\n"
                  "3. test_ai_verifier_capped_at_two_retakes (Capped at 2 retakes, routed to review)\n"
                  "4. test_ai_verifier_shortage_remark_routing (Shortage by 6 cartons routed to review)\n"
                  "5. test_watermark_and_compression (Image watermarked and compressed <300 KB)\n"
                  "6. test_tally_sales_xml_schema (Valid Tally Sales Voucher XML)\n"
                  "7. test_invoice_pdf_with_pod (2-page Tax Invoice PDF generated)\n"
                  "8. test_api_trips_list (API list trips verified)\n"
                  "9. test_api_dashboard_stats (Financial ROI calculations verified)")

    docx_path = DOCS_DIR / "Technical_Design_Document.docx"
    doc.save(str(docx_path))
    print(f"Generated Word document: {docx_path}")
    return docx_path

def generate_pdf():
    pdf_path = DOCS_DIR / "Technical_Design_Document.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        alignment=1, # Center
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Heading2'],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0284c7"),
        alignment=1,
        spaceAfter=6
    )
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
        spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading2'],
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=4,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading3'],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#0284c7"),
        spaceBefore=8,
        spaceAfter=2,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=4
    )
    box_style = ParagraphStyle(
        'BoxText',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )

    # Title & Metadata
    story.append(Paragraph("<b>TECHNICAL DESIGN DOCUMENT (TDD)</b>", title_style))
    story.append(Paragraph("SarathiPOD: AI-Powered Proof of Delivery & Accelerated Billing Platform", subtitle_style))
    story.append(Paragraph("<b>GitHub:</b> https://github.com/SaiTejesh09/sarathipod | <b>Live App:</b> https://sarathipod-production.up.railway.app<br/>"
                           "<b>Client:</b> Company A Logistics (Pvt Ltd), MIDC Waluj, Chhatrapati Sambhajinagar, Maharashtra | <b>Version:</b> 1.0.0", meta_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=10))

    # Section 1
    story.append(Paragraph("<b>1. Executive Summary & Problem Formulation</b>", h1_style))
    story.append(Paragraph(
        "Company A is a full-truckload (FTL) transporter operating from Chhatrapati Sambhajinagar, Maharashtra, moving cement, steel, and packaged foods across long-haul inter-state corridors spanning 800+ km (Nagpur, Pune, Indore, Raipur, Hyderabad). "
        "Fleet: 140 own trucks + ~200 hired market trucks; 210 staff; annual revenue ₹75–90 Crore (modeled at ₹84.48 Cr/year across 2,200 trips/month at ₹32,000 average freight).",
        body_style
    ))

    # Callout Box: ROI Calculation
    roi_data = [
        [
            Paragraph(
                "<b>Quantified Business ROI & Annual Value (Calculated directly from Brief):</b><br/>"
                "• <b>Trapped Working Capital:</b> Cutting POD-to-invoice from 18 days to 4 days brings billing 14 days forward: "
                "<b>₹84.48 Cr × 14 / 365 = ₹3.24 Crore</b> of working capital unlocked.<br/>"
                "• <b>Interest Savings:</b> At 12% p.a. bank borrowing rate, saves <b>₹38.9 Lakh / year</b> in interest.<br/>"
                "• <b>Disputed Freight Saved:</b> 1.5% of trips (396 trips/yr) lose PODs, causing 50% freight deduction (396 × ₹16,000 = <b>₹63.36 Lakh / year</b>).<br/>"
                "• <b>Total Annual Value:</b> ₹38.9 Lakh + ₹63.36 Lakh = <b>₹1.02 Crore / year</b>.<br/>"
                "• <b>Budget & Payback:</b> Project budget ₹7.5 Lakh pays back in <b>27 Days (under 1 month!)</b>.",
                box_style
            )
        ]
    ]
    t_roi = Table(roi_data, colWidths=[530])
    t_roi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_roi)
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>Assumptions Register (Labeled as per submission rules):</b>", h2_style))
    story.append(Paragraph("• <b>[ASSUMPTION-01: Dead Zones]</b> Highway corridors have dead zones; capture operates offline in IndexedDB with client-side canvas compression &lt;300 KB.<br/>"
                           "• <b>[ASSUMPTION-02: Low-Literacy Drivers]</b> UI features 1 big button, no typing, and voice guidance in Marathi (mr-IN) and Hindi (hi-IN).<br/>"
                           "• <b>[ASSUMPTION-03: Hired Drivers]</b> 200 hired market drivers will not install an app; zero-install SMS upload link (/p/:token) provided.<br/>"
                           "• <b>[ASSUMPTION-04: DPDP Act 2023]</b> Consignee names, signatures, and driver phone numbers are masked in audit logs and client views.<br/>"
                           "• <b>[ASSUMPTION-05: Tally Accounting]</b> Billing requires Tally Prime Sales Voucher XML with User Defined Fields (UDF) for LR and Vehicle.", body_style))

    # Section 2
    story.append(Paragraph("<b>2. Architecture & Technology Rationale</b>", h1_style))
    story.append(Paragraph(
        "• <b>Frontend:</b> React 18 + Vite + Tailwind CSS. Fast, responsive, mobile-first design, gzip 66 KB bundle.<br/>"
        "• <b>Regional Audio:</b> Native Web Speech Synthesis with Marathi and Hindi audio guidance and pleasant audio chimes.<br/>"
        "• <b>Edge Compression:</b> HTML5 Canvas API resizes camera photos iteratively until file size is strictly under 300 KB.<br/>"
        "• <b>Offline Storage:</b> IndexedDB queue captures PODs offline and flushes automatically when 4G resumes.<br/>"
        "• <b>Backend:</b> Python 3.11 + FastAPI with asynchronous request handling and Pydantic validation.<br/>"
        "• <b>Document Processing:</b> Pillow for stamp ink clustering, signature edge density, and GPS watermarking; ReportLab for 2-page Tax Invoices.",
        body_style
    ))

    # Section 3
    story.append(Paragraph("<b>3. AI POD Verification Pipeline & Retake Logic</b>", h1_style))
    story.append(Paragraph(
        "• <b>Stamp Detection:</b> Samples blue/violet rubber stamp ink saturation in receiving godowns. Ratio &gt;= 0.001 confirms seal presence.<br/>"
        "• <b>Signature Detection:</b> Evaluates edge density gradients in bottom 35% of LR receipt. Stroke density &gt; 3.0 confirms receiver signature.<br/>"
        "• <b>LR Number Match:</b> Validates OCR text against expected trip LR.<br/>"
        "• <b>Shortage/Damage NLP:</b> Multilingual keyword scanner checks for 'short by 6 cartons', 'कम मिला', 'तूट'. Discrepancies immediately route to NEEDS_REVIEW.<br/>"
        "• <b>Retake Capping:</b> Drivers get at most 2 retakes. Subsequent defects route to human review queue with image as source of truth.",
        body_style
    ))

    # Section 4
    story.append(Paragraph("<b>4. Billing Queue & Tally Prime Export</b>", h1_style))
    story.append(Paragraph(
        "• <b>Review Queue:</b> Split-screen comparison with interactive document zoom on left and AI overrides on right.<br/>"
        "• <b>Batch Invoicing:</b> Groups verified trips by Client and cycle, producing consolidated invoices.<br/>"
        "• <b>Tally XML Export:</b> Exports valid Tally Sales Vouchers XML with Freight Income, CGST 6%, SGST 6%, and LR UDFs.<br/>"
        "• <b>Tax Invoice PDF:</b> 2-page formal Tax Invoice with client details on Page 1 and certified watermarked POD on Page 2.",
        body_style
    ))

    # Section 5
    story.append(Paragraph("<b>5. Scope Boundaries & Roadmap</b>", h1_style))
    story.append(Paragraph(
        "• <b>Cut Scope (Out of Scope):</b> Live GPS tracking, trip route planning, driver fuel accounting.<br/>"
        "• <b>Future Roadmap:</b> WhatsApp Cloud API bot for hired drivers, live Tally ODBC Windows daemon, edge TensorRT on rugged tablets.",
        body_style
    ))

    # Section 6
    story.append(Paragraph("<b>6. Verification & Test Suite</b>", h1_style))
    story.append(Paragraph("<b>All 9 automated unit and integration tests passing in 4.92s:</b> AI verified pass, retake on missing stamp, retake capping at 2, shortage remark routing, image compression &lt;300 KB, Tally XML schema, Tax Invoice PDF with POD, API trips list, and Dashboard economics math.", body_style))

    doc.build(story)
    print(f"Generated PDF document: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    docx_file = generate_docx()
    pdf_file = generate_pdf()
    print("Documentation generation complete!")

