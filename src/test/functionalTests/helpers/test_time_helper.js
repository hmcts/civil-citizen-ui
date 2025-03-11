const testTimeReportFilePath = 'test-results/test-times-report.json';
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

const getTime = () => {
  const now = new Date();
  const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
  const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  return `${hours}:${minutes}`;
};

module.exports = {
  addTestStartTime: async (testName) => {
    let data;
    try {
      data = JSON.parse(await fs.readFile(testTimeReportFilePath));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], startTime: getTime()};
    await fs.writeFile(testTimeReportFilePath, JSON.stringify(data, null, 2));
  },

  addTestEndTime: async (testName) => {
    let data;
    try {
      data = JSON.parse(await fs.readFile(testTimeReportFilePath));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], endTime: getTime()};
    await fs.writeFile(testTimeReportFilePath, JSON.stringify(data, null, 2));
  },

  mkDirTestTimeDir: async () => {
    const dirPath = path.dirname(testTimeReportFilePath);
    if (!fsSync.existsSync(testTimeReportFilePath)) {
      await fs.readFile(dirPath, { recursive: true });
    }
  },

  deleteTestTimesFile: async () => {
    try {
      await fs.unlink(testTimeReportFilePath);
    } catch(error) {
      console.log(error);
    }
  },
};