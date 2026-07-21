import { cn } from '@/lib/utils'

export function NovaLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-1/2 w-1/2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2c.9 3.7 3.4 6.2 7.1 7.1v.02c-3.7.9-6.2 3.4-7.1 7.08-.9-3.7-3.4-6.2-7.1-7.08v-.02C8.6 8.2 11.1 5.7 12 2Z"
          fill="currentColor"
        />
        <circle cx="18.5" cy="17.5" r="2.2" fill="currentColor" opacity="0.7" />
      </svg>
    </div>
  )
}
