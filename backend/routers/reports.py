from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import AnalysisLog
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import os
import uuid

router = APIRouter()
REPORTS_DIR = "uploads/reports"

@router.post("/reports/generate/{analysis_id}")
def generate_report(analysis_id: int, db: Session = Depends(get_db)):
    log = db.query(AnalysisLog).filter(AnalysisLog.id == analysis_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Analysis not found")

    os.makedirs(REPORTS_DIR, exist_ok=True)
    report_filename = f"report_{uuid.uuid4()}.pdf"
    report_path = os.path.join(REPORTS_DIR, report_filename)

    doc = SimpleDocTemplate(report_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Visual Intelligence Analysis Report", styles["Title"]))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(f"File: {log.filename}", styles["Normal"]))
    story.append(Paragraph(f"Analysed at: {log.created_at}", styles["Normal"]))
    story.append(Paragraph(f"Processing time: {log.processing_time}s", styles["Normal"]))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Scene Description", styles["Heading2"]))
    story.append(Paragraph(log.scene_description or "N/A", styles["Normal"]))
    story.append(Spacer(1, 0.2 * inch))

    story.append(Paragraph("Objects Detected", styles["Heading2"]))
    if log.objects_detected:
        table_data = [["Object", "Confidence"]]
        for det in log.objects_detected:
            if "label" in det:
                table_data.append([det["label"], f"{det['confidence']:.0%}"])
        table = Table(table_data, colWidths=[3 * inch, 2 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        story.append(table)
    else:
        story.append(Paragraph("No objects detected", styles["Normal"]))

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("OCR — Text Extracted", styles["Heading2"]))
    story.append(Paragraph(log.ocr_text or "No text found", styles["Normal"]))

    doc.build(story)

    return {
        "success": True,
        "report_filename": report_filename,
        "download_url": f"/api/reports/download/{report_filename}"
    }

@router.get("/reports/download/{filename}")
def download_report(filename: str):
    report_path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=filename
    )