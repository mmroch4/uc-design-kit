"""
Tests of template/uc-site.py (the site maintenance script), phase S2: the
course.js reader, every check of docs/architecture/search-api.md section 3.3, the
commands, options and output. The search index (phase S3) is tested in
test_index.py.

Standard library only, Python 3.8 or newer:

    python3 -m unittest discover -s tests/site-script -v

Each check fails once on a small broken site built in a temporary folder, and
the four examples must have no errors.
"""

import importlib.util
import io
import os
import shutil
import stat
import sys
import tempfile
import textwrap
import time
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPT = os.path.join(ROOT, "template", "uc-site.py")
EXAMPLES = os.path.join(ROOT, "examples")

sys.dont_write_bytecode = True  # no __pycache__ inside template/
spec = importlib.util.spec_from_file_location("uc_site", SCRIPT)
uc_site = importlib.util.module_from_spec(spec)
sys.modules["uc_site"] = uc_site
spec.loader.exec_module(uc_site)

HEAD = (
    '<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>{title}</title>'
    '<link rel="stylesheet" href="{up}kit/uc-kit.css"><script src="{up}course.js"></script>'
    '<script src="{up}kit/uc-kit.js" defer></script></head><body>\n'
)

COURSE = """\
window.UC_COURSE = {
  code: "CC0000",
  title: "Teste",
  edition: "2026/27",
  languages: ["pt"],
  semester: { start: "2026-09-14", weeks: 12 },
  pages: ["home", { id: "weeks", href: "semanas.html" }],
  deadlines: [{ id: "t1", title: "Teste 1", date: "2026-10-23", kind: "assessment" }],
  notices: [{ date: "2026-09-14", text: 'Ver <a href="semanas.html">Semanas</a>.' }],
  updated: "2026-09-14",
};
"""


def example_folders():
    names = sorted(os.listdir(EXAMPLES))
    return [os.path.join(EXAMPLES, n) for n in names if os.path.isfile(os.path.join(EXAMPLES, n, "course.js"))]


def page(body, title="Página", depth=0):
    up = "../" * depth
    return HEAD.format(title=title, up=up) + "<uc-page>\n" + body + "\n</uc-page></body></html>\n"


class SiteTestCase(unittest.TestCase):
    """Builds a small valid site in a temporary folder; tests break it."""

    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="uc-site-test-")
        self.addCleanup(shutil.rmtree, self.dir, True)
        os.chmod(self.dir, 0o755)  # mkdtemp makes it private
        self.write("course.js", COURSE)
        self.write("kit/uc-kit.css", "")
        self.write("kit/uc-kit.js", "")
        self.write("index.html", page('<h1>Início</h1>\n<p><a href="semanas.html">Semanas</a></p>'))
        self.write("semanas.html", page("<h1>Semanas</h1>\n<h2>Semana 1</h2>"))

    def write(self, rel, text, mode=None):
        path = os.path.join(self.dir, *rel.split("/"))
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        os.chmod(path, mode if mode is not None else 0o644)
        return path

    def run_script(self, *args):
        out = io.StringIO()
        code = uc_site.main(list(args) + ["--site", self.dir], out=out, default_site=self.dir)
        return code, out.getvalue()

    def problems(self, command="check"):
        site = uc_site.Site(self.dir)
        report = uc_site.Report()
        uc_site.check_site(site, report, command)
        return report.problems

    def keys(self, level=None, command="check"):
        return [p.key for p in self.problems(command) if level is None or p.level == level]

    def assertProblem(self, key, level, file=None, line=None, command="check", **args):
        found = [p for p in self.problems(command) if p.key == key]
        self.assertTrue(found, "no {} in {}".format(key, self.problems(command)))
        problem = found[0]
        self.assertEqual(problem.level, level)
        if file is not None:
            self.assertEqual(problem.file, file)
        if line is not None:
            self.assertEqual(problem.line, line)
        for name, value in args.items():
            self.assertEqual(problem.args.get(name), value)
        return problem


# ---------------------------------------------------------------------------
# course.js reader
# ---------------------------------------------------------------------------


