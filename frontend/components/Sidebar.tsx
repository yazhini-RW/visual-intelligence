'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload, Camera, BarChart2, FileText, Eye } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/analyze', label: 'Analyze Image', icon: Upload },
    { href: '/camera', label: 'Live Camera', icon: Camera },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { href: '/reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Eye size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Visual Intelligence</h1>
          <p className="text-xs text-gray-400">AI Analysis Platform</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
              pathname === href
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Powered by</p>
          <p className="text-xs text-blue-400 font-medium">YOLOv8 + EasyOCR + Groq</p>
        </div>
      </div>
    </div>
  )
}