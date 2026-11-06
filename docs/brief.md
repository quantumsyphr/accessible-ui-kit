# Brief

## Problem

Plenty of component libraries ship widgets that look accessible and fall apart under a
keyboard, a screen reader, or a script that fails to load. The same bugs show up in review
again and again: focus that vanishes when a dialog closes, site menus built with
`role="menu"` that stop behaving like links, autocomplete fields that steal focus mid-typing.

## Goal

Five common components built properly, each small enough to read in a few minutes, with
tests that prove the behavior in every major browser engine.

## Audience

- Developers who want framework-free patterns they can read and copy.
- Teams evaluating front-end judgment: semantics, keyboard support, progressive
  enhancement, and testing discipline.

## Scope

In: accordion, tabs, modal dialog, combobox, disclosure navigation. Light and dark color
schemes, reduced motion, forced colors (Windows high contrast), and behavior without
JavaScript.

Out: framework wrappers, an npm package, a theming system beyond CSS custom properties, and
components that need a positioning engine (tooltips, floating popovers).

## Success criteria

- Every keyboard interaction listed on the demo page has an automated test.
- Zero axe-core WCAG 2.2 AA violations in every tested state, in Chromium, Firefox, and WebKit.
- Every component stays readable or usable without JavaScript.
- Zero runtime dependencies and no build step required to use the components.
