interface UserAvatarProps {
    name: string
    imageUrl?: string
    size?: "sm" | "md" | "lg"
}

export function UserAvatar({ name, imageUrl, size = "md" }: UserAvatarProps) {
    const sizes = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base"
    }

    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className={`${sizes[size]} rounded-full bg-[#E4D7FF] dark:bg-[#6C5DD3]/20 flex items-center justify-center overflow-hidden shrink-0`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="font-semibold text-[#6C5DD3]">
                    {initials}
                </span>
            )}
        </div>
    )
}
