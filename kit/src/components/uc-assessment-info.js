/**
 * <uc-assessment-info> — summary card of one configured deadline (date, time
 * or shifts, duration, location, status, links) at the top of an exam or test
 * page, with an optional .ics download. Teacher-written children stay below.
 * See docs/api.md, section 3.6.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { h, uid, icon, flag, toISO, parseDay, parseTime, endTime } = UC.internal;
  const html = (value) => (value ? h("span", { html: UC.text(value) }) : null);

  /** True when `url` is this page (hash and query ignored). */
  function isThisPage(url) {
    try {
      return new URL(url, window.location.href).pathname === window.location.pathname;
    } catch (error) {
      return false;
    }
  }

  /** "quarta-feira, 5 de novembro de 2025", a range for multi-day items, or the month / "Por marcar". */
  function longDate(deadline) {
    const { precision, date } = deadline.parsed;
    if (precision !== "day") return UC.formatDate(deadline.date);
    if (deadline.endDate > date) return UC.formatDateRange(date, deadline.endDate, "medium");
    return `${UC.weekdayName(((date.getDay() + 6) % 7) + 1, "long")}, ${UC.formatDate(date, "long")}`;
  }

  class UCAssessmentInfo extends UC.Element {
    setup() {
      this.classList.add("uc-assessment-info");
      this.extra = Array.from(this.childNodes);
      this.headingId = uid("uc-assessment-info-heading");
    }

    render() {
      const id = this.getAttribute("deadline");
      const deadline = UC.internal.findDeadline(id);
      if (!deadline) {
        if (!this.warned) console.warn(`[uc-kit] <uc-assessment-info>: unknown deadline "${id}"`);
        this.warned = true;
        this.replaceChildren(...this.extra);
        return;
      }
      const label = this.getAttribute("heading");
      const none = label !== null && label.trim().toLowerCase() === "none";
      const heading = none ? null : h(UC.internal.headingTag(this), { class: "uc-assessment-info__heading", id: this.headingId }, label && label.trim() ? label : this.text(deadline.title));
      const rows = [];
      const row = (key, ...value) => rows.push(h("dt", {}, this.t(key)), h("dd", {}, value));

      const { parsed } = deadline;
      row(
        "deadlines.column.date",
        parsed.precision === "day" ? h("time", { datetime: toISO(parsed.date) }, longDate(deadline)) : longDate(deadline),
      );

      const shifts = (Array.isArray(deadline.shifts) ? deadline.shifts : []).filter((shift) => shift && parseTime(shift.time));
      if (shifts.length) {
        row(
          "assessment.shifts",
          h(
            "ul",
            { class: "uc-assessment-info__shifts" },
            shifts.map((shift) => {
              const date = parseDay(shift.date);
              const parts = [
                date && parsed.date && +date !== +parsed.date ? `${UC.formatDate(date, "weekday")}, ` : null,
                UC.internal.timeRangeNode(shift.time, endTime(shift.time, shift.end, deadline.duration)),
              ];
              if (shift.location) parts.push(" · ", html(shift.location));
              if (shift.note) parts.push(" · ", html(shift.note));
              return h("li", {}, parts);
            }),
          ),
        );
      } else if (parseTime(deadline.time) && parsed.precision === "day") {
        row("deadlines.column.time", UC.internal.timeRangeNode(deadline.time, endTime(deadline.time, null, deadline.duration)));
      }
      if (deadline.duration > 0) row("assessment.duration", UC.formatDuration(deadline.duration));
      if (deadline.location) row("assessment.location", html(deadline.location));

      const { status, days } = UC.internal.deadlineStatus(deadline, UC.today());
      const statusText =
        status === "upcoming" ? (days === 1 ? this.t("assessment.tomorrow") : this.t("assessment.inDays", { count: days })) : status === "toBeScheduled" ? this.t("deadlines.toBeScheduled") : this.t(`assessment.${status}`);
      if (parsed.precision !== "none") {
        const tone = status === "done" ? " uc-tag--success" : status === "toBeScheduled" ? "" : " uc-tag--warning";
        row("deadlines.column.status", h("span", { class: `uc-tag uc-assessment-info__status${tone}` }, statusText));
      }

      const links = [];
      if (deadline.url && !isThisPage(deadline.url)) links.push({ url: deadline.url, label: deadline.title });
      links.push(...deadline.links);
      if (links.length) row("assessment.links", links.map((link, index) => [index ? " · " : null, h("a", { href: link.url }, this.text(link.label))]));

      const calendar =
        flag(this, "calendar") && parsed.precision === "day"
          ? h(
              "button",
              {
                type: "button",
                class: "uc-button uc-assessment-info__calendar",
                "aria-label": `${this.t("assessment.calendar")}, ${this.t("assessment.calendarFile")}`,
                onClick: () => this.download(deadline),
              },
              icon("download"),
              this.t("assessment.calendar"),
            )
          : null;

      this.replaceChildren(
        h(
          "section",
          { class: "uc-card uc-assessment-info__card", "aria-labelledby": heading ? this.headingId : null },
          heading,
          h("dl", {}, rows),
          deadline.note ? h("p", { class: "uc-assessment-info__note", html: this.text(deadline.note) }) : null,
          calendar,
        ),
        ...this.extra,
      );
    }

    download(deadline) {
      const text = UC.internal.icsText(deadline, window.location.href.split("#")[0]);
      const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
      const link = h("a", { href: url, download: `${UC.course.code || "uc"}-${deadline.id}.ics`, hidden: true });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  UC.define("uc-assessment-info", UCAssessmentInfo);
})(window.UC);
