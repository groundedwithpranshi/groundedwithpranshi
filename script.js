const yearNodes = document.querySelectorAll(".current-year");

yearNodes.forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const forms = document.querySelectorAll("[data-form]");

forms.forEach((form) => {
  const status = form.querySelector(".form-status");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailTarget = "groundedwithpranshi@zohomail.in";
    const formData = new FormData(form);
    const message = Array.from(formData.entries())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const subject = encodeURIComponent("Website inquiry - groundedwithpranshi");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${emailTarget}?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent =
        "Thank you. Your request has been received and you will hear from Pranshi soon.";
    }
    setTimeout(() => form.reset(), 250);
  });
});

function renderNewsletterSignup() {
  const footers = document.querySelectorAll("footer");
  if (footers.length === 0) return;
  const substackPublicationUrl =
    String(window.SUBSTACK_PUBLICATION_URL || window.SANITY_CONFIG?.substackPublicationUrl || "").trim();
  const substackSubscribeUrl = normalizeSubstackSubscribeUrl(substackPublicationUrl);

  footers.forEach((footer) => {
    if (footer.querySelector("[data-newsletter-block]")) return;

    const block = document.createElement("section");
    block.className = "newsletter-block";
    block.setAttribute("data-newsletter-block", "");
    block.innerHTML = `
      <div class="newsletter-inner">
        <p class="eyebrow">Stay Connected</p>
        <h3>Subscribe to the Grounded Newsletter</h3>
        <p>
          Receive philosophical and literary quotes, daily affirmations,
          holistic health tips, and gentle transit-energy guidance from the universe.
        </p>
        ${
          substackSubscribeUrl
            ? `<form class="newsletter-form" action="${substackSubscribeUrl}" method="post" target="_blank" rel="noopener noreferrer">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  required
                  aria-label="Email address"
                />
                <input type="hidden" name="source" value="groundedwithpranshi.com newsletter block" />
                <button type="submit">Subscribe</button>
              </form>
              <p class="newsletter-status">You will complete confirmation on Substack in a new tab.</p>`
            : `<form class="newsletter-form" data-newsletter-form>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  required
                  aria-label="Email address"
                />
                <button type="submit">Subscribe</button>
              </form>
              <p class="newsletter-status" data-newsletter-status></p>`
        }
      </div>
    `;

    const firstChild = footer.firstElementChild;
    if (firstChild) {
      footer.insertBefore(block, firstChild);
    } else {
      footer.appendChild(block);
    }
  });
}

function normalizeSubstackSubscribeUrl(publicationUrl) {
  if (!publicationUrl) return "";
  const clean = publicationUrl.replace(/\/+$/, "");
  if (!/^https?:\/\//.test(clean)) return "";
  return `${clean}/api/v1/free?nojs=true`;
}

const quotes = Array.from(document.querySelectorAll("[data-quote]"));
let activeQuote = 0;

if (quotes.length > 1) {
  setInterval(() => {
    quotes[activeQuote].classList.remove("is-active");
    activeQuote = (activeQuote + 1) % quotes.length;
    quotes[activeQuote].classList.add("is-active");
  }, 4200);
}

const rootTriggers = document.querySelectorAll("[data-root-trigger]");
const heroRootLayer = document.querySelector(".home-hero-night");
let rootHighlightTimer;

rootTriggers.forEach((node) => {
  const pulseRoots = () => {
    if (!heroRootLayer) return;
    heroRootLayer.classList.add("root-highlight");
    window.clearTimeout(rootHighlightTimer);
    rootHighlightTimer = window.setTimeout(() => {
      heroRootLayer.classList.remove("root-highlight");
    }, 1000);
  };

  node.addEventListener("mouseenter", pulseRoots);
  node.addEventListener("touchstart", pulseRoots, { passive: true });
});

const tarotFlips = document.querySelectorAll("[data-tarot-flip]");
tarotFlips.forEach((card) => {
  card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.classList.toggle("is-flipped");
    }
  });
});

const parallaxImages = document.querySelectorAll("[data-parallax-image]");

