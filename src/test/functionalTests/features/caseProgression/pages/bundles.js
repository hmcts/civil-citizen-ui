const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Bundles {

  open(claimRef) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.nextAction('//*[@id="tab_bundles"]');
    this.verifyLatestUpdatePageContent();
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  verifyLatestUpdatePageContent() {
    this.verifyHeadingDetails();
    this.verifyBundlesTabContent();
    contactUs.verifyContactUs();
  }

  verifyHeadingDetails() {
    I.see('Test Inc v Sir John Doe', 'h1');
    I.see('Claim number: ');
    I.see('Updates');
    I.see('Notices and orders');
    I.see('Documents');
    I.see('Bundles');
  }

  verifyBundlesTabContent() {
    I.see('You can find the bundle below.');
    I.see('As the bundle has now been created, you will have to apply to the court if you want any new documents you upload to be used at your trial or hearing.');
    I.seeElement('//*[@id="bundles"]/div[1]/div/p[2]/a');
    I.see('Any new documents you upload will not be included in the main bundle. They will be listed separately below and under \'Documents\'.');
    I.see('Trial Bundle','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[1]');
    I.see('Trial Bundle', '//*[@id="bundles"]/div[1]/div/div/table/tbody/tr/td[1]');
    I.see('Created On','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[2]');
    I.see('Hearing Date','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[3]');
    I.see('Document URL','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[4]');
    I.seeElement('//*[@id="bundles"]/div[1]/div/div/table/tbody/tr/td[4]/a');
  }
}

module.exports = Bundles;
