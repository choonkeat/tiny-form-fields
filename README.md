# tiny-form-fields

A lightweight, customizable form builder and renderer written in Elm. Create dynamic forms with various field types, drag-and-drop reordering, and validation support.

👉 [Try the live demo](https://tiny-form-fields.netlify.app/)

## Features

- Rich form field types including:
  - Single-line text
  - Multi-line text
  - Dropdown menus
  - Radio buttons
  - Checkboxes
  - Email (single and multiple)
  - Phone numbers
  - URLs
  - Custom elements with validation
- Drag-and-drop field reordering
- Field validation
- Responsive design
- Two modes: Editor (for building forms) and CollectData (for end users)
- JSON import/export of form definitions

## Installation

1. Add the compiled assets to your project:
   ```html
   <script src="./dist/tiny-form-fields.js"></script>
   <link rel="stylesheet" href="./dist/tiny-form-fields.min.css">
   ```

2. Initialize the form builder in your HTML:
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

## Custom Elements

tiny-form-fields supports custom form field elements through web components. If you need to create your own custom form field types, please refer to our [Custom Elements Guide](CUSTOM_ELEMENT.md) for detailed instructions.

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
