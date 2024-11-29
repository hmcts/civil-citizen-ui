const {clickButton} = require('../commons/clickButton');
const {buttonType} = require('../commons/buttonVariables');
const I = actor();

class RequestMoreInformation {
  respondAdditionalInfo(claimId, appId, option) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/${appId}/respond-addln-info`);
    I.fillField('#additionalText', 'Request more information');
    I.click(option);
    clickButton(buttonType.CONTINUE);
  }

  cyaPage(claimId, appId) {
    I.seeInCurrentUrl(`case/${claimId}/general-application/${appId}/upload-documents-for-addln-info/check-and-send`);
    clickButton(buttonType.SUBMIT);
  }

  verifySucessfullPage() {
    I.see('You\'ve submitted the information');
  }
}

module.exports = new RequestMoreInformation();
