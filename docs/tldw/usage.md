Generated readme can be extended with following files in your repository:

#### Config

- `docs/tldw/config.yml`

Useful `docs/tldw/config.yml` fields include:

- `banner`: `true`, a string or `{text, font, topColor, bottomColor}`
- `shields`: an array for one shield line or an array of arrays for multiple shield lines. Each shield can be a string ID or a custom shield definition object
- `excludeShields`: a string or array of strings with shield IDs to skip
- `packageManagers`: a string or array of `npm`, `pnpm`, `yarn` and `bun` to choose which package managers are shown in `## Installation`. Default is `npm`
- `versionInInstallation`: if `true`, append `@^<version>` to installation commands
- `maxBlankLines`: maximum number of consecutive blank lines in generated Markdown

#### YAML representation of Markdown fragments

- `docs/tldw/envVars.yml` (same as `docs/tldw/config.yml#environmentVariables`)
- `docs/tldw/usageOptions.yml`

#### Code fragments

- `docs/tldw/example.ts`, `docs/tldw/example.tsx`, `docs/tldw/example.js` or `docs/tldw/example.jsx`
- `docs/tldw/usage.ts` or `docs/tldw/usage.tsx`
- `docs/tldw/result.js` or `docs/tldw/result.jsx` for a result shown below the usage code
- `docs/tldw/result*.ts`, `docs/tldw/result*.tsx`, `docs/tldw/result*.js` or `docs/tldw/result*.jsx` for named example results

#### Markdown fragments

- `docs/tldw/legal.md`
- `docs/tldw/warning.md`
- `docs/tldw/usage.md`
- `docs/tldw/advancedUsage.md`
- `docs/tldw/example.md`
- `docs/tldw/options.md`
- `docs/tldw/development.md`
- `docs/tldw/description.md`
- `docs/tldw/result.md`
- `docs/tldw/notes.md`
- `docs/tldw/related.md`
- `docs/tldw/faq.md`
