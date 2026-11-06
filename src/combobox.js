import { uid } from './internal/uid.js';

/**
 * Editable combobox with list autocomplete, following the WAI-ARIA combobox pattern.
 *
 * Markup: an <input list> with its <datalist> inside the root. Without JavaScript the
 * browser's own datalist suggestions keep working. Focus never leaves the input; the
 * highlighted option is exposed through aria-activedescendant. Picking an option fires
 * change and a "ui:select" event (detail.value) on the input.
 */
export class Combobox {
  #values = [];
  #active = -1;

  constructor(root) {
    this.root = root;
    const input = root.querySelector('input[list]');
    const datalist = input && document.getElementById(input.getAttribute('list'));
    if (!datalist) return;

    this.input = input;
    this.#values = [...datalist.options].map((option) => option.value);

    this.listbox = document.createElement('ul');
    this.listbox.id = uid('combobox-listbox');
    this.listbox.setAttribute('role', 'listbox');
    this.listbox.hidden = true;
    const label = input.labels?.[0];
    if (label) {
      label.id ||= uid('combobox-label');
      this.listbox.setAttribute('aria-labelledby', label.id);
    }

    this.status = document.createElement('p');
    this.status.setAttribute('role', 'status');
    this.status.className = 'visually-hidden';

    input.removeAttribute('list');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-controls', this.listbox.id);
    input.after(this.listbox, this.status);

    input.addEventListener('input', () => this.#showMatches());
    input.addEventListener('keydown', (event) => this.#onKeydown(event));
    input.addEventListener('blur', () => this.close());
    // Pressing an option must not move focus, or blur would close the list before the click lands.
    this.listbox.addEventListener('mousedown', (event) => event.preventDefault());
    this.listbox.addEventListener('click', (event) => {
      const option = event.target.closest('[role="option"]');
      if (option) this.#pick(option);
    });
  }

  close() {
    this.#setOpen(false);
  }

  #showMatches({ all = false } = {}) {
    const query = this.input.value.trim().toLowerCase();
    if (!query && !all) {
      this.close();
      return;
    }
    // A match is any value with a word that starts with the query: "wo" finds "Fort Worth".
    const values = all
      ? this.#values
      : this.#values.filter((value) => ` ${value.toLowerCase()}`.includes(` ${query}`));

    this.listbox.replaceChildren(...values.map((value) => this.#createOption(value)));
    const count = values.length;
    this.status.textContent =
      count === 0 ? 'No results.' : `${count} ${count === 1 ? 'result' : 'results'} available.`;
    this.#setOpen(count > 0);
  }

  #createOption(value) {
    const option = document.createElement('li');
    option.id = uid('combobox-option');
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.textContent = value;
    return option;
  }

  #setOpen(open) {
    this.listbox.hidden = !open;
    this.input.setAttribute('aria-expanded', String(open));
    this.#active = -1;
    this.input.removeAttribute('aria-activedescendant');
  }

  #highlight(index) {
    const options = [...this.listbox.children];
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
    this.#active = index;
    this.input.setAttribute('aria-activedescendant', options[index].id);
    options[index].scrollIntoView({ block: 'nearest' });
  }

  #pick(option) {
    const value = option.textContent;
    this.input.value = value;
    this.close();
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
    this.input.dispatchEvent(new CustomEvent('ui:select', { bubbles: true, detail: { value } }));
  }

  #onKeydown(event) {
    const open = !this.listbox.hidden;
    const count = this.listbox.children.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          this.#showMatches({ all: !this.input.value.trim() });
          if (!this.listbox.hidden) this.#highlight(0);
        } else {
          this.#highlight((this.#active + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (!open) break;
        event.preventDefault();
        this.#highlight(this.#active <= 0 ? count - 1 : this.#active - 1);
        break;
      case 'Enter':
        if (open && this.#active !== -1) {
          event.preventDefault();
          this.#pick(this.listbox.children[this.#active]);
        }
        break;
      case 'Escape':
        // Only claim Escape when there is something to undo, so a parent dialog can still close.
        if (open) {
          event.preventDefault();
          this.close();
        } else if (this.input.value) {
          event.preventDefault();
          this.input.value = '';
        }
        break;
    }
  }
}
