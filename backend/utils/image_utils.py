import cv2
import numpy as np
from PIL import Image
import base64
import io
import os

def read_image(file_path: str):
    image = cv2.imread(file_path)
    return image

def image_to_base64(file_path: str) -> str:
    with open(file_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def save_uploaded_image(file_bytes: bytes, filename: str, upload_dir: str) -> str:
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    return file_path

def draw_bounding_boxes(image_path: str, detections: list) -> str:
    image = cv2.imread(image_path)

    for det in detections:
        x1, y1, x2, y2 = int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])
        label = det["label"]
        confidence = det["confidence"]

        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            image,
            f"{label} {confidence:.0%}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    base = os.path.basename(image_path)
    name, ext = os.path.splitext(base)
    output_filename = f"{name}_annotated{ext}"
    output_path = os.path.join(os.path.dirname(image_path), output_filename)
    cv2.imwrite(output_path, image)
    return output_path
    image = cv2.imread(image_path)
    
    for det in detections:
        x1, y1, x2, y2 = int(det["x1"]), int(det["y1"]), int(det["x2"]), int(det["y2"])
        label = det["label"]
        confidence = det["confidence"]
        
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            image,
            f"{label} {confidence:.0%}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )
    
    output_path = image_path.replace(".", "_annotated.")
    cv2.imwrite(output_path, image)
    return output_path

def resize_image(image_path: str, max_size: int = 800) -> str:
    img = Image.open(image_path)
    img.thumbnail((max_size, max_size))
    img.save(image_path)
    return image_path