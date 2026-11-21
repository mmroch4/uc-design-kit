#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
uc-site.py: maintenance script for a course site made with the UC Design Kit.

Run it in the site folder (next to course.js) after every change:

    python3 uc-site.py            check the site (and write
                                  the search index when course.js has search)
    python3 uc-site.py check      check only, write nothing
    python3 uc-site.py index      write the search index only
    python3 uc-site.py --help     every option

It needs Python 3.8 or newer and nothing else: no network, no packages. It
never changes course.js or the pages. The only file it writes is the search
index (and, with --fix-permissions, the read permissions of the site files).

Documentation: https://uc-design-kit.miguelrocha.dev/docs/pt/manter.html
Licence: MIT (the UC Design Kit).
"""

import argparse
import json
import os
import re
import stat
import sys
import unicodedata
from datetime import date, datetime, timezone
from html.parser import HTMLParser
from urllib.parse import unquote

# Written by the kit's build (scripts/build.mjs) from its package.json.
VERSION = "1.0.0"
SCRIPT_NAME = "uc-site.py"
DEFAULT_INDEX = "search-index.js"

# Pages that course.js may name by id alone (kit/src/core/config.js).
BUILTIN_PAGES = {
    "home": "index.html",
    "weeks": "weeks.html",
    "assessment": "assessment.html",
    "materials": "materials.html",
    "schedule": "schedule.html",
    "about": "about.html",
}
DEADLINE_KINDS = ("assessment", "exam", "quiz", "submission", "other")
KIT_FILES = ("uc-kit.css", "course.js", "uc-kit.js")

ERROR, WARNING, INFO = "error", "warning", "info"
LEVEL_ORDER = {ERROR: 0, WARNING: 1, INFO: 2}

# ---------------------------------------------------------------------------
# Messages (pt, en). Every text the script prints is here.
# ---------------------------------------------------------------------------

MESSAGES = {
    "pt": {
        "label.error": "ERRO",
        "label.warning": "AVISO",
        "label.info": "INFO",
        "summary.pages": ("{n} página", "{n} páginas"),
        "summary.error": ("{n} erro", "{n} erros"),
        "summary.warning": ("{n} aviso", "{n} avisos"),
        "summary.info": ("{n} informação", "{n} informações"),
        "header": "UC Design Kit · uc-site.py {version} · {title}",
        "index.written": "Índice: {index} ({pages}, {sections}, {size} KB)",
        "index.pages": ("{n} página", "{n} páginas"),
        "index.sections": ("{n} secção", "{n} secções"),
        "index.large": "Aviso: o índice tem {size} KB e a primeira pesquisa de cada visita fica mais lenta. Considere deixar pastas de fora com search.exclude no course.js.",
        "index.failed": "Índice: não foi possível escrever {index}: {error}",
        "index.outside": "Índice: search.index (\"{index}\") tem de ficar dentro da pasta do site",
        "index.off": "A pesquisa está desligada no course.js (falta search: true): não há índice para escrever.",
        "index.unreadable": "Índice: não foi escrito, porque o course.js não se consegue ler.",
        "permissions.fixed": "permissões de leitura corrigidas em {n} ficheiros e pastas",
        # course.js reader
        "js.not_value": "'{word}' não é um valor: o course.js só pode ter valores (texto, números, listas, objetos)",
        "js.function": "as funções não são permitidas: o course.js só pode ter valores (texto, números, listas, objetos)",
        "js.expected": "esperava '{char}'",
        "js.expected_name": "esperava um nome",
        "js.expected_value": "esperava um valor (texto, número, lista ou objeto)",
        "js.comment": "comentário /* sem */ a fechar",
        "js.text": "texto sem aspas a fechar",
        "js.template": "texto com ` sem ` a fechar",
        "js.plus": "'+' só pode juntar textos",
        "js.template_expr": "dentro de ${{…}} só pode estar o nome de uma constante definida antes",
        "js.constant": "'{name}' não é uma constante definida antes",
        "js.statement": "'{word}' não é permitido aqui: o course.js só pode ter constantes (const NOME = …;) e window.UC_COURSE = {{ … }};",
        "js.missing": "não encontrei window.UC_COURSE = {{ … }};",
        "js.twice": "window.UC_COURSE aparece mais de uma vez",
        "js.other_global": "só se pode definir window.UC_COURSE (encontrei window.{name})",
        "js.not_object": "window.UC_COURSE tem de ser um objeto {{ … }}",
        "js.computed_key": "chaves calculadas [ … ] não são permitidas",
        "js.spread": "'...' não é permitido: escreva os valores por extenso",
        # course.js content
        "course.missing": "não existe course.js nesta pasta",
        "course.unreadable": "não foi possível ler o ficheiro: {error}",
        "course.required": "falta o campo obrigatório {field}",
        "course.recommended": "falta o campo {field}: as semanas ficam sem datas",
        "course.page_missing": "{field}: {target} não existe",
        "course.page_unknown": "{field}: \"{id}\" não é uma página do kit e precisa de href",
        "course.page_no_id": "{field} não tem id",
        "course.date": "{field}: data inválida \"{value}\" (use AAAA-MM-DD)",
        "course.deadline_date": "{field}: data inválida \"{value}\" (use AAAA-MM-DD, AAAA-MM ou null)",
        "course.deadline_duplicate": "{field}: o id \"{id}\" já é usado em {other}",
        "course.deadline_no_id": "{field} não tem id",
        "course.deadline_no_title": "{field} não tem title",
        "course.deadline_kind": "{field}: kind \"{kind}\" desconhecido (use assessment, exam, quiz, submission ou other)",
        "course.search": "search tem de ser true, false ou {{ index: \"…\", exclude: [ … ] }}",
        "course.search_exclude": "search.exclude: \"{entry}\" não corresponde a nenhum ficheiro nem pasta",
        # pages
        "page.unreadable": "não foi possível ler o ficheiro: {error}",
        "page.not_utf8": "o ficheiro não está em UTF-8: os acentos podem aparecer mal",
        "link.missing": "ligação para {target}: o ficheiro não existe",
        "link.case": "ligação para {target}: o ficheiro chama-se {actual} (o servidor distingue maiúsculas de minúsculas)",
        "link.folder": "ligação para {target}: a pasta não tem index.html",
        "link.absolute": "ligação com caminho absoluto {target}: use um caminho relativo (por exemplo semanas.html)",
        "image.missing": "imagem {target}: o ficheiro não existe",
        "image.case": "imagem {target}: o ficheiro chama-se {actual} (o servidor distingue maiúsculas de minúsculas)",
        "file.missing": "{attribute}=\"{target}\": o ficheiro não existe",
        "file.case": "{attribute}=\"{target}\": o ficheiro chama-se {actual} (o servidor distingue maiúsculas de minúsculas)",
        "kit.missing": "a página não carrega {asset}",
        "id.duplicate": "id \"{id}\" repetido (já usado na linha {first})",
        "lang.unknown": "lang=\"{lang}\": o site não tem esta língua (course.js languages: {languages})",
        "img.alt": "imagem sem alt: {src} (se for decorativa, use alt=\"\")",
        "heading.h1": "a página não tem <h1>",
        "heading.skip": "<h{to}> depois de <h{after}>: salta um nível de título",
        "permission.file": "o servidor web não consegue ler este ficheiro (falta o+r; corrija com --fix-permissions)",
        "permission.folder": "o servidor web não consegue abrir esta pasta (falta o+rx; corrija com --fix-permissions)",
        "orphan": "nenhuma página liga para este ficheiro",
        "index.stale": "o índice de pesquisa é mais antigo do que {page}: corra python3 uc-site.py",
        "index.absent": "o índice de pesquisa ainda não existe: corra python3 uc-site.py",
        # --help
        "help.description": "Verifica o site de uma unidade curricular feito com o UC Design Kit e gera o índice da pesquisa.",
        "help.command": "check: só verificar; index: só escrever o índice; sem comando: as duas coisas",
        "help.site": "pasta do site (por omissão, a pasta onde está este script)",
        "help.fix": "dar permissão de leitura a todos (o+r, e o+x nas pastas) aos ficheiros e pastas que não a têm",
        "help.quiet": "mostrar só os erros (nada quando não há erros)",
        "help.stdout": "com index: escrever o índice na saída em vez do ficheiro (para ferramentas de build)",
        "help.lang": "língua das mensagens (por omissão, a primeira língua do course.js, se for pt ou en)",
        "help.version": "mostrar a versão do script",
        "help.help": "mostrar esta ajuda",
        "help.epilog": "Documentação: https://uc-design-kit.miguelrocha.dev/docs/pt/manter.html",
    },
    "en": {
        "label.error": "ERROR",
        "label.warning": "WARNING",
        "label.info": "INFO",
        "summary.pages": ("{n} page", "{n} pages"),
        "summary.error": ("{n} error", "{n} errors"),
        "summary.warning": ("{n} warning", "{n} warnings"),
        "summary.info": ("{n} info", "{n} info"),
        "header": "UC Design Kit · uc-site.py {version} · {title}",
        "index.written": "Index: {index} ({pages}, {sections}, {size} KB)",
        "index.pages": ("{n} page", "{n} pages"),
        "index.sections": ("{n} section", "{n} sections"),
        "index.large": "Warning: the index is {size} KB, so the first search of each visit is slower. Consider leaving folders out with search.exclude in course.js.",
        "index.failed": "Index: could not write {index}: {error}",
        "index.outside": "Index: search.index (\"{index}\") must be inside the site folder",
        "index.off": "Search is off in course.js (no search: true): there is no index to write.",
        "index.unreadable": "Index: not written, because course.js cannot be read.",
        "permissions.fixed": "read permissions fixed on {n} files and folders",
        "js.not_value": "'{word}' is not a value: course.js may only hold values (text, numbers, lists, objects)",
        "js.function": "functions are not allowed: course.js may only hold values (text, numbers, lists, objects)",
        "js.expected": "expected '{char}'",
        "js.expected_name": "expected a name",
        "js.expected_value": "expected a value (text, number, list or object)",
        "js.comment": "/* comment without a closing */",
        "js.text": "text without its closing quote",
        "js.template": "text with ` without its closing `",
        "js.plus": "'+' can only join texts",
        "js.template_expr": "only the name of a constant defined above may go inside ${{…}}",
        "js.constant": "'{name}' is not a constant defined above",
        "js.statement": "'{word}' is not allowed here: course.js may only hold constants (const NAME = …;) and window.UC_COURSE = {{ … }};",
        "js.missing": "window.UC_COURSE = {{ … }}; not found",
        "js.twice": "window.UC_COURSE is set more than once",
        "js.other_global": "only window.UC_COURSE may be set (found window.{name})",
        "js.not_object": "window.UC_COURSE must be an object {{ … }}",
        "js.computed_key": "computed keys [ … ] are not allowed",
        "js.spread": "'...' is not allowed: write the values out",
        "course.missing": "there is no course.js in this folder",
        "course.unreadable": "could not read the file: {error}",
        "course.required": "the required field {field} is missing",
        "course.recommended": "the field {field} is missing: the weeks have no dates",
        "course.page_missing": "{field}: {target} does not exist",
        "course.page_unknown": "{field}: \"{id}\" is not a built-in page and needs an href",
        "course.page_no_id": "{field} has no id",
        "course.date": "{field}: invalid date \"{value}\" (use YYYY-MM-DD)",
        "course.deadline_date": "{field}: invalid date \"{value}\" (use YYYY-MM-DD, YYYY-MM or null)",
        "course.deadline_duplicate": "{field}: the id \"{id}\" is already used by {other}",
        "course.deadline_no_id": "{field} has no id",
        "course.deadline_no_title": "{field} has no title",
        "course.deadline_kind": "{field}: unknown kind \"{kind}\" (use assessment, exam, quiz, submission or other)",
        "course.search": "search must be true, false or {{ index: \"…\", exclude: [ … ] }}",
        "course.search_exclude": "search.exclude: \"{entry}\" matches no file or folder",
        "page.unreadable": "could not read the file: {error}",
        "page.not_utf8": "the file is not UTF-8: accented letters may show wrongly",
        "link.missing": "link to {target}: the file does not exist",
        "link.case": "link to {target}: the file is called {actual} (the server tells upper and lower case apart)",
        "link.folder": "link to {target}: the folder has no index.html",
        "link.absolute": "link with an absolute path {target}: use a relative path (for example weeks.html)",
        "image.missing": "image {target}: the file does not exist",
        "image.case": "image {target}: the file is called {actual} (the server tells upper and lower case apart)",
        "file.missing": "{attribute}=\"{target}\": the file does not exist",
        "file.case": "{attribute}=\"{target}\": the file is called {actual} (the server tells upper and lower case apart)",
        "kit.missing": "the page does not load {asset}",
        "id.duplicate": "id \"{id}\" repeated (already used on line {first})",
        "lang.unknown": "lang=\"{lang}\": the site does not have this language (course.js languages: {languages})",
        "img.alt": "image without alt: {src} (if it is decorative, use alt=\"\")",
        "heading.h1": "the page has no <h1>",
        "heading.skip": "<h{to}> after <h{after}>: skips a heading level",
        "permission.file": "the web server cannot read this file (o+r missing; fix it with --fix-permissions)",
        "permission.folder": "the web server cannot open this folder (o+rx missing; fix it with --fix-permissions)",
        "orphan": "no page links to this file",
        "index.stale": "the search index is older than {page}: run python3 uc-site.py",
        "index.absent": "the search index does not exist yet: run python3 uc-site.py",
        "help.description": "Checks a course site made with the UC Design Kit and builds its search index.",
        "help.command": "check: check only; index: write the index only; no command: both",
        "help.site": "site folder (default: the folder that holds this script)",
        "help.fix": "give read permission to everyone (o+r, and o+x on folders) to the files and folders that lack it",
        "help.quiet": "print errors only (nothing when there are none)",
        "help.stdout": "with index: print the index instead of writing the file (for build tools)",
        "help.lang": "language of the messages (default: the first language of course.js, if it is pt or en)",
        "help.version": "print the script version",
        "help.help": "show this help",
        "help.epilog": "Documentation: https://uc-design-kit.miguelrocha.dev/docs/pt/manter.html",
    },
}


class Messages:
    """Formats the messages of one language."""

    def __init__(self, lang):
        self.lang = lang if lang in MESSAGES else "en"
        self.table = MESSAGES[self.lang]

    def __call__(self, key, **args):
        return self.table[key].format(**args)

    def count(self, key, n):
        one, other = self.table[key]
        return (one if n == 1 else other).format(n=n)


# ---------------------------------------------------------------------------
# Problems
# ---------------------------------------------------------------------------


class Problem:
    __slots__ = ("level", "file", "line", "key", "args")

    def __init__(self, level, file, line, key, args):
        self.level = level
        self.file = file
        self.line = line
        self.key = key
        self.args = args

    def __repr__(self):
        return "Problem({!r}, {!r}, {!r}, {!r})".format(self.level, self.file, self.line, self.key)


class Report:
    """The problems found, in the order they were found."""

    def __init__(self):
        self.problems = []

    def add(self, level_, file_, line_, key_, **args):
        self.problems.append(Problem(level_, file_, line_, key_, args))

    def error(self, file_, line_, key_, **args):
        self.add(ERROR, file_, line_, key_, **args)

    def warning(self, file_, line_, key_, **args):
        self.add(WARNING, file_, line_, key_, **args)

    def info(self, file_, line_, key_, **args):
        self.add(INFO, file_, line_, key_, **args)

    def count(self, level):
        return sum(1 for p in self.problems if p.level == level)

    def sorted(self):
        """Grouped by file in path order (course.js first), then by line."""

        def key(p):
            return (p.file != "course.js", p.file.lower(), p.file, p.line or 0, LEVEL_ORDER[p.level])

        return sorted(self.problems, key=key)


# ---------------------------------------------------------------------------
# course.js reader (values only, see docs/architecture/search-api.md section 2.2)
# ---------------------------------------------------------------------------


class CourseJsError(Exception):
    def __init__(self, key, line, **args):
        super().__init__(key)
        self.key = key
        self.line = line
        self.args_ = args


class JsObject(dict):
    """A course.js object; `lines` maps each key to the line where it is written."""

    def __init__(self):
        super().__init__()
        self.lines = {}
        self.line = None


class JsArray(list):
    """A course.js array; `lines` holds the line of each item."""

    def __init__(self):
        super().__init__()
        self.lines = []
        self.line = None


NAME = re.compile(r"[A-Za-z_$][\w$]*")
NUMBER = re.compile(r"[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?")
ESCAPES = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v", "0": "\0"}


class LiteralReader:
    """
    Reads course.js without running it. Accepts comments, top-level constants
    (`const NAME = value;`, `let`/`var` too) and exactly one
    `window.UC_COURSE = value;`. Values are objects (quoted or unquoted keys),
    arrays, strings ('…', "…", `…`), numbers, true, false, null and trailing
    commas; a constant may be used as a value, strings joined with `+`, and
    `${NAME}` used inside a template string. Anything else raises
    CourseJsError with the line where reading stopped.
    """

    def __init__(self, source):
        self.s = source
        self.i = 0
        self.constants = {}

    # -- position and errors

    def line_at(self, index):
        return self.s.count("\n", 0, index) + 1

    def fail(self, key, at=None, **args):
        raise CourseJsError(key, self.line_at(self.i if at is None else at), **args)

    def skip(self):
        s = self.s
        n = len(s)
        while self.i < n:
            c = s[self.i]
            if c in " \t\r\n﻿   ":
                self.i += 1
            elif s.startswith("//", self.i):
                end = s.find("\n", self.i)
                self.i = n if end < 0 else end
            elif s.startswith("/*", self.i):
                end = s.find("*/", self.i + 2)
                if end < 0:
                    self.fail("js.comment")
                self.i = end + 2
            else:
                break

    def peek(self):
        self.skip()
        return self.s[self.i] if self.i < len(self.s) else ""

    def expect(self, char):
        if self.peek() != char:
            self.fail("js.expected", char=char)
        self.i += 1

    def name(self):
        self.skip()
        match = NAME.match(self.s, self.i)
        if not match:
            self.fail("js.expected_name")
        self.i = match.end()
        return match.group(0)

    def end_statement(self):
        if self.peek() == ";":
            self.i += 1

    # -- program

    def program(self):
        course = None
        found = False
        while self.peek():
            start = self.i
            if self.peek() in "'\"":
                # A directive such as "use strict"; is harmless.
                self.string(self.peek())
                self.end_statement()
                continue
            match = NAME.match(self.s, self.i)
            if not match:
                self.fail("js.not_value", word=self.s[self.i])
            word = self.name()
            if word in ("const", "let", "var"):
                name = self.name()
                self.expect("=")
                self.constants[name] = self.value()
            elif word == "window":
                self.expect(".")
                target = self.name()
                if target != "UC_COURSE":
                    self.fail("js.other_global", at=start, name=target)
                if found:
                    self.fail("js.twice", at=start)
                self.expect("=")
                at = self.i
                course = self.value()
                if not isinstance(course, dict):
                    self.fail("js.not_object", at=at)
                found = True
            else:
                self.fail("js.statement", at=start, word=word)
            self.end_statement()
        if not found:
            self.fail("js.missing")
        return course

    # -- values

    def value(self):
        left = self.term()
        while self.peek() == "+":
            at = self.i
            self.i += 1
            right = self.term()
            if not isinstance(left, str) or not isinstance(right, str):
                self.fail("js.plus", at=at)
            left = left + right
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
        if c == "":
            self.fail("js.expected_value")
        if self.s.startswith("...", self.i):
            self.fail("js.spread")
        match = NUMBER.match(self.s, self.i)
        if match and c in "+-.0123456789":
            self.i = match.end()
            text = match.group(0)
            number = float(text)
            return int(number) if number.is_integer() and re.fullmatch(r"[+-]?\d+", text) else number
        if c == "(":
            self.fail("js.not_value", word="(")
        if not NAME.match(self.s, self.i):
            self.fail("js.not_value", word=c)
        at = self.i
        word = self.name()
        if word in ("true", "false"):
            return word == "true"
        if word == "null":
            return None
        if word == "undefined":
            self.fail("js.not_value", at=at, word=word)
        if word == "function":
            self.fail("js.function", at=at)
        if word in self.constants:
            if self.peek() in ".([":
                self.fail("js.not_value", at=at, word=word + self.peek())
            return self.constants[word]
        if self.peek() == "(" or self.s.startswith("=>", self.i):
            self.fail("js.function", at=at)
        self.fail("js.not_value", at=at, word=word)

    def obj(self):
        out = JsObject()
        out.line = self.line_at(self.i)
        self.expect("{")
        while self.peek() != "}":
            c = self.peek()
            if c == "":
                self.fail("js.expected", char="}")
            at = self.i
            if c in "'\"":
                key = self.string(c)
            elif c == "[":
                self.fail("js.computed_key")
            elif self.s.startswith("...", self.i):
                self.fail("js.spread")
            elif c.isdigit():
                match = NUMBER.match(self.s, self.i)
                self.i = match.end()
                key = match.group(0)
            else:
                key = self.name()
            nxt = self.peek()
            if nxt and NAME.match(nxt):
                # get x() {}, async f() {}: a method.
                self.fail("js.function", at=at)
            if nxt == "(":
                self.fail("js.function", at=at)
            if nxt in ",}" and not (c in "'\"" or c.isdigit()):
                # Shorthand { NAME }: allowed when NAME is a constant.
                if key not in self.constants:
                    self.fail("js.expected", char=":")
                out[key] = self.constants[key]
            else:
                self.expect(":")
                out[key] = self.value()
            out.lines[key] = self.line_at(at)
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "}":
                self.fail("js.expected", char="}" if self.peek() == "" else ",")
        self.i += 1
        return out

    def arr(self):
        out = JsArray()
        out.line = self.line_at(self.i)
        self.expect("[")
        while self.peek() != "]":
            if self.peek() == "":
                self.fail("js.expected", char="]")
            out.lines.append(self.line_at(self.i))
            out.append(self.value())
            if self.peek() == ",":
                self.i += 1
            elif self.peek() != "]":
                self.fail("js.expected", char=",")
        self.i += 1
        return out

    def escape(self, out):
        """Reads the escape at self.i (just after the backslash)."""
        s = self.s
        if self.i >= len(s):
            return
        c = s[self.i]
        if c == "u":
            if s.startswith("{", self.i + 1):
                end = s.find("}", self.i)
                out.append(chr(int(s[self.i + 2 : end], 16)))
                self.i = end + 1
            else:
                out.append(chr(int(s[self.i + 1 : self.i + 5], 16)))
                self.i += 5
        elif c == "x":
            out.append(chr(int(s[self.i + 1 : self.i + 3], 16)))
            self.i += 3
        elif c == "\r" and s.startswith("\r\n", self.i):
            self.i += 2  # line continuation
        elif c == "\n":
            self.i += 1  # line continuation
        else:
            out.append(ESCAPES.get(c, c))
            self.i += 1

    def string(self, quote):
        start = self.i
        self.i += 1
        out = []
        s = self.s
        while True:
            if self.i >= len(s) or s[self.i] == "\n":
                self.fail("js.text", at=start)
            c = s[self.i]
            if c == quote:
                self.i += 1
                return "".join(out)
            self.i += 1
            if c == "\\":
                try:
                    self.escape(out)
                except ValueError:
                    self.fail("js.text", at=start)
                continue
            out.append(c)

    def template(self):
        start = self.i
        self.i += 1
        out = []
        s = self.s
        while True:
            if self.i >= len(s):
                self.fail("js.template", at=start)
            c = s[self.i]
            if c == "`":
                self.i += 1
                return "".join(out)
            if c == "\\":
                self.i += 1
                try:
                    self.escape(out)
                except ValueError:
                    self.fail("js.template", at=start)
                continue
            if s.startswith("${", self.i):
                self.i += 2
                self.skip()
                match = NAME.match(s, self.i)
                if not match:
                    self.fail("js.template_expr")
                name = self.name()
                if self.peek() != "}":
                    self.fail("js.template_expr")
                if name not in self.constants:
                    self.fail("js.constant", name=name)
                value = self.constants[name]
                out.append(value if isinstance(value, str) else js_string(value))
                self.i += 1
                continue
            out.append(c)
            self.i += 1


def js_string(value):
    """String(value) as JavaScript would write it, for ${NAME} with a non-text constant."""
    if value is True:
        return "true"
    if value is False:
        return "false"
    if value is None:
        return "null"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, list):
        return ",".join(js_string(v) for v in value)
    if isinstance(value, dict):
        return "[object Object]"
    return str(value)


def read_course_source(source):
    """Parses the text of course.js. Returns the UC_COURSE object or raises CourseJsError."""
    return LiteralReader(source).program()


# ---------------------------------------------------------------------------
# Files and paths
# ---------------------------------------------------------------------------

SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.\-]*:")


def read_text(path):
    """Returns (text, is_utf8). Falls back to Latin-1 so a page in another encoding is still checked."""
    with open(path, "rb") as f:
        data = f.read()
    try:
        return data.decode("utf-8-sig"), True
    except UnicodeDecodeError:
        return data.decode("latin-1"), False


def is_hidden(name):
    return name.startswith(".")


def walk_site(root):
    """Every file and folder of the site, as relative paths with '/', in path order. Hidden ones are left out."""
    files, folders = [], []
    for current, dirs, names in os.walk(root):
        dirs[:] = sorted(d for d in dirs if not is_hidden(d) and d != "__pycache__")
        rel_dir = os.path.relpath(current, root)
        for d in dirs:
            folders.append(to_posix(os.path.normpath(os.path.join(rel_dir, d))))
        for name in sorted(names):
            if is_hidden(name):
                continue
            files.append(to_posix(os.path.normpath(os.path.join(rel_dir, name))))
    return files, folders


def to_posix(path):
    return path.replace(os.sep, "/")


class Site:
    """The site folder: its files, with fast exact-case lookups."""

    def __init__(self, root):
        self.root = os.path.abspath(root)
        self.files, self.folders = walk_site(self.root)
        self.file_set = set(self.files)
        self.folder_set = set(self.folders) | {"."}
        self.lower = {}
        for path in self.files + self.folders:
            self.lower.setdefault(path.lower(), path)
        self.html = [f for f in self.files if f.lower().endswith((".html", ".htm"))]

    def resolve(self, base_dir, reference):
        """
        Resolves a local reference written in a file of folder `base_dir`
        (relative to the site, '.' for the root). Returns None for references
        that are not local files (external, fragment only, …), else
        (kind, path) where kind is "absolute", "outside" or "inside" and path
        is relative to the site.
        """
        value = reference.strip()
        if not value or value.startswith(("#", "?")) or value.startswith("//") or SCHEME.match(value):
            return None
        if "{{" in value or "${" in value:
            return None
        if value.startswith("/"):
            return ("absolute", value)
        path = re.split(r"[?#]", value, maxsplit=1)[0]
        path = unquote(path)
        if not path:
            return None
        joined = os.path.normpath(os.path.join(base_dir, path)).replace(os.sep, "/")
        if joined == ".." or joined.startswith("../"):
            return ("outside", joined)
        trailing = path.endswith("/")
        return ("inside", joined + ("/" if trailing and joined != "." else ""))

    def lookup(self, path):
        """
        Checks a site-relative path. Returns ("ok", path) for a file, ("folder", path)
        for a folder with index.html, ("no-index", path) for a folder without it,
        ("case", actual) when it exists with another case, ("missing", path) otherwise.
        """
        folder_hint = path.endswith("/")
        path = path.rstrip("/") or "."
        if path in self.file_set and not folder_hint:
            return ("ok", path)
        if path in self.folder_set:
            index = "index.html" if path == "." else path + "/index.html"
            if index in self.file_set:
                return ("folder", index)
            return ("no-index", path)
        actual = self.lower.get(path.lower())
        if actual:
            return ("case", actual)
        return ("missing", path)

    def abspath(self, rel):
        return os.path.join(self.root, *rel.split("/")) if rel != "." else self.root


# ---------------------------------------------------------------------------
# course.js checks
# ---------------------------------------------------------------------------

ISO_DAY = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")
ISO_MONTH = re.compile(r"^(\d{4})-(\d{2})$")
HTML_LINK = re.compile(r"""\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.I)


