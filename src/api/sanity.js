import {
  setText,
  setList,
  setLink,
  setServiceList,
  renderCuratedList,
  buildArticleId,
  normalizeTitle,
  normalizeSanityApiVersion
} from "../utils/helpers";

export async function loadSiteContent() {
  try {
    console.log("[Sanity Debug] Attempting to load content...");
    const sanityData = await loadSiteContentFromSanity();
    
    let data;
    if (sanityData) {
      console.log("[Sanity Debug] Successfully loaded from Sanity API:", sanityData);
      data = sanityData;
    } else {
      console.warn("[Sanity Debug] Sanity fetch failed or returned no result. Falling back to local JSON.");
      data = await loadSiteContentFromJson();
      console.log("[Sanity Debug] Loaded fallback data from JSON:", data);
    }

    if (!data) {
      console.error("[Sanity Debug] No content data found from any source.");
      return;
    }

    renderHomeContent(data.homeContent || {});
    renderAboutContent(data.aboutContent || {});
    renderServicesContent(data.servicesContent || {});
    
    // Support both the legacy 'researchContent' object inside site settings 
    // and the new standalone 'researchSection' document type.
    const researchData = data.researchSection || data.researchContent || {};
    console.log("[Sanity Debug] Research data:", researchData);
    renderResearchContent(researchData);
    
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
  } catch (err) {
    console.error("Failed to load site content:", err);
  }
}

