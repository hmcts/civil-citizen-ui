const I = actor();

const fields = {
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  reason_for_hearing: '#reasonForHearing'
};

class HearingRequirements {

  selectHearingRequirements(claimRef, option = 'Yes') {
    I.amOnPage('/case/' + claimRef + '/directions-questionnaire/determination-without-hearing');
    I.see('Determination without Hearing Questions', 'h1');
    switch (option) {
      case 'Yes': {
        I.click(fields.yesButton);
        break;
      }
      case 'No': {
        I.click(fields.noButton);
        I.fillField(fields.reason_for_hearing, 'Test Reason');
        break;
      }
      default:
        I.click(fields.yesButton);
    }
    I.click('Save and continue');
  }
}

module.exports = HearingRequirements;
