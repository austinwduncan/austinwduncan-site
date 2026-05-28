import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { projectId, dataset, apiVersion } from './sanity/env'
import { schemaTypes } from './sanity/schemas'

const SECTION_LABELS: Record<string, string> = {
  'word-for-word': 'Word for Word',
  'expositional': 'Teaching — Expositional',
  'topical': 'Teaching — Topical',
  'exegetica': 'Exegetica',
  'sermons': 'Sermons',
  'forum-and-pulpit': 'Forum & Pulpit',
}

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // One list per section, so articles are grouped cleanly
            ...Object.entries(SECTION_LABELS).map(([value, title]) =>
              S.listItem()
                .title(title)
                .child(
                  S.documentList()
                    .title(title)
                    .filter('_type == "article" && section == $section')
                    .params({ section: value })
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                )
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
