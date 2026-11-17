/**
 * <uc-materials> — decorates the teacher's list of materials per lecture or
 * chapter: each link becomes a button with its recognised type (PDF,
 * notebook, GitHub…), the first <time datetime> reads "Atualizado a 18 nov",
 * recent items get "Novo" and items without links read "Sem material".
 * See docs/api.md, section 3.7.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, uid, number, normalise, firstTime, localiseTime, otherLanguage, diffDays } = UC.internal;

  const TYPES = ["pdf", "notebook", "github", "video", "archive", "code", "slides", "link"];
  const HOSTS = { notebook: ["colab.research.google.com"], github: ["github.com", "gitlab.com"], video: ["youtube.com", "youtu.be", "vimeo.com"] };
  const EXTENSIONS = { pdf: /\.pdf$/, notebook: /\.ipynb$/, video: /\.mp4$/, archive: /\.(zip|tar\.gz|tgz)$/, code: /\.(java|py|c|cpp|h|hs|ml|js)$/ };

  /** The material type of a URL (docs/api.md 3.7): pdf, notebook, github, video, archive, code or link. */
  function materialType(href) {
    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return "link";
    }
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const file = url.pathname.toLowerCase();
    const onHost = (type) => (HOSTS[type] || []).some((name) => host === name || host.endsWith(`.${name}`));
    const has = (type) => EXTENSIONS[type] && EXTENSIONS[type].test(file);
    return ["pdf", "notebook", "github", "video", "archive", "code"].find((type) => has(type) || onHost(type)) || "link";
  }

  /** True for text between links that only separates them ("·", "|", ",", "/"). */
  const isSeparator = (node) => node.nodeType === 3 && /^[\s·|,/–—-]*$/.test(node.data);

  class UCMaterials extends UC.Element {
    setup() {
      this.classList.add("uc-materials");
      this.list = Array.from(this.children).find((child) => child.localName === "ol" || child.localName === "ul") || null;
      this.extra = Array.from(this.childNodes).filter((node) => node !== this.list);
      this.headingId = uid("uc-materials-heading");
      if (!this.list) return;
      this.list.classList.add("uc-materials__list");
      // The CSS counter replaces the list numbers: keep the teacher's <ol start>.
      const start = this.list.localName === "ol" ? parseInt(this.list.getAttribute("start"), 10) : NaN;
      if (Number.isFinite(start)) this.list.style.counterReset = `uc-materials ${start - 1}`;
      this.items = Array.from(this.list.children)
        .filter((item) => item.localName === "li")
        .map((element) => this.prepare(element));
    }

    /**
     * Splits an item once into its title (the text before the first link),
     * the update line and the links, which become buttons with a type icon.
     */
    prepare(element) {
      element.classList.add("uc-materials__item");
      const found = firstTime(element);
      const time = found && found.element.parentElement === element ? found.element : null;
      if (time) {
        const next = time.nextSibling;
        time.remove();
        if (next && next.nodeType === 3) next.data = next.data.replace(/^\s*[·:,.—–-]?\s*/, "");
      }
      const links = Array.from(element.children).filter((child) => child.localName === "a" && child.hasAttribute("href"));
      const title = h("span", { class: "uc-materials__title" });
      const rest = [];
      let before = true;
      Array.from(element.childNodes).forEach((node) => {
        if (links.includes(node)) before = false;
        else if (before) title.append(node);
        else if (isSeparator(node)) node.remove();
        else rest.push(node);
      });
      const labels = links.map((link) => {
        const type = TYPES.includes(link.dataset.type) ? link.dataset.type : materialType(link.getAttribute("href"));
        link.dataset.type = type;
        link.classList.add("uc-button", "uc-materials__link");
        const label = h("span", { class: "uc-visually-hidden" });
        link.prepend(icon(type));
        link.append(label);
        return { link, type, label };
      });
      const main = h("div", { class: "uc-materials__main" }, title, rest);
      const meta = h("p", { class: "uc-materials__meta" });
      const buttons = h("div", { class: "uc-materials__links" }, links);
      const empty = h("p", { class: "uc-materials__empty" });
      element.append(main, meta, buttons, empty);
      if (time) time.classList.add("uc-materials__date");
      return { element, meta, time, date: found ? found.date : null, labels, empty };
    }

    render() {
      if (!this.list) return;
      const today = UC.today();
      const newDays = number(this, "new-days", 7);
      this.items.forEach((item) => {
        item.labels.forEach(({ link, type, label }) => {
          // The type joins the name only when the visible text does not already say it ("PDF").
          const name = this.t(`materials.type.${type}`);
          label.textContent = normalise(link.textContent.replace(label.textContent, "")).includes(normalise(name)) ? "" : ` (${name})`;
        });
        const shown = item.labels.filter(({ link }) => !otherLanguage(link)).length;
        item.empty.textContent = this.t("materials.none");
        item.empty.hidden = shown > 0;

        item.meta.replaceChildren();
        if (item.time && item.date) {
          localiseTime(item.time, "short");
          const [before, after] = this.t("materials.updated").split("{date}");
          item.meta.append(h("span", { class: "uc-materials__updated" }, before, item.time, after));
          const age = diffDays(today, item.date);
          if (newDays > 0 && age >= 0 && age < newDays) {
            item.meta.append(" ", h("span", { class: "uc-tag uc-tag--accent uc-materials__new" }, this.t("materials.new")));
          }
        }
        item.meta.hidden = !item.meta.firstChild;
      });

      const label = this.getAttribute("heading");
      const none = label !== null && label.trim().toLowerCase() === "none";
      const text = label && label.trim() && !none ? label : this.t("materials.heading");
      const heading = none ? null : h(UC.internal.headingTag(this), { class: "uc-materials__heading", id: this.headingId }, text);
      this.replaceChildren(
        h(
          "section",
          { class: "uc-materials__section", "aria-labelledby": heading ? this.headingId : null },
          heading,
          this.list,
          this.extra,
        ),
      );
    }
  }

  UC.internal.materialType = materialType;
  UC.define("uc-materials", UCMaterials);
})(window.UC);
