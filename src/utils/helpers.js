export function setText(selector, value) {
  if (!value) return;
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

export function setList(selector, items) {
  const node = document.querySelector(selector);
  if (!node || !Array.isArray(items) || items.length === 0) return;
  node.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

export function setLink(selector, href) {
  if (!href) return;
  const node = document.querySelector(selector);
  if (node) node.setAttribute("href", href);
}

export function setServiceList(selector, items) {
  const node = document.querySelector(selector);
  if (!node || !Array.isArray(items) || items.length === 0) return;

  node.innerHTML = items
    .map(
      (item) =>
        `<li><a href="https://calendly.com/groundedwithpranshi/30min" target="_blank" rel="noopener noreferrer">${item}</a></li>`
    )
    .join("");
}

export function renderCuratedList(container, items, renderer) {
  if (!container || items.length === 0) return;
  container.innerHTML = items
    .map((item) => `<li>${renderer(item)}</li>`)
    .join("");
}

export function buildArticleId(value) {
  return `article-${normalizeTitle(value) || "entry"}`;
}

export function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSanityApiVersion(version) {
  const value = String(version || "").trim();
  if (!value) return "v2025-01-01";
  return value.startsWith("v") ? value : `v${value}`;
}
