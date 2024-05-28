const UploadTranslatedDocuments = require('../pages/uploadTranslatedDocuments');
const CheckYourAnswers = require('../pages/checkYourAnswers');
const CaseDetails = require('../../caseworkerDashboard/pages/caseDetails');
const {formatClaimRef} = require('../../../helpers/caseDataHelpers');

class UploadTranslatedDocumentsSteps{

  async UploadTranslatedDocuments(claimRef) {
    await UploadTranslatedDocuments.startEvent(claimRef);
    await UploadTranslatedDocuments.verifyContent();
    await UploadTranslatedDocuments.uploadTranslatedDocument();
  }

  async CheckAndSubmit() {
    await CheckYourAnswers.verifyContent();
    await CheckYourAnswers.submit();
  }

  async VerifySuccessBanner(claimRef) {
    await CaseDetails.verifySuccessBanner(`Case ${formatClaimRef(claimRef)} has been updated with event: Upload translated document`);
  }
}

module.exports = new UploadTranslatedDocumentsSteps();