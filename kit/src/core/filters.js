/**
 * The filter bar shared by the blocks that filter their content
 * (<uc-timetable>, and later <uc-problems>). One look everywhere:
 * .uc-filters, .uc-filters__group, .uc-filters__button, .uc-filters__select.
 *
 * Each group is either a set of toggle buttons (aria-pressed, inside a
 * role="group" named by the group's label) or a native <select> with a
 * visible <label>. See docs/plan/blocks-api.md 7.2.
 *
 *   const bar = UC.internal.filterBar({
 *     label: "Filtrar",                       // optional name of the whole bar
 *     groups: [{ id: "lab", label: "A minha turma", kind: "select",
 *                options: [{ value: "", label: "Todas" }, { value: "PL1", label: "PL1" }], value: "" }],
 *     onChange(groupId, value) { … },
 *   });
 *   bar.element; bar.value("lab"); bar.set("lab", "PL1");
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid } = UC.internal;

  UC.internal.filterBar = function filterBar({ label, groups, onChange }) {
    const values = new Map();
    const controls = new Map();

    function select(group) {
      const id = uid("uc-filter");
      const control = h(
        "select",
        {
          id,
          class: "uc-filters__select",
          onChange: () => {
            values.set(group.id, control.value);
            if (onChange) onChange(group.id, control.value);
          },
        },
        group.options.map((option) => h("option", { value: option.value }, option.label)),
      );
      control.value = values.get(group.id);
      controls.set(group.id, {
        update: (value) => {
          control.value = value;
        },
      });
      return h("div", { class: "uc-filters__group" }, h("label", { class: "uc-filters__label", for: id }, group.label), control);
    }

    function buttons(group) {
      const list = group.options.map((option) =>
        h(
          "button",
          {
            type: "button",
            class: "uc-button uc-filters__button",
            "aria-pressed": String(option.value === values.get(group.id)),
            dataset: { value: option.value },
            onClick: () => {
              if (values.get(group.id) === option.value) return;
              update(option.value);
              values.set(group.id, option.value);
              if (onChange) onChange(group.id, option.value);
            },
          },
          option.label,
        ),
      );
      const update = (value) => list.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === value)));
      controls.set(group.id, { update });
      const labelId = uid("uc-filter-label");
      return h(
        "div",
        { class: "uc-filters__group", role: "group", "aria-labelledby": labelId },
        h("span", { class: "uc-filters__label", id: labelId }, group.label),
        list,
      );
    }

    groups.forEach((group) => values.set(group.id, group.value === undefined ? "" : group.value));
    const element = h(
      "div",
      { class: "uc-filters", role: label ? "group" : null, "aria-label": label || null },
      groups.map((group) => (group.kind === "select" ? select(group) : buttons(group))),
    );

    return {
      element,
      value: (groupId) => values.get(groupId),
      /** Changes a group's value without calling onChange (a choice made elsewhere). */
      set(groupId, value) {
        if (!controls.has(groupId)) return;
        values.set(groupId, value);
        controls.get(groupId).update(value);
      },
    };
  };
})(window.UC);
