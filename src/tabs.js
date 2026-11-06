import { nextIndex } from './internal/keys.js';
import { uid } from './internal/uid.js';

/**
 * Tabs built from plain sections, following the WAI-ARIA tabs pattern with automatic
 * activation.
 *
 * Markup: [data-tab-panel] sections inside the root, each starting with a heading that
 * becomes its tab label. data-label on the root names the tab list. Without JavaScript the
 * sections simply stack with their headings.
 */
export class Tabs {
  #tabs = [];
  #panels = [];

  constructor(root) {
    this.root = root;
    const tablist = document.createElement('div');
    tablist.setAttribute('role', 'tablist');
    if (root.dataset.label) tablist.setAttribute('aria-label', root.dataset.label);

    for (const panel of root.querySelectorAll(':scope > [data-tab-panel]')) {
      tablist.append(this.#enhance(panel));
    }
    root.prepend(tablist);

    tablist.addEventListener('click', (event) => {
      const index = this.#tabs.indexOf(event.target.closest('[role="tab"]'));
      if (index !== -1) this.select(index);
    });
    tablist.addEventListener('keydown', (event) => this.#onKeydown(event));
    this.select(0);
  }

  select(index) {
    this.#tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      this.#panels[i].hidden = !selected;
    });
  }

  #enhance(panel) {
    const heading = panel.querySelector(':scope > :is(h2, h3, h4, h5, h6)');
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = uid('tab');
    tab.setAttribute('role', 'tab');
    tab.textContent = heading?.textContent.trim() ?? '';

    panel.id ||= uid('tab-panel');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    // The tab names the panel now, so the heading would only repeat it.
    if (heading) heading.hidden = true;

    this.#tabs.push(tab);
    this.#panels.push(panel);
    return tab;
  }

  #onKeydown(event) {
    const index = this.#tabs.indexOf(event.target);
    if (index === -1) return;
    const next = nextIndex(event.key, index, this.#tabs.length, { previous: 'ArrowLeft', next: 'ArrowRight' });
    if (next === -1) return;
    event.preventDefault();
    this.select(next);
    this.#tabs[next].focus();
  }
}