if (parallaxImages.length > 0) {
  const updateParallax = () => {
    parallaxImages.forEach((image) => {
      const rect = image.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const imageCenter = rect.top + rect.height / 2;
      const offset = (imageCenter - viewportCenter) * -0.04;
      const clampedOffset = Math.max(-12, Math.min(12, offset));
      image.style.transform = `translateY(${clampedOffset.toFixed(2)}px)`;
    });
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
}

async function loadSiteContent() {
  try {
    const data = (await loadSiteContentFromSanity()) || (await loadSiteContentFromJson());
    if (!data) return;
    renderHomeContent(data.homeContent || {});
    renderAboutContent(data.aboutContent || {});
    renderServicesContent(data.servicesContent || {});
    renderResearchContent(data.researchSection || data.researchContent || {});
    renderContactContent(data.contactContent || {});
    const categories = data.blogCategories || [];
    const baseArticles = mergeBlogArticles(data.blogPosts || [], data.blogArticles || []);
    const articles = ensureCategoryArticles(categories, baseArticles);
    renderBlogCategories(categories);
    renderBlogArticles(articles);

    const curatedFromDedicated = buildCuratedFromEntries(data.curatedReadings || []);
    const favoriteGroups =
      curatedFromDedicated.favoriteGroups.length > 0
        ? curatedFromDedicated.favoriteGroups
        : data.curatedFavoriteArticleGroups || [];
    const researchGroups =
      curatedFromDedicated.researchGroups.length > 0
        ? curatedFromDedicated.researchGroups
        : data.curatedResearchPaperGroups || [];
    const bookReviews =
      curatedFromDedicated.bookReviews.length > 0
        ? curatedFromDedicated.bookReviews
        : data.curatedBookReviews || [];

    renderGroupedCuratedLinks(document.querySelector("[data-curated-favorite-groups]"), favoriteGroups);
    renderGroupedCuratedLinks(document.querySelector("[data-curated-research-groups]"), researchGroups);
    renderCuratedList(document.querySelector("[data-curated-book-reviews]"), bookReviews, formatCuratedBookReview);
  } catch {
    // Keep existing fallback HTML if content file is unavailable.
  }
}

async function loadSiteContentFromSanity() {
  const sanity = window.SANITY_CONFIG;
  if (!sanity || !sanity.projectId || sanity.projectId === "YOUR_SANITY_PROJECT_ID") {
    return null;
  }

  const query = encodeURIComponent(`{
    "site": *[_type=="siteContent"][0]{homeContent, aboutContent, servicesContent, researchContent, contactContent, blogCategories, blogArticles, curatedFavoriteArticleGroups, curatedResearchPaperGroups, curatedBookReviews},
    "blogPosts": *[_type=="blogPost"] | order(order asc, _createdAt desc){title, category, excerpt, content, featuredImage, featuredImageAlt, references},
    "researchSection": *[_type=="researchSection"][0]{title, lead, categories},
    "curatedReadings": *[_type=="curatedReading"] | order(section asc, groupTitle asc, order asc, _createdAt desc){section, groupTitle, title, url, summary}
  }`);
  const version = normalizeSanityApiVersion(sanity.apiVersion);
  const url = `https://${sanity.projectId}.api.sanity.io/${version}/data/query/${sanity.dataset || "production"}?query=${query}`;
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) return null;
  const payload = await response.json();
  if (!payload?.result) return null;
  return {
    ...(payload.result.site || {}),
    blogPosts: payload.result.blogPosts || [],
    researchSection: payload.result.researchSection || null,
    curatedReadings: payload.result.curatedReadings || []
  };
}

function normalizeSanityApiVersion(version) {
  const value = String(version || "").trim();
  if (!value) return "v2025-01-01";
  return value.startsWith("v") ? value : `v${value}`;
}

async function loadSiteContentFromJson() {
  const response = await fetch("content/site-content.json", { cache: "no-cache" });
  if (!response.ok) return null;
  return response.json();
}

function renderBlogCategories(categories) {
  const container = document.querySelector("[data-blog-categories]");
  if (!container || categories.length === 0) return;
  container.innerHTML = categories
    .map(
      (category) => `
      <article class="card">
        <h2>${category.title}</h2>
        <p>${category.description}</p>
        <ul class="plain-list">
          ${(category.items || [])
            .map((item) => {
              const targetId = buildArticleId(item);
              return `<li><a class="blog-category-link" href="#${targetId}" data-scroll-target="${targetId}">${item}</a></li>`;
            })
            .join("")}
        </ul>
      </article>
    `
    )
    .join("");
  wireCategoryHoverScroll(container);
}

