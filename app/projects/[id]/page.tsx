'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project, Profile, ProjectStage } from '@/lib/types'
import Navbar from '@/components/Navbar'
import StageProgress from '@/components/StageProgress'
import { STAGES } from '@/lib/stages'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }
    const { data: prof } = await supabase
      .from('profiles').select('*, company:companies(*)').eq('id', user.id).single()
    setProfile(prof)
    const { data: proj } = await supabase
      .from('projects')
      .select('*, request:requests(*), developer:profiles(*), stages:project_stages(*)')
      .eq('id', id)
      .single()
    setProject(proj)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-pdt-mid font-medium">Loading…</div></div>
  if (!project) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Project not found.</div></div>

  const currentStageMeta = STAGES.find(s => s.number === project.current_stage)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/dashboard" className="hover:text-pdt-mid">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{project.request?.project_name}</span>
        </div>

        {/* Project header */}
        <div className="bg-pdt-dark text-white rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-pdt-light text-xs font-mono mb-1">{project.request?.request_code}</p>
              <h1 className="text-2xl font-bold">{project.request?.project_name}</h1>
              {project.program_code && (
                <p className="text-pdt-orange text-sm font-mono mt-1">{project.program_code}</p>
              )}
              {project.request?.description && (
                <p className="text-white/70 text-sm mt-2 max-w-xl">{project.request.description}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-white/60 text-xs">Current Stage</p>
              <p className="text-3xl font-bold">{project.current_stage}/9</p>
              <p className="text-pdt-light text-xs mt-0.5 max-w-[160px] text-right">{currentStageMeta?.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar — stage nav */}
          <aside>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2 px-1">Stages</h2>
            <StageProgress
              projectId={project.id}
              stages={project.stages || []}
              currentStage={project.current_stage}
            />
          </aside>

          {/* Main — current stage overview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-pdt-dark text-lg mb-1">
              Stage {project.current_stage} — {currentStageMeta?.name}
            </h2>
            <p className="text-gray-600 text-sm mb-6">{currentStageMeta?.description}</p>

            <Link
              href={`/projects/${project.id}/stages/${project.current_stage}`}
              className="inline-block bg-pdt-orange hover:bg-pdt-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              Open Stage {project.current_stage} →
            </Link>

            {/* Stage summary grid */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {(project.stages || []).slice(0, 9).map(stage => {
                const meta = STAGES.find(s => s.number === stage.stage_number)
                const colors: Record<string, string> = {
                  locked: 'bg-gray-100 text-gray-400',
                  in_progress: 'bg-pdt-orange/10 text-pdt-orange border border-pdt-orange/30',
                  submitted: 'bg-pdt-amber/10 text-pdt-amber border border-pdt-amber/30',
                  approved: 'bg-pdt-green/10 text-pdt-green border border-pdt-green/30',
                }
                return (
                  <div key={stage.id} className={`rounded-lg p-3 text-center text-xs ${colors[stage.status]}`}>
                    <p className="font-bold text-base">{stage.stage_number}</p>
                    <p className="font-medium leading-tight mt-0.5 line-clamp-2">{meta?.name}</p>
                    <p className="mt-1 opacity-75 capitalize">{stage.status.replace('_', ' ')}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
