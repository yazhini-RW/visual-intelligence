'use client'
import { useEffect, useState } from 'react'
import { getStats, getRecent } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, Clock, FileText } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r] = await Promise.all([getStats(), getRecent()])
        setStats(s)
        setRecent(r)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  )

  const objectData = stats?.top_objects
    ? Object.entries(stats.top_objects).map(([name, count]) => ({ name, count }))
    : []

  const processingData = recent.slice(0, 10).map((r, i) => ({
    name: `#${i + 1}`,
    time: r.processing_time
  }))

  return (
    <div className="p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
      <p className="text-gray-400 mb-8">Real-time insights from all image analyses</p>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={18} className="text-blue-400" />
            <span className="text-gray-400 text-sm">Total Analyses</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.total_analyses || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-green-400" />
            <span className="text-gray-400 text-sm">Avg Process Time</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.avg_processing_time || 0}s</p>
        </div>
        <div className="bg-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-yellow-400" />
            <span className="text-gray-400 text-sm">Object Types</span>
          </div>
          <p className="text-3xl font-bold text-white">{objectData.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Detected Objects</h3>
          {objectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={objectData}>
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center mt-16">No data yet</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Processing Times</h3>
          {processingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={processingData}>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="time" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center mt-16">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent analyses */}
      <div className="bg-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4">Recent Analyses</h3>
        {recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map((r, i) => (
              <div key={i} className="border border-gray-700 rounded-xl p-3">
                <p className="text-white text-sm font-medium">{r.filename}</p>
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">{r.scene_description}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-gray-500 text-xs">{r.detection_count} objects</span>
                  <span className="text-gray-500 text-xs">{r.processing_time}s</span>
                  <span className="text-gray-500 text-xs">{r.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No analyses yet. Upload an image to get started!</p>
        )}
      </div>
    </div>
  )
}