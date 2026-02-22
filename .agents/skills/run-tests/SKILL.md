---
name: run-tests
description: Execute tests and report results, failures, and coverage insights. Use when the user asks to run tests, check if tests pass, or validate test coverage.
---

# Run Tests

## Purpose

Execute the test suite (all tests or targeted subset) and provide clear, actionable reporting on results, failures, and coverage status.

## When To Use

Use this skill when:

- The user asks to run tests
- The user asks "do tests pass?"
- Implementation work is complete and needs validation
- The user asks to verify test coverage
- Debugging test failures

## Required Inputs

Before starting:

1. Identify test scope:
   - All tests (`npm test`)
   - Specific file or pattern (`npm test <path>`)
   - Related to recent changes
2. Confirm intent:
   - Quick validation (just pass/fail summary)
   - Full analysis (failures, coverage, recommendations)

If scope is unclear, default to running all tests and providing full analysis.

## Test Commands (Project-Specific)

This project uses Vitest with the following commands:

```bash
# Run all tests once
npm test

# Run specific test file
npm test src/audit/validate-url.test.ts

# Run tests matching pattern
npm test validate

# Watch mode (not typically used in CI/validation workflow)
# vitest watch
```

**Test script**: `"test": "vitest run"` (from package.json)

**Configuration**: `vitest.config.ts`
- Node environment by default
- jsdom environment for `app/**/*.test.tsx` and `components/**/*.test.tsx`
- Setup file: `test/setup.ts` (loads @testing-library/jest-dom)

## Execution Steps

1. **Run tests**
   - Execute appropriate test command based on scope
   - Capture full output including errors and stack traces
   - Note execution time

2. **Parse results**
   - Total tests run
   - Passed vs failed count
   - Test suites (files) passed vs failed
   - Execution time
   - Any warnings or deprecations

3. **Analyze failures** (if any)
   - For each failure:
     - Test name and file location
     - Failure reason (assertion, error, timeout)
     - Stack trace and relevant code context
     - Suggested fix direction

4. **Check for common issues**
   - Unmocked dependencies causing side effects
   - Async timing issues (missing await, waitFor)
   - Stale mocks or cleanup issues
   - Environment mismatches (node vs jsdom)
   - Import/path resolution problems

5. **Provide recommendations**
   - If tests pass: confirm readiness, note coverage
   - If tests fail: prioritized fix steps
   - If no tests exist for changed code: recommend write-tests skill

## Output Format

Always return:

### 1. Test Results Summary
```
✓ Passed: X/Y tests across Z suites
✗ Failed: N tests
⏱ Duration: Xs
```

### 2. Failures (if any)
For each failed test:
- **Test**: `describe block > test name`
- **File**: [path/to/file.test.ts](path/to/file.test.ts#LX)
- **Reason**: Brief explanation
- **Fix**: Suggested next step

### 3. Overall Assessment
- **Status**: `All tests passing` | `N tests failing` | `No tests found for recent changes`
- **Readiness**: Ready to proceed | Requires fixes | Needs test coverage
- **Next Steps**: Clear action items

### 4. Additional Context (if relevant)
- Coverage gaps for changed files
- Patterns in failures (e.g., all jsdom tests failing → env issue)
- Warnings or deprecations to address
- Performance concerns (slow tests)

## Example Output

### All Passing
```
✓ 42 tests passed across 8 suites
⏱ Duration: 2.3s

All tests passing. Code is validated and ready.
```

### With Failures
```
✗ 2 tests failed, 40 passed across 8 suites
⏱ Duration: 2.1s

Failures:

1. **Test**: `parseAndNormalizeUrl > rejects invalid URLs`
   **File**: [src/audit/validate-url.test.ts](src/audit/validate-url.test.ts#L15)
   **Reason**: Expected error "Please enter a valid URL." but got "Invalid URL format."
   **Fix**: Update error message in implementation or adjust test expectation

2. **Test**: `CheckItem > copies selector on button click`
   **File**: [components/check-item.test.tsx](components/check-item.test.tsx#L58)
   **Reason**: Timeout waiting for clipboard button state change
   **Fix**: Add waitFor around assertion; verify navigator.clipboard mock is properly set up

Status: Requires fixes before proceeding
Next Steps: Fix error message consistency, then verify clipboard mock timing
```

## Guardrails

- Always run tests before reporting (don't assume based on code review)
- Provide file links with line numbers for failures when available
- Don't truncate error messages; include full context for debugging
- If tests are slow (>10s), note this and suggest investigation
- If tests fail consistently, suggest running `npm install` or checking dependencies
- Don't recommend skipping tests; prioritize fixing failures
- Report zero-test scenarios (new code without tests) as a coverage gap

## Integration with Other Skills

- After **implement-plan**, use this skill to validate section completion
- After **write-tests**, use this skill to verify new tests work correctly
- Before **validate-completed-tasks**, run tests to provide evidence of correctness
