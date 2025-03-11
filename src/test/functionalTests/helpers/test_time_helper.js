const testTimeReportFolderPath = 'test-results/functional/test-times/';
const testTimeReportFilePath = 'test-results/functional/test-times-report.json';
const fs = require('fs');
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
      data = JSON.parse(await fs.readFile(`${testTimeReportFolderPath}/${testName}.json`));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], startTime: getTime()};
    await fs.writeFile(`${testTimeReportFolderPath}/${testName}.json`, JSON.stringify(data, null, 2));
  },

  addTestEndTime: async (testName) => {
    let data;
    try {
      data = JSON.parse(await fs.readFile(`${testTimeReportFolderPath}/${testName}.json`));
    } catch(e) {
      data = {};
    }
    data[testName] = {...data[testName], endTime: getTime()};
    await fs.writeFile(`${testTimeReportFolderPath}/${testName}.json`, JSON.stringify(data, null, 2));
  },

  mkDirTestTimeDir: async () => {
    const dirPath = path.dirname(testTimeReportFolderPath);
    if (!fsSync.existsSync(testTimeReportFolderPath)) {
      await fs.readFile(dirPath, { recursive: true });
    }
  },

  deleteTestTimesFolder: async () => {
    try {
       fs.unlink(tes);
    } catch(error) {
      console.log(error);
    }
  },

  appendTestTimesToReport: async () => {
    await fs.readdir(testTimeReportFolderPath, (err, jsonFiles) => {
      jsonFiles.forEach((file, index) => {
      const filePath = path.join(directoryPath, file);
      
      // Read the content of the JSON file
      fs.readFile(filePath, 'utf8', (err, data) => {

        // Parse the JSON data
        try {
          const jsonData = JSON.parse(data);

          // Merge the current file's data with the overall data
          mergedData = { ...mergedData, ...jsonData };

          // If it's the last file, save the merged data to the output file
          if (index === jsonFiles.length - 1) {
              fs.writeFile(outputFilePath, JSON.stringify(mergedData, null, 2), 'utf8', (err) => {
              if (err) {
                console.error('Error writing to output file:', err);
              } else {
                console.log('Data successfully merged and saved to', outputFilePath);
              }
            });
          }
        } catch (parseErr) {
          console.error(`Error parsing JSON in file ${file}:`, parseErr);
        }
      });
    });
  });
  }
};