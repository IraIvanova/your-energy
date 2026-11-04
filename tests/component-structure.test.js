import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import test from 'node:test';

const sourceRoot = new URL('../src/', import.meta.url);
const featureFolders = ['pages/', 'components/'];

test('each page and component folder contains matching TS, HTML, and CSS', () => {
  for (const featureFolder of featureFolders) {
    const root = new URL(featureFolder, sourceRoot);
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      assert.ok(
        entry.isDirectory(),
        `${featureFolder}${entry.name} must be a folder`
      );

      const featureFiles = readdirSync(new URL(`${entry.name}/`, root));
      for (const extension of ['ts', 'html', 'css']) {
        assert.ok(
          featureFiles.includes(`${entry.name}.${extension}`),
          `${featureFolder}${entry.name} must include ${entry.name}.${extension}`
        );
      }
    }
  }
});
