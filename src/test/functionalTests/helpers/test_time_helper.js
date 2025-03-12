const testTimeReportFolderPath = 'test-results/functional/test-times/';
const testTimeReportFilePath = 'test-results/functional/test-times-report.json';
const fs = require('fs/promises');
const fsSync = require('fs')
const path = require('path');

const getTime = () => {
  const now = new Date();
  const hours = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours();
  const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
  return `${hours}:${minutes}`;
};

const hyphenate = (filePath) => {
  return filePath.replace(/\s+/g, '-');
}

module.exports = {
  addTestStartTime: async (testName) => {
    const filePath = `${testTimeReportFolderPath}${hyphenate(testName)}.json`
    let data = {};
    try {
      data = JSON.parse(await fs.readFile(filePath));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], startTime: getTime()};
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  },

  addTestEndTime: async (testName) => {
    const filePath = `${testTimeReportFolderPath}${hyphenate(testName)}.json`
    let data;
    try {
      data = JSON.parse(await fs.readFile(filePath));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], endTime: getTime()};
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  },

 mkDirTestTimeDir: async () => {
    try {
      await fs.access(testTimeReportFolderPath);
    } catch (e) {
      await fs.mkdir(testTimeReportFolderPath, { recursive: true });
    }
  },

  deleteTestTimes: () => {
    try {
       fsSync.rmSync(testTimeReportFolderPath, { recursive: true, force: true });
       fsSync.unlinkSync(testTimeReportFilePath);
    } catch(error) {
      console.log(error);
    }
  },

  appendTestTimesToReport: async () => {
    try {
      const files = await fs.readdir(testTimeReportFolderPath);
      
      const jsonFiles = files.filter(file => path.extname(file) === '.json');
      
      let mergedData = {};
  
      for (const file of jsonFiles) {
        const filePath = path.join(testTimeReportFolderPath, file);
        
        const fileData = await fs.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(fileData);
        
        mergedData = { ...mergedData, ...parsedData };
      }
  
      await fs.writeFile(testTimeReportFilePath, JSON.stringify(mergedData, null, 2));
      console.log('Data successfully merged and saved to:', testTimeReportFilePath);
    } catch (error) {
      console.error('Error processing files:', error);
    }
  }
};