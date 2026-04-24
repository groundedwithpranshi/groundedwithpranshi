import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = createClient({
  projectId: 'ekgdhoas',
  dataset: 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_STUDIO_GEMINI_API_KEY, 
  useCdn: false,
});

async function migrate() {
  const siteId = '5d7efe1d-b5ff-4223-84ac-d8985a673d99';
  
  console.log('--- Phase 1: Migrating Site Content Articles ---');
  const site = await client.getDocument(siteId);
  
  if (!site || !site.blogArticles) {
    console.log('No blogArticles found in site content.');
  } else {
    console.log(`Found ${site.blogArticles.length} articles to migrate.`);
    
    for (const article of site.blogArticles) {
      console.log(`Migrating: ${article.title}`);
      
      const doc = {
        _type: 'blogPost',
        title: article.title,
        category: article.category,
        excerpt: article.excerpt,
        content: stringToPortableText(article.content),
        featuredImage: article.featuredImage,
        featuredImageAlt: article.featuredImageAlt,
        references: article.references,
      };
      
      try {
        await client.create(doc);
        console.log(`✅ Created standalone post for "${article.title}"`);
      } catch (err) {
        console.error(`❌ Failed to create post for "${article.title}":`, err.message);
      }
    }
    
    console.log('Cleaning up: Unsetting legacy blogArticles field from Site Settings...');
    await client.patch(siteId).unset(['blogArticles']).commit();
    console.log('✅ Legacy field removed.');
  }

  console.log('\n--- Phase 2: Converting Existing Blog Posts to Rich Text ---');
  const blogPosts = await client.fetch('*[_type == "blogPost"]');
  
  for (const post of blogPosts) {
    if (typeof post.content === 'string') {
      console.log(`Converting content format: ${post.title}`);
      try {
        await client.patch(post._id)
          .set({ content: stringToPortableText(post.content) })
          .commit();
        console.log(`✅ Converted "${post.title}" to Rich Text.`);
      } catch (err) {
        console.error(`❌ Failed to convert "${post.title}":`, err.message);
      }
    } else {
      console.log(`Skipping (already rich text): ${post.title}`);
    }
  }

  console.log('\nMigration complete! You can now edit all articles in the "Blog Posts" section.');
}

function stringToPortableText(text) {
  if (!text) return [];
  // Split by double newlines into paragraphs
  return text.split(/\n{2,}/).map(para => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text: para.trim() }]
  }));
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
