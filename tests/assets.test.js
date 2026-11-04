import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../src/images/', import.meta.url);
const source = readFileSync(new URL('index.ts', root), 'utf8');
const imports = [
  ...source.matchAll(/from '\.\/((?:icons|photos)\/[^']+)'/g),
].map(match => match[1]);

test('named asset imports exist and cover the retained files', () => {
  const files = ['icons', 'photos'].flatMap(directory =>
    readdirSync(new URL(`${directory}/`, root)).map(
      file => `${directory}/${file}`
    )
  );
  assert.deepEqual([...imports].sort(), files.sort());
  for (const file of imports) {
    assert.ok(readFileSync(new URL(file, root)).length > 0, file);
  }
});

test('icons are standalone SVGs with intrinsic dimensions', () => {
  for (const file of imports.filter(path => path.endsWith('.svg'))) {
    const svg = readFileSync(new URL(file, root), 'utf8');
    const tag = svg.match(/<svg\b[^>]*>/)?.[0];
    assert.ok(tag, file);
    assert.ok(Number(tag.match(/\bwidth="([^"]+)"/)?.[1]) > 0, file);
    assert.ok(Number(tag.match(/\bheight="([^"]+)"/)?.[1]) > 0, file);
    assert.doesNotMatch(svg, /<script\b|(?:href|src)="https?:/i, file);
  }
});

test('favicon matches the shared design asset', () => {
  assert.deepEqual(
    readFileSync(new URL('../public/favicon.svg', import.meta.url)),
    readFileSync(new URL('icons/favicon.svg', root))
  );
});
