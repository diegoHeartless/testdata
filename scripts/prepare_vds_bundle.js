#!/usr/bin/env node
/**
 * prepare_vds_bundle.js
 *
 * Собирает минимальный набор файлов для деплоя backend на VDS
 * в указанную директорию (по умолчанию ./vds_bundle).
 *
 * Пример:
 *   node scripts/prepare_vds_bundle.js ./build/vds
 */

const fs = require('fs/promises');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_TARGET = path.join(ROOT, 'synthetic-id');

const ITEMS_TO_COPY = [
  { source: 'backend', destination: 'backend' },
  { source: 'frontend', destination: 'frontend' },
  { source: 'scripts/provision_vds.sh', destination: 'scripts/provision_vds.sh' },
  { source: 'docs/ARCHITECTURE.md', destination: 'docs/ARCHITECTURE.md' },
  { source: 'docs/PROJECT_PLAN.md', destination: 'docs/PROJECT_PLAN.md' },
  { source: 'README.md', destination: 'README.md' },
];

const IGNORE_NAMES = new Set([
  'node_modules',
  '.turbo',
  '.cache',
  '.git',
  'dist',
  'coverage',
  '.vite',
]);

async function removeIfExists(target) {
  try {
    await fs.rm(target, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function copyRecursive(src, dest) {
  const stats = await fs.stat(src);
  if (stats.isDirectory()) {
    const baseName = path.basename(src);
    if (IGNORE_NAMES.has(baseName)) {
      return;
    }
    await ensureDir(dest);
    const entries = await fs.readdir(src);
    for (const entry of entries) {
      if (IGNORE_NAMES.has(entry)) {
        continue;
      }
      await copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function writeManifest(targetDir) {
  const manifestPath = path.join(targetDir, 'DEPLOY_BUNDLE_INFO.md');
  const content = [
    '# VDS Deployment Bundle',
    '',
    'Этот набор файлов подготовлен скриптом `scripts/prepare_vds_bundle.js`.',
    '',
    '## Содержимое',
    ...ITEMS_TO_COPY.map((item) => `- \`${item.destination}\``),
    '',
    '## Дальнейшие шаги',
    '1. Скопируйте папку на VDS (scp/rsync).',
    '2. Зайдите на сервер, сделайте `chmod +x scripts/provision_vds.sh`.',
    '3. Запустите `sudo APP_DIR=/opt/synthetic-id ./scripts/provision_vds.sh` и задайте нужные переменные.',
    '',
    '### Переменные окружения для скрипта:',
    '- `INSTALL_FRONTEND=true` (по умолчанию) — установить фронтенд',
    '- `FRONTEND_PORT=5173` — порт для фронтенда',
    '- `API_PORT=3000` — порт для бекенда',
  ].join('\n');

  await fs.writeFile(manifestPath, content, 'utf8');
}

async function main() {
  const targetDir = path.resolve(process.argv[2] ?? DEFAULT_TARGET);
  console.log(`[prepare_vds_bundle] Target directory: ${targetDir}`);

  await removeIfExists(targetDir);
  await ensureDir(targetDir);

  for (const item of ITEMS_TO_COPY) {
    const srcPath = path.join(ROOT, item.source);
    const destPath = path.join(targetDir, item.destination);

    try {
      await copyRecursive(srcPath, destPath);
      console.log(`  ✓ ${item.source} -> ${item.destination}`);
    } catch (error) {
      console.error(`  ✗ Failed to copy ${item.source}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
  }

  await writeManifest(targetDir);
  console.log('Bundle is ready. You can now transfer it to the VDS.');
}

main().catch((error) => {
  console.error('[prepare_vds_bundle] Unexpected error:', error);
  process.exit(1);
});


