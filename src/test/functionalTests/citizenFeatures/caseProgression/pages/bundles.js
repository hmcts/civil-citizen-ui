const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class Bundles {

  open(claimRef) {
    I.amOnPage('/dashboard/' + claimRef + '/defendant');
    this.nextAction('//*[@id="tab_bundles"]');
    this.verifyLatestUpdatePageContent().then().resolve();
  }

  nextAction(nextAction) {
    I.click(nextAction);
  }

  async verifyLatestUpdatePageContent() {
    this.verifyHeadingDetails();
    await this.retryUntilExists(async() => {
      I.wait(10);
      console.log('The wait is over');
      I.refreshPage();
    }, this.verifyBundlesTabContent());
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

  async retryUntilExists(action, locator, maxNumberOfTries =3) {
    for (let tryNumber = 1; tryNumber <= maxNumberOfTries; tryNumber++) {
      console.log(`retryUntilExists(${locator}): starting try #${tryNumber}`);
      if (tryNumber > 1 && await this.hasSelector(locator)) {
        console.log(`retryUntilExists(${locator}): element found before try #${tryNumber} was executed`);
        break;
      }
      await action();
      if (await this.waitForSelector(locator) != null) {
        console.log(`retryUntilExists(${locator}): element found after try #${tryNumber} was executed`);
        break;
      } else {
        console.log(`retryUntilExists(${locator}): element not found after try #${tryNumber} was executed`);
      }
      if (tryNumber === maxNumberOfTries) {
        throw new Error(`Maximum number of tries (${maxNumberOfTries}) has been reached in search for ${locator}`);
      }
    }
  }
}

module.exports = Bundles;