def valid_day(value):
    match = isinstance(value, str) and ISO_DAY.match(value.strip())
    if not match:
        return False
    try:
        date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
        return True
    except ValueError:
        return False


def valid_month(value):
    match = isinstance(value, str) and ISO_MONTH.match(value.strip())
    return bool(match) and 1 <= int(match.group(2)) <= 12


def line_of(container, key, fallback=None):
    """Line where `key` (an object key or an array index) is written in course.js."""
    lines = getattr(container, "lines", None)
    if isinstance(lines, dict):
        return lines.get(key, getattr(container, "line", None) or fallback)
    if isinstance(lines, list) and isinstance(key, int) and key < len(lines):
        return lines[key]
    return getattr(container, "line", None) or fallback


def as_list(value):
    return value if isinstance(value, list) else []


def as_dict(value):
    return value if isinstance(value, dict) else {}


def first_text(value, languages):
    """A course.js text that may be { pt: "…", en: "…" }: the first language's text."""
    if isinstance(value, dict):
        for lang in languages:
            if isinstance(value.get(lang), str):
                return value[lang]
        for item in value.values():
            if isinstance(item, str):
                return item
        return ""
    return value if isinstance(value, str) else ""


class SearchConfig:
    def __init__(self, enabled, index=DEFAULT_INDEX, exclude=()):
        self.enabled = enabled
        self.index = index
        self.exclude = list(exclude)


