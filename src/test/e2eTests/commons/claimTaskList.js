const taskListItems = Object.freeze({
  RESOLVING_THIS_DISPUTE: 'Resolving this dispute',
  COMPLETING_YOUR_CLAIM: 'Completing your claim',
  YOUR_DETAILS: 'Your details',
  THEIR_DETAILS: 'Their details',
  CLAIM_AMOUNT: 'Claim amount',
  CLAIM_DETAILS: 'Claim details',
  CHECK_AND_SUBMIT_YOUR_CLAIM: 'Check and submit your claim',
});

const responseTaskListItems = Object.freeze({
  CONFIRM_YOUR_DETAILS: 'Confirm your details',
  VIEW_YOUR_OPTIONS_BEFORE_RESPONSE_DEADLINE: 'View your options before response deadline',
  CHOOSE_A_RESPONSE: 'Choose a response',
  CHECK_AND_SUBMIT_YOUR_RESPONSE: 'Check and submit your response',
  DECIDE_HOW_YOU_WILL_PAY: 'Decide how you\'ll pay',
  TELL_US_HOW_MUCH_YOU_HAVE_PAID: 'Tell us how much you\'ve paid',
  FREE_TELEPHONE_MEDIATION: 'Free telephone mediation',
  GIVE_US_DETAILS_IN_CASE_THERE_IS_A_HEARING: 'Give us details in case there\'s a hearing',
  TELL_US_WHY_YOU_DISAGREE_WITH_THE_CLAIM : 'Tell us why you disagree with the claim',
  SHARE_YOUR_FINANCIAL_DETAILS: 'Share your financial details',
  YOUR_REPAYMENT_PLAN: 'Your repayment plan',
  HOW_MUCH_HAVE_YOU_PAID: 'How much have you paid?',
  WHY_DO_YOU_DISAGREE_WITH_THE_AMOUNT_CLAIMED: 'Why do you disagree with the amount claimed?',
  HOW_MUCH_MONEY_DO_YOU_ADMIT_YOU_OWE: 'How much money do you admit you owe?',
  WHEN_WILL_YOU_PAY:'When will you pay the £500.00?',
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
  responseTaskListItems,
};
