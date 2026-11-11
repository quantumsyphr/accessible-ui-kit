// Fails when the kit grows past its size budget. Run with: npm run size
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

// Gzipped bytes. Raise a budget on purpose, in the same change that needs the room.
const BUDGET = { 'src/index.js': 4600, 'styles/ui.css': 4000 };

const bundle = await build({
  configFile: false,
  logLevel: 'silent',
  build: { write: false, lib: { entry: 'src/index.js', formats: ['es'] } },
});
const script = [bundle].flat()[0].output.find((file) => file.type === 'chunk').code;

const sizes = {
  'src/index.js': gzipSync(script).length,
  'styles/ui.css': gzipSync(readFileSync('styles/ui.css')).length,
};

let over = false;
for (const [file, size] of Object.entries(sizes)) {
  const budget = BUDGET[file];
  const kb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;
  const verdict = size > budget ? 'over budget' : 'ok';
  console.log(`${file.padEnd(14)} ${kb(size).padStart(8)} gzipped   budget ${kb(budget)}   ${verdict}`);
  if (size > budget) over = true;
}
process.exit(over ? 1 : 0);
