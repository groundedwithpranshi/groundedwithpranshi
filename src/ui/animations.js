export function initAnimations() {
  initYear();
  initQuoteRotator();
  initRootTriggers();
  initTarotFlips();
  initParallax();
}

function initYear() {
  const yearNodes = document.querySelectorAll(".current-year");
  yearNodes.forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function initQuoteRotator() {
  const quotes = Array.from(document.querySelectorAll("[data-quote]"));
  let activeQuote = 0;

  if (quotes.length > 1) {
    setInterval(() => {
      quotes[activeQuote].classList.remove("is-active");
      activeQuote = (activeQuote + 1) % quotes.length;
      quotes[activeQuote].classList.add("is-active");
    }, 4200);
  }
}

function initRootTriggers() {
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
}

function initTarotFlips() {
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
}

function initParallax() {
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
}
