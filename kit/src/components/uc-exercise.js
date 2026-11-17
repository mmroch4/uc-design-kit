/**
 * <uc-exercise> — one exercise of a lab guide: a numbered disclosure with
 * title, optional badges (level, Mooshak problem) and a "Mark as done" toggle
 * persisted in localStorage. See docs/api.md, section 3.5.
 *
 * Structure (built once in setup(), texts refreshed by render()):
 *
 *   <uc-exercise id="…" class="uc-exercise">
 *     <details class="uc-exercise__details">
 *       <summary class="uc-exercise__summary">number · title · badges · chevron</summary>
 *       <div class="uc-exercise__body">
 *         …teacher content…
 *         <div class="uc-exercise__actions">[platform link] [mark as done]</div>
 *       </div>
 *     </details>
 *   </uc-exercise>
 *
 * The toggle is a real <button aria-pressed> at the end of the body, never
 * inside <summary> (interactive content is not allowed there). A "Done" badge
 * in the summary shows the state while the exercise is collapsed.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, isExternal, storage } = UC.internal;
  /** Keys written before 1.1, adopted on first read. */
  const LEGACY_PREFIX = "uc:done:";
  const LEVELS = ["easy", "medium", "hard"];
  const LEVEL_TAGS = { easy: "uc-tag--muted", medium: "uc-tag--accent", hard: "uc-tag--warning" };
  const MOOSHAK_LABEL = "mooshak";
  /** kind="extra" | "challenge": the same tags as the types of <uc-problems>; "main" shows none. */
  const KIND_TAGS = { extra: "uc-tag--accent", challenge: "uc-tag--warning" };

  /* ---------- Helpers shared with <uc-guide> ---------- */

  /**
   * True when `element` is hidden by in-place bilingual content (it or an
   * ancestor carries a lang attribute of another configured language).
   */
  function isHiddenByLanguage(element) {
    const languages = UC.course.languages;
    if (languages.length < 2) return false;
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const lang = node.getAttribute("lang");
      if (!lang || node.hasAttribute("data-uc-keep-lang")) continue;
      const base = lang.split("-")[0];
      if (base !== UC.lang && languages.includes(base)) return true;
    }
    return false;
  }

  /** Visible text of an element in the active language (other-language parts removed). */
  function visibleText(element) {
    const clone = element.cloneNode(true);
    clone.querySelectorAll("[lang]").forEach((node) => {
      const base = node.getAttribute("lang").split("-")[0];
      if (base !== UC.lang && UC.course.languages.includes(base)) node.remove();
    });
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  /* Saved per course (core/storage.js): uc:<course>:done:<path>#<id>. Without storage the state lasts for this page only. */
  const detail = (id) => `${window.location.pathname}#${id}`;

  /** Reads the persisted "done" state of an exercise id. */
  function readDone(id) {
    if (!id) return false;
    return storage.get("done", detail(id), { legacy: `${LEGACY_PREFIX}${detail(id)}` }) === "1";
  }

  function writeDone(id, done) {
    if (!id) return;
    if (done) storage.set("done", detail(id), "1");
    else storage.remove("done", detail(id));
  }

  /** The exercises that count in `scope`, in document order (hidden-language ones excluded). */
  function exercisesIn(scope) {
    return Array.from(scope.querySelectorAll("uc-exercise")).filter((exercise) => !isHiddenByLanguage(exercise));
  }

  /** "Done" state of any exercise element, upgraded or not. */
  function isExerciseDone(exercise) {
    return typeof exercise.done === "boolean" ? exercise.done : readDone(exercise.id);
  }

  Object.assign(UC.internal, { isHiddenByLanguage, visibleText, exercisesIn, isExerciseDone });

  /* ---------- Component ---------- */

  function mooshakPlatform() {
    return UC.course.platforms.find((platform) => UC.text(platform.label).trim().toLowerCase() === MOOSHAK_LABEL) || null;
  }

  class UCExercise extends UC.Element {
    setup() {
      this.classList.add("uc-exercise");
      if (!this.id) console.warn("[uc-kit] <uc-exercise> needs an id to remember its done state.");

      // The title attribute would show as a tooltip over the whole card: keep its value, drop the attribute.
      this.exerciseTitle = this.getAttribute("title") || "";
      if (!this.exerciseTitle) console.warn(`[uc-kit] <uc-exercise id="${this.id}"> has no title.`);
      this.removeAttribute("title");

      this.done = readDone(this.id);
      this.titleId = `${this.id || "uc-exercise"}-title`;

      this.numberSlot = h("span", { class: "uc-exercise__number", "aria-hidden": "true" });
      this.labelSlot = h("span", { class: "uc-visually-hidden" });
      this.titleSlot = h("span", { class: "uc-exercise__title", id: this.titleId }, this.exerciseTitle);
      this.metaSlot = h("span", { class: "uc-exercise__meta" });
      this.summary = h(
        "summary",
        { class: "uc-exercise__summary" },
        this.numberSlot,
        h("span", { class: "uc-exercise__heading" }, this.labelSlot, this.titleSlot),
        this.metaSlot,
        h("span", { class: "uc-exercise__chevron" }, icon("chevronDown")),
      );

      this.actions = h("div", { class: "uc-exercise__actions" });
      this.body = h("div", { class: "uc-exercise__body" }, ...Array.from(this.childNodes), this.actions);
      this.details = h(
        "details",
        { class: "uc-exercise__details", open: this.hasAttribute("open") },
        this.summary,
        this.body,
      );

      this.generatedSummaries = this.addMissingSummaries();
      this.append(this.details);
    }

    /** Hints and solutions written without a <summary> get a translated one. */
    addMissingSummaries() {
      const generated = [];
      this.body.querySelectorAll("details.uc-hint, details.uc-solution").forEach((block) => {
        const first = block.firstElementChild;
        if (first && first.tagName === "SUMMARY") return;
        const summary = h("summary", { class: "uc-exercise__generated-summary" });
        summary.dataset.ucKey = block.classList.contains("uc-solution") ? "exercise.solution" : "exercise.hint";
        block.prepend(summary);
        generated.push(summary);
      });
      return generated;
    }

    render() {
      const scope = this.closest("uc-guide") || document;
      const number = exercisesIn(scope).indexOf(this) + 1;

      this.classList.toggle("uc-exercise--done", this.done);
      this.numberSlot.replaceChildren(this.done ? icon("check") : String(number || ""));
      this.labelSlot.textContent = number ? `${this.t("exercise.title", { n: number })}: ` : "";
      this.metaSlot.replaceChildren(...this.renderBadges());
      this.actions.replaceChildren(...[this.renderPlatformLink(), this.renderToggle()].filter(Boolean));
      this.generatedSummaries.forEach((summary) => {
        summary.textContent = this.t(summary.dataset.ucKey);
      });
    }

    renderBadges() {
      const badges = [];
      const level = this.getAttribute("level");
      if (LEVELS.includes(level)) {
        badges.push(h("span", { class: `uc-tag ${LEVEL_TAGS[level]} uc-exercise__level` }, this.t(`exercise.levels.${level}`)));
      }
      const kind = this.getAttribute("kind");
      if (KIND_TAGS[kind]) badges.push(h("span", { class: `uc-tag ${KIND_TAGS[kind]} uc-exercise__kind` }, this.t(`problems.types.${kind}`)));
      const code = this.getAttribute("mooshak");
      if (code) {
        const platform = mooshakPlatform();
        badges.push(
          h(
            "span",
            { class: "uc-tag uc-tag--muted uc-exercise__problem" },
            platform ? h("span", {}, UC.text(platform.label)) : null,
            platform ? h("span", {}, "·") : null,
            h("span", { class: "uc-mono" }, code),
          ),
        );
      }
      if (this.done) {
        badges.push(h("span", { class: "uc-tag uc-exercise__done-tag" }, icon("check"), this.t("exercise.done")));
      }
      return badges;
    }

    /** "Submit on Mooshak" link when a problem code is given and the platform is configured. */
    renderPlatformLink() {
      const code = this.getAttribute("mooshak");
      const platform = code ? mooshakPlatform() : null;
      if (!platform) return null;
      const external = isExternal(platform.url);
      return h(
        "a",
        { class: "uc-button uc-exercise__submit", href: platform.url },
        this.t("exercise.submitOn", { platform: UC.text(platform.label) }),
        h("span", { class: "uc-tag uc-tag--muted uc-mono" }, code),
        external ? icon("external") : null,
        external ? h("span", { class: "uc-visually-hidden" }, ` ${this.t("a11y.external")}`) : null,
      );
    }

    renderToggle() {
      return h(
        "button",
        {
          type: "button",
          class: "uc-exercise__toggle",
          "aria-pressed": String(this.done),
          "aria-describedby": this.titleId,
          onClick: () => this.setDone(!this.done, true),
        },
        h("span", { class: "uc-exercise__checkbox" }, icon("check")),
        this.t("exercise.markDone"),
      );
    }

    /** Changes the done state, persists it and notifies the guide. */
    setDone(done, restoreFocus) {
      this.done = Boolean(done);
      writeDone(this.id, this.done);
      this.render();
      if (restoreFocus) this.actions.querySelector(".uc-exercise__toggle")?.focus();
      this.dispatchEvent(new CustomEvent("uc:exercisechange", { bubbles: true, detail: { id: this.id, done: this.done } }));
    }
  }

  UC.define("uc-exercise", UCExercise);
})(window.UC);
