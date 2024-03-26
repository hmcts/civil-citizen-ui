const config = require('../../../../config');
const I = actor();

const fields = {
  successBanner: 'div[class="hmcts-banner hmcts-banner--success"]',
};

class CaseDetails {
  async goToCaseDetails(claimRef) {
    await I.amOnPage(config.url.manageCase + '/cases/case-details/' + claimRef);
    await I.waitForText('Summary', config.WaitForText);
  }

  async verifySuccessBanner(message) {
    I.waitForText('Summary');
    I.seeElement(fields.successBanner);
    I.see(message);
  }
}
module.exports = new CaseDetails();