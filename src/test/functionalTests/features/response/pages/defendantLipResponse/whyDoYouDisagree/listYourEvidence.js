
const I = actor();

const fields ={
  firstSelection: '[id="evidenceItem[0][type]"]',
  firstEvidenceItem: '[id="evidenceItem[0][description]"]',
};

class ListYourEvidence {

  async selectEvidenceFromDropDown() {
    await I.see('List your evidence', 'h1');
    await I.selectOption(fields.firstSelection, 'Contracts and agreements');
    await I.fillField(fields.firstEvidenceItem, 'TestEvidence');
    await I.click('Save and continue');
  }
}

module.exports = ListYourEvidence;