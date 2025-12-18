# Task: System Presence + ChooseMultiple Runtime Validation Fix

## Goal
Add Layer 2 defense: Make frontend validation enforce System presence = required for ChooseMultiple fields, even when minRequired is not explicitly set.

## Context
- PR #54 is already merged (Layer 1: prevents new bad configs in editor)
- This adds Layer 2: fixes existing bad configs at runtime
- Go validation (Layer 3) already expects System fields to be required

## Implementation Plan

### Step 0: Setup and Format ✅ COMPLETE
- [x] Run `make format` to ensure clean baseline
- [x] Verify current tests pass - 89 tests passed
- [x] Commit formatted code if any changes - committed as 24261ff

### Step 1: Add test for System + ChooseMultiple with minRequired=Nothing ✅ PARTIAL
- [x] Created E2E test in `e2e/system-choosemultiple-validation.spec.ts`
- [x] Test needs refinement but documents expected behavior
- [x] Run `make format` - passed
- [x] Committed as WIP test (41c1173)
- Note: Test needs work to properly interact with Elm app, will verify fix manually

### Step 2: Implement effectiveMin logic in validationElement ✅ COMPLETE
- [x] Modified `src/Main.elm` around line 2288-2317
- [x] Added `effectiveMin` calculation in the `ChooseMultiple` case
- [x] Logic: if `formField.presence == System` and `minRequired == Nothing`, use `Just 1`
- [x] Updated `needsValidation` to use `effectiveMin` instead of `minRequired`
- [x] Updated validation element's `min` attribute to use `effectiveMin`
- [x] Run `make format` - passed
- [x] Run `make test` - all 89 tests PASSED
- [x] Run `make test-go` - Go tests PASSED
- [x] Committed fix (4c46d12)

### Step 3-4: Required + ChooseMultiple extension - SKIPPED
- Decision: Focus only on System presence fix for now
- Required presence can be addressed in a future PR if needed
- Rationale: Original issue was specifically about System fields

### Step 5: Integration testing ✅ COMPLETE
- [x] Run `make test` - all 89 Elm tests PASSED
- [x] Run `make test-go` - Go tests PASSED
- [x] Run `make test-json-compatibility` - all 21 tests PASSED
- [x] Verified no regressions in elm tests
- [x] Verified no regressions in Go tests
- [x] Verified no regressions in JSON compatibility tests

### Step 6: Manual browser testing - READY FOR USER
- Dev server is running at http://localhost:8000 (background process b5553b4)
- User can test by:
  1. Injecting a System + ChooseMultiple field via JSON
  2. Switching to Preview mode
  3. Trying to submit with 0 selections - should see browser validation error
  4. Selecting 1+ options - should allow submit

### Step 7: Final verification and documentation ✅ COMPLETE
- [x] All code is formatted
- [x] All tests pass
- [x] Implementation documented in this tracking file
- [x] Research notes already exist in `research/2025-12-18-1626-*.md`

## Implementation Summary

### Changes Made

#### 1. Validation Element Generation (lines 2288-2317)
- Added `effectiveMin` calculation in ChooseMultiple validation element
- When `presence == System` and `minRequired == Nothing`, treats as `minRequired == Just 1`
- Creates hidden `<input type="number" min="1" required>` for validation

#### 2. Event Handler Attachment (lines 1654-1670)
- Modified `isChooseManyUsingMinMax` to also check for System presence
- Ensures event handlers are attached when `presence == System`
- Allows `trackedFormValues` to be updated when checkboxes are clicked
- Validation element's `value` attribute reflects actual selection count

#### 3. E2E Tests (e2e/system-choosemultiple-validation.spec.ts)
- Test 1: Verifies System + ChooseMultiple creates validation with min="1"
- Test 2: Documents behavior when minRequired is explicitly set
- Tests pass in Chrome, Firefox, and WebKit

### Commits
- `24261ff` - Format code after PR #54
- `41c1173` - Add WIP E2E test
- `4c46d12` - Implement the validation element fix
- `1a54817` - Documentation update
- `2427a54` - **Complete fix**: Event handlers + working E2E tests

### Test Results
- ✅ Elm tests: 89/89 passed
- ✅ Go tests: passed
- ✅ JSON compatibility: 21/21 passed
- ✅ E2E tests: 6/6 passed (Chrome, Firefox, WebKit)

### Impact
- **Fixed**: System + ChooseMultiple fields now enforce at least 1 selection
- **Backward compatible**: Only affects fields with `presence == System` AND `minRequired == Nothing`
- **Aligns with backend**: Frontend validation now matches Go validation expectations

## Test Commands
```bash
# Before each step
make format

# After code changes
make test
make test-go
make test-json-compatibility

# Full suite
make test-all

# Production build
make build
```

## Expected File Changes
1. `tests/MainTest.elm` - New test cases
2. `src/Main.elm` - Modified validation element logic in ChooseMultiple case

## Success Criteria
- [ ] All existing tests pass
- [ ] New tests verify System + ChooseMultiple creates validation element
- [ ] Validation element has correct min="1" attribute
- [ ] Go validation tests still pass
- [ ] No regressions in other field types

## Notes
- This fix is additive - doesn't change behavior for fields with explicit minRequired
- Only affects fields with `presence == System` (or `Required` if we extend) AND `minRequired == Nothing`
- Aligns frontend validation with backend Go validation expectations
