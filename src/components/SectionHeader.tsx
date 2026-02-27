interface SectionHeaderProps {
  tag: string
  title: string
  description?: string
  centered?: boolean
}

export function SectionHeader({ tag, title, description, centered = false }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 ${centered ? 'items-center text-center' : ''}`}>
      <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
        {tag}
      </p>
      <h2 className="reveal stagger-1 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="reveal stagger-2 max-w-2xl text-lg text-[rgba(13,27,42,0.6)]">
          {description}
        </p>
      )}
    </div>
  )
}
