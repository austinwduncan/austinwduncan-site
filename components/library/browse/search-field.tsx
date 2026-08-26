import { BROWSE_PATH, type Params } from '@/components/library/browse/url'

/*
  Free text search, as a plain GET form.

  A form that submits to this same route puts the query in the URL, which is
  exactly where every other filter already lives, and it needs no client
  component and no JavaScript at all to work. The other active filters ride
  along as hidden inputs so searching narrows what you are already looking at
  rather than throwing it away. Paging is deliberately not carried across: a
  new query starts at the top.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function SearchField({ params }: { params: Params }) {
  const carried = Object.entries(params).filter(([key]) => key !== 'q' && key !== 'offset')

  return (
    <form action={BROWSE_PATH} method="get" className="flex min-w-0 items-stretch gap-2">
      {carried.map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <label htmlFor="library-search" className="sr-only">
        Search the Library
      </label>
      <input
        id="library-search"
        type="search"
        name="q"
        defaultValue={params.q ?? ''}
        placeholder="Search titles and summaries"
        className="min-w-0 flex-1 rounded-[2px] border px-3 py-2 text-[0.82rem] outline-none placeholder:opacity-50 focus:border-[var(--awd-gold)]"
        style={{
          fontFamily: 'var(--font-source-serif)',
          borderColor: 'rgba(238,234,225,0.16)',
          background: 'rgba(44,48,47,0.5)',
          color: 'var(--awd-bone)',
        }}
      />
      <button
        type="submit"
        className="shrink-0 rounded-[2px] px-4 text-[0.62rem] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-85"
        style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: 'var(--awd-black)' }}
      >
        Search
      </button>
    </form>
  )
}
