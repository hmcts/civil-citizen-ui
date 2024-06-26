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

  initiateTrialArrangementJourney(claimRef, claimType, readyForTrial, partyType, language = 'en') {
    console.log('The value of the Claim Reference : ' + claimRef);
    if (partyType === 'LiPvLiP') {
      I.amOnPage('/case/' + claimRef + '/case-progression/finalise-trial-arrangements');
    } else {
      latestUpdateTab.open(claimRef, claimType, true, false, true);
      latestUpdateTab.nextAction('Finalise trial arrangements');
    }
    trialArrangementsIntroduction.verifyPageContent();
    trialArrangementsIntroduction.nextAction(buttons.startNow[language]);
    isYourCaseReadyForTrial.verifyPageContent();
    isYourCaseReadyForTrial.inputDataForIsThisCaseReadyForTrialPage(readyForTrial);
    isYourCaseReadyForTrial.nextAction(buttons.continue[language]);
    hasAnythingChanged.verifyPageContent();
    hasAnythingChanged.inputDataForHasAnythingChangedSection();
    hasAnythingChanged.nextAction(buttons.continue[language]);
    trialDuration.verifyPageContent();
    trialDuration.inputDataForTrialDurationOtherInformation();
    trialDuration.nextAction(buttons.continue[language]);
    checkYourAnswers.verifyPageContent();
    checkYourAnswers.nextAction(buttons.submit[language]);
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
