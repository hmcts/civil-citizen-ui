
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  courtLocation: 'select[id="courtLocation"]',
  courtLocationReason: 'textarea[id="reason"]',
};

class CourtLocation {

  selectPreferredCourtLocation() {
    I.see('Do you want to ask for the hearing to be held at a specific court?', 'h1');
    I.see('You can ask for the hearing to be held at a specific court, for example, if you spend weekdays a long distance from your home. The court will consider both parties\' circumstances when deciding where to hold the hearing.');
    I.click(fields.yesButton);
    I.selectOption(fields.courtLocation, 'Barnsley Law Courts - THE COURT HOUSE, WESTGATE - S70 2DW');
    I.fillField(fields.courtLocationReason, 'Nearest court');
    I.click('Save and continue');
  }
}

module.exports = CourtLocation;
