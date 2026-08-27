import Artwork from '@/components/library/artwork'

/*
  The show page's frame. The grade itself lives in components/library/artwork,
  which is the single definition; this only adds the lift on hover that a card
  in a list wants and a hero backdrop does not.
*/

export default function ArtFrame({
  src,
  title,
  ratio = '16/9',
  rounded = '3px',
  className = '',
}: {
  src?: string | null
  /** Used for the title card when a piece has no artwork. */
  title: string
  ratio?: string
  rounded?: string
  className?: string
}) {
  return (
    <Artwork
      src={src ?? null}
      title={title}
      aspect={ratio}
      className={`transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] ${className}`}
      style={{ borderRadius: rounded }}
    />
  )
}
