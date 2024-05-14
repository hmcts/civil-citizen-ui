const apiRequest = require('../specClaimHelpers/api/apiRequest');
const config = require('../../config');
const testingSupport = require('../specClaimHelpers/api/apiRequest');

module.exports = {
  adjustCaseSubmittedDateForCarm: async (caseId, carmEnabled = false) => {
    if (carmEnabled) {
      console.log('carm enabled, updating submitted date');
      await apiRequest.setupTokens(config.systemUpdate);
      const submittedDate = {'submittedDate':'2024-08-10T15:59:50'};
      await testingSupport.updateCaseData(caseId, submittedDate);
      console.log('submitted date update to after carm date');
    }
    if (!carmEnabled) {
      console.log('carm not enabled, updating submitted date');
      await apiRequest.setupTokens(config.systemUpdate);
      const submittedDate = {'submittedDate':'2022-05-10T15:59:50'};
      await testingSupport.updateCaseData(caseId, submittedDate);
      console.log('submitted date update to before carm date');
    }
  },
};
