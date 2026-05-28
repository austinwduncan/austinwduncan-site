import { ArrayOfObjectsInputProps } from 'sanity'

function countWords(blocks: unknown[]): number {
  if (!Array.isArray(blocks)) return 0
  return blocks.reduce((total, block: any) => {
    if (block?._type === 'block' && Array.isArray(block.children)) {
      return total + block.children.reduce((c: number, span: any) => {
        return c + (span?.text?.trim().split(/\s+/).filter(Boolean).length ?? 0)
      }, 0)
    }
    return total
  }, 0)
}

export function WordCountInput(props: ArrayOfObjectsInputProps) {
  const words = countWords((props.value ?? []) as unknown[])
  const minutes = Math.max(1, Math.round(words / 200))
  return (
    <div>
      {props.renderDefault(props)}
      {words > 0 && (
        <p style={{ fontSize: '12px', color: '#888888', marginTop: '8px', marginBottom: 0 }}>
          {words.toLocaleString()} words · ~{minutes} min read
        </p>
      )}
    </div>
  )
}
