
const I = actor();

const fields ={
  yesButton: 'input[id="option"]',
  noButton: 'input[id="option-2"]',
  firstExpertsName: 'input[id="reportDetails[0][expertName]"]',
  firstExpertReportDay:'input[id="reportDetails[0][day]"]',
  firstExpertReportMonth: 'input[id="reportDetails[0][month]"]',
  firstExpertReportYear: 'input[id="reportDetails[0][year]"]',
};

class ExpertReportDetails {

  async enterExpertReportDetails(expertName, day, month, year) {
    await I.see('Have you already got a report written by an expert?', 'h1');
    await I.click(fields.yesButton);
    await I.fillField(fields.firstExpertsName, expertName);
    await I.fillField(fields.firstExpertReportDay, day);
    await I.fillField(fields.firstExpertReportMonth, month);
    await I.fillField(fields.firstExpertReportYear, year);
    await I.click('Save and continue');
  }
}

module.exports = ExpertReportDetails;
