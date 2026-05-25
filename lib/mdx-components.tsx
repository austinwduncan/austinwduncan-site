import React from 'react'
import GreekWord from '@/components/greek-tooltip'

function headingToId(text: string): string {
  return text
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (React.isValidElement(children)) {
    return extractText((children.props as { children?: React.ReactNode }).children)
  }
  return ''
}

export const mdxComponents = {
  GreekWord,
  G: GreekWord, // shorthand: <G>πιστεύει</G>
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => {
    const id = headingToId(extractText(children))
    return <h2 id={id} {...props}>{children}</h2>
  },
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => {
    const id = headingToId(extractText(children))
    return <h3 id={id} {...props}>{children}</h3>
  },
}
