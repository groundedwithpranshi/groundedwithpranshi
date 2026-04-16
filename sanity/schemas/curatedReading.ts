import { defineField, defineType } from "sanity";

export default defineType({
  name: "curatedReading",
  title: "Curated Reading",
  type: "document",
  fields: [
    defineField({
      name: "section",
      type: "string",
      options: {
        list: [
          { title: "Favorite Articles", value: "favoriteArticles" },
          { title: "Research Papers", value: "researchPapers" },
          { title: "Book Reviews", value: "bookReviews" }
        ]
      },
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "groupTitle", type: "string" }),
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "summary", type: "text" }),
    defineField({ name: "order", title: "Display Order", type: "number" })
  ]
});
