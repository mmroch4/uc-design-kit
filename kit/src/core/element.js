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

  /**
   * Page-wide enhancements (links that need a login, wide tables…) register
   * here; they run on every component render, so content a component writes
   * gets them too. Each enhancer must be idempotent.
   */
  const enhancers = [];
  UC.internal.registerEnhancer = (enhancer) => enhancers.push(enhancer);
  UC.internal.enhance = function enhance(root) {
    for (const enhancer of enhancers) {
      try {
        enhancer(root);
      } catch (error) {
        console.error("[uc-kit] page enhancement failed", error);
      }
    }
  };

  /** Renders a kit element and enhances what it wrote. */
  function renderAndEnhance(element) {
    element.render();
    UC.internal.enhance(element);
  }

  /** Connected kit elements, so they can be re-rendered when translations arrive. */
  const connected = new Set();
  let rerenderQueued = false;

  /**
   * Re-renders every connected kit element once, after the current script.
   * Used when interface strings for the active language are added after the
   * components rendered (an extension script loaded after the kit).
   */
  UC.internal.rerenderAll = function rerenderAll() {
    if (rerenderQueued) return;
    rerenderQueued = true;
    queueMicrotask(() => {
      rerenderQueued = false;
      connected.forEach(renderAndEnhance);
    });
  };

  class UCElement extends HTMLElement {
    connectedCallback() {
      connected.add(this);
      if (!this.__ucSetupDone) {
        this.__ucSetupDone = true;
        this.setup();
      }
      if (!this.__ucLanguageListener) {
        this.__ucLanguageListener = () => renderAndEnhance(this);
        document.addEventListener("uc:languagechange", this.__ucLanguageListener);
      }
      renderAndEnhance(this);
    }

    disconnectedCallback() {
      connected.delete(this);
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
