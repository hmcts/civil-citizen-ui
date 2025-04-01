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
  email: {
    en: 'Email',
    cy: 'E-bost',
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
      I.waitForContent(content.email[language], 60);
      I.seeElement('//a[.=\'contactocmc@justice.gov.uk\']');
      I.see(content.telephone[language], 'h3');
      I.see('0300 123 7050');
      I.see(content.openingHours[language]);
      await I.seeElement('[href=\'https://www.gov.uk/call-charges\']');
      verified = true;
    }
  }
}

module.exports = ContactUs;