def search_config(course, report=None):
    """The `search` field: None when off, else a SearchConfig."""
    value = course.get("search")
    if value is None or value is False:
        return None
    if value is True:
        return SearchConfig(True)
    if isinstance(value, dict):
        index = value.get("index", DEFAULT_INDEX)
        exclude = value.get("exclude", [])
        ok = isinstance(index, str) and index.strip() and isinstance(exclude, list) and all(isinstance(e, str) for e in exclude)
        if ok:
            return SearchConfig(True, index.strip(), exclude)
    if report is not None:
        report.error("course.js", line_of(course, "search"), "course.search")
    return None


def check_course(course, site, report):
    """Checks the content of course.js. Returns the set of site files it links to."""
    linked = set()
    languages = [l for l in as_list(course.get("languages")) if isinstance(l, str)]

    # Required fields.
    if not first_text(course.get("title"), languages).strip():
        report.error("course.js", line_of(course, "title", 1), "course.required", field="title")
    semester = course.get("semester")
    if not isinstance(semester, dict) or semester.get("start") in (None, ""):
        where = semester if isinstance(semester, dict) else course
        # Recommended, not required (docs/pt/course-js.html): a warning.
        report.warning("course.js", line_of(where, "start", line_of(course, "semester", 1)), "course.recommended", field="semester.start")

    # Dates.
    def day(container, key, field):
        value = container.get(key)
        if value is None:
            return
        if not valid_day(value):
            report.error("course.js", line_of(container, key), "course.date", field=field, value=value)

    semester = as_dict(semester)
    if semester.get("start") not in (None, ""):
        day(semester, "start", "semester.start")
    day(semester, "end", "semester.end")
    for i, item in enumerate(as_list(semester.get("breaks"))):
        item = as_dict(item)
        day(item, "start", "semester.breaks[{}].start".format(i))
        day(item, "end", "semester.breaks[{}].end".format(i))
    day(course, "updated", "updated")
    for i, item in enumerate(as_list(course.get("notices"))):
        item = as_dict(item)
        if item.get("date") is None:
            report.error("course.js", line_of(course.get("notices"), i), "course.date", field="notices[{}].date".format(i), value="")
        day(item, "date", "notices[{}].date".format(i))

    # Deadlines.
    seen = {}
    deadlines = as_list(course.get("deadlines"))
    for i, item in enumerate(deadlines):
        field = "deadlines[{}]".format(i)
        line = line_of(deadlines, i)
        if not isinstance(item, dict):
            continue
        ident = item.get("id")
        if ident in (None, ""):
            report.warning("course.js", line, "course.deadline_no_id", field=field)
        elif ident in seen:
            report.error("course.js", line_of(item, "id", line), "course.deadline_duplicate", field=field, id=ident, other=seen[ident])
        else:
            seen[ident] = field
        if not item.get("title"):
            report.warning("course.js", line, "course.deadline_no_title", field=field)
        kind = item.get("kind")
        if kind is not None and kind not in DEADLINE_KINDS:
            report.warning("course.js", line_of(item, "kind", line), "course.deadline_kind", field=field, kind=kind)
        value = item.get("date")
        if value not in (None, "") and not valid_day(value) and not valid_month(value):
            report.error("course.js", line_of(item, "date", line), "course.deadline_date", field=field + ".date", value=value)
        day(item, "end", field + ".end")
        for j, shift in enumerate(as_list(item.get("shifts"))):
            day(as_dict(shift), "date", "{}.shifts[{}].date".format(field, j))

    # Pages.
    pages = course.get("pages")
    for i, entry in enumerate(as_list(pages)):
        field = "pages[{}]".format(i)
        line = line_of(pages, i)
        page = {"id": entry} if isinstance(entry, str) else as_dict(entry)
        href = page.get("href")
        if not page.get("id"):
            report.warning("course.js", line, "course.page_no_id", field=field)
        if not href:
            href = BUILTIN_PAGES.get(page.get("id"))
            if not href:
                report.error("course.js", line, "course.page_unknown", field=field, id=page.get("id", ""))
                continue
        hrefs = list(href.values()) if isinstance(href, dict) else [href]
        for target in hrefs:
            if not isinstance(target, str):
                continue
            resolved = site.resolve(".", target)
            if not resolved or resolved[0] != "inside":
                continue
            status, path = site.lookup(resolved[1])
            if status in ("ok", "folder"):
                linked.add(path)
            else:
                shown = target if status != "case" else "{} ({})".format(target, path)
                report.error("course.js", line, "course.page_missing", field=field, target=shown)

    # Every other local link in course.js: url, logo, and href/src in HTML texts.
    for value, line in course_strings(course):
        references = []
        # logo may be a path, { src, alt } or an inline "<svg…>" (no link).
        if value[1] in ("url", "logo", "src") and not value[0].lstrip().startswith("<"):
            references.append(value[0])
        for match in HTML_LINK.finditer(value[0]):
            references.append(match.group(2) if match.group(2) is not None else match.group(3))
        for reference in references:
            check_reference(site, ".", reference, "href", "course.js", line, report, linked)

    return linked


