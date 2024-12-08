# Flags Documentation for Elm.Main.init

The `flags` argument passed to `Elm.Main.init` is a JSON object that configures the behavior and initial state of the form fields component. Here's a detailed breakdown of the available flags:

## Structure

```typescript
{
  viewMode?: "Editor" | "CollectData";
  formFields?: any;
  formValues?: {
    [fieldName: string]: string | string[];
  };
  shortTextTypeList?: Array<CustomElement>;
}

// Type definitions
type CustomElement = {
  inputType: string;
  inputTag: string;
  attributes: Record<string, string>;
}
```

## Fields

### viewMode
- **Type**: String
- **Default**: `"Editor"`
- **Options**: 
  - `"Editor"`: For form administrators to build and edit the form
  - `"CollectData"`: For end users to fill in the form
- **Example**: `"CollectData"`

### formFields
- **Type**: Opaque value
- **Default**: `null`
- **Description**: Form configuration. For new forms, omit this field or pass `null`. For existing forms, pass the JSON value obtained from:
  - The hidden form field with name `"tiny-form-fields"`, or
  - The `formFields` port event when using the form editor

### formValues
- **Type**: Dictionary of field names to either string (for text/dropdown/radio) or string[] (for checkboxes)
- **Default**: `null`
- **Description**: Pre-filled values for form fields
- **Example**:
```json
{
  "Full Name": "John Smith",
  "Contact Number": "+1 555-0123",
  "Preferred Fruits": ["Apple", "Orange", "Mango"]
}
```

### shortTextTypeList
- **Type**: Array
- **Default**: Array with one default text input type
- **Description**: List of custom field type definitions

Each custom field type has the following structure:
- **Type**: `CustomElement`
- **Description**: Defines a custom input type available for short text fields
- **Fields**:
  - `inputType`: Label of the button shown under "Add Form Field" section. Also serves as unique identifier for this field type
  - `inputTag`: HTML tag to use (defaults to "input")
  - `attributes`: HTML attributes to apply to the element, including:
    - `type`: HTML input type (e.g. "text", "email")
    - `maxlength`: Maximum length constraint
    - `list`: Datalist of suggested values (one per line)

**Examples**:

1. Custom Web Component:
```json
{
  "URL Validation": {
    "inputType": "URL Validation",
    "inputTag": "validated-input",
    "attributes": {
      "type": "url"
    }
  }
}
```
Renders as:
```html
<validated-input type="url"></validated-input>
```

2. Email with maxlength:
```json
{
  "shortTextTypeList": [
    {
      "inputType": "Email",
      "attributes": {
        "type": "email",
        "maxlength": "5"
      }
    }
  ]
}
```
Renders as:
```html
<input type="email" maxlength="5"></input>
```

3. Multiple Emails with Datalist:
```json
{
  "shortTextTypeList": [
    {
      "inputType": "Multiple Emails",
      "attributes": {
        "type": "email",
        "multiple": "true",
        "list": "alice@example.com\nbob@example.com\ncharlie@example.com"
      }
    }
  ]
}
```
Renders as:
```html
<input type="email" multiple="true" list="field-id-datalist"></input>
<datalist id="field-id-datalist">
  <option value="alice@example.com">alice@example.com</option>
  <option value="bob@example.com">bob@example.com</option>
  <option value="charlie@example.com">charlie@example.com</option>
</datalist>
```

## Usage Example

```javascript
let app = Elm.Main.init({
  node: document.getElementById('tiny-form-fields'),
  flags: {
    viewMode: "Editor",
    formFields: null, // start building from a blank form
    formValues: {
      "Full Name": "John Smith",
      "Contact Number": "+1 555-0123",
      "Preferred Fruits": ["Apple", "Orange", "Mango"]
    },
    shortTextTypeList: [
      {
        "Custom Element": {
          "inputTag": "validated-input",
          "attributes": {
            "type": "url"
          }
        }
      },
      {
        "Email": {
          "type": "email"
        }
      }
    ]
  }
});
