# tldw


<a href="https://raw.githubusercontent.com/jaid/tldw/master/license.txt"><img src="https://img.shields.io/github/license/jaid/tldw?style=flat-square" alt="License"/></a> <a href="https://github.com/sponsors/jaid"><img src="https://img.shields.io/badge/<3-Sponsor-FF45F1?style=flat-square" alt="Sponsor tldw"/></a>  
<a href="https://actions-badge.atrox.dev/jaid/tldw/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2Fjaid%2Ftldw%2Fbadge" alt="Build status"/></a> <a href="https://github.com/jaid/tldw/commits"><img src="https://img.shields.io/github/commits-since/jaid/tldw/v7.3.0?style=flat-square&logo=github" alt="Commits since v7.3.0"/></a> <a href="https://github.com/jaid/tldw/commits"><img src="https://img.shields.io/github/last-commit/jaid/tldw?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/jaid/tldw/issues"><img src="https://img.shields.io/github/issues/jaid/tldw?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/v/tldw?style=flat-square&logo=npm&label=latest%20version" alt="Latest version on npm"/></a> <a href="https://github.com/jaid/tldw/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/tldw?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/dm/tldw?style=flat-square&logo=npm" alt="Downloads"/></a>

**Overwrites the readme based on info fetched from package.json and source code.**

#### Opinionated

This project is tailored to my personal needs and workflows and therefore highly opinionated. Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or difficulties integrating it in your own ecosystem.




## Installation

<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/badge/npm-tldw-C23039?style=flat-square&logo=npm" alt="tldw on npm"/></a>

```bash
npm install --global tldw@^7.3.0
```

<a href="https://yarnpkg.com/package/tldw"><img src="https://img.shields.io/badge/Yarn-tldw-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="tldw on Yarn"/></a>

```bash
yarn global add tldw@^7.3.0
```






## Usage

Generated readme can be extended with following files in your repository:

##### Config

- `readme/config.yml`

##### YAML representation of Markdown fragments

- `readme/envVars.yml` (same as `readme/config.yml#environmentVariables`)
- `readme/usageOptions.yml`

##### JavaScript fragments

- `readme/example.js`
- `readme/result*.js`

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
For usage instructions:
```bash
tldw --help
```










## Development

<details>
<summary><b>Development hints for maintaining and improving tldw</b></summary>



Setting up:
```bash
git clone git@github.com:jaid/tldw.git
cd tldw
npm install
```
Testing:
```bash
npm run test:dev
```
Testing in production environment:
```bash
npm run test
```

</details>

## License
[MIT License](https://raw.githubusercontent.com/jaid/tldw/master/license.txt)  
Copyright © 2021, Jaid \<jaid.jsx@gmail.com> (https://github.com/jaid)

<!---
Readme generated with tldw v7.1.0
https://github.com/Jaid/tldw
-->