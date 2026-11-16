/*
 * Live token values on the Estilos pages. The markup carries the kit's
 * default values (what a reader sees without JavaScript); this script
 * replaces them with what the browser computes from uc-kit.css, so the pages
 * can never disagree with the kit.
 *
 *   <code data-token="--uc-color-accent" data-kind="color">#1D4ED8</code>
 *       the value of a token: kind "color" (hex), "length" (value and px) or
 *       "raw" (as written, after var() substitution; the default)
 *   <span data-contrast="--uc-color-text --uc-color-surface">17,72:1</span>
 *       contrast ratio of two colour tokens (text, background)
 *
 * A token that is not set on :root (the local tokens) keeps the text of the
 * markup, which is then its fallback.
 */
(function () {
  "use strict";

  const root = document.documentElement;
  let probe = null;

  /** A hidden element used to let the browser resolve colours and lengths. */
  function getProbe() {
    if (probe) return probe;
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;display:block;height:0;overflow:hidden";
    document.body.appendChild(probe);
    return probe;
  }

  /** Value of a custom property on :root, var() already substituted; "" when unset. */
  function rawValue(token) {
    return getComputedStyle(root).getPropertyValue(token).trim();
  }

  /** A CSS colour (any syntax the browser knows, var() included) as [r, g, b] in 0–255. */
  function toRgb(value) {
    const element = getProbe();
    element.style.color = "";
    element.style.color = value;
    if (!element.style.color) return null;
    const computed = getComputedStyle(element).color;
    let match = computed.match(/^rgba?\(([^)]+)\)/);
    if (match) return match[1].split(/[\s,/]+/).slice(0, 3).map(Number);
    // color-mix() results are serialised as color(srgb r g b) with 0–1 channels.
    match = computed.match(/^color\(srgb\s+([^)]+)\)/);
    if (match) return match[1].trim().split(/\s+/).slice(0, 3).map((channel) => Math.round(Number(channel) * 255));
    return null;
  }

  function toHex(rgb) {
    return "#" + rgb.map((channel) => Math.max(0, Math.min(255, channel)).toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  /** A CSS length as a number of px, or null. */
  function toPx(value) {
    const element = getProbe();
    element.style.width = "";
    element.style.width = value;
    if (!element.style.width) return null;
    return parseFloat(getComputedStyle(element).width);
  }

  function formatNumber(number) {
    return String(Math.round(number * 100) / 100);
  }

  /** Text shown for a token, or null to keep the markup's text. */
  function describe(token, kind) {
    // Browsers may drop the leading zero (".75rem"); show numbers as uc-kit.css writes them.
    const raw = rawValue(token).replace(/(^|[\s(,])\.(\d)/g, "$10.$2");
    if (!raw) return null;
    if (kind === "color") {
      const rgb = toRgb(raw);
      return rgb ? toHex(rgb) : raw;
    }
    if (kind === "length") {
      if (/^-?[\d.]+px$/.test(raw)) return raw;
      const px = toPx(raw);
      return px === null ? raw : `${raw} (${formatNumber(px)}px)`;
    }
    return raw.replace(/\s+/g, " ");
  }

  /* ---------- contrast (WCAG 2.x relative luminance) ---------- */

  function luminance(rgb) {
    const [r, g, b] = rgb.map((channel) => {
      const value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrast(foreground, background) {
    const a = luminance(foreground);
    const b = luminance(background);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  /** Fills a [data-contrast] element and the [data-verdict] of its row. */
  function showContrast(element) {
    const [foreground, background] = element.dataset.contrast.split(/\s+/).map((token) => toRgb(`var(${token})`));
    if (!foreground || !background) return;
    const ratio = contrast(foreground, background);
    element.textContent = `${ratio.toFixed(2).replace(".", ",")}:1`;
    const verdict = element.closest("tr")?.querySelector("[data-verdict]");
    if (!verdict) return;
    const passes = ratio >= Number(verdict.dataset.verdict || 4.5);
    verdict.textContent = passes ? "Cumpre" : "Não cumpre";
    verdict.classList.toggle("uc-tag--success", passes);
    verdict.classList.toggle("uc-tag--warning", !passes);
  }

  /* ---------- main ---------- */

  function update() {
    for (const element of document.querySelectorAll("[data-token]")) {
      const text = describe(element.dataset.token, element.dataset.kind || "raw");
      if (text !== null) element.textContent = text;
    }
    for (const element of document.querySelectorAll("[data-contrast]")) showContrast(element);
  }

  update();
  // Some tokens change below the kit's 760px breakpoint (gutter, -h1, -display).
  window.matchMedia("(max-width: 760px)").addEventListener("change", update);
})();
