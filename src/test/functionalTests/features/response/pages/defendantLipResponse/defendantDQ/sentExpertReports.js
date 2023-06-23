
const I = actor();

const fields ={
  yesButton: 'input[id="sentExpertReportsOptions"]',
  noButton: 'input[id="sentExpertReportsOptions-2"]',
};

class SentExpertReports {

  SentExpertReports() {
    I.see('Have you already sent expert reports to other parties?', 'h1');
    I.click(fields.noButton);
    I.click('Save and continue');
  }
}

module.exports = SentExpertReports;
