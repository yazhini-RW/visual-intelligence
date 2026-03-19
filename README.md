# Visual Intelligence System

An AI-powered image analysis platform that automatically detects objects, reads text, describes scenes, and flags anomalies — from both uploaded images and live webcam feeds. Includes a real-time analytics dashboard and downloadable PDF reports.

Built with **YOLOv8 · EasyOCR · Groq · FastAPI · Next.js 14 · PostgreSQL**

---

## What It Does

You feed it an image or connect a live camera. The system automatically runs four AI models in parallel — detecting every object in the frame, reading any visible text, generating a natural language description of the scene, and flagging anything unusual as an anomaly. All results are logged, visualized on a dashboard, and exportable as a professional PDF report.

This is a working prototype of the kind of Visual AI platform that enterprise companies pay to build.

---

## Architecture

```
Image Input (upload or webcam frame)
    |
FastAPI Backend
    |-- Object Detection    (YOLOv8 — draws bounding boxes, labels objects)
    |-- OCR                 (EasyOCR — extracts text from image)
    |-- Scene Description   (Groq LLM — generates natural language summary)
    `-- Anomaly Detection   (Groq LLM — flags safety concerns or unusual activity)
              |
        Results saved to PostgreSQL
              |
        Annotated image saved to disk
              |
        Dashboard + PDF Report
```

---

## Tech Stack

| Layer             | Technology                          |
|-------------------|-------------------------------------|
| Frontend          | Next.js 14 (App Router), TypeScript |
| Styling           | Tailwind CSS                        |
| Charts            | Recharts                            |
| AI / LLM          | Groq (llama-3.3-70b-versatile)      |
| Object Detection  | YOLOv8 (Ultralytics)                |
| OCR               | EasyOCR + OpenCV preprocessing      |
| Backend           | FastAPI (Python)                    |
| Database          | PostgreSQL + SQLAlchemy             |
| PDF Generation    | ReportLab                           |
| Image Processing  | OpenCV + Pillow                     |

---

## Project Structure

```
visual-intelligence/
|-- backend/
|   |-- ai/
|   |   |-- detector.py         # YOLOv8 object detection
|   |   |-- ocr.py              # EasyOCR text extraction
|   |   |-- scene.py            # Groq scene description
|   |   `-- anomaly.py          # Groq anomaly detection
|   |-- database/
|   |   |-- connection.py       # PostgreSQL connection
|   |   `-- models.py           # AnalysisLog + AlertLog tables
|   |-- routers/
|   |   |-- analyze.py          # POST /api/analyze
|   |   |-- analytics.py        # GET /api/analytics/stats & /recent & /alerts
|   |   `-- reports.py          # POST /api/reports/generate & GET /download
|   |-- utils/
|   |   `-- image_utils.py      # Image save, resize, bounding box drawing
|   |-- uploads/
|   |   |-- images/             # Saved original + annotated images
|   |   `-- reports/            # Generated PDF reports
|   |-- main.py                 # FastAPI app entry point
|   `-- .env                    # API keys (not committed)
|
`-- frontend/
    |-- app/
    |   |-- analyze/page.tsx    # Image upload + analysis results
    |   |-- camera/page.tsx     # Live webcam feed with auto-analysis
    |   |-- dashboard/page.tsx  # Analytics + charts + logs
    |   |-- reports/page.tsx    # PDF report generation + download
    |   |-- layout.tsx          # Root layout with Sidebar
    |   `-- page.tsx            # Home page
    |-- components/
    |   |-- Sidebar.tsx         # Navigation sidebar
    |   |-- DetectionResult.tsx # Full analysis results display
    |   `-- LiveCamera.tsx      # Webcam component
    `-- lib/
        `-- api.ts              # Axios API helper functions
```

---

## Setup and Installation

### Prerequisites

- Python 3.11
- Node.js v20+
- PostgreSQL (running on port 5432)
- Account on: Groq (console.groq.com)

---

### 1. Open the project

```bash
cd C:\visual-intelligence
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install fastapi uvicorn python-multipart python-dotenv sqlalchemy \
  psycopg2-binary pillow opencv-python-headless easyocr ultralytics \
  langchain-groq langchain-core reportlab aiofiles requests python-jose
```

---

### 3. Create the .env file

Inside `backend/`, create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/visualintelligencedb
UPLOAD_DIR=uploads/images
```

---

### 4. Create the PostgreSQL database

```bash
psql -U postgres
```
```sql
CREATE DATABASE visualintelligencedb;
\q
```

---

### 5. Run the backend

```bash
uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`  
API docs at: `http://127.0.0.1:8000/docs`

---

### 6. Frontend Setup

Open a new terminal:

