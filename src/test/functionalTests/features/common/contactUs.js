const I = actor();

class ContactUs {

  verifyContactUs() {
    I.click('//span[contains(text(),\'Contact us for help\')]');
    I.see('Email', 'h3');
    I.seeElement('//a[.=\'contactocmc@justice.gov.uk\']');
    I.see('Telephone', 'h3');
    I.see('0300 123 7050');
    I.see('Monday to Friday, 8.30am to 5pm.');
    I.seeElement('[href=\'https://www.gov.uk/call-charges\']');
  }
}

module.exports = ContactUs;
