# tiny-form-fields

A lightweight, customizable form builder and renderer written in Elm. Create dynamic forms with various field types, drag-and-drop reordering, and validation support.

👉 [Try the live demo](https://tiny-form-fields.netlify.app/)

## Features

- Rich form field types including:
  - Single-line text
    - Optional multiple value support
  - Multi-line text
  - Dropdown menus
  - Radio buttons
  - Checkboxes
  - Email (single and multiple)
  - Phone numbers
  - URLs
  - Custom elements with validation
  - Rich text editor (via custom field integration)
- Drag-and-drop field reordering
- Field validation
- Conditional visibility rules:
  - Show/Hide fields based on other field values
  - Multiple conditions with AND/OR logic
  - Real-time updates in CollectData mode
  - Support for various comparison types (equals, contains, ends with, greater than)
  - Visual logic indicators showing which fields:
    - Contain logic (blue pill with "Contains logic" text)
    - Affect other fields' logic (gray pill with "Affects logic" text)
    - Both contain and affect logic (blue pill with "Contains & affects logic" text)
- Responsive design
- Two modes: Editor (for building forms) and CollectData (for end users)
- JSON import/export of form definitions
- Cross-browser compatibility:
  - Tested on Chrome, Firefox, Safari, and Edge
  - Consistent behavior for form controls across browsers
  - Optimized dropdown handling for Edge on Windows
  - Built-in protection against browser extensions:
    - Grammarly is automatically disabled for form fields
    - Support for disabling Google Translate and Dark Reader

## Tasks

See the [tasks](tasks/) directory for planned features and improvements. Each task is documented with requirements and implementation details.

## Installation

1. Add the compiled assets to your project:
   ```html
   <script src="./dist/tiny-form-fields.js"></script>
   <link rel="stylesheet" href="./dist/tiny-form-fields.min.css">
   ```

2. Add meta tags to prevent browser extensions from interfering with form fields:
   ```html
   <!-- Disable Google Translate -->
   <meta name="google" content="notranslate">
   <!-- Disable Dark Reader -->
   <meta name="darkreader-lock">
   ```

3. Initialize the form builder in your HTML:
   ```html
   <!-- Editor mode -->
   <div id="editor"></div>
   <script>
     var app = Elm.Main.init({
       node: document.getElementById('editor'),
       flags: {
         viewMode: "Editor",
         formFields: [], // your initial form fields
         formValues: {}, // initial values
         shortTextTypeList: [] // custom field types
       }
     });
   </script>
   ```
   See [FLAGS.md](FLAGS.md) for detailed documentation of all available configuration options.

## Development

### Prerequisites

- Node.js and npm
- Elm (for compilation)
- Make (for build scripts)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Commands

- `make dist/tiny-form-fields.esm.js` - Build the production JS and CSS files
- `make css` - Build just the CSS
- `make run` - Start development server with hot reloading
- `make test` - Run Elm tests
- `make test-playwright` - Run end-to-end tests
- `make test-playwright-ui` - Run end-to-end tests with UI
- `make elm-review` - Run elm-review with auto-fix

### Project Structure

- `src/Main.elm` - Main Elm source code
- `input.css` - Source CSS file (processed by Tailwind)
- `tests/` - Elm unit tests
- `e2e/` - Playwright end-to-end tests
- `dist/` - Compiled assets

## Usage Example

```html
<!-- Include the required assets -->
<script src="./dist/tiny-form-fields.js"></script>
<link rel="stylesheet" href="./dist/tiny-form-fields.min.css">

<!-- Create a container for the form -->
<div id="myform"></div>

<script>
  // Initialize in Editor mode
  var app = Elm.Main.init({
    node: document.getElementById('myform'),
    flags: {
      viewMode: "Editor",
      formFields: [],
      formValues: {},
      shortTextTypeList: [
        {
          "Text": {
            "type": "text",
            "maxlength": "100"
          }
        }
      ]
    }
  });

  // Listen for form changes
  app.ports.outgoing.subscribe(function(data) {
    console.log('Form data:', data);
    // Handle form data changes here
  });
</script>
```

## Rich Text Editor Integration

You can integrate a rich text editor as a custom field type. Here's how:

1. Choose a Rich Text Editor library (e.g., TinyMCE, CKEditor, Quill)

2. Create a custom field type:
   ```javascript
   var app = Elm.Main.init({
     node: document.getElementById('editor'),
     flags: {
       viewMode: "Editor",
       formFields: [],
       formValues: {},
       shortTextTypeList: [{
         type: "richtext",
         label: "Rich Text Editor"
       }]
     }
   });
   ```

3. Subscribe to field render events:
   ```javascript
   app.ports.renderCustomField.subscribe(function(data) {
     if (data.type === "richtext") {
       // Initialize your rich text editor
       const editor = new RichTextEditor({
         element: document.getElementById(data.id),
         value: data.value || ''
       });
       
       // Send value back to Elm
       editor.onChange((newValue) => {
         app.ports.onCustomFieldChange.send({
           id: data.id,
           value: newValue
         });
       });
     }
   });
   ```

4. Add necessary CSS to style your editor:
   ```html
   <link href="rich-text-editor.css" rel="stylesheet">
   ```

### Example with TinyMCE

```javascript
// Initialize TinyMCE
app.ports.renderCustomField.subscribe(function(data) {
  if (data.type === "richtext") {
    tinymce.init({
      selector: '#' + data.id,
      height: 300,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
        'insertdatetime', 'media', 'table', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | formatselect | bold italic | ' +
        'alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | help',
      setup: function(editor) {
        editor.on('change', function() {
          app.ports.onCustomFieldChange.send({
            id: data.id,
            value: editor.getContent()
          });
        });
      }
    });
  }
});
```

Note: Rich text editors can be heavy dependencies. Consider lazy-loading the editor library only when needed to optimize initial page load.

## Custom Elements

tiny-form-fields supports custom form field elements through web components. If you need to create your own custom form field types, please refer to our [Custom Elements Guide](CUSTOM_ELEMENT.md) for detailed instructions.

## Configuring Form Fields and Custom Types

The library accepts two main configuration objects: `formFields` for defining form fields, and `shortTextTypeList` for defining custom input types.

#### Form Fields Format

Form fields should be defined with this structure:

```javascript
formFields: [
    {
        "label": "Field Label",
        "type": {
            "type": "ShortText",      // Field type (ShortText, LongText, ChooseOne, ChooseMultiple)
            "inputType": "text"       // HTML input type or custom type
        },
        "required": true,             // or false
        "description": "Help text",   // or null
        "name": null                  // Optional field name
    }
]
```

#### Custom Field Types (shortTextTypeList)

The `shortTextTypeList` parameter allows you to define custom input types:

```javascript
shortTextTypeList: [
    {
        "Field Type Name": {           // Display name in the form builder
            "type": "text",            // Base HTML input type
            "maxlength": "10",         // Optional: Additional HTML attributes
            "multiple": "true"         // Optional: Support multiple values
        }
    }
]
```

Example configurations:

```javascript
// Basic text input
{
    "Text": {
        "type": "text"
    }
}

// Email input with multiple values
{
    "Emails": {
        "type": "email",
        "multiple": "true"
    }
}

// Custom validated input
{
    "NRIC": {
        "type": "text",
        "pattern": "^[STGM][0-9]{7}[ABCDEFGHIZJ]$"
    }
}

// Rich text editor
{
    "Rich Text": {
        "type": "text",
        "class": "richtext"
    }
}
```

For custom elements using Web Components:
1. Define your custom element class extending `BaseCustomField`
2. Register it using `customElements.define`
3. Include it in `shortTextTypeList` with the appropriate configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`make test && make test-playwright`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License.
