# UC Design Kit

A small, dependency-free kit of web components and styles for university
course ("unidade curricular", UC) websites.

- **Static only.** Plain HTML, CSS and JavaScript. Nothing to install or build
  on the web server; pages also work when opened straight from disk (`file://`).
- **Content stays in HTML.** Teachers write ordinary HTML using a handful of
  custom elements (`<uc-page>`, `<uc-week>`, `<uc-deadlines>`, …). A single
  `course.js` file holds the values that change every year.
- **Copy a folder to start a new year.** Week dates are computed from the
  semester start date, so rolling over is mostly editing `course.js`.
- **Bilingual when you want it.** One or more languages per site.
- **Customisable in layers.** From a colour in `course.js` up to your own
  components, without forking the kit.

> Status: under construction. See the implementation plan and
> [`docs/api.md`](docs/api.md) for the public contract.

## Repository layout

| Path | What it holds |
| --- | --- |
| `kit/src/` | Source of the kit: `core/`, `components/`, `css/`, `i18n/` |
| `kit/v1/` | Published, frozen build of major version 1 (`uc-kit.js`, `uc-kit.css`) |
| `examples/` | Real course sites built with the kit |
| `template/` | Starter folder a teacher copies to create a new course site |
| `docs/` | API contract, teacher guide and component reference |
| `tests/` | Test pages per component and the Playwright test bench |
| `scripts/` | Maintainer scripts (bundling, checks) — never needed by teachers |

## Using the kit (preview)

```html
<link rel="stylesheet" href="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.css">
<script src="course.js"></script>
<script src="https://uc-design-kit.miguelrocha.dev/kit/v1/uc-kit.js" defer></script>

<uc-page>
  <h1>Semanas</h1>
  <uc-week n="10" title="Árvores binárias de pesquisa">
    <p>Inserção e remoção em BST.</p>
  </uc-week>
</uc-page>
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

[MIT](LICENSE), for the kit. The course content in `examples/edados-2526/` is by Fernando Silva (DCC/FCUP) and is not covered by it; see [its notice](examples/edados-2526/NOTICE.md).
