import { Dialog } from './dialog.js';
import { uid } from './internal/uid.js';

/**
 * A navigation list that becomes a slide-in menu behind a button.
 *
 * Without this script the links sit on the page and the button, which ships with the
 * hidden attribute, stays hidden. With it, the list moves into a native modal <dialog>, so
 * the page behind goes inert, Escape and a click outside close it, and focus returns to
 * the button. Following a link closes it too.
 *
 * Set data-media to a media query to be a drawer only while it matches, for example
 * data-media="(max-width: 48rem)"; the rest of the time the links stay where they were
 * written.
 */
export class Drawer {
  constructor(nav) {
    const opener = nav.id && document.querySelector(`[data-drawer-open="${CSS.escape(nav.id)}"]`);
    if (!opener) return;

    const panel = document.createElement('dialog');
    panel.id = uid('drawer-panel');
    panel.setAttribute('data-drawer-panel', '');
    panel.setAttribute('closedby', 'any');
    panel.setAttribute('aria-label', nav.getAttribute('aria-label') ?? opener.textContent.trim());

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = nav.dataset.closeLabel ?? 'Close';
    close.setAttribute('commandfor', panel.id);
    close.setAttribute('command', 'close');
    panel.append(close);
    document.body.append(panel);

    opener.setAttribute('commandfor', panel.id);
    opener.setAttribute('command', 'show-modal');
    new Dialog(panel);

    nav.addEventListener('click', (event) => {
      if (panel.open && event.target.closest('a')) panel.close();
    });

    const home = document.createComment('drawer');
    nav.before(home);
    const media = window.matchMedia(nav.dataset.media || 'all');
    const place = () => {
      if (media.matches) {
        panel.append(nav);
        opener.hidden = false;
      } else {
        if (panel.open) panel.close();
        home.after(nav);
        opener.hidden = true;
      }
    };
    media.addEventListener('change', place);
    place();
  }
}
