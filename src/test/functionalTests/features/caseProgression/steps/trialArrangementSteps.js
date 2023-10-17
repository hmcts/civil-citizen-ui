const LatestUpdate = require('../pages/latestUpdate');
const TrialArrangementsIntroduction = require('../pages/trialArrangements/trialArrangementsIntroduction');
const IsYourCaseReadyForTrial = require('../pages/trialArrangements/isYourCaseReadyForTrial');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const trialArrangementsIntroduction = new TrialArrangementsIntroduction();
const isYourCaseReadyForTrial = new IsYourCaseReadyForTrial();

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
  }
}

module.exports = new TrialArrangementSteps();
