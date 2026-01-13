export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#11142D] dark:text-white mb-6">Dashboard</h1>
      <div className="glass-card rounded-[24px] p-6 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center gap-6">
        <div className="h-32 w-32 rounded-full bg-gradient-to-tr from-[#6C5DD3]/20 to-[#2F80ED]/20 flex items-center justify-center animate-pulse">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#6C5DD3] to-[#2F80ED] opacity-20 blur-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#11142D] dark:text-white mb-2">Dashboard Coming Soon</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We are building a comprehensive overview of your workspace. Check back soon for analytics and insights.
          </p>
        </div>
      </div>
    </div>
  )
}
