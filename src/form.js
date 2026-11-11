import { uid } from './internal/uid.js';

/**
 * Form validation messages on top of the browser's own constraint validation.
 *
 * The markup is a plain form with required, type and pattern attributes, so without this
 * script the browser validates it. With it, a failed submit lists every problem in a
 * summary that takes focus and links to each field, and each message sits beside its field
 * and is announced with it through aria-describedby. Nothing is flagged before the first
 * submit; after that a message clears as soon as its field is fixed.
 *
 * Wrap each control and its label in [data-field] so the message has a place to go, and
 * put the wording in data-error on the control. Without data-error the browser's own
 * message is used.
 */
export class Form {
  #problems = new Map();
  #summary = null;
  #list = null;

  constructor(form) {
    this.form = form;
    form.noValidate = true;
    form.addEventListener('submit', (event) => this.#submit(event));
    form.addEventListener('input', (event) => this.#recheck(event.target));
    form.addEventListener('change', (event) => this.#recheck(event.target));
  }

  /** Every control the browser validates, with a radio group counted once. */
  #controls() {
    const groups = new Set();
    return [...this.form.elements].filter((control) => {
      if (!control.willValidate) return false;
      if (control.type !== 'radio') return true;
      if (groups.has(control.name)) return false;
      groups.add(control.name);
      return true;
    });
  }

  #group(control) {
    if (control.type !== 'radio') return [control];
    return [...this.form.elements].filter((el) => el.type === 'radio' && el.name === control.name);
  }

  #submit(event) {
    for (const control of this.#controls()) this.#check(control);
    if (this.#problems.size === 0) return;
    event.preventDefault();
    this.#renderSummary();
    this.#summary.focus();
  }

  #recheck(target) {
    const control = this.#group(target)[0];
    if (!this.#problems.has(control)) return;
    this.#check(control);
    this.#renderSummary();
  }

  #check(control) {
    const field = control.closest('[data-field]') ?? control.parentElement;
    const group = this.#group(control);
    // Looked up by id, not by position: a control with no [data-field] of its own (the submit
    // button, say) must not pick up another field's message.
    let error = control.id ? document.getElementById(`${control.id}-error`) : null;

    if (control.validity.valid) {
      if (error) {
        for (const el of group) removeToken(el, 'aria-describedby', error.id);
        error.remove();
      }
      control.removeAttribute('aria-invalid');
      this.#problems.delete(control);
      return;
    }

    const message = control.dataset.error || control.validationMessage;
    if (!control.id) control.id = uid('field');
    if (!error) {
      error = document.createElement('p');
      error.id = `${control.id}-error`;
      error.setAttribute('data-field-error', '');
      field.append(error);
      for (const el of group) addToken(el, 'aria-describedby', error.id);
    }
    const prefix = document.createElement('span');
    prefix.className = 'visually-hidden';
    prefix.textContent = `${this.form.dataset.errorPrefix ?? 'Error'}: `;
    error.replaceChildren(prefix, message);
    // aria-invalid is not allowed on a radio button; the group's message carries it.
    if (control.type !== 'radio') control.setAttribute('aria-invalid', 'true');
    this.#problems.set(control, message);
  }

  #renderSummary() {
    if (this.#problems.size === 0) {
      this.#summary?.remove();
      return;
    }
    if (!this.#summary) this.#buildSummary();
    const items = this.#controls()
      .filter((control) => this.#problems.has(control))
      .map((control) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${control.id}`;
        link.textContent = this.#problems.get(control);
        item.append(link);
        return item;
      });
    this.#list.replaceChildren(...items);
    if (!this.#summary.isConnected) this.form.prepend(this.#summary);
  }

  #buildSummary() {
    const summary = document.createElement('div');
    const title = document.createElement('p');
    title.id = uid('form-summary');
    title.textContent = this.form.dataset.summaryTitle ?? 'There is a problem';
    this.#list = document.createElement('ul');
    summary.setAttribute('data-form-summary', '');
    summary.setAttribute('role', 'group');
    summary.setAttribute('aria-labelledby', title.id);
    summary.tabIndex = -1;
    summary.append(title, this.#list);
    summary.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;
      event.preventDefault();
      document.getElementById(link.hash.slice(1))?.focus();
    });
    this.#summary = summary;
  }
}

function addToken(element, attribute, token) {
  const tokens = (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean);
  if (!tokens.includes(token)) tokens.push(token);
  element.setAttribute(attribute, tokens.join(' '));
}

function removeToken(element, attribute, token) {
  const tokens = (element.getAttribute(attribute) ?? '').split(/\s+/).filter((t) => t && t !== token);
  if (tokens.length) element.setAttribute(attribute, tokens.join(' '));
  else element.removeAttribute(attribute);
}
