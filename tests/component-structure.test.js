import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import test from 'node:test';

const sourceRoot = new URL('../src/', import.meta.url);
const featureFolders = ['pages/', 'components/'];

test('project paths use lowercase ASCII names without spaces', () => {
  const projectRoot = new URL('../', import.meta.url);
  if (existsSync(new URL('.git', projectRoot))) {
    const files = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: projectRoot, encoding: 'utf8' }
    )
      .split('\0')
      .filter(Boolean);

    for (const file of files) {
      assert.match(file, /^[a-z0-9._/-]+$/, file);
    }
    return;
  }

  const excluded = new Set([
    '.git',
    'node_modules',
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    '.playwright-cli',
    '.DS_Store',
  ]);

  function checkDirectory(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      assert.match(entry.name, /^[a-z0-9._-]+$/, entry.name);
      if (entry.isDirectory()) {
        checkDirectory(new URL(`${entry.name}/`, directory));
      }
    }
  }

  checkDirectory(projectRoot);
});

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
