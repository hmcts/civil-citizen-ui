const I = actor();
const GovPay = require ('../../common/govPay');
const govPay = new GovPay();

const feeAmountForAskingMoreTime = 119;
class createGAAppSteps {

  async askForMoreTimeCourtOrderGA(caseRef, informOtherParty = false) {
    await I.waitForContent('Contact the court to request a change to my case', 60);
    await I.click('Contact the court to request a change to my case');
    await I.amOnPage(`case/${caseRef}/general-application/application-type`);
    await I.waitForContent('Select application', 60);
    await I.click('Ask for more time to do what is required by a court order'); //#option-5
    await I.click('Continue');

    if (informOtherParty) {
      await I.waitForContent('Have the other parties agreed to this application?', 60);
      await I.click('Yes'); //#option
      await I.click('Continue');
    } else {
      await I.waitForContent('Have the other parties agreed to this application', 60);
      await I.click('No'); //#option
      await I.click('Continue');

      await I.waitForContent('Should the court inform the other parties about this application', 60);
      await I.click('No'); //#option
      await I.fillField('#reasonForCourtNotInformingOtherParties', 'Do not need to inform');
      await I.click('Continue');
    }
    await I.waitForContent('the application fee is', 60);
    await I.click('Start now');
    await I.waitForContent('Do you want to ask for your costs back?', 60);
    await I.click('Yes'); //#option
    await I.click('Continue');
    await I.waitForContent('What order do you want the judge to make?', 60);
    await I.fillField('#text', 'Test order');
    await I.click('Continue');
    await I.waitForContent('Why are you requesting this order?', 60);
    await I.fillField('#text', 'Test order');
    await I.click('Continue');
    await I.waitForContent('Do you want to add another application?', 60);
    await I.click('No'); //#option-2
    await I.click('Continue');
    await I.waitForContent('Do you want to upload', 60);
    await I.click('No'); //#option-2
    await I.click('Continue');
    await I.waitForContent('hearing arrangements', 60);
    await I.click('Continue');
    await I.waitForContent('What type of hearing', 60);
    await I.click('In person at the court'); //#option
    await I.fillField('#reasonForPreferredHearingType', 'Inperson');
    await I.selectOption('#courtLocation', 'Birmingham Civil and Family Justice Centre - Priory Courts, 33 Bull Street - B4 6DS');
    await I.click('Continue');
    await I.waitForElement('#telephoneNumber');
    await I.fillField('#telephoneNumber', '07555655326');
    await I.fillField('#emailAddress', 'test@gmail.com');
    await I.click('Continue');
    await I.waitForContent('any dates when you cannot attend a hearing', 60);
    await I.click('Continue');
    await I.waitForContent('adustments', 60);
    await I.click('Continue');
    await I.waitForContent('Paying', 60);
    await I.click('Continue');
    await I.waitForContent('Check your answers', 60);
    await I.click('#signed');
    await I.fillField('#name', 'tester name');
    await I.click('Submit');
    await I.click('Pay application fee');
    await I.waitForContent('Do you want to apply for help with fees', 60);
    I.wait(5);
    await I.click('No'); //#option
    await I.click('Continue');
    await govPay.addValidCardDetails(feeAmountForAskingMoreTime);
    govPay.confirmPayment();
  }
}

module.exports = new createGAAppSteps();
