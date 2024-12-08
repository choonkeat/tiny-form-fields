/**
 * Base class for creating custom form field elements in tiny-form-fields
 */
export class BaseCustomField extends HTMLElement {
  constructor() {
    super();

    // Create the internal input element
    this.input = document.createElement('input');

    // Initialize the forwarded event handlers map
    this._forwardedEventHandlers = {};
  }

  connectedCallback() {
    // Append the input to the custom element (Light DOM) if not already appended
    if (!this.contains(this.input)) {
      this.appendChild(this.input);
    }

    // Transfer attributes from the custom element to the internal input
    this._transferAttributes();

    // Add event listeners
    this._addEventListeners();

    // Initialize the MutationObserver
    this._observer = new MutationObserver(this._handleMutations);
    this._observer.observe(this, { attributes: true });
  }

  disconnectedCallback() {
    // Disconnect the observer when the element is removed from the DOM
    if (this._observer) {
      this._observer.disconnect();
    }

    // Remove event listeners
    this._removeEventListeners();
  }

  // Method to add event listeners
  _addEventListeners() {
    // Event handler for 'input' event
    this._onInput = () => {
      this.validate();
    };
    this.input.addEventListener('input', this._onInput);

    // Forward events from the internal input to the custom element
    this._forwardEvents(['change', 'input', 'focus', 'blur']);
  }

  // Method to remove event listeners
  _removeEventListeners() {
    if (this.input) {
      // Remove the 'input' event listener
      this.input.removeEventListener('input', this._onInput);

      // Remove forwarded event listeners
      for (const [eventName, handler] of Object.entries(this._forwardedEventHandlers)) {
        this.input.removeEventListener(eventName, handler);
      }
    }
  }

  // MutationObserver callback
  _handleMutations = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        const attrName = mutation.attributeName;
        const newValue = this.getAttribute(attrName);

        // Update the internal input's attribute
        if (newValue !== null) {
          this.input.setAttribute(attrName, newValue);
        } else {
          this.input.removeAttribute(attrName);
        }

        // Remove the attribute from the custom element
        if (!this._attributesToKeep.includes(attrName)) {
          // Temporarily disconnect to prevent infinite loops
          this._observer.disconnect();
          this.removeAttribute(attrName);
          this._observer.observe(this, { attributes: true });
        }
      }
    }
  };

  // ... rest of the class ...

  // List of attributes to keep on the custom element
  _attributesToKeep = []; // Adjust as needed

  // Transfer attributes from the custom element to the internal input
  _transferAttributes() {
    for (let attr of Array.from(this.attributes)) {
      const attrName = attr.name;
      const attrValue = attr.value;

      // Transfer the attribute to the internal input
      this.input.setAttribute(attrName, attrValue);

      // Remove the attribute from the custom element
      if (!this._attributesToKeep.includes(attrName)) {
        this.removeAttribute(attrName);
      }
    }
  }

  // Method to forward events from the internal input to the custom element
  _forwardEvents(events) {
    events.forEach((eventName) => {
      const handler = (event) => {
        // Re-dispatch the event from the custom element
        const newEvent = new event.constructor(event.type, event);
        this.dispatchEvent(newEvent);
      };
      // Store the handler so we can remove it later
      this._forwardedEventHandlers[eventName] = handler;
      this.input.addEventListener(eventName, handler);
    });
  }

  // Default validate method
  validate() {
    // Clear any custom validity messages
    this.input.setCustomValidity('');
  }

  // Expose the 'value' property
  get value() {
    return this.input.value;
  }

  set value(val) {
    this.input.value = val;
    this.validate();
  }

  // Expose the 'name' property
  get name() {
    return this.input.getAttribute('name');
  }

  set name(value) {
    this.input.setAttribute('name', value);
  }

  // Expose validation methods and properties
  checkValidity() {
    return this.input.checkValidity();
  }

  reportValidity() {
    return this.input.reportValidity();
  }

  get validity() {
    return this.input.validity;
  }

  get validationMessage() {
    return this.input.validationMessage;
  }

  get willValidate() {
    return this.input.willValidate;
  }

  // Define properties for attributes that may be set as properties
  get required() {
    return this.input.required;
  }

  set required(isRequired) {
    this.input.required = isRequired;
  }

  // Similarly, define other properties as needed (e.g., 'disabled', 'maxlength', 'pattern')
}
