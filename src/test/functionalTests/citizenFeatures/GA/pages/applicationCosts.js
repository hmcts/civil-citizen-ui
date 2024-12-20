const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class ApplicationCosts {

  async checkPageFullyLoaded () {
    await I.waitForElement('//a[contains(text(), \'Start now\')]');
  }

  nextAction (nextAction) {
    I.click(nextAction);
  }

  async verifyPageContent(applicationType, feeAmount) {
    this.checkPageFullyLoaded();
    this.verifyBreadcrumbs();
    this.verifyHeadingDetails(applicationType);
    await this.verifyPageText(applicationType, feeAmount);
    contactUs.verifyContactUs();
  }

  verifyBreadcrumbs() {
    I.see('Back', '//a[@class="govuk-back-link"]');
  }

  verifyHeadingDetails(applicationType) {
    I.see('Make an application', 'h1');
    I.see(applicationType, 'h1');
  }

  async verifyPageText(applicationType, feeAmount) {
    switch(applicationType) {
      case 'Set aside (remove) a judgment':
        I.see(`To apply to set aside (remove) a judgment, the application fee is £${feeAmount}.`);
        break;
      case('Ask to vary a judgment'):
        I.see(`To apply to vary a judgment, the application fee is £${feeAmount}.`);
        break;
      case 'Reconsider an order':
        I.see(`To apply to reconsider an order, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Change a hearing date':
        I.see(`To apply to change a hearing date, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        I.see('If the hearing date is more than 14 days away from the date you make this application and you have agreed to this with the other party, you will not need to pay the fee. If you add another application you\'ll still have to pay the fee for this additional application.');
        I.see('If the hearing date is less than 14 days away or you have not agreed to it in advance with the other party, the fee above applies.');
        I.see('The court may not agree to change the hearing, even if both parties have agreed.');
        break;
      case 'More time to do what is required by a court order':
        I.see(`To apply to extend time, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Relief from a penalty you\'ve been given by the court':
        I.see(`To apply to ask for relief from a penalty, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Make a change to your claim or defence that you\'ve submitted':
        I.see(`To apply to make a change to your claim or defence, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Court to make a summary judgment on a case':
        I.see(`To apply to the court to make a summary judgment, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Court to strike out all or part of the other parties\' case without a trial':
        //I.see(`To apply to the court to strike out all or part of the other parties' case, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        I.see(`To apply to the court to strike out all or part of the other parties’ case, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        //The incorrect type of apostrophe is used in the content here - if that is fixed then top line will need to be used instead
        break;
      case 'Court to pause a claim':
        I.see(`To apply to the court to pause a claim, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Court to impose a sanction on the other parties unless they do a specific action':
        I.see(`To apply to the court to impose a sanction on the other parties unless they do a specific action, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Court to make an order settling the claim by consent':
        I.see(`To apply to the court to make an order settling the claim by consent, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
      case 'Court to do something that\'s not on this list':
        I.see(`To apply to the court to do something else, the application fee is £${feeAmount}. If you'll be selecting multiple applications, this fee will not change.`);
        break;
    }
    await I.see('This fee will need to be paid once you\'ve created the application. If you\'re eligible, you may be able to apply for help with fees.');
  }
}

module.exports = ApplicationCosts;
