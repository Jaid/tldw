import type {Linter} from 'eslint'

import {makeEslintConfig} from 'eslint-config-jaid'

const config: Array<Linter.Config> = makeEslintConfig()

export default config
