const ContactUs = require('../../common/contactUs');
const I = actor();
const config = require('../../../../config');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');
const {retry} = require('../../../specClaimHelpers/api/retryHelper');
const {waitForGAFinishedBusinessProcess} = require('../../../specClaimHelpers/api/testingSupport');

const contactUs = new ContactUs();

class SubmitGAConfirmation {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[@class=\'govuk-link\' and contains(text(), \'Close and return to case details\')]');
  }

  async nextAction (nextAction) {
    if (nextAction === 'Pay application fee') {
      // The confirmation page can appear before the GA payment reference exists.
      const href = await I.grabAttributeFrom('//a[contains(text(), "Pay application fee")]', 'href');
      const url = new URL(href, config.TestUrl);
      const parentCaseId = url.pathname.match(/\/case\/(\d+)\//)[1];
      const applicationId = url.searchParams.get('id');
      let gaCaseId;
      await retry(async () => {
        const {case_data: caseData} = await apiRequest.fetchCaseDetails(config.systemUpdate, parentCaseId);
        gaCaseId = caseData.generalApplications?.find(application => application.id === applicationId)?.value?.caseLink?.CaseReference;
        if (!gaCaseId) throw new Error('General application case has not been created yet');
      }, 60, 4000);
      await waitForGAFinishedBusinessProcess(gaCaseId, config.systemUpdate);
    }
    await I.click(nextAction);
  }

  async verifyPageContent(feeAmount) {
    await this.checkPageFullyLoaded();
    await this.verifyHeadingDetails();
    await this.verifyPageText(feeAmount);
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Application created', 'h1');
    await I.see('You need to pay the application fee to submit the application');
  }

  async verifyPageText(feeAmount) {
    await I.see('What happens next', 'h2');
    await I.see(`Your application has been saved, but you need to pay the application fee of £${feeAmount}.`);
    await I.see('Until you pay the application fee, the application will not be sent to the other parties or considered by a judge.');
    await I.see('You\'ll have the option to apply for help with fees once you\'ve clicked \'Pay application fee\'.');
    await I.seeElement('//a[@class=\'govuk-button\' and contains(text(), \'Pay application fee\')]\n');
  }
}

module.exports = SubmitGAConfirmation;
