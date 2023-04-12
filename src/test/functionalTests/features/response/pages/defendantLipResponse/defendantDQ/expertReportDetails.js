
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

  enterExpertReportDetails(claimRef, expertName, day, month, year) {
    I.amOnPage('/case/'+claimRef+'/directions-questionnaire/expert-report-details');
    I.see('Have you already got a report written by an expert?', 'h1');
    I.click(fields.yesButton);
    I.fillField(fields.firstExpertsName, expertName);
    I.fillField(fields.firstExpertReportDay, day);
    I.fillField(fields.firstExpertReportMonth, month);
    I.fillField(fields.firstExpertReportYear, year);
    I.click('Save and continue');
  }
}

module.exports = ExpertReportDetails;
