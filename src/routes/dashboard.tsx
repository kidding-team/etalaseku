import * as React from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const router = useRouter()
  const [session, setSession] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.navigate({ to: '/login' })
      } else {
        setSession(session)
        setLoading(false)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.navigate({ to: '/login' })
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat dashboard...</div>

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-800 mb-8">Hackaton</h1>
          <nav className="space-y-1">
            <p className="px-3 text-xs font-medium text-slate-500 mb-2">Menu</p>
            <a href="#" className="block px-3 py-2 text-sm font-medium text-slate-900 bg-slate-100 rounded-md">Dashboard</a>
            <a href="#" className="block px-3 py-2 text-sm font-medium text-white bg-[#38BDF8] rounded-md">Produk</a>
            <a href="#" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Konten</a>
            <a href="#" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md">Landing Page</a>
          </nav>
        </div>
        
        <div className="p-6 border-t border-slate-200">
          <p className="px-3 text-xs font-medium text-slate-500 mb-2">Account</p>
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">{session?.user?.email?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200">
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Produk Kamu</h2>
          <Button className="bg-[#38BDF8] hover:bg-[#0284c7] text-white">
            <span className="mr-2">+</span> Tambah Produk
          </Button>
        </div>

        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Cari produk..." 
            className="flex-1 px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
          />
          <select className="px-4 py-2 border border-slate-200 rounded-md bg-white text-slate-600">
            <option>Kategori</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-md bg-white text-slate-600">
            <option>Harga</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-md bg-white text-slate-600">
            <option>Terbaru</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition">
              <div className="h-48 bg-slate-100 flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-slate-900 mb-1">Nasi Tumpeng</h3>
                <p className="text-lg font-bold text-slate-900 mb-2">Rp 550.000</p>
                <p className="text-sm text-slate-500 line-clamp-2">Nasi tumpeng Gurih siang siang gini, maknyosn....</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
