# 4. Keep focus in the combobox input, and upgrade from a datalist

Status: accepted

## Context

Many autocomplete widgets move real focus into the suggestion list, which pulls the user out
of the text field and interrupts typing. A native datalist works without any script, but its
styling and screen reader announcements vary between browsers.

## Decision

Start from `<input list>` with a `<datalist>`, so suggestions work without JavaScript. Once
enhanced, the input becomes `role="combobox"`, matches render into a `role="listbox"`, and
the highlighted option is exposed through `aria-activedescendant` while focus stays in the
input. A polite status region announces how many results are available. Matching is by the
start of any word ("wo" finds "Fort Worth"), which suits place and product names better than
plain substring matching.

## Consequences

- Typing is never interrupted. Arrow keys, Enter, and Escape follow the WAI-ARIA combobox
  pattern.
- The list cancels `mousedown`, so pressing an option does not blur the input and close the
  list before the click lands.
- Escape only claims the key when there is something to undo (an open list, then text to
  clear), leaving it free for a surrounding component such as a dialog.
- Picking an option fires `change` and a `ui:select` event with the value, so pages can react
  without reaching into the component.
