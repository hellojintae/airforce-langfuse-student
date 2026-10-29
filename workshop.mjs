import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// One command surface for PowerShell, CMD, macOS and Linux. No shell expansion.
process.chdir(fileURLToPath(new URL('.', import.meta.url)));
const [action = 'help', ...args] = process.argv.slice(2);
const node = process.execPath;
const commands = {
  setup: [node, ['scripts/setup.mjs']],
  lesson: [node, ['scripts/lesson.mjs']],
  preflight: [node, ['scripts/preflight.mjs']],
  check: [node, ['node_modules/typescript/bin/tsc', '--noEmit']],
  test: [node, ['--import', 'tsx', '--test', 'src/lab.test.ts', 'src/live.test.ts', 'scripts/environment.test.mjs', 'scripts/lab.test.mjs']],
  review: [node, ['--import','tsx','src/review.ts']],
  ...Object.fromEntries(['demo','compare'].map(name =>
    [name, [node, ['--import','tsx','src/main.ts',name]]])),
};
if (action === 'help') {
  console.log('Windows / macOS: node workshop.mjs <command> [arguments]\n'+Object.keys(commands).join(' | '));
} else if (!Object.hasOwn(commands, action)) {
  console.error('Unknown command. Run: node workshop.mjs help');
  process.exitCode = 1;
} else {
  const [command, fixed] = commands[action];
  const result = spawnSync(command, [...fixed, ...args], { stdio:'inherit', shell:false });
  if (result.error) console.error(`Cannot start ${command}: ${result.error.code}`);
  process.exitCode = result.status ?? 1;
}
