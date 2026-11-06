# 3. Build site navigation from disclosure buttons, not an ARIA menu

Status: accepted

## Context

`role="menu"` turns links into menu items, changes how screen readers browse them, and
commits the page to application-style keyboard handling that site visitors do not expect.

## Decision

Follow the WAI-ARIA disclosure navigation pattern. Each top-level item is a button with
`aria-expanded` that shows a plain list of links. Escape closes the list and returns focus
to its button, arrow keys move through an open list, and a list closes when focus or a click
lands anywhere outside the navigation.

## Consequences

- Links stay links: screen reader users can list them, and opening in a new tab works.
- Closing is driven by watching where focus lands (`focusin` on the document) rather than
  focus leaving the nav. Safari does not focus buttons on click, so a submenu opened with
  the mouse never had focus inside the nav to lose. Watching where focus arrives works in
  every engine. This was found by the WebKit run of the tests.
