#!/usr/bin/env node

import { args, type Arg } from './utils/args'

import * as build from './commands/build'
import { help } from './commands/help'
import * as sortClasses from './commands/sort-classes'

const sharedOptions = {
  '--help': { type: 'boolean', description: 'Display usage information', alias: '-h' },
} satisfies Arg

// Check for subcommands before parsing build flags
if (process.argv[2] === 'sort-classes') {
  const sortFlags = args(
    {
      ...sortClasses.options(),
      ...sharedOptions,
    },
    process.argv.slice(3),
  )

  if (sortFlags['--help']) {
    help({
      usage: ['tailwindcss sort-classes [--input input.css] [--cwd dir]'],
      options: { ...sortClasses.options(), ...sharedOptions },
    })
    process.exit(0)
  }

  sortClasses.handle(sortFlags)
} else {
  const flags = args({
    ...build.options(),
    ...sharedOptions,
  })
  const command = flags._[0]

  // Show an error for unknown sub-commands.
  if (command) {
    help({
      invalid: command,
      usage: [
        'tailwindcss [--input input.css] [--output output.css] [--watch] [options…]',
        'tailwindcss sort-classes [--input input.css] [--cwd dir]',
      ],
      options: { ...build.options(), ...sharedOptions },
    })
    process.exit(1)
  }

  // Display main help message if no command is being used.
  //
  // E.g.:
  //
  //   - `tailwindcss`                // should show the help message
  //
  // E.g.: implicit `build` command
  //
  //   - `tailwindcss -o output.css`  // should run the build command, not show the help message
  //   - `tailwindcss > output.css`   // should run the build command, not show the help message
  if ((process.stdout.isTTY && process.argv[2] === undefined) || flags['--help']) {
    help({
      usage: [
        'tailwindcss [--input input.css] [--output output.css] [--watch] [options…]',
        'tailwindcss sort-classes [--input input.css] [--cwd dir]',
      ],
      options: { ...build.options(), ...sharedOptions },
    })
    process.exit(0)
  }

  // Handle the build command
  build.handle(flags)
}
