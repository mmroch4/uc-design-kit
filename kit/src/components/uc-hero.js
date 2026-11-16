/**
 * <uc-hero> — course heading: code, title (h1) and tagline from course.js.
 * Teacher-written children are kept below the tagline.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h } = UC.internal;

  class UCHero extends UC.Element {
    setup() {
      this.classList.add("uc-hero");
      this.extra = Array.from(this.childNodes);
    }

    render() {
      const course = this.course;
      this.replaceChildren(
        course.code ? h("p", { class: "uc-hero__code" }, course.code) : null,
        h("h1", { class: "uc-hero__title" }, this.text(course.title)),
        course.tagline ? h("p", { class: "uc-hero__tagline" }, this.text(course.tagline)) : null,
        ...this.extra,
      );
    }
  }

  UC.define("uc-hero", UCHero);
})(window.UC);
