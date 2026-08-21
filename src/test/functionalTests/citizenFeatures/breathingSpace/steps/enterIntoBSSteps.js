const breathingSpaceInfo = require('../../breathingSpace/pages/breathingSpaceInfo');
const enterBreathingSpace = require('../../breathingSpace/pages/enterBreathingSpace');
const breathingSpaceStartDate = require('../../breathingSpace/pages/breathingSpaceStartDate');
const breathingSpaceCYA = require('../../breathingSpace/pages/breathingSpaceCYA');
const breathingSpaceConfirmation = require('../../breathingSpace/pages/breathingSpaceConfirmation');

const I = actor();

const breathingSpaceInfoPage = new breathingSpaceInfo();
const enterBreathingSpacePage = new enterBreathingSpace();
const breathingSpaceStartDatePage = new breathingSpaceStartDate();
const breathingSpaceCYAPage = new breathingSpaceCYA();
const breathingSpaceConfirmationPage = new breathingSpaceConfirmation();

const referenceNumber = 'BS123456789';

class enterIntoBSSteps {
  async enterIntoBS(type, caseRef, currentDay, currentMonth, currentYear)
  {
    await I.amOnPage(`dashboard/${caseRef}/breathing-space-info`);
    await breathingSpaceInfoPage.verifyPageContent();
    await breathingSpaceInfoPage.clickEnterBreathingSpaceDetailsLink();
    await I.amOnPage(`dashboard/${caseRef}/breathing-space/enter`);

    await enterBreathingSpacePage.verifyPageContent();
    if(type === 'Standard Breathing Space'){
      await enterBreathingSpacePage.selectStandardBreathingSpace();
    }
    else{
      await enterBreathingSpacePage.selectMentalHealthCrisisMoratorium();
    }
    await enterBreathingSpacePage.enterReferenceNumber(referenceNumber);
    await enterBreathingSpacePage.clickContinue();

    await breathingSpaceStartDatePage.verifyPageContent(type);
    await breathingSpaceStartDatePage.enterStartDate(currentDay, currentMonth, currentYear);
    await breathingSpaceStartDatePage.clickContinue();

    await breathingSpaceCYAPage.verifyPageContent();
    await breathingSpaceCYAPage.verifyBreathingSpaceType(type);
    await breathingSpaceCYAPage.verifyReferenceNumber(referenceNumber);
    await breathingSpaceCYAPage.clickContinue();

    await breathingSpaceConfirmationPage.verifyPageContent(type);
    await breathingSpaceConfirmationPage.clickReturnToCaseSummary();
  }
}

module.exports = new enterIntoBSSteps();
