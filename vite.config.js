import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        blog: resolve(__dirname, 'blog.html'),
        blogNakshatra: resolve(__dirname, 'blog-nakshatra-cycle.html'),
        blogBlueprint: resolve(__dirname, 'blog-vedic-blueprint.html'),
        blogPsyche: resolve(__dirname, 'blog-vedic-psyche.html'),
        book: resolve(__dirname, 'book-a-session.html'),
        contact: resolve(__dirname, 'contact.html'),
        readings: resolve(__dirname, 'curated-readings.html'),
        disclaimer: resolve(__dirname, 'disclaimer.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        research: resolve(__dirname, 'research.html'),
        services: resolve(__dirname, 'services.html'),
      },
    },
  },
});
