const I = actor();
let verified = false;

const content = {
  title: {
    en: 'Contact us for help',
    cy: 'Cysylltu â ni am gymorth',
  },
  openingHours: {
    en: 'Monday to Friday, 8.30am to 5pm.',
    cy: 'Dydd Llun i ddydd Gwener, 8.30am i 5pm.',
  },
  introduction: {
    en: 'Court staff can help with your application. They cannot give you legal advice.',
    cy: 'Gall staff y llys eich helpu gyda’ch cais. Ni allant roi cyngor cyfreithiol i chi.',
  },
  sendMessageTitle: {
    en: 'Send a message (our preferred method of communication)',
    cy: 'Anfon neges (y dull cyfathrebu yr ydym yn ei ffafrio)',
  },
  sendMessage: {
    en: 'You will be able to see the response on the dashboard.',
    cy: 'Byddwch yn gallu gweld yr ymateb ar y dangosfwrdd.',
  },
  telephone: {
    en: 'Telephone',
    cy: 'Ffôn',
  },
};

class ContactUs {

  async verifyContactUs(language = 'en') {
    if (!verified) {
      I.click(`//span[contains(text(),'${content.title[language]}')]`);
      I.waitForContent(content.introduction[language], 60);
      I.see(content.sendMessageTitle[language], 'h3');
      I.seeElement('//a[contains(@href, \'qm/start?linkFrom=start\')]');
      I.see(content.sendMessage[language]);
      I.see(content.telephone[language], 'h3');
      I.see('0300 123 7050');
      I.see(content.openingHours[language]);
      await I.seeElement('[href=\'https://www.gov.uk/call-charges\']');
      verified = true;
    }
  }
}

module.exports = ContactUs;
