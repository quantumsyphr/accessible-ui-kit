let count = 0;

export function uid(prefix) {
  count += 1;
  return `ui-${prefix}-${count}`;
}
