'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project, Profile } from '@/lib/types'
import Navbar from '@/components/Navbar'
import { STAGES } from '@/lib/stages'

const STATUS_BADGE: Record<string, string> = {
  active:    'bg-pdt-mid/10 text-pdt-mid',
  completed: 'bg-pdt-green/10 text-pdt-green',
  on_hold:   'bg-pdt-amber/10 text-pdt-amber',
}

export default function Dashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*, company:companies(*)')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      const { data: projs } = await supabase
        .from('projects')
        .select('*, request:requests(*), developer:profiles(*), stages:project_stages(*)')
        .order('created_at', { ascending: false })
      setProjects(projs || [])
      setLoading(false)
    }
    load()
  }, [])

  const createProject = async () => {
    if (!profile || !newProjectName.trim()) return
    setCreating(true)

    // Create request first
    const { data: req } = await supabase.from('requests').insert({
      project_name: newProjectName,
      description: newProjectDesc,
      requestor_id: profile.id,
      company_id: profile.company_id,
      status: 'approved',
    }).select().single()

    if (req) {
      await supabase.from('projects').insert({
        request_id: req.id,
        developer_id: profile.id,
        status: 'active',
      })
      // Reload
      const { data: projs } = await supabase
        .from('projects')
        .select('*, request:requests(*), developer:profiles(*), stages:project_stages(*)')
        .order('created_at', { ascending: false })
      setProjects(projs || [])
    }
    setNewProjectName('')
    setNewProjectDesc('')
    setShowNewProject(false)
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pdt-mid font-medium">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-pdt-dark">Projects</h1>
            <p className="text-gray-500 text-sm mt-0.5">Phase 1 — Development Pipeline</p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="bg-pdt-dark hover:bg-pdt-mid text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Project
          </button>
        </div>

        {/* New project form */}
        {showNewProject && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="font-bold text-pdt-dark mb-3">Create New Project</h2>
            <input
              value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
              placeholder="Project / Program name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-pdt-mid"
            />
            <textarea
              value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}
              placeholder="Brief description (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-pdt-mid"
            />
            <div className="flex gap-2">
              <button onClick={createProject} disabled={creating || !newProjectName.trim()}
                className="bg-pdt-dark text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                {creating ? 'Creating…' : 'Create Project'}
              </button>
              <button onClick={() => setShowNewProject(false)}
                className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Project cards */}
        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">No projects yet</p>
            <p className="text-sm mt-1">Create your first project to start the development workflow.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => {
              const currentStageMeta = STAGES.find(s => s.number === project.current_stage)
              const approvedCount = project.stages?.filter(s => s.status === 'approved').length || 0
              const progressPct = Math.round((approvedCount / 9) * 100)
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-pdt-mid transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-400">
                          {project.request?.request_code || '—'}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[project.status]}`}>
                          {project.status}
                        </span>
                      </div>
                      <h2 className="font-bold text-pdt-dark text-lg truncate">
                        {project.request?.project_name || 'Unnamed Project'}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                        {project.request?.description || 'No description'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">Current Stage</p>
                      <p className="font-bold text-pdt-dark text-sm">{project.current_stage}/9</p>
                      <p className="text-xs text-gray-500 max-w-[140px] text-right">
                        {currentStageMeta?.name}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{approvedCount} stages approved</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pdt-green rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
