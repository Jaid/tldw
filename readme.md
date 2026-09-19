<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16000 1000"><style>.text { font-size: 500px; font-weight: 200; font-family: JetBrains Mono, JetBrainsMono, monospace }</style><defs><linearGradient id="color" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="oklch(70% 0.2 294)"/><stop offset="100%" stop-color="oklch(66% 0.4 268)"/></linearGradient></defs><rect width="16000" height="1000" fill="url(#color)" rx="100"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" class="text">tl;dw</text></svg>

<center><a href="https://npmjs.com/package/tldw"><img src="https://shieldcn.dev/npm/v/tldw.svg?variant=secondary&logo=npm&label=latest+version" alt="Latest version on npm"/></a> <a href="https://github.com/Jaid/tldw/raw/HEAD/license.txt"><img src="https://shieldcn.dev/github/license/Jaid/tldw.svg?variant=secondary" alt="License"/></a> <a href="https://bun.sh"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Bun-fbf0df.svg?variant=outline&logo=bun&logoColor=fbf0df&mode=dark"><img src="https://shieldcn.dev/badge/Bun-fbf0df.svg?variant=outline&logo=bun&logoColor=fbf0df&mode=light" alt="Bun"/></picture></a></center>

# tl;dw

Generate README files from package metadata and configurable fragments.

## installation

<a href="https://npmjs.com/package/tldw"><img src="https://shieldcn.dev/badge/npm-tldw-C23039.svg?variant=secondary&logo=npm" alt="tldw on npm"/></a>

```sh
npm install --save-dev tldw
```

## usage

The generated README combines package metadata, section configuration and documentation files.

### configuration

Both `docs/tldw/config.yml` and `docs/tldw/config.ts` are optional. When both exist, TypeScript overrides YAML. Objects merge recursively; arrays and scalar values replace earlier values rather than being concatenated. Defaults are applied after merging. Each source is validated independently, so a typo is not silently hidden by the other file.

```yml
installation:
  type: production
  packageManagers: npm
  version: false

development: false

shields:
  items:
    - npmLatest
    - license
    - bun
  exclude: actions

description:
  personal: false
  link: https://example.com
  linkName: project website

tldw:
  maxBlankLines: 1
  needsNodeRuntime: true

troubleshooting: ./troubleshooting.md
sections:
  sampleConfig: ./examples/settings.json
```

TypeScript configuration must default-export an object. Imports and top-level `await` may be used to assemble it. Configuration modules execute project code, so only generate documentation for projects whose configuration you trust.

```ts
import type {Config} from 'tldw'

export default {
  installation: {
    type: 'production',
    packageManagers: ['npm', 'bun'],
  },
  development: false,
} satisfies Config
```

`Config` is the schema’s input type. `ResolvedConfig` is its validated output with defaults. `configSchema` is exported from `tldw`; its implementation lives in `src/config.schema.ts`. Unknown top-level keys are allowed only when their value is a nonempty file path, in which case they define file-backed sections. Invalid known section options are errors.

### section options

Built-in sections have top-level configuration keys matching their IDs. `false` disables the entire section, including discovered Markdown and child loaders. `true` enables the section with defaults; sections with options also accept an object. An omitted key retains the normal default behavior.

| Key | Section-specific options |
| --- | --- |
| `installation` | `type`: `production`, `development` or `global`; `packageManagers`: one or more of `bun`, `npm`, `pnpm`, `yarn` and `deno`; `version`: include `@^<version>`; `githubPackage`: add GitHub Packages instructions |
| `description` | `personal`, `link` and `linkName` |
| `shields` | `items`: one row or an array of rows; `exclude`: shield IDs to omit; `githubActions`: override workflow detection |
| `banner` | `text`, `font`, `topColor` and `bottomColor`; a string is shorthand for `text` |
| `cliUsage` | `binName`: select a command or use `true` for automatic selection; `example`: the example shell command |
| `environmentVariables` | `values`: environment-variable descriptions, merged with `envVars.yml` |
| `features` | `items`: strings or `{title, description}` objects; defaults to `package.json#features` |
| `props` | `entries`: a record keyed by prop ID or an array of `{id, type?, default?, info?}` objects |
| `example` | `resultMayVary`: qualify named example results |
| `usage` | `resultMayVary`: qualify the usage result |
| `generationComment` | `false` omits the generated-file comment |

`installation: true` and `installation: {}` select production installation with npm. If `installation` is omitted, automatic install commands remain off but an installation Markdown fragment may still render. `installation: false` suppresses both.

`banner` is off by default. The default shield row contains the npm version, license when provided and Bun when detected. `shields: false` disables the top shield section; `shields.exclude` also applies to badges embedded in other sections. `cliUsage` automatically selects a command for global installation; otherwise it needs an explicit `binName`. `tryInBrowser: true` explicitly enables browser instructions and `tryInBrowser: false` disables the entire section.

Document-wide settings live under `tldw`. `tldw.needsNodeRuntime` is shared by Installation and TryInBrowser; when it is `false`, browser instructions are automatically enabled unless explicitly disabled. `tldw.maxBlankLines` is a nonnegative integer and defaults to `1`.

Previous flat options must move into their owning section: `packageManagers` becomes `installation.packageManagers`, `versionInInstallation` becomes `installation.version`, `personal` becomes `description.personal`, `excludeShields` becomes `shields.exclude`, `binExample` becomes `cliUsage.example` and `renderComment` becomes `generationComment`. Installation modes `prod` and `dev` are now `production` and `development`.

### file-backed sections

File-backed sections can be declared either as arbitrary top-level keys or in the `sections` map. These forms are equivalent: `troubleshooting: ./troubleshooting.md` and `sections: {troubleshooting: ./troubleshooting.md}`. Paths resolve relative to the configured tldw directory, not the current working directory. Use `../../` to refer to the project root from `docs/tldw`.

A `.md` file is inserted as Markdown. Other files are safely fenced with their extension as the language, or without a language for extensionless files. Referenced TypeScript files are displayed, not executed. Missing explicit files cause generation to fail before the README is overwritten.

Custom section titles are derived from their IDs, such as `sampleConfig → sample config`. New sections have priority `100`. Mapping an existing built-in headed ID through `sections`, such as `sections.development`, replaces that section’s automatic content while retaining its title and priority. Built-in top-level keys keep their section-option meaning, so `development: false` still disables the replacement.

### automatic Markdown sections

Section Markdown can live directly in `docs` or in `docs/tldw`. If both files exist, direct `docs` content is rendered first. This discovery continues alongside custom file-backed sections.

Available headed IDs are `intro`, `screenshots`, `features`, `installation`, `warning`, `example`, `usage`, `advancedUsage`, `options`, `props`, `tryInBrowser`, `cliUsage`, `environmentVariables`, `notes`, `related`, `faq`, `legal`, `development` and `license`.

`description` is inline beneath the README title and `result` is inline within Example. Headings within fragments are relative: their shallowest heading is placed directly beneath the containing section while deeper headings retain their relative hierarchy. Heading-like text inside fenced code is unchanged.

Sections are ordered by `getPriority()`. The default is `100` and higher priorities render first. Intro, Screenshots and Features appear in that order before Installation.

### specialized source files

`docs/tldw/envVars.yml` supplements `environmentVariables.values`. Values in the YAML file win when a variable occurs in both places. `docs/tldw/usageOptions.yml` describes option types, defaults and explanations, supplemented by inputs from the project’s `action.yml`.

Example source is loaded from the first existing `docs/tldw/example.{ts,tsx,js,jsx}`. Named example results use `docs/tldw/result*.{ts,tsx,js,jsx}`. The unqualified `result.{ts,tsx,js,jsx}` belongs below Usage.

Usage also collects all `usage.{ts,tsx,js,jsx}` files and all files matching `usage/*.*`, both in `docs` and in `docs/tldw`. Markdown files remain Markdown; other files become safe code fences.

Screenshots are discovered recursively under `docs/screenshots` and `docs/tldw/screenshots`. Supported formats are AVIF, GIF, JPEG, PNG, SVG and WebP. Project-level screenshots come first, with numeric-natural filename ordering within each directory. Image URLs are relative to the project root.

Feature descriptions use the flexible-list renderer: plain items become bullets, one-line descriptions use an en dash and complex descriptions promote the entire list to nested headings. Descriptions also accept MarkdownMap contents.

Props default to `order: jaid`: `key`, `id`, `className`, naturally sorted normal props, `ref`, naturally sorted `on[A-Z]` events, then `children`. `order: original` preserves declaration order and `order: alphabetical` sorts only by prop ID.

Options and Props share `markdownElements.optionsList` and `markdownElements.optionsTable`. `options.style` defaults to `table`; `props.style` defaults to `list`. Compact list entries render their ID, optional type and optional default inside inline code, followed by a one-line `info` description. If any `info` contains a newline, every list entry is promoted to its own heading with type/default metadata bullets and the description beneath it. The table renderer includes only the required, type, default and info columns that occur; when entries contain IDs only, it falls back to the compact bullet list. `required: true` is rendered as an unlabeled `*` marker.

The generation comment names documentation directories containing source files, joined with ` and `. It recognizes both configuration formats and custom file sources.

## development

### Section classes

README generation is implemented in `src/sections`. There are no Handlebars templates or template helpers.

`Section` represents an inline block belonging to another section. Its default loader reads matching Markdown files from `docs` and the configured tldw directory. `collectContents()` returns a markdown-map-compatible `SectionContents` object synchronously, and `render()` returns Markdown without emitting its own heading. Description, example results and usage results use this base class.

Every `Section` has `getPriority()`, which defaults to `100`. Higher values render earlier among sibling sections and equal priorities retain registration order. This applies equally to inline blocks and headed sections. `sortSectionsByPriority()` exposes the same stable ordering for custom composition.

`HeaderSection` extends `Section` with headed MarkdownMap rendering and an optional `getTitle()` override. Its base implementation derives a casual space-case heading from `id`, such as `environmentVariables → environment variables`. Top-level sections render as H2s; child nodes, such as Development’s commands, render as H3s. The registry in `src/sections/index.ts` registers classes; it does not define their display order.

Each class owns its generated content as well as its Markdown fragments. For example, `LicenseSection` formats license text, `UsageSection` collects usage files and attaches a `UsageResultSection`, and `ExampleSection` attaches the headerless `ResultSection`.

`ReadmeSection` combines the title, banner, shields, inline description, priority-ordered headed sections and generation comment. Sections share a `Context` containing project paths, package metadata and configuration, not pre-rendered template variables.

### Loading and rendering

All asynchronous work belongs in the optional `load()` hook. Its return type is `Promise<SectionLoadResult>`, where `SectionLoadResult` is `boolean | undefined`.

| Load result | Behavior |
| --- | --- |
| `false` | Deactivate the section. The renderer does not call its content collector, priority getter or rendering methods. Subsequent load batches skip it. |
| `true` or `undefined` | Keep the section active. |
| No hook | Keep the section active without loading. |
| Thrown error or rejected promise | Reject generation instead of rendering incomplete data. |

`loadSections(roots)` first checks `isEnabled()`: a top-level section configuration of `false` skips its loader and subtree entirely. It then discovers each enabled root and its declared `children`, starts all their hooks in parallel and waits for loading before returning the active roots. Shared instances load once per batch. Children must be constructed and declared before loading; parent and child hooks run independently, so they must not depend on each other’s completion. A deactivated parent is omitted along with its rendered subtree, although its children’s hooks may already have run in the parallel batch.

`render()` and `collectContents()` are synchronous. They use loaded state rather than accessing files or fetching data. Repeated renders reuse the same loaded data. Calling `loadSections()` again refreshes active sections; create a new instance to retry a deactivated section.

The base `load()` gathers `docs/<id>.md` and `docs/tldw/<id>.md`. An overriding loader should call `super.load?.()` to retain that behavior. A purely generated block can supply its own hook without calling the base loader.

`writeReadme()` performs loading automatically. For programmatic composition:

```ts
import {loadSections, ReadmeSection} from 'tldw'

const [readme] = await loadSections([new ReadmeSection(context)])
const markdown = readme?.render() ?? ''
```

Pass a custom array of `Section` instances as the second argument to `new ReadmeSection(context, sections)`. Inline sections are priority-sorted inside the README body, while `HeaderSection` instances become priority-sorted headings. `createSections(context)` returns built-in headed sections together with configured file-backed sections. Explicit file mappings replace matching built-in headings. `createReadmeContext(args)` creates the shared context from the same paths accepted by `writeReadme(args)` and returns `null` when the repository cannot be resolved to GitHub.

### Adding a headed section

Create a subclass and register it in `src/sections/index.ts`. Override `getTitle()` only when the id-derived space-case title is not the wording you want. Use `load()` to gather data and `collectContents()` to combine that data with the inherited Markdown content:

```ts
import type {SectionContents, SectionLoadResult} from 'tldw'

import * as path from 'forward-slash-path'
import {HeaderSection} from 'tldw'

export class TroubleshootingSection extends HeaderSection {
  readonly id = 'troubleshooting'
  #diagnostics = ''

  override async load(): Promise<SectionLoadResult> {
    const file = Bun.file(path.join(this.context.projectDirectory, 'docs', 'diagnostics.txt'))
    if (!await file.exists()) {
      return false
    }
    const [, diagnostics] = await Promise.all([super.load?.(), file.text()])
    this.#diagnostics = diagnostics
    return true
  }

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    return {
      ...contents,
      content: [...contents.content ?? [], this.#diagnostics],
    }
  }

  override getPriority() {
    return 125
  }
}
```

Use `Section` directly for headerless content. Inline sibling blocks can override `getPriority()` just like headed sections. Declare owned blocks in the parent’s `children` array so their loaders join the shared parallel phase, then check each child’s `active` property before collecting or rendering it. Do not invoke child loaders from the parent’s loader.

Use `fencen` for code blocks and `flatten-string` for optional or nested text composition. Markdown fragments retain their text and fenced blocks, while heading depths are normalized relative to their owning section.

### Configuration schema

`src/config.schema.ts` defines the accepted input, defaults and normalized section options. Public `Config` is inferred with `zod.input`; `Context.config` uses `ResolvedConfig`, inferred with `zod.output`. Keep new section settings in the schema rather than adding a second manually maintained interface.

`readConfig()` reads config.yml and default-imports config.ts with Jiti, merges their raw objects and applies schema defaults afterward. Both sources are validated independently. TypeScript wins on conflicts; arrays replace arrays and `false` replaces the entire section object. Module caches are disabled so repeated generation in one process picks up changed configuration and imported settings.

`FileSection` renders explicitly configured files from either arbitrary top-level configuration keys or the `sections` map without executing them. It shares the synchronous-render/async-load lifecycle and inherited heading-depth normalization. A mapped built-in section retains the original class’s title and priority but uses only the specified file’s content.

### setting up

```sh
git clone git@github.com:Jaid/tldw.git
cd tldw
bun install
```

### linting

```sh
bun run lint
```

### type checking

```sh
bun run typecheck
```

### testing

```sh
bun run test
```

## license

[MIT License](https://github.com/Jaid/tldw/raw/HEAD/license.txt)<br>
Copyright © 2026, Jaid \<jaid.jsx@gmail.com> (https://github.com/Jaid)

<!--
Readme generated with tldw v8.0.3 from ./docs and ./docs/tldw
https://github.com/Jaid/tldw
-->
