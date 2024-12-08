# Custom Form Field Elements

This guide explains how to create and use custom form field elements with tiny-form-fields.

## Overview

tiny-form-fields supports custom form field elements through web components. This allows you to:
1. Create custom input types with specific validation and behavior
2. Extend the library with your own form field implementations
3. Reuse your custom elements across different forms

## Creating a Custom Element

### 1. Import BaseCustomField

First, include the base class in your HTML:

```html
<script src="node_modules/tiny-form-fields/dist/base-custom-field.js" type="module"></script>
```

Or import it in your JavaScript:

```javascript
import { BaseCustomField } from './node_modules/tiny-form-fields/dist/base-custom-field.js';
```

### 2. Define Your Web Component

Create a new class that extends `BaseCustomField`:

```javascript
class MyCustomInput extends BaseCustomField {
  constructor() {
    super();
  }

  // Optional: Implement custom validation
  validate() {
    // Your validation logic here
    return true; // or false if validation fails
  }
}

// Register your component
customElements.define('my-custom-input', MyCustomInput);
```

The `BaseCustomField` class provides:
- Automatic attribute transfer from custom element to internal input
- Event handling and forwarding
- Mutation observation for attribute changes

### 3. Configure in tiny-form-fields

Add your custom element to the `shortTextTypeList` when initializing tiny-form-fields:

```javascript
const app = Elm.Main.init({
  node: document.getElementById('myapp'),
  flags: {
    shortTextTypeList: [{
      inputType: "My Custom Input",  // Display name in the form builder
      inputTag: "my-custom-input",   // Your custom element tag name
      attributes: {                  // HTML attributes to apply
        "type": "text",             // Base input type
        "data-custom": "value"      // Any custom attributes
      }
    }]
  }
});
```

## Example: Creating a Validated Input

Here's a complete example of creating a custom validated input field that checks for a specific length:

```javascript
import { BaseCustomField } from './dist/base-custom-field.js';

class ValidatedInput extends BaseCustomField {
  constructor() {
    super();
  }

  validate() {
    // First, clear any previous custom validity message
    super.validate();

    const value = this.input.value;
    let validityMessage = '';

    // Custom validation logic
    if (value.length !== 9 && value !== '') {
      validityMessage = 'Input must be exactly 9 characters long.';
    }

    // Set custom validity on the internal input
    this.input.setCustomValidity(validityMessage);
  }
}

customElements.define('validated-input', ValidatedInput);

// Configure in tiny-form-fields
const app = Elm.Main.init({
  node: document.getElementById('tiny-form-fields'),
  flags: {
    viewMode: "Editor",
    shortTextTypeList: [{
      "Custom Element": {
        "inputTag": "validated-input",
        "attributes": {
          "type": "url"
        }
      }
    }]
  }
});
```

## Notes

1. The `BaseCustomField` class handles:
   - Creation and management of the internal input element
   - Event forwarding from the custom element to the internal input
   - Attribute synchronization via MutationObserver
   - Lifecycle management (connection/disconnection)
   - Event listener management for input validation

2. Your custom element can utilize:
   - `validate()` method for custom validation logic using `setCustomValidity`
   - `connectedCallback()` for additional setup (handled by base class)
   - `disconnectedCallback()` for cleanup (handled by base class)

3. The `shortTextTypeList` configuration accepts:
   - A map where the key is the display name (e.g. "Custom Element")
   - An object containing:
     - `inputTag`: The HTML tag name for your custom element
     - `attributes`: HTML attributes to apply to the input

4. Custom elements are automatically integrated into the form builder UI and will appear in the input type dropdown menu.

## Best Practices

1. Always extend `BaseCustomField` to ensure consistent behavior
2. Use `setCustomValidity` for validation messages
3. Clear previous validity messages before setting new ones
4. Keep validation logic simple and focused
5. Use type="module" when importing the BaseCustomField
6. Test your custom element thoroughly before integration

For a working example, refer to the `index.html` file in the `tiny-form-fields` repository.
