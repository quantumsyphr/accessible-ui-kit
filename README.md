# Accessible UI Kit

[![CI](https://github.com/quantumsyphr/accessible-ui-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/quantumsyphr/accessible-ui-kit/actions/workflows/ci.yml)

Eight accessible interface components in plain JavaScript: accordion, tabs, modal dialog,
combobox, disclosure navigation, form validation, carousel, and menu drawer. Each one starts as ordinary HTML that works without
scripts, then follows the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
once the script runs. No framework, no runtime dependencies, no build step needed to use them.

**Live demo: [accessible-ui-kit.netlify.app](https://accessible-ui-kit.netlify.app)**

All eight components together come to about 4.3 kB of gzipped JavaScript. The demo has a
JavaScript on and off switch, so you can use every component as the plain HTML it starts as.

## Components

| Component | Starts as | Pattern | Source |
|---|---|---|---|
| Accordion | Headings followed by panels | [Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) | [`src/accordion.js`](src/accordion.js) |
| Tabs | Sections, each with a heading | [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), automatic activation | [`src/tabs.js`](src/tabs.js) |
| Dialog | A native `<dialog>` and invoker buttons | Native modal dialog | [`src/dialog.js`](src/dialog.js) |
| Combobox | An `<input>` with a `<datalist>` | [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with list autocomplete | [`src/combobox.js`](src/combobox.js) |
| Navigation | A `<nav>` of buttons and link lists | [Disclosure navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) | [`src/disclosure-nav.js`](src/disclosure-nav.js) |
| Form | A `<form>` with `required`, `type`, and `pattern` | Error summary and inline messages on native validation | [`src/form.js`](src/form.js) |
| Carousel | A scroll-snap strip in a labelled region | Scrolling region with Previous and Next buttons | [`src/carousel.js`](src/carousel.js) |
| Drawer | A `<nav>` of links | Native modal dialog | [`src/drawer.js`](src/drawer.js) |

Details that are easy to miss:

- Collapsed accordion panels use `hidden="until-found"`, so find in page still reaches them.
- Only the selected tab sits in the tab order; arrow keys move between tabs.
- The dialog opens, traps focus, and closes on Escape or a backdrop click with no script.
  The script returns focus to the opening button where Safari would otherwise lose it.
- The combobox keeps focus in the input and exposes the highlighted option with
  `aria-activedescendant`, with a live region announcing the number of results.
- Navigation submenus close when focus or a click lands anywhere else, and Escape returns
  focus to the button that opened them.
- A failed form submit moves focus to a summary that links to each field. Each message is
  tied to its field with `aria-describedby` and clears as soon as the field is fixed.
- The carousel never moves on its own. At either end a button is marked `aria-disabled`
  instead of `disabled`, so it keeps keyboard focus.
- The drawer is a native modal dialog, so the page behind goes inert, Escape and a click
  outside close it, and focus returns to the menu button.
- Styles cover light and dark color schemes, reduced motion, and Windows high contrast.

## Usage

```html
<link rel="stylesheet" href="styles/ui.css" />

<script type="module">
  import { init } from './src/index.js';
  init();
</script>
```

`init()` enhances every element with a `data-ui` attribute once and returns the new
instances. Each component class is also exported for direct use.

Every color, font, and corner radius is a `--ui-*` custom property in `styles/ui.css`. The
default theme uses Montserrat when the page loads it and falls back to system fonts otherwise,
so nothing has to be downloaded. Light and dark follow the system setting, and
`data-ui-ground="dark"` on any element keeps the components inside it dark in both.

### Accordion

```html
<div data-ui="accordion">
  <h3 data-accordion-heading>How fast do orders ship?</h3>
  <div data-accordion-panel><p>Same business day before 2 p.m.</p></div>
  <h3 data-accordion-heading>Can I return something?</h3>
  <div data-accordion-panel><p>Within 30 days.</p></div>
</div>
```

Add `data-single` to keep at most one panel open.

### Tabs

```html
<div data-ui="tabs" data-label="Product details">
  <section data-tab-panel><h3>Overview</h3><p>...</p></section>
  <section data-tab-panel><h3>Specs</h3><p>...</p></section>
</div>
```

### Dialog

```html
<button type="button" commandfor="size-guide" command="show-modal">Size guide</button>

<dialog id="size-guide" data-ui="dialog" closedby="any" aria-labelledby="size-guide-title">
  <h2 id="size-guide-title">Size guide</h2>
  <p>...</p>
  <button type="button" commandfor="size-guide" command="close">Close</button>
</dialog>
```

### Combobox

```html
<div data-ui="combobox">
  <label for="city">Find a store near you</label>
  <input id="city" list="cities" autocomplete="off" />
  <datalist id="cities">
    <option value="Dallas"></option>
    <option value="Fort Worth"></option>
  </datalist>
</div>
```

Picking an option fires `change` and a `ui:select` event whose `detail.value` is the choice.

### Navigation

```html
<nav data-ui="disclosure-nav" aria-label="Main">
  <ul>
    <li><a href="/" aria-current="page">Home</a></li>
    <li>
      <button type="button" aria-controls="nav-shop">Shop</button>
      <ul id="nav-shop">
        <li><a href="/packs">Packs</a></li>
        <li><a href="/bags">Bags</a></li>
      </ul>
    </li>
  </ul>
</nav>
```

### Form

```html
<form data-ui="form" action="/notify" method="post">
  <div data-field>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required
      data-error="Enter an email address, like name@example.com" />
  </div>
  <div data-field>
    <label for="size">Size</label>
    <select id="size" name="size" required data-error="Choose a size">
      <option value="">Select a size</option>
      <option value="s">Small</option>
    </select>
  </div>
  <button type="submit">Notify me</button>
</form>
```

Wrap each control and its label in `data-field`. `data-error` sets the wording; without it
the browser's own message is used.

### Carousel

```html
<div data-ui="carousel">
  <div data-carousel-viewport role="region" aria-label="Colors" tabindex="0">
    <ul role="list">
      <li>...</li>
      <li>...</li>
    </ul>
  </div>
</div>
```

### Drawer

```html
<button type="button" data-drawer-open="shop-menu" hidden>Menu</button>

<nav id="shop-menu" data-ui="drawer" aria-label="Shop">
  <ul>
    <li><a href="/packs">Packs</a></li>
    <li><a href="/bags">Bags</a></li>
  </ul>
</nav>
```

Add `data-media="(max-width: 48rem)"` to be a drawer only on small screens.

## Testing

```bash
npm install
npx playwright install
npm test
npm run lint
npm run size
```

- Playwright runs every spec in Chromium, Firefox, and WebKit: keyboard interaction, focus
  movement, ARIA state, and behavior with JavaScript turned off.
- axe-core checks each component against WCAG 2.2 AA rules in its collapsed and expanded
  states, and the demo page in light and dark mode.
- A fourth run uses Firefox with dialog light dismiss switched off. It is the only way to
  exercise the fallback for browsers without `closedby`, and turning the fallback off makes it fail.
- The demo page is tested twice, with its scripts on and with them off.
- `npm run size` fails when the kit passes its budget: 4.6 kB of gzipped JavaScript and
  4.0 kB of gzipped CSS.
- GitHub Actions runs lint, the size budget, and the full suite on every push.

Two real Safari bugs were caught this way, both covered in the decision records.

Screen reader passes with NVDA and VoiceOver are still on the
[launch checklist](docs/launch-checklist.md); automated checks do not replace them.

## Browser support

Current Chrome, Edge, Firefox, and Safari. Dialog buttons use invoker commands
(`commandfor` and `command`), which every current engine supports. In older browsers those
buttons do nothing, so sites that must support them should add a click handler that calls
`showModal()`. [Decision 2](docs/decisions/0002-native-dialog.md) explains the tradeoff.

## Project docs

- [Brief](docs/brief.md): the problem, scope, and success criteria
- [Decision records](docs/decisions/): why each pattern was chosen
- [Launch checklist](docs/launch-checklist.md): what is verified and what is still manual

## About

Built by [Peter Tillman-Young](https://ptyportfolio.com) with Claude Code as a
pair programmer. MIT license. The store content in the demo is fictional.
