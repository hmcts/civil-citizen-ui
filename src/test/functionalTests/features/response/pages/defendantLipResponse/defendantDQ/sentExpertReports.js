const I = actor();
const config = require('../../../../../../config');

const fields ={
  yesButton: 'input[id="sentExpertReportsOptions"]',
  noButton: 'input[id="sentExpertReportsOptions-2"]',
};

class SentExpertReports {

  async SentExpertReports() {
    await I.waitForText('Have you already sent expert reports to other parties?', config.WaitForText);
    await I.click(fields.noButton);
    await I.click('Save and continue');
  }
}

module.exports = SentExpertReports;
