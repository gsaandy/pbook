//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'src/routeTree.gen.ts', "scripts/generate-icons.js", ".output", ".tanstack", "convex/_generated"],
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Use absolute imports with ~/ instead of relative parent imports (../)',
            },
          ],
        },
      ],
    },
  },
]
