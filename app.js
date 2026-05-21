document.documentElement.classList.add("js-ready");

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function initNavScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) {
    return;
  }

  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initBottomNav() {
  const buttons = Array.from(document.querySelectorAll(".bottom-nav button[data-target]"));
  if (!buttons.length) {
    return;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target || "");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (!("IntersectionObserver" in window)) {
    return;
  }

  const sections = buttons
    .map((button) => document.getElementById(button.dataset.target || ""))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (!visible[0]) {
        return;
      }

      const activeId = visible[0].target.id;
      buttons.forEach((button) => {
        const isActive = button.dataset.target === activeId;
        button.classList.toggle("active", isActive);
        if (isActive) {
          button.setAttribute("aria-current", "page");
        } else {
          button.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5, 1] }
  );

  sections.forEach((section) => observer.observe(section));
}

function initParticles() {
  const canvases = document.querySelectorAll("canvas.particles");
  if (!canvases.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const density = Number.parseInt(canvas.dataset.density || "70", 10);
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ticks = 0;
    let frameId = 0;
    let particles = [];

    const spawn = (initial) => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 20,
      radius: Math.random() * 1.6 + 0.4,
      velocityY: -(Math.random() * 0.4 + 0.15),
      velocityX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      twinkle: Math.random() * 0.02 + 0.008,
      hue: Math.random() < 0.15 ? "232, 200, 120" : "139, 92, 246",
    });

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: density }, () => spawn(true));
    };

    const tick = () => {
      ticks += 1;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.x += particle.velocityX + Math.sin((ticks + particle.phase * 50) * 0.005) * 0.15;
        particle.y += particle.velocityY;
        particle.alpha += Math.sin(ticks * particle.twinkle + particle.phase) * 0.005;

        if (particle.y < -10 || particle.x < -10 || particle.x > width + 10) {
          particles[index] = spawn(false);
          return;
        }

        const alpha = Math.max(0, Math.min(0.9, particle.alpha));
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 6);
        gradient.addColorStop(0, `rgba(${particle.hue}, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(${particle.hue}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${particle.hue}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(${particle.hue}, ${Math.min(1, alpha + 0.3)})`;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      frameId = window.requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    frameId = window.requestAnimationFrame(tick);
    window.addEventListener("beforeunload", () => window.cancelAnimationFrame(frameId), { once: true });
  });
}

function initFlipbooks() {
  const components = document.querySelectorAll(".flipbook-component");
  components.forEach((component) => {
    const wrap = component.querySelector(".flipbook-wrap");
    const pages = Array.from(component.querySelectorAll(".page"));
    const previousButton = component.querySelector('[data-action="prev"]');
    const nextButton = component.querySelector('[data-action="next"]');
    const counter = component.querySelector(".flipbook-counter b");

    if (!wrap || !pages.length || !previousButton || !nextButton || !counter) {
      return;
    }

    const total = pages.length;
    let current = 0;
    let touchStartX = null;

    const render = () => {
      pages.forEach((page, index) => {
        const flipped = index < current;
        page.classList.toggle("flipped", flipped);
        page.style.zIndex = String(flipped ? index + 1 : total - index);
        page.setAttribute("aria-hidden", flipped ? "false" : "true");
      });

      counter.textContent = `${Math.min(current + 1, total)} / ${total}`;
      previousButton.disabled = current === 0;
      nextButton.disabled = current === total;
    };

    const goNext = () => {
      current = Math.min(total, current + 1);
      render();
    };

    const goPrevious = () => {
      current = Math.max(0, current - 1);
      render();
    };

    previousButton.addEventListener("click", goPrevious);
    nextButton.addEventListener("click", goNext);

    pages.forEach((page, index) => {
      page.addEventListener("click", () => {
        if (index === current) {
          goNext();
        } else if (index === current - 1) {
          goPrevious();
        }
      });
    });

    wrap.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
      }
    });

    wrap.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
    });

    wrap.addEventListener("touchend", (event) => {
      if (touchStartX === null) {
        return;
      }

      const deltaX = event.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(deltaX) <= 40) {
        return;
      }

      if (deltaX < 0) {
        goNext();
      } else {
        goPrevious();
      }
    });

    render();
  });
}

function initNewsletterForm() {
  const form = document.querySelector(".newsletter");
  const status = document.querySelector(".newsletter-status");
  if (!form || !status) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = form.dataset.successMessage || "Thanks — you've been added to the list.";
    form.reset();
  });
}

function initLanguageSwitcher() {
  const links = document.querySelectorAll(".lang-switch a[data-lang-link]");
  if (!links.length) {
    return;
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.origin);
      if (window.location.hash) {
        url.hash = window.location.hash;
      }
      event.preventDefault();
      window.location.href = url.toString();
    });
  });
}

function initSubmenus() {
  document.querySelectorAll(".nav .has-submenu").forEach((item) => {
    const trigger = item.querySelector("a[aria-haspopup]");
    if (!trigger) return;
    const setExpanded = (v) => trigger.setAttribute("aria-expanded", String(v));
    item.addEventListener("mouseenter", () => setExpanded(true));
    item.addEventListener("mouseleave", () => setExpanded(false));
    item.addEventListener("focusin", () => setExpanded(true));
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) setExpanded(false);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initNavScroll();
  initBottomNav();
  initParticles();
  initFlipbooks();
  initNewsletterForm();
  initLanguageSwitcher();
  initSubmenus();
});