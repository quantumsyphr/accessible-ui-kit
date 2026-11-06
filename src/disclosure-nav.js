import { nextIndex } from './internal/keys.js';

/**
 * Site navigation with dropdowns, following the WAI-ARIA disclosure navigation pattern
 * rather than role="menu": links stay links, so screen reader users browse them the way
 * they browse any page.
 *
 * Markup: inside a <nav>, each top-level <button aria-controls> sits next to the list it
 * opens. Without JavaScript every list stays visible.
 */
export class DisclosureNav {
  #buttons = [];

  constructor(nav) {
    this.nav = nav;
    this.#buttons = [...nav.querySelectorAll('button[aria-controls]')];
    for (const button of this.#buttons) this.#set(button, false);
    // Lets the stylesheet turn the nested lists into dropdowns only once they can close.
    nav.setAttribute('data-ui-ready', '');

    nav.addEventListener('click', (event) => {
      const button = event.target.closest('button[aria-controls]');
      if (this.#buttons.includes(button)) this.toggle(button);
    });
    nav.addEventListener('keydown', (event) => this.#onKeydown(event));
    // Watch where focus lands rather than where it leaves: Safari does not focus buttons on
    // click, so a submenu opened with the mouse never had focus inside the nav to lose.
    document.addEventListener('focusin', (event) => {
      if (!nav.contains(event.target)) this.closeAll();
    });
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) this.closeAll();
    });
  }

  toggle(button) {
    const open = button.getAttribute('aria-expanded') !== 'true';
    this.closeAll();
    this.#set(button, open);
  }

  closeAll() {
    for (const button of this.#buttons) this.#set(button, false);
  }

  #set(button, open) {
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
  }

  #onKeydown(event) {
    const button = this.#buttons.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (!button) return;

    if (event.key === 'Escape') {
      // Move focus before hiding the list, so focus never falls back to the page.
      button.focus();
      this.#set(button, false);
      return;
    }

    const links = [...document.getElementById(button.getAttribute('aria-controls')).querySelectorAll('a')];
    if (event.target === button && event.key === 'ArrowDown') {
      event.preventDefault();
      links[0]?.focus();
      return;
    }
    const index = links.indexOf(event.target);
    if (index === -1) return;
    const next = nextIndex(event.key, index, links.length, { previous: 'ArrowUp', next: 'ArrowDown' });
    if (next === -1) return;
    event.preventDefault();
    links[next].focus();
  }
}
