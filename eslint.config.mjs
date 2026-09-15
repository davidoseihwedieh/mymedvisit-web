import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    files: [
      'src/app/page.tsx',
      'src/app/how-it-works/page.tsx',
      'src/app/privacy/page.tsx',
      'src/app/terms/page.tsx',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
