import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, type UserRole, type UserProfile } from '../lib/supabase'

interface SignUpParams {
  email: string
  password: string
  role: UserRole
  username: string
  fullName?: string
}

interface UpdateProfileParams {
  username?: string
  full_name?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  role: UserRole
  isAdmin: boolean
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>
  signUp: (params: SignUpParams) => Promise<{ error: AuthError | Error | null }>
  signOut: () => Promise<{ error: AuthError | Error | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null; message?: string }>
  updateProfile: (params: UpdateProfileParams) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>('learner')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = useCallback(async (currentUser: User | null): Promise<UserProfile | null> => {
    if (!currentUser) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (!error && data) {
        const verifiedRole: UserRole = data.role === 'admin' ? 'admin' : 'learner'
        return {
          id: data.id,
          email: data.email || currentUser.email || '',
          username: data.username || currentUser.email?.split('@')[0] || 'Adventurer',
          full_name: data.full_name || data.username || 'Adventurer',
          avatar_url: data.avatar_url,
          role: verifiedRole,
          xp: data.xp ?? 120,
          streak: data.streak ?? 3,
          level: data.level ?? (verifiedRole === 'admin' ? 99 : 2),
          created_at: data.created_at,
        }
      }
    } catch {
      // Fallback to validated auth user metadata if database table not yet populated
    }

    const meta = currentUser.user_metadata || {}
    const fallbackRole: UserRole = meta.role === 'admin' ? 'admin' : 'learner'
    return {
      id: currentUser.id,
      email: currentUser.email || '',
      username: meta.username || currentUser.email?.split('@')[0] || 'Adventurer',
      full_name: meta.full_name || meta.username || 'Adventurer',
      avatar_url: meta.avatar_url,
      role: fallbackRole,
      xp: meta.xp || (fallbackRole === 'admin' ? 9999 : 120),
      streak: meta.streak || 3,
      level: meta.level || (fallbackRole === 'admin' ? 99 : 2),
      created_at: currentUser.created_at,
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updated = await fetchProfile(user)
      setProfile(updated)
      setRole(updated?.role || 'learner')
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        if (error) throw error

        setSession(initialSession)
        const currentUser = initialSession?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const userProfile = await fetchProfile(currentUser)
          setProfile(userProfile)
          setRole(userProfile?.role || 'learner')
        }
      } catch (err) {
        console.error('Error initializing auth session:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      const currentUser = currentSession?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const userProfile = await fetchProfile(currentUser)
        setProfile(userProfile)
        setRole(userProfile?.role || 'learner')
      } else {
        setProfile(null)
        setRole('learner')
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return { error }

      if (data.user) {
        const userProfile = await fetchProfile(data.user)
        setProfile(userProfile)
        setRole(userProfile?.role || 'learner')
      }

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async ({ email, password, role: selectedRole, username, fullName }: SignUpParams) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
            full_name: fullName?.trim() || username.trim(),
            role: selectedRole,
            xp: selectedRole === 'admin' ? 9999 : 50,
            level: selectedRole === 'admin' ? 99 : 1,
            streak: 1,
          },
        },
      })

      if (error) return { error }

      if (data.user) {
        const userProfile = await fetchProfile(data.user)
        setProfile(userProfile)
        setRole(userProfile?.role || selectedRole)
      }

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      setRole('learner')
      return { error }
    } catch (err) {
      return { error: err as Error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) return { error }
      return { error: null, message: 'Check your email for the password reset link!' }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const updateProfile = async (params: UpdateProfileParams) => {
    if (!user) return { error: new Error('User not authenticated') }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...params,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) return { error }

      await refreshProfile()
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin: role === 'admin',
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
