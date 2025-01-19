# Support Hide and Show Logic

Created: 2024-12-08T15:21:29+08:00

## Description

Add support for conditional visibility where each field can specify when it should be shown or hidden based on values of other fields.

## Requirements

### Configuration
- [x] Add "Visibility Rules" section in field settings
    - [x] Iteration 1: Just the model
        - Add `Condition` type for field value comparisons:
          ```elm
          type Condition
              = Field String Comparison    -- (fieldName, comparison)
              | Always                     -- always true condition
          ```
        - Add `VisibilityRule` constructors:
          ```elm
          type VisibilityRule
              = ShowWhen Condition    -- show when condition is true
              | HideWhen Condition    -- hide when condition is true
          ```
        - Add `visibilityRule` field of type `VisibilityRule` to field model
        - Update decoder/encoder
    - [x] Iteration 2: Just the settings section presence
        - Add container div for "Field logic" section
        - Add section header text
        - No content yet
    - [x] Iteration 3: Just display current rule
        - Add dropdown to select field
        - Add dropdown to select comparison type
        - Add text input for comparison value
        - No styling yet
- [x] Allow selecting which other fields' values control this field's visibility
    - [x] Iteration 1: Just the model
        - Add `Comparison` type:
          ```elm
          type Comparison
              = Equals String      -- exact match
              | StringContains String    -- substring match
              | ChoiceIncludes String    -- choice includes value
              | EndsWith String          -- string ends with value
          ```
        - Update decoder/encoder
        - Nothing else
    - [x] Iteration 2: Just the UI presence
        - Add dropdowns for field selection and comparison type
        - Add text input for comparison value
        - No event handlers yet
        - Nothing else
    - [x] Iteration 3: Just the field selection
        - Populate field dropdown with all available fields
        - Wire up field selection event
        - Update model when field is selected
        - Nothing else
- [x] Support common operators (equals, contains, choice includes, ends with)
- [x] Support multiple conditions with AND/OR logic
    - Added support for multiple visibility rules
    - Each rule can have multiple conditions
    - Rules are evaluated independently
- [ ] Show indicator when a field has other fields depending on its value

### Validation & Dependencies
- [ ] Automatically remove visibility rules when their referenced fields are deleted
- [ ] Validate that referenced fields still exist when importing form definitions

### Runtime Behavior
- [x] Implement real-time visibility updates in CollectData mode
    - [x] Support Dropdown field type
    - [x] Support Radio buttons field type  
    - [x] Support Checkboxes field type
    - [x] Support Single-line free text with contains comparison
- [ ] Handle dependent fields (fields that depend on hidden fields)
- [ ] Skip validation for hidden required fields during form submission
- [ ] Preserve values of hidden fields when they become visible again
- [ ] Gracefully handle fields that become hidden during user input

### Documentation & Testing
- [ ] Update documentation with new feature
- [ ] Document behavior of hidden fields in form submission
- [x] Add tests for conditional logic
    - [x] Unit tests for isVisibilityRuleSatisfied
    - [x] Unit tests for evaluateCondition with precise behavior documentation
    - [x] Tests cover all comparison types (Equals, StringContains, EndsWith)
    - [x] Tests cover single and multiple values
    - [x] Tests cover edge cases (empty strings, missing fields)
- [ ] Add tests for form validation with hidden fields
- [ ] Add tests for import/export with visibility rules
