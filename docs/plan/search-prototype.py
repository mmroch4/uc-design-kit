#!/usr/bin/env python3
"""
Throwaway prototype of the uc-site.py index extractor (search plan, phase S0).

It exists only to measure the real size of the search index on the four
examples and to try the rules written in docs/plan/search-api.md. It is NOT
the script that ships: phases S2 and S3 write template/uc-site.py from the
contract, with tests. Delete this file in S3.

Usage:  python3 docs/plan/search-prototype.py examples/edados-2526 [--out FILE]
"""
import gzip
import html
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from html.parser import HTMLParser

INDEX_VERSION = 1
EXCERPT_LENGTH = 140

# ---------------------------------------------------------------- course.js


class CourseJsError(Exception):
    def __init__(self, message, line):
        super().__init__(f"course.js, line {line}: {message}")
        self.line = line


class LiteralReader:
    """
    Reads the value literals of course.js: objects, arrays, strings (single,
    double, template), numbers, true/false/null, comments, trailing commas,
    unquoted keys. Top-level `const NAME = <literal>;` define constants that
    can be used later, alone, joined with `+`, or inside `${NAME}`.
    """

    def __init__(self, source):
        self.s = source
        self.i = 0
        self.constants = {}

    def line(self):
        return self.s.count("\n", 0, self.i) + 1

    def fail(self, message):
        raise CourseJsError(message, self.line())

    def skip(self):
        s = self.s
        while self.i < len(s):
            c = s[self.i]
            if c in " \t\r\n﻿":
                self.i += 1
            elif s.startswith("//", self.i):
                end = s.find("\n", self.i)
                self.i = len(s) if end < 0 else end
            elif s.startswith("/*", self.i):
                end = s.find("*/", self.i + 2)
                if end < 0:
                    self.fail("comment not closed")
                self.i = end + 2
            else:
                break

    def peek(self):
        self.skip()
        return self.s[self.i] if self.i < len(self.s) else ""

    def expect(self, char):
        if self.peek() != char:
            self.fail(f"expected '{char}'")
        self.i += 1

    def identifier(self):
        self.skip()
        m = re.compile(r"[A-Za-z_$][\w$]*").match(self.s, self.i)
        if not m:
            self.fail("expected a name")
        self.i = m.end()
        return m.group(0)

    def program(self):
        """const NAME = value; … window.UC_COURSE = value;"""
        course = None
        while self.peek():
            word = self.identifier()
            if word in ("const", "let", "var"):
                name = self.identifier()
                self.expect("=")
                self.constants[name] = self.value()
            elif word == "window":
                self.expect(".")
                target = self.identifier()
                self.expect("=")
                value = self.value()
                if target == "UC_COURSE":
                    course = value
            else:
                self.fail(f"unexpected '{word}': course.js may only hold values")
            if self.peek() == ";":
                self.i += 1
        if course is None:
            self.fail("window.UC_COURSE = { … } not found")
        return course

    def value(self):
        left = self.term()
        while self.peek() == "+":
            self.i += 1
            right = self.term()
            if not isinstance(left, str) or not isinstance(right, str):
                self.fail("'+' only joins text")
            left += right
        return left

    def term(self):
        c = self.peek()
        if c == "{":
            return self.obj()
        if c == "[":
            return self.arr()
        if c in "'\"":
            return self.string(c)
        if c == "`":
            return self.template()
        m = re.compile(r"-?\d+(\.\d+)?").match(self.s, self.i)
        if m:
            self.i = m.end()
            return float(m.group(0)) if m.group(1) else int(m.group(0))
        word = self.identifier()
        if word in ("true", "false"):
            return word == "true"
        if word == "null":
            return None
        if word in self.constants:
            return self.constants[word]
        self.fail(f"'{word}' is not a value (functions, variables and code are not allowed)")

    def obj(self):
        self.expect("{")
        out = {}
        while self.peek() != "}":
            c = self.peek()
            key = self.string(c) if c in "'\"" else self.identifier()
            self.expect(":")
            out[key] = self.value()
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "}":
                self.fail("expected ',' or '}'")
        self.i += 1
        return out

    def arr(self):
        self.expect("[")
        out = []
        while self.peek() != "]":
            out.append(self.value())
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "]":
                self.fail("expected ',' or ']'")
        self.i += 1
        return out

    ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "\\": "\\", "'": "'", '"': '"', "`": "`", "$": "$", "/": "/"}

    def string(self, quote):
        self.i += 1
        out = []
        s = self.s
        while True:
            if self.i >= len(s) or s[self.i] == "\n":
                self.fail("text not closed")
            c = s[self.i]
            if c == quote:
                self.i += 1
                return "".join(out)
            if c == "\\":
                nxt = s[self.i + 1]
                if nxt == "u":
                    out.append(chr(int(s[self.i + 2 : self.i + 6], 16)))
                    self.i += 6
                    continue
                out.append(self.ESCAPES.get(nxt, nxt))
                self.i += 2
                continue
            out.append(c)
            self.i += 1

    def template(self):
        self.i += 1
        out = []
        s = self.s
        while True:
            if self.i >= len(s):
                self.fail("template text not closed")
            c = s[self.i]
            if c == "`":
                self.i += 1
                return "".join(out)
            if c == "\\":
                out.append(self.ESCAPES.get(s[self.i + 1], s[self.i + 1]))
                self.i += 2
                continue
            if s.startswith("${", self.i):
                self.i += 2
                name = self.identifier()
                if name not in self.constants:
                    self.fail(f"'{name}' is not a constant defined above")
                out.append(str(self.constants[name]))
                self.expect("}")
                continue
            out.append(c)
            self.i += 1


