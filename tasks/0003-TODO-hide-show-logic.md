# Support Hide and Show Logic

Created: 2024-12-08T15:21:29+08:00

## Description

Add support for conditional visibility where each field can specify when it should be shown or hidden based on values of other fields.

## Requirements

### Configuration
- [x] Add "Visibility Rules" section in field settings
    - [x] Iteration 1: Just the model
        - Add `VisibilityRule` type with `AlwaysVisible` constructor
        - Add `visibilityRule` field of type `VisibilityRule` to field model
        - Update decoder/encoder
    - [x] Iteration 2: Just the settings section presence
        - Add container div for "Visibility Rules" section
        - Add section header text
        - No content yet
    - [x] Iteration 3: Just display current rule
        - Add text to show current rule ("Always visible")
        - No editing capability yet
- [ ] Allow selecting which other fields' values control this field's visibility
- [ ] Support common operators (equals, not equals, contains, etc.)
- [ ] Support multiple conditions with AND/OR logic
- [ ] Show indicator when a field has other fields depending on its value

### Validation & Dependencies
- [ ] Enforce "fields can only depend on previous answers" rule
- [ ] Automatically remove visibility rules when their referenced fields are moved after the dependent field
- [ ] Automatically remove visibility rules when their referenced fields are deleted
- [ ] Validate that referenced fields still exist when importing form definitions
- [ ] Show warning indicator before reordering fields that have dependent rules

### Runtime Behavior
- [ ] Implement real-time visibility updates in CollectData mode
- [ ] Handle dependent fields (fields that depend on hidden fields)
- [ ] Skip validation for hidden required fields during form submission
- [ ] Preserve values of hidden fields when they become visible again
- [ ] Gracefully handle fields that become hidden during user input

### Documentation & Testing
- [ ] Update documentation with new feature
- [ ] Document behavior of hidden fields in form submission
- [ ] Add tests for conditional logic
- [ ] Add tests for form validation with hidden fields
- [ ] Add tests for import/export with visibility rules
