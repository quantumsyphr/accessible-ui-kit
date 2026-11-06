import { nextIndex } from './internal/keys.js';
import { uid } from './internal/uid.js';

/**
 * Accordion built from plain headings and panels.
 *
 * Markup: each [data-accordion-heading] is followed by its [data-accordion-panel]. Without
 * JavaScript every panel stays visible. Add data-single to the root to keep at most one
 * panel open.
 */
export class Accordion {
  #panels = new Map();

  constructor(root) {
    this.root = root;
    this.single = root.hasAttribute('data-single');

    for (const heading of root.querySelectorAll(':scope > [data-accordion-heading]')) {
      const panel = heading.nextElementSibling;
      if (panel?.hasAttribute('data-accordion-panel')) this.#enhance(heading, panel);
    }

    root.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (this.#panels.has(button)) this.toggle(button);
    });
    root.addEventListener('keydown', (event) => this.#onKeydown(event));
  }

  toggle(button, open = button.getAttribute('aria-expanded') !== 'true') {
    if (open && this.single) {
      for (const other of this.#panels.keys()) if (other !== button) this.#set(other, false);
    }
    this.#set(button, open);
  }

  #enhance(heading, panel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = uid('accordion-header');
    button.append(...heading.childNodes);
    heading.append(button);

    panel.id ||= uid('accordion-panel');
    button.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', button.id);
    panel.addEventListener('beforematch', () => this.toggle(button, true));

    this.#panels.set(button, panel);
    this.#set(button, false);
  }

  #set(button, open) {
    button.setAttribute('aria-expanded', String(open));
    // "until-found" keeps collapsed text discoverable with find in page.
    this.#panels.get(button).hidden = open ? false : 'until-found';
  }

  #onKeydown(event) {
    const buttons = [...this.#panels.keys()];
    const index = buttons.indexOf(event.target);
    if (index === -1) return;
    const next = nextIndex(event.key, index, buttons.length, { previous: 'ArrowUp', next: 'ArrowDown' });
    if (next === -1) return;
    event.preventDefault();
    buttons[next].focus();
  }
}
