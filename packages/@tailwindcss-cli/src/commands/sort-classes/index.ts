import { __unstable__loadDesignSystem } from '@tailwindcss/node'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline'
import type { Arg, Result } from '../../utils/args'
import { eprintln, header, highlight, relative } from '../../utils/renderer'

const css = String.raw

export function options() {
  return {
    '--input': {
      type: 'string',
      description: 'Input file',
      alias: '-i',
    },
    '--cwd': {
      type: 'string',
      description: 'The current working directory',
      default: '.',
    },
  } satisfies Arg
}

export async function handle(args: Result<ReturnType<typeof options>>) {
  eprintln(header())
  eprintln()

  let base = path.resolve(args['--cwd'])

  let inputPath: string | null = null
  if (args['--input']) {
    inputPath = path.resolve(base, args['--input'])
    if (!existsSync(inputPath)) {
      eprintln(`Specified input file ${highlight(relative(inputPath))} does not exist.`)
      process.exit(1)
    }
  }

  let input = inputPath
    ? await fs.readFile(inputPath, 'utf-8')
    : css`
        @import 'tailwindcss';
      `

  let inputBasePath = inputPath ? path.dirname(inputPath) : base

  let design = await __unstable__loadDesignSystem(input, { base: inputBasePath })

  let rl = createInterface({ input: process.stdin })

  for await (let line of rl) {
    let trimmed = line.trim()
    if (trimmed === '') {
      process.stdout.write('\n')
      continue
    }

    let classes = trimmed.split(/\s+/)
    let sorted = design.sortClassList(classes)
    process.stdout.write(sorted.join(' ') + '\n')
  }
}
