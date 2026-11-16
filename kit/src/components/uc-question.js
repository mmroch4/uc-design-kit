/**
 * <uc-question> — multiple-choice self-check question with immediate feedback.
 * See docs/api.md, section 3.5.
 *
 * Authored markup: question content, one <ul>/<ol> whose <li data-correct>
 * items are the right answers, and an optional [data-explanation] element
 * shown once the answer is correct. Which options are correct is never
 * revealed before a correct answer.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, icon, uid, flag } = UC.internal;

  /** Feedback states. */
  const STATUS = { none: "none", empty: "empty", incorrect: "incorrect", correct: "correct" };

  class UCQuestion extends UC.Element {
    setup() {
      const children = Array.from(this.childNodes);
      const list = children.find((node) => node.nodeType === Node.ELEMENT_NODE && node.matches("ul, ol"));
      this.explanation = children.find((node) => node.nodeType === Node.ELEMENT_NODE && node.matches("[data-explanation]")) || null;
      this.prompt = children.filter((node) => node !== list && node !== this.explanation);
      this.options = list
        ? Array.from(list.children)
            .filter((item) => item.matches("li"))
            .map((item) => ({ nodes: Array.from(item.childNodes), correct: item.hasAttribute("data-correct") }))
        : [];
      this.list = list || null;
      this.selected = new Set();
      this.status = STATUS.none;
      this.name = uid("uc-question");
      this.promptId = `${this.name}-prompt`;
      if (!this.options.length) console.warn("[uc-kit] uc-question: no <ul> with options found");
    }

    get multiple() {
      return flag(this, "multiple");
    }

    render() {
      if (!this.options.length) return;
      this.classList.add("uc-question");

      const focusedIndex = this.focusedOptionIndex();

      const options = this.options.map((option, index) => {
        const id = `${this.name}-${index}`;
        const checked = this.selected.has(index);
        const input = h("input", {
          class: "uc-question__input",
          type: this.multiple ? "checkbox" : "radio",
          name: this.name,
          id,
          value: String(index),
          checked,
          dataset: { index: String(index) },
          onChange: () => this.onChange(),
        });
        input.checked = checked;
        // Moving the authored nodes (not cloning) keeps them unique across re-renders.
        return h("label", { class: "uc-question__option", for: id }, input, h("span", { class: "uc-question__label" }, option.nodes));
      });

      const fieldset = h(
        "fieldset",
        { class: "uc-question__options", "aria-labelledby": this.promptId },
        options,
      );

      this.feedback = this.feedback || h("div", { class: "uc-question__feedback", "aria-live": "polite" });

      this.replaceChildren(
        h("span", { class: "uc-question__tag uc-tag" }, this.t("question.label")),
        h("div", { class: "uc-question__prompt", id: this.promptId }, this.prompt),
        fieldset,
        h(
          "div",
          { class: "uc-question__actions" },
          h("button", { type: "button", class: "uc-button uc-button--primary uc-question__check", onClick: () => this.check() }, this.t("question.check")),
        ),
        this.feedback,
        // The emptied authored list stays in the DOM (hidden) so no teacher node is dropped.
        this.list ? Object.assign(this.list, { hidden: true }) : null,
      );

      this.updateFeedback();
      if (focusedIndex !== null) this.querySelector(`[data-index="${focusedIndex}"]`)?.focus();
    }

    /** Updates the feedback region and the option states in place (keeps the live region stable). */
    updateFeedback() {
      const solved = this.status === STATUS.correct;
      this.classList.toggle("uc-question--solved", solved);
      this.querySelectorAll(".uc-question__option").forEach((label, index) => {
        label.classList.toggle("uc-question__option--correct", solved && this.options[index].correct);
      });
      this.feedback.className = `uc-question__feedback uc-question__feedback--${this.status}`;
      const message = this.renderFeedback();
      this.feedback.replaceChildren(...(message ? [message] : []));
      if (this.explanation) {
        this.explanation.hidden = !solved;
        this.explanation.classList.add("uc-question__explanation");
        this.feedback.append(this.explanation);
      }
    }

    renderFeedback() {
      switch (this.status) {
        case STATUS.correct:
          return h("p", { class: "uc-question__message" }, icon("checkCircle"), h("strong", {}, this.t("question.correct")));
        case STATUS.incorrect:
          return h("p", { class: "uc-question__message" }, this.t("question.incorrect"));
        case STATUS.empty:
          return h("p", { class: "uc-question__message" }, this.t("question.chooseOne"));
        default:
          return null;
      }
    }

    focusedOptionIndex() {
      const active = document.activeElement;
      return active && this.contains(active) && active.dataset && active.dataset.index !== undefined ? active.dataset.index : null;
    }

    readSelection() {
      this.selected = new Set(
        Array.from(this.querySelectorAll(".uc-question__input"))
          .filter((input) => input.checked)
          .map((input) => Number(input.dataset.index)),
      );
    }

    onChange() {
      this.readSelection();
      if (this.status !== STATUS.correct && this.status !== STATUS.none) this.setStatus(STATUS.none);
    }

    check() {
      this.readSelection();
      if (this.selected.size === 0) {
        this.setStatus(STATUS.empty);
        return;
      }
      const correct = this.options.every((option, index) => option.correct === this.selected.has(index));
      this.setStatus(correct ? STATUS.correct : STATUS.incorrect);
    }

    setStatus(status) {
      this.status = status;
      this.updateFeedback();
    }
  }

  UC.define("uc-question", UCQuestion);
})(window.UC);
