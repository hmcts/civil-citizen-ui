
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class TriedToSettle {

  async selectTriedToSettle(claimRef) {
    await I.amOnPage('/case/'+claimRef+'/directions-questionnaire/tried-to-settle');
    await I.see('Have you tried to settle this claim before going to court?', 'h1');
    await I.click(fields.yesButton);
    await I.click('Save and continue');
  }
}

module.exports = TriedToSettle;