def course_strings(node, key=None, line=None):
    """Yields ((text, key), line) for every string in course.js."""
    if isinstance(node, dict):
        for k, v in node.items():
            for item in course_strings(v, k, line_of(node, k, line)):
                yield item
    elif isinstance(node, list):
        for i, v in enumerate(node):
            for item in course_strings(v, key, line_of(node, i, line)):
                yield item
    elif isinstance(node, str):
        yield (node, key), line


def check_reference(site, base_dir, reference, attribute, file, line, report, linked, element=None):
    """Checks one local reference; adds the target to `linked`."""
    resolved = site.resolve(base_dir, reference)
    if not resolved:
        return
    kind, path = resolved
    if kind == "absolute":
        report.warning(file, line, "link.absolute", target=reference.strip())
        return
    if kind == "outside":
        return  # Outside the site folder: the kit, a previous year… not checked.
    status, actual = site.lookup(path)
    if status in ("ok", "folder"):
        linked.add(actual)
        return
    target = reference.strip()
    image = element in ("img", "source") or attribute == "srcset"
    if status == "no-index":
        report.error(file, line, "link.folder", target=target)
    elif attribute == "href":
        key = "link.case" if status == "case" else "link.missing"
        report.error(file, line, key, target=target, actual=actual)
    elif image:
        key = "image.case" if status == "case" else "image.missing"
        report.error(file, line, key, target=target, actual=actual)
    else:
        key = "file.case" if status == "case" else "file.missing"
        report.error(file, line, key, attribute=attribute, target=target, actual=actual)


