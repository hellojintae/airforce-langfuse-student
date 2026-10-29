import { existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
if (!existsSync('.env')) copyFileSync('.env.example','.env');
console.log('준비 끝. cd lab && pnpm lab 1\n학생 환경: docs/SETUP.md에 따라 Codespaces Secrets와 .env를 설정하세요. 기존 .env는 유지합니다. Docker 설치는 필요하지 않습니다.');
