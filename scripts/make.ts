import fs from 'fs-extra'
import rehypeStringify from 'rehype-stringify'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

import {readOwnPackageMetadata} from '#src/lib/readOwnPackageMetadata.ts'
import makeCli from '#src/makeCli.ts'

import css from '../node_modules/github-markdown-css/github-markdown-dark.css' with {type: 'text'}

const cli = makeCli(await readOwnPackageMetadata(), ['--package-file', 'test/fixture/package.json', '--output-file', 'temp/readme.md'])
await cli()
const readmeContent = await fs.readFile('temp/readme.md', 'utf8')
const htmlVfile = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeStringify, {allowDangerousHtml: true})
  .process(readmeContent)
const html = String(htmlVfile)
await fs.outputFile('temp/readme.html', `<body><style>:root { background: #0d1117 }</style><style>${css}</style><article class="markdown-body">${html}</article></body>`)
