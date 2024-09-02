const { assert } = require('chai');
const config = require('../../../config');
const apiRequest = require('./apiRequest');

const taskFieldsToBeValidated = {
  taskInitiationFields: [
    'name',
    'type',
    'task_title',
  ],
  taskConfigurationFields: [
    'location_name',
    'location',
    'execution_type',
    'jurisdiction',
    'region',
    'case_type_id',
    'case_category',
    'auto_assigned',
    'case_management_category',
    'work_type_id',
    'work_type_label',
    'description',
    'role_category',
  ],
  taskPermissionFields: [
    'permissions',
  ],
  taskPriorityFields: [
    'minor_priority',
    'major_priority',
  ],
};

const validateTaskDetails = (createdTaskDetails, expectedTaskDetails) => {
  if(expectedTaskDetails && createdTaskDetails) {
    for (let taskDMN of Object.keys(taskFieldsToBeValidated)) {
      console.log(`asserting dmn info: ${taskDMN} has valid data`);
      taskFieldsToBeValidated[taskDMN].forEach(
        fieldsToBeValidated  => {
          assert.deepEqual(createdTaskDetails[fieldsToBeValidated], expectedTaskDetails[fieldsToBeValidated]);
        });
    }
  }
};

module.exports = {
  runWATask: async (user, claimRef, taskType, validTaskDetails, taskSteps = async () => {}) => {
    let taskId;
    if(config.runWAApiTest) {
      const taskInfo = await apiRequest.fetchTaskDetails(user, claimRef, taskType);
      console.log(`${taskType}Task...` , taskInfo);
      validateTaskDetails(taskInfo, validTaskDetails);
      taskId = taskInfo['id'];
      await apiRequest.taskActionByUser(user, taskId, 'claim');
    }
    await taskSteps();
    if(config.runWAApiTest) {
      await apiRequest.taskActionByUser(user, taskId, 'complete');
    }
  },
};
