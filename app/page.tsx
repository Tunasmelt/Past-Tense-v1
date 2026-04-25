import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, Share2, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-primary/20 bg-background/98 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Manifest</span>
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-primary mb-6 leading-tight">
            Manifest Your Words
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A bold writing canvas for creators. Design stories, share with the world, and track what readers love about your work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                Start Creating <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="outline" className="font-semibold border-primary/40 hover:border-primary text-foreground">
                Explore Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-center mb-4 text-primary">Powerful Features</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
            Everything you need to write, design, and share with your readers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-8 border border-primary/30 hover:border-primary/60 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Canvas Editor</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag-and-drop editor with customizable layouts, typography presets, and portrait/landscape modes for complete creative freedom.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-8 border border-primary/30 hover:border-primary/60 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Immersive Reader</h3>
              <p className="text-muted-foreground leading-relaxed">
                Distraction-free reading experience with custom fonts, paper tones, highlighting, and progress tracking for your audience.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-8 border border-primary/30 hover:border-primary/60 hover:shadow-xl transition-all duration-300">
              <div className="h-12 w-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Smart Publishing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Control your audience with private, draft, and public states. Schedule posts and manage permissions with role-based access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-r from-primary/20 to-accent/10 rounded-2xl p-16 text-center border border-primary/40 backdrop-blur-sm">
          <h2 className="text-4xl font-bold mb-4 text-primary">Ready to manifest your ideas?</h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg leading-relaxed">
            Join creators who are building beautiful, shareable content with Manifest.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">Create Your First Story</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Manifest</span>
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
