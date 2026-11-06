/**
 * Returns the index focus should move to for a navigation key, wrapping at both ends,
 * or -1 when the key does not navigate.
 *
 * @param {string} key KeyboardEvent.key
 * @param {number} current index that has focus now
 * @param {number} length number of items
 * @param {{ previous: string, next: string }} axis keys that move backward and forward
 */
export function nextIndex(key, current, length, { previous, next }) {
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === previous) return (current - 1 + length) % length;
  if (key === next) return (current + 1) % length;
  return -1;
}
