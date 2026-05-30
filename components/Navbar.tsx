'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/lib/types'

const ROLE_LABELS: Record<string, string> = {
  developer: 'Developer', team_head: 'Team Head', pdt_head: 'PDT Head',
  ceo: 'CEO', cfo: 'CFO', production: 'Production', marketing: 'Marketing',
  academic_support: 'Academic Support', education: 'Education', it: 'IT', accounts: 'Accounts',
}

export default function Navbar({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-pdt-dark text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm tracking-widest text-pdt-orange">SPACE</span>
        <span className="text-white/40">|</span>
        <span className="font-semibold text-sm">PDT Platform</span>
      </div>
      <div className="flex items-center gap-4">
        {profile && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{profile.full_name}</p>
            <p className="text-xs text-white/60 mt-0.5">{ROLE_LABELS[profile.role] || profile.role}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
