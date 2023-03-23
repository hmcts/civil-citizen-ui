
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class DqExpert {

  selectHearingRequirements(claimRef) {
    I.amOnPage('/case/'+claimRef+'/directions-questionnaire/expert');
    I.see('Determination without Hearing Questions', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = DqExpert;
