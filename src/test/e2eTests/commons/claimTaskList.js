const taskListItems = Object.freeze({
  RESOLVING_THIS_DISPUTE: 'Resolving this dispute',
  COMPLETING_YOUR_CLAIM: 'Completing your claim',
  YOUR_DETAILS: 'Your details',
  THEIR_DETAILS: 'Their details',
  CLAIM_AMOUNT: 'Claim amount',
  CLAIM_DETAILS: 'Claim details',
  CHECK_AND_SUBMIT_YOUR_CLAIM: 'Check and submit your claim',
});

const taskListStatus = Object.freeze({
  COMPLETE: 'Complete',
  INCOMPLETE: 'Incomplete',
});

const checkTaskList = (taskList, status) =>      `//li[contains(@class, 'app-task-list__item') and .//a[contains(text(), "${taskList}")] and .//strong[contains(text(), "${status}")]]`;

module.exports = {
  taskListItems,
  taskListStatus,
  checkTaskList,
};
