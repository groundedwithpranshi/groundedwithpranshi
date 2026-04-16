import { defineField, defineType } from "sanity";

export default defineType({
  name: "researchSection",
  title: "Research Section",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: "lead", type: "text" }),
    defineField({
      name: "categories",
      type: "array",
      of: [
        {
          name: "researchCategory",
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
});
