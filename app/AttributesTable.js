class AttributesTable extends HTMLElement {
  static observedAttributes = []

  constructor() {
    // in the constructor, you can
    //   set up initial state and default values,
    //   register event listeners and create a shadow root
    // Always call super() first in the constructor
    super()
  }
  // called each time the element is added to the document.
  // The specification recommends that, as far as possible, developers should implement
  // custom element setup in this callback rather than the constructor
  connectedCallback() {
    let template = document.querySelector('#attributes-table')
    let templateContent = template.content

    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(templateContent.cloneNode(true))
  }

  // called each time the element is removed from the document
  disconnectedCallback() {}

  // called each time the element is moved to a new document
  adoptedCallback() {}

  attributeChangedCallback(name, oldValue, newValue) {}
}

customElements.define('attributes-table', AttributesTable)
