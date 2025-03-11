const testTimeReportFilePath = 'test-results/test-times-report.json';
const fs = require('fs/promises')

const getTime = () => {
 const now = new Date();
 return `${now.getHours()}:${now.getMinutes()}`
}

module.exports = {
  addTestStartTime: async (testName) => {
    const data = JSON.parse(await fs.readFile(testTimeReportFilePath)) ?? {};
    data[testName] = {...data[testName], startTime: getTime()}
    await fs.writeFile(testTimeReportFilePath, JSON.stringify(data, null, 2));
  },

  addTestEndTime: async (testName) => {
    const data = await JSON.parse(fs.readFile(testTimeReportFilePath)) ?? {};
    data[testName] = {...data[testName], endTime: getTime()}
    await fs.writeFile(testTimeReportFilePath, JSON.stringify(data, null, 2));
  },

  mkDirTestTimeDir: async () => {
    const dirPath = path.dirname(testTimeReportFilePath);
    if (!this.exists(testTimeReportFilePath)) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  },
}