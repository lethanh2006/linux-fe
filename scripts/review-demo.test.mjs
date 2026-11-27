import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const markdown = readFileSync(new URL('../content/review/demo.md', import.meta.url), 'utf8');
const setup = markdown.match(/```bash\n([\s\S]*?)```/)?.[1];
assert.ok(setup, 'The demonstration must include its copyable setup block');

const failures = [
  ['mktemp', 'mktemp() { return 1; }'],
  ['cd', 'mktemp() { printf "%s\\n" "$DEMO_FIXTURE_DIR"; }; cd() { return 1; }'],
  ['mkdir', 'mktemp() { printf "%s\\n" "$DEMO_FIXTURE_DIR"; }; mkdir() { return 1; }'],
];

for (const [operation, prefix] of failures) {
  test(`copyable setup preserves existing files when ${operation} fails`, (t) => {
    const fixture = mkdtempSync(path.join(tmpdir(), 'hoc-linux-setup-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    const data = path.join(fixture, 'du-an/data');
    mkdirSync(data, { recursive: true });
    writeFileSync(path.join(data, 'dich-vu.txt'), 'existing services\n');
    writeFileSync(path.join(data, 'app.log'), 'existing log\n');
    const result = spawnSync('bash', ['-c', `${prefix}\n${setup}`], {
      cwd: fixture,
      env: { ...process.env, DEMO_FIXTURE_DIR: fixture },
      encoding: 'utf8',
    });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0, 'Setup failure must stay visible to the learner');
    assert.equal(readFileSync(path.join(data, 'dich-vu.txt'), 'utf8'), 'existing services\n');
    assert.equal(readFileSync(path.join(data, 'app.log'), 'utf8'), 'existing log\n');
  });
}
