---
name: write-tests
description: Write comprehensive tests for new or existing code following project conventions. Use when the user asks to add tests, write test coverage, or test a specific feature/component.
---

# Write Tests

## Purpose

Create thorough test coverage for application code following the project's established testing patterns, conventions, and quality standards.

## When To Use

Use this skill when:

- The user asks to write tests for specific code
- A PRD or plan requires test coverage for new features
- The user asks to add missing test coverage
- The user asks to test a specific component, function, or module

## Required Inputs

Before starting:

1. Identify what code needs tests:
   - Specific files or modules
   - New features from a plan section
   - Uncovered code areas
2. Determine test type needed:
   - Unit tests (functions, utilities, business logic)
   - Integration tests (API routes, database operations)
   - Component tests (React components, user interactions)
3. Understand existing test patterns:
   - Review similar existing tests in the codebase
   - Follow established conventions for file location and naming

If scope is unclear, ask one focused question and pause.

## Testing Conventions (Project-Specific)

This project uses the following testing patterns:

### Framework & Tools
- **Vitest** for test runner
- **@testing-library/react** for component tests
- **@testing-library/user-event** for user interaction simulation
- **@testing-library/jest-dom** for DOM assertions

### File Naming & Location
- Tests live **alongside** the code they test
- Unit/integration: `filename.test.ts`
- Component tests: `filename.test.tsx`
- Example: `src/audit/validate-url.ts` → `src/audit/validate-url.test.ts`

### Test Structure
```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

describe("ModuleName or ComponentName", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("describes expected behavior", () => {
    // Arrange, Act, Assert
  })
})
```

### React Component Tests
```typescript
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

describe("ComponentName", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it("renders expected elements", async () => {
    render(<ComponentName />)
    const user = userEvent.setup()
    
    // Interact and assert
  })
})
```

### Mocking Patterns
- `vi.fn()` for function mocks
- `vi.stubGlobal("fetch", mockFn)` for global APIs
- `vi.mock("module/path", () => ({ ... }))` for module mocks
- Always restore mocks in `afterEach`

### Helper Functions
- Create factory/builder functions for test data
- Example: `makeCheck()`, `successPayload()`
- Keep helpers in the same test file unless widely reused

### Best Practices
1. **Descriptive names**: Test names should read like specifications
2. **Arrange-Act-Assert**: Clear separation of setup, execution, verification
3. **Test behavior, not implementation**: Focus on observable outcomes
4. **Coverage priorities**: Happy paths, error cases, edge cases, boundary conditions
5. **Isolation**: Each test should be independent
6. **Cleanup**: Restore mocks, cleanup renders in `afterEach`

## Execution Steps

1. **Analyze target code**
   - Read the implementation thoroughly
   - Identify public API surface (exported functions, props, behavior)
   - Note dependencies and side effects
   - List expected behaviors and edge cases

2. **Design test cases**
   - Happy path scenarios
   - Error/failure cases
   - Edge cases and boundary conditions
   - State transitions (for components)
   - User interactions (for UI components)

3. **Write tests**
   - Follow project conventions exactly
   - Use existing tests as reference for style
   - Include clear test names
   - Add comments only when test intent is unclear
   - Mock external dependencies appropriately

4. **Verify tests**
   - Run tests to confirm they pass
   - Check that intentional failures are caught
   - Ensure no unintended side effects between tests
   - Verify test output is clear and actionable

5. **Report coverage**
   - Summarize what was tested
   - Note any intentionally excluded scenarios
   - Highlight any test setup requirements (mocks, fixtures)

## Output Format

After writing tests, provide:

1. **Test Summary**
   - Files created/modified
   - Number of test cases added
   - Coverage areas (happy path, errors, edge cases)

2. **Run Instructions**
   - Command to run the new tests: `npm test <path>`
   - Any special setup needed

3. **Notes**
   - Mocking strategies used
   - Dependencies or patterns to be aware of
   - Gaps or future test opportunities

## Guardrails

- Do not write tests for external libraries or framework code
- Do not test implementation details; test observable behavior
- Do not leave commented-out test code
- Always clean up mocks and test state
- Prefer multiple focused tests over one large test
- Match the style and patterns of existing tests exactly
