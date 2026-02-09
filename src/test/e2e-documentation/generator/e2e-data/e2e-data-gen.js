#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
let codeceptConfig = {};
try {
  codeceptConfig = require(path.join(repoRoot, 'src/test/config.js'));
} catch (error) {
  console.warn('Warning: Unable to load src/test/config.js for documentation generation:', error.message);
}
const dependentUiList = require('../support/dependent-ui-features');
const dependentApiList = require('../support/dependent-api-features');

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

function boolToYesNo(value) {
  return value ? 'yes' : 'no';
}

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

function formatDisplayPath(posixPath) {
  return posixPath.split('/').join(' -> ');
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
    const actorTarget = actorStepObjects.join('|');
    const commentActorRegex = new RegExp(
      `^\\s*(?:\\/\\/\\s*|\\/\\*\\s*|\\*\\s*)?(?:await\\s+)?(${actorTarget})\\.([A-Za-z0-9_]+)\\s*\\(`,
    );
    const commentStepsRegex = /^\s*(?:\/\/\s*|\/\*\s*|\*\s*)?(?:await\s+)?(\w+Steps)\.([A-Za-z0-9_]+)\s*\(/;
    const commentStandaloneRegex = new RegExp(
      `^\\s*(?:\\/\\/\\s*|\\/\\*\\s*|\\*\\s*)?(?:await\\s+)?((${standaloneStepPrefixes.join('|')})[A-Za-z0-9_]*)\\s*\\(`,
    );

    commentRanges.forEach(range => {
      const lines = range.text.split('\n');
      let offset = 0;

      lines.forEach(line => {
        const actorMatch = commentActorRegex.exec(line);
        if (actorMatch) {
          const methodName = actorMatch[2];
          if (!ignoredStepMethods.has(methodName) && !hasIgnoredPrefix(methodName)) {
            matches.push({
              name: `${actorMatch[1]}.${actorMatch[2]} (skipped)`,
              index: range.start + offset + (actorMatch.index || 0),
            });
          }
        } else {
          const stepsMatch = commentStepsRegex.exec(line);
          if (stepsMatch) {
            const methodName = stepsMatch[2];
            if (
              !ignoredStepMethods.has(methodName) &&
              !ignoredStepObjects.has(stepsMatch[1]) &&
              !hasIgnoredPrefix(methodName)
            ) {
              matches.push({
                name: `${stepsMatch[1]}.${stepsMatch[2]} (skipped)`,
                index: range.start + offset + (stepsMatch.index || 0),
              });
            }
          } else if (standaloneStepPrefixes.length) {
            const standaloneMatch = commentStandaloneRegex.exec(line);
            if (standaloneMatch) {
              const methodName = standaloneMatch[1];
              if (
                !ignoredStepMethods.has(methodName) &&
                !verifyObjectNames.has(methodName)
              ) {
                matches.push({
                  name: `${methodName} (skipped)`,
                  index: range.start + offset + (standaloneMatch.index || 0),
                });
              }
            }
          }
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
  global.inject = () => ({});
  global.config = codeceptConfig;
  global.actor = () => ({});

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

function deriveTagMetadata(tags) {
  const pipelines = new Set();
  const functionalTags = [];
  const functionalGroups = [];

  tags.forEach(tag => {
    if (pipelineTagMap[tag]) {
      pipelineTagMap[tag].forEach(p => pipelines.add(p));
    } else if (isFunctionalTag(tag)) {
      functionalTags.push(tag);
      const rawGroup = tag.replace(/^@(ui|api)-/, '');
      if (rawGroup) {
        functionalGroups.push(`pr_ft_${rawGroup}`);
      }
    }
  });

  return {
    tags,
    pipelines: Array.from(pipelines),
    functionalTestGroupTags: functionalTags,
    functionalTestGroups: functionalGroups,
  };
}

function formatDependentFeature(scenarios) {
  if (!scenarios.length) {
    return null;
  }
  const tags = Array.from(new Set(scenarios.flatMap(s => s.tags)));
  const tagMeta = deriveTagMetadata(tags);
  const featureName = scenarios[0].featureName;
  const filePath = scenarios[0].filePath;
  const displayPath = formatDisplayPath(filePath);
  const beforeSuite = scenarios.find(s => (s.beforeSuiteSteps || []).length)?.beforeSuiteSteps || [];
  const flattenedSteps = [...beforeSuite];
  const featureSkipped = scenarios.some(s => s.featureSkipped);
  const decorateStep = (step, scenarioSkipped) => {
    if (!scenarioSkipped) {
      return step;
    }
    return step.endsWith(' (skipped)') ? step : `${step} (skipped)`;
  };
  scenarios.forEach(scenario => {
    const scenarioSteps = [
      ...(scenario.beforeSteps || []),
      ...(scenario.collectedSteps || []),
    ];
    scenarioSteps.forEach(step => {
      flattenedSteps.push(decorateStep(step, scenario.skipped));
    });
  });
  const dependentSkipped = featureSkipped || scenarios.every(s => s.skipped);

  return {
    testName: featureName || path.basename(filePath),
    featureName,
    filePath: displayPath,
    independentScenario: boolToYesNo(false),
    ...tagMeta,
    steps: flattenedSteps,
    skipped: boolToYesNo(dependentSkipped),
  };
}

function formatIndependentScenario(scenario) {
  const tags = Array.from(scenario.tagsSet || []);
  const tagMeta = deriveTagMetadata(tags);
  const allSteps = [
    ...(scenario.beforeSteps || []),
    ...(scenario.collectedSteps || []),
  ];
  const decoratedSteps = allSteps.map(step => {
    if (!scenario.skipped) {
      return step;
    }
    return step.endsWith(' (skipped)') ? step : `${step} (skipped)`;
  });
  return {
    testName: scenario.testName,
    featureName: scenario.featureName,
    filePath: formatDisplayPath(scenario.filePath),
    independentScenario: boolToYesNo(true),
    ...tagMeta,
    steps: decoratedSteps,
    skipped: boolToYesNo(Boolean(scenario.skipped)),
  };
}

function generateDocs({ suiteType, targetDir, outputFile }) {
  const absoluteDir = path.join(repoRoot, targetDir);
  const files = walk(absoluteDir).filter(file => /_tests?\.js$/i.test(file));
  const results = [];

  files.forEach(file => {
    const scenarios = collectScenarios(file, suiteType);
    if (fileIsDependent(file, suiteType)) {
      const record = formatDependentFeature(scenarios);
      if (record) {
        results.push(record);
      }
    } else {
      scenarios.forEach(s => {
        const record = formatIndependentScenario(s);
        results.push(record);
      });
    }
  });

  results.sort((a, b) => {
    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath);
    }
    return a.testName.localeCompare(b.testName);
  });

  const outputPath = path.join(repoRoot, outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  return results.length;
}

module.exports = {
  generateDocs,
};
