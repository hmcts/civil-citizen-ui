
module.exports = (createdTask, expectedTaskInfo) => {
    if(expectedTaskInfo && createdTask) {
      for (let taskDMN of Object.keys(taskFieldsToBeValidated)) {
          console.log(`asserting dmn info: ${taskDMN} has valid data`);
          taskFieldsToBeValidated[taskDMN].forEach(
            fieldsToBeValidated  => {
              assert.deepEqual(createdTask[fieldsToBeValidated], expectedTaskInfo[fieldsToBeValidated]);
            }
          );
      }
    }
  }
