const ContactUs = require('../../common/contactUs');
const I = actor();

const contactUs = new ContactUs();

class BreathingSpaceInfo {

  async verifyPageContent() {
    await this.verifyEnterBreathingSpaceDetailsLink();
    await this.verifyHeadingDetails();
    await this.verifyContent();
    await contactUs.verifyContactUs();
  }

  async verifyEnterBreathingSpaceDetailsLink() {
    await I.see('Enter breathing space details');
  }

  async verifyHeadingDetails() {
    await I.see('Inform the court of a breathing space', 'h2');
    await I.see('What happens during breathing space', 'h2');
    await I.see('When breathing space ends', 'h2');
    await I.see('More information', 'h2');
  }

  async verifyContent() {
    await I.see('The Debt Respite Scheme (Breathing Space) gives someone in problem debt the right to legal protection from their creditors.');
    await I.see('If you’re notified by the Insolvency Service that a debt owed to you is in a breathing space, you must inform the court by email or post. You must tell the court about each debt that has entered a breathing space.');
    await I.see('The court will not check for other debts against the debtor’s name. If the debtor has debts owed to you at different courts, you must notify each court.');
    await I.see('Court orders and judgments related to a debt which were made before breathing space started cannot be enforced until the breathing space ends unless the court gives permission to continue.');
    await I.see('If a hearing has been scheduled then this may be cancelled while the breathing space is in place.');
    await I.see('When breathing space ends, the protections it provided will stop and creditors can begin taking action on the debts again.');
    await I.see('This may include contacting the debtor, restarting court proceedings, adding interest and charges, or continuing enforcement activity.');
    await I.see('If you have any questions about a breathing space, you should contact the debt advice provider whose details are in the notification from the Insolvency Service.');
    await I.see('You can read the full Debt Respite Scheme guidance for creditors');
  }

  async clickEnterBreathingSpaceDetailsLink() {
    await I.click('Enter breathing space details');
  }
}

module.exports = BreathingSpaceInfo;
