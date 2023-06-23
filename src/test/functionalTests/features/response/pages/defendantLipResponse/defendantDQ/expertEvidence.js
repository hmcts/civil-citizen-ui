
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
};

class ExpertEvidence {

  SelectOptionForExpertEvidence() {
    I.see('Do you want to use expert evidence?', 'h1');
    I.click(fields.yesButton);
    I.click('Save and continue');
  }
}

module.exports = ExpertEvidence;
