'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { analyzeImage } from '@/lib/api'
import { Camera, Square, Loader2, AlertCircle } from 'lucide-react'

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const intervalRef = useRef<any>(null)

  const startCamera = async () => {
    setError('')
    if (!navigator.mediaDevices) {
      setError('Camera API not available. Are you on HTTPS or localhost?')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreaming(true)
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Permission denied. Allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another app.')
      } else {
        setError(`Camera error: ${err.name} — ${err.message}`)
      }
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    clearInterval(intervalRef.current)
    setStreaming(false)
    setCameraReady(false)
  }

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || analyzing || !cameraReady) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      setAnalyzing(true)
      try {
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
        const data = await analyzeImage(file)
        setResult(data)
      } catch (err) {
        console.error('Analysis failed:', err)
      } finally {
        setAnalyzing(false)
      }
    }, 'image/jpeg', 0.8)
  }, [analyzing, cameraReady])

  useEffect(() => {
    if (streaming && cameraReady) {
      intervalRef.current = setInterval(captureAndAnalyze, 5000)
    }
    return () => clearInterval(intervalRef.current)
  }, [streaming, cameraReady, captureAndAnalyze])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Live Camera</h2>
      <p className="text-gray-400 mb-6">Webcam feed analyzed every 5 seconds automatically</p>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="bg-gray-800 rounded-2xl overflow-hidden" style={{ minHeight: 300 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full"
              onLoadedMetadata={() => setCameraReady(true)}
              style={{ display: streaming ? 'block' : 'none' }}
            />
            {!streaming && (
              <div className="flex flex-col items-center justify-center h-72">
                <Camera size={48} className="text-gray-500 mb-3" />
                <p className="text-gray-500">Camera not started</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {!streaming ? (
              <button onClick={startCamera} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm">
                <Camera size={16} /> Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm">
                <Square size={16} /> Stop Camera
              </button>
            )}
            {cameraReady && !analyzing && <p className="text-green-400 text-xs">✓ Camera ready</p>}
            {analyzing && (
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Analyzing...
              </div>
            )}
          </div>

          {streaming && cameraReady && (
            <button
              onClick={captureAndAnalyze}
              disabled={analyzing}
              className="mt-3 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Capture and Analyze Now
            </button>
          )}
        </div>

        <div>
          {result ? (
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">Scene</p>
                <p className="text-white text-sm leading-relaxed">{result.scene_description}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">Objects ({result.detection_count})</p>
                <div className="flex flex-wrap gap-2">
                  {result.detections.map((det: any, i: number) => (
                    <span key={i} className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full">
                      {det.label} {Math.round(det.confidence * 100)}%
                    </span>
                  ))}
                </div>
              </div>
              {result.ocr?.full_text && (
                <div className="bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Text detected</p>
                  <p className="text-white text-sm">{result.ocr.full_text}</p>
                </div>
              )}
              <p className="text-gray-600 text-xs">Last analyzed — {new Date().toLocaleTimeString()}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
              <Camera size={32} className="text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm">Start camera and results appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}