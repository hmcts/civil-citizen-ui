const LatestUpdate = require('../pages/latestUpdate');
const TrialArrangementsIntroduction = require('../pages/trialArrangements/trialArrangementsIntroduction');
const IsYourCaseReadyForTrial = require('../pages/trialArrangements/isYourCaseReadyForTrial');
const HasAnythingChanged = require ('../pages/trialArrangements/hasAnythingChanged');
const TrialDuration = require ('../pages/trialArrangements/trialDuration');
const CheckYourAnswers = require ('../pages/trialArrangements/checkYourAnswers');
const TrialArrangementsConfirmation = require ('../pages/trialArrangements/trialArrangementsConfirmation');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const trialArrangementsIntroduction = new TrialArrangementsIntroduction();
const isYourCaseReadyForTrial = new IsYourCaseReadyForTrial();
const hasAnythingChanged = new HasAnythingChanged();
const trialDuration = new TrialDuration();
const checkYourAnswers = new CheckYourAnswers();
const trialArrangementConfirmation = new TrialArrangementsConfirmation();

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
    await trialArrangementsIntroduction.verifyPageContent(caseNumber, claimAmount, deadline);
    await trialArrangementsIntroduction.nextAction(buttons.startNow[language]);
    await isYourCaseReadyForTrial.verifyPageContent(caseNumber, claimAmount);
    await isYourCaseReadyForTrial.inputDataForIsThisCaseReadyForTrialPage(readyForTrial);
    await isYourCaseReadyForTrial.nextAction(buttons.continue[language]);
    await hasAnythingChanged.verifyPageContent(caseNumber, claimAmount);
    await hasAnythingChanged.inputDataForHasAnythingChangedSection();
    await hasAnythingChanged.nextAction(buttons.continue[language]);
    await trialDuration.verifyPageContent(caseNumber, claimAmount);
    await trialDuration.inputDataForTrialDurationOtherInformation();
    await trialDuration.nextAction(buttons.continue[language]);
    await checkYourAnswers.verifyPageContent(caseNumber, claimAmount);
    await checkYourAnswers.nextAction(buttons.submit[language]);
  }

  async verifyTrialArrangementsMade(readyForTrial) {
    await trialArrangementConfirmation.verifyPageContent(readyForTrial);
    await trialArrangementConfirmation.nextAction('Go to your account');
  }

  async verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType) {
    console.log('The value of the Claim Reference : ' + claimRef);
    await latestUpdateTab.open(claimRef, claimType, true, false, true, true);
    await latestUpdateTab.nextAction('View trial arrangements');
  }
}

module.exports = new TrialArrangementSteps();