def read_course(folder):
    with open(os.path.join(folder, "course.js"), encoding="utf-8") as f:
        return LiteralReader(f.read()).program()


# ---------------------------------------------------------------- text


def fold(text):
    return "".join(c for c in unicodedata.normalize("NFD", text) if not unicodedata.combining(c)).lower()


def slugify(text):
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", fold(text))) or "section"


STOP_WORDS = set(
    (
        "que para com uma umas uns por pela pelo pelas pelos mais como nao sem sao ser foi sua seu suas seus "
        "das dos nas nos num numa este esta estes estas isto esse essa isso ela ele elas eles tem ter cada "
        "ainda tambem quando onde entre sobre depois antes so ja bem mas the and for are with this that from "
        "you your can will not have has into its was were all any"
    ).split()
)


def words(text):
    seen = {}
    for w in re.findall(r"[a-z0-9][a-z0-9_-]*", fold(text)):
        if (len(w) >= 3 or re.search(r"\d", w)) and w not in STOP_WORDS:
            seen.setdefault(w, None)
    return " ".join(seen)


def squash(text):
    return re.sub(r"\s+", " ", text).strip()


def excerpt(text):
    if len(text) <= EXCERPT_LENGTH:
        return text
    cut = text[:EXCERPT_LENGTH]
    return re.sub(r"[,.;:]$", "", cut[: cut.rfind(" ")]) + "…"


# ---------------------------------------------------------------- pages

