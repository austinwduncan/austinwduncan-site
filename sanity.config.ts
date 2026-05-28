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

const SECTIONS_WITH_SERIES = new Set(['expositional', 'topical'])

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion,
  plugins: [
    structureTool({
      structure: async (S, context) => {
        const client = context.getClient({ apiVersion: '2024-01-01' })

        const items = await Promise.all(
          Object.entries(SECTION_LABELS).map(async ([value, title]) => {
            if (!SECTIONS_WITH_SERIES.has(value)) {
              return S.listItem()
                .title(title)
                .child(
                  S.documentList()
                    .title(title)
                    .filter('_type == "article" && section == $section')
                    .params({ section: value })
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                )
            }

            // Fetch distinct series names for this teaching section
            const seriesList: string[] = await client.fetch(
              `array::unique(*[_type == "article" && section == $section && defined(series) && series != ""].series) | order(@)`,
              { section: value }
            )

            return S.listItem()
              .title(title)
              .child(
                S.list()
                  .title(title)
                  .items([
                    S.listItem()
                      .title('All Articles')
                      .child(
                        S.documentList()
                          .title('All Articles')
                          .filter('_type == "article" && section == $section')
                          .params({ section: value })
                          .defaultOrdering([{ field: 'date', direction: 'desc' }])
                      ),
                    ...(seriesList.length > 0 ? [S.divider()] : []),
                    ...seriesList.map((series) =>
                      S.listItem()
                        .title(series)
                        .child(
                          S.documentList()
                            .title(series)
                            .filter('_type == "article" && section == $section && series == $series')
                            .params({ section: value, series })
                            .defaultOrdering([{ field: 'date', direction: 'desc' }])
                        )
                    ),
                  ])
              )
          })
        )

        return S.list().title('Content').items(items)
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
