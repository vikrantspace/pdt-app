'use client'
import { ProjectStage, Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase'
import { useState } from 'react'

function SignBlock({
  label, name, date, active, onSign,
}: {
  label: string; name?: string; date?: string | null; active: boolean; onSign: () => void
}) {
  return (
    <div className={`border-2 rounded-lg p-4 text-center transition-all
      ${date ? 'border-pdt-green bg-pdt-green/5' : active ? 'border-pdt-orange bg-pdt-orange/5' : 'border-gray-200 bg-gray-50'}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      {date ? (
        <>
          <p className="font-semibold text-pdt-green text-sm">{name || 'Signed'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(date).toLocaleDateString()}</p>
          <span className="inline-block mt-1 text-xs bg-pdt-green text-white px-2 py-0.5 rounded-full">✓ Signed</span>
        </>
      ) : active ? (
        <button
          onClick={onSign}
          className="mt-1 bg-pdt-orange hover:bg-pdt-dark text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Sign Now
        </button>
      ) : (
        <p className="text-xs text-gray-400 mt-1">Awaiting prior sign-off</p>
      )}
    </div>
  )
}

export default function SignOffBlock({
  stage, profile, onUpdate,
}: {
  stage: ProjectStage; profile: Profile; onUpdate: () => void
}) {
  const supabase = createClient()
  const [note, setNote] = useState('')
  const [rejecting, setRejecting] = useState(false)

  const canDevSign    = profile.role === 'developer' && !stage.dev_signed_at && stage.status === 'in_progress'
  const canHeadSign   = profile.role === 'team_head' && !!stage.dev_signed_at && !stage.teamhead_signed_at
  const canPdtSign    = profile.role === 'pdt_head' && !!stage.teamhead_signed_at && !stage.pdthead_signed_at && stage.status === 'submitted'

  const sign = async (step: 'dev' | 'teamhead' | 'pdthead') => {
    const now = new Date().toISOString()
    const updates: Record<string, string> = {}

    if (step === 'dev') {
      updates.dev_signed_by = profile.id
      updates.dev_signed_at = now
      // After dev signs, update status to allow team head review
    } else if (step === 'teamhead') {
      updates.teamhead_signed_by = profile.id
      updates.teamhead_signed_at = now
      updates.status = 'submitted'
    } else if (step === 'pdthead') {
      updates.pdthead_signed_by = profile.id
      updates.pdthead_signed_at = now
      updates.status = 'approved'
      if (note) updates.pdt_approval_note = note
    }

    await supabase.from('project_stages').update(updates).eq('id', stage.id)

    // If PDT Head approved, unlock next stage
    if (step === 'pdthead') {
      const nextStage = stage.stage_number + 1
      if (nextStage <= 9) {
        // Find next stage and unlock it
        const { data } = await supabase
          .from('project_stages')
          .select('id')
          .eq('project_id', stage.project_id)
          .eq('stage_number', nextStage)
          .single()
        if (data) {
          await supabase
            .from('project_stages')
            .update({ status: 'in_progress' })
            .eq('id', data.id)
          // Update project's current stage
          await supabase
            .from('projects')
            .update({ current_stage: nextStage })
            .eq('id', stage.project_id)
        }
      }
    }
    onUpdate()
  }

  const reject = async () => {
    await supabase.from('project_stages').update({
      status: 'in_progress',
      dev_signed_by: null, dev_signed_at: null,
      teamhead_signed_by: null, teamhead_signed_at: null,
      pdt_approval_note: note || 'Returned for revision.',
    }).eq('id', stage.id)
    setRejecting(false)
    onUpdate()
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-pdt-dark mb-3 uppercase tracking-wide">Stage Sign-Off</h3>
      <div className="grid grid-cols-3 gap-3">
        <SignBlock
          label="Step 1 — Developer"
          name="Developer"
          date={stage.dev_signed_at}
          active={canDevSign}
          onSign={() => sign('dev')}
        />
        <SignBlock
          label="Step 2 — Team Head"
          name="Team Head"
          date={stage.teamhead_signed_at}
          active={canHeadSign}
          onSign={() => sign('teamhead')}
        />
        <SignBlock
          label="Step 3 — PDT Head"
          name="PDT Head"
          date={stage.pdthead_signed_at}
          active={canPdtSign}
          onSign={() => sign('pdthead')}
        />
      </div>

      {canPdtSign && (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional: Add approval note or feedback…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pdt-mid resize-none h-20"
          />
          <div className="flex gap-2">
            <button
              onClick={() => sign('pdthead')}
              className="bg-pdt-green hover:bg-pdt-green/90 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              ✓ Approve Stage
            </button>
            <button
              onClick={() => setRejecting(true)}
              className="bg-pdt-red hover:bg-pdt-red/90 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              ✗ Return for Revision
            </button>
          </div>
          {rejecting && (
            <div className="bg-pdt-red/5 border border-pdt-red rounded-lg p-3">
              <p className="text-sm text-pdt-red font-medium mb-2">Confirm: Return this stage to Developer?</p>
              <div className="flex gap-2">
                <button onClick={reject} className="bg-pdt-red text-white text-xs px-3 py-1.5 rounded">Yes, Return</button>
                <button onClick={() => setRejecting(false)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage.pdt_approval_note && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${stage.status === 'approved' ? 'bg-pdt-green/10 text-pdt-green' : 'bg-pdt-amber/10 text-pdt-amber'}`}>
          <span className="font-semibold">PDT Note: </span>{stage.pdt_approval_note}
        </div>
      )}
    </div>
  )
}
