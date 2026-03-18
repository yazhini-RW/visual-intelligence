'use client'
import { useState } from 'react'
import { analyzeImage } from '@/lib/api'
import DetectionResult from '@/components/DetectionResult'
import { Upload, Loader2 } from 'lucide-react'

export default function AnalyzePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
    setLoading(true)

    try {
      const data = await analyzeImage(file)
      setResult(data)
    } catch (err) {
      setError('Analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Analyze Image</h2>
      <p className="text-gray-400 mb-6">Upload any image — objects, text, scenes and anomalies will be detected automatically</p>

      <div className="grid grid-cols-2 gap-6">
        {/* Left — upload */}
        <div>
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full rounded-lg mb-3" />
              ) : (
                <>
                  <Upload size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-400">Click to upload an image</p>
                  <p className="text-gray-600 text-sm mt-1">JPG, PNG, WEBP supported</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {loading && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4 flex items-center gap-3">
              <Loader2 size={20} className="text-blue-400 animate-spin" />
              <div>
                <p className="text-white text-sm font-medium">Analyzing image...</p>
                <p className="text-gray-400 text-xs">Running object detection, OCR and scene analysis</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-700 rounded-xl p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right — results */}
        <div>
          {result ? (
            <DetectionResult result={result} />
          ) : (
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
              <p className="text-gray-500">Results will appear here after analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}