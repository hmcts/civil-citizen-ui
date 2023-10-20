const LatestUpdate = require('../pages/latestUpdate');
const TrialArrangementsIntroduction = require('../pages/trialArrangements/trialArrangementsIntroduction');
const IsYourCaseReadyForTrial = require('../pages/trialArrangements/isYourCaseReadyForTrial');
const HasAnythingChanged = require ('../pages/trialArrangements/hasAnythingChanged');
const TrialDuration = require ('../pages/trialArrangements/trialDuration');
const CheckYourAnswers = require ('../pages/trialArrangements/checkYourAnswers');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const trialArrangementsIntroduction = new TrialArrangementsIntroduction();
const isYourCaseReadyForTrial = new IsYourCaseReadyForTrial();
const hasAnythingChanged = new HasAnythingChanged();
const trialDuration = new TrialDuration();
const checkYourAnswers = new CheckYourAnswers();

class TrialArrangementSteps {

  initiateTrialArrangementJourney(claimRef, claimType) {
    console.log('The value of the Claim Reference : ' + claimRef);
    latestUpdateTab.open(claimRef, claimType, true, false, true);
    latestUpdateTab.nextAction('Finalise trial arrangements');
    trialArrangementsIntroduction.verifyPageContent();
    trialArrangementsIntroduction.nextAction('Start now');
    isYourCaseReadyForTrial.verifyPageContent();
    isYourCaseReadyForTrial.inputDataForIsThisCaseReadyForTrialPage();
    isYourCaseReadyForTrial.nextAction('Continue');
    hasAnythingChanged.verifyPageContent();
    hasAnythingChanged.inputDataForHasAnythingChangedSection();
    hasAnythingChanged.nextAction('Continue');
    trialDuration.verifyPageContent();
    trialDuration.inputDataForTrialDurationOtherInformation();
    trialDuration.nextAction('Continue');
    checkYourAnswers.verifyPageContent();
    checkYourAnswers.nextAction('Submit');
  }
}

module.exports = new TrialArrangementSteps();
