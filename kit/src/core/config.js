/**
 * Reads window.UC_COURSE, applies defaults and validates it.
 * Problems are reported with console.warn so a typo never breaks the page.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const BUILTIN_PAGES = {
    home: "index.html",
    weeks: "weeks.html",
    assessment: "assessment.html",
    materials: "materials.html",
    schedule: "schedule.html",
    about: "about.html",
  };
  const DEADLINE_KINDS = ["assessment", "exam", "quiz", "submission", "other"];
  const DEFAULT_WEEKS = 14;

  function warn(message) {
    console.warn(`[uc-kit] course.js: ${message}`);
  }

  const asArray = (value) => (Array.isArray(value) ? value : []);

  /**
   * Page hrefs in course.js are relative to course.js itself, so that pages in
   * subfolders (e.g. guioes/aula10.html loading ../course.js) link correctly.
   * Returns a function mapping such an href to one relative to this page.
   */
  function pageHrefResolver() {
    const script = Array.from(document.scripts).find((item) => /(^|\/)course\.js([?#]|$)/.test(item.getAttribute("src") || ""));
    if (!script) return (href) => href;
    const base = new URL(".", script.src);
    const here = new URL(".", document.baseURI);
    if (base.href === here.href || base.origin !== here.origin) return (href) => href;
    return (href) => {
      if (typeof href !== "string" || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(href)) return href;
      const target = new URL(href, base);
      const from = here.pathname.split("/").slice(0, -1);
      const to = target.pathname.split("/");
      let common = 0;
      while (common < from.length && common < to.length - 1 && from[common] === to[common]) common += 1;
      const path = "../".repeat(from.length - common) + to.slice(common).join("/");
      return path + target.search + target.hash;
    };
  }

  function resolveHref(href, resolve) {
    if (href && typeof href === "object") {
      const out = {};
      Object.keys(href).forEach((key) => (out[key] = resolve(href[key])));
      return out;
    }
    return resolve(href);
  }

  function normalizePage(entry, index, resolve) {
    const page = typeof entry === "string" ? { id: entry } : { ...entry };
    if (!page.id) {
      warn(`pages[${index}] has no id`);
      page.id = `page-${index}`;
    }
    if (!page.href) {
      page.href = BUILTIN_PAGES[page.id];
      if (!page.href) warn(`pages[${index}] ("${page.id}") is not a built-in page and needs an href`);
    }
    if (page.href) page.href = resolveHref(page.href, resolve);
    page.builtin = page.id in BUILTIN_PAGES;
    page.label = page.label || null;
    return page;
  }

  /** Resolves `url` (and `links[].url`) of a course.js entry against course.js. */
  function withUrl(entry, resolve) {
    if (!entry || typeof entry !== "object") return entry;
    const out = { ...entry };
    if (out.url) out.url = resolveHref(out.url, resolve);
    if (Array.isArray(out.links)) out.links = out.links.map((link) => withUrl(link, resolve));
    return out;
  }

  function normalizeDeadline(entry, index, resolve) {
    const deadline = { kind: "other", links: [], ...withUrl(entry, resolve) };
    if (!deadline.id) warn(`deadlines[${index}] has no id`);
    if (!deadline.title) warn(`deadlines[${index}] ("${deadline.id}") has no title`);
    if (!DEADLINE_KINDS.includes(deadline.kind)) {
      warn(`deadlines[${index}] has unknown kind "${deadline.kind}"`);
      deadline.kind = "other";
    }
    const parsed = UC.internal.parseDeadlineDate(deadline.date);
    if (parsed.precision === "invalid") warn(`deadlines[${index}] has an invalid date "${deadline.date}"`);
    deadline.parsed = parsed;
    deadline.endDate = UC.internal.parseDay(deadline.end);
    deadline.links = asArray(deadline.links);
    return deadline;
  }

  function normalizeNotice(entry, index) {
    const date = UC.internal.parseDay(entry && entry.date);
    if (!date) warn(`notices[${index}] has an invalid date "${entry && entry.date}"`);
    return { ...entry, parsedDate: date };
  }

  function normalize(raw) {
    const htmlLang = (document.documentElement.getAttribute("lang") || "pt").trim();
    const languages = asArray(raw.languages).length ? raw.languages.slice() : [htmlLang];

    if (!raw.title) warn("title is required");

    const semester = raw.semester || {};
    const teachingDays = asArray(semester.teachingDays).length === 2 ? semester.teachingDays : [1, 5];

    const resolve = pageHrefResolver();
    const deadlines = asArray(raw.deadlines).map((entry, index) => normalizeDeadline(entry, index, resolve));
    deadlines.sort((a, b) => {
      const da = a.parsed.date;
      const db = b.parsed.date;
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da - db;
    });

    const notices = asArray(raw.notices).map(normalizeNotice);
    notices.sort((a, b) => (b.parsedDate || 0) - (a.parsedDate || 0));

    return Object.freeze({
      ...raw,
      languages,
      title: raw.title || document.title,
      semester: {
        start: semester.start || null,
        weeks: Number(semester.weeks) || DEFAULT_WEEKS,
        teachingDays,
        breaks: asArray(semester.breaks),
      },
      pages: (asArray(raw.pages).length ? raw.pages : ["home"]).map((entry, index) => normalizePage(entry, index, resolve)),
      institution: withUrl(raw.institution, resolve),
      platforms: asArray(raw.platforms).map((entry) => withUrl(entry, resolve)),
      team: asArray(raw.team).map((entry) => withUrl(entry, resolve)),
      deadlines,
      notices,
      logo: raw.logo === undefined ? "default" : raw.logo && typeof raw.logo === "string" && raw.logo !== "default" ? resolve(raw.logo) : raw.logo,
    });
  }

  function applyAccentColor(color) {
    if (!color) return;
    if (typeof CSS !== "undefined" && CSS.supports && !CSS.supports("color", color)) {
      warn(`accentColor "${color}" is not a valid CSS colour`);
      return;
    }
    document.documentElement.style.setProperty("--uc-color-accent", color);
    warnLowContrast(color);
  }

  /**
   * The accent is the colour of links on white and the background of white text
   * on primary buttons: below 4.5:1 against white it fails WCAG 1.4.3. The colour
   * is still applied; the console says so, with the ratio.
   */
  function warnLowContrast(color) {
    const probe = document.createElement("span");
    probe.style.color = color;
    probe.hidden = true;
    (document.body || document.documentElement).appendChild(probe);
    const match = /rgba?\(([^)]+)\)/.exec(getComputedStyle(probe).color);
    probe.remove();
    if (!match) return;
    const [r, g, b] = match[1].split(/[\s,/]+/).map(Number);
    const channel = (value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminance = 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const ratio = 1.05 / (luminance + 0.05);
    if (ratio < 4.5) {
      warn(`accentColor "${color}" has a contrast of ${ratio.toFixed(1)}:1 with white; links and primary buttons need at least 4.5:1 (WCAG 1.4.3). Choose a darker colour.`);
    }
  }

  const raw = window.UC_COURSE;
  if (!raw || typeof raw !== "object") {
    console.warn("[uc-kit] window.UC_COURSE is missing: load course.js before uc-kit.js. Using defaults.");
  }
  UC.course = normalize(raw && typeof raw === "object" ? raw : {});
  applyAccentColor(UC.course.accentColor);

  UC.internal.builtinPages = BUILTIN_PAGES;
  // Resolves an href written relative to course.js (as page hrefs are) for this page.
  UC.internal.resolvePageHref = pageHrefResolver();

  /**
   * HTMLText from course.js (notices, notes, footer) is written relative to
   * course.js too: rewrites the relative href/src inside `root` for this page.
   */
  UC.internal.resolveCourseLinks = function (root) {
    root.querySelectorAll("[href], [src]").forEach((node) => {
      ["href", "src"].forEach((name) => {
        const value = node.getAttribute(name);
        if (value !== null) {
          const resolved = UC.internal.resolvePageHref(value);
          if (resolved !== value) node.setAttribute(name, resolved);
        }
      });
    });
  };
})(window.UC);
