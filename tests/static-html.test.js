import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { build, createServer } from 'vite';

test('production HTML contains the shell and both pages before JavaScript runs', async () => {
  const result = await build({
    logLevel: 'silent',
    build: { write: false },
  });
  const outputs = Array.isArray(result) ? result : [result];
  const html = outputs
    .flatMap(output => output.output)
    .find(file => file.fileName === 'index.html');

  assert.ok(html && html.type === 'asset');
  const source = String(html.source);
  assert.match(source, /<header class="site-header">/);
  assert.match(source, /Find your next activity\./);
  assert.match(source, /Favorites\./);
  assert.match(source, /data-page="\/favorites"\s+hidden/);
  assert.match(source, /\/your-energy\/favicon\.svg/);
  assert.doesNotMatch(source, /<load\b|\{=\$|data-brand-icon/);
});

test('shared partials expand static arguments and nested icon includes', async () => {
  const server = await createServer({
    logLevel: 'silent',
    server: { middlewareMode: true, hmr: false, watch: null },
  });

  try {
    const html = await server.transformIndexHtml(
      '/index.html',
      `<load src="components/button/button.html" type="submit" variant="outline" label="Search" />
       <load src="components/search-field/search-field.html" id="activities" label="Activities" placeholder="Search activities" />`
    );
    assert.match(html, /ui-button--outline/);
    assert.match(html, /type="submit"/);
    assert.match(html, /for="activities"/);
    assert.match(html, /id="activities"/);
    assert.match(html, /aria-label="Clear Activities"/);
    assert.match(html, /clear-search\.svg/);
    assert.doesNotMatch(html, /<load\b|\{=\$/);
  } finally {
    await server.close();
  }
});

test('feature TypeScript enhances HTML instead of generating it', () => {
  for (const directory of ['components', 'pages']) {
    const root = new URL(`../src/${directory}/`, import.meta.url);
    for (const feature of readdirSync(root)) {
      const source = readFileSync(
        new URL(`${feature}/${feature}.ts`, root),
        'utf8'
      );
      assert.doesNotMatch(
        source,
        /\?raw|innerHTML|createContextualFragment|replaceChildren|createElement/,
        feature
      );
    }
  }
});
