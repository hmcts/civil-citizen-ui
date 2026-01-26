const LatestUpdate = require('../pages/latestUpdate');
const TrialArrangementsIntroduction = require('../pages/trialArrangements/trialArrangementsIntroduction');
const IsYourCaseReadyForTrial = require('../pages/trialArrangements/isYourCaseReadyForTrial');
const HasAnythingChanged = require ('../pages/trialArrangements/hasAnythingChanged');
const TrialDuration = require ('../pages/trialArrangements/trialDuration');
const CheckYourAnswers = require ('../pages/trialArrangements/checkYourAnswers');
const TrialArrangementsConfirmation = require ('../pages/trialArrangements/trialArrangementsConfirmation');
const NoticesAndOrders = require('../pages/noticesAndOrders');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const trialArrangementsIntroduction = new TrialArrangementsIntroduction();
const isYourCaseReadyForTrial = new IsYourCaseReadyForTrial();
const hasAnythingChanged = new HasAnythingChanged();
const trialDuration = new TrialDuration();
const checkYourAnswers = new CheckYourAnswers();
const trialArrangementConfirmation = new TrialArrangementsConfirmation();
const noticesAndOrders =  new NoticesAndOrders();

const buttons = {
  startNow: {
    en: 'Start now',
    cy: 'Dechrau nawr',
  },
  continue: {
    en: 'Continue',
    cy: 'Parhau',
  },
  submit: {
    en: 'Submit',
    cy: 'Cyflwyno',
  },
};

class TrialArrangementSteps {

  async initiateTrialArrangementJourney(claimRef, claimType, caseNumber, claimAmount, deadline, readyForTrial, partyType,  language = 'en') {
    console.log('The value of the Claim Reference : ' + claimRef);
    trialArrangementsIntroduction.verifyPageContent(caseNumber, claimAmount, deadline);
    trialArrangementsIntroduction.nextAction(buttons.startNow[language]);
    isYourCaseReadyForTrial.verifyPageContent(caseNumber, claimAmount);
    isYourCaseReadyForTrial.inputDataForIsThisCaseReadyForTrialPage(readyForTrial);
    isYourCaseReadyForTrial.nextAction(buttons.continue[language]);
    hasAnythingChanged.verifyPageContent(caseNumber, claimAmount);
    hasAnythingChanged.inputDataForHasAnythingChangedSection();
    hasAnythingChanged.nextAction(buttons.continue[language]);
    trialDuration.verifyPageContent(caseNumber, claimAmount);
    trialDuration.inputDataForTrialDurationOtherInformation();
    trialDuration.nextAction(buttons.continue[language]);
    checkYourAnswers.verifyPageContent(caseNumber, claimAmount);
    checkYourAnswers.nextAction(buttons.submit[language]);
  }

  async verifyTrialArrangementsMade(readyForTrial) {
    trialArrangementConfirmation.verifyPageContent(readyForTrial);
    trialArrangementConfirmation.nextAction('Go to your account');
  }

  verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType) {
    console.log('The value of the Claim Reference : ' + claimRef);
    latestUpdateTab.open(claimRef, claimType, true, false, true, true);
    latestUpdateTab.nextAction('View trial arrangements');
  }
}

module.exports = new TrialArrangementSteps();
