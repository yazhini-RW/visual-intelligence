"use client";
import { useEffect, useState } from "react";
import { getRecent, generateReport } from "@/lib/api";
import { FileText, Download, Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [reportUrls, setReportUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getRecent();
        setAnalyses(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleGenerate = async (analysisId: number) => {
    setGenerating(analysisId);
    try {
      const data = await generateReport(analysisId);
      setReportUrls((prev) => ({
        ...prev,
        [analysisId]: `http://127.0.0.1:8001${data.download_url}`,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400">Loading...</p>
      </div>
    );

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Reports</h2>
      <p className="text-gray-400 mb-8">
        Generate and download PDF reports for any analysis
      </p>

      {analyses.length > 0 ? (
        <div className="space-y-4">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="bg-gray-800 rounded-2xl p-5 flex justify-between items-center"
            >
              <div>
                <p className="text-white font-medium">{a.filename}</p>
                <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                  {a.scene_description}
                </p>
                <div className="flex gap-3 mt-2">
                  <span className="text-gray-500 text-xs">
                    {a.detection_count} objects
                  </span>
                  <span
                    className={`text-xs ${a.anomaly_count > 0 ? "text-red-400" : "text-green-400"}`}
                  >
                    {a.anomaly_count > 0
                      ? `${a.anomaly_count} alerts`
                      : "Normal"}
                  </span>
                  <span className="text-gray-500 text-xs">{a.created_at}</span>
                </div>
              </div>

              <div className="flex-shrink-0 ml-4">
                {reportUrls[a.id] ? (
                  <a
                    href={reportUrls[a.id]}
                    target="_blank"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    <Download size={16} /> Download
                  </a>
                ) : (
                  <button
                    onClick={() => handleGenerate(a.id)}
                    disabled={generating === a.id}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {generating === a.id ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText size={16} /> Generate PDF
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center">
          <FileText size={48} className="mx-auto mb-3 text-gray-600" />
          <p className="text-gray-500">No analyses yet.</p>
          <p className="text-gray-600 text-sm mt-1">
            Upload an image first to generate reports.
          </p>
        </div>
      )}
    </div>
  );
}
