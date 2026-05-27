import { defineField, defineType } from 'sanity'

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
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      options: { list: SECTIONS },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'date', title: 'Published Date', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'category', title: 'Category', type: 'string' }),
    defineField({ name: 'image', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
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
  ],
  preview: {
    select: { title: 'title', subtitle: 'section', media: 'image' },
  },
})
