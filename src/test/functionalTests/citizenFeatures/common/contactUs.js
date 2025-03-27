const I = actor();
let verified = false;

const content = {
  title: {
    en: 'Contact us for help',
    cy: 'Cysylltu â ni am gymorth',
  },
  openingHours: {
    en: 'Monday to Friday, 8.30am to 5pm.',
    cy: 'Dydd Llun i ddydd',
  },
  email: {
    en: 'Email',
    cy: 'E-bost',
  },
  telephone: {
    en: 'Telephone',
    cy: 'ffôn',
  },
  linkToCharges: {
    en : 'Find out about call charges (opens in a new window)',
    cy: 'Gwybodaeth am gost galwadau (yn agor mewn ffenestr newydd)'
  }
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
      await I.seeElement(`//a[.=\'${content.linkToCharges[language]}\']`);
      verified = true;
    }
  }
}

module.exports = ContactUs;
