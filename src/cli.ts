#!/usr/bin/env bun

import {readOwnPackageMetadata} from './lib/readOwnPackageMetadata.ts'
import makeCli from './makeCli.ts'

const cli = makeCli(await readOwnPackageMetadata())
await cli()
