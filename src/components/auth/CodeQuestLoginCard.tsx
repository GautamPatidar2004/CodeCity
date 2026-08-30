import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface CodeQuestLoginCardProps {
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}

export const CodeQuestLoginCard: React.FC<CodeQuestLoginCardProps> = ({
  onSwitchToRegister,
  onForgotPassword,
}) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.')
      return
    }

    setIsLoading(true)
    const { error } = await signIn(email.trim(), password)
    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message || 'Could not authenticate user. Please check your credentials.')
    }
  }

  // Quick Demo Auto-Fill helper for effortless testing
  const handleQuickDemoFill = (roleType: 'learner' | 'admin') => {
    if (roleType === 'learner') {
      setEmail('student@codequest.dev')
      setPassword('CodeQuest123!')
    } else {
      setEmail('admin@codequest.dev')
      setPassword('AdminQuest123!')
    }
    setErrorMessage(null)
  }

  return (
    <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.06)] flex flex-col transition-all">
      {/* Small emerald header tag */}
      <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10.5px] uppercase tracking-[0.18em] mb-2">
        <span>✦</span>
        <span>WELCOME BACK, ADVENTURER</span>
        <span>✦</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 leading-[1.18] tracking-tight mb-2">
        Continue Your <br />
        Coding{' '}
        <span className="text-emerald-500 relative inline-block">
          Adventure
          {/* Sparkle icons */}
          <span className="absolute -top-3 -right-6 text-amber-400 text-sm animate-pulse select-none">
            ✦
          </span>
          <span className="absolute -bottom-1 -right-3 text-emerald-400 text-xs animate-twinkle select-none">
            ✨
          </span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-500 text-sm font-medium mb-5">
        Pick up where you left off and keep leveling up your skills.
      </p>

      {/* Quick Demo Accounts Tag for rapid testing */}
      <div className="mb-5 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Demo Presets:
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickDemoFill('learner')}
            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
          >
            🎓 Learner
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoFill('admin')}
            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Input */}
        <div className="flex flex-col gap-1.5 text-left">
          <label
            htmlFor="login-email"
            className="text-[11px] font-bold uppercase tracking-wider text-slate-700"
          >
            EMAIL
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1.5 text-left">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700"
            >
              PASSWORD
            </label>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_6px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.4)] active:translate-y-0.5 active:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Continue Adventure</span>
              <span className="text-base">→</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/80" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          OR
        </span>
      </div>

      {/* Social Google Login Button Mockup */}
      <button
        type="button"
        onClick={() => {
          setErrorMessage('Google OAuth is configured via Supabase provider settings.')
        }}
        className="w-full h-12 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 hover:border-slate-300 shadow-sm active:scale-[0.99] cursor-pointer"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Footer link to Register */}
      <div className="mt-7 text-center text-xs text-slate-600">
        <span>New to CodeQuest? </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
        >
          Create your developer profile
        </button>
      </div>

      {/* Terms footnote */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>
          By continuing, you agree to our Terms and Privacy Policy.
        </span>
      </div>
    </div>
  )
}
