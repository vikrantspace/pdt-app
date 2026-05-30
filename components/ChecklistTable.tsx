'use client'
import { ChecklistItem } from '@/lib/types'
import { createClient } from '@/lib/supabase'

export default function ChecklistTable({
  items,
  userRole,
  stageStatus,
  onUpdate,
}: {
  items: ChecklistItem[]
  userRole: string
  stageStatus: string
  onUpdate: () => void
}) {
  const supabase = createClient()
  const canDevCheck = ['developer', 'team_head'].includes(userRole) && stageStatus === 'in_progress'
  const canPdtCheck = userRole === 'pdt_head' && stageStatus === 'submitted'

  const toggleCheck = async (item: ChecklistItem, col: 'dev_checked' | 'pdt_checked') => {
    const newVal = !item[col]
    await supabase
      .from('checklist_items')
      .update({ [col]: newVal })
      .eq('id', item.id)
    onUpdate()
  }

  const allDevChecked = items.every(i => i.dev_checked)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-pdt-dark text-white text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 w-1/2">Checklist Item</th>
            <th className="text-left px-4 py-3">Notes / Reference</th>
            <th className="text-center px-4 py-3 w-16">Dev</th>
            <th className="text-center px-4 py-3 w-16">PDT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-pdt-light/30'}`}
            >
              <td className="px-4 py-3 font-medium text-gray-800">{item.item_text}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{item.notes || '—'}</td>
              <td className="px-4 py-3 text-center">
                <button
                  disabled={!canDevCheck}
                  onClick={() => toggleCheck(item, 'dev_checked')}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors
                    ${item.dev_checked
                      ? 'bg-pdt-green border-pdt-green text-white'
                      : 'border-gray-300 bg-white'}
                    ${canDevCheck ? 'hover:border-pdt-green cursor-pointer' : 'cursor-default opacity-60'}
                  `}
                >
                  {item.dev_checked && <span className="text-xs font-bold">✓</span>}
                </button>
              </td>
              <td className="px-4 py-3 text-center">
                {item.pdt_required ? (
                  <button
                    disabled={!canPdtCheck}
                    onClick={() => toggleCheck(item, 'pdt_checked')}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center mx-auto transition-colors
                      ${item.pdt_checked
                        ? 'bg-pdt-green border-pdt-green text-white'
                        : 'border-gray-300 bg-white'}
                      ${canPdtCheck ? 'hover:border-pdt-green cursor-pointer' : 'cursor-default opacity-60'}
                    `}
                  >
                    {item.pdt_checked && <span className="text-xs font-bold">✓</span>}
                  </button>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!allDevChecked && stageStatus === 'in_progress' && (
        <p className="text-xs text-pdt-amber mt-2 px-4">
          ⚠ All Dev items must be checked before submitting for approval.
        </p>
      )}
    </div>
  )
}
