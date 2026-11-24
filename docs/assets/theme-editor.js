/*
 * Theme customiser (docs/pt/personalizar/tema.html). Loaded only by that page,
 * after docs.js (which turns the result block into "course.js / theme.css" tabs).
 *
 *   - controls: theme (with its layout), layout, token theme, accent colour,
 *     corners, base font size, font, content width. A theme moves the controls
 *     it sets to its own values (STYLE_VALUES, THEME_VALUES); the tokens
 *     written are the ones that differ from the kit with those themes.
 *   - preview: an iframe of the demo course (docs/demos/theme/). The themes and
 *     the layout go in its URL (?theme=a,b&layout=x, read by preview.js before
 *     the kit starts), so changing them loads the page again; the tokens are
 *     set on its <html> (by postMessage) as the controls change and after each
 *     navigation
 *   - contrast of the accent against white and against its soft background
 *   - result: the accentColor, theme (and layout) lines and a theme.css with only the
 *     changed tokens, or the complete starter file (docs/assets/theme-starter.js,
 *     built from tokens.css) with those tokens uncommented
 *   - state in the URL hash, e.g. #style=handbook&layout=auto&theme=compact&accent=0F766E&radius=4&size=16&font=system&width=1200&file=full
 */
(function () {
  "use strict";

  const DEFAULTS = { style: "classic", layout: "auto", theme: "none", accent: "1D4ED8", radius: 12, size: 16, font: "inter", width: 1200, file: "changed" };
  const OPTIONS = {
    style: ["classic", "modern", "institutional", "handbook", "editorial"],
    layout: ["auto", "sidebar", "top", "full", "banner", "docs", "centered", "panel", "aside", "onepage"],
    theme: ["none", "compact", "serif", "high-contrast"],
    radius: [0, 4, 6, 8, 12, 16],
    size: [15, 16, 17],
    font: ["inter", "system", "serif"],
    width: [960, 1080, 1200, 1320],
    file: ["changed", "full"],
  };
  /** The layout of each theme with a layout (--uc-layout in kit/src/themes/*.css). */
  const STYLE_LAYOUT = { classic: "sidebar", modern: "top", institutional: "banner", handbook: "docs", editorial: "centered" };
  /** The controls each theme with a layout sets (kit/src/themes/*.css). */
  const STYLE_VALUES = {
    classic: {},
    modern: { radius: 16 },
    institutional: { radius: 6 },
    handbook: { radius: 8, size: 15 },
    editorial: { font: "serif" },
  };
  /** The controls each token theme sets (kit/src/themes/*.css). */
  const THEME_VALUES = {
    none: {},
    compact: { radius: 8, size: 15 },
    serif: { font: "serif" },
    "high-contrast": { accent: "1E3A8A" },
  };
  const FONTS = {
    inter: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    system: "system-ui, sans-serif",
    serif: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
  };
  /** The controls that are tokens (style, layout, theme and file are not). */
  const TOKEN_KEYS = ["accent", "radius", "size", "font", "width"];
  const MIN_CONTRAST = 4.5;
  // The soft accent background is the accent mixed with white (tokens.css: accent-soft).
  const SOFT_SHARE = 0.08;
  const DEVICES = { wide: 1280, narrow: 390 };
  const PREVIEW_HEIGHT = 680;

  const $ = (id) => document.getElementById(id);
  let state = { ...DEFAULTS };

  /* ---------- colour and contrast ---------- */

  /** "#0f766e", "0F766E" or "#0F7" → "0F766E"; anything else → null. */
  function normalizeHex(value) {
    let hex = String(value || "").trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.replace(/./g, (digit) => digit + digit);
    return /^[0-9a-f]{6}$/i.test(hex) ? hex.toUpperCase() : null;
  }

  function hexToRgb(hex) {
    return [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16));
  }

  /** WCAG 2.x relative luminance of an sRGB colour given as [r, g, b] in 0–255. */
  function luminance(rgb) {
    const [r, g, b] = rgb.map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(rgbA, rgbB) {
    const [light, dark] = [luminance(rgbA), luminance(rgbB)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
  }

  /** color-mix(in srgb, colour share, white): the kit's --uc-color-accent-soft. */
  function mixWithWhite(rgb, share) {
    return rgb.map((channel) => Math.round(channel * share + 255 * (1 - share)));
  }

  /** Rounded down, so a value shown as 4.5 always passes. */
  function formatRatio(ratio) {
    return `${(Math.floor(ratio * 10) / 10).toFixed(1).replace(/\.0$/, "")}:1`;
  }

  /* ---------- tokens ---------- */

  /** Corners: the control picks the large radius; -md is 2/3 and -sm 1/2 (6/8/12 in the kit). */
  function radii(large) {
    return { sm: Math.round(large / 2), md: Math.round((large * 2) / 3), lg: large };
  }

  const px = (value) => (value === 0 ? "0" : `${value}px`);
  /**
   * Root font size as a share of the reader's browser setting (16 px by default),
   * so a reader who asks for larger text still gets it: 17 -> "106.25%".
   */
  const rootSize = (value) => `${+((value / 16) * 100).toFixed(4)}%`;

  /** Every token the customiser controls, as [name, value] pairs. */
  function tokens(values) {
    const radius = radii(values.radius);
    return [
      ["--uc-color-accent", `#${values.accent}`],
      ["--uc-radius-sm", px(radius.sm)],
      ["--uc-radius-md", px(radius.md)],
      ["--uc-radius-lg", px(radius.lg)],
      ["--uc-font-size-base", rootSize(values.size)],
      ["--uc-font-sans", FONTS[values.font]],
      ["--uc-content-max", px(values.width)],
    ];
  }

  /** The controls of the kit with the two themes applied: what the page shows without a theme.css. */
  function baseline(style, theme) {
    return { ...DEFAULTS, ...STYLE_VALUES[style], ...THEME_VALUES[theme], style, theme };
  }

  /** The tokens whose value differs from the kit's with the chosen themes. */
  function changedTokens(values) {
    const defaults = new Map(tokens(baseline(values.style, values.theme)));
    return tokens(values).filter(([name, value]) => value !== defaults.get(name));
  }

  /* ---------- generated files ---------- */

  /** The themes for `theme` in course.js: the theme with a layout, then the token theme. */
  function themeList(values) {
    return values.theme === "none" ? [values.style] : [values.style, values.theme];
  }

  /** The layout to write in course.js: only when it is not the theme's own. */
  function ownLayout(values) {
    return values.layout === "auto" || values.layout === STYLE_LAYOUT[values.style] ? null : values.layout;
  }

  function courseLine(values) {
    const list = themeList(values);
    const lines = [
      `accentColor: "#${values.accent}",`,
      list.length === 1 ? `theme: "${list[0]}",` : `theme: [${list.map((name) => `"${name}"`).join(", ")}],`,
    ];
    if (ownLayout(values)) lines.push(`layout: "${ownLayout(values)}",`);
    return lines.join("\n");
  }

  /**
   * The starter theme.css (every token commented out) with the changed tokens
   * uncommented; a token the starter does not list is added at the end of :root.
   */
  function fullThemeCss(changed) {
    let css = window.UC_DOCS_THEME_STARTER || "";
    const missing = [];
    changed.forEach(([name, value]) => {
      const line = new RegExp(`^(\\s*)/\\* ${name}: [^\\n]*; \\*/$`, "m");
      if (line.test(css)) css = css.replace(line, `$1${name}: ${value};`);
      else missing.push(`  ${name}: ${value};`);
    });
    if (missing.length) css = css.replace(/\n}\n/, `\n${missing.join("\n")}\n}\n`);
    return css;
  }

  function themeCss(values) {
    const changed = changedTokens(values);
    if (values.file === "full" && window.UC_DOCS_THEME_STARTER) return fullThemeCss(changed);
    if (!changed.length) return "/* Os valores escolhidos são os do kit com o tema escolhido: não é preciso theme.css. */\n";
    const lines = ["/* theme.css: tokens escolhidos no personalizador de tema do UC Design Kit. */", ":root {"];
    changed.forEach(([name, value]) => {
      if (name === "--uc-color-accent") lines.push("  /* O accentColor do course.js, se existir, prevalece sobre esta linha. */");
      lines.push(`  ${name}: ${value};`);
    });
    lines.push("}");
    return `${lines.join("\n")}\n`;
  }

  /* ---------- URL hash ---------- */

  function readHash() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const pick = (key) => (OPTIONS[key].includes(params.get(key)) ? params.get(key) : DEFAULTS[key]);
    const values = baseline(pick("style"), pick("theme"));
    ["layout", "font", "file"].forEach((key) => {
      if (OPTIONS[key].includes(params.get(key))) values[key] = params.get(key);
    });
    const accent = normalizeHex(params.get("accent"));
    if (accent) values.accent = accent;
    ["radius", "size", "width"].forEach((key) => {
      const number = Number(params.get(key));
      if (params.has(key) && OPTIONS[key].includes(number)) values[key] = number;
    });
    return values;
  }

  function hasStateInHash() {
    return /(^|&)(style|layout|theme|accent|radius|size|font|width|file)=/.test(window.location.hash.slice(1));
  }

  function writeHash(values) {
    const params = new URLSearchParams({
      style: values.style,
      layout: values.layout,
      theme: values.theme,
      accent: values.accent,
      radius: values.radius,
      size: values.size,
      font: values.font,
      width: values.width,
      file: values.file,
    });
    history.replaceState(null, "", `#${params}`);
  }

  function clearHash() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  /* ---------- controls ---------- */

  function radios(name) {
    return Array.from(document.querySelectorAll(`#docs-theme input[name="${name}"]`));
  }

  function checkedValue(name) {
    const input = radios(name).find((item) => item.checked);
    return input ? input.value : null;
  }

  function check(name, value) {
    radios(name).forEach((input) => {
      input.checked = input.value === String(value);
    });
  }

  /** Puts `values` into every control (after a reset, a hash or a swatch). */
  function syncControls(values) {
    $("docs-theme-picker").value = `#${values.accent.toLowerCase()}`;
    const hex = $("docs-theme-hex");
    if (normalizeHex(hex.value) !== values.accent) hex.value = `#${values.accent}`;
    check("swatch", values.accent);
    $("docs-theme-layout").value = values.layout;
    ["style", "theme", "radius", "size", "font", "width", "file"].forEach((key) => check(key, values[key]));
  }

  /* ---------- contrast readout ---------- */

  let lastPassed = null;

  function showRatio(ratio, ratioId, badgeId) {
    const passes = ratio >= MIN_CONTRAST;
    $(ratioId).textContent = formatRatio(ratio);
    const badge = $(badgeId);
    badge.textContent = passes ? "Passa" : "Insuficiente";
    badge.className = `uc-tag ${passes ? "uc-tag--success" : "uc-tag--warning"}`;
    return passes;
  }

  function updateContrast(values) {
    const rgb = hexToRgb(values.accent);
    const white = [255, 255, 255];
    const onWhite = showRatio(contrast(rgb, white), "docs-theme-ratio-white", "docs-theme-badge-white");
    const onSoft = showRatio(contrast(rgb, mixWithWhite(rgb, SOFT_SHARE)), "docs-theme-ratio-soft", "docs-theme-badge-soft");
    const passed = onWhite && onSoft;
    // The status is a live region: its text changes only when the verdict does,
    // so dragging the colour picker does not flood screen readers.
    if (passed === lastPassed) return;
    lastPassed = passed;
    const status = $("docs-theme-status");
    status.classList.toggle("docs-theme-status--warning", !passed);
    status.textContent = passed
      ? "Contraste suficiente: pelo menos 4.5:1."
      : "Atenção: contraste abaixo de 4.5:1. Ligações e botões com esta cor ficam difíceis de ler; escolher uma cor mais escura.";
  }

  /* ---------- preview ---------- */

  /**
   * Sends the tokens to the preview, which sets them as inline properties of its
   * <html>, like the kit does for accentColor (docs/demos/theme/preview.js).
   * postMessage, not contentDocument: under file:// the frame is another origin.
   */
  function applyToFrame(values) {
    const target = $("docs-theme-frame").contentWindow;
    // Unchanged tokens are removed, so the theme's (or the kit's) value shows.
    const changed = new Map(changedTokens(values));
    const list = tokens(values).map(([name]) => [name, changed.has(name) ? changed.get(name) : null]);
    if (target) target.postMessage({ type: "uc-docs:theme", tokens: list }, "*");
  }

  /** The query of the preview pages: the themes and the layout, as course.js would set them. */
  function frameQuery(values) {
    const query = new URLSearchParams({ theme: themeList(values).join(",") });
    if (values.layout !== "auto") query.set("layout", values.layout);
    return `?${query}`;
  }

  /** The query the preview was last loaded with (the one in the page's HTML at first). */
  let loadedQuery = null;

  /**
   * Loads `file` of the demo course with the chosen themes and layout; without
   * `file`, loads the page shown again only when the themes or the layout changed.
   */
  function loadFrame(file) {
    const frame = $("docs-theme-frame");
    const query = frameQuery(state);
    if (loadedQuery === null) loadedQuery = new URL(frame.getAttribute("src"), window.location.href).search;
    if (!file && query === loadedQuery) return;
    loadedQuery = query;
    frame.src = `../../demos/theme/${file || checkedValue("page") || "index.html"}${query}`;
  }

  /** A preview page started (also after a link followed inside it): send the tokens, update "Página". */
  function onFrameReady(event) {
    const data = event.data;
    if (event.source !== $("docs-theme-frame").contentWindow || !data || data.type !== "uc-docs:theme-ready") return;
    applyToFrame(state);
    if (radios("page").some((input) => input.value === data.file)) check("page", data.file);
  }

  function deviceWidth() {
    return DEVICES[checkedValue("device")] || DEVICES.wide;
  }

  /** Renders the preview at the device's width and scales it down to fit the column. */
  function layoutPreview() {
    const viewport = $("docs-theme-viewport");
    const frame = $("docs-theme-frame");
    const width = deviceWidth();
    const available = viewport.clientWidth;
    if (!available) return;
    const scale = Math.min(1, available / width);
    frame.style.width = `${width}px`;
    frame.style.height = `${Math.round(PREVIEW_HEIGHT / scale)}px`;
    frame.style.transform = scale < 1 ? `scale(${scale})` : "";
    viewport.style.height = `${PREVIEW_HEIGHT}px`;
    viewport.classList.toggle("docs-theme-viewport--centred", scale === 1 && width < available);
    const percent = Math.round(scale * 100);
    $("docs-theme-caption").textContent =
      `Curso fictício num ecrã de ${width} px` + (percent < 100 ? `, reduzido a ${percent}% para caber na página.` : ".");
  }

  /* ---------- result ---------- */

  function updateResult(values) {
    $("docs-theme-course").textContent = courseLine(values);
    $("docs-theme-css").textContent = themeCss(values);
  }

  function announce(message) {
    const status = $("docs-theme-copied");
    status.textContent = "";
    window.setTimeout(() => {
      status.textContent = message;
    }, 50);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // file:// or an older browser: copy through a temporary selection.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return copied;
    }
  }

  function setUpCopy(button) {
    const label = button.textContent;
    button.addEventListener("click", async () => {
      const copied = await copyText($(button.dataset.copy).textContent);
      button.textContent = copied ? "Copiado" : "Não foi possível copiar";
      announce(copied ? "Copiado para a área de transferência." : "Não foi possível copiar: selecionar o texto e copiar à mão.");
      window.setTimeout(() => {
        button.textContent = label;
      }, 2000);
    });
  }

  function download() {
    const blob = new Blob([themeCss(state)], { type: "text/css" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "theme.css";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  /* ---------- state ---------- */

  /** Applies `values` to the readout, the result and the preview; `url` is "write", "clear" or "keep". */
  function setState(values, { syncInputs = false, url = "write" } = {}) {
    state = { ...values };
    if (syncInputs) syncControls(state);
    else check("swatch", state.accent);
    updateContrast(state);
    updateResult(state);
    loadFrame();
    applyToFrame(state);
    if (url === "write") writeHash(state);
    else if (url === "clear") clearHash();
  }

  /** While typing: a complete six-digit code is applied at once. */
  function onHexInput(input) {
    if (/^#?[0-9a-f]{6}$/i.test(input.value.trim())) setAccent(normalizeHex(input.value));
  }

  /** On blur or Enter: a short code (#0F7) is expanded; anything else goes back to the colour in use. */
  function commitHex(input) {
    const hex = normalizeHex(input.value);
    if (hex) setAccent(hex);
    syncControls(state);
  }

  function setAccent(hex) {
    $("docs-theme-picker").value = `#${hex.toLowerCase()}`;
    setState({ ...state, accent: hex });
  }

  function onPicker(input) {
    const hex = normalizeHex(input.value);
    $("docs-theme-hex").value = `#${hex}`;
    setState({ ...state, accent: hex });
  }

  /** A new theme (`key` "style" or "theme"): every control still at the old themes' value moves to the new one's. */
  function setTheme(key, name) {
    const values = { ...state, [key]: name };
    const before = baseline(state.style, state.theme);
    const after = baseline(values.style, values.theme);
    TOKEN_KEYS.forEach((key) => {
      if (state[key] === before[key]) values[key] = after[key];
    });
    setState(values, { syncInputs: true });
  }

  function onRadio(input) {
    if (input.name === "swatch") setState({ ...state, accent: input.value }, { syncInputs: true });
    else if (input.name === "theme" || input.name === "style") setTheme(input.name, input.value);
    else if (input.name in OPTIONS) {
      const value = ["font", "file"].includes(input.name) ? input.value : Number(input.value);
      setState({ ...state, [input.name]: value });
    }
  }

  function init() {
    const tool = $("docs-theme");
    if (!tool) return;
    tool.hidden = false;
    const form = $("docs-theme-form");
    const frame = $("docs-theme-frame");

    const hexField = $("docs-theme-hex");
    form.addEventListener("input", (event) => {
      if (event.target === hexField) onHexInput(hexField);
      else if (event.target.id === "docs-theme-picker") onPicker(event.target);
    });
    form.addEventListener("change", (event) => {
      if (event.target === hexField) commitHex(hexField);
      else if (event.target.id === "docs-theme-layout") setState({ ...state, layout: event.target.value });
      else if (event.target.id === "docs-theme-picker") onPicker(event.target);
      else if (event.target.type === "radio") onRadio(event.target);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (document.activeElement === hexField) commitHex(hexField);
    });
    form.addEventListener("reset", (event) => {
      event.preventDefault();
      setState(DEFAULTS, { syncInputs: true, url: "clear" });
    });

    radios("page").forEach((input) => input.addEventListener("change", () => loadFrame(input.value)));
    radios("device").forEach((input) => input.addEventListener("change", layoutPreview));
    // "Ficheiro" is next to the result, outside the form.
    radios("file").forEach((input) => input.addEventListener("change", () => onRadio(input)));
    window.addEventListener("message", onFrameReady);
    frame.addEventListener("load", () => applyToFrame(state));

    document.querySelectorAll("#docs-theme [data-copy]").forEach(setUpCopy);
    $("docs-theme-download").addEventListener("click", download);

    window.addEventListener("hashchange", () => {
      if (hasStateInHash()) setState(readHash(), { syncInputs: true, url: "keep" });
    });

    // Narrow screens start with the phone preview, which needs no scaling.
    if ($("docs-theme-viewport").clientWidth < 640) check("device", "narrow");
    new ResizeObserver(layoutPreview).observe($("docs-theme-viewport"));
    layoutPreview();

    setState(hasStateInHash() ? readHash() : DEFAULTS, { syncInputs: true, url: "keep" });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
