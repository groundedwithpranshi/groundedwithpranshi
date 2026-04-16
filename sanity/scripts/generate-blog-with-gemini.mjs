import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@sanity/client";

const {
  GEMINI_API_KEY,
  SANITY_STUDIO_PROJECT_ID,
  SANITY_STUDIO_DATASET = "production",
  SANITY_API_WRITE_TOKEN
} = process.env;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in environment.");
}
if (!SANITY_STUDIO_PROJECT_ID) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID in environment.");
}
if (!SANITY_API_WRITE_TOKEN) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN in environment.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
Generate blog category content for a spiritual healing website.
Return STRICT JSON only with this shape:
{
  "blogCategories": [
    {
      "title": "Spiritual Astrology",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    },
    {
      "title": "Energy",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    },
    {
      "title": "Holistic Health",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    }
  ]
}
Content style:
- warm, grounded, reflective
- practical but soulful
- no medical claims
- each item should be a compelling article title
`;

const result = await model.generateContent(prompt);
const responseText = result.response.text().trim();
const jsonText = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
const generated = JSON.parse(jsonText);

if (!Array.isArray(generated.blogCategories) || generated.blogCategories.length === 0) {
  throw new Error("Gemini response missing blogCategories.");
}

const client = createClient({
  projectId: SANITY_STUDIO_PROJECT_ID,
  dataset: SANITY_STUDIO_DATASET,
  apiVersion: "2025-01-01",
  token: SANITY_API_WRITE_TOKEN,
  useCdn: false
});

const existing = await client.fetch(`*[_type == "siteContent"][0]{_id}`);
const documentId = existing?._id || "siteContentMain";

await client.createIfNotExists({
  _id: documentId,
  _type: "siteContent"
});

await client.patch(documentId).set({ blogCategories: generated.blogCategories }).commit();

console.log("Blog categories updated in Sanity:", generated.blogCategories.length);
