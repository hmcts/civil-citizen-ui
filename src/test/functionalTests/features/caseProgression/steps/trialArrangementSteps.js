const LatestUpdate = require('../pages/latestUpdate');
const TrialArrangementsIntroduction = require('../pages/trialArrangements/trialArrangementsIntroduction');
const IsYourCaseReadyForTrial = require('../pages/trialArrangements/isYourCaseReadyForTrial');
const HasAnythingChanged = require ('../pages/trialArrangements/hasAnythingChanged');
const TrialDuration = require ('../pages/trialArrangements/trialDuration');
const CheckYourAnswers = require ('../pages/trialArrangements/checkYourAnswers');
const TrialArrangementsConfirmation = require ('../pages/trialArrangements/trialArrangementsConfirmation');
//const NoticesAndOrders = require('../pages/noticesAndOrders');

const I = actor(); // eslint-disable-line no-unused-vars
const latestUpdateTab = new LatestUpdate();
const trialArrangementsIntroduction = new TrialArrangementsIntroduction();
const isYourCaseReadyForTrial = new IsYourCaseReadyForTrial();
const hasAnythingChanged = new HasAnythingChanged();
const trialDuration = new TrialDuration();
const checkYourAnswers = new CheckYourAnswers();
const trialArrangementConfirmation = new TrialArrangementsConfirmation();
//const noticesAndOrders =  new NoticesAndOrders();

class TrialArrangementSteps {

  initiateTrialArrangementJourney(claimRef, claimType, readyForTrial, partyType) {
    console.log('The value of the Claim Reference : ' + claimRef);
    let partiesOnTheCase;
    if (partyType === 'LiPvLiP') {
      partiesOnTheCase = 'Miss Jane Doe v Sir John Doe';
      I.amOnPage('/case/' + claimRef + '/case-progression/finalise-trial-arrangements');
    } else {
      partiesOnTheCase = 'Test Inc v Sir John Doe';
      latestUpdateTab.open(claimRef, claimType, true, false, true);
      latestUpdateTab.nextAction('Finalise trial arrangements');
    }
    trialArrangementsIntroduction.verifyPageContent(partiesOnTheCase);
    trialArrangementsIntroduction.nextAction('Start now');
    isYourCaseReadyForTrial.verifyPageContent(partiesOnTheCase);
    isYourCaseReadyForTrial.inputDataForIsThisCaseReadyForTrialPage(readyForTrial);
    isYourCaseReadyForTrial.nextAction('Continue');
    hasAnythingChanged.verifyPageContent(partiesOnTheCase);
    hasAnythingChanged.inputDataForHasAnythingChangedSection();
    hasAnythingChanged.nextAction('Continue');
    trialDuration.verifyPageContent(partiesOnTheCase);
    trialDuration.inputDataForTrialDurationOtherInformation();
    trialDuration.nextAction('Continue');
    checkYourAnswers.verifyPageContent(partiesOnTheCase);
    checkYourAnswers.nextAction('Submit');
  }

  verifyTrialArrangementsMade() {
    trialArrangementConfirmation.checkPageFullyLoaded();
    trialArrangementConfirmation.verifyPageContent();
    //BUG CIV-12591
    /*trialArrangementConfirmation.nextAction('//a[contains(.,\'Return to case details\')]');
    latestUpdateTab.verifyTrialArrangementsFinalisedTile(); //Latest update page - verify that the Trial Arrangement Tile appears.
    latestUpdateTab.nextAction('[href=\'#notices-orders\']');
    noticesAndOrders.verifyLatestUpdatePageContent();*/
  }

  verifyOtherPartyFinalisedTrialArrangementsJourney(claimRef, claimType) {
    console.log('The value of the Claim Reference : ' + claimRef);
    latestUpdateTab.open(claimRef, claimType, true, false, true, true);
    latestUpdateTab.nextAction('View trial arrangements');
  }
}

module.exports = new TrialArrangementSteps();