class ReaderTest(unittest.TestCase):
    def read(self, source):
        return uc_site.read_course_source(source)

    def fails(self, source, key, line=None):
        with self.assertRaises(uc_site.CourseJsError) as raised:
            self.read(source)
        self.assertEqual(raised.exception.key, key)
        if line is not None:
            self.assertEqual(raised.exception.line, line)
        return raised.exception

    def test_values(self):
        course = self.read(
            textwrap.dedent(
                """\
                // comment
                /* block
                   comment */
                window.UC_COURSE = {
                  'single': 'a\\'b',
                  "double": "c\\"d\\u00e9\\n",
                  plain: `multi
                line`,
                  n: 12, f: -1.5, e: 1e3,
                  yes: true, no: false, none: null,
                  list: [1, "two", [3], { four: 4 },],
                  nested: { a: { b: [] } },
                  3: "numeric key",
                };
                """
            )
        )
        self.assertEqual(course["single"], "a'b")
        self.assertEqual(course["double"], 'c"dé\n')
        self.assertEqual(course["plain"], "multi\nline")
        self.assertEqual((course["n"], course["f"], course["e"]), (12, -1.5, 1000.0))
        self.assertEqual((course["yes"], course["no"], course["none"]), (True, False, None))
        self.assertEqual(course["list"], [1, "two", [3], {"four": 4}])
        self.assertEqual(course["nested"], {"a": {"b": []}})
        self.assertEqual(course["3"], "numeric key")

    def test_constants(self):
        course = self.read(
            textwrap.dedent(
                """\
                "use strict";
                const ORIGINAL = "https://example.org/";
                let YEAR = 2026;
                var TEAM = { name: "Ana" };
                window.UC_COURSE = {
                  a: ORIGINAL + "x.html",
                  b: `${ORIGINAL}y.html`,
                  c: `${ YEAR }`,
                  d: TEAM,
                  ORIGINAL,
                };
                """
            )
        )
        self.assertEqual(course["a"], "https://example.org/x.html")
        self.assertEqual(course["b"], "https://example.org/y.html")
        self.assertEqual(course["c"], "2026")
        self.assertEqual(course["d"], {"name": "Ana"})
        self.assertEqual(course["ORIGINAL"], "https://example.org/")

    def test_lines(self):
        course = self.read('window.UC_COURSE = {\n  a: 1,\n  list: [\n    "x",\n    "y",\n  ],\n};\n')
        self.assertEqual(course.lines["a"], 2)
        self.assertEqual(course.lines["list"], 3)
        self.assertEqual(course["list"].lines, [4, 5])

    def test_new_is_not_a_value(self):
        error = self.fails('window.UC_COURSE = {\n  updated: new Date(),\n};', "js.not_value", line=2)
        self.assertEqual(error.args_["word"], "new")

    def test_functions(self):
        self.fails("window.UC_COURSE = {\n  f() { return 1; },\n};", "js.function", line=2)
        self.fails("window.UC_COURSE = { f: function () {} };", "js.function")
        self.fails("window.UC_COURSE = { f: () => 1 };", "js.not_value")
        self.fails("window.UC_COURSE = { f: x => 1 };", "js.function")
        self.fails("window.UC_COURSE = { get x() { return 1; } };", "js.function")
        self.fails("window.UC_COURSE = { d: Date.now() };", "js.not_value")

    def test_other_code(self):
        self.fails("window.UC_COURSE = { ...OTHER };", "js.spread")
        self.fails("window.UC_COURSE = { [key]: 1 };", "js.computed_key")
        self.fails("window.UC_COURSE = { a: undefined };", "js.not_value")
        self.fails("window.UC_COURSE = { a: 1 };\nUC_COURSE.b = 2;", "js.statement", line=2)
        self.fails("window.OTHER = {};", "js.other_global")
        self.fails("window.UC_COURSE = {};\nwindow.UC_COURSE = {};", "js.twice", line=2)
        self.fails("window.UC_COURSE = [];", "js.not_object")
        self.fails("const A = 1;", "js.missing")
        self.fails('const A = 1;\nwindow.UC_COURSE = { a: A + "x" };', "js.plus")
        self.fails("window.UC_COURSE = { a: `${A}` };", "js.constant")
        self.fails("window.UC_COURSE = { a: `${A + 1}` };", "js.template_expr")
        self.fails("window.UC_COURSE = { a: B };", "js.not_value")
        self.fails("window.UC_COURSE = { a: 'open\n' };", "js.text")
        self.fails("window.UC_COURSE = { a: `open };", "js.template")
        self.fails("/* open\nwindow.UC_COURSE = {};", "js.comment")
        self.fails("window.UC_COURSE = { a: 1 b: 2 };", "js.expected")
        self.fails("window.UC_COURSE = { a: 1", "js.expected")

    def test_examples_and_template_read(self):
        folders = example_folders()
        folders.append(os.path.join(ROOT, "template"))
        for folder in folders:
            with self.subTest(folder=folder):
                with open(os.path.join(folder, "course.js"), encoding="utf-8") as f:
                    course = self.read(f.read())
                self.assertTrue(course["title"])


