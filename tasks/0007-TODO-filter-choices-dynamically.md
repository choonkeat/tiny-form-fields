# Filter Choices Dynamically

Created: 2023-04-12

## Description

Add a feature to filter dropdown/choice field options based on the value of another field. For example, if Field A has the value "Hello", Field B (which is a dropdown, radio buttons, or checkboxes) would only show options that start with or contain "Hello".

This feature allows for dynamic filtering of options in dropdown, radio button, and checkbox fields based on users' input in other fields, creating more interactive and context-aware forms.

## Requirements

### Type Level Changes

- [x] Add a new `ChoiceFilter` type in `src/Main.elm` that combines both the filter rule and source field in one type:
  ```elm
  type ChoiceFilter
      = FilterStartsWithFieldValueOf String  -- String is the source field name
      | FilterContainsFieldValueOf String    -- String is the source field name
  ```

- [x] Update the relevant `InputField` variants to include filter configuration:
  ```elm
  type InputField
      = ShortText CustomElement
      | LongText (AttributeOptional Int)
      | Dropdown 
          { choices : List Choice
          , filter : Maybe ChoiceFilter
          }
      | ChooseOne 
          { choices : List Choice
          , filter : Maybe ChoiceFilter
          }
      | ChooseMultiple
          { choices : List Choice
          , minRequired : Maybe Int
          , maxAllowed : Maybe Int
          , filter : Maybe ChoiceFilter
          }
  ```

- [x] Add new message variants for handling filter UI:
  ```elm
  type FormFieldMsg
      = ...existing variants...
      | OnFilterToggle Bool
      | OnFilterTypeSelect String  -- "startswith" or "contains"
      | OnFilterSourceFieldSelect String
  ```

### UI Changes

- [x] Add a "Filter choices dynamically" checkbox underneath the "Choices" textarea for Dropdown, ChooseOne, and ChooseMultiple fields
- [x] When checked, display:
  - [x] Label: "Show choices that"
  - [x] First dropdown: "Starts with" | "Contains"
  - [x] Second dropdown: List of other question fields (same as those in Field Logic)
- [x] Update the `updateFormField` function to handle the new message variants:
  ```elm
  case msg of
      OnFilterToggle checked ->
          -- Remove filter if unchecked, keep existing or add default if checked
      
      OnFilterTypeSelect filterType ->
          -- Update filter type (startsWith/contains) while preserving the source field
      
      OnFilterSourceFieldSelect fieldName ->
          -- Update source field while preserving the filter type
  ```
- [x] Add encoders/decoders for `ChoiceFilter`
- [x] Update encoders/decoders for modified `InputField` variants

### Filter Implementation

- [x] Add a function to filter choices based on the source field's value:
  ```elm
  filterChoices : Maybe ChoiceFilter -> Dict String (List String) -> List Choice -> List Choice
  filterChoices maybeFilter formValues choices =
      case maybeFilter of
          Just (FilterStartsWithFieldValueOf fieldName) ->
              -- Get field value and filter choices that start with it
              
          Just (FilterContainsFieldValueOf fieldName) ->
              -- Get field value and filter choices that contain it
              
          Nothing ->
              -- No filtering, return all choices
  ```
- [x] Update the preview rendering functions to apply the filter when displaying choices
- [x] For empty result sets (when filtering returns no choices), hide the field entirely 
- [x] Ensure that filtering updates dynamically when source fields change by using existing `trackedFormValues`

### Testing

- [x] Add tests to verify filters work correctly in various scenarios:
  - [x] StartsWith filtering
  - [x] Contains filtering
  - [x] With empty source field (should show all choices)
  - [x] With values that match no choices (field should be hidden)
  - [x] With multiple matching choices
- [x] Test encoder/decoder for ChoiceFilter (via input field fuzzers)
- [x] Test interaction with other features like visibility rules and required fields

## Design Decisions

- Simplified type design by combining filter rule and source field into a single `ChoiceFilter` type
- More self-documenting with explicit constructor names `FilterStartsWithFieldValueOf` and `FilterContainsFieldValueOf`
- Filtering is conceptually separate from visibility rules, so it gets its own UI section
- Filter UI is placed directly under the choices it affects for intuitive connection
- Pattern matching for filter processing becomes clearer with the combined type
- If filtering returns no options, the field is hidden, similar to visibility rules behavior
- Simpler to extend with additional filter types in the future by adding new constructors