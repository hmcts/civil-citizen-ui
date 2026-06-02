const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Bundles {

  async open(claimRef) {
    await I.amOnPage('/dashboard/' + claimRef + '/defendant');
    await this.nextAction('//*[@id="tab_bundles"]');
    await this.verifyLatestUpdatePageContent();
  }

  async nextAction(nextAction) {
    await I.click(nextAction);
  }

  async verifyLatestUpdatePageContent() {
    await this.verifyHeadingDetails();
    await this.verifyBundlesTabContent();
    await contactUs.verifyContactUs();
  }

  async verifyHeadingDetails() {
    await I.see('Test Inc v Sir John Doe', 'h1');
    await I.see('Claim number: ');
    await I.see('Updates');
    await I.see('Notices and orders');
    await I.see('Documents');
    await I.see('Bundles');
  }

  async verifyBundlesTabContent() {
    await I.see('You can find the bundle below.');
    await I.see('As the bundle has now been created, you will have to apply to the court if you want any new documents you upload to be used at your trial or hearing.');
    await I.seeElement('//*[@id="bundles"]/div[1]/div/p[2]/a');
    await I.see('Any new documents you upload will not be included in the main bundle. They will be listed separately below and under \'Documents\'.');
    await I.see('Trial Bundle','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[1]');
    await I.see('Trial Bundle', '//*[@id="bundles"]/div[1]/div/div/table/tbody/tr/td[1]');
    await I.see('Created On','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[2]');
    await I.see('Hearing Date','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[3]');
    await I.see('Document URL','//*[@id="bundles"]/div[1]/div/div/table/thead/tr/th[4]');
    await I.seeElement('//*[@id="bundles"]/div[1]/div/div/table/tbody/tr/td[4]/a');
  }
}

module.exports = Bundles;
