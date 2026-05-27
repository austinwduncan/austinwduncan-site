import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { projectId, dataset, apiVersion } from './sanity/env'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion,
  plugins: [
    structureTool(),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
