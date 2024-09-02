const CaseDetails = require('../pages/caseDetails');

class CaseworkerCitizenDashboardSteps {
  async NavigateToCaseDetails(claimRef) {
    await CaseDetails.goToCaseDetails(claimRef);
  }
}

module.exports = new CaseworkerCitizenDashboardSteps();
