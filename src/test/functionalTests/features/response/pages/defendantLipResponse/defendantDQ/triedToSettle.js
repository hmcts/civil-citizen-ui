
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class TriedToSettle {

  selectTriedToSettle(claimRef) {
    I.amOnPage('/case/'+claimRef+'/directions-questionnaire/tried-to-settle');
    I.see('Have you tried to settle this claim before going to court?', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = TriedToSettle;
