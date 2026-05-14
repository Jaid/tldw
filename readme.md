# tldw

<a href="https://raw.githubusercontent.com/Jaid/tldw/HEAD/license.txt"><img src="https://img.shields.io/github/license/Jaid%2Ftldw?style=flat-square" alt="License"/></a> <a href="https://github.com/sponsors/jaid"><img src="https://img.shields.io/badge/%3C3-Sponsor-FF45F1?style=flat-square" alt="Sponsor tldw"/></a>  
<a href="https://actions-badge.atrox.dev/Jaid/tldw/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2FJaid%2Ftldw%2Fbadge" alt="Build status"/></a> <a href="https://github.com/Jaid/tldw/commits"><img src="https://img.shields.io/github/commits-since/Jaid%2Ftldw/v7.3.1?style=flat-square&logo=github" alt="Commits since v7.3.1"/></a> <a href="https://github.com/Jaid/tldw/commits"><img src="https://img.shields.io/github/last-commit/Jaid%2Ftldw?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/Jaid/tldw/issues"><img src="https://img.shields.io/github/issues/Jaid%2Ftldw?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/v/tldw?style=flat-square&logo=npm&label=latest+version" alt="Latest version on npm"/></a> <a href="https://github.com/Jaid/tldw/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/tldw?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/dm/tldw?style=flat-square&logo=npm" alt="Downloads"/></a>

**Generate README files from package metadata and configurable fragments.**

#### Opinionated

:warning: This project is tailored to my personal needs and workflows and therefore highly opinionated. Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or difficulties integrating it in your own ecosystem.





## Installation

<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/badge/Bun-tldw-000000?style=flat-square&logo=bun&logoColor=FBF0DF" alt="tldw on Bun"/></a>

```bash
bun add --global tldw@^7.3.1
```

<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/badge/npm-tldw-C23039?style=flat-square&logo=npm" alt="tldw on npm"/></a>

```bash
npm install --global tldw@^7.3.1
```

<a href="https://yarnpkg.com/package/tldw"><img src="https://img.shields.io/badge/Yarn-tldw-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="tldw on Yarn"/></a>

```bash
yarn global add tldw@^7.3.1
```






## Usage

Generated readme can be extended with following files in your repository:

##### Config

- `readme/config.yml`

##### YAML representation of Markdown fragments

- `readme/envVars.yml` (same as `readme/config.yml#environmentVariables`)
- `readme/usageOptions.yml`

##### Code fragments

- `readme/example.ts` or `readme/example.js`
- `readme/result*.ts` or `readme/result*.js`

##### Markdown fragments

- `readme/legal.md`
- `readme/warning.md`
- `readme/usage.md`
- `readme/advancedUsage.md`
- `readme/example.md`
- `readme/options.md`
- `readme/development.md`
- `readme/description.md`
- `readme/result.md`
- `readme/notes.md`
- `readme/related.md`
- `readme/faq.md`





## CLI Usage
After installing package `tldw` globally, you can use its command line interface.
```bash
tldw
```
Or run it without installing it globally:
```bash
bunx tldw
```
For usage instructions:
```bash
tldw --help
```










## Development

<details>
<summary><b>Development hints for maintaining and improving tldw</b></summary>



Setting up:
```bash
git clone git@github.com:Jaid/tldw.git
cd tldw
bun install
```
Linting:
```bash
bun run lint
```
Type checking:
```bash
bun run typecheck
```
Testing:
```bash
bun run test
```

</details>

## License
[MIT License](https://raw.githubusercontent.com/Jaid/tldw/HEAD/license.txt)  
Copyright © 2021, Jaid \<jaid.jsx@gmail.com> (https://github.com/Jaid)

<!---
Readme generated with tldw v7.3.1
https://github.com/Jaid/tldw
-->
