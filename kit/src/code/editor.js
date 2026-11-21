/**
 * <uc-code editable>, the editor: a transparent <textarea> over the
 * highlighted code, Tab inserts spaces (Escape then Tab leaves the editor),
 * and Reset brings back the authored code.
 * Part of <uc-code> (code/element.js): these methods are mixed into its class.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h } = UC.internal;
  const HIGHLIGHT_DELAY_MS = 150;
  const TAB = "    ";

  UC.internal.codeEditor = {
    /** Builds the editable body: the highlighted layer, the textarea over it and the keyboard hint. */
    buildEditor() {
      this.pre.setAttribute("aria-hidden", "true");
      this.textarea = h("textarea", {
        class: "uc-code__input",
        spellcheck: "false",
        autocapitalize: "off",
        autocomplete: "off",
        wrap: "off",
        // Writing-assistant extensions (Grammarly and similar) would draw over the code.
        "data-gramm": "false",
        "data-gramm_editor": "false",
        "data-enable-grammarly": "false",
        "aria-describedby": this.hintId,
        onInput: () => this.onInput(),
        onKeydown: (event) => this.onKeydown(event),
        // The textarea scrolls (so the browser keeps the caret in view); the highlighted layer follows it.
        onScroll: () => this.syncScroll(),
      });
      this.textarea.value = this.code;
      this.hint = h("p", { class: "uc-code__hint", id: this.hintId });
      this.scroller = h("div", { class: "uc-code__scroll uc-code__editor" }, this.pre, this.textarea);
      this.body = h("div", { class: "uc-code__body", id: this.bodyId }, this.scroller, this.hint);
    },

    /** Keeps the highlighted layer aligned with the textarea's scroll position. */
    syncScroll() {
      if (!this.textarea) return;
      this.pre.scrollLeft = this.textarea.scrollLeft;
      this.pre.scrollTop = this.textarea.scrollTop;
    },

    onInput() {
      this.code = this.textarea.value;
      // Repaint in the same frame: switching to plain text and back made the block flicker on every key.
      if (this.highlighter) {
        this.paint(this.highlighter);
        return;
      }
      this.showPlain();
      this.syncScroll();
      clearTimeout(this.highlightTimer);
      this.highlightTimer = setTimeout(() => this.highlight(), HIGHLIGHT_DELAY_MS);
    },

    onKeydown(event) {
      if (event.key === "Escape") {
        this.escapePressed = true;
        return;
      }
      if (event.key === "Tab" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey && !this.escapePressed) {
        event.preventDefault();
        this.insertText(TAB);
      }
      this.escapePressed = false;
    },

    insertText(text) {
      const area = this.textarea;
      // execCommand keeps the browser's undo history; setRangeText is the fallback.
      let inserted = false;
      try {
        inserted = document.execCommand("insertText", false, text);
      } catch (error) {
        inserted = false;
      }
      if (!inserted) {
        area.setRangeText(text, area.selectionStart, area.selectionEnd, "end");
        this.onInput();
      }
    },

    onReset() {
      this.code = this.original;
      this.textarea.value = this.original;
      if (this.highlighter) this.paint(this.highlighter);
      else {
        this.showPlain();
        this.highlight();
      }
      this.textarea.focus();
      this.textarea.setSelectionRange(0, 0);
    },
  };
})(window.UC);
