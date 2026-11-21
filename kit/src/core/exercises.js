/**
 * The exercises of a lab guide: which ones count in a scope and whether each
 * is marked as done. Shared by <uc-exercise> and <uc-guide>.
 */
(function (UC) {
  "use strict";
  if (UC.__duplicate) return;

  const { storage, isHiddenByLanguage } = UC.internal;
  /** Keys written before 1.1, adopted on first read. */
  const LEGACY_PREFIX = "uc:done:";

  /* Saved per course (core/storage.js): uc:<course>:done:<path>#<id>. Without storage the state lasts for this page only. */
  const detail = (id) => `${window.location.pathname}#${id}`;

  /** Reads the persisted "done" state of an exercise id. */
  function readDone(id) {
    if (!id) return false;
    return storage.get("done", detail(id), { legacy: `${LEGACY_PREFIX}${detail(id)}` }) === "1";
  }

  /** Saves (or clears) the "done" state of an exercise id. */
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

  Object.assign(UC.internal, { readDone, writeDone, exercisesIn, isExerciseDone });
})(window.UC);
