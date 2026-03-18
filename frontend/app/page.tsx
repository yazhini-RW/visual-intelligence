import Link from 'next/link'
import { Upload, Camera, BarChart2, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold text-white mb-3">
        Visual Intelligence System
      </h1>
      <p className="text-gray-400 text-lg mb-12 text-center max-w-xl">
        Upload images or connect a live camera — detect objects, read text, describe scenes and flag anomalies automatically.
      </p>

      <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/analyze" className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-6 text-center transition-colors">
          <Upload size={36} className="mx-auto mb-3 text-blue-400" />
          <h2 className="text-white font-semibold">Analyze Image</h2>
          <p className="text-gray-400 text-sm mt-1">Upload and analyze any image</p>
        </Link>

        <Link href="/camera" className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-6 text-center transition-colors">
          <Camera size={36} className="mx-auto mb-3 text-green-400" />
          <h2 className="text-white font-semibold">Live Camera</h2>
          <p className="text-gray-400 text-sm mt-1">Analyze webcam feed in real time</p>
        </Link>

        <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-6 text-center transition-colors">
          <BarChart2 size={36} className="mx-auto mb-3 text-yellow-400" />
          <h2 className="text-white font-semibold">Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">View analytics and stats</p>
        </Link>

        <Link href="/reports" className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-6 text-center transition-colors">
          <FileText size={36} className="mx-auto mb-3 text-purple-400" />
          <h2 className="text-white font-semibold">Reports</h2>
          <p className="text-gray-400 text-sm mt-1">Download PDF analysis reports</p>
        </Link>
      </div>
    </div>
  )
}