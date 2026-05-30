'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('developer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pdt-dark">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-block bg-pdt-dark text-white px-4 py-2 rounded-lg text-sm font-bold tracking-widest mb-2">
            SPACE GROUP
          </div>
          <h1 className="text-2xl font-bold text-pdt-dark">PDT Platform</h1>
          <p className="text-gray-500 text-sm mt-1">Product Development Team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text" required value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pdt-mid"
                placeholder="Your full name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pdt-mid"
              placeholder="you@spacegroup.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pdt-mid"
              placeholder="••••••••"
            />
          </div>
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pdt-mid"
              >
                <option value="developer">Developer</option>
                <option value="team_head">Team Head</option>
                <option value="pdt_head">PDT Head</option>
                <option value="production">Production</option>
                <option value="marketing">Marketing</option>
                <option value="academic_support">Academic Support</option>
                <option value="education">Education</option>
                <option value="it">IT</option>
                <option value="accounts">Accounts</option>
                <option value="ceo">CEO</option>
                <option value="cfo">CFO</option>
              </select>
            </div>
          )}
          {error && <p className="text-pdt-red text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-pdt-dark hover:bg-pdt-mid text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-pdt-mid hover:underline font-medium">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
