from ast import pattern

import easyocr
import cv2
import numpy as np
import os

reader = None

def load_reader():
    global reader
    if reader is None:
        print("🔄 Loading EasyOCR reader...")
        reader = easyocr.Reader(['en'], gpu=False)
        print("✅ EasyOCR reader loaded")
    return reader

# Same lazy loading pattern as YOLO. Creates an EasyOCR reader for English only. gpu=False means it runs on CPU — slower but works without a GPU.

def extract_text(image_path: str) -> dict:
    try:
        print(f"🔍 Starting OCR on: {image_path}")
        ocr = load_reader()

        image = cv2.imread(image_path)
        if image is None:
            print(f"❌ Could not read image: {image_path}")
            return {"full_text": "", "words": [], "word_count": 0}

        # Pass RGB numpy array directly — never a file path
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        print(f"📐 Image shape: {rgb_image.shape}")

        results = ocr.readtext(rgb_image, detail=1, paragraph=False)
        print(f"📊 Raw OCR results count: {len(results)}")
   
        for i, (bbox, text, conf) in enumerate(results):
            print(f"  [{i}] text='{text}' confidence={conf:.2f}")

        extracted = []
        full_text = ""

        for (bbox, text, confidence) in results:
            if confidence > 0.05 and len(text.strip()) > 0:
                extracted.append({
                    "text": text.strip(),
                    "confidence": round(confidence, 2)
                })
                full_text += text.strip() + " "
        # readtext returns a list of tuples: (bbox, text, confidence). bbox is the bounding box of the detected text, text is the recognized string, and confidence is the OCR confidence score.

        print(f"✅ OCR done — full_text='{full_text.strip()}' words={len(extracted)}")

        return {
            "full_text": full_text.strip(),
            "words": extracted,
            "word_count": len(extracted)
        }

    except Exception as e:
        print(f"❌ OCR Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "full_text": "",
            "words": [],
            "word_count": 0,
            "error": str(e)
        }