function renderBlogArticles(articles) {
  const container = document.querySelector("[data-blog-articles]");
  if (!container || !Array.isArray(articles) || articles.length === 0) return;

  container.innerHTML = articles
    .map((article) => {
      const featuredImageHtml = article.featuredImage
        ? `<img class="blog-featured-image" src="${article.featuredImage}" alt="${article.featuredImageAlt || article.title || "Blog featured image"}" loading="lazy" />`
        : "";
      
      const articleId = buildArticleId(article.title || "");

      return `
      <article class="card blog-tile" id="${articleId}">
        <p class="eyebrow">${article.category || "Blog"}</p>
        ${featuredImageHtml}
        <h3>${article.title || ""}</h3>
        <p class="tile-excerpt"><em>${article.excerpt || ""}</em></p>
        <button class="btn btn-outline" data-article-trigger="${articleId}">Read Full Article</button>
      </article>
    `;
    })
    .join("");
  
  wireArticleTriggers(articles);
}

function wireArticleTriggers(articles) {
  const buttons = document.querySelectorAll("[data-article-trigger]");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const articleId = button.getAttribute("data-article-trigger");
      const article = articles.find(a => buildArticleId(a.title) === articleId);
      if (article) {
        showArticleModal(article);
      }
    });
  });
}

function showArticleModal(article) {
  const paragraphs = String(article.content || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");

  const references = Array.isArray(article.references) ? article.references : [];
  const referencesHtml =
    references.length > 0
      ? `<h4>Sources</h4><ul class="plain-list">${references
          .map(
            (reference) =>
              `<li><a href="${reference.url}" target="_blank" rel="noopener noreferrer">${reference.label}</a></li>`
          )
          .join("")}</ul>`
      : "";

  const shareHtml = buildShareSection(article);

  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "article-modal";
  modal.innerHTML = `
    <div class="article-modal-content card">
      <button class="modal-close" aria-label="Close article">&times;</button>
      <p class="eyebrow">${article.category || "Blog"}</p>
      <h2>${article.title || ""}</h2>
      <div class="article-modal-body">
        ${paragraphs}
        ${referencesHtml}
      </div>
      ${shareHtml}
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden"; // Prevent scrolling

  const close = modal.querySelector(".modal-close");
  const closeModal = () => {
    document.body.removeChild(modal);
    document.body.style.overflow = "";
  };

  close.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };
}

function buildShareSection(article) {
  return buildShareSectionMarkup(article.title || "groundedwithpranshi", window.location.href);
}

function buildShareSectionMarkup(titleText, urlText) {
  const title = encodeURIComponent(titleText || "groundedwithpranshi");
  const rawUrl = String(urlText || window.location.href);
  const shareUrl = encodeURIComponent(rawUrl);
  return `
    <section class="post-share">
      <h4>Share this post</h4>
      <div class="post-share-links">
        <a class="share-icon-btn" href="https://wa.me/?text=${title}%20${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.6 2.4A7.86 7.86 0 0 0 8 0a7.95 7.95 0 0 0-6.9 11.9L0 16l4.2-1.1A7.95 7.95 0 1 0 13.6 2.4ZM8 14.5a6.5 6.5 0 0 1-3.3-.9l-.2-.1-2.5.7.7-2.4-.2-.2A6.5 6.5 0 1 1 8 14.5Zm3.6-4.8c-.2-.1-1-.5-1.1-.6-.2-.1-.3-.1-.4.1-.1.2-.5.6-.6.7-.1.1-.2.1-.4 0-.9-.4-1.6-1-2.2-1.9-.1-.2 0-.3.1-.4.1-.1.2-.3.3-.4.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3s-.4-1-.6-1.4c-.2-.4-.4-.3-.6-.3h-.5c-.2 0-.4.1-.5.3-.2.2-.7.7-.7 1.7s.7 1.9.8 2c.1.1 1.4 2.2 3.4 3 .5.2.8.3 1.1.4.5.1.9.1 1.2.1.4-.1 1-.5 1.2-1 .2-.5.2-.9.1-1 0-.1-.2-.1-.4-.2Z"/></svg>
        </a>
        <a class="share-icon-btn" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" title="Share on Facebook">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8.05A8 8 0 1 0 6.75 15.95v-5.63H4.72V8.05h2.03V6.32c0-2 1.2-3.1 3.02-3.1.87 0 1.78.15 1.78.15v1.97h-1c-.98 0-1.28.6-1.28 1.23v1.48h2.19l-.35 2.27H9.27v5.63A8 8 0 0 0 16 8.05Z"/></svg>
        </a>
        <a class="share-icon-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.2 2.1C1.2 1.5 1.7 1 2.3 1s1.1.5 1.1 1.1-.5 1.1-1.1 1.1S1.2 2.7 1.2 2.1ZM1.3 4.1h2V15h-2V4.1ZM5.1 4.1H7v1.5h.1c.3-.6 1.1-1.7 2.7-1.7 2.9 0 3.4 1.9 3.4 4.4V15h-2V9.2c0-1.4 0-3.2-1.9-3.2-1.9 0-2.2 1.5-2.2 3.1V15h-2V4.1Z"/></svg>
        </a>
        <a class="share-icon-btn" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Share on Instagram" title="Share on Instagram">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.917 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.917 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>
        </a>
        <a class="share-icon-btn" href="mailto:?subject=${title}&body=${shareUrl}" aria-label="Share by Email" title="Share by Email">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3h13A1.5 1.5 0 0 1 16 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 11.5v-7A1.5 1.5 0 0 1 1.5 3Zm0 1L8 8.3 14.5 4h-13Zm13.5 1.2L8.4 9.6a.8.8 0 0 1-.8 0L1 5.2v6.3c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V5.2Z"/></svg>
        </a>
        <button class="share-icon-btn" type="button" data-share-copy-url="${rawUrl}" aria-label="Copy link" title="Copy link">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 1a2 2 0 0 1 2 2v1h-1V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1v1H4a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h6Zm2 4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6Zm0 1H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z"/></svg>
        </button>
      </div>
    </section>
  `;
}

function enhanceStaticShareSections() {
  const blocks = document.querySelectorAll("[data-share-section]");
  blocks.forEach((block) => {
    const title = block.getAttribute("data-share-title") || document.title || "groundedwithpranshi";
    const url = block.getAttribute("data-share-url") || window.location.href;
    block.innerHTML = buildShareSectionMarkup(title, url);
  });
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-share-copy-url]");
  if (!button) return;
  const url = button.getAttribute("data-share-copy-url");
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    const previousLabel = button.getAttribute("aria-label");
    const previousTitle = button.getAttribute("title");
    button.setAttribute("aria-label", "Copied");
    button.setAttribute("title", "Copied");
    window.setTimeout(() => {
      button.setAttribute("aria-label", previousLabel || "Copy link");
      button.setAttribute("title", previousTitle || "Copy link");
    }, 1400);
  } catch {
    button.setAttribute("title", "Copy failed");
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-newsletter-form]");
  if (!form) return;
  event.preventDefault();

  const formData = new FormData(form);
  const email = String(formData.get("email") || "").trim();
  const status = form.parentElement?.querySelector("[data-newsletter-status]");
  if (!email) return;

  const subject = encodeURIComponent("Newsletter subscription request");
  const body = encodeURIComponent(
    `Please subscribe this email to the Grounded newsletter:\n\n${email}\n\nInterests:\n- Philosophical/Literary Quotes\n- Daily Affirmations\n- Health Tips and Reminders\n- Transits and Energy Guidance`
  );
  window.location.href = `mailto:groundedwithpranshi@zohomail.in?subject=${subject}&body=${body}`;

  if (status) {
    status.textContent = "Thank you. Your subscription request is ready to send.";
  }
  form.reset();
});

function wireCategoryHoverScroll(container) {
  const links = container.querySelectorAll("[data-scroll-target]");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const targetId = link.getAttribute("data-scroll-target");
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderHomeContent(home) {
  setText("[data-home-eyebrow]", home.eyebrow);
  setText("[data-home-title]", home.heroTitle);
  setText("[data-home-lead]", home.heroLead);
  setText("[data-home-cta-label]", home.ctaLabel);
  setText("[data-home-support-title]", home.supportTitle);
  setList("[data-home-support-items]", home.supportItems || []);
}

function renderAboutContent(about) {
  setText("[data-about-title]", about.title);
  setText("[data-about-lead]", about.lead);
  setText("[data-about-note-title]", about.noteTitle);
  setText("[data-about-note-paragraph-1]", about.noteParagraph1);
  setText("[data-about-note-paragraph-2]", about.noteParagraph2);
  setText("[data-about-mission]", about.mission);
  setText("[data-about-approach]", about.approach);

  const bioContainer = document.querySelector("[data-about-bio]");
  if (bioContainer && Array.isArray(about.bioParagraphs) && about.bioParagraphs.length > 0) {
    bioContainer.innerHTML = about.bioParagraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }
}

function renderServicesContent(services) {
  setText("[data-services-title]", services.title);
  setText("[data-services-written-title]", services.writtenReportsTitle);
  setText("[data-services-written-price]", services.writtenReportsPrice);
  setText("[data-services-consultation-title]", services.consultationTitle);
  setText("[data-services-consultation-price]", services.consultationPrice);
  setText("[data-services-healing-title]", services.healingTitle);

  setServiceList("[data-services-written-items]", services.writtenReportsItems || []);
  setServiceList("[data-services-consultation-items]", services.consultationItems || []);
  setServiceList("[data-services-healing-items]", services.healingItems || []);
}

function renderResearchContent(research) {
  setText("[data-research-title]", research.title);
  setText("[data-research-lead]", research.lead);

  const container = document.querySelector("[data-research-categories]");
  if (!container || !Array.isArray(research.categories) || research.categories.length === 0) return;
  container.innerHTML = research.categories
    .map(
      (category) => `
      <article class="card">
        <h2>${category.title}</h2>
        <p>${category.description || ""}</p>
        <ul class="plain-list">
          ${(category.items || []).map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `
    )
    .join("");
}

function renderContactContent(contact) {
  setText("[data-contact-title]", contact.title);
  setText("[data-contact-lead]", contact.lead);
  setList("[data-contact-details]", contact.details || []);

  setLink("[data-contact-email-link]", contact.email ? `mailto:${contact.email}` : "");
  setLink("[data-contact-whatsapp-link]", contact.whatsappUrl);
  setLink("[data-contact-facebook-link]", contact.facebookUrl);
}

function setText(selector, value) {
  if (!value) return;
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function setList(selector, items) {
  const node = document.querySelector(selector);
  if (!node || !Array.isArray(items) || items.length === 0) return;
  node.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function setLink(selector, href) {
  if (!href) return;
  const node = document.querySelector(selector);
  if (node) node.setAttribute("href", href);
}

function setServiceList(selector, items) {
  const node = document.querySelector(selector);
  if (!node || !Array.isArray(items) || items.length === 0) return;

  node.innerHTML = items
    .map(
      (item) =>
        `<li><a href="https://calendly.com/groundedwithpranshi/30min" target="_blank" rel="noopener noreferrer">${item}</a></li>`
    )
    .join("");
}

function renderCuratedList(container, items, renderer) {
  if (!container || items.length === 0) return;
  container.innerHTML = items
    .map((item) => `<li>${renderer(item)}</li>`)
    .join("");
}

function formatCuratedBookReview(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  if (item.url) {
    return `<a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title || item.summary || "Read review"}</a>`;
  }
  return item.summary || item.title || "";
}

function buildCuratedFromEntries(entries) {
  const favoriteMap = new Map();
  const researchMap = new Map();
  const bookReviews = [];

  entries.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const section = entry.section;
    const groupTitle = entry.groupTitle || "General";

    if (section === "favoriteArticles" || section === "researchPapers") {
      const targetMap = section === "favoriteArticles" ? favoriteMap : researchMap;
      if (!targetMap.has(groupTitle)) targetMap.set(groupTitle, []);
      targetMap.get(groupTitle).push({
        title: entry.title || "Untitled",
        url: entry.url || "#"
      });
      return;
    }

    if (section === "bookReviews") {
      bookReviews.push({
        title: entry.title || "",
        summary: entry.summary || "",
        url: entry.url || ""
      });
    }
  });

  const mapToGroups = (groupMap) =>
    Array.from(groupMap.entries()).map(([title, items]) => ({
      title,
      items
    }));

  return {
    favoriteGroups: mapToGroups(favoriteMap),
    researchGroups: mapToGroups(researchMap),
    bookReviews
  };
}

function mergeBlogArticles(primary, fallback) {
  const map = new Map();
  [...primary, ...fallback].forEach((article) => {
    if (!article || typeof article !== "object") return;
    const key = String(article.title || article._key || Math.random());
    if (!map.has(key)) map.set(key, article);
  });
  return Array.from(map.values());
}

function ensureCategoryArticles(categories, articles) {
  const normalizedArticles = Array.isArray(articles) ? [...articles] : [];
  const existingTitles = new Set(
    normalizedArticles
      .map((article) => normalizeTitle(article?.title))
      .filter(Boolean)
  );

  categories.forEach((category) => {
    (category.items || []).forEach((item) => {
      const normalizedItem = normalizeTitle(item);
      if (!normalizedItem || existingTitles.has(normalizedItem)) return;
      normalizedArticles.push(createGeneratedArticle(category.title || "Blog", item));
      existingTitles.add(normalizedItem);
    });
  });

  return normalizedArticles;
}

function createGeneratedArticle(category, item) {
  return {
    title: item,
    category,
    excerpt: `A deeply reflective long-form contemplation on ${item.toLowerCase()}, written as a gentle inner dialogue for your healing path.`,
    content: buildReflectiveArticleContent(category, item),
    references: []
  };
}

function buildReflectiveArticleContent(category, item) {
  const topic = String(item || "this threshold");
  return `Dear reader, if this article has found you, perhaps life is already speaking in quiet symbols: a repeated emotional pattern, a subtle tiredness that no amount of productivity can solve, a longing to return to yourself without performing strength for the world. In the language of ${category.toLowerCase()}, ${topic.toLowerCase()} is not merely a concept to understand; it is an invitation to remember your own center. Reflection begins when we stop asking only, "How do I fix this?" and begin asking, "What is this moment trying to teach my heart, my body, and my consciousness together?"\n\nMost of us were trained to override our inner rhythms. We learned to continue through exhaustion, to explain away intuition, to doubt emotions unless they looked rational, and to postpone care until crisis. But deep transformation rarely begins in dramatic breakthroughs. It begins in honest noticing. It begins when you admit, without shame, what is true for you right now. Are you carrying fear in your chest? Is your mind rehearsing worst-case outcomes? Are you saying yes while your body whispers no? If so, this is not failure. This is sacred data. Your inner life is not broken; it is communicating.\n\nTo practice ${topic.toLowerCase()} in a grounded way, start with presence before analysis. Sit quietly for a few minutes. Feel your breath without trying to improve it. Let your exhale be slightly longer than your inhale. Place one hand on your heart and one on your lower belly, and simply witness what is here. This small ritual signals safety to the nervous system and creates a gap between trigger and reaction. In that gap, wisdom can emerge. You begin to respond instead of react. You begin to choose instead of repeat.\n\nNow ask yourself three reflective questions with compassion: What am I afraid will happen if I soften? What belief am I protecting by staying in this pattern? What would one gentle, courageous action look like today? Do not rush these questions. Let them open slowly, like moonlight spreading across still water. Journaling can help. Write without editing. Write as if no one will read it. Honesty on paper often reveals where the soul has been waiting for your permission.\n\nAs you continue, remember that healing is rhythmic, not linear. Some days you will feel clear and aligned; other days old stories may return with surprising intensity. This does not mean you are going backward. It means deeper layers are becoming available for integration. Every wave that rises can be met with steadier witnessing. You are not asked to be perfect; you are asked to stay present. The path deepens through repetition of simple, loving practices: pausing, breathing, naming, choosing, and returning.\n\nIn relationships, ${topic.toLowerCase()} asks for boundaries that are kind, not defensive. A boundary is not punishment; it is clarity. It says, "I honor your humanity, and I also honor my capacity." When you communicate from grounded truth, your words carry less resentment and more integrity. You become less available for drama and more available for depth. This shift changes not only what you tolerate, but what you attract. Coherence invites coherence.\n\nSpiritually, this journey is about moving from self-judgment to self-respect. The inner critic may insist that you should already be "healed enough" by now. Let that voice pass like weather. Real maturity is quieter: it is the ability to remain devoted to your process without turning it into performance. The soul does not grow by force; it grows through faithful attention. When you treat your inner world as worthy of care, your outer decisions begin to reflect that worth.\n\nSo take this message with you: ${topic} is your doorway, not your burden. You are allowed to heal slowly. You are allowed to rest before you are empty. You are allowed to become a person who trusts herself again. Let this be your next step: one breath, one honest choice, one compassionate boundary, one aligned action. Over time, these small acts become a new identity. And from that identity, a new life quietly begins.`;
}

function buildArticleId(value) {
  return `article-${normalizeTitle(value) || "entry"}`;
}

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function renderGroupedCuratedLinks(container, groups) {
  if (!container || groups.length === 0) return;
  container.innerHTML = groups
    .map(
      (group) => `
      <h3>${group.title}</h3>
      <ul class="plain-list">
        ${(group.items || [])
          .map(
            (item) =>
              `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></li>`
          )
          .join("")}
      </ul>
    `
    )
    .join("");
}

loadSiteContent();
enhanceStaticShareSections();
renderNewsletterSignup();