```bash
cd C:\visual-intelligence\frontend
npm install axios recharts lucide-react @types/node
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Features

### Analyze Image (`/analyze`)
Upload any image (JPG, PNG, WEBP). The system runs all four AI models automatically and returns the annotated image with bounding boxes drawn, a list of detected objects with confidence scores, any text extracted via OCR, a natural language scene description, and an anomaly assessment. A PDF report can be generated for any analysis with one click.

### Live Camera (`/camera`)
Start your webcam directly in the browser. A frame is captured and sent to the backend every 5 seconds for full analysis. Results update live on the right side showing detected objects, scene description, and anomaly status. A manual capture button is also available for on-demand analysis.

### Dashboard (`/dashboard`)
Displays four stat cards (total analyses, total alerts, average processing time, unique object types), a bar chart of the most frequently detected objects, a processing time chart, a log of recent analyses with anomaly status, and a recent alerts table.

### Reports (`/reports`)
Lists all past analyses. Clicking Generate PDF creates a professional report containing the filename, timestamp, scene description, a table of detected objects with confidence scores, OCR text, and the full anomaly assessment. Reports are downloadable as PDF files.

### API Docs (`http://127.0.0.1:8000/docs`)
Interactive Swagger UI for testing all endpoints directly in the browser without the frontend.

---

## The 4 AI Models

| Model             | Technology         | What It Does                                                          |
|-------------------|--------------------|-----------------------------------------------------------------------|
| Object Detection  | YOLOv8n            | Detects and localizes every object with bounding box coordinates      |
| OCR               | EasyOCR + OpenCV   | Preprocesses image and extracts all readable text                     |
| Scene Description | Groq LLM           | Generates a 2-3 sentence professional description of the scene        |
| Anomaly Detection | Groq LLM           | Assesses whether the scene is normal or flags a specific concern      |

---

## Testing the App

Run these in order to verify each feature:

```
1. Analyze Image
   Upload a street photo       ->  expects: people, cars, traffic lights detected
   Upload an image with text   ->  expects: OCR section shows extracted words
   Upload a construction site  ->  expects: anomaly assessment triggered

2. Live Camera
   Start camera -> allow browser permission -> wait 5 seconds
   Expects: objects detected from webcam frame, results update every 5s

3. Dashboard
   After 3-4 analyses  ->  expects: charts populated, logs visible

4. Reports
   Click Generate PDF on any analysis  ->  expects: download link appears
   Click download  ->  expects: PDF opens with full structured report

5. API Docs
   Visit http://127.0.0.1:8000/docs
   Test POST /api/analyze directly with an image file
```

---

## File Locations

| File Type         | Location                                       |
|-------------------|------------------------------------------------|
| Uploaded images   | `backend/uploads/images/{uuid}.jpg`            |
| Annotated images  | `backend/uploads/images/{uuid}_annotated.jpg`  |
| PDF reports       | `backend/uploads/reports/{uuid}.pdf`           |

Image URLs follow the pattern:
```
http://127.0.0.1:8000/uploads/images/{filename}
```

---

## API Endpoints

| Method | Endpoint                          | Description                                        |
|--------|-----------------------------------|----------------------------------------------------|
| POST   | /api/analyze                      | Upload image, run all 4 AI models, return results  |
| GET    | /api/analytics/stats              | Total analyses, alerts, avg time, top objects      |
| GET    | /api/analytics/recent             | Last 20 analysis logs                              |
| GET    | /api/analytics/alerts             | Last 20 alert logs                                 |
| POST   | /api/reports/generate/{id}        | Generate PDF for a given analysis                  |
| GET    | /api/reports/download/{filename}  | Download a generated PDF                           |

---

## Viewing the Database

```bash
psql -U postgres -d visualintelligencedb
```

```sql
SELECT * FROM analysis_logs;
SELECT * FROM alert_logs;
```

Or open pgAdmin and navigate to:
`Servers -> PostgreSQL -> Databases -> visualintelligencedb -> Schemas -> Tables`

---

## Real World Use Cases

| Industry       | Application                                                        |
|----------------|--------------------------------------------------------------------|
| Manufacturing  | Detect defects or missing items on a production line in real time  |
| Retail         | Monitor shelf stock levels from a store camera                     |
| Logistics      | Read shipping labels and detect damaged packages                   |
| Security       | Alert when unauthorized persons enter a restricted zone            |
| Healthcare     | Extract text from medical forms and scanned documents              |
| Construction   | Flag safety violations such as missing helmets or vests            |

---

## Business Alignment

This project is a working prototype of Random Walk AI's Visual AI Platform, whose stated purpose is to "transform images and videos into actionable intelligence through deep learning models that detect, classify, and analyze visual data with precision."

Each feature maps directly to a product they sell to enterprise clients:

- **Object detection + OCR + scene description** — Visual AI Platform
- **Analytics dashboard** — Analytical AI Platform
- **PDF reports** — Business Enterprise Suite

---