SKIP = {"script", "style", "noscript", "template", "nav", "svg"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BLOCK_END = {"p", "li", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "div", "section", "dt", "dd", "tr", "pre", "summary", "figcaption", "caption", "blockquote"}
ITEM_SECTIONS = {"uc-week", "uc-exercise", "uc-question"}


class Section:
    def __init__(self, ident, kind):
        self.id = ident
        self.kind = kind
        self.title = {}  # lang ("" = all) -> list of text
        self.text = {}
        self.explicit_title = None


class PageExtractor(HTMLParser):
    def __init__(self, languages, page_lang):
        super().__init__(convert_charrefs=True)
        self.languages = languages
        self.page_lang = page_lang
        self.stack = []  # (tag, lang, skipping, capture_title)
        self.skip_depth = 0
        self.in_body = False
        self.noindex = False
        self.title_tag = []
        self.in_title = False
        self.h1 = {}
        self.capture = None  # "h1" | "heading" | None
        self.capture_depth = 0
        self.sections = [Section("", "intro")]
        self.used_ids = set()
        self.headings_without_id = []

    def current_lang(self):
        for _, lang, _ in reversed(self.stack):
            if lang:
                return lang
        return ""  # common to every language (a page_lang file is read with page_lang)

    def add(self, bucket, text):
        lang = self.current_lang()
        bucket.setdefault(lang, []).append(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "body":
            self.in_body = True
        if "id" in a:
            self.used_ids.add(a["id"])
        lang = a.get("lang")
        lang = lang if lang in self.languages and len(self.languages) > 1 else None
        if tag in VOID:
            if tag == "img" and self.in_body and not self.skip_depth and a.get("alt"):
                self.add(self.sections[-1].text, " " + a["alt"] + " ")
            return
        skipping = tag in SKIP or "data-search-ignore" in a or tag in ("uc-code",)
        if tag == "uc-page" and a.get("search") == "noindex":
            self.noindex = True
        if tag == "uc-code" and not self.skip_depth and a.get("filename"):
            self.add(self.sections[-1].text, " " + a["filename"] + " ")
        self.stack.append((tag, lang, skipping))
        if skipping:
            self.skip_depth += 1
            return
        if self.skip_depth or not self.in_body:
            return
        if tag == "h1":
            self.capture, self.capture_depth = "h1", len(self.stack)
        elif tag in ("h2", "h3"):
            ident = a.get("id")
            sec = Section(ident, tag)
            if not ident:
                self.headings_without_id.append(sec)
            if "data-search-title" in a:
                sec.explicit_title = a["data-search-title"]
            self.sections.append(sec)
            self.capture, self.capture_depth = "heading", len(self.stack)
        elif tag in ITEM_SECTIONS or (tag in ("li", "section", "article") and a.get("id") and tag != "section"):
            ident = a.get("id")
            if tag == "uc-week" and a.get("n"):
                ident = f"week-{a['n']}"
            if ident:
                sec = Section(ident, tag)
                sec.explicit_title = a.get("data-search-title") or a.get("title")
                self.sections.append(sec)

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in VOID:
            return
        # Pop to the matching tag (HTML is forgiving).
        for depth in range(len(self.stack) - 1, -1, -1):
            if self.stack[depth][0] == tag:
                for t, _, skipping in self.stack[depth:]:
                    if skipping:
                        self.skip_depth -= 1
                if self.capture and len(self.stack) >= self.capture_depth > depth:
                    self.capture = None
                del self.stack[depth:]
                break
        if tag in BLOCK_END and self.in_body and not self.skip_depth:
            self.add(self.sections[-1].text, " ")

    def handle_data(self, data):
        if self.in_title:
            self.title_tag.append(data)
        if not self.in_body or self.skip_depth:
            return
        if self.capture == "h1":
            self.add(self.h1, data)
            return
        if self.capture == "heading":
            self.add(self.sections[-1].title, data)
            return
        self.add(self.sections[-1].text, data)


def joined(bucket, lang):
    """Text for a language: the common part ("") plus that language's part."""
    parts = list(bucket.get("", [])) + (list(bucket.get(lang, [])) if lang else [])
    if not lang:
        parts = [t for k, v in bucket.items() for t in v] if len(bucket) == 1 and "" not in bucket else parts
    return squash("".join(parts))


def extract_page(path, rel, course, page_lang):
    languages = course.get("languages") or []
    with open(path, encoding="utf-8") as f:
        source = f.read()
    p = PageExtractor(languages, page_lang)
    p.feed(source)
    if p.noindex:
        return None
    # Automatic ids: the same rule as uc-guide's slugify, unique in the page,
    # computed from the heading text in the first language of the site.
    first = languages[0] if languages else ""
    for sec in p.headings_without_id:
        base = slugify(joined(sec.title, page_lang or (first if len(languages) > 1 else "")))
        candidate, n = base, 2
        while candidate in p.used_ids:
            candidate, n = f"{base}-{n}", n + 1
        p.used_ids.add(candidate)
        sec.id = candidate

    # A page with text in a specific language (lang="…" inside a bilingual
    # site) gets one entry per language, each with the common text plus that
    # language's text. Every other page gets one entry, with no "l" unless the
    # whole file belongs to one language (pages[].href = { lang: file }).
    buckets = [p.h1] + [s.title for s in p.sections] + [s.text for s in p.sections]
    specific = not page_lang and len(languages) > 1 and any(k for b in buckets for k in b if k)
    langs = languages if specific else [None]
    entries = []
    for lang in langs:
        title = joined(p.h1, lang) or squash("".join(p.title_tag)).split(" · ")[0]
        sections = []
        for sec in p.sections:
            head, text = joined(sec.title, lang), joined(sec.text, lang)
            head = sec.explicit_title or head
            if not head and not text and sec.kind != "intro":
                continue
            if sec.kind == "intro" and not text:
                continue
            item = {"i": sec.id or "", "h": head, "x": excerpt(text), "w": words(f"{head} {text}")}
            sections.append(item)
        entry = {"t": title, "p": rel, "s": sections}
        if lang or page_lang:
            entry["l"] = lang or page_lang
        entries.append(entry)
    return entries


def page_languages(course):
    """Files that belong to one language: pages whose href is { lang: file }."""
    out = {}
    for page in course.get("pages", []):
        if isinstance(page, dict) and isinstance(page.get("href"), dict):
            for lang, href in page["href"].items():
                out[href] = lang
    return out


def build_index(folder, course):
    exclude = course.get("search", {}).get("exclude", []) if isinstance(course.get("search"), dict) else []
    per_lang = page_languages(course)
    pages = []
    for root, dirs, files in os.walk(folder):
        dirs.sort()
        for name in sorted(files):
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            rel = os.path.relpath(path, folder).replace(os.sep, "/")
            if any(rel.startswith(e) for e in exclude):
                continue
            entries = extract_page(path, rel, course, per_lang.get(rel))
            if entries:
                pages.extend(entries)
    return {
        "v": INDEX_VERSION,
        "generator": "search-prototype.py (S0)",
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "course": course.get("code", ""),
        "languages": course.get("languages") or [],
        "pages": pages,
    }


def main():
    folder = sys.argv[1]
    course = read_course(folder)
    index = build_index(folder, course)
    body = json.dumps(index, ensure_ascii=False, separators=(",", ":")).replace('},{"t"', '},\n{"t"')
    content = "/* Generated by uc-site.py. Do not edit: run python3 uc-site.py again. */\nwindow.UC_SEARCH_INDEX = " + body + ";\n"
    raw = content.encode("utf-8")
    sections = sum(len(p["s"]) for p in index["pages"])
    files = len({p["p"] for p in index["pages"]})
    print(f"{folder}: {files} files, {len(index['pages'])} entries, {sections} sections, {len(raw) / 1024:.1f} KB, gzip {len(gzip.compress(raw, 9)) / 1024:.1f} KB")
    if "--out" in sys.argv:
        with open(sys.argv[sys.argv.index("--out") + 1], "w", encoding="utf-8") as f:
            f.write(content)


if __name__ == "__main__":
    main()
