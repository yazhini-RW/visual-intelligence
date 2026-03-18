from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from database.models import AnalysisLog

router = APIRouter()

@router.get("/analytics/stats")
def get_stats(db: Session = Depends(get_db)):
    total_analyses = db.query(AnalysisLog).count()
    avg_processing = db.query(func.avg(AnalysisLog.processing_time)).scalar()

    all_logs = db.query(AnalysisLog).all()
    object_counts = {}
    for log in all_logs:
        if log.objects_detected:
            for det in log.objects_detected:
                if "label" in det:
                    label = det["label"]
                    object_counts[label] = object_counts.get(label, 0) + 1

    return {
        "total_analyses": total_analyses,
        "avg_processing_time": round(avg_processing or 0, 2),
        "top_objects": dict(
            sorted(object_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        )
    }

@router.get("/analytics/recent")
def get_recent(db: Session = Depends(get_db)):
    logs = db.query(AnalysisLog).order_by(
        AnalysisLog.created_at.desc()
    ).limit(20).all()

    return [
        {
            "id": log.id,
            "filename": log.filename,
            "detection_count": len(log.objects_detected) if log.objects_detected else 0,
            "scene_description": log.scene_description,
            "processing_time": log.processing_time,
            "created_at": str(log.created_at)
        }
        for log in logs
    ]