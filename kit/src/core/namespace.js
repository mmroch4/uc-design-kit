/**
 * UC Design Kit — global namespace.
 * Every other file adds to `window.UC`; nothing else is written to the global scope.
 */
(function (global) {
  "use strict";

  if (global.UC && global.UC.version) {
    // The kit was loaded twice: keep the first instance.
    global.UC.__duplicate = true;
    return;
  }

  global.UC = {
    version: "1.0.0-dev",
    /** Internal modules shared between kit files. Not part of the public API. */
    internal: {},
  };
})(window);
