/**
 * <uc-timetable> — the weekly classes of UC_COURSE.schedule and the team's
 * office hours, as one table per type or grouped by weekday, with an optional
 * "My class" filter per type. See docs/api.md, section 3.4.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, flag, announce, storage, dayNode, timeRangeNode, joinNodes, minutesOf, parseTime } = UC.internal;

  const OFFICE_HOURS = "office-hours";
  const BUILTIN_TYPES = ["lecture", "tutorial", "lab"];
  const TYPE_KEYS = { lecture: "lecture", tutorial: "tutorial", lab: "lab", [OFFICE_HOURS]: "officeHours" };
  const collator = () => new Intl.Collator(UC.lang, { numeric: true, sensitivity: "base" });

  /** Label of a type: scheduleTypes wins, then the built-in translation, then the type as written. */
  function typeLabel(type) {
    const custom = UC.course.scheduleTypes && UC.course.scheduleTypes[type];
    if (custom) return UC.text(custom);
    return TYPE_KEYS[type] ? UC.t(`timetable.type.${TYPE_KEYS[type]}`) : type;
  }

  const asList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

  /** Team members by name, so staff names written in schedule[] can link to their page. */
  function memberByName(name) {
    return UC.course.team.find((member) => member && member.name === name) || { name };
  }

  /** Teachers of a schedule entry: `staff`, else the team members whose `classes` include the class. */
  function staffOf(entry) {
    const named = asList(entry.staff).filter((name) => typeof name === "string" && name.trim());
    if (named.length) return named.map(memberByName);
    return UC.course.team.filter((member) => member && member.name && Array.isArray(member.classes) && member.classes.includes(entry.class));
  }

  function personNode(member) {
    return member.url ? h("a", { href: member.url }, member.name) : member.name;
  }

  /** Comma-separated teachers, linked when they have a page. */
  function staffNodes(people) {
    return people.flatMap((member, index) => (index ? [", ", personNode(member)] : [personNode(member)]));
  }

  const html = (value) => {
    const text = UC.text(value);
    return text ? h("span", { html: text }) : null;
  };

  /** Valid schedule entries with their resolved teachers. Invalid ones are reported once. */
  let warned = false;
  function scheduleEntries() {
    const entries = [];
    (Array.isArray(UC.course.schedule) ? UC.course.schedule : []).forEach((entry, index) => {
      const valid =
        entry && entry.type && entry.class && Number.isInteger(Number(entry.day)) && Number(entry.day) >= 1 && Number(entry.day) <= 7 && parseTime(entry.start) && parseTime(entry.end);
      if (!valid) {
        if (!warned) console.warn(`[uc-kit] course.js: schedule[${index}] needs type, class, day (1–7), start and end ("HH:MM")`);
        return;
      }
      entries.push({ ...entry, type: String(entry.type), class: String(entry.class), day: Number(entry.day), staffList: staffOf(entry) });
    });
    warned = true;
    return entries;
  }

  /** Office hours of every team member, as entries shaped like schedule entries. */
  function officeHourEntries() {
    const entries = [];
    for (const member of UC.course.team) {
      if (!member || !member.name) continue;
      for (const slot of Array.isArray(member.officeHours) ? member.officeHours : []) {
        if (!slot || !parseTime(slot.start) || !parseTime(slot.end) || !(Number(slot.day) >= 1 && Number(slot.day) <= 7)) continue;
        entries.push({ ...slot, type: OFFICE_HOURS, day: Number(slot.day), room: slot.room || member.office, staffList: [member], member });
      }
    }
    return entries;
  }

  /**
   * Merges entries that differ only in the day ("3.ª e 5.ª"), then sorts rows
   * by first day, start time and class.
   */
  function mergeRows(entries) {
    const rows = new Map();
    for (const entry of entries) {
      const key = JSON.stringify([
        entry.type,
        entry.class || "",
        entry.member ? entry.member.name : "",
        parseTime(entry.start),
        parseTime(entry.end),
        UC.text(entry.room),
        entry.staffList.map((member) => member.name),
        UC.text(entry.note),
      ]);
      const row = rows.get(key);
      if (row) {
        if (!row.days.includes(entry.day)) row.days.push(entry.day);
      } else {
        rows.set(key, { ...entry, days: [entry.day] });
      }
    }
    const compare = collator();
    return Array.from(rows.values())
      .map((row) => ({ ...row, days: row.days.sort((a, b) => a - b) }))
      .sort((a, b) => a.days[0] - b.days[0] || minutesOf(a.start) - minutesOf(b.start) || compare.compare(a.class || "", b.class || ""));
  }

  class UCTimetable extends UC.Element {
    setup() {
      this.classList.add("uc-timetable");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-timetable-heading");
      this.selected = new Map();
    }

    connectedCallback() {
      super.connectedCallback();
      // "My class" is shared by every timetable of the course, on this page too.
      if (!this.onClassChange) {
        this.onClassChange = (event) => {
          const { type, class: code } = event.detail || {};
          if (!this.filter || !this.filterTypes.includes(type)) return;
          this.selected.set(type, code);
          this.filter.set(type, code);
          this.applyFilter();
        };
        document.addEventListener("uc:classchange", this.onClassChange);
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      document.removeEventListener("uc:classchange", this.onClassChange);
      this.onClassChange = null;
    }

    /** Types to show, in order: the `type` attribute, else built-in, custom, then office hours. */
    types(schedule, office) {
      const present = new Set(schedule.map((entry) => entry.type));
      const wanted = (this.getAttribute("type") || "").trim().split(/\s+/).filter(Boolean);
      if (wanted.length) return wanted.filter((type) => (type === OFFICE_HOURS ? office.length > 0 : present.has(type)));
      const custom = schedule.map((entry) => entry.type).filter((type, index, all) => !BUILTIN_TYPES.includes(type) && all.indexOf(type) === index);
      return [...BUILTIN_TYPES.filter((type) => present.has(type)), ...custom, ...(office.length ? [OFFICE_HOURS] : [])];
    }

    render() {
      const schedule = scheduleEntries();
      const office = officeHourEntries();
      const types = this.types(schedule, office);
      const byType = new Map(types.map((type) => [type, type === OFFICE_HOURS ? office : schedule.filter((entry) => entry.type === type)]));

      this.hidden = types.length === 0;
      if (this.hidden) {
        this.replaceChildren();
        return;
      }

      const headingAttr = this.getAttribute("heading");
      const showHeading = headingAttr !== "none";
      const headingText = headingAttr && headingAttr !== "none" ? headingAttr : this.t("timetable.heading");
      const headingTag = UC.internal.headingTag(this);
      const subheadingTag = `h${Math.min(Number(headingTag.slice(1)) + 1, 6)}`;

      // "My class": one select per type with two or more classes.
      this.filterTypes = flag(this, "class-filter")
        ? types.filter((type) => type !== OFFICE_HOURS && new Set(byType.get(type).map((entry) => entry.class)).size > 1)
        : [];
      this.filter = this.filterTypes.length ? this.renderFilter(byType) : null;

      const view = this.getAttribute("view") === "days" ? "days" : "table";
      const body = view === "days" ? this.renderDays(types, byType, subheadingTag) : types.map((type) => this.renderTable(type, byType.get(type)));

      this.replaceChildren(
        h(
          "section",
          {
            class: "uc-timetable__section",
            "aria-labelledby": showHeading ? this.headingId : null,
            "aria-label": showHeading ? null : headingText,
          },
          showHeading ? h(headingTag, { class: "uc-timetable__heading", id: this.headingId }, headingText) : null,
          this.filter ? this.filter.element : null,
          body,
          ...this.extra,
        ),
      );
      this.applyFilter();
    }

    renderFilter(byType) {
      const compare = collator();
      const groups = this.filterTypes.map((type) => {
        const classes = Array.from(new Set(byType.get(type).map((entry) => entry.class))).sort(compare.compare);
        const saved = this.selected.has(type) ? this.selected.get(type) : storage.get("class", type) || "";
        const value = classes.includes(saved) ? saved : "";
        this.selected.set(type, value);
        return {
          id: type,
          kind: "select",
          label: this.t("timetable.myClass", { type: typeLabel(type) }),
          options: [{ value: "", label: this.t("common.all") }, ...classes.map((code) => ({ value: code, label: code }))],
          value,
        };
      });
      const bar = UC.internal.filterBar({
        groups,
        onChange: (type, code) => {
          storage.set("class", type, code);
          if (!code) storage.remove("class", type);
          announce(code ? this.t("timetable.showing", { class: code }) : this.t("timetable.showingAll", { type: typeLabel(type) }));
          document.dispatchEvent(new CustomEvent("uc:classchange", { detail: { type, class: code } }));
        },
      });
      bar.element.classList.add("uc-timetable__filters");
      return bar;
    }

    /** Hides the rows and items of other classes for each type with a choice. Office hours are never filtered. */
    applyFilter() {
      this.querySelectorAll("[data-class][data-type]").forEach((node) => {
        const chosen = this.selected.get(node.dataset.type);
        node.hidden = Boolean(chosen) && node.dataset.class !== chosen;
      });
      // A weekday whose items are all hidden hides its heading too.
      this.querySelectorAll(".uc-timetable__day").forEach((day) => {
        day.hidden = !day.querySelector(".uc-timetable__item:not([hidden])");
      });
    }

    renderTable(type, entries) {
      const office = type === OFFICE_HOURS;
      const rows = mergeRows(entries);
      const hasNotes = rows.some((row) => UC.text(row.note));
      const column = (key) => h("th", { scope: "col" }, this.t(`timetable.column.${key}`));
      const head = office ? ["staff", "day", "time", "room"] : ["class", "day", "time", "room", "staff"];
      if (hasNotes) head.push("notes");

      return h(
        "div",
        { class: "uc-timetable__table uc-table", dataset: { type } },
        h(
          "table",
          {},
          h("caption", {}, typeLabel(type)),
          h("thead", {}, h("tr", {}, head.map(column))),
          h(
            "tbody",
            {},
            rows.map((row) => {
              const days = h("td", { class: "uc-timetable__days" }, joinNodes(row.days.map(dayNode)));
              const time = h("td", {}, timeRangeNode(row.start, row.end, "uc-timetable__time"));
              const room = h("td", { class: "uc-timetable__room" }, html(row.room));
              const note = hasNotes ? h("td", { class: "uc-timetable__note" }, html(row.note)) : null;
              if (office) {
                return h("tr", {}, h("th", { scope: "row" }, personNode(row.member)), days, time, room, note);
              }
              return h(
                "tr",
                { dataset: { type, class: row.class } },
                h("th", { scope: "row", class: "uc-mono" }, row.class),
                days,
                time,
                room,
                h("td", {}, staffNodes(row.staffList)),
                note,
              );
            }),
          ),
        ),
      );
    }

    renderDays(types, byType, subheadingTag) {
      const entries = types.flatMap((type) => byType.get(type));
      const compare = collator();
      const days = [];
      for (let day = 1; day <= 7; day += 1) {
        const items = entries
          .filter((entry) => entry.day === day)
          .sort((a, b) => minutesOf(a.start) - minutesOf(b.start) || compare.compare(a.class || "", b.class || ""));
        if (!items.length) continue;
        days.push(
          h(
            "div",
            { class: "uc-timetable__day" },
            h(subheadingTag, { class: "uc-timetable__day-heading" }, UC.weekdayName(day, "long")),
            h(
              "ul",
              { class: "uc-timetable__list" },
              items.map((entry) => {
                const office = entry.type === OFFICE_HOURS;
                const parts = [
                  office ? null : h("span", { class: "uc-mono" }, entry.class),
                  h("span", { class: "uc-tag" }, typeLabel(entry.type)),
                  html(entry.room),
                  entry.staffList.length ? h("span", {}, staffNodes(entry.staffList)) : null,
                ].filter(Boolean);
                const note = html(entry.note);
                return h(
                  "li",
                  { class: "uc-timetable__item", dataset: office ? {} : { type: entry.type, class: entry.class } },
                  timeRangeNode(entry.start, entry.end, "uc-timetable__time"),
                  h(
                    "span",
                    { class: "uc-timetable__details" },
                    parts.flatMap((part, index) => (index ? [" · ", part] : [part])),
                    note ? h("span", { class: "uc-timetable__note" }, note) : null,
                  ),
                );
              }),
            ),
          ),
        );
      }
      return days;
    }
  }

  UC.define("uc-timetable", UCTimetable);
})(window.UC);