# ---------------------------------------------------------------------------
# Checks (search-api.md 3.3): each one fails once
# ---------------------------------------------------------------------------


class CleanSiteTest(SiteTestCase):
    def test_clean_site_has_no_problems(self):
        self.assertEqual(self.problems(), [])
        code, output = self.run_script("check", "--lang", "pt")
        self.assertEqual(code, 0)
        self.assertIn("2 páginas · 0 erros · 0 avisos · 0 informações", output)

    def test_examples_have_no_errors(self):
        for folder in example_folders():
            with self.subTest(example=os.path.basename(folder)):
                site = uc_site.Site(folder)
                report = uc_site.Report()
                uc_site.check_site(site, report, "check")
                errors = [p for p in report.problems if p.level == uc_site.ERROR]
                self.assertEqual(errors, [])

    def test_template_is_clean(self):
        site = uc_site.Site(os.path.join(ROOT, "template"))
        report = uc_site.Report()
        uc_site.check_site(site, report, "check")
        # The template ships its search-index.js; whether it is "older" than
        # the pages depends only on the order git wrote the files (mtimes).
        problems = [p for p in report.problems if p.key != "index.stale"]
        self.assertEqual(problems, [])


class CourseCheckTest(SiteTestCase):
    def test_unreadable_course(self):
        self.write("course.js", "window.UC_COURSE = {\n  updated: new Date(),\n};\n")
        self.assertProblem("js.not_value", "error", file="course.js", line=2)

    def test_missing_course(self):
        os.remove(os.path.join(self.dir, "course.js"))
        self.assertProblem("course.missing", "error")

    def test_required_fields(self):
        self.write("course.js", 'window.UC_COURSE = {\n  code: "X",\n  pages: ["home"],\n};\n')
        self.assertProblem("course.required", "error", field="title")
        self.assertProblem("course.recommended", "warning", field="semester.start")

    def test_bilingual_title_is_enough(self):
        self.write("course.js", COURSE.replace('title: "Teste"', 'title: { pt: "Teste", en: "Test" }'))
        self.assertNotIn("course.required", self.keys())

    def test_page_missing(self):
        self.write("course.js", COURSE.replace('href: "semanas.html"', 'href: "weeks.html"'))
        self.assertProblem("course.page_missing", "error", line=7, target="weeks.html")

    def test_page_per_language(self):
        self.write("course.js", COURSE.replace('href: "semanas.html"', 'href: { pt: "semanas.html", en: "weeks.html" }'))
        self.assertProblem("course.page_missing", "error", target="weeks.html")

    def test_builtin_page_needs_its_file(self):
        self.write("course.js", COURSE.replace('pages: ["home",', 'pages: ["home", "about",'))
        self.assertProblem("course.page_missing", "error", target="about.html")

    def test_unknown_page_id(self):
        self.write("course.js", COURSE.replace('pages: ["home",', 'pages: ["home", "notes",'))
        self.assertProblem("course.page_unknown", "error", id="notes")

    def test_logo_forms(self):
        self.write("logo.png", "")
        for logo in ('"logo.png"', '{ src: "logo.png", alt: "DCC" }', "'<svg viewBox=\"0 0 1 1\"><path d=\"M0 0\"/></svg>'"):
            self.write("course.js", COURSE.replace('updated:', "logo: " + logo + ",\n  updated:"))
            self.assertEqual(self.problems(), [], logo)
        self.write("course.js", COURSE.replace('updated:', 'logo: { src: "missing.svg" },\n  updated:'))
        self.assertTrue([p for p in self.problems() if p.args.get("target") == "missing.svg"], self.problems())

    def test_invalid_dates(self):
        source = COURSE.replace('start: "2026-09-14"', 'start: "2026-02-30"')
        source = source.replace('date: "2026-10-23"', 'date: "23/10/2026"')
        source = source.replace('updated: "2026-09-14"', 'updated: "2026-9-14"')
        self.write("course.js", source)
        fields = sorted(p.args["field"] for p in self.problems() if p.key in ("course.date", "course.deadline_date"))
        self.assertEqual(fields, ["deadlines[0].date", "semester.start", "updated"])

    def test_deadline_dates_month_and_null(self):
        source = COURSE.replace(
            'deadlines: [{ id: "t1", title: "Teste 1", date: "2026-10-23", kind: "assessment" }]',
            'deadlines: [{ id: "a", title: "A", date: "2027-01" }, { id: "b", title: "B", date: null }]',
        )
        self.write("course.js", source)
        self.assertEqual(self.problems(), [])

    def test_duplicate_deadline_id(self):
        source = COURSE.replace(
            'deadlines: [{ id: "t1", title: "Teste 1", date: "2026-10-23", kind: "assessment" }]',
            'deadlines: [\n    { id: "t1", title: "A" },\n    { id: "t1", title: "B" },\n  ]',
        )
        self.write("course.js", source)
        self.assertProblem("course.deadline_duplicate", "error", line=10, id="t1", other="deadlines[0]")

    def test_deadline_warnings(self):
        source = COURSE.replace(
            'deadlines: [{ id: "t1", title: "Teste 1", date: "2026-10-23", kind: "assessment" }]',
            'deadlines: [{ kind: "party" }]',
        )
        self.write("course.js", source)
        self.assertEqual(
            sorted(self.keys("warning")),
            ["course.deadline_kind", "course.deadline_no_id", "course.deadline_no_title"],
        )

    def test_links_in_course_texts(self):
        self.write("course.js", COURSE.replace('href="semanas.html">Semanas', 'href="horario.html">Horário'))
        self.assertProblem("link.missing", "error", file="course.js", line=9, target="horario.html")

    def test_url_fields(self):
        self.write("course.js", COURSE.replace("updated:", 'platforms: [{ label: "Notas", url: "notas/" }],\n  updated:'))
        self.assertProblem("link.missing", "error", file="course.js", target="notas/")

    def test_search_field(self):
        self.write("course.js", COURSE.replace("updated:", "search: 1,\n  updated:"))
        self.assertProblem("course.search", "error")

    def test_search_exclude_unused(self):
        self.write("course.js", COURSE.replace("updated:", 'search: { exclude: ["semanas.html", "rascunhos/"] },\n  updated:'))
        self.assertProblem("course.search_exclude", "warning", entry="rascunhos/")
        self.assertEqual(len([k for k in self.keys() if k == "course.search_exclude"]), 1)


