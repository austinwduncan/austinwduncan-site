import Image from 'next/image'
import Link from 'next/link'

export type RelatedItem = {
  slug: string
  title: string
  image?: string
  formattedDate?: string
  label?: string
}

export function RelatedArticles({
  items,
  sectionHref,
  heading = 'Continue Reading',
}: {
  items: RelatedItem[]
  sectionHref: string
  heading?: string
}) {
  if (items.length === 0) return null

  return (
    <div style={{ background: '#F7F7F7', borderTop: '1px solid #E8E8E8' }}>
      <div className="mx-auto max-w-[720px] px-6 py-10">
        {/* Section header */}
        <div className="flex items-center gap-4 mb-7">
          <div style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem' }}>
            <h2 className="text-[0.68rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1A1A1A' }}>
              {heading}
            </h2>
          </div>
          <div className="flex-1 h-px" style={{ background: '#E8E8E8' }} />
        </div>

        {/* Cards */}
        <div
          className={`grid gap-5 ${
            items.length >= 3 ? 'sm:grid-cols-3' : items.length === 2 ? 'sm:grid-cols-2' : ''
          }`}
        >
          {items.map((item) => (
            <Link key={item.slug} href={`${sectionHref}/${item.slug}`} className="group flex flex-col">
              {item.image && (
                <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(min-width: 640px) 220px, 100vw"
                  />
                  {item.label && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5" style={{ background: '#B8892E' }}>
                      <span className="text-[0.48rem] font-black tracking-[0.1em] uppercase text-white">
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <h3
                className="text-[0.9rem] leading-snug mb-1.5 transition-colors group-hover:text-[#7A5C1E]"
                style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, color: '#1A1A1A' }}
              >
                {item.title}
              </h3>
              {item.formattedDate && (
                <p className="text-[0.56rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#888888' }}>
                  {item.formattedDate}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
