# tldw


<a href="https://raw.githubusercontent.com/jaid/tldw/master/license.txt"><img src="https://img.shields.io/github/license/jaid/tldw?style=flat-square" alt="License"/></a> <a href="https://github.com/sponsors/jaid"><img src="https://img.shields.io/badge/<3-Sponsor-FF45F1?style=flat-square" alt="Sponsor tldw"/></a>  
<a href="https://actions-badge.atrox.dev/jaid/tldw/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2Fjaid%2Ftldw%2Fbadge" alt="Build status"/></a> <a href="https://github.com/jaid/tldw/commits"><img src="https://img.shields.io/github/commits-since/jaid/tldw/v6.4.0?style=flat-square&logo=github" alt="Commits since v6.4.0"/></a> <a href="https://github.com/jaid/tldw/commits"><img src="https://img.shields.io/github/last-commit/jaid/tldw?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/jaid/tldw/issues"><img src="https://img.shields.io/github/issues/jaid/tldw?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/v/tldw?style=flat-square&logo=npm&label=latest%20version" alt="Latest version on npm"/></a> <a href="https://github.com/jaid/tldw/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/tldw?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/npm/dm/tldw?style=flat-square&logo=npm" alt="Downloads"/></a>

**Overwrites the readme based on info fetched from package.json and source code.**

#### Opinionated

This project is tailored to my personal needs and workflows and therefore highly opinionated. Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or have difficulties integrating it in your own ecosystem.




## Installation

<a href="https://npmjs.com/package/tldw"><img src="https://img.shields.io/badge/npm-tldw-C23039?style=flat-square&logo=npm" alt="tldw on npm"/></a>

```bash
npm install --global tldw@^6.4.0
```

<a href="https://yarnpkg.com/package/tldw"><img src="https://img.shields.io/badge/Yarn-tldw-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="tldw on Yarn"/></a>

```bash
yarn global add tldw@^6.4.0
```

<a href="https://github.com/jaid/tldw/packages"><img src="https://img.shields.io/badge/GitHub Packages-@jaid/tldw-24282e?style=flat-square&logo=github" alt="@jaid/tldw on GitHub Packages"/></a> <span style="vertical-align: top">(if <a style="vertical-align: top" href='https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages'>configured properly</a>)</span>

```bash
npm install --global @jaid/tldw@^6.4.0
```





## Usage

Generated readme can be extended with following files in your repository:

##### Config

- `readme/config.yml`
- `readme/envVars.yml` (same as `readme/config.yml#environmentVariables`)

##### JavaScript fragments

- `readme/example.js`
- `readme/result.js`

##### Markdown fragments

- `readme/legal.md`
- `readme/warning.md`
- `readme/usage.md`
- `readme/advancedUsage.md`
- `readme/example.md`
- `readme/options.md`
- `readme/development.md`
- `readme/description.md`







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


## License
```text
MIT License

Copyright © 2020, Jaid <jaid.jsx@gmail.com> (github.com/jaid)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