# ---------------------------------------------------------------------------
# Page checks
# ---------------------------------------------------------------------------

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
HEADING = re.compile(r"^h([1-6])$")


class PageScanner(HTMLParser):
    """Collects, in one pass, what the page checks need."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references = []  # (attribute, value, line, tag)
        self.ids = []  # (id, line)
        self.langs = []  # (lang, line)
        self.images_without_alt = []  # (src, line)
        self.headings = []  # (level, line)
        self.stylesheets = []
        self.scripts = []
        self.has_page = False
        self.template_depth = 0

    def handle_starttag(self, tag, attrs):
        self.start(tag, attrs, closes=False)

    def handle_startendtag(self, tag, attrs):
        self.start(tag, attrs, closes=True)

    def start(self, tag, attrs, closes):
        line = self.getpos()[0]
        a = {}
        for name, value in attrs:
            a.setdefault(name, value if value is not None else "")
        in_template = self.template_depth > 0
        if tag == "template" and not closes:
            self.template_depth += 1

        # References are checked everywhere (a <template> is rendered later).
        for name in ("href", "src"):
            if name in a and tag != "base":
                self.references.append((name, a[name], line, tag))
        if "srcset" in a and tag in ("img", "source"):
            for candidate in a["srcset"].split(","):
                parts = candidate.strip().split()
                if parts:
                    self.references.append(("srcset", parts[0], line, tag))

        if tag == "link" and "stylesheet" in a.get("rel", "").lower().split():
            self.stylesheets.append(a.get("href", ""))
        if tag == "script" and "src" in a:
            self.scripts.append(a["src"])

        if in_template:
            return  # A template's content is not part of the page (yet).
        if tag == "uc-page":
            self.has_page = True
        if "id" in a and a["id"]:
            self.ids.append((a["id"], line))
        # On <uc-code>, lang is the programming language (lang="c"), not a
        # human language: it is never checked against the site's languages.
        if "lang" in a and tag not in ("html", "uc-code") and a["lang"].strip():
            self.langs.append((a["lang"].strip(), line))
        if tag == "img" and "alt" not in a:
            self.images_without_alt.append((a.get("src", ""), line))
        match = HEADING.match(tag)
        if match:
            self.headings.append((int(match.group(1)), line))
        elif tag == "uc-hero":
            self.headings.append((1, line))  # <uc-hero> renders the page's <h1>.

    def handle_endtag(self, tag):
        if tag == "template" and self.template_depth:
            self.template_depth -= 1


def loads(paths, name):
    """Whether one of the paths (href/src values) points to a file called `name`."""
    for value in paths:
        path = re.split(r"[?#]", value.strip(), maxsplit=1)[0]
        if path.rsplit("/", 1)[-1] == name:
            return True
    return False


def check_page(site, rel, languages, report, linked_from):
    """Checks one HTML page. Fills linked_from[target] with the pages that link to it."""
    try:
        text, utf8 = read_text(site.abspath(rel))
    except OSError as error:
        report.error(rel, None, "page.unreadable", error=error.strerror or str(error))
        return
    if not utf8:
        report.warning(rel, None, "page.not_utf8")
    scanner = PageScanner()
    try:
        scanner.feed(text)
        scanner.close()
    except Exception as error:  # html.parser is forgiving; this is a safety net.
        report.error(rel, None, "page.unreadable", error=str(error))
        return
    base_dir = to_posix(os.path.dirname(rel)) or "."

    # Local links and files.
    for attribute, value, line, tag in scanner.references:
        linked = set()
        check_reference(site, base_dir, value, attribute, rel, line, report, linked, element=tag)
        for target in linked:
            if target != rel:
                linked_from.setdefault(target, set()).add(rel)

    # The kit: only for pages that use it (an old page kept as it is does not).
    uses_kit = scanner.has_page or any(loads(scanner.stylesheets + scanner.scripts, f) for f in KIT_FILES)
    if uses_kit:
        if not loads(scanner.stylesheets, "uc-kit.css"):
            report.error(rel, None, "kit.missing", asset="uc-kit.css")
        for name in ("course.js", "uc-kit.js"):
            if not loads(scanner.scripts, name):
                report.error(rel, None, "kit.missing", asset=name)

    # Duplicate ids.
    first = {}
    for ident, line in scanner.ids:
        if ident in first:
            report.error(rel, line, "id.duplicate", id=ident, first=first[ident])
        else:
            first[ident] = line

    # lang="…" on a bilingual site.
    if len(languages) > 1:
        for lang, line in scanner.langs:
            if lang not in languages:
                report.error(rel, line, "lang.unknown", lang=lang, languages=", ".join(languages))

    # Images without alt.
    for src, line in scanner.images_without_alt:
        report.warning(rel, line, "img.alt", src=src or "?")

    # Headings.
    if uses_kit:
        if not any(level == 1 for level, _ in scanner.headings):
            report.warning(rel, None, "heading.h1")
        previous = 0
        for level, line in scanner.headings:
            if previous and level > previous + 1:
                report.warning(rel, line, "heading.skip", to=level, after=previous)
            previous = level


# ---------------------------------------------------------------------------
# Whole site
# ---------------------------------------------------------------------------


def check_permissions(site, report, fix):
    """Files need o+r and folders o+rx for the web server (Apache on the DCC runs as another user)."""
    if os.name != "posix":
        return 0
    fixed = 0
    entries = [(".", True)] + [(f, True) for f in site.folders] + [(f, False) for f in site.files]
    for rel, folder in entries:
        path = site.abspath(rel)
        try:
            info = os.lstat(path)
        except OSError:
            continue
        if stat.S_ISLNK(info.st_mode):
            continue
        need = stat.S_IROTH | (stat.S_IXOTH if folder else 0)
        if info.st_mode & need == need:
            continue
        if fix:
            try:
                os.chmod(path, stat.S_IMODE(info.st_mode) | need)
                fixed += 1
                continue
            except OSError:
                pass
        report.warning(rel if rel != "." else "./", None, "permission.folder" if folder else "permission.file")
    return fixed


def excluded_matches(site, entry):
    entry = entry.strip()
    if entry.startswith("./"):
        entry = entry[2:]
    if entry.endswith("/"):
        folder = entry.rstrip("/")
        return folder in site.folder_set
    return entry in site.file_set or entry in site.folder_set


def check_site(site, report, command, fix_permissions=False):
    """
    Runs every check. Returns (course, search) where course is the UC_COURSE
    object (None when course.js cannot be read) and search the SearchConfig
    (None when search is off).
    """
    course = None
    course_path = os.path.join(site.root, "course.js")
    if not os.path.isfile(course_path):
        report.error("course.js", None, "course.missing")
    else:
        try:
            text, _ = read_text(course_path)
            course = read_course_source(text)
        except OSError as error:
            report.error("course.js", None, "course.unreadable", error=error.strerror or str(error))
        except CourseJsError as error:
            report.error("course.js", error.line, error.key, **error.args_)

    languages = []
    search = None
    linked = set()
    if course is not None:
        languages = [l for l in as_list(course.get("languages")) if isinstance(l, str)]
        linked = check_course(course, site, report)
        search = search_config(course, report)
        if search:
            for entry in search.exclude:
                if not excluded_matches(site, entry):
                    report.warning("course.js", line_of(as_dict(course.get("search")), "exclude"), "course.search_exclude", entry=entry)

    linked_from = {}
    for rel in site.html:
        check_page(site, rel, languages, report, linked_from)

    # Pages that no other page links to.
    for rel in site.html:
        if rel in ("index.html", "index.htm") or rel in linked or linked_from.get(rel):
            continue
        report.info(rel, None, "orphan")

    fixed = check_permissions(site, report, fix_permissions)
    if fixed:
        report.info("./", None, "permissions.fixed", n=fixed)

    # A stale index, only when it is not about to be rewritten.
    if command == "check" and search:
        index_path = os.path.join(site.root, *search.index.split("/"))
        if not os.path.isfile(index_path):
            report.info(search.index, None, "index.absent")
        else:
            built = os.path.getmtime(index_path)
            newer = [rel for rel in ["course.js"] + site.html if os.path.isfile(site.abspath(rel)) and os.path.getmtime(site.abspath(rel)) > built]
            if newer:
                report.info(search.index, None, "index.stale", page=newer[0])

    return course, search


# ---------------------------------------------------------------------------
# Search index (docs/architecture/search-api.md sections 4 to 6)
# ---------------------------------------------------------------------------

INDEX_FORMAT = 1
EXCERPT_LENGTH = 140
# Above this size the first search of a visit takes noticeably longer (about
# 250 KB gzipped). The index is fetched once, when the search opens. Sites far
# bigger than this should leave folders out with search.exclude.
LARGE_INDEX = 1024 * 1024

# Frequent words that never narrow a search (the docs index list, plus
# English). The same list is in tests/search/words.json, which the kit's
# search engine also reads in its tests.
STOP_WORDS = frozenset(
    (
        "que para com uma umas uns por pela pelo pelas pelos mais como nao sem sao ser foi sua seu suas seus "
        "das dos nas nos num numa este esta estes estas isto esse essa isso ela ele elas eles tem ter cada "
        "ainda tambem quando onde entre sobre depois antes so ja bem mas the and for are with this that from "
        "you your can will not have has into its was were all any"
    ).split()
)

# Accents removed the way the kit does it in JavaScript: NFD, then the
# combining marks U+0300 to U+036F dropped.
COMBINING = re.compile("[̀-ͯ]")
WORD = re.compile(r"[a-z0-9][a-z0-9_-]*")
DIGIT = re.compile(r"\d")
SPACES = re.compile(r"\s+")
NOT_SLUG = re.compile(r"[^a-z0-9]+")


def fold(text):
    """Lowercase, without accents: "Secção" → "seccao"."""
    return COMBINING.sub("", unicodedata.normalize("NFD", text)).lower()


def slugify(text):
    """The heading id rule of the kit (contract section 6)."""
    return NOT_SLUG.sub("-", fold(text)).strip("-") or "section"


def search_words(text):
    """Distinct folded words of a text (3 letters or more, or with a digit), in order, without stop words."""
    seen = {}
    for word in WORD.findall(fold(text)):
        if (len(word) >= 3 or DIGIT.search(word)) and word not in STOP_WORDS:
            seen.setdefault(word, None)
    return " ".join(seen)


def squash(text):
    return SPACES.sub(" ", text).strip()


def excerpt(text):
    """The first 140 characters, cut at a space, with an ellipsis."""
    if len(text) <= EXCERPT_LENGTH:
        return text
    cut = text[:EXCERPT_LENGTH]
    space = cut.rfind(" ")
    if space > 0:
        cut = cut[:space]
    return re.sub(r"[,.;:]$", "", cut) + "…"


# Elements whose text never goes into the index (4.2). <uc-code> is handled apart.
SKIPPED = {"script", "style", "noscript", "template", "svg", "nav"}
# Elements whose end separates words ("<td>a</td><td>b</td>" is "a b").
BLOCKS = {
    "address", "article", "aside", "blockquote", "br", "caption", "dd", "details", "div", "dl", "dt",
    "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main",
    "ol", "p", "pre", "section", "summary", "table", "td", "th", "tr", "ul",
}
ITEM_SECTIONS = {"uc-week", "uc-exercise", "uc-question", "li", "article"}
ITEM_TITLES = {"h2", "h3", "h4", "h5", "h6", "a"}


class Section:
    """One section of a page: the intro, a heading, a week, an exercise, an item."""

    def __init__(self, ident, kind):
        self.id = ident
        self.kind = kind
        self.title = []  # [(lang, text)]; lang "" = every language
        self.text = []
        self.fixed_title = None  # data-search-title
        self.titles = None  # title / title-<lang> attributes: {lang or "": text}
        self.id_text = []  # heading text for the automatic id
        self.needs_id = False
        self.indexed = True  # False inside data-search-ignore (the id still counts)

    def has_language_text(self):
        return any(lang for lang, _ in self.title + self.text) or any(self.titles or ())


class PageIndexer(HTMLParser):
    """Reads one page and splits its text into sections (contract 4.2 and 4.3)."""

    def __init__(self, languages):
        super().__init__(convert_charrefs=True)
        self.languages = languages if len(languages) > 1 else []
        self.stack = []  # [tag, lang, skipped, section]
        self.skip_depth = 0  # inside elements whose text stays out
        self.hidden_depth = 0  # inside <template>/<noscript>: not even ids
        self.page_depth = 0  # inside <uc-page>
        self.in_body = False
        self.in_title = False
        self.title_tag = []
        self.h1 = []
        self.h1_depth = None
        self.noindex = False
        self.group = None
        self.ids = set()  # ids written in the HTML, plus week-<n>
        self.intro = Section("", "intro")
        self.sections = [self.intro]
        self.current = self.intro
        self.heading = None  # (section, depth) while inside an <h2>/<h3>
        self.item_title = None  # (section, depth) while reading the title of an <li id>/<article id>

    # The language an element belongs to: one of the site's languages, or "".
    def site_language(self, value):
        value = (value or "").strip()
        for code in self.languages:
            if value == code or value.startswith(code + "-"):
                return code
        return None

    def lang(self):
        for entry in reversed(self.stack):
            if entry[1]:
                return entry[1]
        return ""

    def handle_starttag(self, tag, attrs):
        a = {}
        for name, value in attrs:
            a.setdefault(name, value if value is not None else "")
        if tag == "title":
            self.in_title = True
        elif tag == "body":
            self.in_body = True
        elif tag == "uc-page" and not self.hidden_depth:
            self.page_depth += 1
            self.group = self.group or a.get("current") or None
            if a.get("search", "").strip() == "noindex":
                self.noindex = True

        if not self.hidden_depth:
            if a.get("id"):
                self.ids.add(a["id"])
            if tag == "uc-week" and a.get("n", "").strip():
                self.ids.add("week-" + a["n"].strip())

        if tag == "img" or tag in VOID:
            if tag == "img" and a.get("alt", "").strip() and self.readable():
                self.add_text(" " + a["alt"] + " ")
            elif tag in ("br", "hr"):
                self.add_text(" ")
            return

        if tag in BLOCKS:
            self.add_text(" ")
        skipped = tag in SKIPPED or tag == "uc-code" or "data-search-ignore" in a
        if tag == "uc-code" and a.get("filename") and self.readable():
            self.add_text(" " + a["filename"] + " ")
        # As in the kit (core/language.js): only elements inside <body>, and not data-uc-keep-lang.
        lang = self.site_language(a.get("lang")) if self.in_body and "data-uc-keep-lang" not in a else None
        entry = [tag, lang, skipped, None]
        self.stack.append(entry)
        if tag in ("template", "noscript"):
            self.hidden_depth += 1
        ignored = self.skip_depth > 0 or skipped
        if skipped:
            self.skip_depth += 1

        if self.hidden_depth or not self.in_body:
            return
        if tag in ("h2", "h3"):
            self.start_heading(tag, a, ignored)
        elif ignored:
            return
        elif tag == "h1" and self.h1_depth is None and not self.h1:
            self.h1_depth = len(self.stack)
        elif tag in ITEM_SECTIONS:
            self.start_item(tag, a, entry)
        elif tag in ITEM_TITLES and self.current.kind in ("li", "article") and self.item_title is None \
                and not self.current.title and self.current.fixed_title is None:
            self.item_title = (self.current, len(self.stack))

    def start_heading(self, tag, a, ignored):
        section = Section(a.get("id") or "", tag)
        section.needs_id = not a.get("id") and self.page_depth > 0
        section.fixed_title = a.get("data-search-title")
        section.indexed = not ignored
        if ignored:
            # Only its id matters (the numbering of automatic ids).
            if section.needs_id:
                self.sections.append(section)
            self.heading = (section, len(self.stack))
            return
        self.sections.append(section)
        self.current = section
        self.heading = (section, len(self.stack))

    def start_item(self, tag, a, entry):
        ident = (a.get("id") or "").strip()
        if tag == "uc-week":
            ident = "week-" + a["n"].strip() if a.get("n", "").strip() else ident
        if not ident:
            return
        section = Section(ident, tag)
        section.fixed_title = a.get("data-search-title")
        if tag != "li" and tag != "article":
            titles = {}
            if a.get("title"):
                titles[""] = a["title"]
            for code in self.languages:
                if a.get("title-" + code):
                    titles[code] = a["title-" + code]
            section.titles = titles or None
        entry[3] = self.current  # where the text goes after the item
        self.sections.append(section)
        self.current = section

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in VOID:
            return
        # Close up to the matching tag (HTML forgives missing end tags).
        for depth in range(len(self.stack) - 1, -1, -1):
            if self.stack[depth][0] != tag:
                continue
            while len(self.stack) > depth:
                level = len(self.stack)
                self.close_element(self.stack.pop(), level)
            break
        if tag in BLOCKS:
            self.add_text(" ")

    def close_element(self, entry, level):
        tag, _, skipped, after = entry
        if skipped:
            self.skip_depth -= 1
        if tag in ("template", "noscript"):
            self.hidden_depth -= 1
        elif tag == "uc-page" and self.page_depth and not self.hidden_depth:
            self.page_depth -= 1
        if self.heading and self.heading[1] >= level:
            self.heading = None
        if self.item_title and self.item_title[1] >= level:
            self.item_title = None
        if self.h1_depth is not None and self.h1_depth >= level:
            self.h1_depth = None
        if after is not None:
            self.current = after

    def readable(self):
        return self.in_body and not self.skip_depth and not self.hidden_depth

    def add_text(self, text):
        if self.readable() and self.h1_depth is None and self.heading is None:
            self.current.text.append((self.lang(), text))

    def handle_data(self, data):
        if self.in_title:
            self.title_tag.append(data)
            return
        if not self.in_body or self.hidden_depth:
            return
        if self.heading is not None:
            section = self.heading[0]
            section.id_text.append((self.lang(), data))
            if section.indexed and not self.skip_depth:
                section.title.append((self.lang(), data))
            return
        if self.skip_depth:
            return
        if self.h1_depth is not None:
            self.h1.append((self.lang(), data))
        elif self.item_title is not None:
            self.item_title[0].title.append((self.lang(), data))
        else:
            self.current.text.append((self.lang(), data))


def text_in(pieces, lang):
    """The text of `pieces` for one language: the common text plus that language's ("" = everything)."""
    return squash("".join(text for code, text in pieces if not code or lang is None or code == lang))


