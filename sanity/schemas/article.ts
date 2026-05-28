import { defineField, defineType } from 'sanity'
import { WordCountInput } from '../components/WordCountInput'

const SECTIONS = [
  { title: 'Word for Word', value: 'word-for-word' },
  { title: 'Teaching — Expositional', value: 'expositional' },
  { title: 'Teaching — Topical', value: 'topical' },
  { title: 'Exegetica', value: 'exegetica' },
  { title: 'Sermons', value: 'sermons' },
  { title: 'Forum & Pulpit', value: 'forum-and-pulpit' },
]

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',

  fieldsets: [
    {
      name: 'meta',
      title: 'Article Details',
      options: { collapsible: true, collapsed: true },
    },
  ],

  fields: [
    // ── Body first — the main writing area ────────────────────────────────
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      components: { input: WordCountInput },
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'URL' },
                  { name: 'blank', type: 'boolean', title: 'Open in new tab', initialValue: true },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    }),

    // ── Article Details — collapsed by default ────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      fieldset: 'meta',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      fieldset: 'meta',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      fieldset: 'meta',
      options: { list: SECTIONS },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Publish Date',
      type: 'date',
      fieldset: 'meta',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3, fieldset: 'meta' }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      fieldset: 'meta',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'category', title: 'Category', type: 'string', fieldset: 'meta' }),
    defineField({ name: 'image', title: 'Cover Image', type: 'image', fieldset: 'meta', options: { hotspot: true } }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'section', media: 'image' },
  },
})
