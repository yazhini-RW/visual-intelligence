from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import AnalysisLog
from ai.detector import detect_objects
from ai.ocr import extract_text
from ai.scene import describe_scene
from utils.image_utils import draw_bounding_boxes, resize_image
from dotenv import load_dotenv
import time
import os
import uuid

load_dotenv()

router = APIRouter()
UPLOAD_DIR = os.path.join("uploads", "images")

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    start_time = time.time()

    try:
        ext = file.filename.split(".")[-1].lower()
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            ext = "jpg"
        unique_name = f"{uuid.uuid4()}.{ext}"
        file_bytes = await file.read()

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        image_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(image_path, "wb") as f:
            f.write(file_bytes)

        print(f"✅ Image saved to: {image_path}")
        resize_image(image_path)
        # Runs all 3 AI models in sequence — YOLO for objects, EasyOCR for text, Groq for scene description.  
        # draw_bounding_boxes uses OpenCV to draw green rectangles       
        detections = detect_objects(image_path)
        ocr_result = extract_text(image_path)
        scene_desc = describe_scene(image_path, detections, ocr_result["full_text"])

        annotated_path = draw_bounding_boxes(image_path, detections)

       
        annotated_filename = os.path.basename(annotated_path)
        print(f"✅ Annotated image saved to: {annotated_path}")

        processing_time = round(time.time() - start_time, 2)

        log = AnalysisLog(
            filename=file.filename,
            image_path=image_path,
            objects_detected=detections,
            ocr_text=ocr_result["full_text"],
            scene_description=scene_desc,
            confidence_score=round(
                sum(d["confidence"] for d in detections if "confidence" in d) /
                max(len(detections), 1), 2
            ),
            processing_time=processing_time
        )
        db.add(log)
        db.commit()

        return {
            "success": True,
            "filename": file.filename,
            "annotated_image": annotated_filename,
            "processing_time": processing_time,
            "detections": detections,
            "detection_count": len(detections),
            "ocr": ocr_result,
            "scene_description": scene_desc,
            "analysis_id": log.id
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))