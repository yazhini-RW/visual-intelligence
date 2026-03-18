from ultralytics import YOLO
import os

model = None

def load_model():
    global model
    if model is None:
        model = YOLO("yolov8n.pt")
    return model
# lazy loading
def detect_objects(image_path: str) -> list:
    try:
        yolo = load_model()
        results = yolo(image_path)
        
# Runs the YOLO model on the image
        
        detections = [] 
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                label = result.names[class_id]
                
                if confidence > 0.3:
                    detections.append({
                        "label": label,
                        "confidence": round(confidence, 2),
                        "x1": round(x1),
                        "y1": round(y1),
                        "x2": round(x2),
                        "y2": round(y2)
                    })
        
        return detections
    except Exception as e:
        return [{"error": str(e)}]