# 1. Enhance plain HTML instead of rendering components from JavaScript

Status: accepted

## Context

Components can be rendered entirely by script (a framework, or custom elements with shadow
DOM), or upgraded from markup that already exists on the page.

## Decision

Each component is first written as ordinary HTML that is useful on its own: headings and
paragraphs for the accordion, sections for tabs, an input with a datalist for the combobox,
nested lists of links for navigation. The script reads that markup and adds roles, states,
and keyboard behavior. Components are plain classes; `init()` finds them through `data-ui`
attributes and enhances each element once.

## Consequences

- Content lives in the HTML, so it is indexable and survives a failed script. Every spec
  file includes a "without JavaScript" case that checks this.
- No shadow DOM: page styles apply normally, and nothing is hidden from find in page or
  browser extensions.
- Authors write slightly more structured markup, and the scripts skip elements that do not
  match the expected structure instead of throwing.
- Custom elements were considered. They add lifecycle and styling questions without giving
  these five components any behavior they need.
