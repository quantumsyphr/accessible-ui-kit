import { Accordion } from './accordion.js';
import { Combobox } from './combobox.js';
import { Dialog } from './dialog.js';
import { DisclosureNav } from './disclosure-nav.js';
import { Tabs } from './tabs.js';

export { Accordion, Combobox, Dialog, DisclosureNav, Tabs };

const components = {
  accordion: Accordion,
  combobox: Combobox,
  dialog: Dialog,
  'disclosure-nav': DisclosureNav,
  tabs: Tabs,
};

const enhanced = new WeakSet();

/**
 * Enhances every [data-ui] element under root that has not been enhanced yet and returns
 * the new component instances. Safe to call again after adding markup.
 */
export function init(root = document) {
  const instances = [];
  for (const element of root.querySelectorAll('[data-ui]')) {
    const Component = components[element.dataset.ui];
    if (!Component || enhanced.has(element)) continue;
    enhanced.add(element);
    instances.push(new Component(element));
  }
  return instances;
}
