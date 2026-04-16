import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteContent",
  title: "Site Content",
  type: "document",
  fields: [
    defineField({
      name: "homeContent",
      title: "Home Content",
      type: "object",
      fields: [
        defineField({ name: "eyebrow", type: "string" }),
        defineField({ name: "heroTitle", type: "string" }),
        defineField({ name: "heroLead", type: "text" }),
        defineField({ name: "ctaLabel", title: "Hero CTA Label", type: "string" }),
        defineField({ name: "supportTitle", title: "Support Card Title", type: "string" }),
        defineField({
          name: "supportItems",
          type: "array",
          of: [{ type: "string" }]
        })
      ]
    }),
    defineField({
      name: "aboutContent",
      title: "About Content",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Page Title", type: "string" }),
        defineField({ name: "lead", type: "text" }),
        defineField({ name: "noteTitle", type: "string" }),
        defineField({ name: "noteParagraph1", type: "text" }),
        defineField({ name: "noteParagraph2", type: "text" }),
        defineField({
          name: "bioParagraphs",
          type: "array",
          of: [{ type: "text" }]
        }),
        defineField({ name: "mission", type: "text" }),
        defineField({ name: "approach", type: "text" })
      ]
    }),
    defineField({
      name: "servicesContent",
      title: "Services Content",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Page Title", type: "string" }),
        defineField({ name: "writtenReportsTitle", type: "string" }),
        defineField({ name: "writtenReportsPrice", type: "string" }),
        defineField({
          name: "writtenReportsItems",
          type: "array",
          of: [{ type: "string" }]
        }),
        defineField({ name: "consultationTitle", type: "string" }),
        defineField({ name: "consultationPrice", type: "string" }),
        defineField({
          name: "consultationItems",
          type: "array",
          of: [{ type: "string" }]
        }),
        defineField({ name: "healingTitle", type: "string" }),
        defineField({
          name: "healingItems",
          type: "array",
          of: [{ type: "string" }]
        })
      ]
    }),
    defineField({
      name: "researchContent",
      title: "Research Content",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Page Title", type: "string" }),
        defineField({ name: "lead", title: "Lead Text", type: "text" }),
        defineField({
          name: "categories",
          title: "Research Categories",
          type: "array",
          of: [
            {
              name: "category",
              type: "object",
              fields: [
                defineField({ name: "title", type: "string" }),
                defineField({ name: "description", type: "text" }),
                defineField({
                  name: "items",
                  type: "array",
                  of: [{ type: "string" }]
                })
              ]
            }
          ]
        })
      ]
    }),
    defineField({
      name: "contactContent",
      title: "Contact Content",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Page Title", type: "string" }),
        defineField({ name: "lead", title: "Lead Text", type: "text" }),
        defineField({
          name: "details",
          title: "Contact Details List",
          type: "array",
          of: [{ type: "string" }]
        }),
        defineField({ name: "email", type: "string" }),
        defineField({ name: "whatsappUrl", title: "WhatsApp URL", type: "url" }),
        defineField({ name: "facebookUrl", title: "Facebook URL", type: "url" })
      ]
    }),
    defineField({
      name: "blogCategories",
      type: "array",
      of: [
        {
          name: "category",
          type: "object",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "description", type: "text" }),
            defineField({
              name: "items",
              type: "array",
              of: [{ type: "string" }]
            })
          ]
        }
      ]
    }),
    defineField({
      name: "blogArticles",
      type: "array",
      of: [
        {
          name: "article",
          type: "object",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({ name: "category", type: "string" }),
            defineField({ name: "featuredImage", title: "Featured Image URL", type: "url" }),
            defineField({ name: "featuredImageAlt", type: "string" }),
            defineField({ name: "excerpt", type: "text" }),
            defineField({ name: "content", title: "Article Content", type: "text" }),
            defineField({
              name: "references",
              type: "array",
              of: [
                {
                  name: "sourceLink",
                  type: "object",
                  fields: [
                    defineField({ name: "label", type: "string" }),
                    defineField({ name: "url", title: "URL", type: "url" })
                  ]
                }
              ]
            })
          ]
        }
      ]
    }),
    defineField({
      name: "curatedFavoriteArticleGroups",
      type: "array",
      of: [
        {
          name: "favoriteGroup",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Group Title", type: "string" }),
            defineField({
              name: "items",
              type: "array",
              of: [
                {
                  name: "item",
                  type: "object",
                  fields: [
                    defineField({ name: "title", type: "string" }),
                    defineField({ name: "url", title: "URL", type: "url" })
                  ]
                }
              ]
            })
          ]
        }
      ]
    }),
    defineField({
      name: "curatedResearchPaperGroups",
      type: "array",
      of: [
        {
          name: "researchGroup",
          type: "object",
          fields: [
            defineField({ name: "title", title: "Group Title", type: "string" }),
            defineField({
              name: "items",
              type: "array",
              of: [
                {
                  name: "item",
                  type: "object",
                  fields: [
                    defineField({ name: "title", type: "string" }),
                    defineField({ name: "url", title: "URL", type: "url" })
                  ]
                }
              ]
            })
          ]
        }
      ]
    }),
    defineField({
      name: "curatedBookReviews",
      type: "array",
      of: [{ type: "string" }]
    })
  ]
});
