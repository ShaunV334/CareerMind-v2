"use client"

export default function DashboardHome() {
  return (
    <>
      <div className="flex items-center gap-2 px-4 mb-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Profile Completion" 
          value="75%" 
          description="Complete your profile for better matches"
        />
        <StatCard 
          title="Resumes" 
          value="2" 
          description="Active resumes"
        />
        <StatCard 
          title="Interview Prep" 
          value="8/20" 
          description="Questions answered"
        />
        <StatCard 
          title="Streak" 
          value="5 days" 
          description="Keep it up!"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem text="Updated resume 'SDE'" time="2 hours ago" />
            <ActivityItem text="Completed interview question" time="1 day ago" />
            <ActivityItem text="Joined group discussion" time="3 days ago" />
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Quick Access</h3>
          <div className="space-y-2">
            <QuickAccessButton text="Start Resume Builder" href="/dashboard/resume" />
            <QuickAccessButton text="Practice Interview" href="/dashboard/interview" />
            <QuickAccessButton text="View Study Materials" href="/dashboard/study-materials" />
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-between items-start">
      <p className="text-sm">{text}</p>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}

function QuickAccessButton({ text, href }: { text: string; href: string }) {
  return (
    <a
      href={href}
      className="block w-full px-3 py-2 text-sm rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
    >
      {text}
    </a>
  )
}
