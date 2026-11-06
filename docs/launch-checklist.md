# Launch checklist

## Automated, on every push

- [x] Keyboard and focus specs in Chromium, Firefox, and WebKit
- [x] axe-core WCAG 2.2 AA checks for every component state tested
- [x] Behavior without JavaScript for every component
- [x] Dialog `closedby` fallback exercised in Firefox with the feature switched off
- [x] Demo page clean in light and dark mode, no sideways scroll at 375 px
- [x] ESLint clean

## Manual, still to do

Automated checks catch structural problems, not whether the experience is actually good.
These need a person.

- [ ] NVDA with Firefox on Windows: every component announces its name, role, and state
- [ ] VoiceOver with Safari on macOS and iOS
- [ ] Windows high contrast: the selected tab and highlighted option stay visible
- [ ] Browser zoom at 200% and 400%: nothing lost or overlapping
- [ ] Find in page reveals collapsed accordion text in Chrome and Firefox

## Release

- [x] MIT license
- [x] Continuous integration on GitHub Actions
- [x] Demo deployed to Netlify (accessible-ui-kit.netlify.app)