def assign_ids(indexer, id_lang):
    """Automatic ids for headings without one (contract section 6)."""
    taken = indexer.ids
    for section in indexer.sections:
        if not section.needs_id:
            continue
        base = slugify(text_in(section.id_text, id_lang))
        candidate, n = base, 2
        while candidate in taken:
            candidate, n = "{}-{}".format(base, n), n + 1
        taken.add(candidate)
        section.id = candidate


def page_entries(indexer, rel, languages, file_lang):
    """The index entries of a page: one, or one per language (contract 4.4)."""
    if indexer.noindex:
        return []
    first = languages[0] if len(languages) > 1 else None
    assign_ids(indexer, file_lang or first)
    sections = [s for s in indexer.sections if s.indexed]
    if file_lang:
        langs = [file_lang]
    elif first and (any(code for code, _ in indexer.h1) or any(s.has_language_text() for s in sections)):
        langs = list(languages)
    else:
        langs = [None]
    entries = []
    for lang in langs:
        # Without "l", text in any language counts (a single-language site has no lang pieces).
        title = text_in(indexer.h1, lang) or squash("".join(indexer.title_tag)).split(" · ")[0].strip()
        items = []
        for section in sections:
            heading = section_title(section, lang, first)
            text = text_in(section.text, lang)
            if section.kind == "intro" and not text:
                continue
            if not heading and not text:
                continue
            items.append({"i": section.id, "h": heading, "x": excerpt(text), "w": search_words(heading + " " + text)})
        entry = {"t": title, "p": rel}
        if indexer.group:
            entry["g"] = indexer.group
        if lang:
            entry["l"] = lang
        entry["s"] = items
        entries.append(entry)
    return entries


