import { inject } from "@vercel/analytics";
import { loadSiteContent, enhanceStaticShareSections } from "./api/sanity";
import { initForms, renderNewsletterSignup } from "./ui/forms";
import { initAnimations } from "./ui/animations";

// Initialize Vercel Analytics
inject();

// Initialize everything on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Load dynamic content from Sanity
  loadSiteContent();

  // Initialize UI components and animations
  initAnimations();
  initForms();

  // Enhance static share sections (like in long-form blogs)
  enhanceStaticShareSections();

  // Render newsletter signup in footers
  renderNewsletterSignup();
});
