
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class GiveEvidenceYourself {

  SelectGiveEvidenceYourself(claimRef) {
    I.amOnPage('/case/'+claimRef+'/directions-questionnaire/give-evidence-yourself');
    I.see('Do you want to give evidence yourself?', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = GiveEvidenceYourself;
