import { uid } from './internal/uid.js';

/**
 * Previous and Next buttons for a scroll-snap strip.
 *
 * The strip itself is CSS: a focusable, labelled region that scrolls sideways and snaps to
 * each item, so touch, trackpad, mouse wheel and arrow keys all work with no script. This
 * adds the two buttons. At either end a button is marked aria-disabled instead of
 * disabled, so it keeps keyboard focus when it runs out of items. Nothing moves on its own.
 */
export class Carousel {
  constructor(root) {
    const viewport = root.querySelector('[data-carousel-viewport]');
    if (!viewport) return;
    this.viewport = viewport;
    if (!viewport.id) viewport.id = uid('carousel');

    this.previous = this.#button(root.dataset.prevLabel ?? 'Previous', -1);
    this.next = this.#button(root.dataset.nextLabel ?? 'Next', 1);
    const controls = document.createElement('div');
    controls.setAttribute('data-carousel-controls', '');
    controls.append(this.previous, this.next);
    root.prepend(controls);

    viewport.addEventListener('scroll', () => this.#update(), { passive: true });
    new ResizeObserver(() => this.#update()).observe(viewport);
    this.#update();
  }

  #button(label, direction) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('aria-controls', this.viewport.id);
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-disabled') !== 'true') this.#step(direction);
    });
    return button;
  }

  /** Distance from the strip's starting edge to each item's, in either writing direction. */
  #offsets() {
    const rtl = getComputedStyle(this.viewport).direction === 'rtl';
    const edge = this.viewport.getBoundingClientRect();
    return [...this.viewport.querySelectorAll(':scope > ul > li, :scope > ol > li')].map((item) => {
      const box = item.getBoundingClientRect();
      return rtl ? box.right - edge.right : box.left - edge.left;
    });
  }

  #step(direction) {
    const offsets = this.#offsets();
    if (offsets.length === 0) return;
    let current = 0;
    offsets.forEach((offset, index) => {
      if (Math.abs(offset) < Math.abs(offsets[current])) current = index;
    });
    const target = Math.min(Math.max(current + direction, 0), offsets.length - 1);
    this.viewport.scrollBy({ left: offsets[target] });
  }

  #update() {
    const left = Math.abs(this.viewport.scrollLeft);
    const max = this.viewport.scrollWidth - this.viewport.clientWidth;
    setUnavailable(this.previous, left <= 1);
    setUnavailable(this.next, left >= max - 1);
  }
}

function setUnavailable(button, unavailable) {
  if (unavailable) button.setAttribute('aria-disabled', 'true');
  else button.removeAttribute('aria-disabled');
}
