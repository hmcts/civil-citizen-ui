
const I = actor();

const fields ={
  yesButton: 'input[id="sentExpertReportsOptions"]',
  noButton: 'input[id="sentExpertReportsOptions-2"]',
};

class SentExpertReports {

  async SentExpertReports() {
    await I.see('Have you already sent expert reports to other parties?', 'h1');
    await I.click(fields.noButton);
    await I.click('Save and continue');
  }
}

module.exports = SentExpertReports;
