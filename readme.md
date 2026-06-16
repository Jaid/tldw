<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16000 1000"><style>.text { font: 500px Bahnschrift, Lexend, sans-serif }</style><defs><linearGradient id="color" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="oklch(37% 50% 320)"/><stop offset="100%" stop-color="oklch(29% 75% 335)"/></linearGradient></defs><rect width="16000" height="1000" fill="url(#color)" rx="0" ry="0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" class="text">tl;dw</text></svg>

<center><a href="https://npmjs.com/package/tldw"><img src="https://shieldcn.dev/npm/v/tldw.svg?variant=secondary&logo=npm&label=latest+version" alt="Latest version on npm"/></a> <a href="https://raw.githubusercontent.com/Jaid/tldw/HEAD/license.txt"><img src="https://shieldcn.dev/github/license/Jaid/tldw.svg?variant=secondary" alt="License"/></a> <a href="https://bun.sh"><picture><source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/badge/Bun-fbf0df.svg?variant=outline&logo=bun&logoColor=fbf0df&mode=dark"><img src="https://shieldcn.dev/badge/Bun-fbf0df.svg?variant=outline&logo=bun&logoColor=fbf0df&mode=light" alt="Bun"/></picture></a></center>

# tl;dw

Generate README files from package metadata and configurable fragments.

## Installation

<a href="https://npmjs.com/package/tldw"><img src="https://shieldcn.dev/badge/npm-tldw-C23039.svg?variant=secondary&logo=npm" alt="tldw on npm"/></a>

```bash
npm install --save-dev tldw
```

## Usage

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

## Development

### setting up
```bash
git clone git@github.com:Jaid/tldw.git
cd tldw
bun install
```
### linting
```bash
bun run lint
```
### type checking
```bash
bun run typecheck
```
### testing
```bash
bun run test
```

## License
[MIT License](https://raw.githubusercontent.com/Jaid/tldw/HEAD/license.txt)  
Copyright © 2026, Jaid \<jaid.jsx@gmail.com> (https://github.com/Jaid)

<!---
Readme generated with tldw v7.3.1
https://github.com/Jaid/tldw
-->
