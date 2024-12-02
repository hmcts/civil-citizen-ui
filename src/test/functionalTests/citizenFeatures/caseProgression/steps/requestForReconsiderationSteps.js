const RequestForReconsideration = require('../pages/requestForReconsideration/requestForReconsideration.js');
const CheckYourAnswers = require('../pages/requestForReconsideration/checkYourAnswers.js');
const RequestForReconsiderationConfirmation = require('../pages/requestForReconsideration/requestForReconsiderationConfirmation.js');
const CommentsForReconsideration = require('../pages/requestForReconsideration/commentsForReconsideration.js');
const CommentsForReconsiderationConfirmation = require('../pages/requestForReconsideration/commentsForReconsiderationConfirmation.js');

const I = actor(); // eslint-disable-line no-unused-vars
const requestForReconsiderationPage = new RequestForReconsideration();
const checkYourAnswersPage = new CheckYourAnswers();
const confirmationPage = new RequestForReconsiderationConfirmation();
const addYourCommentsPage = new CommentsForReconsideration();
const commentsConfirmationPage = new CommentsForReconsiderationConfirmation();

const reason = 'Reasons for request. $%@';

class requestForReconsiderationSteps {
  async initiateRequestForReconsideration(caseNumber, claimAmount, partyName, deadline) {
    await requestForReconsiderationPage.verifyPageContent(caseNumber, claimAmount, partyName);
    await requestForReconsiderationPage.addReasons(reason);
    await requestForReconsiderationPage.nextAction('Continue');
    await checkYourAnswersPage.verifyPageContent(reason, caseNumber, claimAmount, 'RequestForReconsideration');
    await checkYourAnswersPage.nextAction('Submit');
    await confirmationPage.verifyPageContent(partyName, deadline);
    await confirmationPage.nextAction('Close and return to case overview');
  }

  async initiateAddYourComments(caseNumber, claimAmount, partyName) {
    await addYourCommentsPage.verifyPageContent(caseNumber, claimAmount, partyName);
    await addYourCommentsPage.addComments(reason);
    await addYourCommentsPage.nextAction('Continue');
    await checkYourAnswersPage.verifyPageContent(reason, caseNumber, claimAmount);
    await checkYourAnswersPage.nextAction('Submit');
    await commentsConfirmationPage.verifyPageContent(partyName);
    await confirmationPage.nextAction('Close and return to case overview');
  }
}

module.exports = new requestForReconsiderationSteps();