def section_title(section, lang, first):
    if section.fixed_title is not None and section.fixed_title.strip():
        return squash(section.fixed_title)
    if section.titles:
        wanted = lang or first
        return squash(section.titles.get(wanted) or section.titles.get("") or next(iter(section.titles.values())))
    return text_in(section.title, lang)


def file_languages(course):
    """Files that belong to one language: pages whose href is { pt: "…", en: "…" }."""
    out = {}
    for page in as_list(course.get("pages")):
        href = as_dict(page).get("href")
        if isinstance(href, dict):
            for lang, value in href.items():
                if isinstance(value, str):
                    out[to_posix(os.path.normpath(value.strip()))] = lang
    return out


def is_excluded(rel, exclude):
    parts = rel.split("/")
    if any(part.startswith("_") for part in parts[:-1]):
        return True
    for entry in exclude:
        entry = entry.strip()
        if entry.startswith("./"):
            entry = entry[2:]
        folder = entry.rstrip("/")
        if not folder:
            continue
        if rel == folder or rel.startswith(folder + "/"):
            return True
    return False


def build_index(site, course, search, generated=None):
    """The index as a dict (contract section 5). `generated` defaults to now (or SOURCE_DATE_EPOCH)."""
    languages = [l for l in as_list(course.get("languages")) if isinstance(l, str)]
    per_file = file_languages(course)
    pages = []
    for rel in sorted(site.html):
        if is_excluded(rel, search.exclude):
            continue
        try:
            text, _ = read_text(site.abspath(rel))
        except OSError:
            continue  # check_page already reported it
        indexer = PageIndexer(languages)
        indexer.feed(text)
        indexer.close()
        pages.extend(page_entries(indexer, rel, languages, per_file.get(rel)))
    if generated is None:
        epoch = os.environ.get("SOURCE_DATE_EPOCH", "").strip()
        moment = datetime.fromtimestamp(int(epoch), timezone.utc) if epoch.isdigit() else datetime.now(timezone.utc)
        generated = moment.strftime("%Y-%m-%dT%H:%M:%SZ")
    code = course.get("code")
    return {
        "v": INDEX_FORMAT,
        "generator": "{} {}".format(SCRIPT_NAME, VERSION),
        "generated": generated,
        "course": code if isinstance(code, str) else "",
        "languages": languages,
        "pages": pages,
    }


