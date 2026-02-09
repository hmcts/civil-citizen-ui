const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
let codeceptConfig = {};
try {
  codeceptConfig = require(path.join(repoRoot, 'src/test/config.js'));
} catch (error) {
  console.warn('Warning: Unable to load src/test/config.js for documentation generation:', error.message);
}
const dependentUiList = require('./dependent-ui-features');
const dependentApiList = require('./dependent-api-features');

const dependentApiFiles = new Set(
  dependentApiList.map(p => p.replace(/\\/g, '/')),
);
const dependentUiFiles = new Set(
  dependentUiList.map(p => p.replace(/\\/g, '/')),
);

const pipelineTagMap = {
  '@ui-prod': ['civil-citizen-ui: master', 'civil-citizen-ui: nightly', 'civil-citizen-ui: PR'],
  '@ui-nonprod': ['civil-citizen-ui: PR'],
  '@ui-nightly-prod': ['civil-citizen-ui: nightly'],
};

const pipelineTagSet = new Set(Object.keys(pipelineTagMap));
const actorStepObjects = ['wa', 'api', 'noc', 'qm'];
const ignoredObjectMethodPrefixes = ['verify', 'click', 'fill'];
const standaloneStepPrefixes = ['verify'];
const ignoredStepMethods = new Set([
  'getCaseId',
  'login',
  'setCaseId',
  'signOut',
  'amOnPage',
  'waitForText',
  'wait',
  'navigateToCaseDetails',
  'see',
  'grabCaseNumber',
  'navigateToTab',
  'assertHasEvents',
  'retrieveTaskDetails',
  'validateTaskInfo',
  'completeTaskByUser',
  'retrieveCaseData',
  'click',
  'waitForFinishedBusinessProcess',
]);
const ignoredStepObjects = new Set(['LoginSteps']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walk(fullPath);
    }
    return [fullPath];
  });
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function isSmokeFile(filePath) {
  const base = path.basename(filePath).toLowerCase();
  return base.startsWith('smoke');
}

function fileIsDependent(filePath, suiteType) {
  const relative = toPosix(path.relative(repoRoot, filePath));
  if (suiteType === 'api') {
    return dependentApiFiles.has(relative);
  }
  return dependentUiFiles.has(relative);
}

function normaliseTag(token) {
  if (!token) {
    return null;
  }
  let trimmed = token.trim();
  if (!trimmed) {
    return null;
  }
  trimmed = trimmed.replace(/[;,]+$/, '');
  if (!trimmed.startsWith('@')) {
    if (trimmed.startsWith('e2e-') || trimmed.startsWith('api-') || pipelineTagSet.has(`@${trimmed}`)) {
      trimmed = `@${trimmed}`;
    }
  }
  return trimmed;
}

function splitTags(str) {
  if (!str || typeof str !== 'string') {
    return [];
  }
  return str
    .split(/[\s,]+/)
    .map(normaliseTag)
    .filter(Boolean);
}

function extractNameAndInlineTags(rawName) {
  if (typeof rawName !== 'string') {
    return { name: '', tags: [] };
  }
  const inlineTags = [];
  const cleaned = rawName.replace(/@[\w-]+/g, match => {
    inlineTags.push(match);
    return '';
  });
  return {
    name: cleaned.replace(/\s+/g, ' ').trim(),
    tags: inlineTags,
  };
}

