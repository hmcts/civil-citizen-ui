
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class HearingRequirements {

  async selectHearingRequirements(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/determination-without-hearing');
    await I.see('Determination without Hearing Questions', 'h1');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = HearingRequirements;
