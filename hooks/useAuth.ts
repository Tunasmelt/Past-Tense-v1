import { useCallback, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get session'))
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        })
        if (error) throw error
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign up failed')
        setError(error)
        throw error
      }
    },
    []
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign in failed')
        setError(error)
        throw error
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed')
      setError(error)
      throw error
    }
  }, [])

  return {
    session,
    loading,
    error,
    user: session?.user,
    signUp,
    signIn,
    signOut,
  }
}
