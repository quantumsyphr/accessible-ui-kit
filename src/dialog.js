const supportsClosedBy = 'closedBy' in HTMLDialogElement.prototype;

/**
 * Modal dialog on the native <dialog> element.
 *
 * The platform does nearly all of the work: buttons with commandfor/command open and close
 * it, showModal() makes the rest of the page inert and returns focus on close, Escape
 * closes it, and closedby="any" closes it on a backdrop click. The page behind stops
 * scrolling through CSS. This script fills two gaps: Safari does not focus a button when
 * it is clicked, so there is nothing for focus to return to, and older browsers lack
 * closedby.
 */
export class Dialog {
  #opener = null;

  constructor(dialog) {
    this.dialog = dialog;
    dialog.addEventListener('command', (event) => {
      if (event.command === 'show-modal') this.#opener = event.source;
    });
    dialog.addEventListener('close', () => this.#returnFocus());
    if (!supportsClosedBy && dialog.getAttribute('closedby') === 'any') {
      dialog.addEventListener('click', (event) => this.#closeOnBackdrop(event));
    }
  }

  #returnFocus() {
    const opener = this.#opener;
    this.#opener = null;
    const active = document.activeElement;
    // Safari can still be focused inside the closed dialog here, before it drops focus to the page.
    const focusWasLost = !active || active === document.body || this.dialog.contains(active);
    if (opener?.isConnected && focusWasLost) opener.focus();
  }

  #closeOnBackdrop(event) {
    // Backdrop clicks target the dialog itself but land outside its box.
    if (event.target !== this.dialog) return;
    const box = this.dialog.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (inside) return;
    if (typeof this.dialog.requestClose === 'function') this.dialog.requestClose();
    else this.dialog.close();
  }
}
