/*
 * Site layouts for register.html, registered after uc-kit.js as a site would:
 * one on top of "top" (css relative to course.js), one built on it, and three
 * that are refused with a warning. (A style sheet that fails to load cannot be
 * tested here: the browser logs it as a console error, which fails the check.)
 */
UC.registerLayout("poster", { extends: "top", css: "layouts/poster.css" });
UC.registerLayout("big-poster", { extends: "poster" });
UC.registerLayout("top", { extends: "full" });
UC.registerLayout("Bad Name");
UC.registerLayout("orphan", { extends: "nope" });
