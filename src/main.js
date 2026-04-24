import { inject } from "@vercel/analytics";
import { loadSiteContent, enhanceStaticShareSections } from "./api/sanity";
import { initForms, renderNewsletterSignup } from "./ui/forms";
import { initAnimations } from "./ui/animations";

// Initialize Vercel Analytics
inject();

// Initialize Google Analytics (GA4)
function initGoogleAnalytics(id) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", id);
}

initGoogleAnalytics("G-BWWVJT58WF");

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
