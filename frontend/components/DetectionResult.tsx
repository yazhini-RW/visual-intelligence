"use client";
import { useState } from "react";
import { generateReport } from "@/lib/api";
import { FileText, Eye, Type, Clock, Download } from "lucide-react";

interface Props {
  result: any;
}

export default function DetectionResult({ result }: Props) {
  const [reportLoading, setReportLoading] = useState(false);
  const [reportUrl, setReportUrl] = useState("");

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const data = await generateReport(result.analysis_id);
      setReportUrl(`http://127.0.0.1:8001${data.download_url}`);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye size={16} className="text-blue-400" />
            <span className="text-gray-400 text-xs">Objects</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {result.detection_count}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-green-400" />
            <span className="text-gray-400 text-xs">Time</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {result.processing_time}s
          </p>
        </div>
      </div>

      {/* Annotated image */}
      {result.annotated_image && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 text-sm">
            Annotated Image
          </h3>
          <img
            src={`http://127.0.0.1:8001/uploads/images/${result.annotated_image}?t=${Date.now()}`}
            alt="Annotated"
            className="w-full rounded-lg"
            onError={(e) => {
              console.error("Image failed to load:", e.currentTarget.src);
            }}
          />
        </div>
      )}

      {/* Scene description */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
          <Eye size={16} className="text-blue-400" /> Scene Description
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {result.scene_description}
        </p>
      </div>

      {/* Detections list */}
      {result.detections.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3 text-sm">
            Detected Objects
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.detections.map((det: any, i: number) => (
              <span
                key={i}
                className="bg-blue-900 text-blue-200 text-xs px-3 py-1 rounded-full"
              >
                {det.label} {Math.round(det.confidence * 100)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* OCR text */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
          <Type size={16} className="text-green-400" /> Text Extracted (OCR)
        </h3>
        {result.ocr.full_text ? (
          <p className="text-gray-300 text-sm bg-gray-900 rounded-lg p-3">
            {result.ocr.full_text}
          </p>
        ) : (
          <p className="text-gray-500 text-sm">
            No text detected in this image
          </p>
        )}
      </div>

      {/* Generate report */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
          <FileText size={16} className="text-yellow-400" /> PDF Report
        </h3>
        {reportUrl ? (
          <a
            href={reportUrl}
            target="_blank"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors w-fit"
            rel="noopener noreferrer"
          >
            <Download size={16} /> Download Report
          </a>
        ) : (
          <button
            onClick={handleGenerateReport}
            disabled={reportLoading}
            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FileText size={16} />
            {reportLoading ? "Generating..." : "Generate PDF Report"}
          </button>
        )}
      </div>
    </div>
  );
}
