declare module 'jest-axe' {
  import type { AxeResults, ElementContext, RunOptions } from 'axe-core'

  export function axe(
    html: ElementContext,
    options?: RunOptions,
  ): Promise<AxeResults>
}
