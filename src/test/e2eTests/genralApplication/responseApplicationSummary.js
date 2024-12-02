const I = actor();

class ResponseApplicationSummary {

  viewResponseApplicationSummary(claimId, appId, applicationStatus) {
    I.amOnPage(`/case/${claimId}/response/general-application/summary`);
    I.see('Application Status');
    I.see(applicationStatus);
    I.see('Application ID');
    I.see(appId);
  }
}

module.exports = new ResponseApplicationSummary();
