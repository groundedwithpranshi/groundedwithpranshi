# Sanity CMS Setup

The project now includes a ready-to-run Sanity Studio inside `sanity/`.

## What Sanity manages

- Blog categories
- Curated favorite article groups
- Curated research paper groups
- Curated book reviews

## 1) Connect this Studio to your Sanity project

1. In `sanity/`, copy `.env.example` to `.env`
2. Set:
   - `SANITY_STUDIO_PROJECT_ID`
   - `SANITY_STUDIO_DATASET` (usually `production`)

## 2) Install and run Studio

```bash
cd sanity
npm install
npm run dev
```

Sanity Studio opens locally (usually `http://localhost:3333`).

## 3) Add your first content document

In Studio, create a new document with type `Site Content` and fill fields:
- `blogCategories`
- `curatedFavoriteArticleGroups`
- `curatedResearchPaperGroups`
- `curatedBookReviews`

Publish the document.

## 4) Connect website frontend

Edit `content/sanity-config.js` in the website root:

```js
window.SANITY_CONFIG = {
  projectId: "YOUR_SANITY_PROJECT_ID",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true
};
```

Set `projectId` and `dataset` to the same values as Studio.

## 5) Verify on website

`blog.html` and `curated-readings.html` automatically fetch from Sanity.
If Sanity is not configured yet, they safely fall back to `content/site-content.json`.

## Gemini -> Sanity blog generation

You can auto-generate blog category content with Gemini and push it to Sanity.

1. Add these to `sanity/.env`:
   - `SANITY_API_WRITE_TOKEN`
   - `GEMINI_API_KEY`
2. Run:

```bash
cd sanity
npm run generate:blog
```

This updates `blogCategories` in your `siteContent` document.

## Generate with Gemini button in Studio

There is also a Studio action button named `Generate with Gemini` on `Site Content`.

1. In `sanity/.env`, set:
   - `SANITY_STUDIO_GEMINI_API_KEY`
2. Restart Studio:

```bash
cd sanity
npm run dev
```

3. Open your `Site Content` document and click `Generate with Gemini`.

Note: Gemini uses API keys, not email login directly. Use an API key created under your Google account (`pranshij12@gmail.com`).
