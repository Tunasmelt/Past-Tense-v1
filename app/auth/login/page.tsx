'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BookOpen, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, session, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'signup-success') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    if (session && !loading) {
      router.push('/dashboard')
    }
  }, [session, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }

      await signIn(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Manifest</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-muted-foreground mb-6">
          Sign in to continue creating
        </p>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-gap-2 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            Account created successfully! Please sign in.
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3 mb-6 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  )
}