async function loadSiteContentFromSanity() {
  const sanity = window.SANITY_CONFIG || {
    projectId: "ekgdhoas",
    dataset: "production",
    apiVersion: "v2025-01-01",
    useCdn: true
  };
  
  if (!sanity.projectId || sanity.projectId === "YOUR_SANITY_PROJECT_ID") {
    return null;
  }

  // Use the specific document ID from sanity/structure.ts for robust content retrieval
  const siteId = "5d7efe1d-b5ff-4223-84ac-d8985a673d99";
  const query = encodeURIComponent(`{
    "site": *[_type=="siteContent" && _id == "${siteId}"][0]{homeContent, aboutContent, servicesContent, researchContent, contactContent, blogCategories, blogArticles, curatedFavoriteArticleGroups, curatedResearchPaperGroups, curatedBookReviews},
    "blogPosts": *[_type=="blogPost"] | order(order asc, _createdAt desc){title, category, excerpt, content, featuredImage, featuredImageAlt, references},
    "researchSection": *[_type=="researchSection"][0]{title, lead, categories},
    "curatedReadings": *[_type=="curatedReading"] | order(section asc, groupTitle asc, order asc, _createdAt desc){section, groupTitle, title, url, summary}
  }`);
  
  const version = normalizeSanityApiVersion(sanity.apiVersion);
  const host = sanity.useCdn ? "apicdn.sanity.io" : "api.sanity.io";
  const url = `https://${sanity.projectId}.${host}/${version}/data/query/${sanity.dataset || "production"}?query=${query}`;
  
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

async function loadSiteContentFromJson() {
  const response = await fetch("/content/site-content.json", { cache: "no-cache" });
  if (!response.ok) return null;
  return response.json();
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
  if (!research) return;
  setText("[data-research-title]", research.title);
  setText("[data-research-lead]", research.lead);

  const container = document.querySelector("[data-research-categories]");
  if (!container) return;

  const categories = Array.isArray(research.categories) ? research.categories : [];
  if (categories.length === 0) return;

  container.innerHTML = categories
    .map(
      (category) => `
      <article class="card">
        <h2>${category.title || ""}</h2>
        <p>${category.description || ""}</p>
        <ul class="plain-list">
          ${(category.items || [])
            .map((item) => `<li>${item}</li>`)
            .join("")}
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
      const contentHtml = portableTextToHtml(article.content);

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

      const featuredImageHtml = article.featuredImage
        ? `<img class="blog-featured-image" src="${article.featuredImage}" alt="${article.featuredImageAlt || article.title || "Blog featured image"}" loading="lazy" />`
        : "";
      const shareHtml = buildShareSection(article);

      const articleId = buildArticleId(article.title || "");

      return `
      <article class="card" id="${articleId}">
        <p class="eyebrow">${article.category || "Blog"}</p>
        ${featuredImageHtml}
        <h3>${article.title || ""}</h3>
        <p><em>${article.excerpt || ""}</em></p>
        ${contentHtml}
        ${referencesHtml}
        ${shareHtml}
      </article>
    `;
    })
    .join("");
}

function portableTextToHtml(blocks) {
  if (!Array.isArray(blocks)) {
    // Fallback for legacy plain text or generated placeholders
    return String(blocks || "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }

  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }

      const text = block.children
        .map((child) => {
          let content = child.text || "";
          if (Array.isArray(child.marks)) {
            if (child.marks.includes("strong")) content = `<strong>${content}</strong>`;
            if (child.marks.includes("em")) content = `<em>${content}</em>`;
            if (child.marks.includes("underline")) content = `<u>${content}</u>`;
            if (child.marks.includes("code")) content = `<code>${content}</code>`;
          }
          return content;
        })
        .join("");

      switch (block.style) {
        case "h1": return `<h1>${text}</h1>`;
        case "h2": return `<h2>${text}</h2>`;
        case "h3": return `<h3>${text}</h3>`;
        case "h4": return `<h4>${text}</h4>`;
        case "blockquote": return `<blockquote>${text}</blockquote>`;
        default: return `<p>${text}</p>`;
      }
    })
    .join("");
}

function buildShareSection(article) {
  return buildShareSectionMarkup(article.title || "groundedwithpranshi", window.location.href);
}

export function buildShareSectionMarkup(titleText, urlText) {
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

export function enhanceStaticShareSections() {
  const blocks = document.querySelectorAll("[data-share-section]");
  blocks.forEach((block) => {
    const title = block.getAttribute("data-share-title") || document.title || "groundedwithpranshi";
    const url = block.getAttribute("data-share-url") || window.location.href;
    block.innerHTML = buildShareSectionMarkup(title, url);
  });
}

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
  return `Dear reader, if this article has found you, perhaps life is already speaking in quiet symbols: a repeated emotional pattern, a subtle tiredness that no amount of productivity can solve, a longing to return to yourself without performing strength for the world. In the language of ${category.toLowerCase()}, ${topic.toLowerCase()} is not merely a concept to understand; it is an invitation to remember your own center. Reflection begins when we stop asking only, "How do I fix this?" and begin asking, "What is this moment trying to teach my heart, my body, and my consciousness together?"\n\nMost of us were trained to override our inner rhythms. We learned to continue through exhaustion, to explain away intuition, to doubt emotions unless they looked rational, and to postpone care until crisis. But deep transformation rarely begins in dramatic breakthroughs. It begins in honest noticing. It begins when you admit, without shame, what is true for you right now. Are you carrying fear in your chest? Is your mind rehearsing worst-case outcomes? Are you saying yes while your body whispers no? If so, this is not failure. This is sacred data. Your inner life is not broken; it is communicating.\n\nTo practice ${topic.toLowerCase()} in a grounded way, start with presence before analysis. Sit quietly for a few minutes. Feel your breath without trying to improve it. Let your exhale be slightly longer than your inhale. Place one hand on your heart and one on your lower belly, and simply witness what is here. This small ritual signals safety to the nervous system and creates a gap between trigger and reaction. In that gap, wisdom can emerge. You begin to respond instead of react. You begin to choose instead of repeat.\n\nNow ask yourself three reflective questions with compassion: What am I afraid will happen if I soften? What belief am I protecting by staying in this pattern? What would one gentle, courageous action look like today? Do not rush these questions. Let them open at their own pace.\n\nUltimately, ${topic.toLowerCase()} is a practice of homecoming. It is the steady, patient work of realigning your daily choices with your deepest truth. As you move through this cycle, remember that you are not alone. The universe is always providing the mirrors, the timing, and the breath you need to evolve. Trust the process, trust your body, and trust the quiet voice that guided you to these words today.`;
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
