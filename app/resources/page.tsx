import type { Metadata } from 'next'
import ResourcesBooks, { type ResourceBook } from '@/components/resources-books'
import books from '@/content/books.json'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Recommended books for biblical study, theology, ministry, and Christian life.',
}

const categoryOrder = [
  'Apologetics',
  'Archaeology & Biblical History',
  'Bible Dictionaries',
  'Bible Languages/Tools',
  'Bible Study',
  'Biblical Reference',
  'Business',
  'Christian Living',
  'Christology',
  'Church History',
  'Church Life',
  'Classics',
  'Comparative Religions',
  'Death/Dying',
  'Denominational Concerns',
  'Devotionals',
  'Discipleship',
  'Eschatology/End Times',
  'Ethics',
  'Evangelism',
  'Faith',
  'Finance',
  'God/Theology Proper',
  'Grief & Comfort',
  'Hermeneutics',
  'Leadership',
  'Love & Marriage',
  'Men',
  'Parenting',
  'Pastoral',
  'Philosophy',
  'Prayer',
  'Preaching',
  'Reference',
  'Sermons',
  'Social Issues',
  'Spiritual Warfare',
  'Theology',
  'Women',
  'World Religions',
  'Worship',
]

const typedBooks = books as ResourceBook[]
const availableCategories = categoryOrder.filter((category) =>
  typedBooks.some((book) => book.category === category),
)

export default function ResourcesPage() {
  return (
    <>
      <section className="border-b border-zinc-100 bg-zinc-950 py-14 text-white lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(240px,0.3fr)] lg:px-8">
          <div>
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: '#cdb079' }}
            >
              Resources
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Recommended Reading
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
              Books for careful study, faithful ministry, and the slow work of Christian formation.
            </p>
          </div>
          <div className="border-l border-white/10 pl-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Library
            </p>
            <p className="mt-4 text-4xl font-bold tracking-tight text-white">{typedBooks.length}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Curated recommendations across {availableCategories.length} reading categories.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="mb-8 flex items-center gap-3 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.22em] text-zinc-900">
              Books
            </span>
          </div>
          <ResourcesBooks books={typedBooks} categories={availableCategories} />
        </div>
      </section>
    </>
  )
}
