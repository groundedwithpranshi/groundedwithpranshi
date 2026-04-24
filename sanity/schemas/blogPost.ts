import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "category", title: "Category", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text" }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "featuredImage", title: "Featured Image URL", type: "url" }),
    defineField({ name: "featuredImageAlt", title: "Featured Image Alt", type: "string" }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
    defineField({
      name: "references",
      title: "References",
      type: "array",
      of: [
        defineField({
          name: "sourceLink",
          title: "Source Link",
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" })
          ]
        })
      ]
    })
  ]
});
