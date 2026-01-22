// components/Hero.tsx
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Brain, FileText, Users, Calendar } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 dark:bg-blue-900 dark:text-blue-200">
            <Brain className="h-4 w-4" />
            AI-Powered Career Development
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 dark:text-gray-100">
            Land Your Dream Job with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Training
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto dark:text-gray-300">
            Master aptitude tests, build winning resumes, ace interviews, and excel in group discussions. 
            Everything you need for placement success in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/signup">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-blue-900">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Aptitude Tests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">1000+ Practice Questions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-purple-900">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Resume Builder</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-Optimized Templates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-green-900">
                <Users className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Interview Prep</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mock interviews and GD</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 dark:bg-orange-900">
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Tasks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Structured Learning Path</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero