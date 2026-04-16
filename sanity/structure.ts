import { StructureBuilder } from 'sanity/structure'

export const myStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singleton for Site Content - pointing to your actual existing data ID
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteContent')
            .documentId('5d7efe1d-b5ff-4223-84ac-d8985a673d99')
        ),
      S.divider(),
      // Document types
      S.documentTypeListItem('blogPost').title('Blog Posts'),
      S.documentTypeListItem('researchSection').title('Research Sections'),
      S.documentTypeListItem('curatedReading').title('Curated Readings'),
      
      ...S.documentTypeListItems().filter(
        (listItem) => !['siteContent', 'blogPost', 'researchSection', 'curatedReading', 'media.tag'].includes(listItem.getId() || '')
      )
    ])
