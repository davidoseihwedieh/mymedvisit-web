import type {
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from '@playwright/test/reporter'

export default class NoSkipsReporter implements Reporter {
  private skipped: string[] = []

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'skipped') {
      this.skipped.push(
        `${test.parent.project()?.name ?? 'unknown'}: ${test.title}`,
      )
    }
  }

  async onEnd(
    result: FullResult,
  ): Promise<void | { status?: FullResult['status'] }> {
    if (this.skipped.length === 0) {
      return { status: result.status }
    }

    process.stderr.write(
      `Security-critical browser suite skipped ${this.skipped.length} test(s):\n${this.skipped.join('\n')}\n`,
    )
    return { status: 'failed' }
  }
}
