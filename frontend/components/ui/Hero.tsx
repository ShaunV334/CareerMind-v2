// components/Hero.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, 
  Play, 
  Brain, 
  FileText, 
  Users, 
  Calendar,
  Zap,
  CheckCircle,
  Target,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

export function Hero() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3
      }
    }
  }

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI Mock Interviews',
      description: 'Practice with Gemini-powered AI that conducts realistic technical interviews, provides real-time feedback, and adapts questions based on your responses.',
      benefits: ['Dynamic questioning', 'Real-time feedback', 'Company-specific prep']
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Resume Builder',
      description: 'Create professional resumes with ATS-friendly templates, automated formatting, and expert suggestions to get past applicant tracking systems.',
      benefits: ['ATS optimized', 'Multiple templates', 'Auto-formatting']
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Question Bank',
      description: '1000+ curated technical and behavioral questions with detailed explanations, solutions, and difficulty levels from top companies.',
      benefits: ['1000+ questions', 'Solutions included', 'Difficulty filters']
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Group Discussions',
      description: 'Collaborate with peers, share insights, discuss challenging problems, and learn from community-driven knowledge sharing.',
      benefits: ['Community learning', 'Peer discussion', 'Knowledge sharing']
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: 'Study Materials',
      description: 'Access curated study guides, video tutorials, documentation links, and expert resources organized by topic and skill level.',
      benefits: ['Organized guides', 'Video tutorials', 'Expert resources']
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Weekly Tasks',
      description: 'Stay on track with personalized weekly goals, progress tracking, and achievement milestones to maintain consistent preparation.',
      benefits: ['Goal tracking', 'Weekly milestones', 'Progress analytics']
    },
  ]



  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div 
            style={{ y: y1 }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 dark:bg-blue-600"
          ></motion.div>
          <motion.div 
            style={{ y: y2 }}
            className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 dark:bg-purple-600"
          ></motion.div>
          <motion.div 
            style={{ y: y1 }}
            className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 dark:bg-pink-600"
          ></motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >

            {/* Main Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-7xl font-bold tracking-tight mb-6 dark:text-white"
            >
              Land Your Dream{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Tech Job
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Master interviews, build impressive resumes, and ace technical assessments with AI-powered coaching. Your complete career companion.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all h-12 px-8 text-lg"
                >
                  <Link href="/signup">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 h-12 px-8 text-lg"
                >
                  <a href="#features">
                    <Play className="mr-2 h-5 w-5" />
                    Explore Features
                  </a>
                </Button>
              </motion.div>
            </motion.div>


          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950">
              <Zap className="h-3 w-3 mr-2" />
              Core Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools designed to guide you from resume to job offer
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card
                  className={`transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-slate-800/50 cursor-pointer h-full`}
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <CardHeader>
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 text-white dark:from-blue-400 dark:to-purple-400"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <CardTitle className="dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, bidx) => (
                        <motion.li 
                          key={bidx} 
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={hoveredFeature === idx ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                          transition={{ delay: bidx * 0.1 }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-950">
              <TrendingUp className="h-3 w-3 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">Your Path to Success</h2>
          </div>

          <Tabs defaultValue="step1" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-8 dark:bg-slate-800">
              {['Step 1', 'Step 2', 'Step 3', 'Step 4'].map((step, idx) => (
                <TabsTrigger key={idx} value={`step${idx + 1}`} className="dark:data-[state=active]:bg-slate-700">
                  <span className="hidden sm:inline">{step}</span>
                  <span className="sm:hidden">{idx + 1}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="step1">
              <Card className="dark:border-gray-800 dark:bg-slate-800/50">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 dark:text-white">1. Start Your Journey</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Sign up and tell us about your target roles, companies, and experience level. Our AI will create a personalized preparation plan.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Profile setup
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Goal definition
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Personalized roadmap
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg h-64 flex items-center justify-center text-white text-4xl dark:from-blue-600 dark:to-purple-600">
                      🚀
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="step2">
              <Card className="dark:border-gray-800 dark:bg-slate-800/50">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 dark:text-white">2. Build & Polish Your Resume</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Use our ATS-optimized resume builder with AI suggestions to create a resume that gets past applicant tracking systems.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          AI-powered suggestions
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          ATS optimization
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          Multiple templates
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg h-64 flex items-center justify-center text-white text-4xl dark:from-purple-600 dark:to-pink-600">
                      📄
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="step3">
              <Card className="dark:border-gray-800 dark:bg-slate-800/50">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 dark:text-white">3. Master Your Skills</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Access 1000+ questions, study guides, and practice with AI-powered mock interviews that adapt to your level.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          1000+ practice questions
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          AI mock interviews
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                          Real-time feedback
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg h-64 flex items-center justify-center text-white text-4xl dark:from-pink-600 dark:to-orange-600">
                      🧠
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="step4">
              <Card className="dark:border-gray-800 dark:bg-slate-800/50">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 dark:text-white">4. Land Your Dream Job</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        With preparation complete, track your applications and get tips for interviews, negotiation, and onboarding.
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Interview tips
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Salary negotiation guide
                        </li>
                        <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          Success celebration
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-lg h-64 flex items-center justify-center text-white text-4xl dark:from-green-600 dark:to-blue-600">
                      🎉
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: 'How realistic are the AI mock interviews?',
                answer: 'Our Gemini-powered AI conducts interviews just like real interviewers. It asks follow-up questions, adapts difficulty, and provides detailed feedback on your technical depth, communication, and problem-solving approach.'
              },
              {
                question: 'Can I get my money back if I\'m not satisfied?',
                answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied with CareerMind within the first month, we\'ll refund you completely, no questions asked.'
              },
              {
                question: 'How often is the question bank updated?',
                answer: 'We add 50-100 new questions every week, sourced from actual interviews at top tech companies. All questions are verified and solutions are provided.'
              },
              {
                question: 'Is there a time limit on accessing my plan?',
                answer: 'No time limits! Once you purchase a plan, you keep access until your subscription ends. You can use it at your own pace.'
              },
            ].map((faq, idx) => (
              <Card key={idx} className="dark:border-gray-800 dark:bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Ready to Transform Your Career?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Join thousands of successful candidates who used CareerMind to land their dream jobs at top tech companies.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  asChild
                  className="bg-white hover:bg-gray-100 text-blue-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white shadow-xl h-12 px-8 text-lg"
                >
                  <Link href="/signup">
                    Start Your Free Trial Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.p 
              className="text-blue-100 mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              No credit card required • 7 days free • Cancel anytime
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">CareerMind</h3>
              <p className="text-sm">Your complete career preparation platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-sm">© 2024 CareerMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Hero
