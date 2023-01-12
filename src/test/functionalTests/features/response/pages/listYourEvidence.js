
const I = actor();

const fields ={
  firstSelection: '[id="evidenceItem[0][type]"]',
  firstEvidenceItem: '[id="evidenceItem[0][description]"]',
};

class ListYourEvidence {

  selectEvidenceFromDropDown() {
    I.see('List your evidence', 'h1');
    I.selectOption(fields.firstSelection, 'Contracts and agreements');
    I.fillField(fields.firstEvidenceItem, 'TestEvidence');
    I.click('Save and continue');
  }
}

module.exports = ListYourEvidence;