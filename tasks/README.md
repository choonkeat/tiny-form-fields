# Tasks Directory

This directory contains task descriptions for features and improvements to tiny-form-fields.

## File Format

Each task is documented in a markdown file with the following naming convention:
`NNNN-STATUS-brief-description.md` where:
- `NNNN` is a 4-digit sequential number
- `STATUS` is one of: `TODO`, `WIP`, `DONE`, or `HOLD`
- `brief-description` is a short, hyphen-separated description of the task

### Task File Structure

```markdown
# Title

Created: [ISO 8601 timestamp]

## Description

A clear description of the task/feature

## Requirements

- [ ] Specific implementation requirements
- [ ] Listed as checkboxes
- [ ] For tracking progress
```

## Current Tasks

### Completed
- [0001](./0001-DONE-custom-element-support.md) - Support custom element
- [0002](./0002-DONE-three-panel-layout.md) - Refactor to 3 panel layout with drag and drop

### In Progress
- [0003](./0003-TODO-hide-show-logic.md) - Support hide and show logic
- [0004](./0004-TODO-checkbox-min-max-settings.md) - Add min/max settings for Checkboxes
- [0005](./0005-TODO-others-option.md) - Add "Others" option with free text input
