const exitBreathingSpace = require('../../breathingSpace/pages/exitBreathingSpace');
const exitBreathingSpaceCYA = require('../../breathingSpace/pages/exitBreathingSpaceCYA');
const exitBreathingSpaceConfirmation = require('../../breathingSpace/pages/exitBreathingSpaceConfirmation');

const I = actor();

const exitBreathingSpacePage = new exitBreathingSpace();
const exitBreathingSpaceCYAPage = new exitBreathingSpaceCYA();
const exitBreathingSpaceConfirmationPage = new exitBreathingSpaceConfirmation();

class exitFromBSSteps {
  async exitFromBS(type,caseRef, exitDay, exitMonth, exitYear) {
    await I.amOnPage(`dashboard/${caseRef}/breathing-space/lift`);

    await exitBreathingSpacePage.verifyPageContent();

    await exitBreathingSpacePage.enterExitDate(exitDay, exitMonth, exitYear);
    await exitBreathingSpacePage.enterLiftReason();
    await exitBreathingSpacePage.clickContinue();

    await exitBreathingSpaceCYAPage.verifyPageContent();
    await exitBreathingSpaceCYAPage.clickContinue();

    await exitBreathingSpaceConfirmationPage.verifyPageContent(type);
    await exitBreathingSpaceConfirmationPage.clickReturnToCaseSummary();
  }
}

module.exports = new exitFromBSSteps();
