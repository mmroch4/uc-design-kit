/**
 * Base class for kit components and the registration helper.
 *
 * Lifecycle:
 *   setup()  - once, the first time the element is connected. Capture the
 *              teacher-written children here.
 *   render() - on every connection and after every language change. Must be
 *              idempotent: rebuild generated parts, never duplicate content.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  class UCElement extends HTMLElement {
    connectedCallback() {
      if (!this.__ucSetupDone) {
        this.__ucSetupDone = true;
        this.setup();
      }
      if (!this.__ucLanguageListener) {
        this.__ucLanguageListener = () => this.render();
        document.addEventListener("uc:languagechange", this.__ucLanguageListener);
      }
      this.render();
    }

    disconnectedCallback() {
      if (this.__ucLanguageListener) {
        document.removeEventListener("uc:languagechange", this.__ucLanguageListener);
        this.__ucLanguageListener = null;
      }
    }

    /** One-time initialisation. */
    setup() {}

    /** (Re)builds the generated parts of the element. */
    render() {}

    get course() {
      return UC.course;
    }

    t(key, params) {
      return UC.t(key, params);
    }

    text(value) {
      return UC.text(value);
    }
  }

  UC.Element = UCElement;

  const pending = [];

  function register(name, constructor) {
    if (!customElements.get(name)) customElements.define(name, constructor);
  }

  /**
   * Registers a component once. While the document is still loading the
   * definition waits for DOMContentLoaded, so components always see their
   * children, however the kit script was included.
   */
  UC.define = function define(name, constructor) {
    if (document.readyState === "loading") pending.push([name, constructor]);
    else register(name, constructor);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      pending.splice(0).forEach(([name, constructor]) => register(name, constructor));
    });
  }
})(window.UC);
