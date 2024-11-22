const {buttonType} = require('../commons/buttonVariables');
const I = actor();

class ResponseFromCourt {
  viewApplication(claimId, appId) {
    I.amOnPage(`case/${claimId}/general-application/${appId}/view-application`);
  }

  checkResponseFromCourtSection(typeOfResponse, buttonType) {
    I.see('Response from the court');
    I.click('//summary[contains(.,"Response from the court")]');
    I.see('Type of response');
    I.see(typeOfResponse);
    I.click(buttonType);
  }

  additionalFeePage(fee) {
    I.see('You must pay an additional fee');
    I.see('The court has decided that your application must be submitted \'with notice\'. This means that the other parties will receive a copy of the application and will be able to respond to what you have said.');
    I.see(`A 'with notice' application costs £${fee}`);
    I.click('Make the payment');
  }

  feeSelectionPage(option) {
    I.see('Pay additional application fee');
    I.see('Do you want to apply for help with fees?');
    I.click(option);
    I.click(buttonType.CONTINUE);
  }

  verifyPaymentSuccessfullPage(claimId, AppId) {
    if (claimId && AppId) {
      I.seeInCurrentUrl(`/case/${claimId}/general-application/${AppId}/payment-successful`);
    }
    I.see('Your payment was\n' +
      'successful');

  }

}

module.exports = new ResponseFromCourt();
