'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Project, Profile, ProjectStage, ChecklistItem } from '@/lib/types'
import Navbar from '@/components/Navbar'
import StageProgress from '@/components/StageProgress'
import ChecklistTable from '@/components/ChecklistTable'
import SignOffBlock from '@/components/SignOffBlock'
import { getStageMeta, STAGES } from '@/lib/stages'

export default function StagePage() {
  const { id, stage } = useParams<{ id: string; stage: string }>()
  const stageNum = parseInt(stage)
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [stageRow, setStageRow] = useState<ProjectStage | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  const stageMeta = getStageMeta(stageNum)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/'); return }

    const { data: prof } = await supabase
      .from('profiles').select('*, company:companies(*)').eq('id', user.id).single()
    setProfile(prof)

    const { data: proj } = await supabase
      .from('projects')
      .select('*, request:requests(*), stages:project_stages(*)')
      .eq('id', id).single()
    setProject(proj)

    const { data: stg } = await supabase
      .from('project_stages')
      .select('*')
      .eq('project_id', id)
      .eq('stage_number', stageNum)
      .single()

    if (stg) {
      setStageRow(stg)
      // Load or seed checklist items
      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('stage_id', stg.id)
        .order('order_num')

      if (items && items.length > 0) {
        setChecklistItems(items)
      } else if (stageMeta) {
        // Seed checklist from static definition
        const toInsert = stageMeta.checklist.map((c, idx) => ({
          stage_id: stg.id,
          item_text: c.item,
          notes: c.notes || null,
          pdt_required: c.pdt === true,
          order_num: idx,
        }))
        const { data: inserted } = await supabase
          .from('checklist_items').insert(toInsert).select()
        setChecklistItems(inserted || [])
      }
    }
    setLoading(false)
  }, [id, stageNum])

  useEffect(() => { load() }, [load])

  const STATUS_BANNER: Record<string, { bg: string; text: string; label: string }> = {
    locked:      { bg: 'bg-gray-100',          text: 'text-gray-500',   label: '🔒 Locked — awaiting approval of previous stage' },
    in_progress: { bg: 'bg-pdt-orange/10',     text: 'text-pdt-orange', label: '🔄 In Progress' },
    submitted:   { bg: 'bg-pdt-amber/10',      text: 'text-pdt-amber',  label: '⏳ Submitted — Awaiting PDT Head Approval' },
    approved:    { bg: 'bg-pdt-green/10',      text: 'text-pdt-green',  label: '✅ Approved by PDT Head' },
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-pdt-mid font-medium">Loading…</div></div>
  if (!project || !stageRow || !stageMeta) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Stage not found.</div></div>

  const banner = STATUS_BANNER[stageRow.status]
  const prevStage = stageNum > 1 ? stageNum - 1 : null
  const nextStage = stageNum < 9 ? stageNum + 1 : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={profile} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <Link href="/dashboard" className="hover:text-pdt-mid">Dashboard</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:text-pdt-mid truncate max-w-[200px]">
            {project.request?.project_name}
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Stage {stageNum}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside>
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2 px-1">Stages</h2>
            <StageProgress
              projectId={project.id}
              stages={project.stages || []}
              currentStage={project.current_stage}
            />
          </aside>

          {/* Main content */}
          <div className="space-y-5">
            {/* Stage header */}
            <div className="bg-pdt-dark text-white rounded-xl overflow-hidden">
              <div className="flex">
                <div className="bg-pdt-mid px-6 py-5 flex items-center justify-center text-3xl font-black min-w-[80px]">
                  {stageNum}
                </div>
                <div className="px-5 py-4">
                  <p className="text-pdt-light text-xs font-semibold uppercase tracking-widest">Stage {stageNum} of 9</p>
                  <h1 className="text-xl font-bold mt-0.5">{stageMeta.name}</h1>
                  <p className="text-white/70 text-sm mt-1">{stageMeta.description}</p>
                </div>
              </div>
            </div>

            {/* Status banner */}
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium ${banner.bg} ${banner.text}`}>
              {banner.label}
            </div>

            {/* Checklist */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-pdt-dark">Checklist</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dev column: tick as you complete each item.
                  PDT column: PDT Head verifies during review.
                </p>
              </div>
              <ChecklistTable
                items={checklistItems}
                userRole={profile?.role || ''}
                stageStatus={stageRow.status}
                onUpdate={load}
              />
            </div>

            {/* Sign-off */}
            {stageRow.status !== 'locked' && profile && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <SignOffBlock stage={stageRow} profile={profile} onUpdate={load} />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              {prevStage ? (
                <Link
                  href={`/projects/${id}/stages/${prevStage}`}
                  className="text-sm text-pdt-mid hover:underline"
                >
                  ← Stage {prevStage}: {STAGES[prevStage - 1]?.name}
                </Link>
              ) : <div />}
              {nextStage && stageRow.status === 'approved' ? (
                <Link
                  href={`/projects/${id}/stages/${nextStage}`}
                  className="text-sm bg-pdt-green text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Stage {nextStage}: {STAGES[nextStage - 1]?.name} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
