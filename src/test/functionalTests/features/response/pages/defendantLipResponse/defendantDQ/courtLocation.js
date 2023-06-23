
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  courtLocation: 'select[id="courtLocation"]',
  courtLocationReason: 'textarea[id="reason"]',
};

class CourtLocation {

  selectPreferredCourtLocation() {
    I.waitForElement(fields.courtLocation, 10);
    I.see('Do you want to ask for the hearing to be held at a specific court?', 'h1');
    I.see('You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing.');
    I.click(fields.yesButton);
    I.selectOption(fields.courtLocation, 'Leeds Combined Court Centre - The Court House, 1 Oxford Row - LS1 3BG');
    I.fillField(fields.courtLocationReason, 'Nearest court');
    I.click('Save and continue');
  }
}

module.exports = CourtLocation;
