# 2. Use the native dialog element and invoker commands

Status: accepted

## Context

A hand-built modal needs a focus trap, an inert background, Escape handling, focus return,
and scroll locking. Each one is a classic source of bugs.

## Decision

Use `<dialog>` as a modal, opened and closed by buttons with `commandfor` and `command`
attributes, closed on a backdrop click with `closedby="any"`, with background scrolling
stopped by a CSS rule on `html:has(dialog:modal)`. The script only fills real gaps:

- Safari does not focus a button when it is clicked, so after the dialog closed, focus had
  nothing to return to and fell back to the page. The script records the opening button
  from the dialog's `command` event and restores focus to it when focus was lost. This was
  found by the WebKit run of the tests.
- Browsers that predate `closedby` get a click handler that closes the dialog when a click
  lands outside its box.

## Consequences

- In current browsers the dialog opens, traps focus, and closes without any script.
- Every current engine supports `closedby`, so normal CI can never reach the fallback. A
  fourth Playwright project runs Firefox with `dom.dialog.light-dismiss.enabled` switched
  off; turning the fallback off makes that project fail, which proves the test covers it.
- Buttons using `commandfor` do nothing in browsers without invoker commands, and no engine
  allows that feature to be switched off, so a fallback for it would ship untested. Sites
  that must support older browsers should add a click handler that calls `showModal()`.
  This is the main tradeoff in the kit.
