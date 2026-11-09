import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime

def generate_invoice_with_pod_pdf(invoice_data: dict, trips: list[dict], pod_image_path: str = None) -> str:
    """
    Generates a professional 2-page Tax Invoice PDF:
    Page 1: Tax Invoice breakdown with LR, e-way bill, vehicle, taxes.
    Page 2: Certified Proof of Delivery (POD) document image with GPS stamp.
    """
    pdf_filename = f"Invoice_{invoice_data['invoice_no']}.pdf"
    output_dir = os.path.dirname(os.path.abspath(__file__)) + "/../uploads"
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    story = []

    # Title & Header
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'HeaderSub',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#475569")
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e293b")
    )

    # Header section
    story.append(Paragraph("<b>COMPANY A LOGISTICS (PVT LTD)</b>", title_style))
    story.append(Paragraph("MIDC Waluj Industrial Area, Chhatrapati Sambhajinagar, Maharashtra - 431136", subtitle_style))
    story.append(Paragraph("GSTIN: 27AABCC1234F1Z8 | Contact: operations@companya-logistics.in | PAN: AABCC1234F", subtitle_style))
    story.append(Spacer(1, 15))

    # Invoice Meta Bar
    meta_data = [
        [
            Paragraph(f"<b>TAX INVOICE</b><br/>Invoice No: <b>{invoice_data['invoice_no']}</b><br/>Date: {datetime.now().strftime('%d-%b-%Y')}<br/>Cycle: {invoice_data.get('billing_cycle', 'Weekly')}", meta_style),
            Paragraph(f"<b>BILLED TO:</b><br/><b>{invoice_data['client_name']}</b><br/>GSTIN: 27AAACZ9988D1Z2<br/>State: Maharashtra (Code 27)", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # Trips Table
    trip_rows = [
        ["#", "Trip ID", "LR No", "Vehicle No", "Destination", "E-Way Bill", "Freight (₹)"]
    ]
    for idx, t in enumerate(trips, 1):
        trip_rows.append([
            str(idx),
            t.get("id", ""),
            t.get("lr_no", ""),
            t.get("vehicle_no", ""),
            t.get("destination", ""),
            t.get("eway_bill_no", ""),
            f"₹ {t.get('freight_amount', 0):,.2f}"
        ])

    table_style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8.5),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")])
    ])
    trips_table = Table(trip_rows, colWidths=[25, 75, 70, 80, 80, 110, 100])
    trips_table.setStyle(table_style)
    story.append(trips_table)
    story.append(Spacer(1, 15))

    # Totals Summary Table
    total_freight = invoice_data.get("total_freight", 0.0)
    cgst = invoice_data.get("cgst", 0.0)
    sgst = invoice_data.get("sgst", 0.0)
    igst = invoice_data.get("igst", 0.0)
    grand_total = invoice_data.get("total_amount", total_freight + cgst + sgst + igst)

    summary_rows = [
        ["Subtotal Freight Charges:", f"₹ {total_freight:,.2f}"],
        ["CGST @ 6%:", f"₹ {cgst:,.2f}"],
        ["SGST @ 6%:", f"₹ {sgst:,.2f}"],
        ["Total Payable (INR):", f"₹ {grand_total:,.2f}"]
    ]
    if igst > 0:
        summary_rows = [
            ["Subtotal Freight Charges:", f"₹ {total_freight:,.2f}"],
            ["IGST @ 12%:", f"₹ {igst:,.2f}"],
            ["Total Payable (INR):", f"₹ {grand_total:,.2f}"]
        ]

    summary_table = Table(summary_rows, colWidths=[380, 160])
    summary_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'RIGHT'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('LINEABOVE', (0,-1), (-1,-1), 1, colors.HexColor("#0f172a")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 25))

    # Bank Details & Signatory
    footer_text = Paragraph(
        "<b>Payment Terms:</b> Immediate upon receipt. Bank Details: State Bank of India, Waluj Branch, "
        "A/C: 38920192837, IFSC: SBIN0004123.<br/>"
        "<i>This is a computer-generated tax invoice verified with AI Proof of Delivery.</i>",
        subtitle_style
    )
    story.append(footer_text)

    # PAGE 2: Attached Certified Proof of Delivery
    if pod_image_path and os.path.exists(pod_image_path):
        story.append(PageBreak())
        story.append(Paragraph("<b>APPENDIX: VERIFIED PROOF OF DELIVERY (POD)</b>", title_style))
        story.append(Paragraph(
            f"Trip ID: <b>{trips[0].get('id', '')}</b> | LR No: <b>{trips[0].get('lr_no', '')}</b> | "
            f"Vehicle: <b>{trips[0].get('vehicle_no', '')}</b> | Consignee Delivery Confirmed",
            meta_style
        ))
        story.append(Spacer(1, 10))

        # Embed Image (scaled to fit)
        try:
            pod_img = RLImage(pod_image_path, width=6.5*inch, height=7.5*inch)
            story.append(pod_img)
        except Exception as e:
            story.append(Paragraph(f"Could not render image: {e}", meta_style))

    doc.build(story)
    return pdf_path