class PageCheckTest(SiteTestCase):
    def test_broken_link(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html#s1">S</a>\n<a href="guioes/aula13.html">13</a>'))
        self.assertProblem("link.missing", "error", file="index.html", line=5, target="guioes/aula13.html")

    def test_links_that_are_not_checked(self):
        links = [
            "https://example.org/x.html", "http://x", "//cdn.example.org/x.js", "mailto:a@b.c", "tel:123",
            "javascript:void(0)", "data:text/plain,x", "#top", "?x=1", "", "semanas.html?x=1#y",
            "../outside.html",
        ]
        body = "".join('<a href="{}">x</a>\n'.format(link) for link in links)
        self.write("index.html", page("<h1>Início</h1>\n" + body))
        self.assertEqual(self.problems(), [])

    def test_folder_link_needs_index(self):
        self.write("aulas/notas.txt", "x")
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a><a href="aulas/">Aulas</a>'))
        self.assertProblem("link.folder", "error", target="aulas/")
        self.write("aulas/index.html", page("<h1>Aulas</h1>", depth=1))
        self.assertNotIn("link.folder", self.keys())

    def test_encoded_link(self):
        self.write("notas da aula.html", page("<h1>Notas</h1>"))
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a><a href="notas%20da%20aula.html">N</a>'))
        self.assertEqual(self.problems(), [])

    def test_case_mismatch(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="Semanas.html">S</a>'))
        self.assertProblem("link.case", "error", target="Semanas.html", actual="semanas.html")

    def test_absolute_path(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a><a href="/~fds/x.html">x</a>'))
        self.assertProblem("link.absolute", "warning")

    def test_images(self):
        self.write("img/a.png", "")
        self.write(
            "index.html",
            page('<h1>Início</h1>\n<a href="semanas.html">S</a>\n<img src="img/a.png" alt="A">\n<img src="img/b.png" alt="B">\n'
                 '<picture><source srcset="img/a.png 1x, img/c.png 2x"><img src="img/a.png" alt=""></picture>'),
        )
        missing = [p.args["target"] for p in self.problems() if p.key == "image.missing"]
        self.assertEqual(missing, ["img/b.png", "img/c.png"])

    def test_other_files(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a><script src="extra.js" defer></script>'))
        self.assertProblem("file.missing", "error", attribute="src", target="extra.js")

    def test_kit_files_loaded(self):
        self.write("semanas.html", "<!doctype html><html><head></head><body><uc-page><h1>S</h1></uc-page></body></html>")
        missing = sorted(p.args["asset"] for p in self.problems() if p.key == "kit.missing")
        self.assertEqual(missing, ["course.js", "uc-kit.css", "uc-kit.js"])

    def test_kit_path_resolves(self):
        os.remove(os.path.join(self.dir, "kit", "uc-kit.js"))
        self.assertProblem("file.missing", "error", file="index.html", target="kit/uc-kit.js")

    def test_kit_outside_site_is_skipped(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a>').replace('href="kit/', 'href="../../kit/').replace('src="kit/', 'src="../../kit/'))
        self.assertEqual(self.problems(), [])

    def test_pages_without_the_kit_are_kept_as_they_are(self):
        self.write("antigo.html", "<html><body><p>Old page</p></body></html>")
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a><a href="antigo.html">A</a>'))
        self.assertEqual(self.problems(), [])

    def test_duplicate_id(self):
        self.write("semanas.html", page('<h1>Semanas</h1>\n<h2 id="s1">1</h2>\n<h2 id="s1">2</h2>\n<template><p id="s1"></p></template>'))
        self.assertProblem("id.duplicate", "error", file="semanas.html", line=5, id="s1", first=4)
        self.assertEqual(self.keys().count("id.duplicate"), 1)

    def test_lang_on_bilingual_site(self):
        self.write("course.js", COURSE.replace('languages: ["pt"]', 'languages: ["pt", "en"]'))
        self.write("semanas.html", page('<h1><span lang="pt">Semanas</span><span lang="en">Weeks</span><span lang="fr">Semaines</span></h1>'))
        self.assertProblem("lang.unknown", "error", lang="fr")
        self.assertEqual(self.keys().count("lang.unknown"), 1)

    def test_uc_code_lang_is_a_programming_language(self):
        self.write("course.js", COURSE.replace('languages: ["pt"]', 'languages: ["pt", "en"]'))
        self.write("semanas.html", page('<h1>Semanas</h1>\n<uc-code lang="c" filename="a.c">int main;</uc-code>\n<uc-code lang="java"></uc-code>'))
        self.assertNotIn("lang.unknown", self.keys())

    def test_lang_on_single_language_site_is_free(self):
        self.write("semanas.html", page('<h1>Semanas</h1>\n<p><span lang="en">weeks</span></p>'))
        self.assertEqual(self.problems(), [])

    def test_image_without_alt(self):
        self.write("img/a.png", "")
        self.write("semanas.html", page('<h1>Semanas</h1>\n<img src="img/a.png">\n<img src="img/a.png" alt="">'))
        self.assertProblem("img.alt", "warning", line=4, src="img/a.png")
        self.assertEqual(self.keys().count("img.alt"), 1)

    def test_page_without_h1(self):
        self.write("semanas.html", page("<h2>Semanas</h2>"))
        self.assertProblem("heading.h1", "warning", file="semanas.html")

    def test_hero_is_the_h1(self):
        self.write("index.html", page('<uc-hero></uc-hero>\n<h2>Avisos</h2>\n<a href="semanas.html">S</a>'))
        self.assertEqual(self.problems(), [])

    def test_heading_skipped(self):
        self.write("semanas.html", page("<h1>Semanas</h1>\n<h2>A</h2>\n<h4>B</h4>\n<h2>C</h2>\n<h3>D</h3>"))
        self.assertProblem("heading.skip", "warning", line=5, to=4, after=2)
        self.assertEqual(self.keys().count("heading.skip"), 1)

    def test_orphan_page(self):
        self.write("velho.html", page("<h1>Velho</h1>"))
        self.assertProblem("orphan", "info", file="velho.html")

    def test_page_listed_in_course_is_not_orphan(self):
        self.write("index.html", page("<h1>Início</h1>"))
        self.assertEqual(self.problems(), [])

    def test_self_link_does_not_count(self):
        self.write("velho.html", page('<h1>Velho</h1>\n<a href="velho.html#x">x</a>'))
        self.assertProblem("orphan", "info", file="velho.html")

    def test_not_utf8(self):
        path = os.path.join(self.dir, "semanas.html")
        with open(path, "wb") as f:
            f.write(page("<h1>Semanas \xe9</h1>").encode("latin-1"))
        self.assertProblem("page.not_utf8", "warning")


@unittest.skipUnless(os.name == "posix", "POSIX only")
class PermissionTest(SiteTestCase):
    def test_missing_permissions_and_fix(self):
        self.write("semanas.html", page("<h1>Semanas</h1>"), mode=0o600)
        os.makedirs(os.path.join(self.dir, "privado"))
        self.write("privado/index.html", page("<h1>P</h1>", depth=1))
        os.chmod(os.path.join(self.dir, "privado"), 0o700)
        problems = [(p.file, p.key) for p in self.problems() if p.key.startswith("permission")]
        self.assertEqual(problems, [("privado", "permission.folder"), ("semanas.html", "permission.file")])

        code, output = self.run_script("check", "--fix-permissions", "--lang", "en")
        self.assertIn("read permissions fixed on 2 files and folders", output)
        self.assertEqual(stat.S_IMODE(os.stat(os.path.join(self.dir, "semanas.html")).st_mode), 0o604)
        self.assertEqual(stat.S_IMODE(os.stat(os.path.join(self.dir, "privado")).st_mode), 0o705)
        self.assertFalse([p for p in self.problems() if p.key.startswith("permission")])


class IndexStateTest(SiteTestCase):
    def test_index_absent_and_stale(self):
        self.write("course.js", COURSE.replace("updated:", "search: true,\n  updated:"))
        self.assertProblem("index.absent", "info", file="search-index.js")
        index = self.write("search-index.js", "window.UC_SEARCH_INDEX = {};")
        old = time.time() - 3600
        os.utime(index, (old, old))
        self.assertProblem("index.stale", "info", file="search-index.js")
        # Not reported by the default command, which rewrites the index.
        self.assertNotIn("index.stale", self.keys(command="all"))

    def test_custom_index_name(self):
        self.write("course.js", COURSE.replace("updated:", 'search: { index: "dados/indice.js" },\n  updated:'))
        self.assertProblem("index.absent", "info", file="dados/indice.js")


# ---------------------------------------------------------------------------
# Command line and output (search-api.md 3.1, 3.2)
# ---------------------------------------------------------------------------


class CommandLineTest(SiteTestCase):
    def test_output_format(self):
        self.write("index.html", page('<h1>Início</h1>\n<a href="semanas.html">S</a>\n<a href="guioes/aula13.html">13</a>\n<img src="semanas.html">'))
        self.write("velho.html", page("<h1>Velho</h1>"))
        code, output = self.run_script("--lang", "pt")
        lines = output.splitlines()
        self.assertEqual(code, 1)
        self.assertEqual(lines[0], "UC Design Kit · uc-site.py {} · Teste 2026/27 (CC0000)".format(uc_site.VERSION))
        self.assertEqual(lines[1], "ERRO   index.html:5  ligação para guioes/aula13.html: o ficheiro não existe")
        self.assertEqual(lines[2], 'AVISO  index.html:6  imagem sem alt: semanas.html (se for decorativa, use alt="")')
        self.assertEqual(lines[3], "INFO   velho.html    nenhuma página liga para este ficheiro")
        self.assertEqual(lines[4], "3 páginas · 1 erro · 1 aviso · 1 informação")

    def test_english_and_default_language(self):
        self.write("velho.html", page("<h1>Velho</h1>"))
        _, output = self.run_script()
        self.assertIn("INFO   velho.html  nenhuma página liga", output)  # pt: first language of course.js
        _, output = self.run_script("--lang", "en")
        self.assertIn("INFO     velho.html  no page links to this file", output)
        self.assertIn("3 pages · 0 errors · 0 warnings · 1 info", output)
        self.write("course.js", COURSE.replace('languages: ["pt"]', 'languages: ["es"]'))
        _, output = self.run_script()
        self.assertIn("no page links to this file", output)

    def test_quiet(self):
        self.write("velho.html", page("<h1>Velho</h1>"))
        code, output = self.run_script("--quiet")
        self.assertEqual((code, output), (0, ""))
        self.write("index.html", page('<h1>Início</h1>\n<a href="x.html">x</a>'))
        code, output = self.run_script("--quiet")
        self.assertEqual(code, 1)
        self.assertEqual(len(output.splitlines()), 1)
        self.assertTrue(output.startswith("ERRO"))

    def test_exit_status_with_warnings_only(self):
        self.write("semanas.html", page("<h2>Semanas</h2>"))
        code, _ = self.run_script("check")
        self.assertEqual(code, 0)

    def test_index_command(self):
        code, output = self.run_script("index", "--lang", "en")
        self.assertEqual(code, 0)
        self.assertIn("Search is off in course.js", output)
        self.write("course.js", "window.UC_COURSE = { a: f() };")
        code, output = self.run_script("index", "--lang", "en")
        self.assertEqual(code, 1)
        self.assertIn("functions are not allowed", output)

    def test_check_writes_nothing(self):
        self.write("course.js", COURSE.replace("updated:", "search: true,\n  updated:"))
        before = sorted(os.listdir(self.dir))
        self.run_script("check")
        self.assertEqual(sorted(os.listdir(self.dir)), before)
        # The default command writes the index, and nothing else.
        self.run_script()
        self.assertEqual(sorted(os.listdir(self.dir)), sorted(before + ["search-index.js"]))

    def test_usage_errors(self):
        stderr = sys.stderr
        sys.stderr = io.StringIO()
        try:
            with self.assertRaises(SystemExit) as raised:
                uc_site.main(["publish"], out=io.StringIO(), default_site=self.dir)
            self.assertEqual(raised.exception.code, 2)
            self.assertEqual(uc_site.main(["--site", os.path.join(self.dir, "nope")], out=io.StringIO()), 2)
        finally:
            sys.stderr = stderr

    def test_version_and_help(self):
        stdout = sys.stdout
        sys.stdout = io.StringIO()
        try:
            with self.assertRaises(SystemExit) as raised:
                uc_site.main(["--version"], default_site=self.dir)
            self.assertEqual(raised.exception.code, 0)
            self.assertIn("uc-site.py " + uc_site.VERSION, sys.stdout.getvalue())
            with self.assertRaises(SystemExit):
                uc_site.main(["--help", "--lang", "pt"], default_site=self.dir)
            self.assertIn("--fix-permissions", sys.stdout.getvalue())
            self.assertIn("pasta do site", sys.stdout.getvalue())
        finally:
            sys.stdout = stdout

    def test_default_site_is_the_script_folder(self):
        shutil.copy(SCRIPT, os.path.join(self.dir, "uc-site.py"))
        import subprocess

        result = subprocess.run(
            [sys.executable, os.path.join(self.dir, "uc-site.py"), "check", "--lang", "en"],
            cwd=tempfile.gettempdir(), stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("Teste 2026/27 (CC0000)", result.stdout)

    def test_messages_have_both_languages(self):
        self.assertEqual(set(uc_site.MESSAGES["pt"]), set(uc_site.MESSAGES["en"]))


if __name__ == "__main__":
    unittest.main()
