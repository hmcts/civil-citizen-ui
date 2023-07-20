const config =  require('../../../../../../config');
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  courtLocation: 'select[id="courtLocation"]',
  courtLocationReason: 'textarea[id="reason"]',
};

class CourtLocation {
  async selectPreferredCourtLocation() {
    await I.waitForText('Do you want to ask for the hearing to be held at a specific court?', config.WaitForText);
    await I.see('You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing.');
    await I.click(fields.yesButton);
    await I.selectOption(fields.courtLocation, config.defendantSelectedCourt);
    await I.fillField(fields.courtLocationReason, 'Nearest court');
    await I.click('Save and continue');
  }
}

module.exports = CourtLocation;
