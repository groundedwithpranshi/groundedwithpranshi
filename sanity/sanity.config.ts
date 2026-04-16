import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { GenerateBlogWithGeminiAction } from './actions/generateBlogWithGeminiAction'
import { myStructure } from './structure'

export default defineConfig({
  name: 'default',
  title: 'Grounded With Pranshi',
  projectId: 'ekgdhoas',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: myStructure,
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'siteContent') {
        return [...prev, GenerateBlogWithGeminiAction]
      }
      return prev
    },
  },
})
