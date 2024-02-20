const I = actor();
const config = require('../../../../../../config');
const sharedData = require('../../../../../sharedData');

const fields ={
  firstSelection: '[id="evidenceItem[0][type]"]',
  firstEvidenceItem: '[id="evidenceItem[0][description]"]',
};

const content = {
  heading: {
    en: 'List your evidence',
    cy: 'Rhestru eich tystiolaeth',
  },
};

const buttons = {
  saveAndContinue: {
    en: 'Save and continue',
    cy: 'Cadw a Pharhau',
  },
};

const dropdowns = {
  firstSelection: {
    en: 'Contracts and agreements',
    cy: 'Contractau a chytundebau',
  },
};

const inputs = {
  firstEvidenceItem: {
    en: 'TestEvidence',
    cy: 'Tystiolaeth Prawf',
  },
};

class ListYourEvidence {

  async selectEvidenceFromDropDown() {
    const language = sharedData.language; 
    await I.waitForText(content.heading[language], config.WaitForText);
    await I.selectOption(fields.firstSelection, dropdowns.firstSelection[language]);
    await I.fillField(fields.firstEvidenceItem, inputs.firstEvidenceItem[language]);
    await I.click(buttons.saveAndContinue[language]);
  }
}

module.exports = ListYourEvidence;
