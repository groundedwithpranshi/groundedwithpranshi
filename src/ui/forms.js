export function initForms() {
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
}

export function renderNewsletterSignup() {
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