def index_source(index):
    """The text of search-index.js: a script, so that it also loads from file://; one page per line."""
    head = {key: value for key, value in index.items() if key != "pages"}
    dump = lambda value: json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    lines = ",\n".join(dump(page) for page in index["pages"])
    return (
        "/* Generated by {}. Do not edit: run python3 uc-site.py again. */\n".format(index["generator"])
        + "window.UC_SEARCH_INDEX = "
        + dump(head)[:-1]
        + ',"pages":[\n'
        + lines
        + ("\n" if lines else "")
        + "]};\n"
    )


def index_path(site, search):
    """Where the index goes, or None when search.index points outside the site folder."""
    rel = os.path.normpath(search.index.strip().lstrip("/"))
    if rel == ".." or rel.startswith(".." + os.sep) or os.path.isabs(rel):
        return None
    return os.path.join(site.root, rel)


def write_index(site, course, search, messages, out, quiet=False, stdout=None):
    """
    Writes the index (or prints it to `stdout`) and its summary line (not with
    `quiet`; a failure is always printed). Returns False when it could not be written.
    """
    index = build_index(site, course, search)
    source = index_source(index)
    if stdout is not None:
        stdout.write(source)
        return True
    target = index_path(site, search)
    if target is None:
        out.write(messages("index.outside", index=search.index) + "\n")
        return False
    data = source.encode("utf-8")
    temporary = target + ".tmp"
    try:
        folder = os.path.dirname(target)
        if not os.path.isdir(folder):
            os.makedirs(folder)
        # A temporary file, then a rename: a visitor never gets half an index.
        with open(temporary, "wb") as f:
            f.write(data)
        os.chmod(temporary, 0o644)
        os.replace(temporary, target)
    except OSError as error:
        try:
            os.remove(temporary)
        except OSError:
            pass
        out.write(messages("index.failed", index=search.index, error=error.strerror or str(error)) + "\n")
        return False
    if quiet:
        return True
    files = len({page["p"] for page in index["pages"]})
    sections = sum(len(page["s"]) for page in index["pages"])
    out.write(
        messages(
            "index.written",
            index=search.index,
            pages=messages.count("index.pages", files),
            sections=messages.count("index.sections", sections),
            size=max(1, round(len(data) / 1024)),
        )
        + "\n"
    )
    if len(data) > LARGE_INDEX:
        out.write(messages("index.large", size=round(len(data) / 1024)) + "\n")
    return True


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def format_report(report, messages, quiet=False):
    """The lines for the problems: label, location, message."""
    problems = [p for p in report.sorted() if not quiet or p.level == ERROR]
    if not problems:
        return []
    labels = {level: messages("label." + level) for level in (ERROR, WARNING, INFO)}
    label_width = max(len(label) for label in labels.values()) + 2
    locations = [p.file + (":{}".format(p.line) if p.line else "") for p in problems]
    location_width = min(max(len(loc) for loc in locations), 40) + 2
    lines = []
    for problem, location in zip(problems, locations):
        message = messages(problem.key, **problem.args)
        lines.append(labels[problem.level].ljust(label_width) + location.ljust(location_width) + message)
    return lines


def summary(report, pages, messages):
    parts = [messages.count("summary.pages", pages)]
    for level in (ERROR, WARNING, INFO):
        parts.append(messages.count("summary." + level, report.count(level)))
    return " · ".join(parts)


def course_title(course):
    if not course:
        return ""
    languages = [l for l in as_list(course.get("languages")) if isinstance(l, str)]
    title = first_text(course.get("title"), languages)
    edition = course.get("edition")
    code = course.get("code")
    text = title
    if isinstance(edition, str) and edition:
        text += " " + edition
    if isinstance(code, str) and code:
        text += " ({})".format(code)
    return text.strip()


# ---------------------------------------------------------------------------
# Command line
# ---------------------------------------------------------------------------


def guess_language(argv, default_site):
    """The language of the messages, before the arguments are fully parsed."""
    pre = argparse.ArgumentParser(add_help=False)
    pre.add_argument("--lang")
    pre.add_argument("--site")
    known, _ = pre.parse_known_args(argv)
    if known.lang in MESSAGES:
        return known.lang
    try:
        text, _ = read_text(os.path.join(known.site or default_site, "course.js"))
        languages = as_list(read_course_source(text).get("languages"))
        if languages and languages[0] in MESSAGES:
            return languages[0]
    except (OSError, CourseJsError, ValueError):
        pass
    return "en"


def build_parser(messages):
    parser = argparse.ArgumentParser(
        prog="python3 uc-site.py",
        description=messages("help.description"),
        epilog=messages("help.epilog"),
        add_help=False,
    )
    parser.add_argument("command", nargs="?", choices=["check", "index"], help=messages("help.command"))
    parser.add_argument("--site", metavar="DIR", help=messages("help.site"))
    parser.add_argument("--fix-permissions", action="store_true", help=messages("help.fix"))
    parser.add_argument("--quiet", action="store_true", help=messages("help.quiet"))
    parser.add_argument("--stdout", action="store_true", help=messages("help.stdout"))
    parser.add_argument("--lang", choices=sorted(MESSAGES), help=messages("help.lang"))
    parser.add_argument("--version", action="version", version="uc-site.py " + VERSION, help=messages("help.version"))
    parser.add_argument("-h", "--help", action="help", help=messages("help.help"))
    return parser


def main(argv=None, out=None, default_site=None):
    argv = sys.argv[1:] if argv is None else argv
    out = out or sys.stdout
    default_site = default_site or os.path.dirname(os.path.abspath(__file__))
    messages = Messages(guess_language(argv, default_site))
    args = build_parser(messages).parse_args(argv)
    site_dir = os.path.abspath(args.site or default_site)
    if not os.path.isdir(site_dir):
        sys.stderr.write("uc-site.py: {}: not a folder\n".format(site_dir))
        return 2

    site = Site(site_dir)
    report = Report()
    command = args.command or "all"
    if args.stdout and command != "index":
        sys.stderr.write("uc-site.py: --stdout only works with the index command\n")
        return 2
    # With --stdout the index is the only thing on the standard output.
    log = sys.stderr if args.stdout else out
    quiet = args.quiet or args.stdout
    if command == "index":
        # Only course.js matters for the index.
        course, search = None, None
        course_path = os.path.join(site.root, "course.js")
        try:
            text, _ = read_text(course_path)
            course = read_course_source(text)
            search = search_config(course, report)
        except OSError:
            report.error("course.js", None, "course.missing")
        except CourseJsError as error:
            report.error("course.js", error.line, error.key, **error.args_)
    else:
        course, search = check_site(site, report, command, fix_permissions=args.fix_permissions)

    if not quiet:
        log.write(messages("header", version=VERSION, title=course_title(course) or site_dir) + "\n")
    for line in format_report(report, messages, quiet=quiet):
        log.write(line + "\n")
    if not quiet and command != "index":
        log.write(summary(report, len(site.html), messages) + "\n")

    written = True
    if command in ("all", "index"):
        if course is None:
            if not quiet:
                log.write(messages("index.unreadable") + "\n")
        elif search is None:
            if command == "index" and not quiet:
                log.write(messages("index.off") + "\n")
        elif args.stdout:
            write_index(site, course, search, messages, log, stdout=out)
        else:
            written = write_index(site, course, search, messages, log, quiet=args.quiet)

    return 1 if report.count(ERROR) or not written else 0


if __name__ == "__main__":
    sys.exit(main())
