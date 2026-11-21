/* STILL POINT — interactions
   - image fallback, breathing loader, Lenis smooth scroll
   - hero ring breathes in sync with Inhale / Exhale text (4 s each)
   - expanding practice panels, filterable timetable, testimonial fade
   - GSAP: arch parallax, film parallax, soft reveals
*/
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- Image fallback ---------- */
  document.querySelectorAll("img[data-remote]").forEach((img) => {
    img.addEventListener("error", () => {
      if (!img.dataset.tried && img.dataset.remote) {
        img.dataset.tried = "1";
        img.src = img.dataset.remote;
      }
    });
  });

  /* ---------- Nav ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    burger.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    links.classList.toggle("is-open", !open);
  });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (links.classList.contains("is-open")) burger.click();
    lenis ? lenis.scrollTo(target, { offset: -70 }) : target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  /* ---------- Practice panels ---------- */
  const panels = document.querySelectorAll(".panel");
  const openPanel = (p) => panels.forEach((x) => x.classList.toggle("is-open", x === p));
  panels.forEach((p) => {
    p.addEventListener("mouseenter", () => { if (window.matchMedia("(hover: hover)").matches) openPanel(p); });
    p.addEventListener("click", () => openPanel(p));
    p.addEventListener("focus", () => openPanel(p));
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPanel(p); } });
  });

  /* ---------- Timetable ---------- */
  const week = {
    Mon: [["6:30 AM", "Reformer Pilates", "Lakshmi", "pilates"], ["8:00 AM", "Slow vinyasa", "Tara", "yoga"], ["6:00 PM", "Mat Pilates", "Siddharth", "pilates"], ["7:30 PM", "Yin & restore", "Tara", "yoga"]],
    Tue: [["7:00 AM", "Slow vinyasa", "Tara", "yoga"], ["9:30 AM", "Prenatal", "Lakshmi", "yoga"], ["6:30 PM", "Reformer Pilates", "Lakshmi", "pilates"]],
    Wed: [["6:30 AM", "Reformer Pilates", "Lakshmi", "pilates"], ["8:00 AM", "Mat Pilates", "Siddharth", "pilates"], ["7:30 PM", "Yin & restore", "Tara", "yoga"]],
    Thu: [["7:00 AM", "Slow vinyasa", "Tara", "yoga"], ["6:00 PM", "Reformer Pilates", "Siddharth", "pilates"], ["7:30 PM", "Yin & restore", "Tara", "yoga"]],
    Fri: [["6:30 AM", "Reformer Pilates", "Lakshmi", "pilates"], ["9:30 AM", "Prenatal", "Lakshmi", "yoga"], ["6:00 PM", "Slow vinyasa", "Tara", "yoga"]],
    Sat: [["7:00 AM", "Slow vinyasa", "Tara", "yoga"], ["8:30 AM", "Reformer Pilates", "Lakshmi", "pilates"], ["10:00 AM", "Mat Pilates", "Siddharth", "pilates"]],
  };
  const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  document.getElementById("days").innerHTML = Object.entries(week).map(([d, list]) => `
    <div class="day ${d === today ? "is-today" : ""}">
      <h3>${d}${d === today ? " · today" : ""}</h3>
      ${list.map(([t, n, who, k]) => `<div class="cls" data-kind="${k}"><time>${t}</time><strong>${n}</strong><span>with ${who}</span></div>`).join("")}
    </div>`).join("");
  document.querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
    const f = chip.dataset.filter;
    document.querySelectorAll(".cls").forEach((c) => c.classList.toggle("is-dim", f !== "all" && c.dataset.kind !== f));
  }));

  /* ---------- Film toggle ---------- */
  const film = document.getElementById("film");
  const toggle = document.getElementById("filmToggle");
  toggle.addEventListener("click", () => {
    if (film.paused) { film.play(); toggle.textContent = "Pause"; toggle.setAttribute("aria-label", "Pause video"); }
    else { film.pause(); toggle.textContent = "Play"; toggle.setAttribute("aria-label", "Play video"); }
  });

  /* ---------- Testimonials ---------- */
  const words = document.querySelectorAll(".word");
  const dots = document.getElementById("wordDots");
  let wi = 0, wTimer;
  const show = (i) => {
    wi = i;
    words.forEach((w, j) => w.classList.toggle("is-on", j === i));
    dots.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
  };
  words.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.role = "tab"; b.setAttribute("aria-label", `Testimonial ${i + 1}`);
    b.addEventListener("click", () => { show(i); clearInterval(wTimer); wTimer = setInterval(() => show((wi + 1) % words.length), 7000); });
    dots.appendChild(b);
  });
  show(0);
  if (!reduce) wTimer = setInterval(() => show((wi + 1) % words.length), 7000);

  /* ---------- Hero breath text (synced with 8 s halo) ---------- */
  const breath = document.getElementById("breath");
  if (!reduce) {
    let inhale = true;
    setInterval(() => {
      breath.style.opacity = 0;
      setTimeout(() => { inhale = !inhale; breath.textContent = inhale ? "Inhale" : "Exhale"; breath.style.opacity = 1; }, 900);
    }, 4000);
  }

  /* ---------- Loader + GSAP ---------- */
  const loader = document.getElementById("loader");
  const lw = document.getElementById("loaderWord");
  document.body.classList.add("is-loading");
  lenis && lenis.stop();
  const done = () => { document.body.classList.remove("is-loading"); loader.style.display = "none"; lenis && lenis.start(); };

  if (!hasGSAP || reduce) { done(); return; }

  const tl = gsap.timeline();
  tl.fromTo(".loader__orb", { scale: .4 }, { scale: 2.6, duration: 1.6, ease: "sine.inOut" })
    .call(() => (lw.textContent = "and out"))
    .to(".loader__orb", { scale: 1, duration: 1.1, ease: "sine.inOut" })
    .to(loader, { opacity: 0, duration: .8, ease: "sine.inOut", onComplete: done })
    .from(".hero__l1, .hero__l2", { y: 40, opacity: 0, filter: "blur(8px)", duration: 1.4, stagger: .2, ease: "power3.out" }, "-=.4")
    .from("#ring", { scale: .6, opacity: 0, duration: 1.6, ease: "expo.out" }, "-=1.2")
    .from(".hero__foot", { y: 20, opacity: 0, duration: 1 }, "-=.8");

  /* ring breathes slowly as you scroll away */
  gsap.to("#ring", { scale: .85, scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* arch parallax */
  gsap.utils.toArray(".intro__arch img").forEach((img, i) => {
    gsap.fromTo(img, { yPercent: -10 }, { yPercent: i ? 4 : 0, ease: "none", scrollTrigger: { trigger: img.parentElement, scrub: true } });
  });
  gsap.from(".intro__text > *", { y: 40, opacity: 0, duration: 1.2, stagger: .15, ease: "power3.out", scrollTrigger: { trigger: ".intro", start: "top 70%", once: true } });

  /* film parallax */
  gsap.fromTo(".film__frame video", { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".film", scrub: true } });

  /* teachers arches rise */
  gsap.from(".teacher__arch", { clipPath: "inset(100% 0 0 0 round 999px 999px 0 0)", duration: 1.6, stagger: .18, ease: "expo.out", scrollTrigger: { trigger: ".teachers__row", start: "top 80%", once: true } });

  /* offers */
  gsap.from(".offer", { y: 50, opacity: 0, duration: 1.1, stagger: .14, ease: "power3.out", scrollTrigger: { trigger: ".offers__grid", start: "top 80%", once: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

/* ---------- Booking form ---------- */
document.getElementById("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const el = e.currentTarget.elements;
  const msg = document.getElementById("bookMsg");
  const name = el.name.value.trim();
  const phone = el.phone.value.trim();
  if (!name) { msg.textContent = "Add your name so we know who to message."; el.name.focus(); return; }
  if (!/^[0-9+ ]{10,14}$/.test(phone)) { msg.textContent = "Enter a 10-digit WhatsApp number."; el.phone.focus(); return; }
  msg.textContent = `Thank you, ${name.split(" ")[0]}. We'll message this week's open ${el.kind.value.toLowerCase()} spots shortly.`;
  e.currentTarget.reset();
});
