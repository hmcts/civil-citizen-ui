const fs = require('fs/promises');
const event = require('codeceptjs').event;
const lockfile = require('proper-lockfile');
const path = require('path')

const passedTestFilesPath = 'test-results/functional/passedTestFiles.json';
const tempFailedTestFilesPath = 'test-results/functional/tempFailedTestFiles.json';
const failedTestFilesPath = 'test-results/functional/failedTestFiles.json';
const notExecutedTestFilesPath = 'test-results/functional/notExecutedTestFiles.json';
const toBeExecutedTestFilesPath = 'test-results/functional/toBeExecutedTestFiles.json';

async function writeToBeExecutedTestFiles(testFiles) {
  const toBeExecutedTestFiles = JSON.parse(await fs.readFile(toBeExecutedTestFilesPath, 'utf-8'));
  if(toBeExecutedTestFiles.length !== testFiles.length) {
    const normalisedTestFiles = testFiles.map(testFile => normaliseFilePath(testFile));
    await fs.writeFile(toBeExecutedTestFilesPath, JSON.stringify(normalisedTestFiles, null, 2));
  }
}

async function writePassedTestFile(testFile) {
  const release = await lockfile.lock(passedTestFilesPath, { retries: { retries: 10, factor: 1.5 } });
  try {
    const content = await fs.readFile(passedTestFilesPath, 'utf-8');
    const passedTestFiles = JSON.parse(content);

    if(!passedTestFiles.includes(testFile))
      passedTestFiles.push(testFile);

    await fs.writeFile(passedTestFilesPath, JSON.stringify(passedTestFiles, null, 2));
  } finally {
    await release();
  }
}

async function writeFailedTestFile(testFile) {
  const release = await lockfile.lock(tempFailedTestFilesPath, { retries: { retries: 10, factor: 1.5 } });
  try {
    const content = await fs.readFile(tempFailedTestFilesPath, 'utf-8');
    const tempFailedTestFilesJson = JSON.parse(content);

    if(!tempFailedTestFilesJson.includes(testFile))
      tempFailedTestFilesJson.push(testFile);

    await fs.writeFile(tempFailedTestFilesPath, JSON.stringify(tempFailedTestFilesJson, null, 2));
  } finally {
    await release();
  }
}

async function removePassedTestFile(testFile) {
  const release = await lockfile.lock(passedTestFilesPath, { retries: { retries: 10, factor: 1.5 } });
  try {
    const content = await fs.readFile(passedTestFilesPath, 'utf-8');
    let passedTestFilesJson = JSON.parse(content);

    passedTestFilesJson = passedTestFilesJson.filter(failedTestFile => failedTestFile !== testFile);

    await fs.writeFile(passedTestFilesPath, JSON.stringify(passedTestFilesJson, null, 2));
  } finally {
    await release();
  }
}

async function removeFailedTestFile(testFile) {
  const release = await lockfile.lock(tempFailedTestFilesPath, { retries: { retries: 10, factor: 1.5 } });
  try {
    const content = await fs.readFile(tempFailedTestFilesPath, 'utf-8');
    let tempFailedTestFilesJson = JSON.parse(content);

    tempFailedTestFilesJson = tempFailedTestFilesJson.filter(failedTestFile => failedTestFile !== testFile);

    await fs.writeFile(tempFailedTestFilesPath, JSON.stringify(tempFailedTestFilesJson, null, 2));
  } finally {
    await release();
  }
}

function normaliseFilePath(filePath) {
  const index = filePath.indexOf('/src/');
  if (index !== -1) {
    return `.${filePath.substring(index)}`;
  } else {
    return filePath;
  }
}

module.exports = function() {
  event.dispatcher.on(event.test.failed, async function (test) {
    const normalisedFilePath = normaliseFilePath(test.file);
    await removePassedTestFile(normalisedFilePath);
    await writeFailedTestFile(normalisedFilePath);
  });

  event.dispatcher.on(event.all.before, async function (result) {
    await writeToBeExecutedTestFiles(result.testFiles);
  });

  event.dispatcher.on(event.test.passed, async function (test) {
    const normalisedFilePath = normaliseFilePath(test.file);
    await removeFailedTestFile(normalisedFilePath);
    await writePassedTestFile(normalisedFilePath);
  });
};

module.exports.testFilesHelper = {
  createTempFailedTestsFile: async () => {
    await fs.writeFile(tempFailedTestFilesPath, JSON.stringify([], null, 2));
  },
  createPassedTestsFile: async () => {
    await fs.writeFile(passedTestFilesPath, JSON.stringify([], null, 2));
  },
  createNotExecutedTestsFile: async () => {
    await fs.writeFile(notExecutedTestFilesPath, JSON.stringify([], null, 2));
  },
  createToBeExecutedTestsFile: async () => {
    await fs.writeFile(toBeExecutedTestFilesPath, JSON.stringify([], null, 2));
  },
  createFailedTestsFile: async () => {
    const content = await fs.readFile(tempFailedTestFilesPath, 'utf-8');
    const jsonData = JSON.parse(content);
    await fs.writeFile(failedTestFilesPath, JSON.stringify(jsonData, null, 2));
  },
  deleteTempFailedTestsFile: async () => {
    await fs.unlink(tempFailedTestFilesPath);
  },
  deleteToBeExecutedTestFiles:  async () => {
    await fs.unlink(toBeExecutedTestFilesPath);
  },
  writeNotExecutedTestFiles: async () => {
    const toBeExecutedTestFiles = JSON.parse(await fs.readFile(toBeExecutedTestFilesPath, 'utf-8'));
    const tempFailedTestFiles = JSON.parse(await fs.readFile(tempFailedTestFilesPath, 'utf-8'));
    const passedTestFiles = JSON.parse(await fs.readFile(passedTestFilesPath, 'utf-8'));
  
    const executedTestFiles = new Set([...tempFailedTestFiles, ...passedTestFiles]);
  
    const notExecutedTestFiles = toBeExecutedTestFiles.filter(toBeExecutedTestFile => !executedTestFiles.has(toBeExecutedTestFile));
  
    await fs.writeFile(notExecutedTestFilesPath, JSON.stringify(notExecutedTestFiles, null, 2));
  }
};