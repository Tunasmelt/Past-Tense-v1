import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Share2, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Manifest</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
            Create beautiful stories on your canvas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Manifest combines Canva&apos;s creativity with iA Writer&apos;s simplicity. Create, publish, and share visual stories with your audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Start Creating <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="outline">
                Explore Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background rounded-lg p-8 border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Canvas Editor</h3>
              <p className="text-muted-foreground">
                Drag-and-drop editor with customizable layouts, typography presets, and portrait/landscape modes for complete creative freedom.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background rounded-lg p-8 border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Immersive Reader</h3>
              <p className="text-muted-foreground">
                Distraction-free reading experience with custom fonts, paper tones, highlighting, and progress tracking for your audience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background rounded-lg p-8 border border-border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Publishing</h3>
              <p className="text-muted-foreground">
                Control your audience with private, draft, and public states. Schedule posts and manage permissions with role-based access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary/5 rounded-2xl p-12 text-center border border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to manifest your ideas?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join creators who are building beautiful, shareable content with Manifest.
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Create Your First Story</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">Manifest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Manifest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
