#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const process = require('process');
const newman = require('newman');

const collectionPath = path.resolve(__dirname, 'Synthetic-ID-Generator.postman_collection.json');
const collection = require(collectionPath);

const args = process.argv.slice(2);
const cliOptions = args.reduce((acc, arg) => {
  if (!arg.startsWith('--')) {
    return acc;
  }
  const [rawKey, rawValue] = arg.replace(/^--/, '').split('=');
  const key = rawKey.trim();
  const value = rawValue === undefined ? true : rawValue.trim();
  return { ...acc, [key]: value };
}, {});

const baseUrl =
  cliOptions['base-url'] ||
  cliOptions.base ||
  process.env.NEWMAN_BASE_URL ||
  'http://109.172.101.131/api/v1';
const apiKey = cliOptions['api-key'] || cliOptions.key || process.env.NEWMAN_API_KEY || 'your-api-key-here';
const delayMs = Number(cliOptions.delay || process.env.NEWMAN_DELAY_MS || 0);
const insecure =
  cliOptions.insecure === true ||
  cliOptions.insecure === 'true' ||
  process.env.NEWMAN_INSECURE === 'true';
const iterationCount = Number(cliOptions.iterations || process.env.NEWMAN_ITERATIONS || 1);
const reportPath = cliOptions.report || process.env.NEWMAN_REPORT_PATH;

const environment = {
  name: 'Synthetic ID Generator Newman Env',
  values: [
    { key: 'base_url', value: baseUrl, type: 'text', enabled: true },
    { key: 'api_key', value: apiKey, type: 'text', enabled: true },
    { key: 'profile_id', value: '', type: 'text', enabled: true },
  ],
};

const reporters = ['cli'];
const reporter = {};

if (reportPath) {
  reporters.push('json');
  reporter.json = {
    export: path.resolve(process.cwd(), reportPath),
  };
}

console.log('Running Newman collection with options:', {
  baseUrl,
  apiKey: apiKey ? `${apiKey.slice(0, 4)}***` : 'not-set',
  delayMs,
  insecure,
  iterationCount,
  reportPath: reportPath ? path.resolve(process.cwd(), reportPath) : 'disabled',
});

newman.run(
  {
    collection,
    environment,
    reporters,
    reporter,
    delayRequest: delayMs,
    insecure,
    iterationCount,
  },
  (err, summary) => {
    if (err) {
      console.error('Newman run failed:', err);
      process.exit(1);
    }

    const failures = summary.run.failures.length;
    if (failures > 0) {
      console.error(`Newman run completed with ${failures} failure(s).`);
      process.exit(1);
    }

    console.log('Newman run completed successfully.');
    process.exit(0);
  },
);

