#!/usr/bin/env node
/*
 * Drop-in replacement for `codeceptjs run-workers` that starts workers with a
 * delay between each one, instead of all at once. Avoids a burst of ~N
 * simultaneous new TLS connections to the preview civil-service pod at
 * suite startup (see DTSCCI TLS "bad record mac" investigation).
 *
 * Usage matches run-workers.js: node bin/run-workers-staggered.js <workerCount> [options]
 * Extra env var: WORKER_STAGGER_MS (default 2000) - delay between starting each worker.
 */
const path = require('path');
const { Worker } = require('worker_threads');
const Workers = require('codeceptjs/lib/workers');
const WorkerStorage = require('codeceptjs/lib/workerStorage');
const output = require('codeceptjs/lib/output');
const event = require('codeceptjs/lib/event');
const recorder = require('codeceptjs/lib/recorder');
const { tryOrDefault } = require('codeceptjs/lib/utils');

const STAGGER_MS = parseInt(process.env.WORKER_STAGGER_MS || '2000', 10);
const pathToWorker = path.join(path.dirname(require.resolve('codeceptjs/lib/workers')), 'command', 'workers', 'runTests.js');

function simplifyObject(object) {
  return Object.keys(object)
    .filter((k) => k.indexOf('_') !== 0)
    .filter((k) => typeof object[k] !== 'function')
    .filter((k) => typeof object[k] !== 'object')
    .reduce((obj, key) => {
      obj[key] = object[key];
      return obj;
    }, {});
}

function createWorker(workerObject) {
  const worker = new Worker(pathToWorker, {
    workerData: {
      options: simplifyObject(workerObject.options),
      tests: workerObject.tests,
      testRoot: workerObject.testRoot,
      workerIndex: workerObject.workerIndex + 1,
    },
  });
  worker.on('error', (err) => output.error(`Worker Error: ${err.stack}`));
  WorkerStorage.addWorker(worker);
  return worker;
}

class StaggeredWorkers extends Workers {
  run() {
    this.stats.start = new Date();
    recorder.startUnlessRunning();
    event.dispatcher.emit(event.workers.before);

    recorder.add('starting workers (staggered)', async () => {
      for (const worker of this.workers) {
        const workerThread = createWorker(worker);
        this._listenWorkerEvents(workerThread);
        if (STAGGER_MS > 0 && worker !== this.workers[this.workers.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, STAGGER_MS));
        }
      }
    });

    return new Promise((resolve) => this.on('end', resolve));
  }
}

// Minimal manual arg parsing - only the flags this repo's npm scripts actually pass
// (--suites, --grep <pattern>, --verbose). Mirrors codeceptjs's own run-workers CLI
// closely enough for our use, without pulling in commander as an undeclared dependency.
function parseArgs(argv) {
  const [workerCountArg, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--suites') {
      options.suites = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg === '--grep') {
      options.grep = rest[++i];
    } else if (arg === '--config') {
      options.config = rest[++i];
    } else if (arg === '--override') {
      options.override = rest[++i];
    } else if (arg === '--reporter' || arg === '--plugins') {
      // accepted for CLI compatibility with the existing npm scripts; not used here,
      // since reporters/plugins are already configured in codecept.conf.js
      i++;
    }
  }
  return { workerCount: workerCountArg, options };
}

async function main() {
  const { workerCount, options } = parseArgs(process.argv.slice(2));
  if (!workerCount) {
    output.error('Usage: run-workers-staggered.js <workerCount> [--suites] [--grep <pattern>]');
    process.exit(1);
  }

  const { config: testConfig, override = '' } = options;
  const overrideConfigs = tryOrDefault(() => JSON.parse(override), {});
  const by = options.suites ? 'suite' : 'test';

  const config = { by, testConfig, options };
  const numberOfWorkers = parseInt(workerCount, 10);

  output.print(`Running tests in ${numberOfWorkers} workers, staggered ${STAGGER_MS}ms apart...`);

  const workers = new StaggeredWorkers(numberOfWorkers, config);
  workers.overrideConfig(overrideConfigs);
  workers.on(event.test.failed, (failedTest) => output.test.failed(failedTest));
  workers.on(event.test.passed, (successTest) => output.test.passed(successTest));
  workers.on(event.all.result, () => workers.printResults());

  try {
    await workers.bootstrapAll();
    await workers.run();
  } catch (err) {
    output.error(err);
    process.exitCode = 1;
  } finally {
    await workers.teardownAll();
    process.exit(process.exitCode || 0);
  }
}

main();