function extractHelperSteps(fn) {
  if (typeof fn !== 'function') {
    return [];
  }
  const source = fn.toString();

  const commentRanges = [];
  const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
  let commentMatch;
  while ((commentMatch = commentRegex.exec(source))) {
    commentRanges.push({
      start: commentMatch.index,
      end: commentMatch.index + commentMatch[0].length,
      text: commentMatch[0],
    });
  }

  const isInComment = index =>
    commentRanges.some(range => index >= range.start && index < range.end);

  const matches = [];
  const hasIgnoredPrefix = method => {
    const lower = method.toLowerCase();
    return ignoredObjectMethodPrefixes.some(prefix =>
      lower.startsWith(prefix.toLowerCase()),
    );
  };
  const verifyObjectNames = new Set();
  const stepsRegex = /(\w+Steps)\.([A-Za-z0-9_]+)\s*\(/g;
  let match;
  while ((match = stepsRegex.exec(source))) {
    if (
      !ignoredStepMethods.has(match[2]) &&
      !ignoredStepObjects.has(match[1]) &&
      !hasIgnoredPrefix(match[2]) &&
      !isInComment(match.index)
    ) {
      matches.push({ name: `${match[1]}.${match[2]}`, index: match.index });
    }
  }

  const actorRegex = new RegExp(`\\b(${actorStepObjects.join('|')})\\.([A-Za-z0-9_]+)\\s*\\(`, 'g');
  while ((match = actorRegex.exec(source))) {
    if (!ignoredStepMethods.has(match[2]) && !hasIgnoredPrefix(match[2]) && !isInComment(match.index)) {
      matches.push({ name: `${match[1]}.${match[2]}`, index: match.index });
    }
  }

  const verifyObjectRegex = /\b([A-Za-z0-9_]+)\.(verify[A-Za-z0-9_]*)\s*\(/g;
  while ((match = verifyObjectRegex.exec(source))) {
    if (!ignoredStepObjects.has(match[1]) && !isInComment(match.index)) {
      matches.push({ name: `${match[1]}.${match[2]}`, index: match.index });
      verifyObjectNames.add(match[2]);
    }
  }

  if (standaloneStepPrefixes.length) {
    const standaloneRegex = new RegExp(
      `\\b((${standaloneStepPrefixes.join('|')})[A-Za-z0-9_]*)\\s*\\(`,
      'g',
    );
    while ((match = standaloneRegex.exec(source))) {
      const methodName = match[1];
      if (
        !ignoredStepMethods.has(methodName) &&
        !verifyObjectNames.has(methodName) &&
        !isInComment(match.index)
      ) {
        matches.push({ name: methodName, index: match.index });
      }
    }
  }

  if (commentRanges.length) {
    commentRanges.forEach(range => {
      const actorTarget = actorStepObjects.join('|');
      const commentActorRegex = new RegExp(
        `^\\s*(?:\\/\\/\\s*|\\/\\*\\s*|\\*\\s*)?(?:await\\s+)?(${actorTarget})\\.([A-Za-z0-9_]+)\\s*\\(`,
      );
      const commentStepsRegex = /^\s*(?:\/\/\s*|\/\*\s*|\*\s*)?(?:await\s+)?(\w+Steps)\.([A-Za-z0-9_]+)\s*\(/;
      const lines = range.text.split('\n');
      let offset = 0;

      lines.forEach(line => {
        let commentStep = commentActorRegex.exec(line);
        if (!commentStep) {
          commentStep = commentStepsRegex.exec(line);
        }
        if (commentStep && !ignoredStepMethods.has(commentStep[2])) {
          matches.push({
            name: `${commentStep[1]}.${commentStep[2]} (skipped)`,
            index: range.start + offset + (commentStep.index || 0),
          });
        }
        offset += line.length + 1;
      });
    });
  }

  matches.sort((a, b) => a.index - b.index);
  const ordered = [];
  const seen = new Set();
  matches.forEach(({ name }) => {
    if (!seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  });
  return ordered;
}

function createChain(target) {
  const chain = {};
  const passthrough = () => chain;
  chain.tag = tags => {
    splitTags(tags).forEach(tag => {
      if (!target.tagsSet.has(tag)) {
        target.tagsSet.add(tag);
        target.tags.push(tag);
      }
    });
    return chain;
  };
  chain.retry = passthrough;
  chain.retries = passthrough;
  chain.config = passthrough;
  chain.timeout = passthrough;
  chain.workers = passthrough;
  chain.meta = passthrough;
  chain.severity = passthrough;
  return chain;
}

function collectScenarios(filePath, suiteType) {
  const absolute = path.resolve(filePath);
  const relative = toPosix(path.relative(repoRoot, absolute));
  delete require.cache[require.resolve(absolute)];

  const scenarios = [];
  let currentFeature = null;
  let beforeHookSteps = [];
  let beforeSuiteSteps = [];

  const previousGlobals = {
    Feature: global.Feature,
    Scenario: global.Scenario,
    xScenario: global.xScenario,
    Before: global.Before,
    After: global.After,
    BeforeSuite: global.BeforeSuite,
    AfterSuite: global.AfterSuite,
    Data: global.Data,
    DataTable: global.DataTable,
    inject: global.inject,
    config: global.config,
    actor: global.actor,
  };

  function restoreGlobals() {
    Object.entries(previousGlobals).forEach(([key, value]) => {
      if (value === undefined) {
        delete global[key];
      } else {
        global[key] = value;
      }
    });
  }

  function registerFeature(rawName, { skip = false } = {}) {
    const { name, tags } = extractNameAndInlineTags(rawName);
    const feature = {
      name: name || rawName,
      rawName,
      tags: [],
      tagsSet: new Set(),
      skip,
    };
    tags.forEach(tag => {
      if (!feature.tagsSet.has(tag)) {
        feature.tagsSet.add(tag);
        feature.tags.push(tag);
      }
    });
    currentFeature = feature;
    return createChain(feature);
  }

  function scenarioFactory({ skip = false } = {}) {
    return function defineScenario(rawName, maybeOpts, maybeFn) {
      const { name, tags } = extractNameAndInlineTags(rawName);
      let fn = maybeFn;
      if (typeof maybeOpts === 'function') {
        fn = maybeOpts;
      }
      const featureSkipped = Boolean(currentFeature && currentFeature.skip);
      const scenario = {
        suiteType,
        filePath: relative,
        rawName,
        testName: name || rawName,
        featureName: currentFeature ? currentFeature.name : null,
        tags: [],
        tagsSet: new Set(currentFeature ? currentFeature.tags : []),
        collectedSteps: extractHelperSteps(fn),
        beforeSteps: beforeHookSteps.flat(),
        beforeSuiteSteps: beforeSuiteSteps.flat(),
        skipped: skip || featureSkipped,
        featureSkipped,
      };
      splitTags(tags.join(' ')).forEach(tag => scenario.tagsSet.add(tag));
      scenario.tags = Array.from(scenario.tagsSet);
      scenarios.push(scenario);
      return createChain(scenario);
    };
  }

  const Feature = rawName => registerFeature(rawName);
  Feature.only = rawName => registerFeature(rawName);
  Feature.skip = rawName => registerFeature(rawName, { skip: true });

  const Scenario = scenarioFactory();
  Scenario.only = scenarioFactory();
  Scenario.skip = scenarioFactory({ skip: true });

  function registerBeforeHook(arg1, arg2) {
    const fn = typeof arg1 === 'function' ? arg1 : arg2;
    if (typeof fn === 'function') {
      beforeHookSteps.push(extractHelperSteps(fn));
    }
  }

  function registerBeforeSuiteHook(arg1, arg2) {
    const fn = typeof arg1 === 'function' ? arg1 : arg2;
    if (typeof fn === 'function') {
      beforeSuiteSteps.push(extractHelperSteps(fn));
    }
  }

  function noop() {}
  const Data = () => ({
    Scenario,
    xScenario: Scenario,
  });

  global.Feature = Feature;
  global.Scenario = Scenario;
  global.xScenario = Scenario;
  global.Before = (arg1, arg2) => registerBeforeHook(arg1, arg2);
  global.After = noop;
  global.BeforeSuite = (arg1, arg2) => registerBeforeSuiteHook(arg1, arg2);
  global.AfterSuite = noop;
  global.Data = Data;
  global.DataTable = () => ({ Scenario });
  global.inject = () => ({ });
  global.config = codeceptConfig;
  global.actor = () => ({ });

  try {
    require(absolute);
  } catch (error) {
    restoreGlobals();
    throw error;
  }
  restoreGlobals();
  delete require.cache[require.resolve(absolute)];

  return scenarios;
}

function isFunctionalTag(tag) {
  if (!tag) {
    return false;
  }
  if (pipelineTagSet.has(tag)) {
    return false;
  }
  return tag.startsWith('@ui-') || tag.startsWith('@api-');
}

module.exports = {
  repoRoot,
  codeceptConfig,
  dependentApiFiles,
  dependentUiFiles,
  pipelineTagMap,
  pipelineTagSet,
  actorStepObjects,
  ignoredStepMethods,
  walk,
  toPosix,
  isSmokeFile,
  fileIsDependent,
  normaliseTag,
  splitTags,
  extractNameAndInlineTags,
  extractHelperSteps,
  createChain,
  collectScenarios,
  isFunctionalTag,
};
