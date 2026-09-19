The generated README combines package metadata, section configuration and documentation files.

# configuration

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

# section options

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

# file-backed sections

File-backed sections can be declared either as arbitrary top-level keys or in the `sections` map. These forms are equivalent: `troubleshooting: ./troubleshooting.md` and `sections: {troubleshooting: ./troubleshooting.md}`. Paths resolve relative to the configured tldw directory, not the current working directory. Use `../../` to refer to the project root from `docs/tldw`.

A `.md` file is inserted as Markdown. Other files are safely fenced with their extension as the language, or without a language for extensionless files. Referenced TypeScript files are displayed, not executed. Missing explicit files cause generation to fail before the README is overwritten.

Custom section titles are derived from their IDs, such as `sampleConfig → sample config`. New sections have priority `100`. Mapping an existing built-in headed ID through `sections`, such as `sections.development`, replaces that section’s automatic content while retaining its title and priority. Built-in top-level keys keep their section-option meaning, so `development: false` still disables the replacement.

# automatic Markdown sections

Section Markdown can live directly in `docs` or in `docs/tldw`. If both files exist, direct `docs` content is rendered first. This discovery continues alongside custom file-backed sections.

Available headed IDs are `intro`, `screenshots`, `features`, `installation`, `warning`, `example`, `usage`, `advancedUsage`, `options`, `props`, `tryInBrowser`, `cliUsage`, `environmentVariables`, `notes`, `related`, `faq`, `legal`, `development` and `license`.

`description` is inline beneath the README title and `result` is inline within Example. Headings within fragments are relative: their shallowest heading is placed directly beneath the containing section while deeper headings retain their relative hierarchy. Heading-like text inside fenced code is unchanged.

Sections are ordered by `getPriority()`. The default is `100` and higher priorities render first. Intro, Screenshots and Features appear in that order before Installation.

# specialized source files

`docs/tldw/envVars.yml` supplements `environmentVariables.values`. Values in the YAML file win when a variable occurs in both places. `docs/tldw/usageOptions.yml` describes option types, defaults and explanations, supplemented by inputs from the project’s `action.yml`.

Example source is loaded from the first existing `docs/tldw/example.{ts,tsx,js,jsx}`. Named example results use `docs/tldw/result*.{ts,tsx,js,jsx}`. The unqualified `result.{ts,tsx,js,jsx}` belongs below Usage.

Usage also collects all `usage.{ts,tsx,js,jsx}` files and all files matching `usage/*.*`, both in `docs` and in `docs/tldw`. Markdown files remain Markdown; other files become safe code fences.

Screenshots are discovered recursively under `docs/screenshots` and `docs/tldw/screenshots`. Supported formats are AVIF, GIF, JPEG, PNG, SVG and WebP. Project-level screenshots come first, with numeric-natural filename ordering within each directory. Image URLs are relative to the project root.

Feature descriptions use the flexible-list renderer: plain items become bullets, one-line descriptions use an en dash and complex descriptions promote the entire list to nested headings. Descriptions also accept MarkdownMap contents.

Props default to `order: jaid`: `key`, `id`, `className`, naturally sorted normal props, `ref`, naturally sorted `on[A-Z]` events, then `children`. `order: original` preserves declaration order and `order: alphabetical` sorts only by prop ID.

Options and Props share `markdownElements.optionsList` and `markdownElements.optionsTable`. `options.style` defaults to `table`; `props.style` defaults to `list`. Compact list entries render their ID, optional type and optional default inside inline code, followed by a one-line `info` description. If any `info` contains a newline, every list entry is promoted to its own heading with type/default metadata bullets and the description beneath it. The table renderer includes only the required, type, default and info columns that occur; when entries contain IDs only, it falls back to the compact bullet list. `required: true` is rendered as an unlabeled `*` marker.

The generation comment names documentation directories containing source files, joined with ` and `. It recognizes both configuration formats and custom file sources.
