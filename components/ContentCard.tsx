interface ContentCardProps {
    title: string
    description?: string
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}

export function ContentCard({ title, description, action, children, className = "" }: ContentCardProps) {
    return (
        <div className={`rounded-[24px] bg-white dark:bg-[#1F2128] p-8 shadow-sm border border-transparent hover:shadow-md transition-shadow duration-300 ${className}`}>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-[#11142D] dark:text-white tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-gray-500 mt-1">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="animate-in fade-in duration-500">
                {children}
            </div>
        </div>
    )
}
