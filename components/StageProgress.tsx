import { ProjectStage } from '@/lib/types'
import { STAGES } from '@/lib/stages'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  locked:      'bg-gray-200 text-gray-400 border-gray-200',
  in_progress: 'bg-pdt-orange text-white border-pdt-orange',
  submitted:   'bg-pdt-amber text-white border-pdt-amber',
  approved:    'bg-pdt-green text-white border-pdt-green',
}

const STATUS_LABELS: Record<string, string> = {
  locked: 'Locked', in_progress: 'In Progress', submitted: 'Pending Approval', approved: 'Approved',
}

export default function StageProgress({
  projectId, stages, currentStage,
}: {
  projectId: string
  stages: ProjectStage[]
  currentStage: number
}) {
  return (
    <div className="space-y-1.5">
      {STAGES.map(meta => {
        const stage = stages.find(s => s.stage_number === meta.number)
        const status = stage?.status || 'locked'
        const isActive = meta.number === currentStage
        return (
          <Link
            key={meta.number}
            href={`/projects/${projectId}/stages/${meta.number}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all
              ${STATUS_STYLES[status]}
              ${isActive ? 'ring-2 ring-offset-1 ring-pdt-mid' : ''}
              ${status === 'locked' ? 'pointer-events-none opacity-50' : 'hover:opacity-90'}
            `}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
              {meta.number}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{meta.name}</p>
              <p className="text-xs opacity-75">{STATUS_LABELS[status]}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
