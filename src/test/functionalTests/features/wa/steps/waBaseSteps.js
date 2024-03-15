const validateTaskInfo = require('../validateTaskInfo')

class WABaseSteps {
  async _runWAApiTest(api, user, caseNumber, taskId, validTask) {
    const task = await api.retrieveTaskDetails(user, caseNumber, taskId);
    // console.log(`${taskId}Task...` , task);
    // validateTaskInfo(task, validTask);
    // api.assignTaskToUser(user, taskId);
  }  
}

module.exports = WABaseSteps;